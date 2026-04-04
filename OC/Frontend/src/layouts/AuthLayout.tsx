import { Outlet } from 'react-router-dom'

export default function AuthLayout() {
  return (
    <div className="mobile-safe-top min-h-screen">
      <Outlet />
    </div>
  )
}

