// src/pages/ForgotPasswordPage.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "../../components/ThemeContext";
import { useTranslation } from "react-i18next";

import { AuthCard } from "../../components/auth/AuthCard";
import { InputField } from "../../components/auth/InputField";
import { PrimaryButton } from "../../components/auth/PrimaryButton";

export default function ForgotPasswordPage() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [username, setUsername]   = useState("");
  const [email, setEmail]         = useState("");
  const [error, setError]         = useState("");
  const [message, setMessage]     = useState("");
  const [loading, setLoading]     = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!username.trim() || !email.trim()) {
      setError("Por favor ingresa usuario y correo.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/users/password-reset/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: username.trim(),
          correo:   email.trim().toLowerCase(),
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        // muestra detalle (pista) que envía el backend
        setError(json.detail || "Error al restablecer contraseña");
      } else {
        setMessage(`Su nueva contraseña es: ${json.new_password}`);
      }
    } catch {
      setError("Error de conexión. Intenta más tarde.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`min-h-screen flex items-center justify-center px-4 transition-colors duration-300 ${
        isDark ? "bg-[#0d0d0d] text-white" : "bg-gray-100 text-black"
      }`}
    >
      {/* Toggle tema */}
      <button
        onClick={toggleTheme}
        className={`absolute top-4 right-4 p-2 rounded transition-colors duration-200 ${
          isDark ? "hover:bg-zinc-800" : "hover:bg-gray-300"
        }`}
      >
        {isDark ? (
          <Sun size={22} className="text-gray-400" />
        ) : (
          <Moon size={22} className="text-gray-600" />
        )}
      </button>

      <AuthCard
        title={t("passwordRecovery.title")}
        subtitle={t("passwordRecovery.subtitle")}
      >
        {error   && <p className="text-sm text-red-500 mb-2">{error}</p>}
        {message && <p className="text-sm text-green-500 mb-2">{message}</p>}

        <form className="space-y-6" onSubmit={handleSubmit}>
          <InputField
            id="username"
            label="Usuario"
            type="text"
            placeholder="Usuario"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          <InputField
            id="email"
            label={t("passwordRecovery.emailLabel")}
            type="email"
            placeholder={t("passwordRecovery.emailLabel")}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <PrimaryButton type="submit" fullWidth disabled={loading}>
            {loading ? "Procesando..." : t("passwordRecovery.sendButton")}
          </PrimaryButton>

          <button
            type="button"
            onClick={() => navigate("/login")}
            className={`w-full text-sm font-semibold mt-2 transition-colors duration-200 ${
              isDark ? "text-gray-400 hover:text-white" : "text-gray-600 hover:text-black"
            }`}
          >
            {t("passwordRecovery.backToLogin")}
          </button>
        </form>
      </AuthCard>
    </div>
  );
}
