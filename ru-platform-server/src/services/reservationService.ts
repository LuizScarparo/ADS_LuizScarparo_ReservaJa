import { db } from "../config/firebaseAdmin";
import { DateTime } from "luxon";
import { IReservation } from "../interfaces/IReservation";
import { v4 as uuidv4 } from "uuid";
import { FieldValue } from "firebase-admin/firestore";

type MealType = "lunch" | "dinner";

class ReservationService {
  async createReservation(reservedDates: {}, userId: string, userName: string, userRole: string, userEnrollmentNumber?: string) {
    try {
      const today = DateTime.now().setZone("America/Sao_Paulo");
      const requestedDates = Object.keys(reservedDates);

      if (userRole === "visitor" && (requestedDates.length > 1 || requestedDates[0] !== today.toISODate())) {
        throw new Error("Visitors are only allowed to reserve for today's date.");
      }

      const weekDay = today.weekday; // luxon: 1 (Mon) ... 7 (Sun)

      let startOfWeek: DateTime;
      let endOfWeek: DateTime;

      if (weekDay === 6 || weekDay === 7) {
        // sábado (6) ou domingo (7)
        // Semana futura
        startOfWeek = today.plus({ days: (8 - weekDay) }); // próxima segunda
      } else {
        // segunda a sexta
        startOfWeek = today.minus({ days: weekDay - 1 }); // segunda atual
      }

      startOfWeek = startOfWeek.startOf("day");
      endOfWeek = startOfWeek.plus({ days: 4 }).endOf("day");

      for (const [dateStr, meals] of Object.entries(reservedDates) as [string, any][]) {
        const date = DateTime.fromISO(dateStr, { zone: "America/Sao_Paulo" }).startOf("day");

        if (date < startOfWeek || date > endOfWeek) {
          throw new Error(`The date ${dateStr} is outside the current week.`);
        }

        if (date.toISODate() === today.toISODate()) {
          const currentHour = today.hour;

          if (meals.lunch?.isReserved && currentHour >= 10) {
            throw new Error("Lunch for today can only be reserved until 10:00 AM.");
          }

          if (meals.dinner?.isReserved && currentHour >= 22) {
            throw new Error("Dinner for today can only be reserved until 4:00 PM.");
          }
        }
      }

      const userReservationsSnapshot = await db.collection("reservations").where("user.id", "==", userId).get();

      const conflictingMeals: { date: string; mealType: string }[] = [];
      let updatedReservationDoc: FirebaseFirestore.DocumentReference<FirebaseFirestore.DocumentData> | undefined;
      let updatedFields: any = {};
      const newReservationDates: Record<string, any> = {};

      for (const [date, meals] of Object.entries(reservedDates) as [string, any][]) {
        let reservationFound = false;

        userReservationsSnapshot.forEach(doc => {
          const data = doc.data();
          const existingMeals = data.reservedDates?.[date];

          if (existingMeals) {
            reservationFound = true;
            const updates: any = {};

            for (const mealType of ['lunch', 'dinner']) {
              const requestedMeal = meals[mealType];
              const alreadyReserved = existingMeals?.[mealType]?.isReserved;

              if (requestedMeal?.isReserved) {
                if (alreadyReserved) {
                  conflictingMeals.push({ date, mealType });
                } else {
                  updates[`reservedDates.${date}.${mealType}`] = requestedMeal;
                }
              }
            }

            if (Object.keys(updates).length > 0) {
              updatedReservationDoc = doc.ref;
              Object.assign(updatedFields, updates);
            }
          }
        });

        if (!reservationFound) {
          newReservationDates[date] = meals;
        }
      }

      if (
        Object.keys(newReservationDates).length === 0 && Object.keys(updatedFields).length === 0) {
        throw new Error("All requested meals are already reserved.");
      }

      const now = today.toISO();

      if (updatedReservationDoc) {
        updatedFields.updatedAt = now;
        await updatedReservationDoc.update(updatedFields);
      }

      let createdReservation = null;
      if (Object.keys(newReservationDates).length > 0) {
        const reservationId = uuidv4();

        const userData = {
          id: userId,
          name: userName,
          role: userRole,
          enrollmentNumber: userEnrollmentNumber ? userEnrollmentNumber : undefined,
        };

        const createdReservation = {
          reservationId,
          user: userData,
          reservedDates: newReservationDates,
          createdAt: now,
          updatedAt: now,
        };

        await db.collection("reservations").doc(reservationId).set(createdReservation);

      }

      return {
        message: "Reservation created or updated successfully.",
        updated: !!updatedReservationDoc,
        created: createdReservation,
        conflictingMeals,
      };

    } catch (error) {
      console.error("Error creating reservation:", error);
      throw error;
    }
  }

  async getReservations(userId?: string) {
    try {
      const collection = db.collection("reservations");
      const snapshot = userId
        ? await collection.where("user.id", "==", userId).get()
        : await collection.get();

      const reservations = snapshot.docs.map(doc => {
        const data = doc.data() as IReservation;
        return data;
      });

      const quantity = await this.countReservations(reservations);

      return { quantity, reservations };
    }
    catch (error) {
      console.error("Error fetching reservations:", error);
      throw new Error("Failed to fetch reservations.");
    }
  }

  async getTodayReservations() {
    try {
      const today = DateTime.now().setZone("America/Sao_Paulo").toISODate() || new Date().toISOString().split("T")[0];
      const snapshot = await db.collection("reservations").where(`reservedDates.${today}`, "!=", null).get();

      const reservations = snapshot.docs.map(doc => {
        const data = doc.data() as IReservation;
        return data;
      });

      const quantity = await this.countReservations(reservations);

      return { quantity: quantity, reservations };
    } catch (error) {
      console.error("Error fetching reservations for today:", error);
      throw new Error("Failed to fetch today's reservations.");
    }
  }

  async getWeekReservations() {
    try {
      const today = DateTime.now().setZone("America/Sao_Paulo").startOf("day");
      const startOfWeek = today.weekday === 6 || today.weekday === 7
        ? today.plus({ days: (8 - today.weekday) }).startOf("day")
        : today.minus({ days: today.weekday - 1 }).startOf("day");
      const endOfWeek = startOfWeek.plus({ days: 4 }).endOf("day");

      const snapshot = await db.collection("reservations").get();

      const reservations = snapshot.docs.map(doc => {
        const data = doc.data() as IReservation;
        return data;
      });

      const weekReservations = reservations.filter(reservation => {
        const dates = Object.keys(reservation.reservedDates || {});

        return dates.some(dateStr => {
          const date = DateTime.fromISO(dateStr, { zone: "America/Sao_Paulo" }).startOf("day");
          return date >= startOfWeek && date <= endOfWeek;
        });
      });

      const quantity = await this.countReservations(weekReservations);

      return { quantity: quantity, reservations: weekReservations };

    } catch (error) {
      console.error("Error fetching week reservations:", error);
      throw new Error("Failed to fetch week's reservations.");
    }
  }

  async updateReservation(reservationId: string, day: string, newMeals: {}, userId: string) {
    try {
      const reservationRef = db.collection("reservations").doc(reservationId);

      const reservationSnapshot = await reservationRef.get();

      if (!reservationSnapshot.exists) {
        throw new Error("Reservation not found.");
      }

      if (reservationSnapshot.data()?.user.id !== userId) {
        throw new Error("You do not have permission to update this reservation.");
      }

      const existingReservedDates = reservationSnapshot.data()?.reservedDates || {};
      const dayExists = existingReservedDates[day];

      if (!dayExists) {
        throw new Error(`No reservation found for the date: ${day}`);
      }

      const now = DateTime.now().setZone("America/Sao_Paulo");
      const todayStr = now.toISODate() || new Date().toISOString().split("T")[0];

      if (day < todayStr) {
        throw new Error("Reservations for past dates cannot be updated.");
      }

      if (day === todayStr) {
        const currentHour = now.hour;
        const mealsType = Object.keys(newMeals);

        if (mealsType.includes("lunch") && currentHour >= 10) {
          throw new Error("Lunch reservations can only be updated until 10:00 AM.");
        }

        if (mealsType.includes("dinner") && currentHour >= 16) {
          throw new Error("Dinner reservations can only be updated until 4:00 PM.");
        }
      }

      const updatedAt = now.toISO();
      await reservationRef.update({
        [`reservedDates.${day}`]: newMeals,
        updatedAt,
      });

      return {
        message: "Reservation updated successfully.",
        reservationId,
        updatedDay: day,
        newMeals,
      };

    } catch (error) {
      console.error("Error updating reservation:", error);
      throw error;
    }
  }

  async updateReservationStatus(reservationId: string, day: string, meal: string, status: string) {
    try {
      const reservationRef = db.collection("reservations").doc(reservationId);
      const reservationSnapshot = await reservationRef.get();

      if (!reservationSnapshot.exists) {
        throw new Error("Reservation not found.");
      }

      const reservedDates = reservationSnapshot.data()?.reservedDates || {};

      if (!reservedDates[day]) {
        throw new Error(`No reservation found for the date: ${day}`);
      }

      if (reservedDates[day][meal]?.isReserved === true) {
        await reservationRef.update({
          [`reservedDates.${day}.${meal}.status`]: status,
          updatedAt: DateTime.now().setZone("America/Sao_Paulo").toISO(),
        });
        return { message: "Reservation status updated successfully." };

      } else {
        throw new Error(`Meal ${meal} is not reserved for the date: ${day}`);
      }
    }
    catch (error) {
      console.error("Error updating reservation status:", error);
      throw error;
    }
  }

  async deleteReservation(reservationId: string, day: string, meals: string[], userId: string) {
    try {
      const reservationRef = db.collection("reservations").doc(reservationId);
      const reservationSnapshot = await reservationRef.get();

      if (!reservationSnapshot.exists) {
        throw new Error("Reservation not found.");
      }

      if (reservationSnapshot.data()?.user.id !== userId) {
        throw new Error("You do not have permission to delete this reservation.");
      }

      const hasReservation = reservationSnapshot.data()?.reservedDates?.[day];
      if (!hasReservation) {
        throw new Error(`No reservation found for the date: ${day}`);
      }

      const updates: Record<string, any> = {};
      for (const meal of meals) {
        updates[`reservedDates.${day}.${meal}`] = FieldValue.delete();
      }

      await reservationRef.update(updates);

      const updatedSnapshot = await reservationRef.get();
      const updatedDay = updatedSnapshot.data()?.reservedDates?.[day];
      const updatedAt = DateTime.now().setZone("America/Sao_Paulo").toISO();

      if (updatedDay && Object.keys(updatedDay).length === 0) {
        await reservationRef.update({
          [`reservedDates.${day}`]: FieldValue.delete(),
          updatedAt,
        });
      }

      return { success: true, message: "Selected meals deleted successfully." };
    } catch (error) {
      console.error("Error deleting reservation:", error);
      throw error;
    }
  }

  countReservations = async (reservations: IReservation[]) => {
    return reservations.reduce((total, reservation) => {
      const reservedDates = reservation.reservedDates || {};

      return total + Object.values(reservedDates).reduce((subtotal, meals) => {
        return subtotal + (meals.lunch?.isReserved ? 1 : 0) + (meals.dinner?.isReserved ? 1 : 0);
      }, 0);

    }, 0);
  };

  async getStatsForMeal(params: { date: string; mealType: MealType }) {
    const { date, mealType } = params;

    const snap = await db.collection("reservations").get();

    let totalReserved = 0;
    let consumed = 0;

    const notConsumedUsers: Array<{
      userId: string;
      name: string;
      enrollmentNumber: string;
    }> = [];

    snap.forEach((doc) => {
      const data = doc.data() as any;
      const reservedDates = data.reservedDates || {};
      const dayInfo = reservedDates[date];
      if (!dayInfo) return;

      const mealInfo = dayInfo[mealType];
      if (!mealInfo?.isReserved) return;

      totalReserved++;

      if (mealInfo.status === "consumed") {
        consumed++;
      } else {
        // adicionar na lista dos que NÃO consumiram
        notConsumedUsers.push({
          userId: data.user?.id ?? "unknown",
          name: data.user?.name ?? "Sem nome",
          enrollmentNumber: data.user?.enrollmentNumber ?? "N/A",
        });
      }
    });

    const notConsumed = totalReserved - consumed;

    return {
      totalReserved,
      consumed,
      notConsumed,
      notConsumedUsers,
    };
  }


}

export default new ReservationService();
