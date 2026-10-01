"use client";
import React, { useState } from "react";
import { Plus, Tag, Package, MapPin, Sparkles, Loader2, BarChart3 } from "lucide-react";
import { Item, InventoryStats } from "@/types/inventory";

interface SidebarProps {
  categories: string[];
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  stats: InventoryStats;
  onAddItem: (item: Omit<Item, "id" | "status" | "borrower_name" | "borrower_contact" | "loaned_at" | "expected_return_date" | "created_at">) => Promise<void>;
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
  const [name, setName] = useState("");
  const [category, setCategory] = useState("카메라/영상");
  const [code, setCode] = useState(() => "HYD-" + Math.floor(100 + Math.random() * 900));
  const [location, setLocation] = useState("5F 사운즈 포레스트 인포데스크");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleGenerateCode = () => {
    const prefixMap: Record<string, string> = {
      "음향/오디오": "HYD-AU",
      "카메라/영상": "HYD-CAM",
      "IT/업무장비": "HYD-IT",
      "뷰티/스타일링": "HYD-BT",
      "행사/의전": "HYD-EV",
      "기타 편의용품": "HYD-ETC",
    };
    const prefix = prefixMap[category] || "HYD-GEN";
    const rand = Math.floor(10 + Math.random() * 90);
    setCode(`${prefix}-${rand}`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert("물품명을 입력해주세요.");
      return;
    }

    setIsSubmitting(true);
    try {
      await onAddItem({
        name: name.trim(),
        category,
        code: code.trim() || "HYD-" + Date.now().toString().slice(-4),
        location: location.trim(),
        description: description.trim() || null,
      });
      setName("");
      setDescription("");
      handleGenerateCode();
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
      {/* 1. Category Selection Section */}
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
              onClick={() => onSelectCategory(cat)}
              className={`w-full px-3 py-1.5 text-xs font-semibold rounded-md border text-left transition-all ${
                isActive
                  ? "bg-[#217346] text-white border-[#217346]"
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
            대여 가동률
          </span>
          <span className="font-bold text-[#217346] font-mono">{rentalRate}%</span>
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

      {/* 3. New Item Registration Form */}
      <div className="px-3.5 py-2.5 bg-[#f3f3f3] border-b border-[#d1d1d1] flex items-center justify-between">
        <h3 className="text-xs font-bold text-[#217346] uppercase tracking-wider flex items-center gap-1">
          <Plus className="w-3.5 h-3.5" />
          신규 물품 간편 등록
        </h3>
      </div>

      <div className="p-3 flex-1 overflow-y-auto space-y-2.5">
        <form onSubmit={handleSubmit} className="space-y-2.5">
          <div className="space-y-1">
            <label className="block text-[11px] font-bold text-[#333333]">
              물품명 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="예: 소니 FX3 시네마 카메라"
              className="w-full px-2.5 py-1.5 border border-[#d1d1d1] rounded-md text-xs bg-white focus:outline-none focus:border-[#217346] focus:ring-2 focus:ring-[#e6f2ec] transition"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-[11px] font-bold text-[#333333]">
              카테고리
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-2.5 py-1.5 border border-[#d1d1d1] rounded-md text-xs bg-white focus:outline-none focus:border-[#217346] focus:ring-2 focus:ring-[#e6f2ec] transition cursor-pointer"
            >
              {categories
                .filter((c) => c !== "전체")
                .map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
            </select>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold text-[#333333]">
                관리 코드
              </label>
              <button
                type="button"
                onClick={handleGenerateCode}
                className="text-[10px] text-[#217346] font-semibold hover:underline flex items-center gap-0.5"
              >
                <Sparkles className="w-2.5 h-2.5" />
                자동생성
              </button>
            </div>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="HYD-CAM-08"
              className="w-full px-2.5 py-1.5 border border-[#d1d1d1] rounded-md text-xs font-mono bg-white focus:outline-none focus:border-[#217346] focus:ring-2 focus:ring-[#e6f2ec] transition"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-[11px] font-bold text-[#333333]">
              비치 위치
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="예: 6F ALT.1 복합문화공간"
              className="w-full px-2.5 py-1.5 border border-[#d1d1d1] rounded-md text-xs bg-white focus:outline-none focus:border-[#217346] focus:ring-2 focus:ring-[#e6f2ec] transition"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-[11px] font-bold text-[#333333]">
              상세 설명
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="구성품 또는 보관 주의사항"
              className="w-full px-2.5 py-1.5 border border-[#d1d1d1] rounded-md text-xs bg-white focus:outline-none focus:border-[#217346] focus:ring-2 focus:ring-[#e6f2ec] transition resize-none"
            />
          </div>

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
                <span>물품 등록하기</span>
              </>
            )}
          </button>
        </form>

        <div className="pt-2 border-t border-[#d1d1d1] text-center">
          <button
            onClick={onResetData}
            className="text-[11px] text-[#666666] hover:text-[#217346] underline"
          >
            기본 샘플 데이터로 복구
          </button>
        </div>
      </div>
    </aside>
  );
};
