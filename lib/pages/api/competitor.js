// pages/api/competitor.js
import { generateCompetitorIntel } from '../../lib/ai';
export default async function handler(req, res) {
  try {
    const content = await generateCompetitorIntel();
    res.json({ success: true, content });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
}
