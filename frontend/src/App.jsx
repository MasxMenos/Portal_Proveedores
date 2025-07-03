import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/auth/LoginPage.jsx";
import InicioPage from "./pages/HomePage.jsx";
import FacturasPage from "./pages/primary/InvoicesPage.jsx"
import PagosPage from "./pages/primary/PaymentsPage.jsx";
import DevolucionesPage from "./pages/primary/ReturnsPage.jsx";
import CertificadosPage from "./pages/primary/CertificatesPage.jsx";
import FacturaDetailPage from "./pages/detail/InvoicesDetailPage.jsx";
import PagosDetailPage from "./pages/detail/PaymentsDetailPage.jsx";
import DevolucionesDetailPage from "./pages/detail/ReturnsDetailPage.jsx";
import "./styles/tailwind.css"  // ruta RELATIVA al propio App.jsx
import ProfileSettingsPage from "./pages/auth/ProfileSettingsPage.jsx";
import GeneralSettingsPage from "./pages/auth/GeneralSettingsPage.jsx";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage.jsx";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Ruta raíz redirige a /login */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Aquí mapeas /login a tu LoginPage */}
        <Route path="/login" element={<LoginPage />} />
        
        <Route path="/configuracion_perfil" element={<ProfileSettingsPage />} />
        <Route path="/configuracion" element={<GeneralSettingsPage />} />
        <Route path="/recuperar_contrasena" element={<ForgotPasswordPage />} />

        <Route path="/inicio" element={<InicioPage />} />

        <Route path="/facturas" element={<FacturasPage />} />
        <Route path="/pagos" element={<PagosPage />} />
        <Route path="/devoluciones" element={<DevolucionesPage />} />
        <Route path="/certificados" element={<CertificadosPage />} />

        <Route path="/facturas/:documentoId" element={<FacturaDetailPage />} />
        <Route path="/pagos/:documentoId" element={<PagosDetailPage />} />
        <Route path="/devoluciones/:documentoId" element={<DevolucionesDetailPage />} />
      </Routes>
    </BrowserRouter>
  );
}