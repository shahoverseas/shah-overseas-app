// pages/index.js — Main dashboard
import { useState, useEffect } from 'react';
import Head from 'next/head';

export default function Home() {
  const [brief, setBrief] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [trends, setTrends] = useState([]);
  const [igData, setIgData] = useState({});
  const [fbData, setFbData] = useState({});
  const [recentPosts, setRecentPosts] = useState([]);
  const [competitor, setCompetitor] = useState(null);
  const [activeTab, setActiveTab] = useState('brief');
  const [loading, setLoading] = useState({});
  const [posting, setPosting] = useState({});
  const [postStatus, setPostStatus] = useState({});
  const [tickerIndex, setTickerIndex] = useState(0);
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    loadLiveData();
    const interval = setInterval(() => setTickerIndex(i => i + 1), 3000);
    return () => clearInterval(interval);
  }, []);

  async function loadLiveData() {
    const res = await fetch('/api/live-data');
    const data = await res.json();
    if (data.ig) setIgData(data.ig);
    if (data.fb) setFbData(data.fb);
    if (data.posts) setRecentPosts(data.posts);
  }

  async function generateBrief() {
    setLoading(l => ({ ...l, brief: true }));
    setActiveTab('brief');
    try {
      const [trendsRes, alertsRes] = await Promise.all([
        fetch('/api/trends').then(r => r.json()),
        fetch('/api/alerts').then(r => r.json())
      ]);
      setTrends(trendsRes.data || []);
      setAlerts(alertsRes.data || []);
      const briefRes = await fetch('/api/generate-brief', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trends: trendsRes.data, alerts: alertsRes.data })
      });
      const data = await briefRes.json();
      setBrief(data.content);
    } catch (e) {
      alert('Error: ' + e.message);
    }
    setLoading(l => ({ ...l, brief: false }));
  }

  async function generateCompetitor() {
    setLoading(l => ({ ...l, competitor: true }));
    setActiveTab('competitor');
    const res = await fetch('/api/competitor');
    const data = await res.json();
    setCompetitor(data.content);
    setLoading(l => ({ ...l, competitor: false }));
  }

  async function postToInstagram(caption) {
    setPosting(p => ({ ...p, ig: true }));
    const res = await fetch('/api/post', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ platform: 'instagram', caption })
    });
    const data = await res.json();
    setPostStatus(s => ({ ...s, ig: data.success ? '✓ Posted to Instagram!' : '⚠ ' + data.error }));
    setPosting(p => ({ ...p, ig: false }));
  }

  async function postToFacebook(message) {
    setPosting(p => ({ ...p, fb: true }));
    const res = await fetch('/api/post', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ platform: 'facebook', message })
    });
    const data = await res.json();
    setPostStatus(s => ({ ...s, fb: data.success ? '✓ Posted to Facebook!' : '⚠ ' + data.error }));
    setPosting(p => ({ ...p, fb: false }));
  }

  async function sendTelegramBrief() {
    const res = await fetch('/api/telegram-send', { method: 'POST' });
    const data = await res.json();
    alert(data.success ? '✓ Brief sent to Telegram!' : 'Error: ' + data.error);
  }

  function copyText(text, id) {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  }

  function parseBriefSections(text) {
    if (!text) return [];
    return text.split(/^## /m).filter(s => s.trim()).map(s => {
      const lines = s.split('\n');
      const title = lines[0].trim();
      const body = lines.slice(1).join('\n').trim();
      const subsections = body.split(/^### /m).filter(s => s.trim()).map(sub => {
        const sl = sub.split('\n');
        return { title: sl[0].trim(), body: sl.slice(1).join('\n').trim() };
      });
      return { title, body, subsections };
    });
  }

  const sections = parseBriefSections(brief);
  const todayDate = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' });
  const activeTrend = trends[tickerIndex % (trends.length || 1)];

  return (
    <>
      <Head>
        <title>Shah Overseas — Morning Brief</title>
        <meta name="viewport" content="width=device-width, initial-scale=1"/>
        <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet"/>
      </Head>

      <div style={styles.app}>
        {/* HEADER */}
        <div style={styles.header}>
          <div style={styles.headerLeft}>
            <span style={styles.logo}>SHAH//OS</span>
            <span style={styles.badge}>LIVE</span>
          </div>
          <div style={styles.headerCenter}>
            <div style={styles.dateText}>{todayDate.toUpperCase()}</div>
            <div style={styles.subText}>DAILY COMMAND CENTER</div>
          </div>
          <div style={styles.headerRight}>
            <button style={styles.tgBtn} onClick={sendTelegramBrief}>📱 SEND TO TELEGRAM</button>
          </div>
        </div>

        {/* STATS BAR */}
        <div style={styles.statsBar}>
          <div style={styles.statItem}>
            <span style={styles.statKey}>IG FOLLOWERS</span>
            <span style={styles.statVal}>{igData.followers_count ? (igData.followers_count/1000).toFixed(1)+'K' : '—'}</span>
          </div>
          <div style={styles.statItem}>
            <span style={styles.statKey}>IG POSTS</span>
            <span style={styles.statVal}>{igData.media_count || '—'}</span>
          </div>
          <div style={styles.statItem}>
            <span style={styles.statKey}>FB LIKES</span>
            <span style={{...styles.statVal, color: '#00e87a'}}>{fbData.fan_count ? (fbData.fan_count/1000).toFixed(1)+'K' : '15.9K'}</span>
          </div>
          <div style={styles.statItem}>
            <span style={styles.statKey}>ALERTS</span>
            <span style={{...styles.statVal, color: alerts.filter(a=>a.urgency!=='cool').length > 0 ? '#ff5252' : '#3d5a68'}}>{alerts.filter(a=>a.urgency!=='cool').length || '—'}</span>
          </div>
          <div style={styles.statItem}>
            <span style={styles.statKey}>MAHARASHTRA TREND</span>
            <span style={{...styles.statVal, color: '#ffc107', fontSize: '11px', maxWidth: '200px', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis'}}>{activeTrend ? activeTrend.term : 'Loading...'}</span>
          </div>
        </div>

        {/* ALERT BANNER */}
        {alerts.filter(a => a.urgency === 'hot').length > 0 && (
          <div style={styles.alertBanner}>
            <span style={styles.alertDot}></span>
            <span>🔥 {alerts.find(a => a.urgency === 'hot')?.title} — {alerts.find(a => a.urgency === 'hot')?.days} days left</span>
          </div>
        )}

        {/* MAIN BUTTONS */}
        <div style={styles.mainBtns}>
          <button style={styles.morningBtn} onClick={generateBrief} disabled={loading.brief}>
            {loading.brief ? '⟳ GENERATING...' : '☀ GENERATE MORNING BRIEF'}
          </button>
          <button style={styles.secondaryBtn} onClick={generateCompetitor} disabled={loading.competitor}>
            {loading.competitor ? '⟳ SEARCHING...' : '🔍 COMPETITOR INTEL'}
          </button>
        </div>

        {/* TABS */}
        <div style={styles.tabs}>
          {['brief', 'competitor', 'posts', 'alerts'].map(tab => (
            <button key={tab} style={activeTab === tab ? styles.tabActive : styles.tab} onClick={() => setActiveTab(tab)}>
              {tab === 'brief' ? '☀ MORNING BRIEF' : tab === 'competitor' ? '🔍 COMPETITORS' : tab === 'posts' ? '📸 RECENT POSTS' : '🔥 ALERTS'}
            </button>
          ))}
        </div>

        {/* CONTENT */}
        <div style={styles.content}>

          {/* MORNING BRIEF TAB */}
          {activeTab === 'brief' && (
            <div>
              {!brief && !loading.brief && (
                <div style={styles.emptyState}>
                  <div style={styles.emptyIcon}>☀</div>
                  <div style={styles.emptyTitle}>GOOD MORNING, SHAH OVERSEAS</div>
                  <div style={styles.emptyDesc}>
                    Click <strong>☀ Generate Morning Brief</strong> to get your complete daily execution pack.<br/><br/>
                    You'll get: Canva AI prompt → Video script → All captions → Stories → Lead magnet
                  </div>
                  <button style={styles.morningBtn} onClick={generateBrief}>☀ GENERATE MORNING BRIEF</button>
                </div>
              )}
              {loading.brief && (
                <div style={styles.loadingState}>
                  <div style={styles.loadingIcon}>⬡</div>
                  <div>Generating your morning brief with real AI...</div>
                  <div style={styles.loadingBar}><div style={styles.loadingFill}/></div>
                </div>
              )}
              {brief && sections.map((section, si) => (
                <div key={si} style={styles.card}>
                  <div style={styles.cardHeader}>
                    <span style={{
                      ...styles.cardTitle,
                      color: section.title.includes('DESIGN') ? '#c084fc' :
                             section.title.includes('VIDEO') ? '#00d4ff' :
                             section.title.includes('CAPTION') ? '#00e87a' :
                             section.title.includes('STORIES') ? '#ffc107' :
                             section.title.includes('LEAD') ? '#f87c6b' : '#d4af7a'
                    }}>{section.title}</span>
                    {/* Platform post buttons */}
                    {section.title.includes('CAPTION') && (
                      <div style={{display:'flex',gap:'6px'}}>
                        <button style={styles.postBtn} onClick={() => postToFacebook(extractFBPost(brief))} disabled={posting.fb}>
                          {posting.fb ? '...' : '👍 POST TO FB'}
                        </button>
                      </div>
                    )}
                  </div>
                  {/* Sub-sections with copy buttons */}
                  {section.subsections.length > 0 ? section.subsections.map((sub, ssi) => (
                    <div key={ssi} style={styles.subSection}>
                      <div style={styles.subTitle}>{sub.title}</div>
                      <div style={styles.copyBlock}>
                        <pre style={styles.copyText}>{sub.body}</pre>
                        <button style={copiedId === `${si}-${ssi}` ? styles.copiedBtn : styles.copyBtn}
                          onClick={() => copyText(sub.body, `${si}-${ssi}`)}>
                          {copiedId === `${si}-${ssi}` ? '✓ COPIED' : 'COPY'}
                        </button>
                      </div>
                      {/* Canva buttons */}
                      {sub.title.includes('Canva') && (
                        <div style={styles.appLinks}>
                          <a style={styles.appLink} href="https://www.canva.com/create/ai-image-generator/" target="_blank">✨ Open Canva AI →</a>
                          <a style={styles.appLink} href="https://www.canva.com/templates/?query=instagram+reel+education+dark" target="_blank">🔍 Canva Templates →</a>
                        </div>
                      )}
                      {/* Video app buttons */}
                      {(sub.title.includes('InShot') || sub.title.includes('Video') || sub.title.includes('Script')) && (
                        <div style={styles.appLinks}>
                          <a style={{...styles.appLink, background:'rgba(0,212,255,0.08)',borderColor:'rgba(0,212,255,0.2)',color:'#00d4ff'}} href="https://play.google.com/store/apps/details?id=com.camerasideas.instashot" target="_blank">📱 InShot (Android) →</a>
                          <a style={{...styles.appLink, background:'rgba(0,232,122,0.08)',borderColor:'rgba(0,232,122,0.2)',color:'#00e87a'}} href="https://play.google.com/store/apps/details?id=com.frontrow.vlog" target="_blank">🎬 VN Video (Android) →</a>
                        </div>
                      )}
                    </div>
                  )) : (
                    <div style={styles.copyBlock}>
                      <pre style={styles.copyText}>{section.body}</pre>
                      <button style={copiedId === `${si}` ? styles.copiedBtn : styles.copyBtn}
                        onClick={() => copyText(section.body, `${si}`)}>
                        {copiedId === `${si}` ? '✓ COPIED' : 'COPY'}
                      </button>
                    </div>
                  )}
                  {postStatus.ig && section.title.includes('CAPTION') && <div style={styles.postStatus}>{postStatus.ig}</div>}
                  {postStatus.fb && section.title.includes('CAPTION') && <div style={styles.postStatus}>{postStatus.fb}</div>}
                </div>
              ))}
            </div>
          )}

          {/* COMPETITOR TAB */}
          {activeTab === 'competitor' && (
            <div>
              {!competitor && !loading.competitor && (
                <div style={styles.emptyState}>
                  <div style={styles.emptyIcon}>🔍</div>
                  <div style={styles.emptyTitle}>COMPETITOR INTELLIGENCE</div>
                  <div style={styles.emptyDesc}>Searches top study abroad consultancies in Nagpur live — finds their Google ratings, weaknesses, and what Shah Overseas does better.</div>
                  <button style={styles.secondaryBtn} onClick={generateCompetitor}>🔍 SEARCH COMPETITORS NOW</button>
                </div>
              )}
              {loading.competitor && <div style={styles.loadingState}><div style={styles.loadingIcon}>🔍</div><div>Searching Nagpur competitors live...</div></div>}
              {competitor && <div style={styles.markdownContent} dangerouslySetInnerHTML={{__html: renderMD(competitor)}}/>}
            </div>
          )}

          {/* RECENT POSTS TAB */}
          {activeTab === 'posts' && (
            <div>
              <div style={styles.sectionTitle}>RECENT INSTAGRAM POSTS</div>
              {recentPosts.length === 0 ? (
                <div style={styles.emptyState}><div style={styles.emptyDesc}>Posts will appear here after connecting Instagram.</div></div>
              ) : (
                <div style={styles.postsGrid}>
                  {recentPosts.map(post => (
                    <div key={post.id} style={styles.postCard}>
                      {post.media_url && <img src={post.media_url} alt="Post" style={styles.postImg}/>}
                      <div style={styles.postMeta}>
                        <span>❤ {post.like_count || 0}</span>
                        <span>💬 {post.comments_count || 0}</span>
                        <span style={{fontSize:'10px',color:'#3d5a68'}}>{post.media_type}</span>
                      </div>
                      {post.caption && <div style={styles.postCaption}>{post.caption.slice(0, 80)}...</div>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ALERTS TAB */}
          {activeTab === 'alerts' && (
            <div>
              <div style={styles.sectionTitle}>LIVE UPCOMING OPPORTUNITIES</div>
              {alerts.length === 0 ? (
                <div style={styles.emptyState}><div style={styles.emptyDesc}>Generate morning brief to load real upcoming alerts.</div></div>
              ) : alerts.map((alert, i) => (
                <div key={i} style={{...styles.alertCard, borderLeftColor: alert.urgency==='hot'?'#ff5252':alert.urgency==='warm'?'#ffc107':'#00e87a'}}>
                  <div style={styles.alertTitle}>{alert.urgency==='hot'?'🔥':alert.urgency==='warm'?'⚡':'📌'} {alert.title}</div>
                  {alert.days > 0 && <div style={styles.alertDays}>⏰ {alert.days} days remaining</div>}
                  <div style={styles.alertHook}>{alert.hook}</div>
                  <div style={styles.alertSource}>Source: {alert.source}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function extractFBPost(brief) {
  const match = brief.match(/### Facebook Post[\s\S]*?\n([\s\S]*?)\[(\d+)\/500/);
  return match ? match[1].trim() : brief.slice(0, 490);
}

function renderMD(t) {
  if (!t) return '';
  return t
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
    .replace(/^## (.+)$/gm,'<h2 style="color:#00d4ff;font-size:16px;border-bottom:1px solid rgba(0,212,255,0.15);padding-bottom:6px;margin:20px 0 10px;">$1</h2>')
    .replace(/^### (.+)$/gm,'<h3 style="color:#d4af7a;font-size:13px;margin:12px 0 6px;">$1</h3>')
    .replace(/\*\*(.+?)\*\*/g,'<strong style="color:#eef4f7;">$1</strong>')
    .replace(/\*(.+?)\*/g,'<em style="color:#d4af7a;">$1</em>')
    .replace(/^- (.+)$/gm,'<li style="padding:4px 0 4px 14px;position:relative;color:#cce0ea;">› $1</li>')
    .replace(/((<li[^>]*>.*<\/li>\n?)+)/g,'<ul style="list-style:none;margin:6px 0 10px;padding:0;">$1</ul>')
    .replace(/---/g,'<hr style="border:none;border-top:1px solid rgba(0,212,255,0.1);margin:14px 0;"/>')
    .replace(/\n{2,}/g,'</p><p style="font-size:14px;color:#cce0ea;line-height:1.8;margin-bottom:8px;">')
    .replace(/<p[^>]*>(<h[23]|<ul|<hr)/g,'$1')
    .replace(/(<\/h[23]>|<\/ul>|<hr\/>)<\/p>/g,'$1');
}

// ── STYLES ──────────────────────────────────────────────────────────────────
const styles = {
  app: { minHeight: '100vh', background: '#070b0e', color: '#eef4f7', fontFamily: "'Space Grotesk', sans-serif" },
  header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px', height: '52px', borderBottom: '1px solid rgba(0,212,255,0.1)', background: 'rgba(7,11,14,0.98)', position: 'sticky', top: 0, zIndex: 50 },
  headerLeft: { display: 'flex', alignItems: 'center', gap: '8px' },
  logo: { fontFamily: 'monospace', fontWeight: 900, fontSize: '20px', color: '#00d4ff', letterSpacing: '3px' },
  badge: { background: 'linear-gradient(135deg,#d4af7a,#e8c87a)', color: '#0a0a0f', fontFamily: 'monospace', fontSize: '9px', fontWeight: 700, padding: '3px 8px', borderRadius: '3px', letterSpacing: '1px' },
  headerCenter: { textAlign: 'center' },
  dateText: { fontFamily: 'monospace', fontSize: '11px', color: '#00d4ff', letterSpacing: '1px' },
  subText: { fontFamily: 'monospace', fontSize: '9px', color: '#3d5a68', marginTop: '2px' },
  headerRight: {},
  tgBtn: { padding: '7px 14px', background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.2)', color: '#00d4ff', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 600, fontFamily: "'Space Grotesk',sans-serif" },
  statsBar: { display: 'flex', alignItems: 'center', padding: '0 20px', height: '34px', borderBottom: '1px solid rgba(0,212,255,0.05)', background: '#0d1419', overflowX: 'auto', gap: 0 },
  statItem: { display: 'flex', alignItems: 'center', gap: '6px', padding: '0 14px', borderRight: '1px solid rgba(0,212,255,0.05)', flexShrink: 0 },
  statKey: { fontFamily: 'monospace', fontSize: '9px', color: '#3d5a68', letterSpacing: '0.8px' },
  statVal: { fontWeight: 700, color: '#00d4ff', fontSize: '12px' },
  alertBanner: { display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 20px', background: 'rgba(255,82,82,0.06)', borderBottom: '1px solid rgba(255,82,82,0.2)', fontSize: '13px', fontWeight: 600, color: '#eef4f7' },
  alertDot: { width: '8px', height: '8px', borderRadius: '50%', background: '#ff5252', boxShadow: '0 0 8px #ff5252', display: 'inline-block' },
  mainBtns: { display: 'flex', gap: '10px', padding: '14px 20px', borderBottom: '1px solid rgba(0,212,255,0.05)', background: '#0d1419' },
  morningBtn: { flex: 2, padding: '12px', background: 'linear-gradient(135deg,rgba(212,175,122,0.15),rgba(212,175,122,0.05))', border: '1px solid #d4af7a', color: '#d4af7a', fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: '14px', cursor: 'pointer', borderRadius: '4px', letterSpacing: '0.5px' },
  secondaryBtn: { flex: 1, padding: '12px', background: 'transparent', border: '1px solid rgba(0,212,255,0.2)', color: '#00d4ff', fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600, fontSize: '13px', cursor: 'pointer', borderRadius: '4px' },
  tabs: { display: 'flex', borderBottom: '1px solid rgba(0,212,255,0.1)', background: '#0d1419', overflowX: 'auto' },
  tab: { padding: '10px 16px', background: 'transparent', border: 'none', borderBottom: '2px solid transparent', color: '#3d5a68', fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600, fontSize: '12px', cursor: 'pointer', whiteSpace: 'nowrap', letterSpacing: '0.5px' },
  tabActive: { padding: '10px 16px', background: 'transparent', border: 'none', borderBottom: '2px solid #00d4ff', color: '#00d4ff', fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600, fontSize: '12px', cursor: 'pointer', whiteSpace: 'nowrap', letterSpacing: '0.5px' },
  content: { padding: '20px', maxWidth: '900px', margin: '0 auto' },
  emptyState: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '300px', gap: '14px', textAlign: 'center', padding: '32px' },
  emptyIcon: { fontSize: '48px', color: '#d4af7a' },
  emptyTitle: { fontFamily: 'monospace', fontSize: '14px', letterSpacing: '2px', color: '#d4af7a' },
  emptyDesc: { fontSize: '14px', color: '#3d5a68', lineHeight: 1.8, maxWidth: '420px' },
  loadingState: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', padding: '60px 20px', textAlign: 'center', color: '#8aaab8' },
  loadingIcon: { fontSize: '40px', color: '#00d4ff' },
  loadingBar: { width: '200px', height: '2px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', overflow: 'hidden' },
  loadingFill: { height: '100%', background: 'linear-gradient(90deg,#00d4ff,#00e87a)', animation: 'none', width: '60%' },
  card: { background: '#111c24', border: '1px solid rgba(0,212,255,0.1)', borderRadius: '6px', marginBottom: '14px', overflow: 'hidden' },
  cardHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: '1px solid rgba(0,212,255,0.05)' },
  cardTitle: { fontFamily: 'monospace', fontSize: '11px', letterSpacing: '1px', fontWeight: 700 },
  postBtn: { padding: '5px 12px', background: 'rgba(0,232,122,0.08)', border: '1px solid rgba(0,232,122,0.25)', color: '#00e87a', borderRadius: '3px', cursor: 'pointer', fontSize: '11px', fontWeight: 600, fontFamily: "'Space Grotesk',sans-serif" },
  subSection: { padding: '12px 16px', borderBottom: '1px solid rgba(0,212,255,0.05)' },
  subTitle: { fontFamily: 'monospace', fontSize: '9px', color: '#3d5a68', letterSpacing: '1.5px', marginBottom: '8px' },
  copyBlock: { background: '#15222c', border: '1px solid rgba(0,212,255,0.08)', borderRadius: '4px', padding: '12px 14px', position: 'relative' },
  copyText: { fontSize: '13px', color: '#eef4f7', lineHeight: 1.8, whiteSpace: 'pre-wrap', wordBreak: 'break-word', margin: 0, fontFamily: "'Space Grotesk',sans-serif", paddingRight: '60px' },
  copyBtn: { position: 'absolute', top: '10px', right: '10px', padding: '4px 10px', background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.25)', color: '#00d4ff', fontFamily: 'monospace', fontSize: '9px', cursor: 'pointer', borderRadius: '2px' },
  copiedBtn: { position: 'absolute', top: '10px', right: '10px', padding: '4px 10px', background: 'rgba(0,232,122,0.1)', border: '1px solid rgba(0,232,122,0.3)', color: '#00e87a', fontFamily: 'monospace', fontSize: '9px', cursor: 'pointer', borderRadius: '2px' },
  appLinks: { display: 'flex', gap: '8px', marginTop: '10px', flexWrap: 'wrap' },
  appLink: { display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '7px 12px', background: 'rgba(192,132,252,0.1)', border: '1px solid rgba(192,132,252,0.2)', color: '#c084fc', borderRadius: '3px', fontSize: '12px', fontWeight: 600, textDecoration: 'none', cursor: 'pointer' },
  postStatus: { padding: '8px 16px', fontSize: '12px', color: '#00e87a', fontFamily: 'monospace' },
  sectionTitle: { fontFamily: 'monospace', fontSize: '10px', color: '#3d5a68', letterSpacing: '2px', marginBottom: '14px' },
  markdownContent: { fontSize: '14px', lineHeight: 1.8, color: '#cce0ea' },
  postsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '10px' },
  postCard: { background: '#111c24', border: '1px solid rgba(0,212,255,0.1)', borderRadius: '6px', overflow: 'hidden' },
  postImg: { width: '100%', aspectRatio: '1', objectFit: 'cover' },
  postMeta: { display: 'flex', gap: '10px', padding: '8px', fontSize: '12px', color: '#8aaab8' },
  postCaption: { padding: '0 8px 8px', fontSize: '11px', color: '#3d5a68', lineHeight: 1.4 },
  alertCard: { background: '#111c24', border: '1px solid rgba(0,212,255,0.1)', borderLeft: '4px solid #ff5252', borderRadius: '6px', padding: '14px 16px', marginBottom: '10px' },
  alertTitle: { fontSize: '14px', fontWeight: 700, color: '#eef4f7', marginBottom: '4px' },
  alertDays: { fontSize: '12px', color: '#ffc107', marginBottom: '6px', fontFamily: 'monospace' },
  alertHook: { fontSize: '13px', color: '#8aaab8', lineHeight: 1.6, marginBottom: '6px', fontStyle: 'italic' },
  alertSource: { fontSize: '10px', color: '#3d5a68', fontFamily: 'monospace' }
};
