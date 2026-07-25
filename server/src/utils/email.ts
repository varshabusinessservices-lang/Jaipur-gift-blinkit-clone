import nodemailer from 'nodemailer';
import { env } from '../config/env';

// For this project, env might not have SMTP vars defined yet, but we'll use process.env as fallback
const smtpHost = process.env.SMTP_HOST || '';
const smtpPort = parseInt(process.env.SMTP_PORT || '587');
const smtpUser = process.env.SMTP_USER || '';
const smtpPass = process.env.SMTP_PASS || '';
const smtpFrom = process.env.SMTP_FROM || 'no-reply@example.com';
const showOtp = process.env.DEV_SHOW_OTP === 'true';

let transporter: nodemailer.Transporter | null = null;

if (smtpHost && smtpUser) {
  transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpPort === 465,
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
  });
}

export const sendEmail = async (to: string, subject: string, html: string, text: string) => {
  if (transporter) {
    await transporter.sendMail({
      from: smtpFrom,
      to,
      subject,
      html,
      text,
    });
  } else {
    console.log(`[DEV EMAIL ADAPTER] Email intended for ${to}`);
    console.log(`Subject: ${subject}`);
    if (showOtp) {
      console.log(`Body (Text): \n${text}`);
    } else {
      console.log(`(Email body hidden. Set DEV_SHOW_OTP=true to see it.)`);
    }
  }
};
