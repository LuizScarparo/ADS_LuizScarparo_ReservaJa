import { z } from "zod";

const mealReservationStatusSchema = z.union([
  z.object({
    isReserved: z.literal(false),
    status: z.undefined().optional(),
  }),
  z.object({
    isReserved: z.literal(true),
    status: z.enum(["consumed", "pending", "no_show"]),
  }),
]);

export const reservationSchema = z.object({
  reservedDates: z.record(
    z.string().date(),
    z.object({
      lunch: mealReservationStatusSchema,
      dinner: mealReservationStatusSchema,
    })
  )
  .refine((value) => Object.keys(value).length <= 5, {
    message: "Limit of 5 dates exceeded",
  })
});

export const reservationUpdateSchema = z.record(
  z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
  z.object({
    lunch: mealReservationStatusSchema,
    dinner: mealReservationStatusSchema,
  })
);
""
export const reservationsStatusUpdateSchema = z.object({
  day: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, {
    message: "Day must be in YYYY-MM-DD format",
  }),
  meal: z.enum(["lunch", "dinner"]),
  status: z.enum(["consumed", "no_show"]),
})

export const deleteReservationSchema = z.object({
  day: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, {
    message: "Day must be in YYYY-MM-DD format",
  }),
  meals: z.array(z.enum(["lunch", "dinner"])).nonempty({ message: "At least one meal must be specified" }),
});

