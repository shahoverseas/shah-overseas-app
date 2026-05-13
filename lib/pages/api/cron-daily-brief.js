// pages/api/cron-daily-brief.js
// Add to vercel.json to run daily at 9am IST (3:30am UTC):
// { "crons": [{ "path": "/api/cron-daily-brief", "schedule": "30 3 * * *" }] }

import { generateAlerts, generateTrends } from '../../lib/ai';
import { sendTelegram, formatMorningTelegram } from '../../lib/social';

export default async function handler(req, res) {
  // Verify this is called by Vercel cron (security)
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).end();
  }
  try {
    const [trends, alerts] = await Promise.all([
      generateTrends().catch(() => []),
      generateAlerts().catch(() => [])
    ]);
    const appUrl = process.env.NEXT_PUBLIC_APP_URL;
    const msg = formatMorningTelegram(null, alerts, appUrl);
    await sendTelegram(msg);
    console.log('Daily brief sent at', new Date().toISOString());
    res.json({ success: true, alertsFound: alerts.length, trendsFound: trends.length });
  } catch (e) {
    console.error('Cron error:', e);
    res.status(500).json({ success: false, error: e.message });
  }
}
