// src/i18n.js
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

// Tus archivos de traducción
import en from "./data/languajes/en.json";
import es from "./data/languajes/es.json";
import fr from "./data/languajes/fr.json";

i18n
  .use(LanguageDetector)        // detecta del navegador
  .use(initReactI18next)        // pasa a react
  .init({
    fallbackLng: "es",
    resources: { en: { translation: en }, es: { translation: es }, fr: { translation: fr } },
    interpolation: { escapeValue: false },
  });

export default i18n;
