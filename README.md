# 아이디어 매니저 (Idea Manager)

창의적인 아이디어와 사업 구상을 체계적으로 관리할 수 있는 풀스택 웹 애플리케이션입니다.

![React](https://img.shields.io/badge/React-19-61DAFB?style=flat&logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?style=flat&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-7-646CFF?style=flat&logo=vite&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=flat&logo=postgresql&logoColor=white)
![Express](https://img.shields.io/badge/Express-5-000000?style=flat&logo=express&logoColor=white)

## 주요 기능

### 아이디어 관리
- **CRUD 기능**: 아이디어 생성, 조회, 수정, 삭제
- **상태 관리**: 초안, 진행중, 완료, 보관됨
- **우선순위**: 높음, 보통, 낮음
- **카테고리 분류**: 자유로운 카테고리 설정
- **태그 시스템**: 다중 태그로 아이디어 분류
- **히스토리 추적**: 모든 변경 이력 자동 기록

### 칸반 보드
- **드래그&드롭**: 직관적인 상태 변경
- **4개 컬럼**: 초안 → 진행중 → 완료 → 보관됨
- **실시간 업데이트**: 드롭 시 즉시 상태 저장

### 대시보드
- **통계 카드**: 총 아이디어, 완료율, 진행중, 높은 우선순위
- **차트**: 상태별/우선순위별 분포 시각화
- **최근 활동**: 최근 수정된 아이디어 목록
- **인기 카테고리/태그**: 상위 사용 현황

### 일일 메모
- **날짜별 메모**: 매일의 기록 관리
- **빠른 접근**: 대시보드에서 오늘의 메모 입력

### AI 기능
- **카테고리 자동 분류**: 키워드 기반 자동 분류
- **태그 자동 제안**: 내용 기반 태그 추천
- **아이디어 개선 제안**: 완성도 향상 가이드

### 사용자 인터페이스
- **반응형 디자인**: 데스크톱, 태블릿, 모바일 지원
- **다크 모드**: 라이트/다크 테마 전환
- **키보드 단축키**: Ctrl+N (새 아이디어), Ctrl+K (검색) 등
- **PWA 지원**: 오프라인 사용 및 앱 설치 가능

## 기술 스택

### Frontend
- **React 19** + TypeScript 5.8
- **Vite 7** - 빌드 도구
- **React Router DOM 7** - 라우팅
- **Recharts** - 차트 시각화
- **@dnd-kit** - 드래그&드롭
- **Lucide React** - 아이콘
- **date-fns** - 날짜 처리

### Backend
- **Express 5** - API 서버
- **PostgreSQL** - 데이터베이스
- **JWT** - 인증
- **bcryptjs** - 비밀번호 암호화

## 시작하기

### 필수 조건
- Node.js 18+
- npm
- PostgreSQL 데이터베이스

### 설치

```bash
# 저장소 클론
git clone https://github.com/araeLaver/idea-manager.git
cd idea-manager

# 의존성 설치
npm install
```

### 환경 변수 설정

`.env` 파일 생성:

```env
# Database Configuration
DATABASE_HOST=your-database-host
DATABASE_USER=your-username
DATABASE_PASSWORD=your-password
DATABASE_NAME=your-database

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key

# API Configuration
PORT=3001
FRONTEND_URL=http://localhost:5173

# Frontend API URL
VITE_API_URL=http://localhost:3001/api
```

### 실행

```bash
# 백엔드 서버만 실행
npm run dev:server

# 프론트엔드만 실행
npm run dev

# 동시 실행 (권장)
npm run dev:all
```

### 빌드

```bash
npm run build
```

## API 문서

### 인증 API

| Method | Endpoint | 설명 |
|--------|----------|------|
| POST | `/api/auth/register` | 회원가입 |
| POST | `/api/auth/login` | 로그인 |
| GET | `/api/auth/me` | 현재 사용자 정보 |
| PUT | `/api/auth/profile` | 프로필 수정 |
| PUT | `/api/auth/password` | 비밀번호 변경 |

#### 회원가입
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123",
    "name": "홍길동"
  }'
```

#### 로그인
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

### 아이디어 API

| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/api/ideas` | 목록 조회 (필터/검색) |
| GET | `/api/ideas/:id` | 상세 조회 |
| POST | `/api/ideas` | 생성 |
| PUT | `/api/ideas/:id` | 수정 |
| DELETE | `/api/ideas/:id` | 삭제 |
| GET | `/api/ideas/stats/summary` | 통계 |
| PATCH | `/api/ideas/bulk/status` | 일괄 상태 변경 |

#### 아이디어 생성
```bash
curl -X POST http://localhost:3001/api/ideas \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "title": "AI 기반 추천 시스템",
    "description": "사용자 행동 기반 개인화 추천",
    "category": "기술",
    "tags": ["AI", "ML", "추천"],
    "status": "draft",
    "priority": "high",
    "targetMarket": "이커머스 플랫폼",
    "potentialRevenue": "월 1000만원",
    "resources": "ML 엔지니어 2명",
    "timeline": "6개월"
  }'
```

#### 목록 조회 (필터링)
```bash
# 상태별 필터
curl "http://localhost:3001/api/ideas?status=in-progress" \
  -H "Authorization: Bearer YOUR_TOKEN"

# 검색
curl "http://localhost:3001/api/ideas?search=AI" \
  -H "Authorization: Bearer YOUR_TOKEN"

# 복합 필터
curl "http://localhost:3001/api/ideas?status=draft&priority=high&category=기술" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 메모 API

| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/api/memos` | 목록 조회 |
| GET | `/api/memos/date/:date` | 날짜별 조회 |
| POST | `/api/memos` | 생성/수정 |
| DELETE | `/api/memos/:id` | 삭제 |
| DELETE | `/api/memos/date/:date` | 날짜별 삭제 |

#### 메모 저장
```bash
curl -X POST http://localhost:3001/api/memos \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "date": "2024-01-15",
    "content": "오늘의 아이디어 회의 내용..."
  }'
```

### 히스토리 API

| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/api/history` | 전체 이력 |
| GET | `/api/history/idea/:ideaId` | 아이디어별 이력 |
| GET | `/api/history/recent` | 최근 활동 요약 |

## 데이터베이스 스키마

### users 테이블
```sql
CREATE TABLE idea_manager.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### ideas 테이블
```sql
CREATE TABLE idea_manager.ideas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES idea_manager.users(id) ON DELETE CASCADE,
  title VARCHAR(500) NOT NULL,
  description TEXT,
  category VARCHAR(100),
  tags TEXT[] DEFAULT '{}',
  status VARCHAR(50) DEFAULT 'draft',
  priority VARCHAR(20) DEFAULT 'medium',
  notes TEXT,
  target_market TEXT,
  potential_revenue TEXT,
  resources TEXT,
  timeline TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### daily_memos 테이블
```sql
CREATE TABLE idea_manager.daily_memos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES idea_manager.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, date)
);
```

### idea_history 테이블
```sql
CREATE TABLE idea_manager.idea_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  idea_id UUID NOT NULL REFERENCES idea_manager.ideas(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES idea_manager.users(id) ON DELETE CASCADE,
  action VARCHAR(50) NOT NULL,
  old_values JSONB,
  new_values JSONB,
  changed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

## 프로젝트 구조

```
idea-manager/
├── server/                    # 백엔드
│   └── src/
│       ├── index.ts          # Express 서버 진입점
│       ├── database.ts       # DB 연결 및 스키마 초기화
│       ├── middleware/
│       │   └── auth.ts       # JWT 인증 미들웨어
│       └── routes/
│           ├── auth.ts       # 인증 라우트
│           ├── ideas.ts      # 아이디어 CRUD
│           ├── memos.ts      # 메모 CRUD
│           └── history.ts    # 히스토리 조회
├── src/                       # 프론트엔드
│   ├── components/           # 재사용 컴포넌트
│   │   ├── Layout.tsx
│   │   ├── AIAssistant.tsx
│   │   └── AIFeatures.tsx
│   ├── pages/                # 페이지 컴포넌트
│   │   ├── Dashboard.tsx
│   │   ├── IdeaList.tsx
│   │   ├── IdeaDetail.tsx
│   │   ├── IdeaForm.tsx
│   │   ├── KanbanBoard.tsx
│   │   ├── SearchPage.tsx
│   │   ├── History.tsx
│   │   ├── DailyMemos.tsx
│   │   ├── Login.tsx
│   │   └── Register.tsx
│   ├── contexts/             # React Context
│   │   ├── AuthContext.tsx
│   │   ├── DataContext.tsx
│   │   └── ThemeContext.tsx
│   ├── services/             # API 서비스
│   │   ├── api.ts
│   │   └── aiService.ts
│   ├── hooks/                # 커스텀 훅
│   ├── types/                # TypeScript 타입
│   └── utils/                # 유틸리티
├── public/                    # 정적 파일
├── .env                       # 환경 변수
├── package.json
├── vite.config.ts
└── README.md
```

## 키보드 단축키

| 단축키 | 기능 |
|--------|------|
| `Ctrl/Cmd + N` | 새 아이디어 추가 |
| `Ctrl/Cmd + K` | 검색 페이지 |
| `Ctrl/Cmd + D` | 다크모드 토글 |
| `1` | 대시보드 |
| `2` | 아이디어 목록 |
| `3` | 칸반 보드 |
| `4` | 히스토리 |
| `G + D` | 대시보드로 이동 |
| `G + L` | 목록으로 이동 |
| `G + K` | 칸반으로 이동 |

## 스크립트

```bash
npm run dev          # 프론트엔드 개발 서버
npm run dev:server   # 백엔드 개발 서버
npm run dev:all      # 동시 실행
npm run build        # 프로덕션 빌드
npm run start:server # 백엔드 프로덕션 실행
npm run lint         # ESLint 실행
npm run test         # 테스트 실행
npm run test:ui      # 테스트 UI
npm run test:coverage # 커버리지 리포트
```

## 배포

### Vercel (프론트엔드)

1. Vercel에 프로젝트 연결
2. 환경 변수 설정: `VITE_API_URL`
3. 자동 배포

### 백엔드 서버

1. PostgreSQL 데이터베이스 준비
2. 환경 변수 설정
3. `npm run start:server` 실행

## 라이선스

MIT License

## 연락처

프로젝트 링크: [https://github.com/araeLaver/idea-manager](https://github.com/araeLaver/idea-manager)
