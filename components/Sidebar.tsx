"use client";
import React, { useState } from "react";
import { Plus, User, MapPin, FileText, Loader2, BarChart3 } from "lucide-react";
import { Item, InventoryStats } from "@/types/inventory";

interface SidebarProps {
  categories: string[];
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  stats: InventoryStats;
  onAddItem: (item: {
    category: string;
    location: string;
    borrower_name?: string;
    description?: string;
  }) => Promise<void>;
  onResetData: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
  stats,
  onAddItem,
  onResetData,
}) => {
  const [category, setCategory] = useState(selectedCategory === "전체" ? "A2 POP" : selectedCategory);
  const [borrower, setBorrower] = useState("");
  const [location, setLocation] = useState("");
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!location.trim()) {
      alert("설치 장소를 입력해주세요.");
      return;
    }

    setIsSubmitting(true);
    try {
      await onAddItem({
        category,
        location: location.trim(),
        borrower_name: borrower.trim() || undefined,
        description: note.trim() || undefined,
      });
      // Reset fields
      setBorrower("");
      setLocation("");
      setNote("");
    } catch (err) {
      console.error(err);
      alert("등록에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const rentalRate = stats.total > 0 ? Math.round((stats.loaned / stats.total) * 100) : 0;

  return (
    <aside className="w-full lg:w-72 bg-[#fdfdfd] border-r border-[#d1d1d1] flex flex-col shrink-0 overflow-hidden h-full">
      {/* 1. Category Selection Section (sp-blond calendar-tabs-sidebar) */}
      <div className="px-3.5 py-2.5 bg-[#f3f3f3] border-b border-[#d1d1d1] flex items-center justify-between">
        <h3 className="text-xs font-bold text-[#217346] uppercase tracking-wider">
          카테고리 선택
        </h3>
        <span className="text-[10px] text-[#666666] font-medium font-mono">
          {stats.total} ITEMS
        </span>
      </div>

      <div className="p-2.5 bg-white border-b border-[#d1d1d1] space-y-1">
        {categories.map((cat) => {
          const isActive = selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => {
                onSelectCategory(cat);
                setCategory(cat);
              }}
              className={`w-full px-3 py-2 text-xs font-semibold rounded-md border text-left transition-all ${
                isActive
                  ? "bg-[#217346] text-white border-[#217346] shadow-xs"
                  : "bg-white text-[#333333] border-[#d1d1d1] hover:bg-[#e6f2ec] hover:text-[#217346]"
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* 2. Mini Stats Box */}
      <div className="p-3 bg-[#f8fafc] border-b border-[#d1d1d1] text-xs">
        <div className="flex items-center justify-between text-[#666666] mb-1">
          <span className="font-semibold flex items-center gap-1">
            <BarChart3 className="w-3.5 h-3.5 text-[#217346]" />
            대여 현황
          </span>
          <span className="font-bold text-[#217346] font-mono">{rentalRate}% 대여 중</span>
        </div>
        <div className="w-full bg-[#e2e8f0] h-2 rounded-full overflow-hidden">
          <div
            className="bg-[#217346] h-full transition-all duration-500"
            style={{ width: `${rentalRate}%` }}
          />
        </div>
        <div className="flex items-center justify-between mt-2 text-[11px] text-[#666666]">
          <span>가용: <strong className="text-emerald-700">{stats.available}개</strong></span>
          <span>대여 중: <strong className="text-amber-800">{stats.loaned}개</strong></span>
        </div>
      </div>

      {/* 3. New Item Registration Form (Customized per user request) */}
      <div className="px-3.5 py-2 bg-[#f3f3f3] border-b border-[#d1d1d1] flex items-center justify-between">
        <h3 className="text-xs font-bold text-[#217346] uppercase tracking-wider flex items-center gap-1">
          <Plus className="w-3.5 h-3.5" />
          신규 물품 간편 등록
        </h3>
      </div>

      <div className="p-3 flex-1 overflow-y-auto space-y-2.5">
        <form onSubmit={handleSubmit} className="space-y-2.5">
          {/* Category Dropdown */}
          <div className="space-y-1">
            <label className="block text-[11px] font-bold text-[#333333]">
              카테고리 <span className="text-red-500">*</span>
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-2.5 py-1.5 border border-[#d1d1d1] rounded-md text-xs bg-white focus:outline-none focus:border-[#217346] focus:ring-2 focus:ring-[#e6f2ec] transition cursor-pointer"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* 설치 장소 (Replaced 비치 위치) */}
          <div className="space-y-1">
            <label className="block text-[11px] font-bold text-[#333333]">
              설치 장소 <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="예: 1F 정문 앞 / B1 대행사장"
                className="w-full px-2.5 py-1.5 border border-[#d1d1d1] rounded-md text-xs bg-white focus:outline-none focus:border-[#217346] focus:ring-2 focus:ring-[#e6f2ec] transition"
              />
            </div>
          </div>

          {/* 대여자 (Replaced 관리 코드) */}
          <div className="space-y-1">
            <label className="block text-[11px] font-bold text-[#333333]">
              대여자
            </label>
            <div className="relative">
              <input
                type="text"
                value={borrower}
                onChange={(e) => setBorrower(e.target.value)}
                placeholder="예: 이지은 매니저 / 미입력 시 가용 상태"
                className="w-full px-2.5 py-1.5 border border-[#d1d1d1] rounded-md text-xs bg-white focus:outline-none focus:border-[#217346] focus:ring-2 focus:ring-[#e6f2ec] transition"
              />
            </div>
          </div>

          {/* 비고 (Replaced 상세 설명) */}
          <div className="space-y-1">
            <label className="block text-[11px] font-bold text-[#333333]">
              비고
            </label>
            <textarea
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="예: 주말 사은행사 안내 고지용"
              className="w-full px-2.5 py-1.5 border border-[#d1d1d1] rounded-md text-xs bg-white focus:outline-none focus:border-[#217346] focus:ring-2 focus:ring-[#e6f2ec] transition resize-none"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2 bg-[#217346] hover:bg-[#185a37] active:bg-[#0f3d24] text-white rounded-md text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-50 mt-1"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>등록 중...</span>
              </>
            ) : (
              <>
                <Plus className="w-3.5 h-3.5" />
                <span>등록하기</span>
              </>
            )}
          </button>
        </form>

        <div className="pt-2 border-t border-[#d1d1d1] text-center">
          <button
            onClick={onResetData}
            className="text-[11px] text-[#666666] hover:text-[#217346] underline"
          >
            샘플 데이터로 초기화
          </button>
        </div>
      </div>
    </aside>
  );
};
