// src/utils/storage.js
export function safeParse(json) {
  if (typeof json !== "string") return null;     // null o undefined -> null
  try {
    return JSON.parse(json);
  } catch (e) {
    console.warn("⚠️ JSON corrupto en storage:", e);
    return null;
  }
}

export const getUser = () => {
  try {
    const raw = localStorage.getItem("user");
    if (!raw || raw === "undefined" || raw === "null") return null; // 🧩 evita errores
    return JSON.parse(raw);
  } catch (err) {
    console.warn("⚠️ JSON corrupto en storage:", err);
    return null;
  }
};


export function getToken() {
  const t = localStorage.getItem("token");
  return typeof t === "string" ? t : "";
}

export function setUser(u) {
  try {
    localStorage.setItem("user", JSON.stringify(u));
  } catch (e) {
    console.error("No se pudo guardar user en storage:", e);
  }
}
