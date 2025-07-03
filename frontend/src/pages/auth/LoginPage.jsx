// src/pages/LoginPage.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "../../components/ThemeContext";
import { AuthCard } from "../../components/auth/AuthCard";
import { InputField } from "../../components/auth/InputField";
import { CheckboxWithLabel } from "../../components/auth/CheckboxWithLabel";
import { PrimaryButton } from "../../components/auth/PrimaryButton";

export default function LoginPage() {
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const isDark = theme === "dark";

  const handleLogin = () => {
    navigate("/inicio");
  };

  const handleForgotPassword = () => {
    navigate("/recuperar_contrasena");
  };

  return (
    <div className={`min-h-screen flex items-center justify-center px-4 transition-colors duration-300 ${
      isDark ? "bg-[#0d0d0d] text-white" : "bg-gray-100 text-black"}`}>
      
      <button
        onClick={toggleTheme}
        className={`absolute top-4 right-4 p-2 rounded transition-colors duration-200 ${
          isDark ? "hover:bg-zinc-800" : "hover:bg-gray-300"}`}>
        {isDark ? <Sun size={22} className="text-gray-400" /> : <Moon size={22} className="text-gray-600" />}
      </button>

      <AuthCard title="Iniciar sesión" subtitle="Ingrese sus credenciales para continuar">
        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
          <InputField id="user" label="Usuario" placeholder="Ingrese usuario" />
          <InputField id="password" label="Contraseña" type="password" placeholder="Ingrese contraseña" />

          <div className="flex items-center justify-between text-sm">
            <CheckboxWithLabel id="remember">Recuérdame</CheckboxWithLabel>
            <button type="button" onClick={handleForgotPassword} className="text-red-500 hover:underline">
              ¿Olvidó su contraseña?
            </button>
          </div>

          <PrimaryButton fullWidth onClick={handleLogin}>
            Iniciar sesión
          </PrimaryButton>
        </form>
      </AuthCard>
    </div>
  );
}
