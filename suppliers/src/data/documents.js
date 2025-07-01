// src/data/entidadData.js
export const masterTemplate = {
  CO: "099",
  fechaProveedor: "2025/02/09",
  fechaVencimiento: "2025/02/14",
  valorPago: 6375,
  saldo: 0,
};

export const linesTemplate = [
  {
    CO: "009",
    fecha: "2025/06/05",
    debitos: 6933,
    creditos: 9693,
    movements: [
      { reg: 1, cuenta: "22010101011", desc: "Proveedores nacionales", CO: "099" },
      { reg: 2, cuenta: "29880101011", desc: "Órdenes de compra x legalizar", CO: "099" },
      { reg: 3, cuenta: "240801024", desc: "19% Devol compras directas", CO: "099" },
      { reg: 4, cuenta: "22020101011", desc: "Proveedores internacionales", CO: "099" },
      { reg: 5, cuenta: "23010101011", desc: "Otros gastos", CO: "099" },
      { reg: 6, cuenta: "24090101011", desc: "Descuentos", CO: "099" },
      { reg: 7, cuenta: "25010101011", desc: "Impuestos adicionales", CO: "099" },
      { reg: 8, cuenta: "26010101011", desc: "Intereses moratorios", CO: "099" },
    ],
  },
];
