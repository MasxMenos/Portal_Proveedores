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
        CO: "099",
        documento: "01-1124",
        fecha: "2024-11-30",
        debitos: 781650.0,
        creditos: 781650.0,
        movements: [
            {
                "CO": "099",
                "Documento": "-",
                "Debitos": 0.0,
                "Creditos": 0.0
            }
        ],
        retencion: [
            {
                CO: "099",
                Clase: "RTECOMPR",
                Descripcion: "COMPRAS DEL 3.5%",
                Total_Retencion: 28350.0
            }
        ]
    },
];
