// app/services/authService.ts

import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export const login = async (username: string, password: string) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/login`, {
      username, // Asegúrate de enviar "username" en lugar de "email"
      password,
    });
    const { access_token } = response.data;
    if (access_token) {
      sessionStorage.setItem('token', access_token);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error en inicio de sesión:', error);
    return false;
  }
};
