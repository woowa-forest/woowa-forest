-- 우아한 숲 Supabase DB 스키마 (초기 세팅용)
-- Supabase SQL Editor에 복사하여 Run 하세요.

-- 1. Members 테이블 (유저 정보 및 경제)
CREATE TABLE public.members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    crew_name TEXT NOT NULL,
    field TEXT NOT NULL,
    github_id TEXT,
    village TEXT NOT NULL,
    bio TEXT,
    wooma_balance INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- 2. Posts 테이블 (게시판)
CREATE TABLE public.posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    author_id UUID REFERENCES public.members(id),
    author_name TEXT NOT NULL,
    village_id TEXT NOT NULL,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    tag TEXT NOT NULL,
    status TEXT DEFAULT 'OPEN',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- 3. Answers 테이블 (게시판 답변)
CREATE TABLE public.answers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
    author_id UUID REFERENCES public.members(id),
    author_name TEXT NOT NULL,
    body TEXT NOT NULL,
    is_adopted BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- 4. Transactions 테이블 (우마 경제 내역)
CREATE TABLE public.transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID REFERENCES public.members(id),
    amount INTEGER NOT NULL,
    reason TEXT NOT NULL,
    ref_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- 실시간 통신(Realtime) 활성화
alter publication supabase_realtime add table members;
alter publication supabase_realtime add table posts;
alter publication supabase_realtime add table answers;
