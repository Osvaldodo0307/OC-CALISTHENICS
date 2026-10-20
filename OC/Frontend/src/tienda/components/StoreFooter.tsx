import { Link } from 'react-router-dom'
import WhatsAppLink from '../../components/WhatsAppLink'

export default function StoreFooter() {
  return (
    <footer className="border-t border-white/10 bg-[#080808] text-white/75">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 py-12 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-10">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-oc-red">
            Tienda OC
          </p>
          <p className="mt-3 text-[14px] leading-relaxed text-white/65">
            La tienda oficial de OC-CLUB. Equipamiento, suplementos y certificaciones
            seleccionados por nuestro staff y atletas.
          </p>
        </div>

        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-white">
            Comprar
          </p>
          <ul className="mt-3 space-y-2 text-[13px]">
            <li><Link to="/tienda/catalogo?categoria=entrenamiento" className="hover:text-oc-red">Equipamiento</Link></li>
            <li><Link to="/tienda/catalogo?categoria=suplementos" className="hover:text-oc-red">Suplementos</Link></li>
            <li><Link to="/tienda/certificaciones" className="hover:text-oc-red">Certificaciones</Link></li>
          </ul>
        </div>

        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-white">
            Soporte
          </p>
          <ul className="mt-3 space-y-2 text-[13px]">
            <li><span className="text-white/55">Envíos y devoluciones: consúltanos por WhatsApp</span></li>
            <li><span className="text-white/55">Máquinas y poleas: solicita cotización</span></li>
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
          <p className="text-[11px] font-bold uppercase tracking-wider text-white">
            Ecosistema OC
          </p>
          <ul className="mt-3 space-y-2 text-[13px]">
            <li><Link to="/" className="hover:text-oc-red">Sitio OC-CLUB</Link></li>
            <li><Link to="/membresias" className="hover:text-oc-red">Membresías del club</Link></li>
            <li><Link to="/clases" className="hover:text-oc-red">Clases</Link></li>
            <li><Link to="/app/login" className="hover:text-oc-red">Acceso para socios</Link></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-5 text-[11px] text-white/55 sm:flex-row sm:px-6 lg:px-10">
          <p>© {new Date().getFullYear()} OC Club. Todos los derechos reservados.</p>
          <p>Tlalpan, CDMX · México</p>
        </div>
      </div>
    </footer>
  )
}
