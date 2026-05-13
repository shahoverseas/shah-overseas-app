// pages/api/alerts.js
import { generateAlerts } from '../../lib/ai';
export default async function handler(req, res) {
  try {
    const data = await generateAlerts();
    res.json({ success: true, data });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message, data: [] });
  }
}
