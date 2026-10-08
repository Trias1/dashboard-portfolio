import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 15000,
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

const FROM_NAME = process.env.MAIL_FROM_NAME || 'PortfolioKit';
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

export function escapeHtml(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Remove CR/LF (and other control chars) from values used in mail headers
function headerSafe(value: unknown, maxLength = 200): string {
  return String(value ?? '').replace(/[\r\n\t\0]+/g, ' ').trim().slice(0, maxLength);
}

function getSender() {
  const user = process.env.GMAIL_USER;
  const password = process.env.GMAIL_APP_PASSWORD;
  if (!user || !password) throw new Error('Mailer production configuration is missing');
  return { user, from: `"${FROM_NAME}" <${user}>` };
}

export async function sendVerificationEmail(email: string, name: string, token: string) {
  const sender = getSender();
  const verifyUrl = `${BASE_URL}/api/auth/verify/${encodeURIComponent(token)}`;
  await transporter.sendMail({
    from: sender.from,
    to: email,
    subject: 'Verify Your Email',
    html: `<div style="font-family:-apple-system,Segoe UI,Helvetica,Arial,sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;background:#ffffff;color:#141414;line-height:1.55"><p style="margin:0 0 24px;font-weight:600;font-size:16px">PortfolioKit</p><h1 style="margin:0 0 8px;font-size:22px">Halo, ${escapeHtml(name)}.</h1><p style="margin:0 0 20px">Tinggal satu langkah: konfirmasi email ini supaya akunmu aktif.</p><a href="${escapeHtml(verifyUrl)}" style="display:inline-block;background:#1f45c9;color:#ffffff;padding:11px 18px;border-radius:6px;text-decoration:none;font-weight:600;margin:8px 0 4px">Konfirmasi email</a><p style="margin:32px 0 0;padding-top:16px;border-top:1px solid #dcdcd5;color:#55555a;font-size:12px">Link ini berlaku 24 jam. Kalau kamu tidak merasa mendaftar, abaikan email ini.</p></div>`,
  });
}

export async function sendOTP(email: string, otp: string) {
  const sender = getSender();
  await transporter.sendMail({
    from: sender.from,
    to: email,
    subject: 'Your OTP Code',
    html: `<div style="font-family:-apple-system,Segoe UI,Helvetica,Arial,sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;background:#ffffff;color:#141414;line-height:1.55"><p style="margin:0 0 24px;font-weight:600;font-size:16px">PortfolioKit</p><h1 style="margin:0 0 8px;font-size:22px">Kode masuk kamu</h1><p style="margin:0 0 16px">Masukkan kode ini di halaman masuk:</p><p style="margin:0;font-family:ui-monospace,Menlo,Consolas,monospace;font-size:32px;font-weight:700;letter-spacing:6px">${escapeHtml(otp)}</p><p style="margin:32px 0 0;padding-top:16px;border-top:1px solid #dcdcd5;color:#55555a;font-size:12px">Kode berlaku 5 menit. Jangan berikan kode ini ke siapa pun.</p></div>`,
  });
}

export async function sendResetPassword(email: string, name: string, token: string) {
  const sender = getSender();
  const resetUrl = `${BASE_URL}/reset-password?token=${encodeURIComponent(token)}`;
  await transporter.sendMail({
    from: sender.from,
    to: email,
    subject: 'Reset Password - PortfolioKit',
    html: `<div style="font-family:-apple-system,Segoe UI,Helvetica,Arial,sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;background:#ffffff;color:#141414;line-height:1.55"><p style="margin:0 0 24px;font-weight:600;font-size:16px">PortfolioKit</p><h1 style="margin:0 0 8px;font-size:22px">Bikin password baru</h1><p style="margin:0 0 20px">Halo ${escapeHtml(name)}, ada permintaan reset password untuk akun PortfolioKit kamu.</p><a href="${escapeHtml(resetUrl)}" style="display:inline-block;background:#1f45c9;color:#ffffff;padding:11px 18px;border-radius:6px;text-decoration:none;font-weight:600;margin:8px 0 4px">Bikin password baru</a><p style="margin:32px 0 0;padding-top:16px;border-top:1px solid #dcdcd5;color:#55555a;font-size:12px">Link ini berlaku 1 jam. Kalau bukan kamu yang meminta, abaikan saja — password lama tetap berlaku.</p></div>`,
  });
}

export async function sendContactNotification(ownerEmail: string, name: string, email: string, message: string) {
  const sender = getSender();
  await transporter.sendMail({
    from: sender.from,
    to: headerSafe(ownerEmail, 320),
    replyTo: headerSafe(email, 320),
    subject: `New message from ${headerSafe(name, 100)} - PortfolioKit`,
    html: `<div style="font-family:-apple-system,Segoe UI,Helvetica,Arial,sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;background:#ffffff;color:#141414;line-height:1.55"><p style="margin:0 0 24px;font-weight:600;font-size:16px">PortfolioKit</p><h1 style="margin:0 0 16px;font-size:22px">Pesan baru dari portfolio kamu</h1><p style="margin:0">${escapeHtml(name)} &lt;${escapeHtml(email)}&gt;</p><p style="margin:12px 0 0;padding:12px 14px;border-left:3px solid #1f45c9;background:#fafaf7;white-space:pre-wrap">${escapeHtml(message)}</p><p style="margin:32px 0 0;padding-top:16px;border-top:1px solid #dcdcd5;color:#55555a;font-size:12px">Balas email ini untuk menjawab langsung ke pengirim.</p></div>`,
  });
}
