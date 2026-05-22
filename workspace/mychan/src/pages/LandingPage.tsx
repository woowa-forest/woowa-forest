import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../store/useAuthStore';
import { useMemberRegistry } from '../store/useMemberRegistry';
import type { Village } from '@shared/types/01-member';
import { VILLAGE_LABEL, VILLAGE_FIELD } from '@shared/types/01-member';

const spring = { type: 'spring' as const, stiffness: 300, damping: 28 };

type Mode = 'login' | 'signup';

/* ── 마을 선택 데이터 ── */
const FLOORS_VILLAGES: { floor: number; label: string; villages: Village[] }[] = [
  { floor: 11, label: '11F', villages: ['GURI', 'ANDROID'] },
  { floor: 12, label: '12F', villages: ['TAECHO', 'FRONTEND'] },
  { floor: 13, label: '13F', villages: ['PPOLONG', 'DUMBA'] },
];
const FLOOR_ACCENT: Record<number, string> = { 11: '#4CAF50', 12: '#42A5F5', 13: '#FF8F00' };

/* ── 스타일 상수 ── */
const inputBase: React.CSSProperties = {
  width: '100%',
  background: '#1e1208',
  border: '1.5px solid #5c3d2e',
  color: '#FFF8E7',
  padding: '10px 14px',
  borderRadius: 8,
  fontSize: 14,
  fontFamily: "'Noto Sans KR', sans-serif",
  outline: 'none',
  boxSizing: 'border-box',
};
const labelBase: React.CSSProperties = {
  display: 'block',
  fontSize: 12,
  color: '#c8a878',
  fontFamily: "'DotGothic16', monospace",
  marginBottom: 6,
};

/* ── 유효성 검사 ── */
const VALIDATION = {
  crewName: { min: 2, max: 20, regex: /^[a-zA-Z가-힣0-9_-]+$/ },
  githubId: { regex: /^[a-zA-Z0-9](?:[a-zA-Z0-9]|-(?=[a-zA-Z0-9])){0,38}$/ },
  bio: { max: 100 },
};

interface Props { onEnter: () => void; }

export function LandingPage({ onEnter }: Props) {
  const login          = useAuthStore(s => s.login);
  const register       = useMemberRegistry(s => s.register);
  const findByCrewName = useMemberRegistry(s => s.findByCrewName);

  const [mode,     setMode]     = useState<Mode>('login');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);

  /* 로그인 필드 */
  const [loginName, setLoginName] = useState('');

  /* 회원가입 필드 */
  const [crewName, setCrewName] = useState('');
  const [village,  setVillage]  = useState<Village>('TAECHO');
  const [githubId, setGithubId] = useState('');
  const [bio,      setBio]      = useState('');

  const clearError = () => setError('');

  /* ── 로그인 ── */
  const handleLogin = async () => {
    if (!loginName.trim()) { setError('크루명을 입력해주세요'); return; }
    setLoading(true);
    await new Promise(r => setTimeout(r, 500));

    const found = findByCrewName(loginName);
    if (!found) {
      setError('등록된 크루를 찾을 수 없어요. 회원가입을 해주세요.');
      setLoading(false);
      return;
    }
    login(found);
    setLoading(false);
    onEnter();
  };

  /* ── 회원가입 ── */
  const validateSignup = (): string => {
    const name = crewName.trim();
    if (name.length < VALIDATION.crewName.min) return `크루명은 ${VALIDATION.crewName.min}자 이상이어야 해요`;
    if (name.length > VALIDATION.crewName.max) return `크루명은 ${VALIDATION.crewName.max}자 이하여야 해요`;
    if (!VALIDATION.crewName.regex.test(name))  return '크루명에 특수문자를 쓸 수 없어요';
    if (!githubId.trim())                        return 'GitHub ID를 입력해주세요';
    if (!VALIDATION.githubId.regex.test(githubId.trim())) return 'GitHub ID 형식이 올바르지 않아요';
    if (findByCrewName(name))                    return '이미 사용 중인 크루명이에요';
    return '';
  };

  const handleSignup = async () => {
    const err = validateSignup();
    if (err) { setError(err); return; }
    setError('');
    setLoading(true);
    await new Promise(r => setTimeout(r, 600));

    const member = {
      id:                 `crew-${Date.now()}`,
      crewName:           crewName.trim(),
      field:              VILLAGE_FIELD[village],
      githubId:           githubId.trim(),
      village,
      bio:                bio.trim(),
      wooMaBalance:       1000,
      avatarCostumeId:    null as null,
      lastGithubSyncTime: null as null,
    };

    register(member);
    login(member);
    setLoading(false);
    onEnter();
  };

  /* ── 층 찾기 헬퍼 ── */
  const floorOf = (v: Village) =>
    FLOORS_VILLAGES.find(f => f.villages.includes(v))!.floor;

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #0a1408 0%, #1a1209 50%, #0d1a0a 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 24,
    }}>
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={spring}
        style={{ width: '100%', maxWidth: 440, display: 'flex', flexDirection: 'column', gap: 24 }}
      >
        {/* 타이틀 */}
        <div style={{ textAlign: 'center' }}>
          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            style={{ fontSize: 52, marginBottom: 8 }}
          >🌿</motion.div>
          <h1 style={{
            fontFamily: "'DotGothic16', monospace", fontSize: 32,
            color: '#FFF8E7', letterSpacing: 6, margin: 0,
            textShadow: '0 0 32px #4caf5066, 0 2px 12px #0008',
          }}>우아한 숲</h1>
          <p style={{ fontFamily: "'Noto Sans KR', sans-serif", fontSize: 13, color: '#a07858', marginTop: 8 }}>
            우아한테크코스 8기 테코톤
          </p>
        </div>

        {/* 카드 */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.12, ...spring }}
          style={{
            background: 'rgba(45,27,14,0.92)',
            border: '2px solid #5c3d2e',
            borderRadius: 16,
            overflow: 'hidden',
            boxShadow: '0 12px 48px #0009',
            backdropFilter: 'blur(8px)',
          }}
        >
          {/* 탭 헤더 */}
          <div style={{ display: 'flex', borderBottom: '1px solid #3d2010' }}>
            {(['login', 'signup'] as Mode[]).map(m => (
              <button
                key={m}
                onClick={() => { setMode(m); clearError(); }}
                style={{
                  flex: 1,
                  padding: '14px 0',
                  background: 'none',
                  border: 'none',
                  borderBottom: mode === m ? '2.5px solid #4caf50' : '2.5px solid transparent',
                  fontFamily: "'DotGothic16', monospace",
                  fontSize: 13,
                  color: mode === m ? '#81c784' : '#664',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  letterSpacing: 1,
                }}
              >
                {m === 'login' ? '🪵 로그인' : '🌱 회원가입'}
              </button>
            ))}
          </div>

          {/* 탭 콘텐츠 */}
          <AnimatePresence mode="wait">
            {mode === 'login' ? (
              <LoginForm
                key="login"
                loginName={loginName}
                setLoginName={v => { setLoginName(v); clearError(); }}
                error={error}
                loading={loading}
                onSubmit={handleLogin}
                onSwitch={() => { setMode('signup'); clearError(); }}
              />
            ) : (
              <SignupForm
                key="signup"
                crewName={crewName}     setCrewName={v => { setCrewName(v); clearError(); }}
                village={village}       setVillage={setVillage}
                githubId={githubId}     setGithubId={v => { setGithubId(v); clearError(); }}
                bio={bio}               setBio={setBio}
                floorOf={floorOf}
                error={error}
                loading={loading}
                onSubmit={handleSignup}
                onSwitch={() => { setMode('login'); clearError(); }}
              />
            )}
          </AnimatePresence>
        </motion.div>

        <p style={{ textAlign: 'center', fontSize: 11, color: '#4a3a2a', fontFamily: "'Noto Sans KR', sans-serif" }}>
          크루명은 변경할 수 없어요. 신중하게 입력해주세요.
        </p>
      </motion.div>
    </div>
  );
}

/* ══════════════════════════════════════════
   로그인 폼
══════════════════════════════════════════ */
function LoginForm({
  loginName, setLoginName, error, loading, onSubmit, onSwitch,
}: {
  loginName: string; setLoginName: (v: string) => void;
  error: string; loading: boolean;
  onSubmit: () => void; onSwitch: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.2 }}
      style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 18 }}
    >
      <div style={{ fontFamily: "'Noto Sans KR', sans-serif", fontSize: 12, color: '#a07858', textAlign: 'center' }}>
        크루명을 입력하고 숲에 입장하세요
      </div>

      <div>
        <label style={labelBase}>크루명 <span style={{ color: '#ef5350' }}>*</span></label>
        <input
          value={loginName}
          onChange={e => setLoginName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && onSubmit()}
          placeholder="ex) mychan"
          style={inputBase}
          autoFocus
        />
      </div>

      <ErrorBox error={error} />

      <SubmitButton loading={loading} onClick={onSubmit}>
        {loading ? '입장 중...' : '🌿 숲에 입장하기'}
      </SubmitButton>

      <div style={{ textAlign: 'center', fontSize: 11, color: '#664', fontFamily: "'Noto Sans KR', sans-serif" }}>
        처음이신가요?{' '}
        <button
          onClick={onSwitch}
          style={{ background: 'none', border: 'none', color: '#81c784', fontSize: 11, cursor: 'pointer', textDecoration: 'underline', fontFamily: 'inherit', padding: 0 }}
        >
          회원가입하기
        </button>
      </div>
    </motion.div>
  );
}

/* ══════════════════════════════════════════
   회원가입 폼
══════════════════════════════════════════ */
function SignupForm({
  crewName, setCrewName,
  village, setVillage,
  githubId, setGithubId,
  bio, setBio,
  floorOf,
  error, loading, onSubmit, onSwitch,
}: {
  crewName: string; setCrewName: (v: string) => void;
  village: Village; setVillage: (v: Village) => void;
  githubId: string; setGithubId: (v: string) => void;
  bio: string; setBio: (v: string) => void;
  floorOf: (v: Village) => number;
  error: string; loading: boolean;
  onSubmit: () => void; onSwitch: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.2 }}
      style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 16 }}
    >
      {/* 크루명 */}
      <div>
        <label style={labelBase}>크루명 <span style={{ color: '#ef5350' }}>*</span></label>
        <input
          value={crewName}
          onChange={e => setCrewName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && onSubmit()}
          placeholder="ex) mychan"
          style={inputBase}
          autoFocus
        />
      </div>

      {/* 마을 선택 */}
      <div>
        <label style={labelBase}>마을 <span style={{ color: '#ef5350' }}>*</span></label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {FLOORS_VILLAGES.map(({ floor, label, villages: vs }) => {
            const accent = FLOOR_ACCENT[floor];
            return (
              <div key={floor}>
                <div style={{ fontSize: 10, color: accent, fontFamily: "'DotGothic16', monospace", marginBottom: 4, letterSpacing: 1 }}>
                  {label}
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  {vs.map(v => {
                    const selected = village === v;
                    const fieldTag = VILLAGE_FIELD[v];
                    return (
                      <motion.button
                        key={v}
                        onClick={() => setVillage(v)}
                        whileTap={{ scale: 0.95 }}
                        style={{
                          flex: 1, padding: '8px 6px', borderRadius: 8,
                          border: selected ? `2px solid ${accent}` : '1.5px solid #3d2010',
                          background: selected ? `${accent}18` : '#1e1208',
                          color: selected ? accent : '#a07858',
                          fontFamily: "'DotGothic16', monospace", fontSize: 11,
                          cursor: 'pointer', transition: 'all 0.15s', textAlign: 'center', lineHeight: 1.4,
                        }}
                      >
                        <div style={{ fontSize: 9, opacity: 0.75, marginBottom: 2 }}>[{fieldTag}]</div>
                        {VILLAGE_LABEL[v].replace(/^(BE|FE|AN) /, '')}
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* 선택된 마을 배지 */}
        <AnimatePresence mode="wait">
          <motion.div
            key={village}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            style={{
              marginTop: 8,
              padding: '5px 12px',
              background: `${FLOOR_ACCENT[floorOf(village)]}14`,
              border: `1px solid ${FLOOR_ACCENT[floorOf(village)]}44`,
              borderRadius: 7,
              fontFamily: "'DotGothic16', monospace", fontSize: 11,
              color: '#c8a878',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}
          >
            <span>✓ {VILLAGE_LABEL[village]}</span>
            <span style={{ fontSize: 10, color: '#81c784' }}>
              {VILLAGE_FIELD[village]} · {
                VILLAGE_FIELD[village] === 'AN' ? 'Android' :
                VILLAGE_FIELD[village] === 'FE' ? 'Frontend' : 'Backend'
              }
            </span>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* GitHub ID */}
      <div>
        <label style={labelBase}>
          GitHub ID <span style={{ color: '#ef5350' }}>*</span>
          <span style={{ color: '#666', fontFamily: "'Noto Sans KR', sans-serif", fontWeight: 400 }}> (우마 수확에 사용)</span>
        </label>
        <input
          value={githubId}
          onChange={e => setGithubId(e.target.value)}
          placeholder="ex) my-github-id"
          style={inputBase}
        />
      </div>

      {/* 한 마디 */}
      <div>
        <label style={labelBase}>한 마디 <span style={{ color: '#666', fontFamily: "'Noto Sans KR', sans-serif", fontWeight: 400 }}>(선택, 최대 100자)</span></label>
        <textarea
          value={bio}
          onChange={e => setBio(e.target.value.slice(0, 100))}
          placeholder="안녕하세요! 함께 성장해요 🌱"
          rows={2}
          style={{ ...inputBase, resize: 'none', lineHeight: 1.6 }}
        />
        <div style={{ fontSize: 10, color: '#664', textAlign: 'right', marginTop: 2 }}>{bio.length}/100</div>
      </div>

      <ErrorBox error={error} />

      <SubmitButton loading={loading} onClick={onSubmit}>
        {loading ? '가입 중...' : '🌿 크루로 등록하기'}
      </SubmitButton>

      <div style={{ textAlign: 'center', fontSize: 11, color: '#664', fontFamily: "'Noto Sans KR', sans-serif" }}>
        이미 계정이 있으신가요?{' '}
        <button
          onClick={onSwitch}
          style={{ background: 'none', border: 'none', color: '#81c784', fontSize: 11, cursor: 'pointer', textDecoration: 'underline', fontFamily: 'inherit', padding: 0 }}
        >
          로그인하기
        </button>
      </div>
    </motion.div>
  );
}

/* ── 공통 컴포넌트 ── */
function ErrorBox({ error }: { error: string }) {
  return (
    <AnimatePresence>
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          style={{
            background: '#3b1010', border: '1px solid #ef5350',
            borderRadius: 8, padding: '8px 14px',
            fontSize: 12, color: '#ef9a9a',
            fontFamily: "'Noto Sans KR', sans-serif",
          }}
        >
          ⚠️ {error}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function SubmitButton({
  loading, onClick, children,
}: {
  loading: boolean; onClick: () => void; children: React.ReactNode;
}) {
  return (
    <motion.button
      onClick={onClick}
      disabled={loading}
      whileHover={{ scale: loading ? 1 : 1.02 }}
      whileTap={{ scale: 0.97, y: 2 }}
      style={{
        background: loading ? '#2e4a2e' : '#4caf50',
        color: '#fff',
        border: '2px solid #2e7d32',
        borderRadius: 10, padding: '13px 0',
        fontFamily: "'DotGothic16', monospace", fontSize: 15,
        cursor: loading ? 'wait' : 'pointer',
        boxShadow: loading ? 'none' : '0 4px 0 #2e7d32',
        transition: 'all 0.15s', letterSpacing: 2,
      }}
    >
      {children}
    </motion.button>
  );
}
