//visitServices.js
//@ts-nocheck
import axios from "axios";

const API_URL = `${process.env.REACT_APP_API_URL}/visit`;
const REPORTS_URL = `${process.env.REACT_APP_API_URL}/reports`;

const getToken = () => localStorage.getItem("token");

export const getVisits = async () => {
  const token = getToken();
  const response = await axios.get(API_URL, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const createVisit = async (visitData) => {
  const token = getToken();
  const response = await axios.post(API_URL, visitData, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  return response.data;
};

export const updateVisit = async (id, visitData) => {
  const token = getToken();
  const response = await axios.put(`${API_URL}/${id}`, visitData, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const deleteVisit = async (id) => {
  const token = getToken();
  const response = await axios.delete(`${API_URL}/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export async function generateReport(visitId) {
  const token = getToken();
  const response = await axios.get(`${REPORTS_URL}/generate/${visitId}`, {
    headers: { Authorization: `Bearer ${token}` },
    responseType: "blob",
  });

  // ✅ Crear blob y abrirlo directamente
  const url = window.URL.createObjectURL(new Blob([response.data], { type: "application/pdf" }));
  window.open(url, "_blank"); // abre en nueva pestaña
}

// ✅ Registrar avance de visita (check-in / check-out + notas)
export const registerVisit = async (id, payload) => {
  const token = getToken();
  const response = await axios.put(`${API_URL}/${id}/register`, payload ?? {}, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};
