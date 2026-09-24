import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { createHash, randomBytes, randomUUID } from "crypto";
import { AuthRepository, SessionMetadata, User } from "./auth.repository";
import {
  AuthNotificationService,
  LoggingAuthNotificationService,
} from "./auth.notifications";
import {
  CredencialesIncorrectasError,
  SesionInvalidaError,
} from "./auth.errors";
import { env } from "../config/env";

const JWT_EXPIRES_IN = "15m";
const SESSION_IDLE_MINUTES = 30;
const SALT_ROUNDS = 10;

export interface TokenPayload {
  sub: string; // user id
  email: string;
  type: "access";
}

export interface AuthResult {
  token: string;
  userId: string;
  email: string;
  refreshToken: string;
}

export class AuthService {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly notifications: AuthNotificationService = new LoggingAuthNotificationService(),
  ) {}

  async register(
    email: string,
    password: string,
    fullName: string,
    metadata: SessionMetadata = {},
  ) {
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await this.authRepository.create(
      email,
      passwordHash,
      fullName,
    );
    await this.issueEmailVerification(user);
    return this.buildAuthResponse(user, metadata);
  }

  async requestPasswordReset(email: string): Promise<void> {
    const user = await this.authRepository.findByEmail(email);
    if (!user) return;
    const token = this.createActionToken();
    await this.authRepository.createActionToken(
      user.id,
      this.hashActionToken(token),
      "password_reset",
      this.actionExpiry(30),
    );
    await this.notifications.sendPasswordReset(user.email, token);
  }

  async resetPassword(token: string, password: string): Promise<boolean> {
    const userId = await this.authRepository.consumeActionToken(
      this.hashActionToken(token),
      "password_reset",
    );
    if (!userId) return false;
    await this.authRepository.updatePassword(
      userId,
      await bcrypt.hash(password, SALT_ROUNDS),
    );
    return true;
  }

  async verifyEmail(token: string): Promise<boolean> {
    const userId = await this.authRepository.consumeActionToken(
      this.hashActionToken(token),
      "email_verification",
    );
    if (!userId) return false;
    await this.authRepository.markEmailVerified(userId);
    return true;
  }

  async login(email: string, password: string, metadata: SessionMetadata = {}) {
    const user = await this.authRepository.findByEmail(email);
    if (!user) {
      throw new CredencialesIncorrectasError();
    }
    const matches = await bcrypt.compare(password, user.password_hash);
    if (!matches) {
      throw new CredencialesIncorrectasError();
    }
    return this.buildAuthResponse(user, metadata);
  }

  verifyToken(token: string): TokenPayload {
    const payload = jwt.verify(token, env.jwtSecret, {
      algorithms: ["HS256"],
      issuer: env.jwtIssuer,
      audience: env.jwtAudience,
    });
    if (
      !payload ||
      typeof payload === "string" ||
      payload.type !== "access" ||
      typeof payload.sub !== "string" ||
      typeof payload.email !== "string"
    ) {
      throw new Error("Token payload inválido");
    }
    return payload as unknown as TokenPayload;
  }

  async refresh(refreshToken: string, metadata: SessionMetadata = {}) {
    const replacementToken = this.createRefreshToken();
    const user = await this.authRepository.rotateSession(
      this.hashRefreshToken(refreshToken),
      this.hashRefreshToken(replacementToken),
      randomUUID(),
      this.refreshExpiry(),
      metadata,
    );
    if (!user) throw new SesionInvalidaError();
    return this.buildResponse(user, replacementToken);
  }

  async logout(refreshToken: string) {
    await this.authRepository.revokeSession(
      this.hashRefreshToken(refreshToken),
    );
  }

  publicAuthResponse(result: AuthResult) {
    return { token: result.token, userId: result.userId, email: result.email };
  }

  private async buildAuthResponse(
    user: User,
    metadata: SessionMetadata,
  ): Promise<AuthResult> {
    const refreshToken = this.createRefreshToken();
    await this.authRepository.createSession(
      user.id,
      this.hashRefreshToken(refreshToken),
      randomUUID(),
      this.refreshExpiry(),
      metadata,
    );
    return this.buildResponse(user, refreshToken);
  }

  private buildResponse(user: User, refreshToken: string): AuthResult {
    const payload: TokenPayload = {
      sub: user.id,
      email: user.email,
      type: "access",
    };
    const token = jwt.sign(payload, env.jwtSecret, {
      expiresIn: JWT_EXPIRES_IN,
      algorithm: "HS256",
      issuer: env.jwtIssuer,
      audience: env.jwtAudience,
    });
    return { token, userId: user.id, email: user.email, refreshToken };
  }

  private createRefreshToken() {
    return randomBytes(48).toString("base64url");
  }

  private createActionToken() {
    return randomBytes(32).toString("base64url");
  }

  private hashActionToken(token: string) {
    return createHash("sha256").update(token).digest("hex");
  }

  private actionExpiry(minutes: number) {
    return new Date(Date.now() + minutes * 60 * 1000);
  }

  private async issueEmailVerification(user: User) {
    const token = this.createActionToken();
    await this.authRepository.createActionToken(
      user.id,
      this.hashActionToken(token),
      "email_verification",
      this.actionExpiry(24 * 60),
    );
    await this.notifications.sendEmailVerification(user.email, token);
  }

  private hashRefreshToken(token: string) {
    return createHash("sha256").update(token).digest("hex");
  }

  private refreshExpiry() {
    return new Date(Date.now() + SESSION_IDLE_MINUTES * 60 * 1000);
  }
}
