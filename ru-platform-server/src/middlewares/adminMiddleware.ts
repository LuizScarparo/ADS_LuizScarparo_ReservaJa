import { Request, Response, NextFunction  } from "express";

export function adminMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const user = (req as any).user;

  if ( !user || user.role !== "admin") {
    res.status(403).json({ message: "Acesso negado!" });
    return;
  }

  next();
}