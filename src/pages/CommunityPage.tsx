import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, MessageCircle, Share2, Send, Trophy, Check } from 'lucide-react';
import { DEMO_POSTS, DEMO_LEADERBOARD } from '../lib/seed-data';
import { useAuth } from '../providers/AuthProvider';
import { useGamification } from '../providers/GamificationProvider';
import { useNotifications } from '../providers/NotificationProvider';
import { getRelativeTime } from '../lib/utils';

const getCarbonSavedForUser = (userName: string, level: number) => {
  if (userName === 'Maya Green') return 2150;
  if (userName === 'Alex Rivera') return 560;
  if (userName === 'Sam Chen') return 45;
  return level * 120;
};

export default function CommunityPage() {
  const { user } = useAuth();
  const { addXp } = useGamification();
  const { showToast } = useNotifications();
  const [tab, setTab] = useState<'feed' | 'leaderboard'>('feed');
  const [posts, setPosts] = useState(DEMO_POSTS);
  const [newPost, setNewPost] = useState('');
  const [postType, setPostType] = useState<'general' | 'tip' | 'achievement'>('general');
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});

  const handleLike = (postId: string) => {
    setPosts(prev => prev.map(p => {
      if (p.id === postId) {
        const liked = !p.liked;
        if (liked) {
          addXp(2, 'Liked a post');
        }
        return {
          ...p,
          liked,
          likes: liked ? p.likes + 1 : p.likes - 1
        };
      }
      return p;
    }));
  };

  const handlePost = () => {
    if (!newPost.trim() || !user) return;
    const post = {
      id: `post_${Date.now()}`,
      userId: user.id,
      userName: user.name,
      userAvatar: user.avatar,
      userLevel: user.level,
      content: newPost,
      likes: 0,
      liked: false,
      comments: [],
      tags: postType === 'tip' ? ['tip', 'eco'] : postType === 'achievement' ? ['achievement', 'progress'] : ['general'],
      createdAt: new Date().toISOString(),
      type: postType,
    };
    setPosts(prev => [post, ...prev]);
    setNewPost('');
    addXp(15, 'Created community post');
    showToast('Post published successfully!', 'success');
  };

  const toggleComments = (id: string) => {
    setExpandedComments(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleCommentSubmit = (postId: string) => {
    const text = commentInputs[postId];
    if (!text || !text.trim() || !user) return;

    const newComment = {
      id: `c_${Date.now()}`,
      userId: user.id,
      userName: user.name,
      userAvatar: user.avatar,
      content: text.trim(),
      createdAt: new Date().toISOString(),
      likes: 0,
    };

    setPosts(prev => prev.map(p => {
      if (p.id === postId) {
        return {
          ...p,
          comments: [...p.comments, newComment]
        };
      }
      return p;
    }));

    setCommentInputs(prev => ({ ...prev, [postId]: '' }));
    addXp(5, 'Commented on post');
    showToast('Comment added!', 'success');
  };

  const handleShare = (postContent: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(postContent);
      showToast('Post link copied to clipboard!', 'success');
    } else {
      showToast('Sharing not supported on this browser', 'warning');
    }
  };

  return (
    <div className="page-container space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Eco Community</h1>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Share green tips, log achievements, and inspire other climate advocates</p>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl w-fit" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
        {(['feed', 'leaderboard'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} className="px-4 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all cursor-pointer"
            style={tab === t ? { background: 'linear-gradient(135deg, #10b981, #14b8a6)', color: 'white' } : { color: 'var(--text-secondary)' }}>
            {t}
          </button>
        ))}
      </div>

      {tab === 'feed' ? (
        <div className="max-w-2xl mx-auto space-y-6">
          {/* New Post */}
          <div className="stat-card space-y-4">
            <div className="flex gap-4">
              <div className="w-9 h-9 rounded-full gradient-primary flex items-center justify-center text-base shrink-0">{user?.avatar}</div>
              <div className="flex-1 space-y-2">
                <input 
                  value={newPost} 
                  onChange={e => setNewPost(e.target.value)} 
                  onKeyDown={e => e.key === 'Enter' && handlePost()} 
                  placeholder="Share an eco tip, achievement, or green thought..." 
                  className="w-full px-3 py-2 rounded-xl text-sm"
                  style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
                />
                
                {/* Meta details for posting */}
                <div className="flex items-center justify-between text-xs pt-1">
                  <div className="flex gap-2">
                    {([
                      { id: 'general', label: '💬 General' },
                      { id: 'tip', label: '💡 Eco Tip' },
                      { id: 'achievement', label: '🏆 Achievement' },
                    ] as const).map(opt => (
                      <button
                        key={opt.id}
                        onClick={() => setPostType(opt.id)}
                        className="px-2.5 py-1 rounded-lg border transition-all cursor-pointer font-medium"
                        style={
                          postType === opt.id
                            ? { background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', borderColor: 'rgba(16, 185, 129, 0.3)' }
                            : { background: 'transparent', color: 'var(--text-secondary)', borderColor: 'var(--border-color)' }
                        }
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                  <motion.button 
                    whileHover={{ scale: 1.05 }} 
                    whileTap={{ scale: 0.95 }} 
                    onClick={handlePost} 
                    disabled={!newPost.trim()} 
                    className="px-4 py-1.5 rounded-xl text-white gradient-primary disabled:opacity-50 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" /> Post
                  </motion.button>
                </div>
              </div>
            </div>
          </div>

          {/* Posts */}
          {posts.map((post, i) => (
            <motion.div key={post.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="stat-card space-y-4">
              {/* Header */}
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-500 p-0.5 shrink-0 shadow-md">
                  <div className="w-full h-full rounded-full bg-white dark:bg-slate-900 flex items-center justify-center text-lg">{post.userAvatar}</div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-sm font-semibold flex items-center gap-1" style={{ color: 'var(--text-primary)' }}>
                      {post.userName}
                      {post.userLevel >= 4 && (
                        <span className="p-0.5 rounded-full bg-blue-500 text-white shrink-0 inline-flex items-center justify-center" title="Verified Eco Champion">
                          <Check className="w-2 h-2 stroke-[4]" />
                        </span>
                      )}
                    </span>
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full text-white bg-gradient-to-r from-emerald-500 to-teal-500 shadow-sm shadow-emerald-500/20 border border-emerald-400/20 flex items-center gap-0.5">
                      🏆 Lv.{post.userLevel}
                    </span>
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center gap-0.5">
                      🍃 {getCarbonSavedForUser(post.userName, post.userLevel)} kg saved
                    </span>
                  </div>
                  <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{getRelativeTime(post.createdAt)}</span>
                </div>
                {post.type !== 'general' && (
                  <span className="text-[9px] uppercase font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">{post.type}</span>
                )}
              </div>

              {/* Content */}
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-primary)' }}>{post.content}</p>

              {/* Tags */}
              {post.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {post.tags.map(tag => (
                    <span key={tag} className="text-[10px] px-2.5 py-0.5 rounded-full font-semibold bg-slate-100 dark:bg-slate-800 text-slate-400 border border-slate-200 dark:border-slate-700">#{tag}</span>
                  ))}
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-4 pt-4 border-t" style={{ borderColor: 'var(--border-color)' }}>
                <motion.button
                  whileHover={{ y: -1.5 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleLike(post.id)}
                  className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-all duration-200 hover:bg-rose-500/10 hover:text-rose-500 cursor-pointer ${post.liked ? 'text-rose-500 font-bold bg-rose-500/5' : 'text-slate-400'}`}
                >
                  <Heart className={`w-4 h-4 transition-transform duration-200 ${post.liked ? 'fill-current text-rose-500 scale-110' : ''}`} /> {post.likes}
                </motion.button>
                <motion.button
                  whileHover={{ y: -1.5 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => toggleComments(post.id)}
                  className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-all duration-200 hover:bg-emerald-500/10 hover:text-emerald-500 cursor-pointer ${expandedComments.has(post.id) ? 'text-emerald-500 font-bold bg-emerald-500/5' : 'text-slate-400'}`}
                >
                  <MessageCircle className="w-4 h-4" /> {post.comments.length}
                </motion.button>
                <motion.button
                  whileHover={{ y: -1.5 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleShare(post.content)}
                  className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg text-slate-400 hover:bg-blue-500/10 hover:text-blue-500 transition-all duration-200 cursor-pointer"
                >
                  <Share2 className="w-4 h-4" /> Share
                </motion.button>
              </div>

              {/* Comments Section */}
              <AnimatePresence>
                {expandedComments.has(post.id) && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="mt-4 pt-4 border-t space-y-4 overflow-hidden" style={{ borderColor: 'var(--border-color)' }}>
                    
                    {/* Write comment input */}
                    <div className="flex gap-2 items-center">
                      <div className="w-7 h-7 rounded-full gradient-primary flex items-center justify-center text-xs shrink-0">{user?.avatar}</div>
                      <div className="flex-1 relative flex items-center">
                        <input
                          value={commentInputs[post.id] || ''}
                          onChange={e => setCommentInputs(prev => ({ ...prev, [post.id]: e.target.value }))}
                          onKeyDown={e => e.key === 'Enter' && handleCommentSubmit(post.id)}
                          placeholder="Write a comment..."
                          className="flex-1 px-4 py-2 pr-10 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500/20"
                          style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
                        />
                        <button 
                          onClick={() => handleCommentSubmit(post.id)}
                          disabled={!(commentInputs[post.id]?.trim())}
                          aria-label="Send comment"
                          className="absolute right-2 p-1.5 rounded-lg gradient-primary text-white disabled:opacity-50 cursor-pointer"
                        >
                          <Send className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    {/* Comments List */}
                    {post.comments.length > 0 ? (
                      <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                        {post.comments.map(c => (
                          <div key={c.id} className="flex items-start gap-4 p-4 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800" style={{ background: 'var(--bg-secondary)' }}>
                            <div className="w-7 h-7 rounded-full bg-slate-300 dark:bg-slate-700 flex items-center justify-center text-xs shrink-0">{c.userAvatar}</div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{c.userName}</span>
                                <span className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>{getRelativeTime(c.createdAt)}</span>
                              </div>
                              <p className="text-xs mt-1 leading-relaxed break-words" style={{ color: 'var(--text-secondary)' }}>{c.content}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[10px] text-center py-2" style={{ color: 'var(--text-tertiary)' }}>No comments yet. Be the first to comment!</p>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      ) : (
        /* Leaderboard */
        <div className="max-w-2xl mx-auto">
          {/* Top 3 */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            {DEMO_LEADERBOARD.slice(0, 3).map((entry, i) => (
              <motion.div
                key={entry.userId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`stat-card text-center ${i === 0 ? 'order-2' : i === 1 ? 'order-1' : 'order-3'}`}
                style={i === 0 ? { border: '1px solid rgba(245, 158, 11, 0.4)', boxShadow: '0 0 20px rgba(245, 158, 11, 0.1)' } : {}}
              >
                <div className="text-3xl mb-1">{i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'}</div>
                <div className="text-2xl mb-1">{entry.userAvatar}</div>
                <p className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>{entry.userName}</p>
                <p className="text-lg font-bold text-emerald-500 mt-1">{entry.co2Saved} kg</p>
                <p className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>CO₂ saved</p>
              </motion.div>
            ))}
          </div>

          <div className="stat-card stat-card--flush overflow-hidden">
            {DEMO_LEADERBOARD.map((entry, i) => (
              <motion.div
                key={entry.userId}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                className="flex items-center gap-4 p-4 border-b"
                style={{
                  borderColor: 'var(--border-color)',
                  background: entry.userId === user?.id ? 'rgba(16, 185, 129, 0.05)' : 'transparent',
                }}
              >
                <span className="text-sm font-bold w-6 text-center" style={{ color: i < 3 ? '#f59e0b' : 'var(--text-tertiary)' }}>{entry.rank}</span>
                <span className="text-xl">{entry.userAvatar}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                    {entry.userName} {entry.userId === user?.id && <span className="text-emerald-500">(You)</span>}
                  </p>
                  <p className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>Level {entry.level} · 🔥 {entry.streak}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-emerald-500">{entry.co2Saved} kg</p>
                  <p className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>{entry.xp} XP</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
