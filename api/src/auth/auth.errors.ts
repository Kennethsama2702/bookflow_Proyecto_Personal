import { DomainError } from "../shared/errors/domain-error";

export class EmailRegistradoError extends DomainError {
  constructor(email: string) {
    super(`El correo ${email} ya está registrado`);
  }
}

export class CredencialesIncorrectasError extends DomainError {
  constructor() {
    super("Correo o contraseña incorrectos");
  }
}
