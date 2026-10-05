"use client";
import React from "react";
import { RefreshCw } from "lucide-react";

interface HeaderProps {
  onRefresh: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onRefresh }) => {
  return (
    <header className="px-6 py-3 bg-white border-b border-[#d1d1d1] flex items-center justify-between gap-3 shrink-0">
      {/* Brand Title (Exact match to sp-blond .header-left h1) */}
      <div className="flex items-center">
        <h1 className="font-['Outfit',sans-serif] text-[1.25rem] font-bold text-[#217346] tracking-tight leading-tight">
          판매기획팀 POP 대여
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
