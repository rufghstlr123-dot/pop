# 🌿 THE HYUNDAI RENTAL · 더현대 서울 실시간 물품 대여/반납 시스템

> **더현대 서울(Sounds Forest) 시그니처 포레스트 그린 테마**로 디자인된 프리미엄 실시간 물품 대여/반납 관제 웹 애플리케이션입니다.  
> 서로 다른 여러 접속자가 각자의 기기나 브라우저에서 접속해도 **새로고침 없이 실시간(Realtime)으로 100% 동일한 화면을 동기화**합니다.

---

## ✨ 핵심 기능

1. **🌿 더현대 그린(Sounds Forest) 시그니처 디자인**
   - 딥 포레스트 그린(`#1D3728`), 소프트 세이지, 크림 베이지 톤앤매너
   - 고급 백화점 VIP 라운지 감성의 타이포그래피 및 카드 레이아웃
2. **⚡ 완벽한 실시간 다중 동기화 (Multi-Client Real-Time)**
   - **스마트 듀얼 엔진 탑재**:
     - **클라우드 모드**: Supabase Realtime (PostgreSQL 변경 이벤트 즉시 수신)
     - **로컬 모드**: Browser BroadcastChannel & Storage Event 자동 감지 (별도 설정 없이 동일 PC 내 다중 브라우저 창 실시간 동기화 지원)
   - 다른 사용자가 대여하거나 반납하면 0.1초 만에 상태 변경 및 알림 토스트 팝업
3. **📋 물품 대여 / 반납 프로세스**
   - 물품별 대여 상태(`대여 가능`, `대여 중`) 실시간 표시
   - 대여자 성함, 소속 부서, 연락처, 반납 예정일, 용도 기록
   - 반납 시 점검 메모 및 즉시 대여 가능 복귀
4. **📊 실시간 현황 대시보드 & 검색/필터**
   - 전체 품목 수, 현재 대여 중, 즉시 대여 가능 수치 요약
   - 카테고리별 탭 필터링 (음향/오디오, 카메라/영상, IT/업무장비, 뷰티 등)
   - 물품명, 관리코드(`#HYD-CAM`), 위치, 대여자명 실시간 통합 검색
5. **📜 실시간 대여/반납 타임라인 이력**
   - 모든 대여/반납 활동이 시간순으로 자동 기록

---

## 🚀 빠른 시작 (Local Test)

```bash
# 1. 의존성 패키지 설치
npm install

# 2. 로컬 개발 서버 시작
npm run dev
```

브라우저에서 `http://localhost:3000` 접속 후, **브라우저 창을 2개 띄워 나란히 놓거나 시크릿 모드 창을 열어 테스트해보세요.**  
한쪽 창에서 [대여하기] 또는 [반납하기]를 누르면 다른 창에서도 **새로고침 없이 즉시 화면이 실시간으로 바뀝니다!**

---

## 🌐 깃허브(GitHub) & 버셀(Vercel) 배포 가이드

### 1단계: Supabase 데이터베이스 생성 (무료, 2분)
1. [Supabase](https://supabase.com)에 로그인 후 새 프로젝트 생성
2. 좌측 메뉴 **SQL Editor** 클릭 후, 본 저장소의 `supabase_schema.sql` 내용을 복사하여 붙여넣고 **[Run]** 실행
3. 좌측 하단 **Project Settings > API** 메뉴에서 다음 2가지 값 확인:
   - `Project URL`
   - `anon public key`

### 2단계: GitHub에 저장소 푸시
```bash
git init
git add .
git commit -m "feat: 더현대 그린 테마 실시간 물품 대여 시스템"
git branch -M main
git remote add origin https://github.com/사용자아이디/저장소명.git
git push -u origin main
```

### 3단계: Vercel에 배포 & 실시간 연동
1. [Vercel](https://vercel.com) 로그인 후 **Add New... > Project** 클릭
2. 방금 푸시한 GitHub 저장소를 선택하고 **Import**
3. **Environment Variables**에 다음 2가지 값을 추가:
   - Name: `NEXT_PUBLIC_SUPABASE_URL` / Value: `1단계의 Project URL`
   - Name: `NEXT_PUBLIC_SUPABASE_ANON_KEY` / Value: `1단계의 anon public key`
4. **[Deploy]** 클릭!
5. 배포 완료 후 제공되는 URL로 누구나 실시간으로 동일한 화면을 보며 대여/반납할 수 있습니다.

---

## 🛠 기술 스택

- **Framework**: Next.js 14 (App Router, TypeScript)
- **Styling**: Tailwind CSS, Lucide Icons, Glassmorphism
- **Database & Realtime Engine**: Supabase (PostgreSQL + Realtime WebSockets)
- **Local Fallback**: HTML5 BroadcastChannel API & Window Storage Event
- **Deployment**: Vercel & GitHub Actions
