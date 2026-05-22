export type Field   = 'AN' | 'FE' | 'BE';
export type Village = 'GURI' | 'TAECHO' | 'PPOLONG' | 'DUMBA' | 'FRONTEND' | 'ANDROID' | 'COACH';

export interface Member {
  id:                 string;
  crewName:           string;
  field:              Field;
  githubId:           string;
  village:            Village;
  bio:                string;
  wooMaBalance:       number;
  avatarCostumeId:    string | null;
  lastGithubSyncTime: string | null;
}

export interface AuthState {
  member:      Member | null;
  accessToken: string | null;
  isLoggedIn:  boolean;
}

export const FIELD_LABEL: Record<Field, string> = {
  AN: 'Android',
  FE: 'Frontend',
  BE: 'Backend',
};

export const VILLAGE_LABEL: Record<Village, string> = {
  GURI:     'BE 구리마을',
  TAECHO:   'BE 태초마을',
  PPOLONG:  'BE 뽀롱뽀롱마을',
  DUMBA:    'BE 둠바족',
  FRONTEND: 'FE 프론트엔드 마을',
  ANDROID:  'AN 안드로이드 제국',
  COACH:    '코치',
};

export const VILLAGE_FLOOR: Record<Village, number> = {
  GURI:     11,
  ANDROID:  11,
  TAECHO:   12,
  FRONTEND: 12,
  PPOLONG:  13,
  DUMBA:    13,
  COACH:    12,
};

export const VILLAGE_FIELD: Record<Village, Field> = {
  GURI:     'BE',
  ANDROID:  'AN',
  TAECHO:   'BE',
  FRONTEND: 'FE',
  PPOLONG:  'BE',
  DUMBA:    'BE',
  COACH:    'BE',
};
