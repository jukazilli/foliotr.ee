import type { FeedbackTicket } from "@/generated/prisma-client";
import { getEnv } from "@/lib/env";

type FeedbackEmailTicket = Pick<
  FeedbackTicket,
  | "number"
  | "kind"
  | "message"
  | "route"
  | "url"
  | "x"
  | "y"
  | "relativeX"
  | "relativeY"
  | "viewportWidth"
  | "viewportHeight"
  | "elementTag"
  | "elementId"
  | "elementClasses"
  | "elementText"
>;

function kindLabel(kind: FeedbackEmailTicket["kind"]) {
  return kind === "CORRECTION" ? "Correcao" : "Melhoria";
}

function buildFeedbackEmail(ticket: FeedbackEmailTicket) {
  const subject = `[LINKFOLIO] Feedback #${ticket.number} - ${kindLabel(ticket.kind)}`;
  const text = [
    `Ticket: #${ticket.number}`,
    `Tipo: ${kindLabel(ticket.kind)}`,
    `Rota: ${ticket.route}`,
    `URL: ${ticket.url}`,
    `Coordenadas: ${ticket.x}, ${ticket.y}`,
    `Coordenadas relativas: ${ticket.relativeX.toFixed(4)}, ${ticket.relativeY.toFixed(4)}`,
    `Viewport: ${ticket.viewportWidth}x${ticket.viewportHeight}`,
    `Elemento: ${ticket.elementTag ?? "-"}${ticket.elementId ? `#${ticket.elementId}` : ""}`,
    `Classes: ${ticket.elementClasses ?? "-"}`,
    `Texto do elemento: ${ticket.elementText ?? "-"}`,
    "",
    "Feedback:",
    ticket.message,
  ].join("\n");

  return { subject, text };
}

export async function sendFeedbackTicketEmail(ticket: FeedbackEmailTicket) {
  const env = getEnv();
  const to = env.FEEDBACK_EMAIL_TO;
  const apiKey = env.RESEND_API_KEY;

  if (!to || !apiKey) {
    console.info("[feedback-email] Email nao configurado; ticket armazenado.", {
      ticket: ticket.number,
      toConfigured: Boolean(to),
      providerConfigured: Boolean(apiKey),
    });
    return { sent: false, skipped: true };
  }

  const { subject, text } = buildFeedbackEmail(ticket);
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: env.FEEDBACK_EMAIL_FROM || "LINKFOLIO Feedback <onboarding@resend.dev>",
      to,
      subject,
      text,
    }),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    console.error("[feedback-email] Falha ao enviar feedback.", {
      status: response.status,
      body,
      ticket: ticket.number,
    });
    return { sent: false, skipped: false };
  }

  return { sent: true, skipped: false };
}
