import { Request, Response } from "express";
import MenuService from "../services/menuService";
import upload from "../config/multerConfig";
import { MulterError } from "multer";

export class MenuController {
    static async postMenu(req: Request, res: Response) {
        try {
            upload.single('file')(req, res, async (err: any) => {
                if (err) {
                    if (err instanceof MulterError && err.code === 'LIMIT_FILE_SIZE') {
                        return res.status(400).json({ error: 'File size exceeds limit (5MB).' });
                    }
                    return res.status(400).json({error: err.message});
                }

                const { day } = req.body;
                const file = req.file;
                const allowDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

                if (!day || !file) {
                    return res.status(400).json({ error: "Day and file are required." });
                }

                if (!allowDays.includes(day)) {
                    return res.status(400).json({ error: "Invalid day. Allowed days are Monday to Friday." });
                }

                const url = await MenuService.uploadFile(day, file);
                return res.status(200).json({ message: "Menu uploaded successfully!", url });
            });
        } catch (error: any) {
            console.error("Error:", error);
            if (error instanceof Error) {
                res.status(400).json({ error: error.message });
            } else {
                res.status(500).json({ error: 'Internal Server Error' });
            }
        }
    }
    static async getMenus(req: Request, res: Response) {
        try {
            const menus = await MenuService.getMenus();
            res.status(200).json(menus);
        } catch (error: any) {
            console.error(error);
            res.status(500).json({ error: error.message });
        }
    }
}