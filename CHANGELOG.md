# Changelog

## [2025-01-01] 게스트 데이터 마이그레이션

### 새로운 기능

#### 게스트→회원 데이터 이전 기능
- **로그인/회원가입 시 데이터 마이그레이션**: 게스트 모드에서 작성한 아이디어와 메모를 계정으로 이전
- **마이그레이션 옵션 UI**: 게스트 데이터가 있을 때 자동으로 표시
- **데이터 개수 표시**: 이전할 아이디어/메모 개수 미리 확인
- **선택적 이전**: 체크박스로 이전 여부 선택 가능 (기본값: 이전함)
- **성공 메시지**: 이전 완료 시 결과 표시 후 자동 이동

### 수정된 파일
- `src/services/api.ts` - `migrateGuestData()` 메서드 추가
- `src/contexts/AuthContext.tsx` - 마이그레이션 로직 및 헬퍼 함수 추가
  - `getGuestDataInfo()`: 게스트 데이터 개수 조회
  - `hasGuestData()`: 게스트 데이터 존재 여부 확인
  - `login()`, `register()`: 마이그레이션 옵션 파라미터 추가
- `src/pages/Login.tsx` - 마이그레이션 옵션 UI 추가
- `src/pages/Register.tsx` - 마이그레이션 옵션 UI 추가

### 사용자 흐름
```
게스트 모드로 아이디어/메모 작성
    ↓
회원가입 또는 로그인 페이지 이동
    ↓
"게스트 데이터 발견" 알림 표시 (아이디어 N개, 메모 N개)
    ↓
"계정으로 데이터 이전하기" 체크 (기본 체크됨)
    ↓
회원가입/로그인 완료 → 데이터 자동 이전
    ↓
"데이터 이전 완료!" 메시지 → 대시보드로 이동
```

### 커밋 히스토리
- `b59317a` feat: Add guest data migration on login/register
- `01f5ad3` feat: Extend guest mode support to all pages

---

## [2024-12-30] 게스트 모드 및 랜딩 페이지 개선

### 새로운 기능

#### 1. 랜딩 페이지 개선 (`src/pages/LandingPage.tsx`)
- **앱 미리보기 캐러셀**: 대시보드, 아이디어 목록, 칸반 보드, 데일리 메모 4개 화면 소개
- **툴팁 컴포넌트**: "비회원 둘러보기" 버튼에 상세 정보 툴팁 추가
- **주요 기능 소개**: 6가지 핵심 기능 카드 형태로 표시
- **사용 방법 안내**: 3단계 사용 가이드 섹션
- **반응형 디자인**: 모바일/데스크톱 최적화

#### 2. 게스트 모드 (`src/services/guestStorage.ts`)
- **로컬 스토리지 서비스**: 비회원 사용자를 위한 오프라인 데이터 관리
- **샘플 데이터 자동 생성**:
  - 아이디어 4개 (모바일 습관 추적 앱, 로컬 맛집 큐레이션, AI 학습 도우미, 친환경 포장재)
  - 샘플 메모 1개
- **전체 CRUD 지원**: 아이디어/메모 생성, 수정, 삭제, 검색, 필터링
- **통계 기능**: 게스트 모드에서도 대시보드 통계 제공

#### 3. 게스트 모드 통합
- **DataContext 업데이트** (`src/contexts/DataContext.tsx`):
  - `isGuest` 플래그 기반 분기 처리
  - 게스트 모드 진입 시 자동 초기화
- **DailyMemos 페이지 지원** (`src/pages/DailyMemos.tsx`):
  - 게스트 모드 배지 표시
  - 로컬 스토리지 메모 관리

#### 4. 게스트 모드 종료 기능 (`src/components/Layout.tsx`)
- **"게스트 종료" 버튼**: 헤더에 추가 (데스크톱/모바일)
- **원클릭 종료**: 클릭 시 게스트 세션 종료 → 랜딩 페이지로 이동

### 새로운 파일
- `src/services/guestStorage.ts` - 게스트 모드 로컬 스토리지 서비스
- `src/components/Tooltip.tsx` - 재사용 가능한 툴팁 컴포넌트

### 수정된 파일
- `src/pages/LandingPage.tsx` - 앱 미리보기, 툴팁 추가
- `src/contexts/DataContext.tsx` - 게스트 모드 지원
- `src/pages/DailyMemos.tsx` - 게스트 모드 지원
- `src/components/Layout.tsx` - 게스트 종료 버튼 추가

### 사용자 흐름
```
새 방문자 → 랜딩 페이지 (소개)
    ↓
"비회원 둘러보기" 클릭 → 게스트 모드 (샘플 데이터로 체험)
    ↓
"게스트 종료" 클릭 → 랜딩 페이지로 복귀
    ↓
"회원가입" 또는 "로그인" → 정식 사용
```

### 커밋 히스토리
- `fad2eda` feat: Add guest mode exit button in Layout
- `902904c` feat: Add guest mode with local storage support
- `774c02b` feat: Enhance landing page with guest mode tooltip and app preview
