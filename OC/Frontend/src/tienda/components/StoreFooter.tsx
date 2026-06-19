import { Link } from 'react-router-dom'
import WhatsAppLink from '../../components/WhatsAppLink'

export default function StoreFooter() {
  return (
    <footer className="border-t border-neutral-200 bg-neutral-50 text-neutral-700">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 py-12 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-10">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-oc-red">
            Tienda OC
          </p>
          <p className="mt-3 text-[14px] leading-relaxed text-neutral-600">
            La tienda oficial de OC-CALISTHENICS. Equipamiento, suplementos y merch
            seleccionados por nuestro staff y atletas.
          </p>
        </div>

        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-neutral-900">
            Comprar
          </p>
          <ul className="mt-3 space-y-2 text-[13px]">
            <li><Link to="/tienda/catalogo" className="hover:text-oc-red">Todos los productos</Link></li>
            <li><Link to="/tienda/catalogo?categoria=ropa" className="hover:text-oc-red">Ropa</Link></li>
            <li><Link to="/tienda/catalogo?categoria=suplementos" className="hover:text-oc-red">Suplementos</Link></li>
            <li><Link to="/tienda/catalogo?categoria=joyeria" className="hover:text-oc-red">Joyería</Link></li>
            <li><Link to="/tienda/catalogo?categoria=recovery" className="hover:text-oc-red">Recovery</Link></li>
          </ul>
        </div>

        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-neutral-900">
            Soporte
          </p>
          <ul className="mt-3 space-y-2 text-[13px]">
            <li><span className="text-neutral-500">Envíos y devoluciones: consúltanos por WhatsApp</span></li>
            <li><span className="text-neutral-500">Guía de tallas: disponible al pedir</span></li>
            <li><Link to="/terminos" className="hover:text-oc-red">Términos y condiciones</Link></li>
            <li><Link to="/aviso-privacidad" className="hover:text-oc-red">Aviso de privacidad</Link></li>
            <li>
              <WhatsAppLink preset="tienda" className="hover:text-oc-red">
                WhatsApp comercial
              </WhatsAppLink>
            </li>
          </ul>
        </div>

        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-neutral-900">
            Ecosistema OC
          </p>
          <ul className="mt-3 space-y-2 text-[13px]">
            <li><Link to="/" className="hover:text-oc-red">Sitio OC-CALISTHENICS</Link></li>
            <li><Link to="/membresias" className="hover:text-oc-red">Membresías del club</Link></li>
            <li><Link to="/clases" className="hover:text-oc-red">Clases</Link></li>
            <li><Link to="/app/login" className="hover:text-oc-red">Acceso para socios</Link></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-neutral-200">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-5 text-[11px] text-neutral-500 sm:flex-row sm:px-6 lg:px-10">
          <p>© {new Date().getFullYear()} OC Club. Todos los derechos reservados.</p>
          <p>Tlalpan, CDMX · México</p>
        </div>
      </div>
    </footer>
  )
}
