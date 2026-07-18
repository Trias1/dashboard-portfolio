// NOTE: In production, use Redis/Vercel KV instead of Map
const otpStore = new Map<string, { otp: string; expires: number }>();
export default otpStore;
