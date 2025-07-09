// src/pages/settings/GeneralSettingsPage.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "../../components/ThemeContext";
import Sidebar from "../../components/MainSidebar";
import HeaderSuperior from "../../components/MainHeader";
import { AuthCard } from "../../components/auth/AuthCard";
import { PrimaryButton } from "../../components/auth/PrimaryButton";

export default function GeneralSettingsPage() {
  const { t, i18n } = useTranslation();
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";
  const navigate = useNavigate();

  // Keep the current selection in state:
  const [language, setLanguage] = useState(i18n.language || "es");
  const [activePage, setActivePage] = useState(t("sidebar.home"));

  const handleNavClick = (path) => {
    const key = path.slice(1) || "home";
    setActivePage(t(`sidebar.${key}`));
    navigate(path);
  };

  const handleSaveSettings = () => {
    // 1) change the i18n language:
    i18n.changeLanguage(language);
    // 2) persist so on reload it sticks:
    localStorage.setItem("i18nextLng", language);
    // 3) go back home:
    navigate("/inicio");
  };

  return (
    <div
      className={`min-h-screen flex transition-colors duration-300 ${
        isDark ? "bg-black text-white" : "bg-white text-black"
      }`}
    >
      <Sidebar activePage={t("settings.general.title")} onNavClick={handleNavClick} />

      <main className="flex-1 p-6 md:ml-64">
        <HeaderSuperior
          activePage={t("settings.general.title")}
          title=""
          onToggleTheme={toggleTheme}
        />

        <div className="flex justify-center mt-8 px-4">
          <AuthCard
            title={t("settings.general.title")}
            subtitle={t("settings.general.subtitle")}
          >
            <form
              className="space-y-6"
              onSubmit={(e) => {
                e.preventDefault();
                handleSaveSettings();
              }}
            >
              {/* Preferred language */}
              <div>
                <label
                  htmlFor="language"
                  className={`block mb-1 text-sm ${
                    isDark ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  {t("settings.general.preferredLanguage")}
                </label>
                <select
                  id="language"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className={`w-full rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-600 transition-colors duration-300 ${
                    isDark
                      ? "bg-[#1a1a1a] border-[#333] text-white"
                      : "bg-gray-100 border-gray-300 text-gray-900"
                  }`}
                >
                  <option value="es">{t("languages.es")}</option>
                  <option value="en">{t("languages.en")}</option>
                  <option value="fr">{t("languages.fr")}</option>
                </select>
              </div>

              {/* Time zone (unchanged) */}
              <div>
                <label
                  htmlFor="timezone"
                  className={`block mb-1 text-sm ${
                    isDark ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  {t("settings.general.timeZone")}
                </label>
                <select
                  id="timezone"
                  className={`w-full rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-600 transition-colors duration-300 ${
                    isDark
                      ? "bg-[#1a1a1a] border-[#333] text-white"
                      : "bg-gray-100 border-gray-300 text-gray-900"
                  }`}
                >
                  <option value="GMT-5">{t("timezones.GMT-5")}</option>
                  <option value="GMT-6">{t("timezones.GMT-6")}</option>
                  <option value="GMT-3">{t("timezones.GMT-3")}</option>
                </select>
              </div>

              {/* Email notifications (unchanged) */}
              <div className="flex items-center space-x-2">
                <input
                  id="notifications"
                  type="checkbox"
                  className={`h-4 w-4 rounded focus:ring-red-600 transition-colors duration-300 ${
                    isDark ? "border-gray-600 bg-gray-700" : "border-gray-400 bg-white"
                  }`}
                />
                <label
                  htmlFor="notifications"
                  className={`text-sm ${
                    isDark ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  {t("settings.general.notifications")}
                </label>
              </div>

              {/* Save button */}
              <PrimaryButton fullWidth onClick={handleSaveSettings}>
                {t("settings.general.saveSettings")}
              </PrimaryButton>
            </form>
          </AuthCard>
        </div>
      </main>
    </div>
  );
}
