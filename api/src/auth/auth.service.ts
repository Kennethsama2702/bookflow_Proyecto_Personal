import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { AuthRepository } from "./auth.repository";
import { CredencialesIncorrectasError } from "./auth.errors";
import { env } from "../config/env";

const JWT_EXPIRES_IN = "2h";
const SALT_ROUNDS = 10;

export interface TokenPayload {
  sub: string; // user id
  email: string;
}

export class AuthService {
  constructor(private readonly authRepository: AuthRepository) {}

  async register(email: string, password: string, fullName: string) {
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await this.authRepository.create(
      email,
      passwordHash,
      fullName,
    );
    return this.buildAuthResponse(user.id, user.email);
  }

  async login(email: string, password: string) {
    const user = await this.authRepository.findByEmail(email);
    if (!user) {
      throw new CredencialesIncorrectasError();
    }
    const matches = await bcrypt.compare(password, user.password_hash);
    if (!matches) {
      throw new CredencialesIncorrectasError();
    }
    return this.buildAuthResponse(user.id, user.email);
  }

  verifyToken(token: string): TokenPayload {
    return jwt.verify(token, env.jwtSecret) as TokenPayload;
  }

  private buildAuthResponse(userId: string, email: string) {
    const payload: TokenPayload = { sub: userId, email };
    const token = jwt.sign(payload, env.jwtSecret, {
      expiresIn: JWT_EXPIRES_IN,
    });
    return { token, userId, email };
  }
}
