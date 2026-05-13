// pages/api/trends.js
import { generateTrends } from '../../lib/ai';
export default async function handler(req, res) {
  try {
    const data = await generateTrends();
    res.json({ success: true, data });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message, data: [] });
  }
}
