// src/pages/auth/ProfileSettingsPage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { useTheme } from "../../components/ThemeContext";
import { useTranslation } from "react-i18next";

import Sidebar from "../../components/MainSidebar";
import HeaderSuperior from "../../components/MainHeader";
import { AuthCard } from "../../components/auth/AuthCard";
import { PrimaryButton } from "../../components/auth/PrimaryButton";

export default function ProfileSettingsPage() {
  const { t } = useTranslation();
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";
  const navigate = useNavigate();

  // sidebar
  const [activePage, setActivePage] = useState(t("sidebar.profileSettings"));
  const handleNavClick = (path) => {
    const key = path.slice(1) || "inicio";
    setActivePage(t(`sidebar.${key}`));
    navigate(path);
  };

  // Leer user inicial desde localStorage
  const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
  // Estado del formulario
  const [nit, setNit]                 = useState(storedUser.username || "");
  const [razonSocial, setRazonSocial] = useState("");
  const [correo, setCorreo]           = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword]         = useState("");
  const [showCurrent, setShowCurrent]         = useState(false);
  const [showNew, setShowNew]                 = useState(false);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(""); // éxito
  const [error, setError]     = useState(""); // error

  // Utilitarias
  const inputClass = `w-full border rounded-lg px-4 py-2 text-sm focus:outline-none transition-colors duration-300 ${
    isDark
      ? "bg-[#1a1a1a] border-[#333] text-white"
      : "bg-gray-100 border-gray-300 text-gray-900"
  }`;
  const readOnlyBg = isDark ? "bg-[#2a2a2a]" : "bg-gray-200";
  const sectionTitle = `text-lg font-semibold ${isDark ? "text-gray-300" : "text-gray-800"}`;
  const sectionDesc  = `text-sm mb-4 ${isDark ? "text-gray-400" : "text-gray-600"}`;

  // JWT
  const token = (localStorage.getItem("accessToken") || "").trim();

  // Cargo datos de perfil
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/users/profile/", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        if (!res.ok) throw new Error("No fue posible cargar tu perfil");
        const data = await res.json();
        setRazonSocial(data.descripcion || "");
        setCorreo(data.correo || "");
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

  // Guardar solo la contraseña
  const handleSave = async () => {
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const body = {
        current_password: currentPassword.trim(),
        new_password:     newPassword.trim(),
      };
      const res = await fetch("/api/users/profile/", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.detail || "Error al guardar cambios");
      setMessage("Contraseña actualizada con éxito");
      setCurrentPassword("");
      setNewPassword("");
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex transition-colors duration-300 ${
        isDark ? "bg-[#0d0d0d] text-white" : "bg-gray-100 text-black"
      }`}>
      <Sidebar activePage={activePage} onNavClick={handleNavClick} />

      <main className="flex-1 p-6 md:ml-64">
        <HeaderSuperior
          activePage={t("settings.profileSettings.title")}
          onToggleTheme={toggleTheme}
        />

        <div className="flex justify-center mt-8 px-4">
          <AuthCard
            title={t("settings.profileSettings.title")}
            subtitle={t("settings.profileSettings.subtitle")}
          >
            {error   && <p className="text-sm text-red-500 mb-2">{error}</p>}
            {message && <p className="text-sm text-green-500 mb-2">{message}</p>}

            <form className="space-y-8" onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
              {/* NIT (solo lectura) */}
              <section>
                <h2 className={sectionTitle}>{t("login.userLabel")}</h2>
                <input
                  type="text"
                  value={nit}
                  readOnly
                  className={`${inputClass} ${readOnlyBg} cursor-not-allowed`}
                />
              </section>

              {/* Razón Social (solo lectura) */}
              <section>
                <h2 className={sectionTitle}>{t("settings.profileSettings.accountInfo.title")}</h2>
                <p className={sectionDesc}>{t("settings.profileSettings.accountInfo.desc")}</p>
                <input
                  type="text"
                  value={razonSocial}
                  readOnly
                  className={`${inputClass} ${readOnlyBg} cursor-not-allowed`}
                />
              </section>

              {/* Correo (solo lectura) */}
              <section>
                <h2 className={sectionTitle}>{t("settings.profileSettings.contactEmail.title")}</h2>
                <p className={sectionDesc}>{t("settings.profileSettings.contactEmail.desc")}</p>
                <input
                  type="email"
                  value={correo}
                  readOnly
                  className={`${inputClass} ${readOnlyBg} cursor-not-allowed`}
                />
              </section>

              {/* Contraseña */}
              <section>
                <h2 className={sectionTitle}>{t("settings.profileSettings.password.title")}</h2>
                <p className={sectionDesc}>{t("settings.profileSettings.password.desc")}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Actual */}
                  <div className="relative">
                    <label className={`block mb-1 text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                      {t("settings.profileSettings.labels.currentPassword")}
                    </label>
                    <input
                      type={showCurrent ? "text" : "password"}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className={inputClass}
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrent(v => !v)}
                      className="absolute inset-y-1/2 right-0 pr-3 pt-3 flex items-center"
                    >
                      {showCurrent
                        ? <EyeOff size={18} className="text-gray-500"/>
                        : <Eye    size={18} className="text-gray-500"/>}
                    </button>
                  </div>
                  {/* Nueva */}
                  <div className="relative">
                    <label className={`block mb-1 text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                      {t("settings.profileSettings.labels.newPassword")}
                    </label>
                    <input
                      type={showNew ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className={inputClass}
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNew(v => !v)}
                      className="absolute inset-y-1/2 right-0 pr-3 pt-3 flex items-center"
                    >
                      {showNew
                        ? <EyeOff size={18} className="text-gray-500"/>
                        : <Eye    size={18} className="text-gray-500"/>}
                    </button>
                  </div>
                </div>
              </section>

              <PrimaryButton type="submit" fullWidth disabled={loading}>
                {loading
                  ? `${t("settings.profileSettings.buttons.save")}...`
                  : t("settings.profileSettings.buttons.save")}
              </PrimaryButton>
            </form>
          </AuthCard>
        </div>
      </main>
    </div>
  );
}
