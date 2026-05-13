# SHAH OVERSEAS — WEB APP SETUP GUIDE
# Complete in 30 minutes. All free.

## WHAT YOU GET
- Live web app at https://your-name.vercel.app (open on phone)
- Telegram bot sends you morning brief daily at 9am
- One tap to post to Facebook
- Real trends, real alerts, real competitor intel

---

## STEP 1 — GET TELEGRAM BOT TOKEN (5 minutes)
1. Open Telegram → search @BotFather → start chat
2. Send: /newbot
3. Name it: Shah Overseas AI
4. Username: ShahOverseasAI_bot (or any available)
5. BotFather gives you a TOKEN like: 7123456789:AAHxxxxxxxx
6. Save this token

## GET YOUR TELEGRAM CHAT ID
1. Search @userinfobot in Telegram
2. Start it — it shows your Chat ID (a number like 987654321)
3. Save this Chat ID

---

## STEP 2 — DEPLOY TO VERCEL (10 minutes)
1. Go to github.com → Create new repository → name: shah-overseas-app → Public
2. Upload all files from this folder to the repo
3. Go to vercel.com → Sign up free with GitHub
4. Click "New Project" → Import your github repo
5. Click Deploy → wait 2 minutes

---

## STEP 3 — ADD ENVIRONMENT VARIABLES IN VERCEL (5 minutes)
In Vercel dashboard → Your project → Settings → Environment Variables
Add each of these:

| Variable | Value |
|----------|-------|
| ANTHROPIC_API_KEY | sk-ant-api03-... (from console.anthropic.com) |
| TELEGRAM_BOT_TOKEN | 7123456789:AAHxxxxxxxx (from BotFather) |
| TELEGRAM_CHAT_ID | 987654321 (from userinfobot) |
| META_ACCESS_TOKEN | EAASzr6... (your existing token) |
| INSTAGRAM_ACCOUNT_ID | 17841405870421951 |
| FACEBOOK_PAGE_ID | 103657809286941 |
| NEXT_PUBLIC_APP_URL | https://your-project.vercel.app |
| CRON_SECRET | any-random-string-you-choose |

Then click "Redeploy" in Vercel.

---

## STEP 4 — SET UP TELEGRAM WEBHOOK (2 minutes)
After deploying, open this URL in browser (replace with your details):
https://api.telegram.org/bot{YOUR_BOT_TOKEN}/setWebhook?url=https://your-project.vercel.app/api/telegram-webhook

You should see: {"ok":true,"result":true}

---

## STEP 5 — TEST EVERYTHING (5 minutes)
1. Open your Vercel URL on phone — dashboard should load
2. Open Telegram → find your bot → send /start
3. Send /brief — should generate morning brief
4. Send /alert — should show real opportunities
5. Send /trends — should show Maharashtra trends
6. Back in web app → click "☀ Generate Morning Brief"

---

## DAILY WORKFLOW (2 minutes every morning)
1. Telegram sends you brief at 9am automatically
2. Open the link in message
3. Click each step → COPY → paste in Canva/InShot/Instagram
4. Tap "POST TO FB" for Facebook
5. Done

---

## MONTHLY COSTS
| Service | Cost |
|---------|------|
| Vercel hosting | FREE |
| Telegram bot | FREE |
| Meta API | FREE |
| Anthropic API | ~$5-10/month (~150-300 briefs) |
| **Total** | **~₹400-800/month** |

---

## COMMANDS YOUR TELEGRAM BOT UNDERSTANDS
/brief — Full morning execution pack
/alert — Real upcoming scholarships + intakes
/competitor — Top Nagpur study abroad firms intel
/trends — Maharashtra trending topics today
/help — Show all commands

---

## INSTAGRAM POSTING NOTE
Instagram API requires an image URL (hosted online) to post.
Workflow: Create design in Canva → Download → Upload to imgbb.com (free) → Copy URL → paste in app

For Facebook: tap "POST TO FB" button directly — no image needed for text posts.

---

## TROUBLESHOOTING
- "Telegram not configured" → Check TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID in Vercel env vars
- "IG token expired" → Re-generate at developers.facebook.com/tools/explorer
- "Credit balance" → Add $10 at console.anthropic.com/settings/billing
- App not loading → Check Vercel deployment logs for errors
