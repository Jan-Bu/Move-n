import type { Context } from "@netlify/functions";
import nodemailer from "nodemailer";

interface PhotoFile {
  name: string;
  base64: string;
  size: number;
  type: string;
}

interface QuoteRequest {
  lang: string;
  from: {
    address: string;
    elevator: boolean;
    floor: number;
    longWalk?: boolean;
    narrowStairs?: boolean;
  };
  to: {
    address: string;
    elevator: boolean;
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
              .map((item) => `<li>${item.label}: ${item.qty}x</li>`)
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

    const mailOptions = {
      from: emailFrom,
      to: emailTo,
      subject:
        quote.lang === "cs"
          ? `Nová poptávka na stěhování - ${quote.from.address} → ${quote.to.address}`
          : `New Moving Quote Request - ${quote.from.address} → ${quote.to.address}`,
      html: emailBody,
      attachments: attachments.length > 0 ? attachments : undefined,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent successfully:", info.messageId);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Quote submitted successfully",
        messageId: info.messageId,
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
