export interface IReservation {
  readonly reservationId: string;
  readonly user: {
    id: string;
    name: string;
    role: "student" | "professor" | "visitor" | string;
    enrollmentNumber?: string;
  };
  reservedDates: Record<string, MealReservation>;
  readonly createdAt: string;
  updatedAt?: string;
}

export interface MealReservation {
  lunch: MealReservationStatus;
  dinner: MealReservationStatus;
}

export interface MealReservationStatus {
  isReserved: boolean;
  status?: "consumed" | "pending" | "no_show";
}

export type RequestReservation = {
  reservedDates: Record<string, MealReservation>;
};
