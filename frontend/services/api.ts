// AiMedico - Centralised Axios API Service
// All backend calls go through this service for consistent token handling and error management.

import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios'
import Cookies from 'js-cookie'
import { AuthResponse, LoginRequest, RegisterRequest, AIResult, Prescription, PrescriptionListResponse, UploadResponse } from '@/types'

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'

// ── Token Helpers ─────────────────────────────────────────────────────────────

const TOKEN_KEY = 'aimedico_access_token'
const REFRESH_KEY = 'aimedico_refresh_token'

export const tokenStore = {
  getAccess: () => Cookies.get(TOKEN_KEY) || (typeof window !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null),
  getRefresh: () => Cookies.get(REFRESH_KEY) || (typeof window !== 'undefined' ? localStorage.getItem(REFRESH_KEY) : null),
  setTokens: (access: string, refresh: string) => {
    Cookies.set(TOKEN_KEY, access, { expires: 1, sameSite: 'strict' })
    Cookies.set(REFRESH_KEY, refresh, { expires: 30, sameSite: 'strict' })
    localStorage.setItem(TOKEN_KEY, access)
    localStorage.setItem(REFRESH_KEY, refresh)
  },
  clear: () => {
    Cookies.remove(TOKEN_KEY)
    Cookies.remove(REFRESH_KEY)
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(REFRESH_KEY)
  },
}

// ── Axios Instance ────────────────────────────────────────────────────────────

const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 60000,
  headers: { 'Content-Type': 'application/json' },
})

// Request interceptor: attach Bearer token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = tokenStore.getAccess()
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor: handle 401 and refresh token
let isRefreshing = false
let failedQueue: { resolve: (token: string) => void; reject: (err: unknown) => void }[] = []

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => (token ? prom.resolve(token) : prom.reject(error)))
  failedQueue = []
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

    if (error.response?.status === 401 && !originalRequest._retry) {
      const refreshToken = tokenStore.getRefresh()

      if (!refreshToken) {
        tokenStore.clear()
        if (typeof window !== 'undefined') window.location.href = '/login'
        return Promise.reject(error)
      }

      if (isRefreshing) {
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        }).then((token) => {
          originalRequest.headers!.Authorization = `Bearer ${token}`
          return apiClient(originalRequest)
        })
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        const response = await axios.post(`${BASE_URL}/auth/refresh`, { refresh_token: refreshToken })
        const { access_token, refresh_token: newRefresh } = response.data
        tokenStore.setTokens(access_token, newRefresh)
        processQueue(null, access_token)
        originalRequest.headers!.Authorization = `Bearer ${access_token}`
        return apiClient(originalRequest)
      } catch (refreshError) {
        processQueue(refreshError, null)
        tokenStore.clear()
        if (typeof window !== 'undefined') window.location.href = '/login'
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  }
)

// ── API Methods ───────────────────────────────────────────────────────────────

export const authApi = {
  register: (data: RegisterRequest): Promise<AuthResponse> =>
    apiClient.post('/auth/register', data).then((r) => r.data),

  login: (data: LoginRequest): Promise<AuthResponse> =>
    apiClient.post('/auth/login', data).then((r) => r.data),

  refresh: (refresh_token: string) =>
    apiClient.post('/auth/refresh', { refresh_token }).then((r) => r.data),
}

export const prescriptionApi = {
  upload: (file: File): Promise<UploadResponse> => {
    const form = new FormData()
    form.append('file', file)
    return apiClient.post('/upload/prescription', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((r) => r.data)
  },

  list: (page = 1, pageSize = 20): Promise<PrescriptionListResponse> =>
    apiClient.get(`/prescriptions?page=${page}&page_size=${pageSize}`).then((r) => r.data),

  getById: (id: string): Promise<Prescription> =>
    apiClient.get(`/prescriptions/${id}`).then((r) => r.data),

  delete: (id: string): Promise<void> =>
    apiClient.delete(`/prescriptions/${id}`).then((r) => r.data),
}

export const aiApi = {
  getResult: (prescriptionId: string): Promise<AIResult> =>
    apiClient.get(`/ai/result/${prescriptionId}`).then((r) => r.data),

  explainMedicine: (name: string) =>
    apiClient.get(`/ai/medicine/${encodeURIComponent(name)}`).then((r) => r.data),
}

export const userApi = {
  getProfile: () => apiClient.get('/users/me').then((r) => r.data),

  updateProfile: (data: { full_name?: string; preferred_language?: string }) =>
    apiClient.patch('/users/me', data).then((r) => r.data),

  changePassword: (data: { current_password: string; new_password: string; confirm_password: string }) =>
    apiClient.post('/users/me/change-password', data).then((r) => r.data),
}

export default apiClient
