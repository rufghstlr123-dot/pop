"use client";
import React, { useState, useEffect } from "react";
import { Clock, Settings, X, Lock } from "lucide-react";
import { StockTotals } from "@/lib/inventory-service";

const STOCK_CONFIG_PASSWORD = "2222";

export interface CategoryStockSummary {
  key: keyof StockTotals;
  label: string;
  remaining: number;
  loaned: number;
}

interface HeaderProps {
  stockSummaries?: CategoryStockSummary[];
  stockTotals?: StockTotals;
  onUpdateStockTotals?: (totals: StockTotals) => Promise<void>;
}

const DAY_NAMES = ["일", "월", "화", "수", "목", "금", "토"];

function getFormattedDateTime(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const dayName = DAY_NAMES[now.getDay()];
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");
  return `${year}. ${month}. ${day} (${dayName}) ${hours}:${minutes}:${seconds}`;
}

const BADGE_COLORS: Record<keyof StockTotals, string> = {
  "A2 POP": "bg-[#e0f2fe] text-[#0369a1] border-[#bae6fd]",
  "A3 POP": "bg-[#fef3c7] text-[#b45309] border-[#fde68a]",
  "철제배너": "bg-[#f3e8ff] text-[#7e22ce] border-[#e9d5ff]",
};

export const Header: React.FC<HeaderProps> = ({
  stockSummaries = [],
  stockTotals,
  onUpdateStockTotals,
}) => {
  const [currentDateTime, setCurrentDateTime] = useState<string>("");
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [draftTotals, setDraftTotals] = useState<StockTotals>({
    "A2 POP": 14,
    "A3 POP": 11,
    "철제배너": 13,
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setCurrentDateTime(getFormattedDateTime());
    const timer = setInterval(() => {
      setCurrentDateTime(getFormattedDateTime());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (stockTotals) {
      setDraftTotals(stockTotals);
    }
  }, [stockTotals]);

  const handleOpenConfig = () => {
    setIsUnlocked(false);
    setPasswordInput("");
    setPasswordError("");
    setIsConfigOpen(true);
  };

  const handleCloseConfig = () => {
    setIsConfigOpen(false);
    setIsUnlocked(false);
    setPasswordInput("");
    setPasswordError("");
  };

  const handleVerifyPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === STOCK_CONFIG_PASSWORD) {
      setIsUnlocked(true);
      setPasswordError("");
    } else {
      setPasswordError("비밀번호가 올바르지 않습니다.");
      setPasswordInput("");
    }
  };

  const handleSaveTotals = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onUpdateStockTotals) return;
    setIsSaving(true);
    try {
      await onUpdateStockTotals(draftTotals);
      handleCloseConfig();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <header className="px-6 py-3 bg-white border-b border-[#d1d1d1] flex flex-wrap items-center justify-between gap-3 shrink-0">
        {/* Brand Title */}
        <div className="flex items-center shrink-0">
          <h1 className="font-['Outfit',sans-serif] text-[1.25rem] font-bold text-[#217346] tracking-tight leading-tight">
            판매기획팀 POP 대여
          </h1>
        </div>

        {/* Center: A2 / A3 / 철제배너 잔여수량 / 대여수량 */}
        {stockSummaries.length > 0 && (
          <div className="flex flex-wrap items-center justify-center gap-2">
            {stockSummaries.map((item) => (
              <div
                key={item.key}
                className="flex items-center gap-1.5 bg-[#f8fafc] px-2.5 py-1 rounded-md border border-[#cbd5e1] text-[0.78rem] shadow-2xs"
              >
                <span
                  className={`px-1.5 py-0.5 rounded text-[0.72rem] font-bold border ${BADGE_COLORS[item.key]}`}
                >
                  {item.label}
                </span>
                <span className="text-[#94a3b8] font-bold">:</span>
                <span className="text-[#334155] font-medium whitespace-nowrap">
                  잔여수량{" "}
                  <strong className="text-[#217346] font-bold">{item.remaining}개</strong>
                </span>
                <span className="text-[#cbd5e1]">/</span>
                <span className="text-[#334155] font-medium whitespace-nowrap">
                  대여수량{" "}
                  <strong className="text-[#c2410c] font-bold">{item.loaned}개</strong>
                </span>
              </div>
            ))}

            {onUpdateStockTotals && (
              <button
                type="button"
                onClick={handleOpenConfig}
                className="p-1.5 rounded-md text-[#64748b] hover:text-[#217346] hover:bg-[#e6f2ec] border border-transparent hover:border-[#cbd5e1] transition cursor-pointer"
                title="계산용 총 수량 설정"
              >
                <Settings className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}

        {/* Right Controls */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Realtime Live Clock */}
          {currentDateTime && (
            <div className="flex items-center gap-2 bg-[#f8fafc] px-3.5 py-1.5 rounded-md border border-[#cbd5e1] shadow-2xs">
              <Clock className="w-4 h-4 text-[#217346]" />
              <span className="font-mono text-[0.92rem] font-bold text-[#0f172a] tracking-tight">
                {currentDateTime}
              </span>
            </div>
          )}
        </div>
      </header>

      {/* Hidden Total Stock Configuration Modal (used for calculation only) */}
      {isConfigOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-[2px]">
          <div className="bg-white border border-[#d1d1d1] rounded-xl w-full max-w-xs shadow-2xl overflow-hidden">
            <div className="bg-[#217346] text-white px-4 py-2.5 flex items-center justify-between">
              <h2 className="text-[0.95rem] font-bold flex items-center gap-1.5">
                {!isUnlocked && <Lock className="w-4 h-4" />}
                <span>{isUnlocked ? "보유 총 수량 설정 (계산용)" : "관리자 비밀번호 확인"}</span>
              </h2>
              <button
                type="button"
                onClick={handleCloseConfig}
                className="w-6 h-6 rounded hover:bg-white/20 flex items-center justify-center text-white transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {!isUnlocked ? (
              <form onSubmit={handleVerifyPassword} className="p-4 space-y-3 text-[0.85rem]">
                <p className="text-[0.8rem] text-[#475569] leading-snug">
                  보유 총 수량을 수정하려면 비밀번호를 입력해주세요.
                </p>
                <input
                  type="password"
                  inputMode="numeric"
                  autoFocus
                  value={passwordInput}
                  onChange={(e) => {
                    setPasswordInput(e.target.value);
                    if (passwordError) setPasswordError("");
                  }}
                  placeholder="비밀번호 입력"
                  className="w-full px-3 py-2 border border-[#d1d1d1] rounded-md text-center font-mono text-[0.95rem] tracking-widest focus:outline-none focus:border-[#217346] focus:ring-2 focus:ring-[#e6f2ec]"
                />
                {passwordError && (
                  <p className="text-[0.75rem] text-red-600 font-semibold text-center">
                    {passwordError}
                  </p>
                )}
                <div className="pt-2 flex items-center justify-end gap-2 border-t border-[#eeeeee]">
                  <button
                    type="button"
                    onClick={handleCloseConfig}
                    className="px-3 py-1.5 rounded-md border border-[#d1d1d1] bg-white text-[#333333] text-[0.8rem] font-semibold hover:bg-slate-100 transition"
                  >
                    취소
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1.5 rounded-md bg-[#217346] hover:bg-[#185a37] text-white text-[0.8rem] font-bold transition"
                  >
                    확인
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleSaveTotals} className="p-4 space-y-3 text-[0.85rem]">
                <p className="text-[0.75rem] text-[#64748b] leading-snug">
                  입력한 총 수량에서 현재 대여 중인 수량을 차감하여 잔여수량을 자동 계산합니다.
                </p>
                {(["A2 POP", "A3 POP", "철제배너"] as (keyof StockTotals)[]).map((cat) => (
                  <div key={cat} className="flex items-center justify-between gap-3">
                    <label className="font-semibold text-[#333333]">{cat}</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={draftTotals[cat]}
                      onChange={(e) => {
                        const val = parseInt(e.target.value.replace(/\D/g, ""), 10);
                        setDraftTotals((prev) => ({
                          ...prev,
                          [cat]: isNaN(val) ? 0 : val,
                        }));
                      }}
                      className="w-24 px-2.5 py-1 border border-[#d1d1d1] rounded-md text-center font-semibold focus:outline-none focus:border-[#217346] focus:ring-2 focus:ring-[#e6f2ec]"
                    />
                  </div>
                ))}
                <div className="pt-2 flex items-center justify-end gap-2 border-t border-[#eeeeee]">
                  <button
                    type="button"
                    onClick={handleCloseConfig}
                    disabled={isSaving}
                    className="px-3 py-1.5 rounded-md border border-[#d1d1d1] bg-white text-[#333333] text-[0.8rem] font-semibold hover:bg-slate-100 transition"
                  >
                    취소
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-3 py-1.5 rounded-md bg-[#217346] hover:bg-[#185a37] text-white text-[0.8rem] font-bold transition disabled:opacity-50"
                  >
                    {isSaving ? "저장 중..." : "저장"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
};
