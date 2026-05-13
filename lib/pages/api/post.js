// pages/api/post.js
import { postToInstagram, postToFacebook } from '../../lib/social';
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { platform, caption, message, imageUrl } = req.body;
  try {
    let result;
    if (platform === 'instagram') {
      if (!imageUrl) return res.json({ success: false, error: 'Instagram requires an image URL. Upload image to get URL first.' });
      result = await postToInstagram(imageUrl, caption);
    } else if (platform === 'facebook') {
      result = await postToFacebook(message || caption, imageUrl);
    } else {
      return res.status(400).json({ success: false, error: 'Unknown platform' });
    }
    if (result.error) throw new Error(result.error.message);
    res.json({ success: true, result });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
}
