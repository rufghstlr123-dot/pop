"use client";
import React from "react";
import { History, Cloud, Radio, HelpCircle, RefreshCw, LayoutGrid, Table } from "lucide-react";

interface HeaderProps {
  isCloud: boolean;
  totalCount: number;
  availableCount: number;
  loanedCount: number;
  statusFilter: "ALL" | "AVAILABLE" | "LOANED";
  onStatusFilterChange: (st: "ALL" | "AVAILABLE" | "LOANED") => void;
  viewMode: "TABLE" | "GRID";
  onToggleViewMode: (mode: "TABLE" | "GRID") => void;
  onOpenHistoryModal: () => void;
  onOpenGuideModal: () => void;
  onRefresh: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  isCloud,
  totalCount,
  availableCount,
  loanedCount,
  statusFilter,
  onStatusFilterChange,
  viewMode,
  onToggleViewMode,
  onOpenHistoryModal,
  onOpenGuideModal,
  onRefresh,
}) => {
  return (
    <header className="px-5 py-3.5 bg-white border-b border-[#d1d1d1] flex flex-wrap items-center justify-between gap-3 shrink-0">
      {/* Brand Title */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-[#217346] flex items-center justify-center text-white font-bold text-base shadow-sm">
          H
        </div>
        <div>
          <h1 className="font-['Outfit',sans-serif] text-lg sm:text-xl font-bold text-[#217346] tracking-tight leading-tight">
            THE HYUNDAI RENTAL
          </h1>
          <p className="text-[11px] text-[#666666] font-medium leading-none mt-0.5">
            서비스데스크 물품 대여·반납 관제 시스템
          </p>
        </div>
      </div>

      {/* Filter Action Buttons (Like sp-blond header buttons) */}
      <div className="flex items-center gap-1.5 flex-wrap">
        <button
          onClick={() => onStatusFilterChange("ALL")}
          className={`px-3 py-1.5 rounded-md text-xs font-semibold border transition-all ${
            statusFilter === "ALL"
              ? "bg-[#217346] text-white border-[#217346]"
              : "bg-white text-[#333333] border-[#d1d1d1] hover:bg-[#e6f2ec] hover:text-[#217346]"
          }`}
        >
          전체 물품 ({totalCount})
        </button>

        <button
          onClick={() => onStatusFilterChange("AVAILABLE")}
          className={`px-3 py-1.5 rounded-md text-xs font-semibold border transition-all ${
            statusFilter === "AVAILABLE"
              ? "bg-[#217346] text-white border-[#217346]"
              : "bg-white text-[#333333] border-[#d1d1d1] hover:bg-[#e6f2ec] hover:text-[#217346]"
          }`}
        >
          대여 가능 ({availableCount})
        </button>

        <button
          onClick={() => onStatusFilterChange("LOANED")}
          className={`px-3 py-1.5 rounded-md text-xs font-semibold border transition-all ${
            statusFilter === "LOANED"
              ? "bg-[#c2410c] text-white border-[#c2410c]"
              : "bg-white text-[#333333] border-[#d1d1d1] hover:bg-[#ffedd5] hover:text-[#c2410c]"
          }`}
        >
          대여 중 ({loanedCount})
        </button>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2">
        {/* View Mode Toggle */}
        <div className="flex items-center border border-[#d1d1d1] rounded-md overflow-hidden bg-white">
          <button
            onClick={() => onToggleViewMode("TABLE")}
            className={`p-1.5 text-xs flex items-center gap-1 ${
              viewMode === "TABLE"
                ? "bg-[#217346] text-white font-medium"
                : "text-[#666666] hover:bg-slate-100"
            }`}
            title="스프레드시트 표 형태"
          >
            <Table className="w-3.5 h-3.5" />
            <span className="hidden sm:inline text-[11px]">테이블</span>
          </button>
          <button
            onClick={() => onToggleViewMode("GRID")}
            className={`p-1.5 text-xs flex items-center gap-1 ${
              viewMode === "GRID"
                ? "bg-[#217346] text-white font-medium"
                : "text-[#666666] hover:bg-slate-100"
            }`}
            title="카드 형태"
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span className="hidden sm:inline text-[11px]">카드</span>
          </button>
        </div>

        {/* Realtime Status Indicator */}
        <div
          onClick={onOpenGuideModal}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-[#d1d1d1] bg-[#f8fafc] text-xs text-[#333333] cursor-pointer hover:bg-slate-100 transition"
          title="실시간 연동 상태"
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
          <span className="hidden md:inline">대여/반납</span>
          <span>기록</span>
        </button>

        {/* Refresh */}
        <button
          onClick={onRefresh}
          className="p-1.5 rounded-md border border-[#d1d1d1] bg-white hover:bg-slate-100 text-[#666666] transition"
          title="새로고침"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>
    </header>
  );
};
