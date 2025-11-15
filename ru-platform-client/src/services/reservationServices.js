import api from "../api/api";

export async function getReservationStats(date, mealType) {
  const res = await api.get("/reservations/stats", {
    params: { date, mealType },
  });

  return res.data?.data;
}
