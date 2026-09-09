export class EmailAlreadyRegisteredError extends Error {
  constructor(email: string) {
    super(`El correo ${email} ya está registrado`);
    this.name = 'EmailAlreadyRegisteredError';
  }
}

export class InvalidCredentialsError extends Error {
  constructor() {
    super('Correo o contraseña incorrectos');
    this.name = 'InvalidCredentialsError';
  }
}
