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

export function getUser() {
  const raw = localStorage.getItem("user");
  const user = safeParse(raw);
  if (!user) {
    // Si había basura en storage o undefined, lo limpiamos
    localStorage.removeItem("user");
  }
  return user;
}

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
