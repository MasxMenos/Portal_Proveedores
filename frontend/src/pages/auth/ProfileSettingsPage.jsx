// src/pages/auth/ProfileSettingsPage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Moon, Sun, Camera } from "lucide-react";
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

  // --- Leer user inicial desde localStorage ---
  const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
  // --- Estado del formulario ---
  const [nit, setNit]               = useState(storedUser.username || "");
  const [razonSocial, setRazonSocial] = useState("");
  const [correo, setcorreo]           = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword]         = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(""); // éxito
  const [error, setError]     = useState(""); // error

  // Clases utilitarias
  const inputClass = `w-full border rounded-lg px-4 py-2 text-sm focus:outline-none transition-colors duration-300 ${
    isDark
      ? "bg-[#1a1a1a] border-[#333] text-white"
      : "bg-gray-100 border-gray-300 text-gray-900"
  }`;
  const sectionTitle = `text-lg font-semibold ${
    isDark ? "text-gray-300" : "text-gray-800"
  }`;
  const sectionDesc = `text-sm mb-4 ${
    isDark ? "text-gray-400" : "text-gray-600"
  }`;

  // JWT
  const token = (localStorage.getItem("accessToken") || "").trim();

  // --- Al montar, cargo usuario, descripción y correo desde /api/users/profile/ ---
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
        // API devuelve { usuario, descripcion, correo }
        setNit(data.usuario || "");
        setRazonSocial(data.descripcion || "");
        setcorreo(data.correo || "");
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

  // --- Guardar cambios: PUT /api/users/profile/ ---
  const handleSave = async () => {
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const body = {
        usuario:      nit.trim(),
        descripcion:  razonSocial.trim(),
        correo:        correo.trim(),
        current_password: currentPassword,
        new_password:     newPassword,
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
      if (!res.ok) {
        throw new Error(result.detail || "Error al guardar cambios");
      }
      // Actualizar localStorage user.username
      const updatedUser = { ...storedUser, username: nit.trim() };
      localStorage.setItem("user", JSON.stringify(updatedUser));

      setMessage("Perfil actualizado con éxito");
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
    <div
      className={`min-h-screen flex transition-colors duration-300 ${
        isDark ? "bg-[#0d0d0d] text-white" : "bg-gray-100 text-black"
      }`}
    >
      <Sidebar activePage={activePage} onNavClick={handleNavClick} />

      <main className="flex-1 p-6 md:ml-64">
        <HeaderSuperior
          activePage={t("settings.profileSettings.title")}
          title=""
          onToggleTheme={toggleTheme}
        />

        <div className="flex justify-center mt-8 px-4">
          <AuthCard
            title={t("settings.profileSettings.title")}
            subtitle={t("settings.profileSettings.subtitle")}
          >
            {error && <p className="text-sm text-red-500 mb-2">{error}</p>}
            {message && <p className="text-sm text-green-500 mb-2">{message}</p>}

            <form
              className="space-y-8"
              onSubmit={(e) => {
                e.preventDefault();
                handleSave();
              }}
            >
              {/* Sección: NIT */}
              <section>
                <h2 className={sectionTitle}>{t("login.userLabel") /* usa 'Usuario' o añade 'profile.nit' */}</h2>
                <input
                  type="text"
                  value={nit}
                  onChange={(e) => setNit(e.target.value)}
                  className={inputClass}
                  placeholder="NIT"
                />
              </section>

              {/* Sección: Razón Social */}
              <section>
                <h2 className={sectionTitle}>
                  {t("settings.profileSettings.labels.companyName")}
                </h2>
                <p className={sectionDesc}>
                  {t("settings.profileSettings.accountInfo.desc")}
                </p>
                <input
                  type="text"
                  value={razonSocial}
                  onChange={(e) => setRazonSocial(e.target.value)}
                  className={inputClass}
                  placeholder={t("settings.profileSettings.labels.companyName")}
                />
              </section>

              {/* Sección: Correo */}
              <section>
                <h2 className={sectionTitle}>
                  {t("settings.profileSettings.contactcorreo.title")}
                </h2>
                <p className={sectionDesc}>
                  {t("settings.profileSettings.contactcorreo.desc")}
                </p>
                <input
                  type="correo"
                  value={correo}
                  onChange={(e) => setcorreo(e.target.value)}
                  className={inputClass}
                  placeholder={t("settings.profileSettings.labels.correo")}
                />
              </section>

              {/* Sección: Contraseña */}
              <section>
                <h2 className={sectionTitle}>
                  {t("settings.profileSettings.password.title")}
                </h2>
                <p className={sectionDesc}>
                  {t("settings.profileSettings.password.desc")}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block mb-1 text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                      {t("settings.profileSettings.labels.currentPassword")}
                    </label>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className={inputClass}
                      placeholder="••••••••"
                    />
                  </div>
                  <div>
                    <label className={`block mb-1 text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                      {t("settings.profileSettings.labels.newPassword")}
                    </label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className={inputClass}
                      placeholder="••••••••"
                    />
                  </div>
                </div>
              </section>

              <PrimaryButton type="submit" fullWidth disabled={loading}>
                {loading
                  ? t("settings.profileSettings.buttons.save") + "..."
                  : t("settings.profileSettings.buttons.save")}
              </PrimaryButton>
            </form>
          </AuthCard>
        </div>
      </main>
    </div>
  );
}
