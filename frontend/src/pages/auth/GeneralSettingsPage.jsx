import React from "react";
import { useNavigate } from "react-router-dom";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "../../components/ThemeContext";
import { AuthCard } from "../../components/auth/AuthCard";
import { PrimaryButton } from "../../components/auth/PrimaryButton";

export default function GeneralSettingsPage() {
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const isDark = theme === "dark";

  const handleSaveSettings = () => {
    console.log("Configuraciones generales guardadas");
    navigate("/inicio");
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

      <AuthCard title="Configuración general" subtitle="Ajusta tus preferencias de la cuenta">
        <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
          <div>
            <label htmlFor="language" className={`block mb-1 text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>
              Idioma preferido
            </label>
            <select
              id="language"
              className={`w-full rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-600 transition-colors duration-300 ${
                isDark ? "bg-[#1a1a1a] border-[#333] text-white" : "bg-gray-100 border-gray-300 text-gray-900"
              }`}
            >
              <option>Español</option>
              <option>Inglés</option>
              <option>Francés</option>
            </select>
          </div>

          <div>
            <label htmlFor="timezone" className={`block mb-1 text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>
              Zona horaria
            </label>
            <select
              id="timezone"
              className={`w-full rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-600 transition-colors duration-300 ${
                isDark ? "bg-[#1a1a1a] border-[#333] text-white" : "bg-gray-100 border-gray-300 text-gray-900"
              }`}
            >
              <option>GMT-5 (Bogotá, Lima, Quito)</option>
              <option>GMT-6 (Ciudad de México)</option>
              <option>GMT-3 (Buenos Aires)</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <input
              id="notifications"
              type="checkbox"
              className={`h-4 w-4 rounded focus:ring-red-600 transition-colors duration-300 ${
                isDark ? "border-gray-600 bg-gray-700" : "border-gray-400 bg-white"
              }`}
            />
            <label htmlFor="notifications" className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>
              Habilitar notificaciones por correo
            </label>
          </div>

          <PrimaryButton fullWidth onClick={handleSaveSettings}>
            Guardar configuración
          </PrimaryButton>
        </form>
      </AuthCard>
    </div>
  );
}
