import { db } from "../config/firebaseAdmin";

export type MealType = "lunch" | "dinner";

interface CreateOrUpdateRatingInput {
  userId: string;
  date: string; // YYYY-MM-DD
  mealType: MealType;
  rating: number; // 1-5
  comment?: string | null;
}

class RatingService {
  static async createOrUpdate(input: CreateOrUpdateRatingInput) {
    const { userId, date, mealType, rating, comment } = input;

    if (rating < 1 || rating > 5) {
      throw new Error("Rating deve estar entre 1 e 5");
    }

    const hasReservation = await this.userHasReservationForMeal(
      userId,
      date,
      mealType
    );

    if (!hasReservation) {
      throw new Error("Usuário não possui reserva para esta refeição");
    }

    const docId = `${date}_${mealType}_${userId}`;
    const ref = db.collection("mealRatings").doc(docId);

    const now = new Date();

    await ref.set(
      {
        userId,
        date,
        mealType,
        rating,
        comment: comment ?? null,
        updatedAt: now,
        createdAt: now,
      },
      { merge: true }
    );
  }

  static async userHasReservationForMeal(
    userId: string,
    date: string,
    mealType: MealType
  ) {
    if (!userId) {
      throw new Error("ID do usuário não encontrado na verificação de reserva");
    }

    // ATENÇÃO AQUI: campo correto é "user.id"
    const snap = await db
      .collection("reservations")
      .where("user.id", "==", userId)
      .get();

    console.log("[userHasReservationForMeal] docs encontrados:", snap.size);

    if (snap.empty) return false;

    for (const doc of snap.docs) {
      const data = doc.data() as any;
      const reservedDates = data.reservedDates || {};
      const dayInfo = reservedDates[date];

      if (!dayInfo) continue;

      const mealInfo = dayInfo[mealType];
      if (mealInfo?.isReserved) {
        console.log(
          "[userHasReservationForMeal] reserva encontrada para",
          date,
          mealType
        );
        return true;
      }
    }

    console.log(
      "[userHasReservationForMeal] nenhuma reserva para",
      date,
      mealType
    );
    return false;
  }

  static async getUserRating(params: {
    userId: string;
    date: string;
    mealType: MealType;
  }) {
    const { userId, date, mealType } = params;
    const docId = `${date}_${mealType}_${userId}`;
    const doc = await db.collection("mealRatings").doc(docId).get();

    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() };
  }

  static async getSummary(params: { date: string; mealType: MealType }) {
    const { date, mealType } = params;

    const snap = await db
      .collection("mealRatings")
      .where("date", "==", date)
      .where("mealType", "==", mealType)
      .get();

    if (snap.empty) {
      return {
        count: 0,
        average: 0,
        distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      };
    }

    let sum = 0;
    const dist: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

    snap.forEach((doc) => {
      const data = doc.data() as any;
      const r = data.rating as number;
      sum += r;
      if (dist[r] !== undefined) dist[r]++;
    });

    const count = snap.size;
    const average = sum / count;

    return {
      count,
      average,
      distribution: dist,
    };
  }

  // src/services/ratingService.ts

  static async listRatingsByMeal(params: { date: string; mealType: MealType }) {
    const { date, mealType } = params;

    // Remove o orderBy para não exigir índice composto
    const snap = await db
      .collection("mealRatings")
      .where("date", "==", date)
      .where("mealType", "==", mealType)
      .get();

    const items = snap.docs.map((doc) => {
      const data = doc.data() as any;
      return {
        id: doc.id,
        userId: data.userId,
        rating: data.rating,
        comment: data.comment ?? "",
        createdAt: data.createdAt, // Timestamp do Firestore
      };
    });

    // Ordena em memória por createdAt (mais recente primeiro)
    items.sort((a, b) => {
      const ta = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
      const tb = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
      return tb - ta;
    });

    return items;
  }

  static async getLast7DaysSummary() {
    const results: Array<{
      date: string;
      lunch: { count: number; average: number };
      dinner: { count: number; average: number };
    }> = [];

    const today = new Date();
    const msPerDay = 24 * 60 * 60 * 1000;

    for (let offset = 0; offset < 7; offset++) {
      const d = new Date(today.getTime() - offset * msPerDay);
      const dateStr = d.toISOString().slice(0, 10); // YYYY-MM-DD

      const lunchSummary = await this.getSummary({
        date: dateStr,
        mealType: "lunch",
      });

      const dinnerSummary = await this.getSummary({
        date: dateStr,
        mealType: "dinner",
      });

      results.push({
        date: dateStr,
        lunch: {
          count: lunchSummary.count,
          average: lunchSummary.average,
        },
        dinner: {
          count: dinnerSummary.count,
          average: dinnerSummary.average,
        },
      });
    }

    return results;
  }


}



export default RatingService;
