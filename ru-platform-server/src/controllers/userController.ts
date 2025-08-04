import { Request, Response } from 'express';
import { IUser } from '../interfaces/IUser';
import userService from '../services/userService';
import validator from "validator";
export class UserController {

  static async getUsers(req: Request, res: Response) {
    try {
      const users = await userService.getUsers();
      res.status(200).json(users);
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  }

  static async getUserById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const loggedUser = req.user as IUser | undefined;

      if (loggedUser?.userId !== id && loggedUser?.role !== "admin") {
        res.status(403).json({ error: "Você só pode visualizar sua própria conta." });
        return;
      }
      const user = await userService.getById(id);
      if (!user) {
        res.status(404).json({ error: "Usuário não encontrado." });
        return;
      }

      res.status(200).json(user);
    } catch (error: any) {
      console.error(error);
      const status = error.message === "Usuário não encontrado." ? 404 : 500;
      res.status(status).json({ error: error.message });
    }
  }

  static async updateUser(req: Request, res: Response) {
    const { id } = req.params;
    const loggedUser = req.user as IUser;
    const { name, mail } = req.body;

    if (loggedUser.userId !== id) {
      res.status(403).json({ error: "Você só pode alterar sua própria conta." });
      return;
    }

    if (typeof name !== "string" || typeof mail !== "string") {
      res.status(400).json({ error: "Campos inválidos: name e mail são obrigatórios." });
      return;
    }
    if (!validator.isEmail(mail)) {
      res.status(400).json({ error: "E-mail inválido." });
      return;
    }

    const normalizedMail = validator.normalizeEmail(mail, {
      all_lowercase: true,
      gmail_remove_dots: false,
      gmail_remove_subaddress: true,
      gmail_convert_googlemaildotcom: true
    }) || mail;

    try {
      const updatedUser = await userService.updateById(id, { name, mail: normalizedMail });
      res.status(200).json(updatedUser);
    } catch (error: any) {
      const status = error.message === "Usuário não encontrado." ? 404 : 500;
      res.status(status).json({ error: error.message });
    }

  }

  static async deleteUser(req: Request, res: Response) {
    try {
      const { id } = req.params
      const loggedUserId = req.user?.userId;

      if (loggedUserId !== id) {
        res.status(403).json({ error: 'Você só pode excluir sua própria conta' });
        return;
      }

      await userService.deleteById(id);
      res.status(200).json({ message: 'Usuário excluído com sucesso' });
    } catch (error) {

    }
  }
}
