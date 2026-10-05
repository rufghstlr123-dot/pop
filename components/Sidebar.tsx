"use client";
import React, { useState } from "react";
import { Plus, Loader2, ChevronDown } from "lucide-react";
import { InventoryStats } from "@/types/inventory";

interface SidebarProps {
  categories: string[];
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  stats: InventoryStats;
  onAddItem: (item: {
    category: string;
    location: string;
    borrower_name?: string;
    loaned_at?: string;
    expected_return_date?: string;
    description?: string;
  }) => Promise<void>;
  onResetData: () => void;
}

function getTodayString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatDateInput(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 8);
  if (digits.length <= 4) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 4)}-${digits.slice(4)}`;
  return `${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6, 8)}`;
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
  const [loanedAt, setLoanedAt] = useState(getTodayString);
  const [expectedReturnDate, setExpectedReturnDate] = useState("");
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLoanedAtChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLoanedAt(formatDateInput(e.target.value));
  };

  const handleExpectedReturnDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setExpectedReturnDate(formatDateInput(e.target.value));
  };

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
        loaned_at: loanedAt ? loanedAt.trim() : undefined,
        expected_return_date: expectedReturnDate ? expectedReturnDate.trim() : undefined,
        description: note.trim() || undefined,
      });
      // Reset fields
      setBorrower("");
      setLocation("");
      setExpectedReturnDate("");
      setNote("");
    } catch (err) {
      console.error(err);
      alert("등록에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <aside className="w-full lg:w-72 bg-[#fdfdfd] border-r border-[#d1d1d1] flex flex-col shrink-0 overflow-hidden h-full">
      {/* 1. Category Selection Section */}
      <div className="px-3.5 py-2.5 bg-[#f3f3f3] border-b border-[#d1d1d1] flex items-center justify-between">
        <h3 className="text-[0.85rem] font-bold text-[#217346] uppercase tracking-wider">
          카테고리 선택
        </h3>
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
              className={`w-full px-3 py-2 text-[0.85rem] font-semibold rounded-md border text-left transition-all ${
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

      {/* 2. New Item Registration Form */}
      <div className="px-3.5 py-2.5 bg-[#f3f3f3] border-b border-[#d1d1d1] flex items-center justify-between">
        <h3 className="text-[0.85rem] font-bold text-[#217346] uppercase tracking-wider flex items-center gap-1">
          <Plus className="w-3.5 h-3.5" />
          신규 물품 간편 등록
        </h3>
      </div>

      <div className="p-3.5 flex-1 overflow-y-auto space-y-2.5">
        <form onSubmit={handleSubmit} className="space-y-2.5">
          {/* Category Dropdown (Custom styled arrow with natural spacing) */}
          <div className="space-y-1">
            <label className="block text-[0.8rem] font-semibold text-[#333333]">
              카테고리 <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full pl-2.5 pr-8 py-1.5 border border-[#d1d1d1] rounded-md text-[0.85rem] bg-white appearance-none focus:outline-none focus:border-[#217346] focus:ring-2 focus:ring-[#e6f2ec] transition cursor-pointer"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-[#64748b] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* 설치 장소 */}
          <div className="space-y-1">
            <label className="block text-[0.8rem] font-semibold text-[#333333]">
              설치 장소 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="예: 1F 정문 앞 / B1 대행사장"
              className="w-full px-2.5 py-1.5 border border-[#d1d1d1] rounded-md text-[0.85rem] bg-white focus:outline-none focus:border-[#217346] focus:ring-2 focus:ring-[#e6f2ec] transition"
            />
          </div>

          {/* 대여자 */}
          <div className="space-y-1">
            <label className="block text-[0.8rem] font-semibold text-[#333333]">
              대여자
            </label>
            <input
              type="text"
              value={borrower}
              onChange={(e) => setBorrower(e.target.value)}
              placeholder="예: 이지은 매니저"
              className="w-full px-2.5 py-1.5 border border-[#d1d1d1] rounded-md text-[0.85rem] bg-white focus:outline-none focus:border-[#217346] focus:ring-2 focus:ring-[#e6f2ec] transition"
            />
          </div>

          {/* 대여 일자 & 반납 예정 일자 */}
          <div className="grid grid-cols-1 gap-2 pt-0.5">
            <div className="space-y-1">
              <label className="block text-[0.8rem] font-semibold text-[#333333]">
                대여 일자
              </label>
              <input
                type="text"
                maxLength={10}
                value={loanedAt}
                onChange={handleLoanedAtChange}
                placeholder="YYYY-MM-DD (예: 20261006)"
                className="w-full px-2.5 py-1.5 border border-[#d1d1d1] rounded-md text-[0.85rem] font-mono bg-white focus:outline-none focus:border-[#217346] focus:ring-2 focus:ring-[#e6f2ec] transition"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-[0.8rem] font-semibold text-[#333333]">
                반납 예정 일자
              </label>
              <input
                type="text"
                maxLength={10}
                value={expectedReturnDate}
                onChange={handleExpectedReturnDateChange}
                placeholder="YYYY-MM-DD (예: 20261008)"
                className="w-full px-2.5 py-1.5 border border-[#d1d1d1] rounded-md text-[0.85rem] font-mono bg-white focus:outline-none focus:border-[#217346] focus:ring-2 focus:ring-[#e6f2ec] transition"
              />
            </div>
          </div>

          {/* 비고 */}
          <div className="space-y-1">
            <label className="block text-[0.8rem] font-semibold text-[#333333]">
              비고
            </label>
            <textarea
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="예: 주말 사은행사 안내 고지용"
              className="w-full px-2.5 py-1.5 border border-[#d1d1d1] rounded-md text-[0.85rem] bg-white focus:outline-none focus:border-[#217346] focus:ring-2 focus:ring-[#e6f2ec] transition resize-none"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2 bg-[#217346] hover:bg-[#185a37] active:bg-[#0f3d24] text-white rounded-md text-[0.85rem] font-bold transition flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-50 mt-1"
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
            className="text-[0.8rem] text-[#666666] hover:text-[#217346] underline"
          >
            샘플 데이터로 초기화
          </button>
        </div>
      </div>
    </aside>
  );
};
