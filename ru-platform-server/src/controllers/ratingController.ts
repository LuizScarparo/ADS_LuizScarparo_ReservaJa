import { Request, Response } from "express";
import RatingService, { MealType } from "../services/ratingService";

function isValidMealType(value: any): value is MealType {
  return value === "lunch" || value === "dinner";
}

class RatingController {
  static async createOrUpdate(req: Request, res: Response): Promise<void> {
    try {
      const anyReq = req as any;
      const authUser = anyReq.user || anyReq.auth || {};
      const userId: string | undefined =
        authUser.id ||
        authUser.uid ||
        authUser.userId ||
        anyReq.userId;

      if (!userId) {
        res.status(401).json({ message: "Usuário não autenticado." });
        return;
      }

      const { date, mealType, rating, comment } = req.body;

      if (!date || mealType === undefined || rating === undefined) {
        res
          .status(400)
          .json({ message: "date, mealType e rating são obrigatórios" });
        return;
      }

      if (!isValidMealType(mealType)) {
        res
          .status(400)
          .json({ message: "mealType deve ser 'lunch' ou 'dinner'" });
        return;
      }

      const numericRating = Number(rating);
      if (Number.isNaN(numericRating)) {
        res.status(400).json({ message: "rating deve ser numérico" });
        return;
      }

      await RatingService.createOrUpdate({
        userId,
        date: String(date),
        mealType,
        rating: numericRating,
        comment,
      });

      res.status(200).json({ message: "Avaliação registrada com sucesso" });
    } catch (err: any) {
      console.error("Error creating rating:", err);

      const msg = err?.message ?? "Erro ao registrar avaliação";

      if (msg.includes("Usuário não possui reserva para esta refeição")) {
        res.status(400).json({ message: msg });
        return;
      }

      if (msg.includes("ID do usuário não encontrado")) {
        res.status(401).json({ message: msg });
        return;
      }

      if (msg.includes("Não é possível avaliar uma refeição que ainda não aconteceu")) {
        res.status(401).json({ message: msg });
        return;
      }

      res.status(500).json({ message: "Erro ao registrar avaliação" });
    }
  }


  static async getMyRating(req: Request, res: Response): Promise<void> {
    try {
      const anyReq = req as any;
      const authUser = anyReq.user || anyReq.auth || {};
      const userId: string | undefined =
        authUser.id ||
        authUser.uid ||
        authUser.userId ||
        anyReq.userId;

      if (!userId) {
        res.status(401).json({ message: "Usuário não autenticado." });
        return;
      }

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

      const rating = await RatingService.getUserRating({
        userId,
        date: String(date),
        mealType,
      });

      res.status(200).json({ data: rating });
    } catch (err) {
      console.error("Error fetching rating:", err);
      res.status(500).json({ message: "Erro ao buscar avaliação" });
    }
  }


  static async getSummary(req: Request, res: Response): Promise<void> {
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

      const summary = await RatingService.getSummary({
        date: String(date),
        mealType,
      });

      res.status(200).json({ data: summary });
    } catch (err) {
      console.error("Error fetching rating summary:", err);
      res
        .status(500)
        .json({ message: "Erro ao buscar resumo de avaliações" });
    }
  }

  static async getListForMeal(req: Request, res: Response): Promise<void> {
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

      const list = await RatingService.listRatingsByMeal({
        date: String(date),
        mealType,
      });

      res.status(200).json({ data: list });
    } catch (err) {
      console.error("Error fetching ratings list:", err);
      res.status(500).json({ message: "Erro ao buscar avaliações" });
    }
  }

  static async getLast7Summary(req: Request, res: Response): Promise<void> {
    try {
      const data = await RatingService.getLast7DaysSummary();
      res.status(200).json({ data });
    } catch (err) {
      console.error("Error fetching last7 summary:", err);
      res
        .status(500)
        .json({ message: "Erro ao buscar resumo dos últimos 7 dias" });
    }
  }

}

export default RatingController;
