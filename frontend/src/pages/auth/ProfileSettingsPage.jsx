// src/pages/ProfileSettingsPage.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { Moon, Sun, Camera } from "lucide-react";
import { useTheme } from "../../components/ThemeContext";
import { AuthCard } from "../../components/auth/AuthCard";
import { PrimaryButton } from "../../components/auth/PrimaryButton";

export default function ProfileSettingsPage() {
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const isDark = theme === "dark";

  const handleSave = () => {
    console.log("Datos actualizados");
    navigate("/inicio");
  };

  const inputClass = `w-full border rounded-lg px-4 py-2 text-sm focus:outline-none transition-colors duration-300
    ${isDark ? "bg-[#1a1a1a] border-[#333] text-white" : "bg-gray-100 border-gray-300 text-gray-900"}
  `;

  const sectionTitleClass = `text-lg font-semibold ${isDark ? "text-gray-300" : "text-gray-800"}`;
  const sectionDescClass = `text-sm mb-4 ${isDark ? "text-gray-400" : "text-gray-600"}`;

  return (
    <div className={`min-h-screen flex items-center justify-center px-4 transition-colors duration-300 ${isDark ? "bg-[#0d0d0d] text-white" : "bg-gray-100 text-black"}`}>

      <button
        onClick={toggleTheme}
        className={`absolute top-4 right-4 p-2 rounded transition-colors duration-200 ${isDark ? "hover:bg-zinc-800" : "hover:bg-gray-300"}`}
      >
        {isDark ? <Sun size={22} className="text-gray-400" /> : <Moon size={22} className="text-gray-600" />}
      </button>

      <AuthCard title="" subtitle="">
        <form className="space-y-8" onSubmit={(e) => e.preventDefault()}>
          
          <section>
            <h2 className={sectionTitleClass}>Información de la cuenta</h2>
            <p className={sectionDescClass}>Actualiza tu información personal</p>
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-16 h-16 rounded-full bg-gray-400 flex items-center justify-center overflow-hidden">
                {/* Placeholder de imagen de perfil */}
                <Camera size={28} className="text-white" />
              </div>
              <div className="space-x-2">
                <button type="button" className="text-sm font-medium py-1 px-3 rounded border transition-colors duration-200
                  hover:bg-gray-200 dark:hover:bg-zinc-800
                  border-gray-300 dark:border-gray-600
                  text-gray-700 dark:text-gray-300
                ">
                  Subir nueva foto
                </button>
                <button type="button" className="text-sm font-medium py-1 px-3 rounded border transition-colors duration-200
                  hover:bg-gray-200 dark:hover:bg-zinc-800
                  border-gray-300 dark:border-gray-600
                  text-gray-700 dark:text-gray-300
                ">
                  Eliminar
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={`block mb-1 text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>Nombre</label>
                <input type="text" placeholder="Nombre" className={inputClass} />
              </div>
              <div>
                <label className={`block mb-1 text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>Apellido</label>
                <input type="text" placeholder="Apellido" className={inputClass} />
              </div>
            </div>
          </section>

          <section>
            <h2 className={sectionTitleClass}>Correo de contacto</h2>
            <p className={sectionDescClass}>Administra tu correo electrónico asociado a la cuenta.</p>
            <input type="email" placeholder="correo@ejemplo.com" className={inputClass} />
          </section>

          <section>
            <h2 className={sectionTitleClass}>Contraseña</h2>
            <p className={sectionDescClass}>Modifica tu contraseña actual.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={`block mb-1 text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>Contraseña actual</label>
                <input type="password" placeholder="••••••••" className={inputClass} />
              </div>
              <div>
                <label className={`block mb-1 text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>Nueva contraseña</label>
                <input type="password" placeholder="••••••••" className={inputClass} />
              </div>
            </div>
          </section>

          <PrimaryButton fullWidth onClick={handleSave}>
            Guardar cambios
          </PrimaryButton>
        </form>
      </AuthCard>
    </div>
  );
}
