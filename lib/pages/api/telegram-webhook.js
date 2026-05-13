// pages/api/telegram-webhook.js
// Set this as your Telegram webhook URL:
// https://api.telegram.org/bot{TOKEN}/setWebhook?url=https://your-app.vercel.app/api/telegram-webhook

import { generateAlerts, generateCompetitorIntel, generateMorningBrief, generateTrends } from '../../lib/ai';
import { sendTelegram, getInstagramProfile, getFacebookPage, formatAlertTelegram, formatMorningTelegram } from '../../lib/social';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(200).end();
  const update = req.body;
  const msg = update?.message;
  if (!msg) return res.status(200).end();

  const text = msg.text || '';
  const chatId = msg.chat.id.toString();

  // Save chat ID on first message (store in env or DB)
  console.log('Telegram chat ID:', chatId);

  try {
    if (text.startsWith('/start')) {
      await sendTelegram(`👋 *Welcome to Shah Overseas AI Bot!*\n\nCommands:\n/brief — Generate today's morning brief\n/alert — Check live opportunities\n/competitor — Search top Nagpur competitors\n/trends — Maharashtra trends today\n/help — Show all commands`);
    }
    else if (text.startsWith('/brief')) {
      await sendTelegram('⟳ Generating your morning brief...');
      const [ig, fb, trends, alerts] = await Promise.all([
        getInstagramProfile().catch(() => ({})),
        getFacebookPage().catch(() => ({})),
        generateTrends().catch(() => []),
        generateAlerts().catch(() => [])
      ]);
      const brief = await generateMorningBrief(ig, fb, trends, alerts);
      const appUrl = process.env.NEXT_PUBLIC_APP_URL;
      await sendTelegram(formatMorningTelegram(brief, alerts, appUrl));
      // Send first 3000 chars of brief
      if (brief) await sendTelegram('📋 *Brief Preview:*\n\n' + brief.slice(0, 3000) + (brief.length > 3000 ? '\n\n_Open app for full brief →_ ' + appUrl : ''));
    }
    else if (text.startsWith('/alert')) {
      await sendTelegram('⟳ Scanning real opportunities...');
      const alerts = await generateAlerts();
      if (!alerts.length) {
        await sendTelegram('✅ No urgent alerts today. All clear!');
      } else {
        for (const alert of alerts.slice(0, 3)) {
          await sendTelegram(formatAlertTelegram(alert));
        }
      }
    }
    else if (text.startsWith('/competitor')) {
      await sendTelegram('⟳ Searching top Nagpur competitors...');
      const intel = await generateCompetitorIntel();
      await sendTelegram('🔍 *COMPETITOR INTEL*\n\n' + intel.slice(0, 4000));
    }
    else if (text.startsWith('/trends')) {
      await sendTelegram('⟳ Fetching Maharashtra trends...');
      const trends = await generateTrends();
      let msg = '📊 *MAHARASHTRA TRENDS TODAY*\n\n';
      trends.slice(0, 15).forEach(t => {
        const icon = t.heat === 'hot' ? '🔥' : t.heat === 'warm' ? '🌡️' : '⭐';
        msg += `${icon} ${t.term}\n`;
      });
      await sendTelegram(msg);
    }
    else if (text.startsWith('/help')) {
      await sendTelegram(`*SHAH OVERSEAS BOT COMMANDS*\n\n/brief — Full morning brief\n/alert — Live opportunities\n/competitor — Top Nagpur firms intel\n/trends — Maharashtra trends\n\n_Bot sends daily brief at 9am IST automatically_`);
    }
  } catch (e) {
    await sendTelegram('⚠ Error: ' + e.message.slice(0, 100));
  }

  res.status(200).end();
}
