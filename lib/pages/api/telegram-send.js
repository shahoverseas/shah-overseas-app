// pages/api/telegram-send.js
import { generateAlerts, generateMorningBrief, generateTrends } from '../../lib/ai';
import { sendTelegram, formatMorningTelegram, getInstagramProfile, getFacebookPage } from '../../lib/social';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  try {
    const [ig, fb, trends, alerts] = await Promise.all([
      getInstagramProfile().catch(() => ({})),
      getFacebookPage().catch(() => ({})),
      generateTrends().catch(() => []),
      generateAlerts().catch(() => [])
    ]);
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://shah-overseas.vercel.app';
    const msg = formatMorningTelegram(null, alerts, appUrl);
    await sendTelegram(msg);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
}
