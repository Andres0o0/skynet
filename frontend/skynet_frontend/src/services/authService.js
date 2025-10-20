import axios from 'axios';

const API_URL = `${process.env.REACT_APP_API_URL}/auth`;

export const login = async (email, password) => {
  try {
    const response = await axios.post(`${API_URL}/login`, { email, password });
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'Error al iniciar sesión' };
  }
};
