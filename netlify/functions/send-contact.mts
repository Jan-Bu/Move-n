import nodemailer from "nodemailer";

interface ContactRequest {
  name?: string;
  email?: string;
  phone?: string;
  service?: string;
  message?: string;
  city?: string;
  language?: "cs" | "en";
  timestamp?: string;
}

function jsonResponse(body: Record<string, unknown>, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
  });
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function requiredString(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

export default async (req: Request) => {
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
    return jsonResponse({ success: false, error: "Method not allowed" }, 405);
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

    const payload = await req.json() as ContactRequest;
    const name = requiredString(payload.name);
    const email = requiredString(payload.email);
    const phone = requiredString(payload.phone);
    const service = requiredString(payload.service);
    const message = requiredString(payload.message);

    if (!name || !email || !phone || !service || !message) {
      return jsonResponse({ success: false, error: "Missing required fields" }, 400);
    }

    const language = payload.language === "en" ? "en" : "cs";
    const submittedAt = payload.timestamp
      ? new Date(payload.timestamp)
      : new Date();

    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: parseInt(smtpPort),
      secure: parseInt(smtpPort) === 465,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });

    const cityLine = payload.city
      ? `<p><strong>${language === "cs" ? "Město" : "City"}:</strong> ${escapeHtml(payload.city)}</p>`
      : "";

    const emailBody = `
      <div style="font-family: Arial, sans-serif; max-width: 720px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #166534;">${language === "cs" ? "Nová kontaktní poptávka" : "New Contact Inquiry"}</h1>
        <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>${language === "cs" ? "Jméno" : "Name"}:</strong> ${escapeHtml(name)}</p>
          <p><strong>Email:</strong> ${escapeHtml(email)}</p>
          <p><strong>${language === "cs" ? "Telefon" : "Phone"}:</strong> ${escapeHtml(phone)}</p>
          <p><strong>${language === "cs" ? "Služba" : "Service"}:</strong> ${escapeHtml(service)}</p>
          ${cityLine}
          <p><strong>${language === "cs" ? "Datum" : "Date"}:</strong> ${submittedAt.toLocaleString(language === "cs" ? "cs-CZ" : "en-US")}</p>
        </div>
        <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h2 style="color: #166534; margin-top: 0;">${language === "cs" ? "Zpráva" : "Message"}</h2>
          <p>${escapeHtml(message).replace(/\n/g, "<br>")}</p>
        </div>
      </div>
    `;

    const info = await transporter.sendMail({
      from: emailFrom,
      to: emailTo,
      replyTo: email,
      subject: language === "cs"
        ? `Nová kontaktní poptávka - ${name}`
        : `New Contact Inquiry - ${name}`,
      html: emailBody,
    });

    return jsonResponse({
      success: true,
      message: "Contact form submitted successfully",
      messageId: info.messageId,
    }, 200);
  } catch (error) {
    console.error("Error processing contact form:", error);
    return jsonResponse({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }, 500);
  }
};
