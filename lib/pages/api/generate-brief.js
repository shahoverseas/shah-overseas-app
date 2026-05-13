// pages/api/generate-brief.js
import { generateMorningBrief } from '../../lib/ai';
import { getInstagramProfile, getFacebookPage } from '../../lib/social';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  try {
    const [igData, fbData] = await Promise.all([
      getInstagramProfile().catch(() => ({})),
      getFacebookPage().catch(() => ({}))
    ]);
    const { trends, alerts } = req.body;
    const content = await generateMorningBrief(igData, fbData, trends || [], alerts || []);
    res.json({ success: true, content });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
}
