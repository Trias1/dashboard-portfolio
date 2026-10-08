/**
 * Feature switches. The AI features (dashboard Advisor and the visitor chat on public
 * portfolios) are hidden until an AI provider is set up; set NEXT_PUBLIC_AI_ENABLED=true
 * to bring them back.
 */
export const AI_ENABLED = process.env.NEXT_PUBLIC_AI_ENABLED === 'true';
