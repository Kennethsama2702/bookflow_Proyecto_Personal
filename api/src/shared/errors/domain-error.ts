// Clase base para todos los errores de NEGOCIO (no errores de programación,
// como un typo o un null inesperado -- esos deben seguir siendo Error normal).
// Los controllers usan `instanceof` sobre las clases hijas para decidir qué
// código HTTP responder (409, 401, 400...).
//
// Ventaja de heredar de aquí en vez de "extends Error" directo: `this.name`
// se pone solo con el nombre de la clase hija (antes había que escribirlo a
// mano en cada archivo de errores).
export abstract class DomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
