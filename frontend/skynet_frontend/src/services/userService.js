//@ts-nocheck
import axios from "axios";

const API_URL = `${process.env.REACT_APP_API_URL}/users`;

const getToken = () => localStorage.getItem("token");

export const getUsers = async () => {
  const token = getToken();
  const response = await axios.get(API_URL, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};
