import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBulletinStore, TagFilter, SortOption, StatusFilter } from '../store/useBulletinStore';
import { POST_TAGS } from '@shared/constants/01-floors';
import type { Post, PostTag } from '@shared/types/03-post';
import { VILLAGE_LABEL } from '@shared/types/01-member';

const spring = { type: 'spring' as const, stiffness: 340, damping: 28 };

interface Props {
  floor: number | 'ALL';
  onPostClick: (postId: string) => void;
}

export function PostList({ floor, onPostClick }: Props) {
  const getPosts = useBulletinStore(s => s.getPosts);
  const countAnswers = useBulletinStore(s => s.countAnswers);

  const [tag,    setTag]    = useState<TagFilter>('ALL');
  const [sort,   setSort]   = useState<SortOption>('latest');
  const [status, setStatus] = useState<StatusFilter>('ALL');

  const posts = getPosts(floor, tag, sort, status);

  const TAG_STYLE: Record<PostTag, { bg: string; color: string }> = {
    QUESTION: { bg: '#e3f2fd', color: '#1565c0' },
    SHARE:    { bg: '#e8f5e9', color: '#2e7d32' },
    CHAT:     { bg: '#fff3e0', color: '#e65100' },
  };

  function timeAgo(iso: string) {
    const s = (Date.now() - new Date(iso).getTime()) / 1000;
    if (s < 60)    return '방금 전';
    if (s < 3600)  return `${Math.floor(s / 60)}분 전`;
    if (s < 86400) return `${Math.floor(s / 3600)}시간 전`;
    return `${Math.floor(s / 86400)}일 전`;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Filters */}
      <div style={{
        padding: '12px 20px',
        background: '#fdf8ef',
        borderBottom: '1px solid #e8d9c8',
        display: 'flex',
        flexWrap: 'wrap',
        gap: 12,
        alignItems: 'center',
      }}>
        <div style={{ display: 'flex', gap: 6 }}>
          {(['ALL', 'QUESTION', 'SHARE', 'CHAT'] as TagFilter[]).map(t => (
            <button
              key={t}
              onClick={() => setTag(t)}
              style={{
                background: tag === t ? '#c8a05e' : '#fff',
                color: tag === t ? '#fff' : '#8b4c10',
                border: '1.5px solid #c8b89a',
                borderRadius: 12,
                padding: '3px 10px',
                fontSize: 11,
                cursor: 'pointer',
                fontFamily: "'DotGothic16', monospace",
              }}
            >
              {t === 'ALL' ? '전체' : POST_TAGS[t]}
            </button>
          ))}
        </div>

        <div style={{ flex: 1 }} />

        <select
          value={sort}
          onChange={e => setSort(e.target.value as SortOption)}
          style={{
            background: '#fff',
            border: '1.5px solid #c8b89a',
            borderRadius: 6,
            padding: '2px 6px',
            fontSize: 11,
            color: '#5a3a1a',
            fontFamily: "'Noto Sans KR', sans-serif",
            outline: 'none',
          }}
        >
          <option value="latest">최신순</option>
          <option value="answers">답변 많은 순</option>
        </select>

        <select
          value={status}
          onChange={e => setStatus(e.target.value as StatusFilter)}
          style={{
            background: '#fff',
            border: '1.5px solid #c8b89a',
            borderRadius: 6,
            padding: '2px 6px',
            fontSize: 11,
            color: '#5a3a1a',
            fontFamily: "'Noto Sans KR', sans-serif",
            outline: 'none',
          }}
        >
          <option value="ALL">상태 전체</option>
          <option value="OPEN">미해결</option>
          <option value="RESOLVED">해결됨</option>
        </select>
      </div>

      {/* List */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
        {posts.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '40px 0',
            color: '#999',
            fontFamily: "'DotGothic16', monospace",
            fontSize: 14,
          }}>
            게시글이 없습니다.
          </div>
        ) : (
          posts.map((p, i) => {
            const ts = TAG_STYLE[p.tag];
            const ansCount = countAnswers(p.id);
            return (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.05, 0.5), ...spring }}
                whileHover={{ scale: 1.015, y: -2, boxShadow: '0 6px 20px #0001' }}
                whileTap={{ scale: 0.99 }}
                onClick={() => onPostClick(p.id)}
                style={{
                  background: '#fff',
                  borderRadius: 12,
                  padding: '14px 18px',
                  boxShadow: '0 2px 8px #00000008',
                  border: '1.5px solid #e8d9c8',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                {p.status === 'RESOLVED' && (
                  <div style={{
                    position: 'absolute', top: 0, left: 0, width: 4, bottom: 0, background: '#4caf50'
                  }} />
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <span style={{
                      background: ts.bg, color: ts.color,
                      borderRadius: 4, padding: '2px 6px', fontSize: 10, fontWeight: 700,
                    }}>{POST_TAGS[p.tag]}</span>
                    {p.status === 'RESOLVED' && (
                      <span style={{ color: '#4caf50', fontSize: 10, fontWeight: 700 }}>[해결됨]</span>
                    )}
                  </div>
                  <div style={{
                    fontFamily: "'Noto Sans KR', sans-serif",
                    fontSize: 14,
                    color: '#2D1B0E',
                    fontWeight: 700,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    marginBottom: 4,
                  }}>
                    {p.title}
                  </div>
                  <div style={{ fontSize: 11, color: '#999', display: 'flex', gap: 8 }}>
                    <span>{p.authorName}</span>
                    <span>·</span>
                    <span>{VILLAGE_LABEL[p.villageId]}</span>
                    <span>·</span>
                    <span>{timeAgo(p.createdAt)}</span>
                  </div>
                </div>
                <div style={{
                  marginLeft: 16,
                  background: '#fdf8ef',
                  border: '1px solid #e8d9c8',
                  borderRadius: 8,
                  padding: '4px 10px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  minWidth: 40,
                }}>
                  <span style={{ fontSize: 10, color: '#8b4c10' }}>답변</span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: '#5a3a1a' }}>{ansCount}</span>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}
