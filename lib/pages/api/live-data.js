// pages/api/live-data.js
import { getInstagramProfile, getFacebookPage, getRecentPosts } from '../../lib/social';
export default async function handler(req, res) {
  const [ig, fb, posts] = await Promise.all([
    getInstagramProfile().catch(() => ({})),
    getFacebookPage().catch(() => ({})),
    getRecentPosts().catch(() => [])
  ]);
  res.json({ ig, fb, posts });
}
