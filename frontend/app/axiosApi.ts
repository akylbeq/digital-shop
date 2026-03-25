import axios from 'axios';

const $api = axios.create({
  withCredentials: true,
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

$api.interceptors.response.use(
  (config) => config,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && originalRequest.url.includes('/auth/login')) {
      throw error;
    }

    if (error.response?.status === 401 && originalRequest && !originalRequest._isRetry) {
      originalRequest._isRetry = true;
      try {
        await axios.post(process.env.NEXT_PUBLIC_API_URL + '/auth/refresh', {}, {
          withCredentials: true
        });
        return $api.request(originalRequest);
      } catch (e) {
        throw e;
      }
    }

    throw error;
  }
);

export default $api;