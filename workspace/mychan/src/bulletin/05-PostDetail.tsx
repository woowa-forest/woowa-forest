import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBulletinStore } from '../store/useBulletinStore';
import { useAuthStore } from '../store/useAuthStore';
import { useMemberRegistry } from '../store/useMemberRegistry';
import { POST_TAGS } from '@shared/constants/01-floors';
import { VILLAGE_LABEL } from '@shared/types/01-member';
import { AnswerCard } from './05-AnswerCard';
import { AnswerForm } from './05-AnswerForm';

const spring = { type: 'spring' as const, stiffness: 340, damping: 28 };

interface Props {
  postId: string;
  onBack: () => void;
  onEdit: () => void;
}

export function PostDetail({ postId, onBack, onEdit }: Props) {
  const member = useAuthStore(s => s.member);
  const getPost = useBulletinStore(s => s.getPost);
  const deletePost = useBulletinStore(s => s.deletePost);
  const adoptAnswer = useBulletinStore(s => s.adoptAnswer);
  
  const { members, updateMember } = useMemberRegistry();

  const data = getPost(postId);
  const [adoptLoading, setAdoptLoading] = useState<string | null>(null);

  if (!data) {
    return (
      <div style={{ padding: 40, textAlign: 'center', color: '#999' }}>
        포스트를 찾을 수 없습니다.
        <button onClick={onBack}>뒤로가기</button>
      </div>
    );
  }

  const isAuthor = member?.id === data.authorId;
  const hasAdopted = data.answers.some(a => a.isAdopted);

  const handleDelete = () => {
    if (!window.confirm('정말 삭제하시겠습니까?')) return;
    const ok = deletePost(postId);
    if (ok) onBack();
    else alert('채택된 답변이 있는 질문은 삭제할 수 없습니다.');
  };

  const handleAdopt = async (answerId: string) => {
    if (!member) return;
    const answer = data.answers.find(a => a.id === answerId);
    if (!answer) return;

    if (!window.confirm(`이 답변을 채택하시겠습니까?\n채택 후에는 취소할 수 없으며 답변자(${answer.authorName})에게 2,000우마가 지급됩니다.`)) return;
    
    setAdoptLoading(answerId);
    await new Promise(r => setTimeout(r, 600));
    const res = adoptAnswer(postId, answerId, member.id);
    setAdoptLoading(null);

    if (res.ok) {
      // 답변자가 나 자신인 경우 (자문자답은 이미 store에서 막혀있지만 논리적 완결성을 위해)
      if (answer.authorId === member.id) {
        useAuthStore.getState().addTransaction(res.reward, 'ANSWER_ADOPTED', answer.id);
      } else {
        // 다른 유저인 경우 로컬 레지스트리 업데이트
        const targetMember = members.find(m => m.id === answer.authorId);
        if (targetMember) {
          updateMember({
            ...targetMember,
            wooMaBalance: targetMember.wooMaBalance + res.reward
          });
        }
      }
      alert(`채택되었습니다! 답변자(${answer.authorName})에게 ${res.reward}우마가 지급되었습니다.`);
    } else {
      if (res.code === 'SELF_ANSWER') alert('자신의 답변은 채택할 수 없습니다.');
      else if (res.code === 'ALREADY_ADOPTED') alert('이미 채택된 답변이 있습니다.');
      else alert('채택 권한이 없습니다.');
    }
  };

  function timeAgo(iso: string) {
    const s = (Date.now() - new Date(iso).getTime()) / 1000;
    if (s < 60)    return '방금 전';
    if (s < 3600)  return `${Math.floor(s / 60)}분 전`;
    if (s < 86400) return `${Math.floor(s / 3600)}시간 전`;
    return `${Math.floor(s / 86400)}일 전`;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#fff' }}>
      {/* Header */}
      <div style={{
        padding: '12px 20px',
        borderBottom: '1px solid #e8d9c8',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        background: '#fdf8ef',
      }}>
        <motion.button
          onClick={onBack}
          whileHover={{ x: -2 }}
          style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: '#8b4c10', display: 'flex', alignItems: 'center' }}
        >
          ←
        </motion.button>
        <div style={{ flex: 1, fontFamily: "'DotGothic16', monospace", fontSize: 13, color: '#5a3a1a' }}>
          게시글 상세
        </div>
        {isAuthor && (
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={onEdit} style={{ background: 'none', border: 'none', color: '#c8a05e', fontSize: 11, cursor: 'pointer', fontWeight: 700 }}>수정</button>
            <button onClick={handleDelete} style={{ background: 'none', border: 'none', color: '#e57373', fontSize: 11, cursor: 'pointer', fontWeight: 700 }}>삭제</button>
          </div>
        )}
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
        {/* Post Content */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <span style={{
              background: '#e3f2fd', color: '#1565c0',
              borderRadius: 4, padding: '2px 7px', fontSize: 10, fontWeight: 700,
            }}>{POST_TAGS[data.tag]}</span>
            {data.status === 'RESOLVED' && (
              <span style={{ color: '#4caf50', fontSize: 11, fontWeight: 700 }}>[해결됨]</span>
            )}
          </div>
          <h1 style={{
            fontFamily: "'Noto Sans KR', sans-serif",
            fontSize: 18,
            color: '#2D1B0E',
            margin: '0 0 10px 0',
            lineHeight: 1.4,
          }}>
            {data.title}
          </h1>
          <div style={{ fontSize: 12, color: '#999', display: 'flex', gap: 8, marginBottom: 20 }}>
            <span style={{ fontWeight: 700, color: '#5a3a1a' }}>{data.authorName}</span>
            <span>·</span>
            <span>{VILLAGE_LABEL[data.villageId]}</span>
            <span>·</span>
            <span>{timeAgo(data.createdAt)}</span>
          </div>
          <div style={{
            fontSize: 14,
            lineHeight: 1.8,
            color: '#2D1B0E',
            whiteSpace: 'pre-wrap',
            fontFamily: "'Noto Sans KR', sans-serif",
            minHeight: 100,
          }}>
            {data.body}
          </div>
        </div>

        {/* Answers Section */}
        <div style={{ borderTop: '2px solid #f5ede0', paddingTop: 24, paddingBottom: 40 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <span style={{ fontFamily: "'DotGothic16', monospace", fontSize: 14, color: '#5a3a1a' }}>
              답변 {data.answers.length}개
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {data.answers.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '20px 0', color: '#bbb', fontSize: 12 }}>
                아직 답변이 없습니다. 첫 답변을 남겨보세요!
              </div>
            ) : (
              data.answers.map(ans => (
                <AnswerCard
                  key={ans.id}
                  answer={ans}
                  isPostAuthor={isAuthor}
                  hasAdopted={hasAdopted}
                  onAdopt={() => handleAdopt(ans.id)}
                  adoptLoading={adoptLoading === ans.id}
                />
              ))
            )}
          </div>

          {/* Answer Form */}
          <AnswerForm postId={postId} onSubmitted={() => {}} />
        </div>
      </div>
    </div>
  );
}
