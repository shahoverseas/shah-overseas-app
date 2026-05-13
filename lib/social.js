// lib/social.js — Instagram, Facebook, Telegram

// ── INSTAGRAM ──────────────────────────────────────────────────────────────
export async function getInstagramProfile() {
  const res = await fetch(
    `https://graph.facebook.com/v18.0/${process.env.INSTAGRAM_ACCOUNT_ID}?fields=id,name,biography,followers_count,follows_count,media_count,website&access_token=${process.env.META_ACCESS_TOKEN}`
  );
  return res.json();
}

export async function getFacebookPage() {
  const res = await fetch(
    `https://graph.facebook.com/v18.0/${process.env.FACEBOOK_PAGE_ID}?fields=name,fan_count,followers_count,about,category&access_token=${process.env.META_ACCESS_TOKEN}`
  );
  return res.json();
}

export async function getRecentPosts() {
  const res = await fetch(
    `https://graph.facebook.com/v18.0/${process.env.INSTAGRAM_ACCOUNT_ID}/media?fields=id,caption,media_type,timestamp,like_count,comments_count,thumbnail_url,media_url&limit=12&access_token=${process.env.META_ACCESS_TOKEN}`
  );
  const data = await res.json();
  return data.data || [];
}

// Post a photo to Instagram (requires image URL)
export async function postToInstagram(imageUrl, caption) {
  // Step 1: Create media container
  const containerRes = await fetch(
    `https://graph.facebook.com/v18.0/${process.env.INSTAGRAM_ACCOUNT_ID}/media`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        image_url: imageUrl,
        caption: caption,
        access_token: process.env.META_ACCESS_TOKEN
      })
    }
  );
  const container = await containerRes.json();
  if (container.error) throw new Error('IG container: ' + container.error.message);

  // Step 2: Wait 5 seconds then publish
  await new Promise(r => setTimeout(r, 5000));
  const publishRes = await fetch(
    `https://graph.facebook.com/v18.0/${process.env.INSTAGRAM_ACCOUNT_ID}/media_publish`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        creation_id: container.id,
        access_token: process.env.META_ACCESS_TOKEN
      })
    }
  );
  return publishRes.json();
}

// Post to Facebook Page
export async function postToFacebook(message, imageUrl) {
  const endpoint = imageUrl
    ? `https://graph.facebook.com/v18.0/${process.env.FACEBOOK_PAGE_ID}/photos`
    : `https://graph.facebook.com/v18.0/${process.env.FACEBOOK_PAGE_ID}/feed`;
  const body = imageUrl
    ? { url: imageUrl, caption: message, access_token: process.env.META_ACCESS_TOKEN }
    : { message: message, access_token: process.env.META_ACCESS_TOKEN };
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  return res.json();
}

// Post to Google Business Profile
export async function postToGBP(text) {
  // GBP posting requires Google My Business API
  // Returns instructions for now — full GBP API needs OAuth setup
  return { status: 'ready', text: text, note: 'Copy this to Google Business Profile → Add Update' };
}

// ── TELEGRAM BOT ───────────────────────────────────────────────────────────
export async function sendTelegram(message, parseMode = 'Markdown') {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) throw new Error('Telegram not configured');

  const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text: message,
      parse_mode: parseMode,
      disable_web_page_preview: false
    })
  });
  return res.json();
}

export function formatMorningTelegram(brief, alerts, appUrl) {
  const today = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' });
  const hotAlerts = (alerts || []).filter(a => a.urgency === 'hot' || a.urgency === 'warm').slice(0, 3);

  let msg = `☀️ *SHAH OVERSEAS — MORNING BRIEF*\n`;
  msg += `📅 ${today}\n\n`;

  if (hotAlerts.length > 0) {
    msg += `🔥 *URGENT ALERTS*\n`;
    hotAlerts.forEach(a => {
      msg += `• ${a.title}${a.days > 0 ? ` (${a.days} days left)` : ''}\n`;
      msg += `  _${a.hook}_\n`;
    });
    msg += '\n';
  }

  msg += `📱 *TODAY'S CONTENT READY*\n`;
  msg += `• Canva AI prompt ✓\n`;
  msg += `• 30-second video script ✓\n`;
  msg += `• Instagram caption ✓\n`;
  msg += `• Facebook post ✓\n`;
  msg += `• GBP post ✓\n\n`;

  msg += `👉 *Open app to copy-paste and post:*\n`;
  msg += `${appUrl || 'https://shah-overseas.vercel.app'}\n\n`;

  msg += `_Reply /post to auto-post today's content_\n`;
  msg += `_Reply /alert for today's opportunities_\n`;
  msg += `_Reply /competitor for intel on top Nagpur firms_`;

  return msg;
}

export function formatAlertTelegram(alert) {
  const emoji = alert.urgency === 'hot' ? '🔥' : alert.urgency === 'warm' ? '⚡' : '📌';
  let msg = `${emoji} *URGENT ALERT — SHAH OVERSEAS*\n\n`;
  msg += `*${alert.title}*\n`;
  if (alert.days > 0) msg += `⏰ ${alert.days} days remaining\n`;
  msg += `\n💡 ${alert.hook}\n`;
  msg += `\n📢 *Reel hook to use:*\n_"${alert.hook}"_\n`;
  msg += `\nSource: ${alert.source || 'live data'}\n`;
  msg += `\n👉 Open app to generate full content pack`;
  return msg;
}
