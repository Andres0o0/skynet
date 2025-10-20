// src/services/clientService.js
import axios from "axios";

const API_URL = `${process.env.REACT_APP_API_URL}/clients`;
;

const getToken = () => localStorage.getItem("token");

// Obtener todos los clientes
export const getClients = async () => {
  const token = getToken();
  const response = await axios.get(API_URL, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

// Crear nuevo cliente
export const createClient = async (clientData) => {
  const token = getToken();
  const response = await axios.post(API_URL, clientData, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  return response.data;
};

// Actualizar cliente
export const updateClient = async (id, clientData) => {
  const token = getToken();
  const response = await axios.put(`${API_URL}/${id}`, clientData, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

// Eliminar cliente
export const deleteClient = async (id) => {
  const token = getToken();
  const response = await axios.delete(`${API_URL}/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};
