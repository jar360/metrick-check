export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL ?? "/api",
  TIMEOUT_MS: 30000,
  VERSION: "v1",
};

export const API_ENDPOINTS = {
  dashboard: "/dashboard",
  inspections: "/inspections",
  inspection: (id: string) => `/inspections/${id}`,
  products: "/products",
  product: (id: string) => `/products/${id}`,
  reviewQueue: "/review-queue",
  reports: "/reports",
  rules: "/rules",
  users: "/users",
  analyze: (id: string) => `/inspections/${id}/analyze`,
} as const;
