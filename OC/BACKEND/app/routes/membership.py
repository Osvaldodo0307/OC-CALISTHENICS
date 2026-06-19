from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File, Form
from fastapi.responses import PlainTextResponse
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta, date
import json
from app.database import get_db
from app.auth import get_current_admin, get_current_user
from app.domain.membership_rules import MembershipStatusContext, resolve_membership_status
from app.domain.membership_renewal import VALID_PAYMENT_ACTIONS, infer_payment_action
from app.utils.timezone import operational_now, operational_today, payment_to_operational_date
from app.services.membership_payment_service import (
    PaymentReversalBlockedError,
    apply_payment_to_cycle,
    record_cycle_audit,
    resolve_payment_flags,
    revert_payment_vigencia,
    validate_payment_reversal,
)
from app.services.membership_client_profile_service import build_client_profile
from app.services.membership_followup_service import (
    build_followup_inbox,
    build_followup_summary,
    create_followup,
    list_user_followups,
    update_followup,
    _followup_to_payload,
    _infer_followup_type_from_status,
)
from app.services.membership_admin import (
    build_membership_alerts,
    build_membership_summary,
    cycle_balance_paid,
    list_client_entries,
    normalize_status_filter,
    resolve_expiring_soon_days,
)
from app.services.membership_import_service import (
    TEMPLATE_COLUMNS,
    commit_import_batch,
    create_import_preview,
    get_import_batch,
    get_import_errors_report,
    template_csv_content,
)
from app.schemas import (
    MembershipResponse,
    MembershipBase,
    MembershipCreate,
    MembershipCycleCreate,
    MembershipCycleUpdate,
    MembershipPaymentCreate,
    MembershipNoteCreate,
    MembershipPaymentReverse,
    MembershipFollowUpCreate,
    MembershipFollowUpUpdate,
    MembershipImportCommitRequest,
)
from app.models import Membership, MembershipCycle, MembershipPayment, MembershipNote, User
from app.models import MembershipCycleAudit, MembershipFollowUp, MembershipImportBatch

router = APIRouter(prefix="/membership", tags=["membership"])

VALID_PAYMENT_METHODS = {
    "efectivo",
    "transferencia",
    "tarjeta",
    "tarjeta_terminal",
    "cortesia",
    "ajuste",
    "otro",
    # Aceptado al registrar pagos creados por importación histórica; no ofrecer en UI operativa.
    "historico_sin_metodo",
}
VALID_STATUSES = {"activa", "proxima_a_vencer", "vence_hoy", "vencida", "con_adeudo", "suspendida"}
EXPIRING_SOON_DAYS = resolve_expiring_soon_days()


def _resolve_cycle_status(cycle: MembershipCycle, total_paid: float, forced_status: str | None = None) -> str:
    return resolve_membership_status(
        MembershipStatusContext(
            status_flag=forced_status,
            end_date=cycle.end_date,
            cost=cycle.cost,
            total_paid=total_paid,
            today=operational_today(),
            expiring_soon_days=EXPIRING_SOON_DAYS,
        )
    )


def _cycle_total_paid(db: Session, cycle_id: int) -> float:
    return cycle_balance_paid(db, cycle_id)


def _cycle_snapshot(cycle: MembershipCycle) -> dict:
    return {
        "id": cycle.id,
        "membership_type": cycle.membership_type,
        "cost": cycle.cost,
        "start_date": cycle.start_date.isoformat() if cycle.start_date else None,
        "end_date": cycle.end_date.isoformat() if cycle.end_date else None,
        "status": cycle.status,
        "is_active_cycle": cycle.is_active_cycle,
        "renewed_from_cycle_id": cycle.renewed_from_cycle_id,
    }


def _get_or_create_membership(db: Session, user_id: int) -> Membership:
    membership = db.query(Membership).filter(Membership.user_id == user_id).first()
    if membership:
        return membership
    membership = Membership(user_id=user_id, status="expired", plan="grupal", expires_at=None)
    db.add(membership)
    db.flush()
    return membership


@router.post("/", response_model=MembershipResponse)
async def create_membership(
    membership_data: MembershipCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    # Verificar que el usuario existe y es socio
    user = db.query(User).filter(User.id == membership_data.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.role != "socio":
        raise HTTPException(status_code=400, detail="User must be a socio to have membership")
    
    # Verificar si ya tiene membresía
    existing = db.query(Membership).filter(Membership.user_id == membership_data.user_id).first()
    if existing:
        raise HTTPException(status_code=400, detail="User already has a membership")
    
    # Crear membresía
    expires_at = membership_data.expires_at
    if not expires_at:
        expires_at = datetime.now() + timedelta(days=30)
    
    membership = Membership(
        user_id=membership_data.user_id,
        status=membership_data.status,
        plan=membership_data.plan,
        expires_at=expires_at
    )
    db.add(membership)
    db.commit()
    db.refresh(membership)
    return membership

@router.get("/admin/clients")
async def list_membership_clients(
    status: str = Query("todos"),
    search: str = Query(""),
    include_historical: bool = Query(False),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin),
):
    normalized = normalize_status_filter(status)
    if normalized not in {"todos", *VALID_STATUSES}:
        raise HTTPException(status_code=400, detail="Filtro de estatus invalido")
    return list_client_entries(
        db,
        status_filter=normalized,
        search=search,
        include_historical=include_historical,
    )


@router.get("/admin/summary")
async def get_membership_admin_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin),
):
    return build_membership_summary(db)


@router.get("/admin/alerts")
async def get_membership_admin_alerts(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin),
):
    return build_membership_alerts(db)


@router.get("/admin/client/{user_id}/profile")
async def get_membership_client_profile(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin),
):
    user = db.query(User).filter(User.id == user_id, User.role == "socio").first()
    if not user:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")
    membership = db.query(Membership).filter(Membership.user_id == user.id).first()
    if not membership:
        raise HTTPException(status_code=404, detail="El cliente no tiene membresia registrada")
    return build_client_profile(db, user, membership)


@router.get("/admin/client/{user_id}")
async def get_membership_client_detail(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin),
):
    user = db.query(User).filter(User.id == user_id, User.role == "socio").first()
    if not user:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")

    membership = db.query(Membership).filter(Membership.user_id == user.id).first()
    if not membership:
        raise HTTPException(status_code=404, detail="El cliente no tiene membresia registrada")

    cycles = (
        db.query(MembershipCycle)
        .filter(MembershipCycle.membership_id == membership.id)
        .order_by(MembershipCycle.created_at.desc())
        .all()
    )
    cycle_ids = [c.id for c in cycles]

    payments = (
        db.query(MembershipPayment)
        .filter(MembershipPayment.membership_cycle_id.in_(cycle_ids))
        .order_by(MembershipPayment.payment_date.desc(), MembershipPayment.created_at.desc())
        .all()
        if cycle_ids
        else []
    )
    notes = (
        db.query(MembershipNote)
        .filter(MembershipNote.user_id == user.id)
        .order_by(MembershipNote.created_at.desc())
        .all()
    )

    creators = {u.id: u.name for u in db.query(User).all()}
    cycle_payment_totals = {c.id: _cycle_total_paid(db, c.id) for c in cycles}

    def cycle_to_payload(c: MembershipCycle):
        total_paid = float(cycle_payment_totals.get(c.id, 0.0))
        status = _resolve_cycle_status(c, total_paid, c.status if c.status == "suspendida" else None)
        return {
            "id": c.id,
            "membership_id": c.membership_id,
            "user_id": c.user_id,
            "membership_type": c.membership_type,
            "cost": c.cost,
            "start_date": c.start_date.isoformat(),
            "end_date": c.end_date.isoformat(),
            "status": status,
            "is_active_cycle": c.is_active_cycle,
            "is_historical_import": bool(c.is_historical_import),
            "historical_source": c.historical_source,
            "import_batch_id": c.import_batch_id,
            "created_at": c.created_at.isoformat() if c.created_at else None,
            "updated_at": c.updated_at.isoformat() if c.updated_at else None,
            "total_paid": total_paid,
            "pending_balance": max(c.cost - total_paid, 0.0),
        }

    active_cycle = next((c for c in cycles if c.is_active_cycle), None)
    historical_pending_balance = 0.0
    current_pending_balance = 0.0
    for c in cycles:
        cycle_pending = max(c.cost - float(cycle_payment_totals.get(c.id, 0.0) or 0.0), 0.0)
        if active_cycle and c.id == active_cycle.id:
            current_pending_balance = cycle_pending
        else:
            historical_pending_balance += cycle_pending
    return {
        "user_id": user.id,
        "membership_id": membership.id,
        "name": user.name,
        "phone": user.phone,
        "created_at": user.created_at.isoformat() if user.created_at else None,
        "active_cycle": cycle_to_payload(active_cycle) if active_cycle else None,
        "cycles_history": [cycle_to_payload(c) for c in cycles],
        "historical_pending_balance": historical_pending_balance,
        "current_pending_balance": current_pending_balance,
        "total_pending_balance": historical_pending_balance + current_pending_balance,
        "expiring_soon_days": EXPIRING_SOON_DAYS,
        "payments": [
            {
                "id": p.id,
                "membership_cycle_id": p.membership_cycle_id,
                "user_id": p.user_id,
                "payment_date": p.payment_date.isoformat() if p.payment_date else None,
                "amount": p.amount,
                "payment_method": p.payment_method,
                "payment_action": p.payment_action,
                "period_start_date": p.period_start_date.isoformat() if p.period_start_date else None,
                "period_end_date": p.period_end_date.isoformat() if p.period_end_date else None,
                "counts_as_income": p.counts_as_income,
                "applies_to_balance": p.applies_to_balance,
                "previous_end_date": p.previous_end_date.isoformat() if p.previous_end_date else None,
                "extended_end_date": p.extended_end_date.isoformat() if p.extended_end_date else None,
                "concept": p.concept,
                "observations": p.observations,
                "created_by": p.created_by,
                "created_at": p.created_at.isoformat() if p.created_at else None,
                "created_by_name": creators.get(p.created_by),
                "reversed_at": p.reversed_at.isoformat() if p.reversed_at else None,
                "reversed_by": p.reversed_by,
                "reversed_by_name": creators.get(p.reversed_by) if p.reversed_by else None,
                "reversal_reason": p.reversal_reason,
            }
            for p in payments
        ],
        "notes": [
            {
                "id": n.id,
                "user_id": n.user_id,
                "membership_id": n.membership_id,
                "membership_cycle_id": n.membership_cycle_id,
                "note": n.note,
                "created_by": n.created_by,
                "created_at": n.created_at.isoformat() if n.created_at else None,
                "created_by_name": creators.get(n.created_by),
            }
            for n in notes
        ],
    }


@router.post("/admin/cycle")
async def create_membership_cycle(
    payload: MembershipCycleCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin),
):
    if payload.cost <= 0:
        raise HTTPException(status_code=400, detail="El costo debe ser mayor a 0")
    if payload.end_date <= payload.start_date:
        raise HTTPException(status_code=400, detail="La fecha de vencimiento debe ser mayor a la fecha de inicio")
    user = db.query(User).filter(User.id == payload.user_id, User.role == "socio").first()
    if not user:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")

    membership = _get_or_create_membership(db, payload.user_id)
    previous_active_cycle = (
        db.query(MembershipCycle)
        .filter(MembershipCycle.membership_id == membership.id, MembershipCycle.is_active_cycle == True)
        .order_by(MembershipCycle.created_at.desc())
        .first()
    )
    db.query(MembershipCycle).filter(MembershipCycle.membership_id == membership.id).update(
        {MembershipCycle.is_active_cycle: False}
    )
    initial_status = payload.manual_status if payload.manual_status in VALID_STATUSES else "activa"
    cycle = MembershipCycle(
        membership_id=membership.id,
        user_id=payload.user_id,
        membership_type=payload.membership_type.strip(),
        cost=float(payload.cost),
        start_date=payload.start_date,
        end_date=payload.end_date,
        status=initial_status,
        is_active_cycle=True,
        renewed_from_cycle_id=previous_active_cycle.id if previous_active_cycle else None,
        created_by=current_user.id,
        updated_by=current_user.id,
    )
    db.add(cycle)
    membership.plan = payload.membership_type.strip()
    membership.expires_at = datetime.combine(payload.end_date, datetime.max.time())
    membership.status = "active"
    db.commit()
    db.refresh(cycle)
    return {"ok": True, "cycle_id": cycle.id}


@router.put("/admin/cycle/{cycle_id}")
async def update_membership_cycle(
    cycle_id: int,
    payload: MembershipCycleUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin),
):
    cycle = db.query(MembershipCycle).filter(MembershipCycle.id == cycle_id).first()
    if not cycle:
        raise HTTPException(status_code=404, detail="Ciclo de membresia no encontrado")

    old_state = _cycle_snapshot(cycle)
    payments_count = db.query(MembershipPayment).filter(MembershipPayment.membership_cycle_id == cycle.id).count()
    structural_change_requested = any([
        payload.membership_type is not None,
        payload.cost is not None,
        payload.start_date is not None,
        payload.end_date is not None,
    ])
    if payments_count > 0 and structural_change_requested and not payload.force_update:
        raise HTTPException(
            status_code=409,
            detail="El ciclo ya tiene pagos. Para cambios estructurales usa force_update=true y change_reason."
        )
    if payments_count > 0 and structural_change_requested and not (payload.change_reason and payload.change_reason.strip()):
        raise HTTPException(status_code=400, detail="change_reason es obligatorio al forzar cambios en ciclos con pagos")

    if payload.membership_type is not None:
        cycle.membership_type = payload.membership_type.strip()
    if payload.cost is not None:
        if payload.cost <= 0:
            raise HTTPException(status_code=400, detail="El costo debe ser mayor a 0")
        cycle.cost = float(payload.cost)
    if payload.start_date is not None:
        cycle.start_date = payload.start_date
    if payload.end_date is not None:
        cycle.end_date = payload.end_date
    if cycle.end_date <= cycle.start_date:
        raise HTTPException(status_code=400, detail="La fecha de vencimiento debe ser mayor a la fecha de inicio")
    if payload.manual_status is not None:
        if payload.manual_status not in VALID_STATUSES:
            raise HTTPException(status_code=400, detail="Estatus invalido")
        cycle.status = payload.manual_status
    cycle.updated_by = current_user.id

    if cycle.is_active_cycle:
        membership = db.query(Membership).filter(Membership.id == cycle.membership_id).first()
        if membership:
            membership.plan = cycle.membership_type
            membership.expires_at = datetime.combine(cycle.end_date, datetime.max.time())
            membership.status = "active" if cycle.status != "suspendida" else "expired"
    if payments_count > 0 and structural_change_requested:
        db.add(MembershipCycleAudit(
            membership_cycle_id=cycle.id,
            changed_by=current_user.id,
            reason=payload.change_reason.strip(),
            old_payload=old_state,
            new_payload=_cycle_snapshot(cycle),
        ))
    db.commit()
    return {"ok": True}


@router.post("/admin/cycle/{cycle_id}/payment")
async def add_membership_payment(
    cycle_id: int,
    payload: MembershipPaymentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin),
):
    cycle = db.query(MembershipCycle).filter(MembershipCycle.id == cycle_id).first()
    if not cycle:
        raise HTTPException(status_code=404, detail="Ciclo de membresia no encontrado")

    method = payload.payment_method.strip().lower()
    if method not in VALID_PAYMENT_METHODS:
        raise HTTPException(status_code=400, detail="Metodo de pago invalido")

    total_paid_before = _cycle_total_paid(db, cycle.id)
    pending_before = max(cycle.cost - float(total_paid_before), 0.0)
    payment_action = infer_payment_action(
        explicit_action=payload.payment_action,
        payment_method=method,
        amount=float(payload.amount),
        pending_balance=pending_before,
    )
    if payload.payment_action and payload.payment_action not in VALID_PAYMENT_ACTIONS:
        raise HTTPException(status_code=400, detail="Accion de pago invalida")

    if method == "cortesia":
        if payload.amount < 0:
            raise HTTPException(status_code=400, detail="El monto de cortesia no puede ser negativo")
    elif payload.amount <= 0:
        raise HTTPException(status_code=400, detail="El monto debe ser mayor a 0")

    if payment_action == "renew_extend" and pending_before > 0 and payload.amount < pending_before:
        raise HTTPException(
            status_code=400,
            detail="Para renovar/extender debes cubrir el saldo pendiente o elegir otra accion",
        )
    if payment_action == "partial_debt" and pending_before <= 0:
        raise HTTPException(status_code=409, detail="No hay saldo pendiente para un abono parcial")

    allows_without_debt = payment_action in {"register_only", "renew_extend", "courtesy_extend", "admin_adjustment"}
    if pending_before <= 0 and not payload.allow_overpayment and not allows_without_debt:
        raise HTTPException(status_code=409, detail="El ciclo ya esta liquidado")
    if (
        payment_action == "partial_debt"
        and payload.amount > pending_before
        and not payload.allow_overpayment
    ):
        raise HTTPException(
            status_code=409,
            detail=f"El monto excede el saldo pendiente ({pending_before:.2f}). Activa allow_overpayment para permitirlo.",
        )

    if payload.idempotency_key:
        duplicate_key = (
            db.query(MembershipPayment)
            .filter(
                MembershipPayment.membership_cycle_id == cycle.id,
                MembershipPayment.idempotency_key == payload.idempotency_key.strip(),
                MembershipPayment.reversed_at.is_(None),
            )
            .first()
        )
        if duplicate_key:
            raise HTTPException(status_code=409, detail="Pago duplicado por idempotency_key")

    payment_date = payload.payment_date or datetime.now()
    payment_day = payment_to_operational_date(payment_date if isinstance(payment_date, datetime) else datetime.combine(payment_date, datetime.min.time()))
    possible_duplicate = (
        db.query(MembershipPayment)
        .filter(
            MembershipPayment.membership_cycle_id == cycle.id,
            MembershipPayment.amount == float(payload.amount),
            MembershipPayment.payment_method == method,
            MembershipPayment.created_by == current_user.id,
            MembershipPayment.reversed_at.is_(None),
            MembershipPayment.payment_date >= (payment_date - timedelta(seconds=60)),
            MembershipPayment.payment_date <= (payment_date + timedelta(seconds=60)),
        )
        .first()
    )
    if possible_duplicate and not (payload.idempotency_key and payload.idempotency_key.strip()):
        raise HTTPException(status_code=409, detail="Posible pago duplicado detectado (doble submit)")

    counts_as_income, applies_to_balance = resolve_payment_flags(
        payment_method=method,
        payment_action=payment_action,
        counts_as_income=payload.counts_as_income,
        applies_to_balance=payload.applies_to_balance,
    )

    payment = MembershipPayment(
        membership_cycle_id=cycle.id,
        user_id=cycle.user_id,
        payment_date=payment_date,
        amount=float(payload.amount),
        payment_method=method,
        payment_action=payment_action,
        concept=payload.concept.strip() if payload.concept else None,
        observations=payload.observations.strip() if payload.observations else None,
        idempotency_key=payload.idempotency_key.strip() if payload.idempotency_key else None,
        counts_as_income=counts_as_income,
        applies_to_balance=applies_to_balance,
        created_by=current_user.id,
    )
    db.add(payment)
    db.flush()

    vigencia_result = apply_payment_to_cycle(
        db,
        cycle=cycle,
        payment=payment,
        payment_action=payment_action,
        payment_day=payment_day,
        period_start=payload.period_start,
        period_end=payload.period_end,
        period_duration_months=payload.period_duration_months,
        renewal_start_date=payload.renewal_start_date,
        admin_user=current_user,
    )

    db.commit()
    db.refresh(payment)
    db.refresh(cycle)

    total_paid_after = _cycle_total_paid(db, cycle.id)
    status_after = _resolve_cycle_status(
        cycle,
        total_paid_after,
        cycle.status if cycle.status == "suspendida" else None,
    )
    pending_after = max(cycle.cost - total_paid_after, 0.0)

    return {
        "ok": True,
        "payment_id": payment.id,
        "payment_action": payment_action,
        "previous_end_date": vigencia_result["previous_end_date"],
        "new_end_date": vigencia_result["new_end_date"],
        "vigencia_extended": vigencia_result["vigencia_extended"],
        "status": status_after,
        "pending_balance": pending_after,
        "counts_as_income": counts_as_income,
        "applies_to_balance": applies_to_balance,
    }


@router.post("/admin/payment/{payment_id}/reverse")
async def reverse_membership_payment(
    payment_id: int,
    payload: MembershipPaymentReverse,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin),
):
    payment = db.query(MembershipPayment).filter(MembershipPayment.id == payment_id).first()
    if not payment:
        raise HTTPException(status_code=404, detail="Pago no encontrado")
    if payment.reversed_at:
        raise HTTPException(status_code=409, detail="El pago ya fue revertido")
    reason = payload.reason.strip()
    if not reason:
        raise HTTPException(status_code=400, detail="La razon de reversa es obligatoria")

    cycle = db.query(MembershipCycle).filter(MembershipCycle.id == payment.membership_cycle_id).first()
    if not cycle:
        raise HTTPException(status_code=404, detail="Ciclo de membresia no encontrado")

    try:
        validate_payment_reversal(db, payment, cycle)
    except PaymentReversalBlockedError as exc:
        raise HTTPException(status_code=409, detail=exc.message) from exc

    old_snapshot = _cycle_snapshot(cycle)
    vigencia_reverted = revert_payment_vigencia(
        db,
        payment=payment,
        cycle=cycle,
        admin_user=current_user,
        reason=reason,
    )

    payment.reversed_at = datetime.now()
    payment.reversed_by = current_user.id
    payment.reversal_reason = reason
    db.add(payment)

    record_cycle_audit(
        db,
        cycle=cycle,
        changed_by=current_user.id,
        reason=f"Reversa de pago #{payment.id}: {reason}",
        event="payment_reversed",
        old_payload={**old_snapshot, "payment_id": payment.id},
        new_payload={
            **_cycle_snapshot(cycle),
            "payment_id": payment.id,
            "reversal_reason": reason,
            "vigencia_reverted": vigencia_reverted,
        },
    )

    db.commit()
    db.refresh(cycle)

    total_paid_after = _cycle_total_paid(db, cycle.id)
    status_after = _resolve_cycle_status(
        cycle,
        total_paid_after,
        cycle.status if cycle.status == "suspendida" else None,
    )

    return {
        "ok": True,
        "vigencia_reverted": vigencia_reverted,
        "new_end_date": cycle.end_date.isoformat(),
        "status": status_after,
        "pending_balance": max(cycle.cost - total_paid_after, 0.0),
    }


@router.post("/admin/client/{user_id}/note")
async def add_membership_note(
    user_id: int,
    payload: MembershipNoteCreate,
    cycle_id: int | None = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin),
):
    user = db.query(User).filter(User.id == user_id, User.role == "socio").first()
    if not user:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")
    note_value = payload.note.strip()
    if not note_value:
        raise HTTPException(status_code=400, detail="La nota no puede estar vacia")
    membership = _get_or_create_membership(db, user_id)
    if cycle_id:
        cycle = db.query(MembershipCycle).filter(MembershipCycle.id == cycle_id, MembershipCycle.user_id == user_id).first()
        if not cycle:
            raise HTTPException(status_code=404, detail="Ciclo no encontrado para el cliente")
    else:
        cycle = (
            db.query(MembershipCycle)
            .filter(MembershipCycle.membership_id == membership.id, MembershipCycle.is_active_cycle == True)
            .first()
        )

    note = MembershipNote(
        user_id=user_id,
        membership_id=membership.id,
        membership_cycle_id=cycle.id if cycle else None,
        note=note_value,
        created_by=current_user.id,
    )
    db.add(note)
    db.commit()
    db.refresh(note)
    return {"ok": True, "note_id": note.id}


@router.get("/me", response_model=MembershipResponse)
async def get_my_membership(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    membership = db.query(Membership).filter(Membership.user_id == current_user.id).first()
    if not membership:
        raise HTTPException(status_code=404, detail="No membership found")
    return membership

@router.put("/{user_id}/renew", response_model=MembershipResponse)
async def renew_membership(
    user_id: int,
    membership_data: MembershipBase,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    membership = db.query(Membership).filter(Membership.user_id == user_id).first()
    if not membership:
        raise HTTPException(status_code=404, detail="Membership not found")

    membership.status = membership_data.status
    membership.plan = membership_data.plan
    membership.expires_at = membership_data.expires_at
    db.commit()
    db.refresh(membership)
    return membership

@router.put("/{user_id}/deactivate", response_model=MembershipResponse)
async def deactivate_membership(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    membership = db.query(Membership).filter(Membership.user_id == user_id).first()
    if not membership:
        raise HTTPException(status_code=404, detail="Membership not found")

    membership.status = "expired"
    active_cycle = (
        db.query(MembershipCycle)
        .filter(MembershipCycle.membership_id == membership.id, MembershipCycle.is_active_cycle == True)
        .first()
    )
    if active_cycle:
        old_snapshot = _cycle_snapshot(active_cycle)
        active_cycle.status = "suspendida"
        active_cycle.updated_by = current_user.id
        record_cycle_audit(
            db,
            cycle=active_cycle,
            changed_by=current_user.id,
            reason="Suspension manual de membresia",
            event="membership_suspended",
            old_payload=old_snapshot,
            new_payload=_cycle_snapshot(active_cycle),
        )
    db.commit()
    db.refresh(membership)
    return membership


@router.put("/{user_id}/reactivate", response_model=MembershipResponse)
async def reactivate_membership(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    membership = db.query(Membership).filter(Membership.user_id == user_id).first()
    if not membership:
        raise HTTPException(status_code=404, detail="Membership not found")

    membership.status = "active"
    db.commit()
    db.refresh(membership)
    return membership


@router.put("/cycle/{cycle_id}/unsuspend")
async def unsuspend_membership_cycle(
    cycle_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    cycle = db.query(MembershipCycle).filter(MembershipCycle.id == cycle_id).first()
    if not cycle:
        raise HTTPException(status_code=404, detail="Ciclo no encontrado")
    if cycle.status != "suspendida":
        raise HTTPException(status_code=409, detail="El ciclo no esta suspendido")
    old_snapshot = _cycle_snapshot(cycle)
    cycle.status = "activa"
    cycle.updated_by = current_user.id

    membership = db.query(Membership).filter(Membership.id == cycle.membership_id).first()
    if membership:
        membership.status = "active"
    record_cycle_audit(
        db,
        cycle=cycle,
        changed_by=current_user.id,
        reason="Levantamiento de suspension",
        event="membership_unsuspended",
        old_payload=old_snapshot,
        new_payload=_cycle_snapshot(cycle),
    )
    db.commit()
    return {"ok": True}


@router.get("/admin/followups")
async def list_admin_followups(
    status: str = Query("todos"),
    search: str = Query(""),
    include_historical: bool = Query(False),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin),
):
    return build_followup_inbox(db, status_filter=status, search=search, include_historical=include_historical)


@router.get("/admin/followups/summary")
async def get_admin_followups_summary(
    include_historical: bool = Query(False),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin),
):
    return build_followup_summary(db, include_historical=include_historical)


@router.post("/admin/followups")
async def create_admin_followup(
    payload: MembershipFollowUpCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin),
):
    try:
        followup = create_followup(
            db,
            admin=current_user,
            payload={
                "user_id": payload.user_id,
                "membership_cycle_id": payload.membership_cycle_id,
                "followup_type": payload.followup_type,
                "channel": payload.channel,
                "status": payload.status,
                "contact_at": payload.contact_at,
                "next_followup_at": payload.next_followup_at,
                "note": payload.note,
            },
        )
        db.commit()
        db.refresh(followup)
        creators = {u.id: u.name for u in db.query(User).all()}
        return {"ok": True, "followup": _followup_to_payload(followup, creators)}
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.patch("/admin/followups/{followup_id}")
async def patch_admin_followup(
    followup_id: int,
    payload: MembershipFollowUpUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin),
):
    followup = db.query(MembershipFollowUp).filter(MembershipFollowUp.id == followup_id).first()
    if not followup:
        raise HTTPException(status_code=404, detail="Seguimiento no encontrado")
    try:
        update_followup(
            db,
            followup=followup,
            admin=current_user,
            updates=payload.model_dump(exclude_unset=True),
        )
        db.commit()
        db.refresh(followup)
        creators = {u.id: u.name for u in db.query(User).all()}
        return {"ok": True, "followup": _followup_to_payload(followup, creators)}
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.post("/admin/client/{user_id}/followups/quick")
async def quick_admin_followup(
    user_id: int,
    action: str = Query(...),
    channel: str = Query("whatsapp"),
    note: str = Query(""),
    next_followup_at: datetime | None = Query(None),
    membership_cycle_id: int | None = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin),
):
    action_map = {
        "contactado": "contactado",
        "respondio": "respondio",
        "sin_respuesta": "sin_respuesta",
        "renovado": "renovado",
        "descartado": "descartado",
        "pendiente": "pendiente",
    }
    if action not in action_map:
        raise HTTPException(status_code=400, detail="Accion invalida")

    entry = next(
        (e for e in build_followup_inbox(db, status_filter="todos") if e["user_id"] == user_id),
        None,
    )
    followup_type = _infer_followup_type_from_status(entry["status"]) if entry else "otro"

    try:
        followup = create_followup(
            db,
            admin=current_user,
            payload={
                "user_id": user_id,
                "membership_cycle_id": membership_cycle_id or (entry.get("cycle_id") if entry else None),
                "followup_type": followup_type,
                "channel": channel,
                "status": action_map[action],
                "contact_at": operational_now() if action in {"contactado", "respondio", "renovado"} else None,
                "next_followup_at": next_followup_at,
                "note": note,
            },
        )
        db.commit()
        db.refresh(followup)
        creators = {u.id: u.name for u in db.query(User).all()}
        return {"ok": True, "followup": _followup_to_payload(followup, creators)}
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.get("/admin/client/{user_id}/followups")
async def list_client_followups(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin),
):
    user = db.query(User).filter(User.id == user_id, User.role == "socio").first()
    if not user:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")
    return list_user_followups(db, user_id)


@router.get("/admin/imports/template")
async def download_import_template(current_user: User = Depends(get_current_admin)):
    return PlainTextResponse(
        content=template_csv_content(),
        media_type="text/csv",
        headers={"Content-Disposition": 'attachment; filename="plantilla_importacion_historica.csv"'},
    )


@router.get("/admin/imports/columns")
async def list_import_template_columns(current_user: User = Depends(get_current_admin)):
    return {"columns": TEMPLATE_COLUMNS}


@router.post("/admin/imports/preview")
async def preview_membership_import(
    file: UploadFile = File(...),
    sheet_name: str | None = Form(default=None),
    column_mapping_json: str | None = Form(default=None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin),
):
    filename = file.filename or "import.csv"
    contents = await file.read()
    mapping = None
    if column_mapping_json:
        try:
            mapping = json.loads(column_mapping_json)
        except json.JSONDecodeError as exc:
            raise HTTPException(status_code=400, detail="column_mapping_json invalido") from exc
    try:
        return create_import_preview(
            db,
            file_bytes=contents,
            filename=filename,
            admin_user=current_user,
            sheet_name=sheet_name,
            column_mapping=mapping,
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.post("/admin/imports/commit")
async def commit_membership_import(
    payload: MembershipImportCommitRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin),
):
    try:
        return commit_import_batch(
            db,
            batch_id=payload.batch_id,
            admin_user=current_user,
            confirm_duplicate_rows=payload.confirm_duplicate_rows,
            resolve_ambiguous=payload.resolve_ambiguous,
            confirm_extend_without_period_rows=payload.confirm_extend_without_period_rows,
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.get("/admin/imports/{batch_id}")
async def get_membership_import_batch(
    batch_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin),
):
    batch = get_import_batch(db, batch_id)
    if not batch:
        raise HTTPException(status_code=404, detail="Lote de importacion no encontrado")
    return batch


@router.get("/admin/imports/{batch_id}/errors")
async def get_membership_import_errors(
    batch_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin),
):
    batch = db.query(MembershipImportBatch).filter(MembershipImportBatch.id == batch_id).first()
    if not batch:
        raise HTTPException(status_code=404, detail="Lote de importacion no encontrado")
    return {"batch_id": batch_id, "errors": get_import_errors_report(db, batch_id)}

