import axios from "axios";
const API_URL = `${process.env.REACT_APP_API_URL}/users`;

const getToken = () => localStorage.getItem("token");

// ✅ Obtener todos los usuarios
export const getUsers = async () => {
  const token = getToken();
  const response = await axios.get(API_URL, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

// ✅ Crear nuevo usuario
export const createUser = async (userData) => {
  const token = getToken();
  const response = await axios.post(API_URL, userData, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  return response.data;
};

// ✅ Actualizar usuario
export const updateUser = async (id, userData) => {
  const token = getToken();
  const response = await axios.put(`${API_URL}/${id}`, userData, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

// ✅ Eliminar usuario
export const deleteUser = async (id) => {
  const token = getToken();
  const response = await axios.delete(`${API_URL}/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};
