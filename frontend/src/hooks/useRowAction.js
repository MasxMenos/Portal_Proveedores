// src/hooks/useRowAction.js
import { useNavigate } from "react-router-dom";

export function useRowAction(tipo, basePath) {
  const navigate = useNavigate();
  return (documento) => {
    if (tipo !== "certificados") {
      navigate(`/${basePath}/${documento}`);
    } else {
      console.log(`Descargar certificado: ${documento}`);
    }
  };
}