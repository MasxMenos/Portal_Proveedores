import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/auth/LoginPage.jsx";
import InicioPage from "./pages/HomePage.jsx";
import FacturasPage from "./pages/primary/InvoicesPage.jsx"
import PagosPage from "./pages/primary/PaymentsPage.jsx";
import DevolucionesPage from "./pages/primary/ReturnsPage.jsx";
import CertificadosPage from "./pages/primary/CertificatesPage.jsx";

import PagosDetailPage from "./pages/detail/PaymentsDetailPage.jsx";

import "./styles/tailwind.css"  // ruta RELATIVA al propio App.jsx
import ProfileSettingsPage from "./pages/auth/ProfileSettingsPage.jsx";

import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage.jsx";
import RequireAuth from "./components/auth/RequireAuth.jsx";
import KycFormPage from "./pages/auth/KycFormPage.jsx";
import RequireKyc from "./components/auth/RequireKyc.jsx";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/recuperar_contrasena" element={<ForgotPasswordPage />} />

        {/* Protegidas: primero auth, luego KYC */}
        <Route element={<RequireAuth />}>
          <Route element={<RequireKyc />}>
            {/* KYC form (también protegido, pero accesible siempre que esté logueado) */}
            <Route path="/kyc" element={<KycFormPage />} />

            {/* Resto de tu app normal */}
            <Route path="/configuracion_perfil" element={<ProfileSettingsPage />} />
            <Route path="/inicio" element={<InicioPage />} />
            <Route path="/facturas" element={<FacturasPage />} />
            <Route path="/pagos" element={<PagosPage />} />
            <Route path="/devoluciones" element={<DevolucionesPage />} />
            <Route path="/certificados" element={<CertificadosPage />} />
            <Route path="/payments/:documentoId" element={<PagosDetailPage />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}
