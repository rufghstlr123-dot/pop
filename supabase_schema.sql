-- ========================================================
-- The Hyundai Seoul Rental System - Database Schema
-- Supabase SQL Editor에 복사하여 [RUN]을 누르세요.
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
    loaned_at TIMESTAMPTZ,
    expected_return_date TIMESTAMPTZ,
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

-- 3. Row Level Security(RLS) 설정: 누구나 읽고 쓸 수 있도록 허용 (간단한 대여관리용)
ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rental_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public all access on items" ON public.items
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow public all access on rental_logs" ON public.rental_logs
    FOR ALL USING (true) WITH CHECK (true);

-- 4. 실시간(Realtime) 복제 활성화 (페이지 새로고침 없이 전세계 동시 동기화)
ALTER PUBLICATION supabase_realtime ADD TABLE public.items;
ALTER PUBLICATION supabase_realtime ADD TABLE public.rental_logs;

-- 5. 더현대 서울 초기 샘플 데이터 시딩
INSERT INTO public.items (id, name, category, code, location, status, borrower_name, borrower_contact, loaned_at, description)
VALUES 
('hyd-01', '뱅앤올룹슨 Beosound Explore 포터블 스피커', '음향/오디오', 'HYD-AU-01', '6F ALT.1 복합문화공간 라운지', 'AVAILABLE', NULL, NULL, NULL, '아웃도어 방수 블루투스 스피커. 야외 행사 및 라운지 음악 재생용.'),
('hyd-02', '라이카 SOFORT 2 하이브리드 즉석 카메라', '카메라/영상', 'HYD-CAM-02', '1F 워터폴 가든 안내데스크', 'LOANED', '이지은 매니저', '홍보마케팅팀 (내선 2401)', now() - interval '4 hours', '사운즈 포레스트 팝업 스토어 현장 스케치 및 VIP 증정 사진 촬영용.'),
('hyd-03', '다이슨 에어랩 멀티 스타일러 컴플리트', '뷰티/스타일링', 'HYD-BT-03', '5F 사운즈 포레스트 파우더룸', 'AVAILABLE', NULL, NULL, NULL, '임직원 및 쇼룸 촬영용 헤어 스타일링 세트.'),
('hyd-04', '맥북 프로 16형 M3 Max (스페이스 블랙)', 'IT/업무장비', 'HYD-IT-04', '3F VIP 자스민 라운지 데스크', 'LOANED', '김태호 디렉터', '공간기획실 (010-8921-XXXX)', now() - interval '1 day', '미디어 파사드 전시 영상 렌더링 및 프리젠테이션용 고성능 랩탑.'),
('hyd-05', '소니 WH-1000XM5 노이즈 캔슬링 헤드폰', '음향/오디오', 'HYD-AU-05', 'B2 크리에이티브 그라운드 오피스', 'AVAILABLE', NULL, NULL, NULL, '집중 업무 및 영상 편집 모니터링용 프리미엄 헤드폰.'),
('hyd-06', 'DJI Osmo Pocket 3 크리에이터 콤보', '카메라/영상', 'HYD-CAM-06', 'B1 테이스티 서울 미디어룸', 'AVAILABLE', NULL, NULL, NULL, '4K 120fps 핸드헬드 짐벌 카메라. 인스타그램 릴스 및 매장 숏폼 제작용.')
ON CONFLICT (id) DO NOTHING;
