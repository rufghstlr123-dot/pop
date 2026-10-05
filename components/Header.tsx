"use client";
import React, { useState, useEffect } from "react";
import { RefreshCw, History, Clock } from "lucide-react";

interface HeaderProps {
  onRefresh: () => void;
  onOpenHistory: () => void;
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

export const Header: React.FC<HeaderProps> = ({ onRefresh, onOpenHistory }) => {
  const [currentDateTime, setCurrentDateTime] = useState<string>("");

  useEffect(() => {
    setCurrentDateTime(getFormattedDateTime());
    const timer = setInterval(() => {
      setCurrentDateTime(getFormattedDateTime());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="px-6 py-3 bg-white border-b border-[#d1d1d1] flex items-center justify-between gap-3 shrink-0">
      {/* Brand Title */}
      <div className="flex items-center">
        <h1 className="font-['Outfit',sans-serif] text-[1.25rem] font-bold text-[#217346] tracking-tight leading-tight">
          판매기획팀 POP 대여
        </h1>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Realtime Live Clock - High Legibility */}
        {currentDateTime && (
          <div className="flex items-center gap-2 bg-[#f8fafc] px-3.5 py-1.5 rounded-md border border-[#cbd5e1] shadow-2xs">
            <Clock className="w-4 h-4 text-[#217346]" />
            <span className="font-mono text-[0.92rem] font-bold text-[#0f172a] tracking-tight">
              {currentDateTime}
            </span>
          </div>
        )}

        {/* 과거 반납 기록 버튼 */}
        <button
          onClick={onOpenHistory}
          className="px-3 py-1.5 rounded-md border border-[#d1d1d1] bg-white hover:bg-[#e6f2ec] text-[#217346] text-[0.85rem] font-bold flex items-center gap-1.5 transition shadow-2xs"
          title="과거 반납 완료된 내역 확인"
        >
          <History className="w-4 h-4 text-[#217346]" />
          <span>과거 반납 기록</span>
        </button>

        {/* Refresh */}
        <button
          onClick={onRefresh}
          className="p-2 rounded-md border border-[#d1d1d1] bg-white hover:bg-slate-100 text-[#666666] transition"
          title="데이터 새로고침"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>
    </header>
  );
};
