// src/components/auth/RequireAuth.jsx
import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";

/**
 * Comprueba si hay un token en localStorage (o donde lo guardes).
 * Si no existe, redirige a /login conservando la ruta de destino.
 */
export default function RequireAuth() {
  const token = localStorage.getItem("accessToken");
  const location = useLocation();

  if (!token) {
    // no autenticado: vamos a login y mantenemos la ruta en state.from
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // autenticado: renderizamos la ruta hija (<Outlet />)
  return <Outlet />;
}
