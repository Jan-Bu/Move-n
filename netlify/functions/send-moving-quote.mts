import type { Context } from "@netlify/functions";
import nodemailer from "nodemailer";

interface PhotoFile {
  name: string;
  base64: string;
  size: number;
  type: string;
}

type ElevatorType = 'elevator_2' | 'elevator_4' | 'elevator_6' | 'elevator_8' | 'elevator_10_13' | 'elevator_15plus';

interface QuoteRequest {
  lang: string;
  from: {
    address: string;
    elevator: boolean;
    elevatorType?: ElevatorType | null;
    floor: number;
    longWalk?: boolean;
    narrowStairs?: boolean;
  };
  to: {
    address: string;
    elevator: boolean;
    elevatorType?: ElevatorType | null;
    floor: number;
    longWalk?: boolean;
    narrowStairs?: boolean;
  };
  distance?: number;
  inventory: Array<{
    key: string;
    label: string;
    qty: number;
    volumePerUnit?: number;
  }>;
  other?: string;
  photos: PhotoFile[];
  services: {
    disassembly: boolean;
    assembly: boolean;
    packingService: boolean;
    insurance: boolean;
  };
  estimate: {
    volumeM3: number;
  };
  preferredDate?: string;
  preferredWindow?: string;
  email: string;
  phone?: string;
  timestamp: string;
}

// Price calculation constants
const VEHICLE_CAPACITY_M3 = 17;
const BASE_LOAD_TIME_MINUTES = 120;
const STAIR_SURCHARGE_PER_FLOOR = 200;
const DEFAULT_HOURLY_RATE = 500;
const PRICE_PER_KM = 20;
const DEFAULT_WORKERS = 2;

const FLOOR_COEFFICIENTS = {
  ground: 1.0,
  withElevator: 1.2,
  stairs: 1.5,
};

// Helper funkce pro překlad typu výtahu
function getElevatorTypeLabel(type: ElevatorType | null | undefined, lang: string): string {
  if (!type) return '';

  const labels: Record<ElevatorType, { cs: string; en: string }> = {
    elevator_2: { cs: 'Výtah pro 2 osoby', en: 'Elevator for 2 people' },
    elevator_4: { cs: 'Výtah pro 4 osoby', en: 'Elevator for 4 people' },
    elevator_6: { cs: 'Výtah pro 6 osob', en: 'Elevator for 6 people' },
    elevator_8: { cs: 'Výtah pro 8 osob', en: 'Elevator for 8 people' },
    elevator_10_13: { cs: 'Výtah pro 10–13 osob', en: 'Elevator for 10–13 people' },
    elevator_15plus: { cs: 'Výtah pro 15+ osob', en: 'Elevator for 15+ people' }
  };

  return labels[type]?.[lang as 'cs' | 'en'] || type;
}

// Price calculation function (simplified version)
function calculatePrice(quote: QuoteRequest) {
  if (!quote.distance || quote.estimate.volumeM3 === 0) {
    return null;
  }

  const numberOfTrips = Math.ceil(quote.estimate.volumeM3 / VEHICLE_CAPACITY_M3);

  // Calculate time
  const volumeFactor = quote.estimate.volumeM3 / VEHICLE_CAPACITY_M3;
  const coefficientFrom = quote.from.floor > 0 ? (quote.from.elevator ? FLOOR_COEFFICIENTS.withElevator : FLOOR_COEFFICIENTS.stairs) : FLOOR_COEFFICIENTS.ground;
  const coefficientTo = quote.to.floor > 0 ? (quote.to.elevator ? FLOOR_COEFFICIENTS.withElevator : FLOOR_COEFFICIENTS.stairs) : FLOOR_COEFFICIENTS.ground;

  const loadTimeMinutes = BASE_LOAD_TIME_MINUTES * volumeFactor * coefficientFrom;
  const unloadTimeMinutes = BASE_LOAD_TIME_MINUTES * volumeFactor * coefficientTo;
  const totalMinutes = loadTimeMinutes + unloadTimeMinutes;
  const totalHours = totalMinutes / 60;

  // Calculate stair surcharge
  const avgFloor = ((quote.from.floor || 0) + (quote.to.floor || 0)) / 2;
  const hasStairs = (quote.from.floor > 0 && !quote.from.elevator) || (quote.to.floor > 0 && !quote.to.elevator);
  const stairSurcharge = hasStairs ? STAIR_SURCHARGE_PER_FLOOR * Math.ceil(avgFloor) : 0;

  // Calculate prices
  const laborPrice = Math.ceil(totalHours * DEFAULT_HOURLY_RATE * DEFAULT_WORKERS);
  const transportPrice = Math.ceil(quote.distance * PRICE_PER_KM);
  const finalPrice = laborPrice + transportPrice + stairSurcharge;

  return {
    numberOfTrips,
    loadTimeMinutes: Math.ceil(loadTimeMinutes),
    unloadTimeMinutes: Math.ceil(unloadTimeMinutes),
    totalHours: Math.round(totalHours * 100) / 100,
    laborPrice,
    transportPrice,
    stairSurcharge,
    finalPrice,
  };
}

export default async (req: Request, context: Context) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ success: false, error: "Method not allowed" }),
      {
        status: 405,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  }

  try {
    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = process.env.SMTP_PORT || "587";
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    const emailFrom = process.env.EMAIL_FROM || smtpUser;
    const emailTo = process.env.EMAIL_TO;

    if (!smtpHost || !smtpUser || !smtpPass || !emailTo) {
      throw new Error("Email configuration missing. Required: SMTP_HOST, SMTP_USER, SMTP_PASS, EMAIL_TO");
    }

    const quote: QuoteRequest = await req.json();

    const services = [];
    if (quote.services.disassembly)
      services.push(
        quote.lang === "cs" ? "Demontáž nábytku" : "Furniture disassembly"
      );
    if (quote.services.assembly)
      services.push(
        quote.lang === "cs" ? "Montáž nábytku" : "Furniture assembly"
      );
    if (quote.services.packingService)
      services.push(quote.lang === "cs" ? "Balení věcí" : "Packing service");
    if (quote.services.insurance)
      services.push(quote.lang === "cs" ? "Pojištění" : "Insurance");

    const attachments = quote.photos.map((photo, index) => ({
      filename: `photo-${index + 1}-${photo.name}`,
      content: photo.base64.split(",")[1],
      encoding: 'base64' as const,
    }));

    const emailBody = `
      <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #166534;">${
          quote.lang === "cs"
            ? "Nová poptávka na stěhování"
            : "New Moving Quote Request"
        }</h1>

        <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h2 style="color: #166534; margin-top: 0;">${
            quote.lang === "cs" ? "Kontaktní údaje" : "Contact Information"
          }</h2>
          <p><strong>Email:</strong> ${quote.email}</p>
          ${
            quote.phone
              ? `<p><strong>${
                  quote.lang === "cs" ? "Telefon" : "Phone"
                }:</strong> ${quote.phone}</p>`
              : ""
          }
          <p><strong>${
            quote.lang === "cs" ? "Datum poptávky" : "Request Date"
          }:</strong> ${new Date(quote.timestamp).toLocaleString(
      quote.lang === "cs" ? "cs-CZ" : "en-US"
    )}</p>
        </div>

        <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h2 style="color: #166534; margin-top: 0;">${
            quote.lang === "cs" ? "Adresy" : "Addresses"
          }</h2>
          <div style="margin-bottom: 15px;">
            <h3 style="color: #166534;">${
              quote.lang === "cs" ? "Z adresy" : "From"
            }:</h3>
            <p><strong>${
              quote.lang === "cs" ? "Adresa" : "Address"
            }:</strong> ${quote.from.address}</p>
            <p><strong>${
              quote.lang === "cs" ? "Výtah" : "Elevator"
            }:</strong> ${
      quote.from.elevator
        ? quote.lang === "cs"
          ? "Ano"
          : "Yes"
        : quote.lang === "cs"
        ? "Ne"
        : "No"
    }</p>
            ${
              quote.from.elevator && quote.from.elevatorType
                ? `<p><strong>${
                    quote.lang === "cs" ? "Typ výtahu" : "Elevator type"
                  }:</strong> ${getElevatorTypeLabel(quote.from.elevatorType, quote.lang)}</p>`
                : ""
            }
            <p><strong>${quote.lang === "cs" ? "Patro" : "Floor"}:</strong> ${
      quote.from.floor
    }</p>
            ${
              quote.from.longWalk
                ? `<p><strong>${
                    quote.lang === "cs"
                      ? "Dlouhá vzdálenost od parkování"
                      : "Long distance from parking"
                  }</strong></p>`
                : ""
            }
            ${
              quote.from.narrowStairs
                ? `<p><strong>${
                    quote.lang === "cs"
                      ? "Úzké schodiště"
                      : "Narrow staircase"
                  }</strong></p>`
                : ""
            }
          </div>
          <div>
            <h3 style="color: #166534;">${
              quote.lang === "cs" ? "Na adresu" : "To"
            }:</h3>
            <p><strong>${
              quote.lang === "cs" ? "Adresa" : "Address"
            }:</strong> ${quote.to.address}</p>
            <p><strong>${
              quote.lang === "cs" ? "Výtah" : "Elevator"
            }:</strong> ${
      quote.to.elevator
        ? quote.lang === "cs"
          ? "Ano"
          : "Yes"
        : quote.lang === "cs"
        ? "Ne"
        : "No"
    }</p>
            ${
              quote.to.elevator && quote.to.elevatorType
                ? `<p><strong>${
                    quote.lang === "cs" ? "Typ výtahu" : "Elevator type"
                  }:</strong> ${getElevatorTypeLabel(quote.to.elevatorType, quote.lang)}</p>`
                : ""
            }
            <p><strong>${quote.lang === "cs" ? "Patro" : "Floor"}:</strong> ${
      quote.to.floor
    }</p>
            ${
              quote.to.longWalk
                ? `<p><strong>${
                    quote.lang === "cs"
                      ? "Dlouhá vzdálenost od parkování"
                      : "Long distance from parking"
                  }</strong></p>`
                : ""
            }
            ${
              quote.to.narrowStairs
                ? `<p><strong>${
                    quote.lang === "cs"
                      ? "Úzké schodiště"
                      : "Narrow staircase"
                  }</strong></p>`
                : ""
            }
          </div>
          ${
            quote.distance
              ? `<p><strong>${
                  quote.lang === "cs" ? "Vzdálenost" : "Distance"
                }:</strong> ${quote.distance} km</p>`
              : ""
          }
        </div>

        <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h2 style="color: #166534; margin-top: 0;">${
            quote.lang === "cs" ? "Inventář" : "Inventory"
          }</h2>
          <p><strong>${
            quote.lang === "cs" ? "Odhadovaný objem" : "Estimated volume"
          }:</strong> ${quote.estimate.volumeM3.toFixed(1)} m³</p>
          <h3>${quote.lang === "cs" ? "Předměty" : "Items"}:</h3>
          <ul>
            ${quote.inventory
              .map((item) => {
                const perUnitVolume = item.volumePerUnit || 0;
                const totalItemVolume = perUnitVolume * item.qty;
                return `<li>${item.label}: ${item.qty}x ${
                  perUnitVolume > 0
                    ? `(${perUnitVolume.toFixed(2)} m³ ${quote.lang === "cs" ? "každý" : "each"} = <strong>${totalItemVolume.toFixed(2)} m³</strong>)`
                    : ""
                }</li>`;
              })
              .join("")}
          </ul>
          ${
            quote.other
              ? `<p><strong>${
                  quote.lang === "cs" ? "Další předměty" : "Other items"
                }:</strong><br>${quote.other.replace(/\n/g, "<br>")}</p>`
              : ""
          }
        </div>

        ${
          services.length > 0
            ? `
        <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h2 style="color: #166534; margin-top: 0;">${
            quote.lang === "cs" ? "Doplňkové služby" : "Additional Services"
          }</h2>
          <ul>
            ${services.map((service) => `<li>${service}</li>`).join("")}
          </ul>
        </div>
        `
            : ""
        }

        ${
          quote.preferredDate
            ? `
        <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h2 style="color: #166534; margin-top: 0;">${
            quote.lang === "cs" ? "Preferovaný termín" : "Preferred Date"
          }</h2>
          <p><strong>${
            quote.lang === "cs" ? "Datum" : "Date"
          }:</strong> ${quote.preferredDate}</p>
          ${
            quote.preferredWindow
              ? `<p><strong>${
                  quote.lang === "cs" ? "Čas" : "Time"
                }:</strong> ${quote.preferredWindow}</p>`
              : ""
          }
        </div>
        `
            : ""
        }

        ${
          (() => {
            const priceCalc = calculatePrice(quote);
            if (!priceCalc) return '';

            return `
        <div style="background: #dcfce7; padding: 20px; border-radius: 8px; margin: 20px 0; border: 2px solid #166534;">
          <h2 style="color: #166534; margin-top: 0;">${
            quote.lang === "cs" ? "Orientační cena" : "Estimated Price"
          }</h2>
          <div style="display: grid; gap: 10px;">
            <p><strong>${quote.lang === "cs" ? "Počet jízd" : "Number of trips"}:</strong> ${priceCalc.numberOfTrips}×</p>
            <p><strong>${quote.lang === "cs" ? "Čas nakládání" : "Loading time"}:</strong> ${priceCalc.loadTimeMinutes} ${quote.lang === "cs" ? "min" : "min"}</p>
            <p><strong>${quote.lang === "cs" ? "Čas vykládání" : "Unloading time"}:</strong> ${priceCalc.unloadTimeMinutes} ${quote.lang === "cs" ? "min" : "min"}</p>
            <p><strong>${quote.lang === "cs" ? "Celkový čas" : "Total time"}:</strong> ${priceCalc.totalHours} ${quote.lang === "cs" ? "hod" : "hrs"}</p>
            <p><strong>${quote.lang === "cs" ? "Práce" : "Labor"}:</strong> ${priceCalc.laborPrice.toLocaleString()} Kč</p>
            <p><strong>${quote.lang === "cs" ? "Doprava" : "Transport"}:</strong> ${priceCalc.transportPrice.toLocaleString()} Kč</p>
            ${priceCalc.stairSurcharge > 0 ? `<p><strong>${quote.lang === "cs" ? "Příplatek za schody" : "Stair surcharge"}:</strong> ${priceCalc.stairSurcharge.toLocaleString()} Kč</p>` : ''}
            <p style="font-size: 18px; margin-top: 10px; padding-top: 10px; border-top: 2px solid #166534;"><strong>${quote.lang === "cs" ? "Celková cena" : "Total price"}:</strong> <span style="color: #166534; font-size: 22px;">${priceCalc.finalPrice.toLocaleString()} Kč</span></p>
          </div>
        </div>
            `;
          })()
        }

        ${
          quote.photos.length > 0
            ? `
        <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h2 style="color: #166534; margin-top: 0;">${
            quote.lang === "cs" ? "Fotografie" : "Photos"
          }</h2>
          <p>${quote.photos.length} ${
              quote.lang === "cs" ? "fotografií přiloženo" : "photos attached"
            }</p>
        </div>
        `
            : ""
        }

        <div style="margin-top: 30px; padding-top: 20px; border-top: 2px solid #e5e7eb;">
          <p style="color: #6b7280; font-size: 14px;">${
            quote.lang === "cs"
              ? "Tato poptávka byla odeslána z konfiguratoru stěhování."
              : "This request was submitted from the moving configurator."
          }</p>
        </div>
      </div>
    `;

    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: parseInt(smtpPort),
      secure: parseInt(smtpPort) === 465,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });

    // Email pro firmu (admin)
    const adminMailOptions = {
      from: emailFrom,
      to: emailTo,
      subject:
        quote.lang === "cs"
          ? `Nová poptávka na stěhování - ${quote.from.address} → ${quote.to.address}`
          : `New Moving Quote Request - ${quote.from.address} → ${quote.to.address}`,
      html: emailBody,
      attachments: attachments.length > 0 ? attachments : undefined,
    };

    // Email pro klienta (confirmation)
    const priceCalc = calculatePrice(quote);
    const clientEmailBody = `
      <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #166534;">${
          quote.lang === "cs"
            ? "Děkujeme za váš zájem o stěhování"
            : "Thank you for your moving request"
        }</h1>

        <p>${
          quote.lang === "cs"
            ? "Vaši poptávku jsme úspěšně obdrželi. Níže naleznete shrnutí vašich údajů."
            : "We have successfully received your request. Below is a summary of your information."
        }</p>

        ${priceCalc ? `
        <div style="background: #dcfce7; padding: 20px; border-radius: 8px; margin: 20px 0; border: 2px solid #166534;">
          <h2 style="color: #166534; margin-top: 0;">${
            quote.lang === "cs" ? "Orientační cena" : "Estimated Price"
          }</h2>
          <div style="display: grid; gap: 10px;">
            <p><strong>${quote.lang === "cs" ? "Počet jízd" : "Number of trips"}:</strong> ${priceCalc.numberOfTrips}×</p>
            <p><strong>${quote.lang === "cs" ? "Celkový čas" : "Total time"}:</strong> ${priceCalc.totalHours} ${quote.lang === "cs" ? "hod" : "hrs"}</p>
            <p><strong>${quote.lang === "cs" ? "Práce" : "Labor"}:</strong> ${priceCalc.laborPrice.toLocaleString()} Kč</p>
            <p><strong>${quote.lang === "cs" ? "Doprava" : "Transport"}:</strong> ${priceCalc.transportPrice.toLocaleString()} Kč</p>
            ${priceCalc.stairSurcharge > 0 ? `<p><strong>${quote.lang === "cs" ? "Příplatek za schody" : "Stair surcharge"}:</strong> ${priceCalc.stairSurcharge.toLocaleString()} Kč</p>` : ''}
            <p style="font-size: 18px; margin-top: 10px; padding-top: 10px; border-top: 2px solid #166534;"><strong>${quote.lang === "cs" ? "Celková orientační cena" : "Total estimated price"}:</strong> <span style="color: #166534; font-size: 22px;">${priceCalc.finalPrice.toLocaleString()} Kč</span></p>
          </div>
          <p style="margin-top: 15px; font-size: 14px; color: #6b7280;">${
            quote.lang === "cs"
              ? "Toto je orientační cena. Finální nabídku obdržíte po kontrole našeho týmu."
              : "This is an estimated price. You will receive the final offer after review by our team."
          }</p>
        </div>
        ` : ''}

        <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h2 style="color: #166534; margin-top: 0;">${
            quote.lang === "cs" ? "Z adresy" : "From"
          }</h2>
          <p>${quote.from.address}</p>
          <p>${quote.lang === "cs" ? "Patro" : "Floor"}: ${quote.from.floor}</p>
        </div>

        <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h2 style="color: #166534; margin-top: 0;">${
            quote.lang === "cs" ? "Na adresu" : "To"
          }</h2>
          <p>${quote.to.address}</p>
          <p>${quote.lang === "cs" ? "Patro" : "Floor"}: ${quote.to.floor}</p>
        </div>

        <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h2 style="color: #166534; margin-top: 0;">${
            quote.lang === "cs" ? "Objem" : "Volume"
          }</h2>
          <p><strong>${quote.estimate.volumeM3.toFixed(1)} m³</strong></p>
        </div>

        <div style="margin-top: 30px; padding-top: 20px; border-top: 2px solid #e5e7eb;">
          <p>${
            quote.lang === "cs"
              ? "Brzy vás budeme kontaktovat s finální nabídkou."
              : "We will contact you soon with a final offer."
          }</p>
          <p style="color: #6b7280; font-size: 14px; margin-top: 20px;">${
            quote.lang === "cs"
              ? "S pozdravem,<br>Tým MOVI-N"
              : "Best regards,<br>The MOVI-N Team"
          }</p>
        </div>
      </div>
    `;

    const clientMailOptions = {
      from: emailFrom,
      to: quote.email,
      subject:
        quote.lang === "cs"
          ? `Potvrzení poptávky na stěhování - ${quote.from.address} → ${quote.to.address}`
          : `Moving Request Confirmation - ${quote.from.address} → ${quote.to.address}`,
      html: clientEmailBody,
    };

    // Poslat oba emaily
    const adminInfo = await transporter.sendMail(adminMailOptions);
    console.log("Admin email sent successfully:", adminInfo.messageId);

    const clientInfo = await transporter.sendMail(clientMailOptions);
    console.log("Client email sent successfully:", clientInfo.messageId);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Quote submitted successfully",
        adminMessageId: adminInfo.messageId,
        clientMessageId: clientInfo.messageId,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  } catch (error) {
    console.error("Error processing quote:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  }
};