"use client";
import React from "react";
import { Package, CheckCircle2, Clock, Activity, ArrowUpRight } from "lucide-react";
import { InventoryStats } from "@/types/inventory";

interface StatsBannerProps {
  stats: InventoryStats;
  isCloud: boolean;
  onFilterChange: (status: "ALL" | "AVAILABLE" | "LOANED") => void;
  currentFilter: "ALL" | "AVAILABLE" | "LOANED";
}

export const StatsBanner: React.FC<StatsBannerProps> = ({
  stats,
  isCloud,
  onFilterChange,
  currentFilter,
}) => {
  const rentalRate = stats.total > 0 ? Math.round((stats.loaned / stats.total) * 100) : 0;

  return (
    <div className="mb-8">
      {/* Editorial Headline */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="h-1.5 w-6 bg-hyundai-gold rounded-full inline-block"></span>
            <span className="text-xs font-semibold uppercase tracking-widest text-hyundai-primary">
              The Hyundai Realtime Inventory
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-hyundai-dark tracking-tight">
            보태니컬 라운지 물품 대여 센터
          </h1>
          <p className="text-sm text-hyundai-muted mt-1 font-light">
            접속자 누구나 실시간으로 동일한 대여 현황을 확인하고 즉시 반납 및 대여를 처리할 수 있습니다.
          </p>
        </div>

        {/* Sync Mode Badge */}
        <div className="flex items-center gap-2 text-xs text-stone-600 bg-white/70 backdrop-blur-sm border border-stone-200/80 px-3.5 py-2 rounded-xl self-start md:self-auto shadow-sm">
          <Activity className="w-4 h-4 text-emerald-600 animate-pulse" />
          <span>
            {isCloud ? (
              <strong className="text-hyundai-primary">Supabase 글로벌 실시간 동기화 중</strong>
            ) : (
              <strong className="text-hyundai-primary">로컬 실시간 다중 창 동기화 중</strong>
            )}
          </span>
        </div>
      </div>

      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Items */}
        <button
          onClick={() => onFilterChange("ALL")}
          className={`text-left p-5 rounded-2xl border transition-all relative overflow-hidden group ${
            currentFilter === "ALL"
              ? "bg-hyundai-primary text-white border-hyundai-primary shadow-lg ring-2 ring-hyundai-primary/20"
              : "bg-white hover:bg-stone-50/80 text-hyundai-dark border-stone-200 shadow-sm"
          }`}
        >
          <div className="flex items-center justify-between">
            <span
              className={`text-xs font-medium tracking-wide uppercase ${
                currentFilter === "ALL" ? "text-stone-300" : "text-stone-500"
              }`}
            >
              전체 보유 물품
            </span>
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                currentFilter === "ALL" ? "bg-white/10 text-[#E5DEC9]" : "bg-stone-100 text-hyundai-primary"
              }`}
            >
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-serif font-bold tracking-tight">{stats.total}</span>
            <span
              className={`text-xs ${
                currentFilter === "ALL" ? "text-stone-300" : "text-stone-500"
              }`}
            >
              개 품목
            </span>
          </div>
          <div
            className={`mt-2 text-xs flex items-center gap-1 ${
              currentFilter === "ALL" ? "text-emerald-300" : "text-hyundai-muted"
            }`}
          >
            <span>대여율 {rentalRate}% 가동 중</span>
            <ArrowUpRight className="w-3 h-3 opacity-70 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition" />
          </div>
        </button>

        {/* Available Items */}
        <button
          onClick={() => onFilterChange("AVAILABLE")}
          className={`text-left p-5 rounded-2xl border transition-all relative overflow-hidden group ${
            currentFilter === "AVAILABLE"
              ? "bg-[#1B4D36] text-white border-[#1B4D36] shadow-lg ring-2 ring-emerald-500/20"
              : "bg-white hover:bg-stone-50/80 text-hyundai-dark border-stone-200 shadow-sm"
          }`}
        >
          <div className="flex items-center justify-between">
            <span
              className={`text-xs font-medium tracking-wide uppercase ${
                currentFilter === "AVAILABLE" ? "text-emerald-200" : "text-emerald-700"
              }`}
            >
              즉시 대여 가능
            </span>
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                currentFilter === "AVAILABLE" ? "bg-white/10 text-emerald-200" : "bg-emerald-50 text-emerald-700"
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-serif font-bold tracking-tight text-emerald-950 dark:text-white">
              {stats.available}
            </span>
            <span
              className={`text-xs ${
                currentFilter === "AVAILABLE" ? "text-emerald-200" : "text-stone-500"
              }`}
            >
              개 이용 가능
            </span>
          </div>
          <div
            className={`mt-2 text-xs flex items-center gap-1 ${
              currentFilter === "AVAILABLE" ? "text-emerald-200" : "text-emerald-700"
            }`}
          >
            <span>지금 바로 대여할 수 있는 장비</span>
          </div>
        </button>

        {/* Loaned Items */}
        <button
          onClick={() => onFilterChange("LOANED")}
          className={`text-left p-5 rounded-2xl border transition-all relative overflow-hidden group ${
            currentFilter === "LOANED"
              ? "bg-[#8A451E] text-white border-[#8A451E] shadow-lg ring-2 ring-amber-500/20"
              : "bg-white hover:bg-stone-50/80 text-hyundai-dark border-stone-200 shadow-sm"
          }`}
        >
          <div className="flex items-center justify-between">
            <span
              className={`text-xs font-medium tracking-wide uppercase ${
                currentFilter === "LOANED" ? "text-amber-200" : "text-amber-800"
              }`}
            >
              현재 대여 진행 중
            </span>
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                currentFilter === "LOANED" ? "bg-white/10 text-amber-200" : "bg-amber-50 text-amber-700"
              }`}
            >
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-serif font-bold tracking-tight">
              {stats.loaned}
            </span>
            <span
              className={`text-xs ${
                currentFilter === "LOANED" ? "text-amber-200" : "text-stone-500"
              }`}
            >
              개 대여 중
            </span>
          </div>
          <div
            className={`mt-2 text-xs flex items-center gap-1 ${
              currentFilter === "LOANED" ? "text-amber-200" : "text-amber-800"
            }`}
          >
            <span>반납 처리 및 대여자 확인 가능</span>
          </div>
        </button>
      </div>
    </div>
  );
};
