import nodemailer from "nodemailer";
import { env } from "../../config/env";
import type { Order, OrderStatus } from "../order/order.model";

function hasSmtpConfig(): boolean {
  return Boolean(env.smtpHost && env.smtpUser && env.smtpPass && env.smtpFrom);
}

function createTransporter(): nodemailer.Transporter | null {
  if (!hasSmtpConfig()) {
    return null;
  }

  return nodemailer.createTransport({
    host: env.smtpHost,
    port: env.smtpPort,
    secure: env.smtpPort === 465,
    auth: {
      user: env.smtpUser,
      pass: env.smtpPass,
    },
  });
}

function formatCurrency(value: number): string {
  return `$${value.toFixed(2)}`;
}

function orderItemsHtml(order: Order): string {
  return order.items
    .map(
      (item) =>
        `<li>${item.productName} — ${item.quantity} x ${formatCurrency(item.unitPrice)} = ${formatCurrency(item.lineTotal)}</li>`,
    )
    .join("");
}

async function sendEmail(input: {
  to: string;
  subject: string;
  text: string;
  html: string;
}): Promise<void> {
  const transporter = createTransporter();
  if (!transporter) {
    console.warn("Email skipped: SMTP is not configured.");
    return;
  }

  await transporter.sendMail({
    from: env.smtpFrom,
    to: input.to,
    subject: input.subject,
    text: input.text,
    html: input.html,
  });
}

export async function sendOrderPlacedEmail(input: {
  to: string;
  customerName: string;
  order: Order;
}): Promise<void> {
  const subject = `Order #${input.order.id} confirmed`;
  const text = [
    `Hi ${input.customerName},`,
    "",
    `Your order #${input.order.id} has been placed successfully.`,
    `Status: ${input.order.status}`,
    `Total: ${formatCurrency(input.order.total)}`,
    "",
    "Items:",
    ...input.order.items.map(
      (item) =>
        `- ${item.productName} (${item.quantity} x ${formatCurrency(item.unitPrice)}) = ${formatCurrency(item.lineTotal)}`,
    ),
    "",
    "Thank you for shopping with us.",
  ].join("\n");

  const html = `
    <div style="font-family: Arial, sans-serif; color: #0f172a;">
      <h2>Order Confirmed</h2>
      <p>Hi ${input.customerName},</p>
      <p>Your order <strong>#${input.order.id}</strong> has been placed successfully.</p>
      <p><strong>Status:</strong> ${input.order.status}</p>
      <p><strong>Total:</strong> ${formatCurrency(input.order.total)}</p>
      <p><strong>Items:</strong></p>
      <ul>${orderItemsHtml(input.order)}</ul>
      <p>Thank you for shopping with us.</p>
    </div>
  `;

  await sendEmail({
    to: input.to,
    subject,
    text,
    html,
  });
}

export async function sendOrderStatusUpdatedEmail(input: {
  to: string;
  customerName: string;
  order: Order;
  status: OrderStatus;
}): Promise<void> {
  const subject = `Order #${input.order.id} status updated to ${input.status}`;
  const text = [
    `Hi ${input.customerName},`,
    "",
    `Your order #${input.order.id} status is now: ${input.status}.`,
    `Order total: ${formatCurrency(input.order.total)}`,
    "",
    "Thanks for choosing us.",
  ].join("\n");

  const html = `
    <div style="font-family: Arial, sans-serif; color: #0f172a;">
      <h2>Order Status Update</h2>
      <p>Hi ${input.customerName},</p>
      <p>Your order <strong>#${input.order.id}</strong> status is now <strong>${input.status}</strong>.</p>
      <p><strong>Total:</strong> ${formatCurrency(input.order.total)}</p>
      <p>Thanks for choosing us.</p>
    </div>
  `;

  await sendEmail({
    to: input.to,
    subject,
    text,
    html,
  });
}
