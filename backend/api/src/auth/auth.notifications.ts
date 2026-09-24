import { logger } from "../shared/logging/logger";

export interface AuthNotificationService {
  sendEmailVerification(email: string, token: string): Promise<void>;
  sendPasswordReset(email: string, token: string): Promise<void>;
}

export class LoggingAuthNotificationService implements AuthNotificationService {
  async sendEmailVerification(email: string, _token: string): Promise<void> {
    logger.info("email_verification_queued", { email });
  }

  async sendPasswordReset(email: string, _token: string): Promise<void> {
    logger.info("password_reset_queued", { email });
  }
}
