// lib/ai.js — Claude AI content generation

export async function generateContent(prompt, useWebSearch = false) {
  const body = {
    model: 'claude-sonnet-4-5',
    max_tokens: 3000,
    messages: [{ role: 'user', content: prompt }]
  };
  if (useWebSearch) {
    body.tools = [{ type: 'web_search_20250305', name: 'web_search' }];
  }
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify(body)
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error.message);
  let text = '';
  (data.content || []).forEach(b => { if (b.type === 'text') text += b.text; });
  return text;
}

export async function generateFastContent(prompt) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 800,
      tools: [{ type: 'web_search_20250305', name: 'web_search' }],
      messages: [{ role: 'user', content: prompt }]
    })
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error.message);
  let text = '';
  (data.content || []).forEach(b => { if (b.type === 'text') text += b.text; });
  return text;
}

// Parse JSON from AI response safely
export function parseJSON(text) {
  try {
    const clean = text
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim();
    const s = clean.indexOf('[');
    const e = clean.lastIndexOf(']');
    if (s !== -1 && e !== -1) return JSON.parse(clean.slice(s, e + 1));
    const os = clean.indexOf('{');
    const oe = clean.lastIndexOf('}');
    if (os !== -1 && oe !== -1) return JSON.parse(clean.slice(os, oe + 1));
    return null;
  } catch (err) {
    return null;
  }
}

const CITY = process.env.CITY || 'Nagpur';
const COUNTRIES = process.env.COUNTRIES || 'Germany, UK, Australia, Ireland, France, Netherlands, New Zealand, UAE, Singapore, Malaysia';
const YR = new Date().getFullYear();
const NEXT_YR = YR + 1;

const RULES = `
CRITICAL RULES:
- Instagram bio: MAX 150 chars — show [XX/150]
- Instagram caption: MAX 2200 chars — show [XXXX/2200]
- Instagram hashtags: MAX 30
- Facebook post: MAX 500 chars — show [XXX/500]
- Google Business post: MAX 1500 chars — show [XXXX/1500]
- TODAY is ${new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
- ONLY upcoming intakes/deadlines for ${YR}-${NEXT_YR} not yet passed
- POSITIVE content only — opportunities, not problems
- Every piece must drive DMs or calls to Shah Overseas
- Video tool: InShot (Android/Windows) or VN Video Editor (Android/Windows) — NOT CapCut
- Countries: ${COUNTRIES}
`;

export async function generateMorningBrief(igData, fbData, trends, alerts) {
  const igInfo = `@shah_overseas: ${igData.followers_count || 'unknown'} followers, ${igData.media_count || 'unknown'} posts`;
  const fbInfo = `Shah Overseas Facebook: ${fbData.fan_count || '15900'} likes`;
  const trendStr = (trends || []).slice(0, 8).map(t => t.term).join(', ') || 'not loaded';
  const alertStr = (alerts || []).filter(a => a.urgency !== 'cool').map(a => a.title).join(', ') || 'none';

  const prompt = `${RULES}
Create the complete morning execution pack for Shah Overseas team in ${CITY}.
Live data: ${igInfo}, ${fbInfo}
Maharashtra trends: ${trendStr}
Upcoming alerts: ${alertStr}

Output EXACTLY this structure:

## TODAY'S FOCUS
[One sentence: what to post today and why it generates leads]
Lead score: X/10

---

## STEP 1 — CANVA DESIGN
### Canva AI Prompt
[Detailed prompt to paste into Canva Magic Design — include style, colors #1A2B4A navy #D4AF7A gold, text to include, mood, exact layout. Specific enough that the design generates automatically]

### Canva Template Search
Search: "[exact search term in Canva]"
Edit only: 1) Headline → [exact text] 2) Subtext → [exact text] 3) Colors → keep navy + gold

### Grid Placement
Thumbnail color: #[hex] | Grid position tip: [advice]

---

## STEP 2 — VIDEO SCRIPT (InShot / VN)
### Script — say these exact words
[HOOK 0-3s]: Say: "[exact words]" | Screen: "[text overlay]"
[POINT 1, 4-10s]: Say: "[exact words]" | Screen: "[text overlay]"
[POINT 2, 11-18s]: Say: "[exact words]" | Screen: "[text overlay]"
[CTA, 19-30s]: Say: "[exact words]" | Screen: "[text overlay]"

### InShot Steps
1. Open InShot → New Video → import/record
2. Text → "[first overlay]" → Bold → White
3. Music → search "[song]" → 15% volume
4. Filter → [filter name]
5. Export → 1080p → 9:16 → Save

---

## STEP 3 — CAPTIONS
### Instagram Caption [XXXX/2200]
[Full caption — Gen Z tone]
[XXXX/2200 ok]
Hashtags (30): [all 30]
Post at: [day] [time] IST

### Facebook Post [XXX/500]
[Facebook version]
[XXX/500 ok]

### Google Business Post [XXXX/1500]
[GBP version with city + CTA]
[XXXX/1500 ok]

### WhatsApp Forward
[Under 200 chars casual text]

---

## STEP 4 — STORIES
Story 1: [text + poll: Option A vs Option B]
Story 2: [text + quiz question]
Story 3: [CTA story text]

---

## TODAY'S LEAD MAGNET
[One free thing to offer in DMs — e.g. "Germany university list 2025"]
DM keyword: [word students message to get it]`;

  return generateContent(prompt);
}

export async function generateAlerts() {
  const today = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
  const prompt = `Search for UPCOMING positive study abroad opportunities for Indian students as of ${today}.
Find ONLY: 1) Open scholarships with FUTURE deadlines in ${YR}-${NEXT_YR}, 2) UPCOMING intake windows still accepting applications, 3) Positive visa changes last 14 days for ${COUNTRIES}.
Only positive actionable opportunities. No past events.
Return ONLY JSON array: [{"title":"title","urgency":"hot or warm or cool","days":number,"topic":"scholarship or intake or visa","hook":"why act now in one line","source":"website"}]
Return [] if nothing real found.`;
  const text = await generateFastContent(prompt);
  return parseJSON(text) || [];
}

export async function generateTrends() {
  const today = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
  const prompt = `Search what is trending in Maharashtra India today ${today}. Find: 1) Top trending searches in Maharashtra on Google right now, 2) Study abroad news for Indian students this week, 3) Scholarship or visa updates for students going to ${COUNTRIES}.
Return ONLY valid JSON array: [{"term":"topic name","category":"trending or scholarship or visa or news","heat":"hot or warm or cool"}]
Maximum 20 real items only.`;
  const text = await generateFastContent(prompt);
  return parseJSON(text) || [];
}

export async function generateCompetitorIntel() {
  const prompt = `${RULES}
Search Google, Google Maps, and Justdial for the top study abroad consultancies in ${CITY}, Maharashtra.
Search terms: "study abroad consultancy Nagpur", "overseas education consultants Nagpur", "study abroad Nagpur".

## TOP COMPETITORS IN NAGPUR
For each real competitor you find (top 3-5 by reviews and presence):
- Name + area in Nagpur
- Countries they offer
- Google rating + review count
- Main strength + main weakness from reviews

## WHAT SHAH OVERSEAS DOES BETTER
For each competitor — one specific advantage (not generic)

## CONTENT GAPS THIS WEEK
3 topics none of them are covering — with exact reel hook for each

## 3 MOVES TO WIN THIS WEEK
Specific actions with expected lead generation impact`;
  return generateContent(prompt, true);
}
