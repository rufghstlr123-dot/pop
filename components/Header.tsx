"use client";
import React, { useState, useEffect } from "react";
import { RefreshCw } from "lucide-react";

interface HeaderProps {
  onRefresh: () => void;
}

function getFormattedDateTime(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

export const Header: React.FC<HeaderProps> = ({ onRefresh }) => {
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
        {/* Realtime Live Clock */}
        {currentDateTime && (
          <div className="font-mono text-[0.85rem] font-medium text-[#475569] bg-[#f8fafc] px-3 py-1 rounded-md border border-[#e2e8f0]">
            {currentDateTime}
          </div>
        )}

        {/* Refresh */}
        <button
          onClick={onRefresh}
          className="p-1.5 rounded-md border border-[#d1d1d1] bg-white hover:bg-slate-100 text-[#666666] transition"
          title="데이터 새로고침"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>
    </header>
  );
};
