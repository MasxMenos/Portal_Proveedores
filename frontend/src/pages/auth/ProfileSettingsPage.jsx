import React, { useState } from "react";
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

  const handleSave = () => {
    console.log("Datos actualizados");
    navigate("/inicio");
  };

  const inputClass = `w-full border rounded-lg px-4 py-2 text-sm focus:outline-none transition-colors duration-300 ${
    isDark ? "bg-[#1a1a1a] border-[#333] text-white" : "bg-gray-100 border-gray-300 text-gray-900"
  }`;

  const sectionTitle = `text-lg font-semibold ${isDark ? "text-gray-300" : "text-gray-800"}`;
  const sectionDesc  = `text-sm mb-4 ${isDark ? "text-gray-400" : "text-gray-600"}`;

  return (
    <div className={`min-h-screen flex transition-colors duration-300 ${
        isDark ? "bg-[#0d0d0d] text-white" : "bg-gray-100 text-black"
      }`}>
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
            <form
              className="space-y-8"
              onSubmit={(e) => {
                e.preventDefault();
                handleSave();
              }}
            >
              {/* Sección: Información de cuenta */}
              <section>
                <h2 className={sectionTitle}>
                  {t("settings.profileSettings.accountInfo.title")}
                </h2>
                <p className={sectionDesc}>
                  {t("settings.profileSettings.accountInfo.desc")}
                </p>
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-16 h-16 rounded-full bg-gray-400 flex items-center justify-center overflow-hidden">
                    <Camera size={28} className="text-white" />
                  </div>
                  <div className="space-x-2">
                    <button
                      type="button"
                      className={`text-sm font-medium py-1 px-3 rounded border transition-colors duration-200 ${
                        isDark
                          ? "hover:bg-zinc-800 border-gray-600 text-gray-300"
                          : "hover:bg-gray-200 border-gray-300 text-gray-700"
                      }`}
                    >
                      {t("settings.profileSettings.labels.uploadPhoto")}
                    </button>
                    <button
                      type="button"
                      className={`text-sm font-medium py-1 px-3 rounded border transition-colors duration-200 ${
                        isDark
                          ? "hover:bg-zinc-800 border-gray-600 text-gray-300"
                          : "hover:bg-gray-200 border-gray-300 text-gray-700"
                      }`}
                    >
                      {t("settings.profileSettings.labels.deletePhoto")}
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block mb-1 text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                      {t("settings.profileSettings.labels.firstName")}
                    </label>
                    <input
                      type="text"
                      placeholder={t("settings.profileSettings.labels.firstName")}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={`block mb-1 text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                      {t("settings.profileSettings.labels.lastName")}
                    </label>
                    <input
                      type="text"
                      placeholder={t("settings.profileSettings.labels.lastName")}
                      className={inputClass}
                    />
                  </div>
                </div>
              </section>

              {/* Sección: Correo */}
              <section>
                <h2 className={sectionTitle}>
                  {t("settings.profileSettings.contactEmail.title")}
                </h2>
                <p className={sectionDesc}>
                  {t("settings.profileSettings.contactEmail.desc")}
                </p>
                <input
                  type="email"
                  placeholder={t("settings.profileSettings.labels.email")}
                  className={inputClass}
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
                      placeholder="••••••••"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={`block mb-1 text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                      {t("settings.profileSettings.labels.newPassword")}
                    </label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      className={inputClass}
                    />
                  </div>
                </div>
              </section>

              <PrimaryButton fullWidth onClick={handleSave}>
                {t("settings.profileSettings.buttons.save")}
              </PrimaryButton>
            </form>
          </AuthCard>
        </div>
      </main>
    </div>
  );
}
