import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useBulletinStore } from '../store/useBulletinStore';
import { useAuthStore } from '../store/useAuthStore';
import { POST_TAGS } from '@shared/constants/01-floors';
import type { PostTag } from '@shared/types/03-post';
import { Village, VILLAGE_LABEL } from '@shared/types/01-member';

interface Props {
  editPostId?: string;
  onClose:      () => void;
  onSubmitted: (postId: string) => void;
}

export function PostForm({ editPostId, onClose, onSubmitted }: Props) {
  const member = useAuthStore(s => s.member);
  const { createPost, updatePost, getPost } = useBulletinStore();

  const [title,     setTitle]     = useState('');
  const [body,      setBody]      = useState('');
  const [tag,       setTag]       = useState<PostTag>('QUESTION');
  const [villageId, setVillageId] = useState<Village>(member?.village || 'TAECHO');
  const [loading,   setLoading]   = useState(false);

  useEffect(() => {
    if (editPostId) {
      const p = getPost(editPostId);
      if (p) {
        setTitle(p.title);
        setBody(p.body);
        setTag(p.tag);
        setVillageId(p.villageId);
      }
    }
  }, [editPostId, getPost]);

  if (!member) return null;

  const handleSubmit = async () => {
    if (!title.trim() || !body.trim()) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 400));

    if (editPostId) {
      updatePost(editPostId, { title: title.trim(), body: body.trim(), tag });
      onSubmitted(editPostId);
    } else {
      const p = createPost({
        authorId:   member.id,
        authorName: member.crewName,
        villageId,
        title:      title.trim(),
        body:       body.trim(),
        tag,
      });
      onSubmitted(p.id);
    }
    setLoading(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#fff' }}>
      {/* Header */}
      <div style={{
        padding: '12px 20px',
        borderBottom: '1px solid #e8d9c8',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: '#fdf8ef',
      }}>
        <div style={{ fontFamily: "'DotGothic16', monospace", fontSize: 13, color: '#5a3a1a' }}>
          {editPostId ? '게시글 수정' : '새 게시글 작성'}
        </div>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#999' }}>✕</button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Tag & Village Selection */}
        <div style={{ display: 'flex', gap: 12 }}>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', fontSize: 11, color: '#8b4c10', marginBottom: 6, fontWeight: 700 }}>태그</label>
            <div style={{ display: 'flex', gap: 6 }}>
              {(['QUESTION', 'SHARE', 'CHAT'] as PostTag[]).map(t => (
                <button
                  key={t}
                  onClick={() => setTag(t)}
                  style={{
                    flex: 1,
                    background: tag === t ? '#c8a05e' : '#fff',
                    color: tag === t ? '#fff' : '#8b4c10',
                    border: '1.5px solid #c8b89a',
                    borderRadius: 8,
                    padding: '6px 0',
                    fontSize: 11,
                    cursor: 'pointer',
                    fontFamily: "'DotGothic16', monospace",
                  }}
                >
                  {POST_TAGS[t]}
                </button>
              ))}
            </div>
          </div>
          {!editPostId && (
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: 11, color: '#8b4c10', marginBottom: 6, fontWeight: 700 }}>마을 선택</label>
              <select
                value={villageId}
                onChange={e => setVillageId(e.target.value as Village)}
                style={{
                  width: '100%',
                  background: '#fff',
                  border: '1.5px solid #c8b89a',
                  borderRadius: 8,
                  padding: '5px 8px',
                  fontSize: 12,
                  color: '#2D1B0E',
                  outline: 'none',
                }}
              >
                {(Object.keys(VILLAGE_LABEL) as Village[]).map(v => (
                  <option key={v} value={v}>{VILLAGE_LABEL[v]}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Title */}
        <div>
          <label style={{ display: 'block', fontSize: 11, color: '#8b4c10', marginBottom: 6, fontWeight: 700 }}>제목</label>
          <input
            value={title}
            onChange={e => setTitle(e.target.value.slice(0, 100))}
            placeholder="제목을 입력하세요 (최대 100자)"
            style={{
              width: '100%',
              background: '#fff',
              border: '1.5px solid #c8b89a',
              borderRadius: 8,
              padding: '10px 14px',
              fontSize: 14,
              fontFamily: "'Noto Sans KR', sans-serif",
              color: '#2D1B0E',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>

        {/* Body */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <label style={{ display: 'block', fontSize: 11, color: '#8b4c10', marginBottom: 6, fontWeight: 700 }}>본문</label>
          <textarea
            value={body}
            onChange={e => setBody(e.target.value.slice(0, 5000))}
            placeholder="내용을 입력하세요 (최대 5,000자)"
            style={{
              flex: 1,
              width: '100%',
              background: '#fff',
              border: '1.5px solid #c8b89a',
              borderRadius: 8,
              padding: '12px 14px',
              fontSize: 13,
              fontFamily: "'Noto Sans KR', sans-serif",
              color: '#2D1B0E',
              resize: 'none',
              outline: 'none',
              boxSizing: 'border-box',
              lineHeight: 1.7,
            }}
          />
        </div>
      </div>

      {/* Footer */}
      <div style={{ padding: '16px 20px', borderTop: '1.5px solid #f5ede0', textAlign: 'right', display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
        <button
          onClick={onClose}
          style={{
            background: '#eee',
            border: 'none',
            borderRadius: 8,
            padding: '8px 20px',
            fontSize: 12,
            cursor: 'pointer',
            fontFamily: "'DotGothic16', monospace",
          }}
        >
          취소
        </button>
        <motion.button
          onClick={handleSubmit}
          disabled={!title.trim() || !body.trim() || loading}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          style={{
            background: '#c8a05e',
            color: '#2D1B0E',
            border: '2px solid #8b6444',
            borderRadius: 8,
            padding: '8px 24px',
            fontFamily: "'DotGothic16', monospace",
            fontSize: 12,
            cursor: 'pointer',
            boxShadow: '0 3px 0 #8b6444',
            fontWeight: 700,
          }}
        >
          {loading ? '저장 중...' : (editPostId ? '수정 완료' : '등록 완료')}
        </motion.button>
      </div>
    </div>
  );
}
