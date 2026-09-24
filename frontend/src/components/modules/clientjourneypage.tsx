import {
  ArrowLeft,
  Check,
  CreditCard,
  Popcorn,
  QrCode,
  Ticket,
  Armchair,
} from "lucide-react";
import { useState } from "react";
import logotipo from "../../assets/Logotipo_Cinefilo.png";
import "./clientjourneypage.css";

type Journey = "tickets" | "concessions" | "showtime";
type Step = "seats" | "payment" | "qr";

interface Props {
  journey: Journey;
  onBack: () => void;
}

export default function ClientJourneyPage({ journey, onBack }: Props) {
  const [step, setStep] = useState<Step>(
    journey === "showtime" ? "seats" : "payment",
  );
  const isTicketFlow = journey === "showtime";

  if (journey === "tickets") {
    return (
      <div className="client-journey">
        <img
          className="journey-brand"
          src={logotipo}
          alt="Cinefilo, Más que películas"
        />
        <button className="journey-back" onClick={onBack}>
          <ArrowLeft size={17} /> Volver a cartelera
        </button>
        <div className="journey-empty">
          <Ticket size={42} />
          <span className="client-kicker">MIS TICKETS</span>
          <h1>Aún no tienes tickets.</h1>
          <p>Cuando compres tus entradas aparecerán aquí con su código QR.</p>
          <button className="journey-primary" onClick={onBack}>
            Explorar cartelera
          </button>
        </div>
      </div>
    );
  }

  if (journey === "concessions") {
    return (
      <div className="client-journey">
        <img
          className="journey-brand"
          src={logotipo}
          alt="Cinefilo, Más que películas"
        />
        <button className="journey-back" onClick={onBack}>
          <ArrowLeft size={17} /> Volver a cartelera
        </button>
        <div className="journey-heading">
          <span className="client-kicker">CONFITERÍA</span>
          <h1>Algo rico para acompañar la película.</h1>
          <p>Elige tus favoritos y agrégalos a tu próxima compra.</p>
        </div>
        <div className="concession-grid">
          {[
            {
              name: "Combo clásico",
              detail: "Canguil + bebida",
              price: "$6.50",
            },
            {
              name: "Nachos de cine",
              detail: "Nachos + queso + bebida",
              price: "$7.25",
            },
            {
              name: "Dulce pausa",
              detail: "Golosinas surtidas",
              price: "$4.00",
            },
          ].map((item) => (
            <article className="concession-card" key={item.name}>
              <Popcorn size={28} />
              <h2>{item.name}</h2>
              <p>{item.detail}</p>
              <strong>{item.price}</strong>
              <button className="journey-primary">Agregar</button>
            </article>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="client-journey">
      <img
        className="journey-brand"
        src={logotipo}
        alt="Cinefilo, Más que películas"
      />
      <button className="journey-back" onClick={onBack}>
        <ArrowLeft size={17} /> Volver a cartelera
      </button>
      <div className="journey-heading">
        <span className="client-kicker">
          {step === "seats"
            ? "2 · ASIENTOS"
            : step === "payment"
              ? "3 · PAGO"
              : "4 · TICKET"}
        </span>
        <h1>
          {step === "seats"
            ? "Elige tus asientos."
            : step === "payment"
              ? "Confirma tu compra."
              : "Tu ticket está listo."}
        </h1>
        <p>Horizonte Cero · Hoy · 20:00 · Sala Atmos</p>
      </div>
      <div className="journey-progress">
        <span className={step === "seats" ? "current" : "done"}>1 Función</span>
        <span
          className={
            step === "seats"
              ? "current"
              : step === "payment"
                ? "current"
                : "done"
          }
        >
          2 Asientos
        </span>
        <span
          className={
            step === "payment" ? "current" : step === "qr" ? "done" : ""
          }
        >
          3 Pago
        </span>
        <span className={step === "qr" ? "current" : ""}>4 QR</span>
      </div>
      {step === "seats" && (
        <div className="seat-layout">
          <div className="screen-label">PANTALLA</div>
          <div className="seat-grid">
            {Array.from({ length: 24 }, (_, index) => (
              <button
                className={
                  index === 8 || index === 9 ? "seat selected-seat" : "seat"
                }
                key={index}
              >
                <Armchair size={16} />
              </button>
            ))}
          </div>
          <button
            className="journey-primary"
            onClick={() => setStep("payment")}
          >
            Continuar con el pago
          </button>
        </div>
      )}
      {step === "payment" && (
        <div className="payment-box">
          <CreditCard size={30} />
          <div>
            <h2>2 asientos · $18.00</h2>
            <p>
              El pago se conectará con el proveedor seguro en la siguiente fase.
            </p>
          </div>
          <button className="journey-primary" onClick={() => setStep("qr")}>
            Confirmar compra de prueba
          </button>
        </div>
      )}
      {step === "qr" && (
        <div className="ticket-result">
          <div className="fake-qr">
            <QrCode size={100} />
          </div>
          <Check size={26} />
          <h2>Compra confirmada</h2>
          <p>Tu ticket de demostración está listo para mostrarlo en el cine.</p>
          <button className="journey-primary" onClick={onBack}>
            Volver a cartelera
          </button>
        </div>
      )}
      {!isTicketFlow && null}
    </div>
  );
}
