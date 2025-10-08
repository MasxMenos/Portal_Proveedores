// src/pages/auth/LoginPage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "../../components/ThemeContext";
import { AuthCard } from "../../components/auth/AuthCard";
import { InputField } from "../../components/auth/InputField";
import { CheckboxWithLabel } from "../../components/auth/CheckboxWithLabel";
import { PrimaryButton } from "../../components/auth/PrimaryButton";
import PdfModal from "../../components/common/PdfModal";

export default function LoginPage() {
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const isDark = theme === "dark";

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Modal del manual
  const [showManual, setShowManual] = useState(false);

  // Abrir modal automáticamente al montar la página
  useEffect(() => {
    setShowManual(true);
  }, []);

const handleLogin = async (e) => {
  e.preventDefault();
  setError("");
  setLoading(true);

  const trimmedUsername = username.trim();

  try {
    const res = await fetch("/api/users/login/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: trimmedUsername, password }),
    });

    // lee como texto primero para poder diagnosticar
    const text = await res.text();
    let data = null;
    try { data = JSON.parse(text); } catch { /* no es JSON, queda como texto */ }

    if (!res.ok) {
      const msg =
        (data && (data.detail || data.message)) ||
        text.slice(0, 200) ||           // muestra el primer pedazo si vino HTML
        `HTTP ${res.status}`;
      throw new Error(msg);
    }

    // OK: data debe tener { access, refresh, user }
    localStorage.setItem("accessToken", data.access);
    localStorage.setItem("refreshToken", data.refresh);
    const cleanUser = { ...data.user, username: data.user.username?.trim?.() || "" };
    localStorage.setItem("user", JSON.stringify(cleanUser));

    // validar KYC
    const statusRes = await fetch("/api/kyc/submissions/status", {
      headers: { Authorization: `Bearer ${data.access}` },
    });
    const statusText = await statusRes.text();
    let statusData = null;
    try { statusData = JSON.parse(statusText); } catch {}
    const mustFill = statusRes.ok ? !!statusData?.must_fill : false;

    if (mustFill) {
      navigate("/kyc", { replace: true, state: { from: location } });
      return;
    }

    navigate(location.state?.from?.pathname || "/inicio", { replace: true });
  } catch (err) {
    console.error("Login error:", err);
    setError(err.message || "Error al autenticar");
  } finally {
    setLoading(false);
  }
};


  const handleForgotPassword = () => {
    navigate("/recuperar_contrasena");
  };

  return (
    <div
      className={`min-h-screen flex items-center justify-center px-4 transition-colors duration-300 ${
        isDark ? "bg-[#0d0d0d] text-white" : "bg-gray-100 text-black"
      }`}
    >
      <button
        onClick={toggleTheme}
        className={`absolute top-4 right-4 p-2 rounded transition-colors duration-200 ${
          isDark ? "hover:bg-zinc-800" : "hover:bg-gray-300"
        }`}
        aria-label="Cambiar tema"
      >
        {isDark ? (
          <Sun size={22} className="text-gray-400" />
        ) : (
          <Moon size={22} className="text-gray-600" />
        )}
      </button>

      <AuthCard
        title="Iniciar sesión"
        subtitle="Ingrese sus credenciales para continuar"
      >
        <form className="space-y-4" onSubmit={handleLogin}>
          <InputField
            id="user"
            label="Usuario"
            placeholder="Ingrese usuario"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <InputField
            id="password"
            label="Contraseña"
            type="password"
            placeholder="Ingrese contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <div className="flex items-center justify-between text-sm">
            <CheckboxWithLabel id="remember" checked={false} onChange={() => {}}>
              Recuérdame
            </CheckboxWithLabel>
            <button
              type="button"
              onClick={handleForgotPassword}
              className="text-red-500 hover:underline"
            >
              ¿Olvidó su contraseña?
            </button>
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <PrimaryButton type="submit" fullWidth disabled={loading}>
            {loading ? "Validando..." : "Iniciar sesión"}
          </PrimaryButton>
        </form>
      </AuthCard>

      {/* Modal del PDF: abre al entrar */}
      <PdfModal
        isOpen={showManual}
        onClose={() => setShowManual(false)}
        title="Manual del Portal de Proveedores"
        src="/documentos/MANUAL/Portal_de_proveedores.pdf"
      />
    </div>
  );
}

