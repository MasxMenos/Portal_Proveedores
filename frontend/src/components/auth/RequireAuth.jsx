import React, { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation,useNavigate } from "react-router-dom";

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

    const navigate = useNavigate();
    const [checking, setChecking] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
      let isMounted = true;

      const check = async () => {
        try {
          setChecking(true);
          setError("");
          const token = localStorage.getItem("accessToken");
          const res = await fetch("/api/kyc/submissions/status/", {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          });
          const data = await res.json().catch(() => ({}));
          if (!res.ok) throw new Error(data?.detail || "No se pudo validar KYC");

          // Si debe diligenciar y NO estamos ya en /kyc, forzamos el formulario
          if (data?.must_fill && location.pathname !== "/kyc") {
            navigate("/kyc", { replace: true, state: { from: location } });
            return;
          }
          // Caso OK: puede seguir
          if (isMounted) setChecking(false);
        } catch (err) {
          // En caso de error, por seguridad enviamos a /kyc
          console.error("RequireKyc error:", err);
          if (isMounted) {
            setError(err.message);
            navigate("/kyc", { replace: true, state: { from: location } });
          }
        }
      };

      check();
      return () => { isMounted = false; };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [location.pathname]);

    if (checking) {
      return (
        <div className="min-h-screen flex items-center justify-center text-sm opacity-70">
          Verificando cumplimiento KYC…
        </div>
      );
    }

    if (error) {
      // Ya redirigimos a /kyc, esto es más por completitud
      return null;
    }

  // autenticado: renderizamos la ruta hija (<Outlet />)
  return <Outlet />;
}
