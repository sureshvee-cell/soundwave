import axios, { type AxiosError, type AxiosResponse } from "axios";
import Cookies from "js-cookie";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15_000,
  headers: { "Content-Type": "application/json" },
});

// ── Request interceptor: attach JWT ─────────────────────────────────────────
api.interceptors.request.use((config) => {
  const token = Cookies.get("sw_access_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ── Response interceptor: handle 401 token refresh ──────────────────────────
let isRefreshing = false;
let failedQueue: { resolve: (v: unknown) => void; reject: (e: unknown) => void }[] = [];

function processQueue(error: unknown, token: string | null = null) {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve(token)));
  failedQueue = [];
}

api.interceptors.response.use(
  (res: AxiosResponse) => res,
  async (error: AxiosError) => {
    const originalRequest = error.config as typeof error.config & { _retry?: boolean };
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          if (originalRequest.headers) originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        });
      }
      originalRequest._retry = true;
      isRefreshing = true;
      const refreshToken = Cookies.get("sw_refresh_token");
      if (!refreshToken) {
        processQueue(error, null);
        isRefreshing = false;
        Cookies.remove("sw_access_token");
        Cookies.remove("sw_refresh_token");
        window.location.href = "/login";
        return Promise.reject(error);
      }
      try {
        const { data } = await axios.post(`${BASE_URL}/auth/refresh`, { refreshToken });
        const { accessToken, refreshToken: newRefresh } = data.data;
        Cookies.set("sw_access_token", accessToken, { expires: 1 / 24 });
        Cookies.set("sw_refresh_token", newRefresh, { expires: 7 });
        api.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
        processQueue(null, accessToken);
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        Cookies.remove("sw_access_token");
        Cookies.remove("sw_refresh_token");
        window.location.href = "/login";
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);

// ── Typed API functions ──────────────────────────────────────────────────────

export const authApi = {
  login:   (email: string, password: string) =>
    api.post("/auth/login", { email, password }),
  register: (data: { email: string; password: string; username: string; displayName: string; role?: string }) =>
    api.post("/auth/register", data),
  logout:  () => api.post("/auth/logout"),
  refresh: (refreshToken: string) =>
    api.post("/auth/refresh", { refreshToken }),
  me:      () => api.get("/auth/me"),
};

export const albumsApi = {
  list:    (params?: { page?: number; limit?: number; genre?: string; sort?: string }) =>
    api.get("/albums", { params }),
  get:     (idOrSlug: string) => api.get(`/albums/${idOrSlug}`),
  create:  (data: FormData) => api.post("/albums", data, { headers: { "Content-Type": "multipart/form-data" } }),
  update:  (id: string, data: FormData) => api.patch(`/albums/${id}`, data, { headers: { "Content-Type": "multipart/form-data" } }),
  delete:  (id: string) => api.delete(`/albums/${id}`),
  publish: (id: string) => api.post(`/albums/${id}/publish`),
  like:    (id: string) => api.post(`/albums/${id}/like`),
  unlike:  (id: string) => api.delete(`/albums/${id}/like`),
  trending: () => api.get("/albums/trending"),
  newReleases: () => api.get("/albums/new-releases"),
};

export const tracksApi = {
  get:       (id: string) => api.get(`/tracks/${id}`),
  stream:    (id: string) => `${BASE_URL}/tracks/${id}/stream`,
  like:      (id: string) => api.post(`/tracks/${id}/like`),
  unlike:    (id: string) => api.delete(`/tracks/${id}/like`),
  recordPlay:(id: string) => api.post(`/tracks/${id}/play`),
  upload:    (albumId: string, data: FormData) =>
    api.post(`/albums/${albumId}/tracks`, data, { headers: { "Content-Type": "multipart/form-data" } }),
  delete:    (id: string) => api.delete(`/tracks/${id}`),
  topCharts: () => api.get("/tracks/charts"),
};

export const artistsApi = {
  list:     (params?: { page?: number; limit?: number; genre?: string }) =>
    api.get("/artists", { params }),
  get:      (idOrSlug: string) => api.get(`/artists/${idOrSlug}`),
  follow:   (id: string) => api.post(`/artists/${id}/follow`),
  unfollow: (id: string) => api.delete(`/artists/${id}/follow`),
  stats:    (id: string) => api.get(`/artists/${id}/stats`),
  update:   (id: string, data: FormData) =>
    api.patch(`/artists/${id}`, data, { headers: { "Content-Type": "multipart/form-data" } }),
};

export const searchApi = {
  query: (q: string, limit = 20) => api.get("/search", { params: { q, limit } }),
};

export const subscriptionApi = {
  plans:          () => api.get("/subscriptions/plans"),
  current:        () => api.get("/subscriptions/current"),
  createCheckout: (priceId: string) => api.post("/subscriptions/checkout", { priceId }),
  portal:         () => api.post("/subscriptions/portal"),
  cancel:         () => api.post("/subscriptions/cancel"),
};

export const libraryApi = {
  likedTracks:  () => api.get("/library/liked-tracks"),
  likedAlbums:  () => api.get("/library/liked-albums"),
  playlists:    () => api.get("/library/playlists"),
  recent:       () => api.get("/library/recently-played"),
  followedArtists: () => api.get("/library/followed-artists"),
  createPlaylist: (name: string, description?: string) =>
    api.post("/library/playlists", { name, description }),
  addToPlaylist:  (playlistId: string, trackId: string) =>
    api.post(`/library/playlists/${playlistId}/tracks`, { trackId }),
  removeFromPlaylist: (playlistId: string, trackId: string) =>
    api.delete(`/library/playlists/${playlistId}/tracks/${trackId}`),
};

export const genresApi = {
  list: () => api.get("/genres"),
};

export const homeApi = {
  featured:    () => api.get("/home/featured"),
  recommended: () => api.get("/home/recommended"),
  newReleases: () => api.get("/home/new-releases"),
};
