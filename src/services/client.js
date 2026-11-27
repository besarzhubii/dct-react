import axios from "axios";
export const API_BASE_URL = (
  process.env.REACT_APP_API || "http://127.0.0.1:3004"
).replace(/\/$/, "");
export const api = axios.create({ baseURL: API_BASE_URL, timeout: 20000 });
export function getSession() {
  try {
    const user = JSON.parse(localStorage.getItem("user") || "null");
    return user && Number.isInteger(user.id) && user.id > 0 ? user : null;
  } catch {
    return null;
  }
}
export function errorMessage(
  error,
  fallback = "Could not reach the API. Please try again.",
) {
  return error?.response?.data?.msg || error?.response?.data?.error || fallback;
}
