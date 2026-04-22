from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta, date
import os
from app.database import get_db
from app.auth import get_current_admin, get_current_user
from app.domain.membership_rules import MembershipStatusContext, resolve_membership_status
from app.schemas import (
    MembershipResponse,
    MembershipBase,
    MembershipCreate,
    MembershipCycleCreate,
    MembershipCycleUpdate,
    MembershipPaymentCreate,
    MembershipNoteCreate,
    MembershipPaymentReverse,
)
from app.models import Membership, MembershipCycle, MembershipPayment, MembershipNote, User
from app.models import MembershipCycleAudit

router = APIRouter(prefix="/membership", tags=["membership"])

VALID_PAYMENT_METHODS = {"efectivo", "transferencia", "tarjeta", "otro"}
VALID_STATUSES = {"activa", "proxima_a_vencer", "vencida", "con_adeudo", "suspendida"}
EXPIRING_SOON_DAYS = int(os.getenv("MEMBERSHIP_EXPIRING_SOON_DAYS", "5"))


def _resolve_cycle_status(cycle: MembershipCycle, total_paid: float, forced_status: str | None = None) -> str:
    return resolve_membership_status(
        MembershipStatusContext(
            status_flag=forced_status,
            end_date=cycle.end_date,
            cost=cycle.cost,
            total_paid=total_paid,
            today=date.today(),
            expiring_soon_days=EXPIRING_SOON_DAYS,
        )
    )


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
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin),
):
    users_query = db.query(User).filter(User.role == "socio")
    if search:
        like_term = f"%{search.strip()}%"
        users_query = users_query.filter((User.name.ilike(like_term)) | (User.phone.ilike(like_term)))
    users = users_query.order_by(User.created_at.desc()).all()

    result = []
    today = date.today()
    for user in users:
        membership = db.query(Membership).filter(Membership.user_id == user.id).first()
        if not membership:
            continue
        cycle = (
            db.query(MembershipCycle)
            .filter(MembershipCycle.membership_id == membership.id, MembershipCycle.is_active_cycle == True)
            .order_by(MembershipCycle.created_at.desc())
            .first()
        )
        if not cycle:
            current_status = "vencida"
            entry = {
                "user_id": user.id,
                "membership_id": membership.id,
                "cycle_id": None,
                "name": user.name,
                "phone": user.phone,
                "created_at": user.created_at.isoformat() if user.created_at else None,
                "membership_type": None,
                "cost": 0,
                "start_date": None,
                "end_date": None,
                "status": current_status,
                "total_paid": 0,
                "pending_balance": 0,
            }
        else:
            total_paid = (
                db.query(func.coalesce(func.sum(MembershipPayment.amount), 0.0))
                .filter(MembershipPayment.membership_cycle_id == cycle.id)
                .filter(MembershipPayment.reversed_at.is_(None))
                .scalar()
                or 0.0
            )
            current_status = _resolve_cycle_status(cycle, total_paid, cycle.status if cycle.status == "suspendida" else None)
            entry = {
                "user_id": user.id,
                "membership_id": membership.id,
                "cycle_id": cycle.id,
                "name": user.name,
                "phone": user.phone,
                "created_at": user.created_at.isoformat() if user.created_at else None,
                "membership_type": cycle.membership_type,
                "cost": cycle.cost,
                "start_date": cycle.start_date.isoformat(),
                "end_date": cycle.end_date.isoformat(),
                "status": current_status,
                "total_paid": float(total_paid),
                "pending_balance": max(cycle.cost - float(total_paid), 0.0),
                "historical_pending_balance": 0.0,
            }
            historical_pending = 0.0
            previous_cycles = (
                db.query(MembershipCycle)
                .filter(MembershipCycle.membership_id == membership.id, MembershipCycle.id != cycle.id)
                .all()
            )
            for old_cycle in previous_cycles:
                old_paid = (
                    db.query(func.coalesce(func.sum(MembershipPayment.amount), 0.0))
                    .filter(MembershipPayment.membership_cycle_id == old_cycle.id)
                    .filter(MembershipPayment.reversed_at.is_(None))
                    .scalar()
                    or 0.0
                )
                old_pending = max(old_cycle.cost - float(old_paid), 0.0)
                historical_pending += old_pending
            entry["historical_pending_balance"] = historical_pending
            entry["pending_balance_total"] = entry["pending_balance"] + historical_pending

        if status != "todos" and entry["status"] != status:
            continue
        result.append(entry)

    result.sort(key=lambda item: item["end_date"] or "9999-12-31")
    return result


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
    cycle_payment_totals = {}
    for c in cycles:
        cycle_payment_totals[c.id] = (
            db.query(func.coalesce(func.sum(MembershipPayment.amount), 0.0))
            .filter(MembershipPayment.membership_cycle_id == c.id)
            .filter(MembershipPayment.reversed_at.is_(None))
            .scalar()
            or 0.0
        )

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
    if payload.amount <= 0:
        raise HTTPException(status_code=400, detail="El monto debe ser mayor a 0")
    method = payload.payment_method.strip().lower()
    if method not in VALID_PAYMENT_METHODS:
        raise HTTPException(status_code=400, detail="Metodo de pago invalido")

    total_paid_before = (
        db.query(func.coalesce(func.sum(MembershipPayment.amount), 0.0))
        .filter(MembershipPayment.membership_cycle_id == cycle.id)
        .filter(MembershipPayment.reversed_at.is_(None))
        .scalar()
        or 0.0
    )
    pending_before = max(cycle.cost - float(total_paid_before), 0.0)
    if pending_before <= 0 and not payload.allow_overpayment:
        raise HTTPException(status_code=409, detail="El ciclo ya esta liquidado")
    if payload.amount > pending_before and not payload.allow_overpayment:
        raise HTTPException(
            status_code=409,
            detail=f"El monto excede el saldo pendiente ({pending_before:.2f}). Activa allow_overpayment para permitirlo."
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
    if possible_duplicate:
        raise HTTPException(status_code=409, detail="Posible pago duplicado detectado (doble submit)")

    payment = MembershipPayment(
        membership_cycle_id=cycle.id,
        user_id=cycle.user_id,
        payment_date=payment_date,
        amount=float(payload.amount),
        payment_method=method,
        concept=payload.concept.strip() if payload.concept else None,
        observations=payload.observations.strip() if payload.observations else None,
        idempotency_key=payload.idempotency_key.strip() if payload.idempotency_key else None,
        created_by=current_user.id,
    )
    db.add(payment)
    db.commit()
    db.refresh(payment)
    return {"ok": True, "payment_id": payment.id}


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
    payment.reversed_at = datetime.now()
    payment.reversed_by = current_user.id
    payment.reversal_reason = reason
    db.add(payment)
    db.commit()
    return {"ok": True}


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
        active_cycle.status = "suspendida"
        active_cycle.updated_by = current_user.id
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
    cycle.status = "activa"
    cycle.updated_by = current_user.id

    membership = db.query(Membership).filter(Membership.id == cycle.membership_id).first()
    if membership:
        membership.status = "active"
    db.commit()
    return {"ok": True}
