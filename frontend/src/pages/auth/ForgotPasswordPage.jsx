import React from "react";
import { useNavigate } from "react-router-dom";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "../../components/ThemeContext";

import { AuthCard } from "../../components/auth/AuthCard";
import { InputField } from "../../components/auth/InputField";
import { PrimaryButton } from "../../components/auth/PrimaryButton";

export default function ForgotPasswordPage() {
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const isDark = theme === "dark";

  const handleReset = () => {
    console.log("Enviando enlace de recuperación...");
    navigate("/login");
  };

  return (
    <div className={`min-h-screen flex items-center justify-center px-4 transition-colors duration-300 ${
      isDark ? "bg-[#0d0d0d] text-white" : "bg-gray-100 text-black"
    }`}>

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
        title="¿Olvidó su contraseña?"
        subtitle="Ingrese su correo electrónico para restablecerla"
      >
        <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
          <InputField
            id="email"
            label="Correo electrónico"
            type="email"
            placeholder="nombre@dominio.com"
          />

          <PrimaryButton fullWidth onClick={handleReset}>
            Enviar enlace de recuperación
          </PrimaryButton>

          <button
            type="button"
            onClick={() => navigate("/login")}
            className={`w-full text-sm font-semibold mt-2 ${
              isDark ? "text-gray-400 hover:text-white" : "text-gray-600 hover:text-black"
            } transition-colors duration-200`}
          >
            Volver a iniciar sesión
          </button>
        </form>
      </AuthCard>
    </div>
  );
}
