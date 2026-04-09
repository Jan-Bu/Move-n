import type { Context } from "@netlify/functions";
import nodemailer from "nodemailer";
import { calculateMovingPrice, type PriceCalculationResult } from "../../src/configurator/services/priceCalculator";

interface PhotoFile {
  name: string;
  base64: string;
  size: number;
  type: string;
}

interface SubmittedPriceEstimate {
  numberOfTrips: number;
  loadTimeMinutes: number;
  unloadTimeMinutes: number;
  totalHours: number;
  laborPrice: number;
  transportPrice: number;
  stairSurcharge: number;
  heavyItemSurcharge: number;
  finalPrice: number;
}

type ElevatorType = 'elevator_1_3' | 'elevator_4_6' | 'elevator_7_9' | 'elevator_10plus';

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
    hasHeavyItems?: boolean;
    heavyItemsCount?: number;
  };
  estimate: {
    volumeM3: number;
  };
  preferredDate?: string;
  preferredWindow?: string;
  email: string;
  phone?: string;
  priceEstimate?: SubmittedPriceEstimate;
  timestamp: string;
}

// Price calculation constants
// Helper funkce pro překlad typu výtahu
function getElevatorTypeLabel(type: ElevatorType | null | undefined, lang: string): string {
  if (!type) return '';

  const labels: Record<ElevatorType, { cs: string; en: string }> = {
    elevator_1_3: { cs: 'Výtah pro 1–3 osoby', en: 'Elevator for 1–3 people' },
    elevator_4_6: { cs: 'Výtah pro 4–6 osob', en: 'Elevator for 4–6 people' },
    elevator_7_9: { cs: 'Výtah pro 7–9 osob', en: 'Elevator for 7–9 people' },
    elevator_10plus: { cs: 'Výtah pro 10+ osob', en: 'Elevator for 10+ people' }
  };

  return labels[type]?.[lang as 'cs' | 'en'] || type;
}

// Odhad váhy předmětu (stejná logika jako v priceCalculator.ts)
function estimateItemWeight(itemKey: string): number {
  const weights: Record<string, number> = {
    // Heavy items (120+ kg)
    sofa4seat: 150,
    sofa3seat: 120,
    wardrobe4door: 150,
    wardrobe3door: 120,
    chinaHutch: 130,

    // Medium-heavy (80-120 kg)
    sofa2seat: 90,
    bedDouble: 100,
    mattressDouble: 80,
    wardrobe2door: 100,
    fridge: 90,
    fridgeFreezer: 100,
    washingMachine: 80,
    washingMachineBath: 80,
    dryer: 80,
    dryerBath: 80,
    bookcase: 90,
    diningTable: 85,

    // Light-medium (50-80 kg)
    armchair: 60,
    bedSingle: 70,
    mattressSingle: 50,
    dresser: 65,
    sideboard: 70,
    tvStand: 55,
    kitchenTable: 60,
    freezer: 75,
    dishwasher: 70,
    desk: 65,
    filingCabinet: 60,
    bookshelf: 70,
    babyCrib: 50,
    toddlerBed: 55,
    changingTable: 50,
    workbench: 75,
    shelving: 60,
    garageCabinet: 65,
    gardenFurnitureSet: 80,
  };

  return weights[itemKey] || 0; // 0 = lehký předmět
}

// Získání příplatku za těžký předmět
function getHeavyItemSurcharge(weight: number, quantity: number): number {
  if (weight >= 120) return 1500 * quantity;
  if (weight >= 80) return 900 * quantity;
  if (weight >= 50) return 400 * quantity;
  return 0;
}

// Price calculation function (simplified version)
function calculatePrice(quote: QuoteRequest): PriceCalculationResult | null {
  if (!quote.distance || quote.estimate.volumeM3 === 0) {
    return null;
  }

  return calculateMovingPrice({
    volumeM3: quote.estimate.volumeM3,
    distanceKm: quote.distance,
    items: quote.inventory.map(({ key, qty }) => ({ key, qty })),
    floorFrom: quote.from.floor,
    floorTo: quote.to.floor,
    elevatorFrom: quote.from.elevatorType ?? null,
    elevatorTo: quote.to.elevatorType ?? null,
    hasElevatorFrom: quote.from.elevator,
    hasElevatorTo: quote.to.elevator,
    heavyItemsCount: quote.services.hasHeavyItems ? (quote.services.heavyItemsCount ?? 0) : 0,
  });
}

function resolvePriceEstimate(quote: QuoteRequest): SubmittedPriceEstimate | PriceCalculationResult | null {
  if (quote.priceEstimate) {
    return quote.priceEstimate;
  }

  return calculatePrice(quote);
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

    // Debug logging
    console.log('=== RECEIVED QUOTE IN NETLIFY FUNCTION ===');
    console.log('From address:', JSON.stringify(quote.from, null, 2));
    console.log('To address:', JSON.stringify(quote.to, null, 2));
    console.log('Distance:', quote.distance);
    console.log('Volume:', quote.estimate.volumeM3);
    console.log('Inventory:', JSON.stringify(quote.inventory, null, 2));

    // Calculate price ONCE for both emails
    const priceCalc = resolvePriceEstimate(quote);
    console.log('=== PRICE CALCULATION ===');
    console.log('Price result:', priceCalc);

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
            ${priceCalc.heavyItemSurcharge > 0 ? `<p><strong>${quote.lang === "cs" ? "Příplatek za těžké předměty" : "Heavy item surcharge"}:</strong> ${priceCalc.heavyItemSurcharge.toLocaleString()} Kč</p>` : ''}
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
            ${priceCalc.heavyItemSurcharge > 0 ? `<p><strong>${quote.lang === "cs" ? "Příplatek za těžké předměty" : "Heavy item surcharge"}:</strong> ${priceCalc.heavyItemSurcharge.toLocaleString()} Kč</p>` : ''}
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
