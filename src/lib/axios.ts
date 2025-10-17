import axios from 'axios';

const getBaseURL = () => {
  if (import.meta.env.DEV) {
    // Se estiver em desenvolvimento, verifica se está acessando via localhost ou IP
    return window.location.hostname === 'localhost'
      ? 'http://localhost:3000'
      : 'http://192.168.1.10:3000';
  } 
  // Em produção, você usaria a URL do seu servidor de produção
  return 'https://sua-api-de-producao.com'; 
};

export const api = axios.create({
  baseURL: getBaseURL(),
});
