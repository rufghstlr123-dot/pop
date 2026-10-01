"use client";
import React from "react";
import { History, HelpCircle, RefreshCw } from "lucide-react";

interface HeaderProps {
  isCloud: boolean;
  onOpenHistoryModal: () => void;
  onOpenGuideModal: () => void;
  onRefresh: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  isCloud,
  onOpenHistoryModal,
  onOpenGuideModal,
  onRefresh,
}) => {
  return (
    <header className="px-5 py-3 bg-white border-b border-[#d1d1d1] flex items-center justify-between gap-3 shrink-0">
      {/* Brand Title (sp-blond header-left) */}
      <div className="flex items-center gap-2.5">
        <div className="w-7 h-7 rounded bg-[#217346] flex items-center justify-center text-white font-bold text-sm shadow-sm font-['Outfit',sans-serif]">
          H
        </div>
        <div>
          <h1 className="font-['Outfit',sans-serif] text-base sm:text-lg font-bold text-[#217346] tracking-tight leading-tight">
            THE HYUNDAI RENTAL
          </h1>
          <p className="text-[10.5px] text-[#666666] font-medium leading-none mt-0.5">
            서비스데스크 A2·A3 POP / 철제배너 대여·설치 관리
          </p>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2">
        {/* Realtime Status Indicator (Like sp-blond sync dot) */}
        <div
          onClick={onOpenGuideModal}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-[#d1d1d1] bg-[#f8fafc] text-xs text-[#333333] cursor-pointer hover:bg-slate-100 transition"
          title="실시간 연동 상태 확인"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
          </span>
          <span className="text-[11px] font-semibold text-[#217346] hidden sm:inline">
            {isCloud ? "Supabase 연동" : "실시간 연동 중"}
          </span>
          <HelpCircle className="w-3 h-3 text-slate-400" />
        </div>

        {/* History Modal Button */}
        <button
          onClick={onOpenHistoryModal}
          className="px-2.5 py-1.5 rounded-md border border-[#d1d1d1] bg-white hover:bg-[#e6f2ec] text-[#217346] text-xs font-semibold flex items-center gap-1 transition"
        >
          <History className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">대여/반납</span>
          <span>기록</span>
        </button>

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
