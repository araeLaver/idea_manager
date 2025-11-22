# Koyeb 배포 가이드

## 목차
1. [사전 준비](#사전-준비)
2. [배포 단계](#배포-단계)
3. [환경변수 설정](#환경변수-설정)
4. [트러블슈팅](#트러블슈팅)
5. [수정 이력](#수정-이력)

---

## 사전 준비

### 필수 요구사항
- Node.js 18 이상
- PostgreSQL 데이터베이스
- GitHub 계정
- Koyeb 계정

### PostgreSQL 데이터베이스 옵션
- **Neon** (무료 티어 제공) - https://neon.tech
- **Supabase** (무료 티어 제공) - https://supabase.com
- **Koyeb Postgres**
- **Railway**

---

## 배포 단계

### Step 1: GitHub 저장소 준비
```bash
git clone https://github.com/araeLaver/idea-manager.git
cd idea-manager
npm install
npm run build  # 빌드 테스트
```

### Step 2: Koyeb 서비스 생성
1. https://www.koyeb.com 로그인
2. Dashboard > **Create Service**
3. **GitHub** 선택
4. 저장소 `araeLaver/idea-manager` 선택
5. Branch: `main`

### Step 3: 빌더 설정
- **Builder**: Docker (Dockerfile 자동 감지)
- Dockerfile이 있으므로 별도 빌드 명령어 불필요

### Step 4: 포트 및 헬스체크 설정
```
Port: 8080
Health check path: /api/health
Health check port: 8080
```

### Step 5: 환경변수 설정
[환경변수 설정](#환경변수-설정) 섹션 참조

### Step 6: 배포
**Deploy** 버튼 클릭

---

## 환경변수 설정

### 필수 환경변수

| 변수명 | 예시 값 | 설명 |
|--------|---------|------|
| `NODE_ENV` | `production` | 프로덕션 모드 |
| `PORT` | `8080` | 서버 포트 (Koyeb 기본) |
| `DATABASE_HOST` | `ep-xxx.neon.tech` | DB 호스트 |
| `DATABASE_PORT` | `5432` | DB 포트 |
| `DATABASE_USER` | `username` | DB 사용자 |
| `DATABASE_PASSWORD` | `password` | DB 비밀번호 |
| `DATABASE_NAME` | `idea_manager` | DB 이름 |
| `JWT_SECRET` | `your-32-char-secret...` | JWT 시크릿 (32자 이상) |
| `FRONTEND_URL` | `https://your-app.koyeb.app` | CORS 허용 도메인 |

### 선택 환경변수

| 변수명 | 기본값 | 설명 |
|--------|--------|------|
| `DATABASE_SSL_MODE` | `require` | SSL 모드 |
| `DATABASE_SSL_REJECT_UNAUTHORIZED` | `true` | SSL 인증서 검증 |
| `DATABASE_POOL_MAX` | `20` | 최대 연결 풀 |
| `DATABASE_IDLE_TIMEOUT` | `30000` | 유휴 타임아웃 (ms) |
| `DATABASE_CONNECTION_TIMEOUT` | `2000` | 연결 타임아웃 (ms) |

### Neon PostgreSQL 연결 예시

Connection string:
```
postgresql://user:password@ep-cool-name-123456.us-east-2.aws.neon.tech/neondb?sslmode=require
```

환경변수로 분리:
```
DATABASE_HOST=ep-cool-name-123456.us-east-2.aws.neon.tech
DATABASE_USER=user
DATABASE_PASSWORD=password
DATABASE_NAME=neondb
DATABASE_PORT=5432
```

---

## 트러블슈팅

### 에러 1: Buildpack heroku-postbuild 실패

**증상:**
```
npm run heroku-postbuild
sh: 1: tsc: not found
exit status: 127
```

**원인:**
- Koyeb의 Heroku buildpack이 자동으로 `heroku-postbuild` 스크립트를 실행
- 이 단계에서 devDependencies가 제거되어 `tsc`를 찾지 못함

**해결:**
- Dockerfile 사용으로 전환 (buildpack 대신)
- 또는 빌드 명령어를 직접 지정

---

### 에러 2: Express 5 경로 패턴 오류

**증상:**
```
PathError [TypeError]: Missing parameter name at index 1: *
visit https://git.new/pathToRegexpError for info
```

**원인:**
- Express 5에서 와일드카드 경로 문법이 변경됨
- `app.get('*')` 형식이 더 이상 지원되지 않음

**해결:**
```javascript
// 변경 전 (Express 4)
app.get('*', handler);
app.use('/api/*', handler);

// 변경 후 (Express 5)
app.get('/{*path}', handler);
app.use('/api/{*path}', handler);
```

---

### 에러 3: Health Check 포트 불일치

**증상:**
```
Server running on port 8080
TCP health check failed on port 8000
```

**원인:**
- 앱은 8080 포트에서 실행
- Koyeb health check가 8000 포트를 검사

**해결:**
1. Koyeb Dashboard > Service > Settings > Health checks
2. Port를 `8080`으로 변경
3. Path: `/api/health`

---

### 에러 4: 데이터베이스 연결 타임아웃

**증상:**
```
Error: Connection terminated due to connection timeout
injecting env (0) from .env
```

**원인:**
- 환경변수가 설정되지 않음 (`(0)`은 0개 주입을 의미)
- 또는 데이터베이스 호스트에 연결할 수 없음

**해결:**
1. Koyeb Dashboard에서 모든 `DATABASE_*` 환경변수 확인
2. 데이터베이스가 외부 접속을 허용하는지 확인
3. SSL 설정 확인 (`DATABASE_SSL_MODE=require`)

---

### 에러 5: JWT Secret 관련

**증상:**
```
JWT_SECRET must be at least 32 characters in production
```

**원인:**
- Production 모드에서 JWT_SECRET이 32자 미만

**해결:**
- 32자 이상의 안전한 시크릿 키 생성:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

### 에러 6: CORS 오류

**증상:**
- 브라우저에서 API 호출 시 CORS 에러

**원인:**
- `FRONTEND_URL`이 실제 앱 도메인과 불일치

**해결:**
- `FRONTEND_URL`을 실제 배포된 URL로 설정
- 여러 도메인: `https://domain1.com,https://domain2.com`

---

### 에러 7: TypeScript Import 오류

**증상:**
```
error TS1484: 'ReactNode' is a type and must be imported using a type-only import
```

**원인:**
- `verbatimModuleSyntax` 설정으로 타입 import 방식이 엄격해짐

**해결:**
```typescript
// 변경 전
import React, { Component, ErrorInfo, ReactNode } from 'react';

// 변경 후
import React, { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
```

---

## 수정 이력

### 2024-11-19: Koyeb 배포 준비

#### 보안 개선
1. **JWT Secret 하드코딩 제거**
   - `server/src/middleware/auth.ts`
   - `server/src/routes/auth.ts`
   - 환경변수 필수화, production에서 32자 이상 요구

2. **SSL 인증서 검증 개선**
   - `server/src/database.ts`
   - Production 모드에서 기본적으로 SSL 검증 활성화

3. **비밀번호 강도 검증 추가**
   - `server/src/routes/auth.ts`
   - 8자 이상, 대문자/소문자/숫자 필수

4. **이메일 검증 추가**
   - `server/src/routes/auth.ts`
   - 형식 및 길이 검증

#### Koyeb 배포 준비
5. **정적 파일 서빙**
   - `server/src/index.ts`
   - Production 모드에서 dist/ 폴더 자동 서빙

6. **환경변수 검증**
   - `server/src/index.ts`
   - 서버 시작 시 필수 변수 확인

7. **Graceful Shutdown**
   - `server/src/index.ts`
   - SIGTERM/SIGINT 처리, DB 연결 정리

8. **Dockerfile 추가**
   - Multi-stage 빌드로 이미지 최적화
   - Production dependencies만 포함

#### 성능 최적화
9. **Ideas API 페이지네이션**
   - `server/src/routes/ideas.ts`
   - limit, offset, sorting 지원

10. **통계 쿼리 최적화**
    - `server/src/routes/ideas.ts`
    - 3개 쿼리를 1개 CTE로 통합

11. **DB 연결 풀 설정**
    - `server/src/database.ts`
    - 커스텀 풀 크기 설정 가능

#### 코드 정리
12. **Firebase 제거**
    - `src/config/firebase.ts` 삭제
    - `src/services/firebaseService.ts` 삭제
    - package.json에서 firebase 의존성 제거

13. **React Error Boundaries**
    - `src/components/ErrorBoundary.tsx` 추가
    - 전역 에러 처리

14. **Express 5 호환성**
    - 와일드카드 경로 패턴 수정 (`*` → `{*path}`)

15. **package.json 업데이트**
    - `npm start` 명령어 추가
    - tsx를 dependencies로 이동
    - engines 필드 추가 (Node 18+)

---

## 배포 체크리스트

### 배포 전
- [ ] 로컬에서 `npm run build` 성공
- [ ] 환경변수 준비 완료
- [ ] PostgreSQL 데이터베이스 준비 완료

### Koyeb 설정
- [ ] Builder: Docker 선택
- [ ] Port: 8080
- [ ] Health check port: 8080
- [ ] Health check path: /api/health
- [ ] 모든 환경변수 설정

### 배포 후
- [ ] Health check 통과 확인
- [ ] `/api/health` 엔드포인트 정상 응답
- [ ] 회원가입/로그인 테스트
- [ ] 아이디어 CRUD 테스트

---

## 유용한 명령어

### 로컬 개발
```bash
npm run dev:all     # 프론트엔드 + 백엔드 동시 실행
npm run dev         # 프론트엔드만
npm run dev:server  # 백엔드만
```

### 빌드 및 테스트
```bash
npm run build       # 프로덕션 빌드
npm run typecheck   # 타입 체크
npm run lint        # ESLint 검사
npm run test        # 테스트 실행
```

### 프로덕션
```bash
npm start           # 프로덕션 서버 실행
```

### JWT Secret 생성
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## 참고 링크

- [Koyeb 문서](https://www.koyeb.com/docs)
- [Express 5 마이그레이션 가이드](https://expressjs.com/en/guide/migrating-5.html)
- [Neon PostgreSQL](https://neon.tech/docs)
- [path-to-regexp 오류 해결](https://git.new/pathToRegexpError)
