// ru-platform-client/src/services/ratingService.js
import api from "../api/api";

export async function getRatingSummary(date, mealType) {
  const res = await api.get("/ratings/summary", {
    params: { date, mealType },
  });
  return res.data?.data;
}

export async function getRatingsList(date, mealType) {
  const res = await api.get("/ratings/list", {
    params: { date, mealType },
  });
  return res.data?.data ?? [];
}

export async function getLast7Summary() {
  const res = await api.get("/ratings/summary/last7");
  return res.data?.data ?? [];
}