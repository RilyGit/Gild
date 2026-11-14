const configuredApiUrl = import.meta.env.VITE_API_URL?.trim();
const fallbackApiUrl = import.meta.env.DEV
  ? 'http://localhost:3100'
  : 'https://gild-tdos.onrender.com';
const API_URL = (configuredApiUrl || fallbackApiUrl).replace(/\/+$/, '');

export default API_URL;
