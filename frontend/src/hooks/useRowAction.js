import { useNavigate } from "react-router-dom";

export function useRowAction(tipo, basePath) {
  const navigate = useNavigate();
  // ahora recibimos el objeto completo "item"
  return (item) => {
    const docId = item.documento;
    if (tipo !== "certificados") {
      navigate(
        `/${basePath}/${docId}`,
        { state: { master: item } }
      );
    } else {
      // para certificados seguimos igual
      console.log(`Descargar certificado: ${docId}`);
    }
  };
}