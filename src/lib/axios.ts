import axios from 'axios';

const getBaseURL = () => {
  if (import.meta.env.DEV) {
    const host = window.location.hostname;
    return `http://${host}:3000`;
  } 
  // Em produção, você usaria a URL do seu servidor de produção
  return 'https://sua-api-de-producao.com'; 
};

export const api = axios.create({
  baseURL: getBaseURL(),
});
