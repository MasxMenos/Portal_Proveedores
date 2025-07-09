// src/pages/ForgotPasswordPage.jsx
import React from "react";
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

  const handleReset = () => {
    console.log("Enviando enlace de recuperación...");
    navigate("/login");
  };

  return (
    <div
      className={`min-h-screen flex items-center justify-center px-4 transition-colors duration-300 ${
        isDark ? "bg-[#0d0d0d] text-white" : "bg-gray-100 text-black"
      }`}
    >
      {/* Toggle theme */}
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
        <form
          className="space-y-6"
          onSubmit={(e) => {
            e.preventDefault();
            handleReset();
          }}
        >
          <InputField
            id="email"
            label={t("passwordRecovery.emailLabel")}
            type="email"
            placeholder={t("passwordRecovery.emailLabel")}
          />

          <PrimaryButton fullWidth onClick={handleReset}>
            {t("passwordRecovery.sendButton")}
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
