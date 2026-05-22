// 팀 전체가 공유하는 타입 정의
// 추가 시 팀원에게 공지해주세요

// ===== API 공통 =====

export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
}

export interface ApiError {
  message: string;
  code: string;
  status: number;
}

// ===== 공통 UI 상태 =====

export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

// ===== 도메인 타입 (프로젝트 시작 후 채워주세요) =====

// export interface User {
//   id: string;
//   name: string;
// }
