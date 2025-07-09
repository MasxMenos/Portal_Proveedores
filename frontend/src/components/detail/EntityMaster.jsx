// src/components/detail/EntityMaster.jsx
import React, { forwardRef } from "react";
import { Download } from "lucide-react";
import { useTranslation } from "react-i18next";

const EntityMaster = forwardRef(({ isDark, master }, ref) => {
  const { t } = useTranslation();

  // Lista de claves que corresponden al orden de los valores en `master`
  const fields = [
    "CO",
    "providerDate",
    "dueDate",
    "paymentValue",
    "balance"
  ];

  return (
    <div
      ref={ref}
      className={`master absolute top-1/5 left-2 md:left-8 transform -translate-y-1/2 p-6 rounded-lg z-5 w-[90vw] max-w-[300px] ${
        isDark
          ? "bg-[#111] text-white"
          : "bg-white text-black border border-gray-300"
      }`}
    >
      <div className="flex justify-between items-center mb-4">
        <span className="font-medium">
          {t("detail.master.labelDocumento")}
        </span>
        <Download size={20} className="text-gray-400 cursor-pointer" />
      </div>
      <div className="text-xl font-bold mb-4">{master.documento}</div>
      <div className="space-y-1 text-sm">
        {fields.map((key, idx) => (
          <div key={key} className="flex justify-between">
            <span className="text-gray-400">
              {t(`detail.master.${key}`)}
            </span>
            <span>
              {Object.values(master)[idx + 1]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
});

export default EntityMaster;
