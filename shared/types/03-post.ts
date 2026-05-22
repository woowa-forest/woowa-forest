import type { Village } from './01-member';

export type PostTag    = 'QUESTION' | 'SHARE' | 'CHAT';
export type PostStatus = 'OPEN' | 'RESOLVED';

export interface Post {
  id:         string;
  authorId:   string;
  authorName: string;
  villageId:  Village;
  title:      string;
  body:       string;
  tag:        PostTag;
  status:     PostStatus;
  createdAt:  string;
  updatedAt:  string;
}

export interface Answer {
  id:         string;
  postId:     string;
  authorId:   string;
  authorName: string;
  body:       string;
  isAdopted:  boolean;
  createdAt:  string;
}

export type AdoptError = 'ALREADY_ADOPTED' | 'SELF_ANSWER' | 'NOT_OWNER';
