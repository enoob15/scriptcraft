export const siteConfig = {
  name: 'ScriptCraft',
  domain: 'scriptcraft.boone51.com',
  tagline: 'Stop staring at blank pages. Start creating viral content.',
}

export function getAppUrl(): string {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }

  return 'http://localhost:3000'
}
