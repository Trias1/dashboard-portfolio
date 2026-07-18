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

export async function sendVerificationEmail(email: string, name: string, token: string) {
  const verifyUrl = `${BASE_URL}/api/auth/verify/${token}`;
  await transporter.sendMail({
    from: `"${FROM_NAME}" <${process.env.GMAIL_USER}>`,
    to: email,
    subject: 'Verify Your Email',
    html: `<div style="font-family:Arial,sans-serif;max-width:400px;margin:0 auto;padding:20px;background:#0f0f2a;color:white;border-radius:12px"><h2 style="color:#a855f7;">Welcome, ${name}!</h2><p>Thanks for registering! Please verify your email to activate your account.</p><a href="${verifyUrl}" style="display:block;text-align:center;background:#a855f7;color:white;padding:14px 24px;border-radius:8px;text-decoration:none;font-weight:bold;margin:20px 0">Verify Email</a><p style="color:#9ca3af;font-size:12px">This link expires in 24 hours.</p></div>`,
  });
}

export async function sendOTP(email: string, otp: string) {
  await transporter.sendMail({
    from: `"${FROM_NAME}" <${process.env.GMAIL_USER}>`,
    to: email,
    subject: 'Your OTP Code',
    html: `<div style="font-family:Arial,sans-serif;max-width:400px;margin:0 auto;padding:20px;background:#0f0f2a;color:white;border-radius:12px"><h2 style="color:#a855f7;">Verification Code</h2><p>Your OTP code is:</p><div style="font-size:36px;font-weight:bold;color:#a855f7;letter-spacing:8px;text-align:center;padding:20px;background:#1a1a3a;border-radius:8px;margin:20px 0">${otp}</div><p style="color:#9ca3af;font-size:12px">This code expires in 5 minutes.</p></div>`,
  });
}

export async function sendResetPassword(email: string, name: string, token: string) {
  const resetUrl = `${BASE_URL}/reset-password?token=${token}`;
  await transporter.sendMail({
    from: `"${FROM_NAME}" <${process.env.GMAIL_USER}>`,
    to: email,
    subject: 'Reset Password - PortfolioKit',
    html: `<div style="font-family:Arial,sans-serif;max-width:400px;margin:0 auto;padding:20px;background:#0f0f2a;color:white;border-radius:12px"><h2 style="color:#a855f7;">Reset Password</h2><p>Halo ${name}! Kamu meminta reset password akun PortfolioKit kamu.</p><a href="${resetUrl}" style="display:block;text-align:center;background:#a855f7;color:white;padding:14px 24px;border-radius:8px;text-decoration:none;font-weight:bold;margin:20px 0">Reset Password</a><p style="color:#9ca3af;font-size:12px">Link ini berlaku selama 1 jam.</p></div>`,
  });
}

export async function sendContactNotification(ownerEmail: string, name: string, email: string, message: string) {
  await transporter.sendMail({
    from: `"${FROM_NAME}" <${process.env.GMAIL_USER}>`,
    to: ownerEmail,
    subject: `New message from ${name} - PortfolioKit`,
    html: `<div style="font-family:Arial,sans-serif;max-width:500px;margin:0 auto;padding:20px"><h2 style="color:#a855f7">New Message!</h2><div style="background:#f8f9fa;border-radius:8px;padding:16px;margin:16px 0"><p><strong>From:</strong> ${name}</p><p><strong>Email:</strong> ${email}</p><p><strong>Message:</strong></p><p style="background:white;padding:12px;border-radius:6px;border-left:3px solid #a855f7">${message}</p></div></div>`,
  });
}

