import { Request, Response } from "express";
import { AuthService } from "./auth.service";
import {
  EmailRegistradoError,
  CredencialesIncorrectasError,
} from "./auth.errors";

export class AuthController {
  constructor(private readonly authService: AuthService) {}

  register = async (req: Request, res: Response) => {
    try {
      const { email, password, fullName } = req.body;
      if (!email || !password || !fullName) {
        return res
          .status(400)
          .json({ error: "email, password y fullName son requeridos" });
      }
      const result = await this.authService.register(email, password, fullName);
      res.status(201).json(result);
    } catch (err) {
      if (err instanceof EmailRegistradoError) {
        res.status(409).json({ error: err.message });
      } else {
        console.error(err);
        res.status(500).json({ error: "Error interno" });
      }
    }
  };

  login = async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res
          .status(400)
          .json({ error: "email y password son requeridos" });
      }
      const result = await this.authService.login(email, password);
      res.json(result);
    } catch (err) {
      if (err instanceof CredencialesIncorrectasError) {
        res.status(401).json({ error: err.message });
      } else {
        console.error(err);
        res.status(500).json({ error: "Error interno" });
      }
    }
  };
}
