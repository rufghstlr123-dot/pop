"use client";
import React from "react";
import { Sparkles, Plus, History, Cloud, Radio, HelpCircle } from "lucide-react";

interface HeaderProps {
  isCloud: boolean;
  onOpenAddModal: () => void;
  onOpenHistoryModal: () => void;
  onOpenGuideModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  isCloud,
  onOpenAddModal,
  onOpenHistoryModal,
  onOpenGuideModal,
}) => {
  return (
    <header className="border-b border-hyundai-creamDark bg-[#FAF9F5]/90 backdrop-blur-md sticky top-0 z-30 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand Logo & Name */}
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 rounded-full bg-hyundai-primary flex items-center justify-center text-white shadow-md">
              <span className="font-serif text-lg font-bold tracking-widest text-[#E5DEC9]">H</span>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-hyundai-dark">
                  THE HYUNDAI
                </span>
                <span className="text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full bg-hyundai-sageLight text-hyundai-primary font-medium border border-hyundai-sage/30">
                  Sounds Forest
                </span>
              </div>
              <p className="text-xs text-hyundai-muted font-light tracking-wider">
                RENTAL CONCIERGE · 물품 대여 & 반납 실시간 관리
              </p>
            </div>
          </div>

          {/* Action Buttons & Status */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Realtime Status Indicator */}
            <div
              onClick={onOpenGuideModal}
              className="hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded-full bg-white/80 border border-stone-200 text-xs text-hyundai-charcoal cursor-pointer hover:bg-stone-50 transition shadow-sm"
              title="클릭하여 실시간 연동 상태 및 Vercel 배포 가이드 확인"
            >
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span className="font-medium text-[11px] tracking-wide text-hyundai-primary flex items-center gap-1">
                {isCloud ? (
                  <>
                    <Cloud className="w-3 h-3 text-emerald-600" />
                    Supabase 실시간 연동
                  </>
                ) : (
                  <>
                    <Radio className="w-3 h-3 text-emerald-600" />
                    실시간 동기화 활성
                  </>
                )}
              </span>
              <HelpCircle className="w-3 h-3 text-stone-400" />
            </div>

            {/* History Button */}
            <button
              onClick={onOpenHistoryModal}
              className="flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium text-hyundai-primary bg-stone-100 hover:bg-stone-200 transition border border-stone-200"
            >
              <History className="w-4 h-4" />
              <span className="hidden md:inline">대여/반납</span>
              <span>기록</span>
            </button>

            {/* Add Item Button */}
            <button
              onClick={onOpenAddModal}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium text-white bg-hyundai-primary hover:bg-hyundai-accent transition shadow-sm hover:shadow"
            >
              <Plus className="w-4 h-4" />
              <span>물품 등록</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
