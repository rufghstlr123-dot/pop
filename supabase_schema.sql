-- ========================================================
-- 판매기획팀 POP 대여 시스템 - Supabase 클라우드 실시간 DB 스키마
-- Supabase 대시보드 -> [SQL Editor] -> [New query]에 붙여넣고 [Run]을 누르세요.
-- ========================================================

-- 1. 물품 테이블 (items)
CREATE TABLE IF NOT EXISTS public.items (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    code TEXT NOT NULL,
    location TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'AVAILABLE' CHECK (status IN ('AVAILABLE', 'LOANED')),
    borrower_name TEXT,
    borrower_contact TEXT,
    loaned_at TEXT,
    expected_return_date TEXT,
    returned_at TEXT,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. 대여/반납 로그 테이블 (rental_logs)
CREATE TABLE IF NOT EXISTS public.rental_logs (
    id BIGSERIAL PRIMARY KEY,
    item_id TEXT NOT NULL,
    item_name TEXT NOT NULL,
    action TEXT NOT NULL CHECK (action IN ('BORROW', 'RETURN')),
    user_name TEXT NOT NULL,
    note TEXT,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. Row Level Security(RLS) 설정: 누구나 실시간 읽고 쓸 수 있도록 허용
ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rental_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public all access on items" ON public.items;
CREATE POLICY "Allow public all access on items" ON public.items
    FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public all access on rental_logs" ON public.rental_logs;
CREATE POLICY "Allow public all access on rental_logs" ON public.rental_logs
    FOR ALL USING (true) WITH CHECK (true);

-- 4. 실시간(Realtime) 전세계 동기화 활성화 (새로고침 없이 0.1초 내 즉시 화면 반영)
ALTER PUBLICATION supabase_realtime ADD TABLE public.items;
ALTER PUBLICATION supabase_realtime ADD TABLE public.rental_logs;

-- 5. 초기 기본 데이터 등록
INSERT INTO public.items (id, name, category, code, location, status, borrower_name, borrower_contact, loaned_at, expected_return_date, returned_at, description)
VALUES 
('pop-01', 'A2 POP (1F 정문 안내데스크)', 'A2 POP', 'A2-01', '1F 정문 안내데스크 앞', 'LOANED', '이지은 매니저', '홍보마케팅팀', '2026-10-05', '2026-10-07', NULL, '주말 사은행사 안내 고지 POP 설치'),
('pop-02', 'A2 POP (5F 사운즈 포레스트 입구)', 'A2 POP', 'A2-02', '5F 사운즈 포레스트 입구', 'AVAILABLE', '김민수 대리', '영업기획팀', '2026-10-02', '2026-10-04', '2026-10-04', '정원 가든 투어 안내 POP'),
('pop-03', 'A3 POP (6F 복합문화공간 ALT.1)', 'A3 POP', 'A3-01', '6F 복합문화공간 ALT.1 티켓부스', 'LOANED', '김태호 디렉터', '공간기획실', '2026-10-04', '2026-10-07', NULL, '특별 전시 관람 안내 A3 스탠드'),
('pop-04', 'A3 POP (B1 대행사장 중앙)', 'A3 POP', 'A3-02', 'B1 대행사장 중앙 기둥 앞', 'AVAILABLE', '최유나 파트장', '마케팅실', '2026-10-01', '2026-10-03', '2026-10-03', 'F&B 팝업 안내 A3'),
('pop-05', '철제배너 (B2 지하철 연결통로)', '철제배너', 'BNR-01', 'B2 지하철 연결통로 입구', 'LOANED', '박서준 파트장', '영업기획팀', '2026-10-03', '2026-10-09', NULL, '시즌 오프 프로모션 대형 철제 배너'),
('pop-06', '철제배너 (3F 에스컬레이터 상행선)', '철제배너', 'BNR-02', '3F 에스컬레이터 상행선 앞', 'AVAILABLE', '정하나 매니저', '고객서비스팀', '2026-09-28', '2026-10-02', '2026-10-02', '멤버십 가입 안내 배너')
ON CONFLICT (id) DO NOTHING;
