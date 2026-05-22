import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Post, Answer, PostTag, PostStatus, AdoptError } from '@shared/types/03-post';
import type { Village } from '@shared/types/01-member';

export type FloorFilter  = 'ALL' | 11 | 12 | 13;
export type TagFilter    = 'ALL' | PostTag;
export type SortOption   = 'latest' | 'answers';
export type StatusFilter = 'ALL' | PostStatus;

const FLOOR_VILLAGES: Record<number, Village[]> = {
  11: ['GURI', 'ANDROID'],
  12: ['TAECHO', 'FRONTEND'],
  13: ['PPOLONG', 'DUMBA'],
};

const uid = () => `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
const now = () => new Date().toISOString();

type CreatePostParams = Omit<Post, 'id' | 'status' | 'createdAt' | 'updatedAt'>;
type CreateAnswerParams = Omit<Answer, 'id' | 'isAdopted' | 'createdAt'>;
type AdoptResult = { ok: true; reward: number } | { ok: false; code: AdoptError };

interface BulletinStore {
  posts:   Post[];
  answers: Answer[];

  createPost:   (p: CreatePostParams) => Post;
  updatePost:   (postId: string, updates: Partial<Pick<Post, 'title' | 'body' | 'tag'>>) => void;
  deletePost:   (postId: string) => boolean;

  createAnswer: (a: CreateAnswerParams) => Answer;
  adoptAnswer:  (postId: string, answerId: string, requesterId: string) => AdoptResult;

  getPosts: (floor: FloorFilter, tag?: TagFilter, sort?: SortOption, status?: StatusFilter) => Post[];
  getPost:  (postId: string) => (Post & { answers: Answer[] }) | undefined;
  countAnswers: (postId: string) => number;
}

export const useBulletinStore = create<BulletinStore>()(
  persist(
    (set, get) => ({
      posts:   [],
      answers: [],

      createPost: (p) => {
        const post: Post = { ...p, id: `post-${uid()}`, status: 'OPEN', createdAt: now(), updatedAt: now() };
        set(s => ({ posts: [post, ...s.posts] }));
        return post;
      },

      updatePost: (postId, updates) =>
        set(s => ({
          posts: s.posts.map(p =>
            p.id === postId ? { ...p, ...updates, updatedAt: now() } : p
          ),
        })),

      deletePost: (postId) => {
        if (get().answers.some(a => a.postId === postId && a.isAdopted)) return false;
        set(s => ({
          posts:   s.posts.filter(p => p.id !== postId),
          answers: s.answers.filter(a => a.postId !== postId),
        }));
        return true;
      },

      createAnswer: (a) => {
        const answer: Answer = { ...a, id: `ans-${uid()}`, isAdopted: false, createdAt: now() };
        set(s => ({ answers: [...s.answers, answer] }));
        return answer;
      },

      adoptAnswer: (postId, answerId, requesterId) => {
        const { posts, answers } = get();
        const post   = posts.find(p => p.id === postId);
        const answer = answers.find(a => a.id === answerId);
        if (!post || !answer)                                     return { ok: false, code: 'NOT_OWNER' };
        if (post.authorId !== requesterId)                        return { ok: false, code: 'NOT_OWNER' };
        if (answer.authorId === requesterId)                      return { ok: false, code: 'SELF_ANSWER' };
        if (answers.some(a => a.postId === postId && a.isAdopted)) return { ok: false, code: 'ALREADY_ADOPTED' };

        set(s => ({
          answers: s.answers.map(a => a.id === answerId ? { ...a, isAdopted: true } : a),
          posts:   s.posts.map(p => p.id === postId ? { ...p, status: 'RESOLVED' } : p),
        }));
        return { ok: true, reward: 2000 };
      },

      getPosts: (floor, tag = 'ALL', sort = 'latest', status = 'ALL') => {
        let list = [...get().posts];

        if (floor !== 'ALL') {
          const allowed = FLOOR_VILLAGES[floor] ?? [];
          list = list.filter(p => (allowed as string[]).includes(p.villageId));
        }
        if (tag !== 'ALL')    list = list.filter(p => p.tag === tag);
        if (status !== 'ALL') list = list.filter(p => p.status === status);

        if (sort === 'answers') {
          const cnt = get().answers.reduce<Record<string, number>>((acc, a) => {
            acc[a.postId] = (acc[a.postId] ?? 0) + 1; return acc;
          }, {});
          list.sort((a, b) => (cnt[b.id] ?? 0) - (cnt[a.id] ?? 0));
        } else {
          list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
        }
        return list;
      },

      getPost: (postId) => {
        const post = get().posts.find(p => p.id === postId);
        if (!post) return undefined;
        return { ...post, answers: get().answers.filter(a => a.postId === postId) };
      },

      countAnswers: (postId) => get().answers.filter(a => a.postId === postId).length,
    }),
    { name: 'woowa-forest-bulletin' }
  )
);
