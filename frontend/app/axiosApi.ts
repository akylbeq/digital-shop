import axios from 'axios';

const $api = axios.create({
  withCredentials: true,
  baseURL: 'http://localhost:8000/'
});

$api.interceptors.response.use(
  (config) => config,
  async (error) => {
    const originalRequest = error.config;

    // 1. ПРЕДОХРАНИТЕЛЬ: Если 401 пришел от логина — не рефрешим!
    // Это позволит catch в функции login сразу поймать ошибку.
    if (error.response?.status === 401 && originalRequest.url.includes('/auth/login')) {
      throw error;
    }

    // 2. Логика рефреша для всех остальных запросов
    if (error.response?.status === 401 && originalRequest && !originalRequest._isRetry) {
      originalRequest._isRetry = true;
      try {
        await axios.post('http://localhost:8000/auth/refresh', {}, {
          withCredentials: true
        });
        return $api.request(originalRequest);
      } catch (e) {
        // КРИТИЧНО: Если рефреш не удался, выбрасываем ошибку,
        // чтобы приложение знало, что юзер разлогинен.
        throw e;
      }
    }

    // Выбрасываем ошибку для всех остальных статусов (400, 404, 500 и т.д.)
    throw error;
  }
);

export default $api;