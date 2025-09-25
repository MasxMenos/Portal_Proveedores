// frontend/src/pages/auth/kyc/helpers/booleans.js

// Normaliza cualquier origen a boolean real
export const getChecked = (x) => {
  if (typeof x === "boolean") return x;
  if (x && typeof x === "object" && "target" in x) return !!x.target.checked;
  if (typeof x === "string") {
    const s = x.toLowerCase().trim();
    return s === "true" || s === "1" || s === "on" || s === "yes" || s === "si";
  }
  return !!x;
};

export const isTrue = (v) => getChecked(v);
