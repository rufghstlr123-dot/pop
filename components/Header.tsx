"use client";
import React from "react";
import { RefreshCw } from "lucide-react";

interface HeaderProps {
  onRefresh: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onRefresh }) => {
  return (
    <header className="px-5 py-3.5 bg-white border-b border-[#d1d1d1] flex items-center justify-between gap-3 shrink-0">
      {/* Brand Title */}
      <div className="flex items-center gap-2.5">
        <div className="w-7 h-7 rounded bg-[#217346] flex items-center justify-center text-white font-bold text-sm shadow-sm font-['Outfit',sans-serif]">
          H
        </div>
        <h1 className="font-['Outfit',sans-serif] text-base sm:text-lg font-bold text-[#217346] tracking-tight leading-tight">
          THEHYUNDAI RENTAL : 판매기획팀 POP 대여
        </h1>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2">
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
