// src/routes/RequireAuth.jsx
import React, { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation, useNavigate } from "react-router-dom";

export default function RequireAuth() {
  const navigate = useNavigate();
  const location = useLocation();

  const [checking, setChecking] = useState(true);
  const [shouldLogin, setShouldLogin] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const token = localStorage.getItem("accessToken");

    // 1) Si no hay token → al login
    if (!token) {
      setShouldLogin(true);
      setChecking(false);
      return;
    }

    // 2) Verificar KYC con timeout de 20s
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000); // 20s

    const checkKyc = async () => {
      try {
        setChecking(true);

        const res = await fetch("/api/kyc/submissions/status", {
          headers: { Authorization: `Bearer ${token}` },
          signal: controller.signal,
        });

        // Si el backend devuelve 401/403 → problema de token → al login
        if (res.status === 401 || res.status === 403) {
          throw new Error("TOKEN_INVALID");
        }

        // Intentar parsear JSON. Si llega HTML (error de proxy) lanzará excepción.
        const data = await res.json();

        if (!res.ok) {
          // Cualquier otro error desde API también manda al login
          throw new Error(data?.detail || "KYC_CHECK_FAILED");
        }

        // 3) Si debe llenar KYC y no estamos en /kyc → forzar
        if (data?.must_fill && location.pathname !== "/kyc") {
          if (!isMounted) return;
          navigate("/kyc", { replace: true, state: { from: location } });
          return;
        }

        // OK → puede seguir
        if (isMounted) setChecking(false);
      } catch (err) {
        // Motivos: timeout (AbortError), HTML/no JSON, 401, red de backend, etc.
        if (!isMounted) return;
        setShouldLogin(true);
        setChecking(false);
      } finally {
        clearTimeout(timeoutId);
      }
    };

    checkKyc();

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
      controller.abort();
    };
    // Re-verifica si cambia la ruta (útil cuando navegas directo a rutas protegidas)
  }, [location.pathname, navigate, location]);

  // Redirección centralizada al login cuando toque
  if (shouldLogin) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Mientras verifica (pero con timeout) muestra un loader simple
  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm opacity-70">
        Verificando sesión…
      </div>
    );
    // Nota: si pasa de 20s o falla, el estado cambiará y se redirige a /login.
  }

  // Autenticado y KYC ok → renderiza la ruta hija
  return <Outlet />;
}
