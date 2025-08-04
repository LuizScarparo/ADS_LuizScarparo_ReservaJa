import { Request, Response } from "express";
import { body, validationResult } from "express-validator";
import validator from "validator";
import AuthService from "../services/authService";
import jwt from "jsonwebtoken";

export class AuthController {
  static async register(req: Request, res: Response) {

    if (req.body.role !== "visitor") {
      await body('password').isLength({ min: 8 }).withMessage("Too short password!").run(req);
    }
    await body('mail').isEmail().withMessage("Invalid mail").run(req);

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    req.body.mail = validator.normalizeEmail(req.body.mail, {
      all_lowercase: true,          
      gmail_remove_dots: false,
      gmail_remove_subaddress: true,
      gmail_convert_googlemaildotcom: true
    }) || req.body.mail;

    try {
      const user = await AuthService.register(req.body);
      if ("error" in user) {
        res.status(400).json({ error: user.error });
        return;
      }
      res.status(201).json({ message: user.message, userId: user.userId, ...(user.token && { token: user.token }) });
      return;
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
      return;
    }
  }

  static async login(req: Request, res: Response) {
    try {
      const { mail, password } = req.body;
      const user = await AuthService.login(mail, password);

      if (!user || user.error) {
        res.status(401).json({ error: user?.error || "User not found!" });
        return;
      }

      const token = jwt.sign(
        { userId: user.userId, mail: user.mail, role: user.role, name: user.name, enrollmentNumber: user.enrollmentNumber },
        process.env.JWT_SECRET || 'chave-secreta',
        { expiresIn: '3d' }
      )

      res.json({
        message: "Login successful!",
        token,
        user: user,
      });

    } catch (error: any) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
      return;
    }
  }

  static async requestResetPassword(req: Request, res: Response) {
    try {
      const { mail } = req.body;
      await AuthService.requestResetPassword(mail);

      res.status(200).json({ message: "Email enviado com sucesso!" });
    } catch (error: any) {
      console.error(error);
      res.status(400).json({ error: error.message });
    }
  }

  static async resetPassword(req: Request, res: Response) {
    try {
      const { id, token } = req.params;
      const { newPassword } = req.body;

      if (!newPassword || newPassword.length < 8) {
        res.status(400).json({ error: "Senha deve ter no mínimo 8 caracteres!" });
        return;
      }
      await AuthService.resetPassword(id, token, newPassword);
      res.status(200).json({ message: "Senha redefinida com sucesso!" });

    } catch (error: any) {
      console.error(error);

      if (error.name === "TokenExpiredError") {
        res.status(401).json({ error: "Token expirado. Solicite uma nova recuperação de senha." });
        return;
      }
      if (error.name === "JsonWebTokenError") {
        res.status(401).json({ error: "Token inválido." });
        return;
      }
      res.status(400).json({ error: error.message });
    }
  }
}
