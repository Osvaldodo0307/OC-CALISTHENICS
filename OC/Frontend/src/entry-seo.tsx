// Build-time rendering only: the private app and its API are never imported here.
import { renderToStaticMarkup } from 'react-dom/server'
import { StaticRouter } from 'react-router-dom/server.js'
import { createElement, type ComponentType } from 'react'
import Landing from './pages/Landing'
import Club from './pages/Club'
import ClasesInfo from './pages/ClasesInfo'
import Membresias from './pages/Membresias'
import EquipoComunidad from './pages/EquipoComunidad'
import Convenios from './pages/Convenios'
import Experiencias from './pages/Experiencias'
import AvisoPrivacidad from './pages/AvisoPrivacidad'
import Terminos from './pages/Terminos'

export { gymSchema, publicPages, SITE_IMAGE, SITE_URL } from './seo/site'

const pages: Record<string, ComponentType> = {
  '/': Landing,
  '/club': Club,
  '/clases': ClasesInfo,
  '/membresias': Membresias,
  '/equipo-comunidad': EquipoComunidad,
  '/convenios': Convenios,
  '/experiencias': Experiencias,
  '/aviso-privacidad': AvisoPrivacidad,
  '/terminos': Terminos,
}

export function renderPage(path: string) {
  const Page = pages[path]
  if (!Page) throw new Error(`No public page registered for ${path}`)
  return renderToStaticMarkup(createElement(StaticRouter, { location: path }, createElement(Page)))
}
