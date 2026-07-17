import axios from "axios";

// Single shared axios instance so base URL and auth header attachment
// live in exactly one place instead of being repeated on every page.
export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001",
  timeout: 15000,
});

// Attaches the JWT access token (stored client-side after login) to every
// outgoing request, so admin/officer pages don't need to do this manually.
export function setAuthToken(token: string | null) {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common.Authorization;
  }
}

// Normalizes Axios/Express error shapes into one readable string,
// so every form in the app can show a consistent, honest error message
// instead of "[object Object]" or a raw stack trace.
export function extractErrorMessage(err: unknown): string {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as { message?: string; errors?: string[] } | undefined;
    if (data?.errors?.length) return data.errors.join(", ");
    if (data?.message) return data.message;
    if (err.code === "ECONNABORTED") return "The request timed out. Please check your connection and try again.";
    if (!err.response) return "Could not reach the server. Please check your connection and try again.";
  }
  return "Something went wrong. Please try again.";
}

export interface StatusHistoryEntry {
  status: string;
  note?: string;
  changedAt: string;
}

export interface TrackedReport {
  trackingId: string;
  status: string;
  priority: string;
  incident: { type: string; dateOfIncident: string };
  statusHistory: StatusHistoryEntry[];
  createdAt: string;
}

export interface AdminReport {
  _id: string;
  trackingId: string;
  status: string;
  priority: string;
  reporter: { name: string; email: string; phone?: string; isAnonymous: boolean };
  incident: {
    type: string;
    description: string;
    location?: { address?: string; area?: string };
    dateOfIncident: string;
    evidenceFiles?: { url: string; type: string; originalName: string }[];
  };
  createdAt: string;
  statusHistory: StatusHistoryEntry[];
}
