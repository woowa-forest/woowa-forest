// 팀 전체가 공유하는 유틸 함수
// 추가 시 팀원에게 공지해주세요

// ===== 클래스 병합 (Tailwind 사용 시 유용) =====

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

// ===== 날짜 포맷 =====

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

// ===== 유틸 추가 시 여기에 작성 =====
