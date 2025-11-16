import { Request, Response } from 'express';
import { reservationSchema, reservationUpdateSchema, reservationsStatusUpdateSchema, deleteReservationSchema } from '../schemas/reservationSchema';
import ReservationService from '../services/reservationService';

type MealType = "lunch" | "dinner";

function isValidMealType(mealType: any): mealType is MealType {
  return mealType === "lunch" || mealType === "dinner";
}


export class ReservationController {
    static async createReservation(req: Request, res: Response) {
        const validation = reservationSchema.safeParse(req.body);

        if (!validation.success) {
            res.status(400).json({ error: 'Invalid Payload', details: validation.error.errors, })
            return;
        }

        const { reservedDates } = validation.data;
        const user = (req as any).user;

        try {
            const reservation = await ReservationService.createReservation(reservedDates, user.userId, user.name, user.role, user.enrollmentNumber,);
            res.status(201).json(reservation);
        } catch (error: any) {
            console.error(error);
            if (error instanceof Error) {
                res.status(400).json({ error: error.message });
            } else {
                res.status(500).json({ error: 'Internal Server Error' });
            }
        }
    }

    static async getReservations(req: Request, res: Response) {
        try {
            const reservations = await ReservationService.getReservations();
            res.status(200).json(reservations);
        } catch (error: any) {
            console.error(error);
            if (error instanceof Error) {
                res.status(400).json({ error: error.message });
            } else {
                res.status(500).json({ error: 'Internal Server Error' });
            }
        }
    }
    
    static async getTodayReservations(req: Request, res: Response) {
        try{
            const todayReservations = await ReservationService.getTodayReservations();
            res.status(200).json(todayReservations);
        } catch (error: any) {
            console.error(error);
            if (error instanceof Error) {
                res.status(400).json({ error: error.message });
            } else {
                res.status(500).json({ error: 'Internal Server Error' });
            }
        }
    }

    static async getWeekReservations(req: Request, res: Response) {
        try {
            const getWeekReservations = await ReservationService.getWeekReservations();
            res.status(200).json(getWeekReservations);
        } catch (error: any) {
            console.error(error);
            if (error instanceof Error) {
                res.status(400).json({ error: error.message });
            } else {
                res.status(500).json({ error: 'Internal Server Error' });
            }
        }
    }

    static async getUserReservations(req: Request, res: Response) {
        const userId = (req as any).user.userId;
        try {
            const reservations = await ReservationService.getReservations(userId);
            res.status(200).json(reservations);
        } catch (error: any) {
            console.error(error);
            if (error instanceof Error) {
                res.status(400).json({ error: error.message });
            } else {
                res.status(500).json({ error: 'Internal Server Error' });
            }
        }
    }

    static async updateReservation(req: Request, res: Response) {
        const { id } = req.params;
        const userId = (req as any).user.userId;
        const validation = reservationUpdateSchema.safeParse(req.body);

        if (!validation.success) {
            res.status(400).json({ error: validation.error.format() });
            return;
        }

        const data = validation.data;
        const [day] = Object.keys(data);
        const newMeals = data[day];

        try {
            const reservation = await ReservationService.updateReservation(id, day, newMeals, userId);
            res.status(200).json(reservation);
        } catch (error: any) {
            console.error(error);
            if (error instanceof Error) {
                res.status(400).json({ error: error.message });
            } else {
                res.status(500).json({ error: 'Internal Server Error' });
            }
        }
    }

    static async updateReservationStatus(req: Request, res: Response) {
        const { id } = req.params;
        const validation = reservationsStatusUpdateSchema.safeParse(req.body);

        if (!validation.success) {
            res.status(400).json({ error: validation.error.format() });
            return;
        }

        const { day, meal, status } = validation.data;
        console.log(">>> updateStatus chamado", req.params, req.body);
        try {
            const reservation = await ReservationService.updateReservationStatus(id, day, meal, status);
            res.status(200).json(reservation);
        } catch (error: any) {
            console.error(error);
            if (error instanceof Error) {
                res.status(400).json({ error: error.message });
            } else {
                res.status(500).json({ error: 'Internal Server Error' });
            }
        }

    }

    static async deleteReservation(req: Request, res: Response) {
        const { id } = req.params;
        const userId = (req as any).user.userId;
        const validation = deleteReservationSchema.safeParse(req.body);

        if (!validation.success) {
            res.status(400).json({ error: validation.error.format() });
            return;
        }
        const { day, meals } = validation.data;

        try {
            await ReservationService.deleteReservation(id, day, meals, userId);
            res.status(204).send();
        } catch (error: any) {
            console.error(error);
            if (error instanceof Error) {
                res.status(400).json({ error: error.message });
            } else {
                res.status(500).json({ error: 'Internal Server Error' });
            }
        }

    }

    static async getStatsForMeal(req: Request, res: Response): Promise<void> {
    try {
      const { date, mealType } = req.query;

      if (!date || mealType === undefined) {
        res
          .status(400)
          .json({ message: "date e mealType são obrigatórios" });
        return;
      }

      if (!isValidMealType(mealType)) {
        res
          .status(400)
          .json({ message: "mealType deve ser 'lunch' ou 'dinner'" });
        return;
      }

      const stats = await ReservationService.getStatsForMeal({
        date: String(date),
        mealType,
      });

      res.status(200).json({ data: stats });
    } catch (err) {
      console.error("Error fetching reservation stats:", err);
      res
        .status(500)
        .json({ message: "Erro ao buscar estatísticas de reservas" });
    }
  }
}

