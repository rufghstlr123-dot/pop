"use client";
import React, { useState } from "react";
import { X, Plus, Package, MapPin, Tag, FileText, Sparkles, Loader2 } from "lucide-react";
import { Item } from "@/types/inventory";

interface AddItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (newItem: Omit<Item, "id" | "status" | "borrower_name" | "borrower_contact" | "loaned_at" | "expected_return_date" | "created_at">) => Promise<void>;
}

const CATEGORIES = [
  "음향/오디오",
  "카메라/영상",
  "IT/업무장비",
  "뷰티/스타일링",
  "행사/의전",
  "기타 편의용품",
];

export const AddItemModal: React.FC<AddItemModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("카메라/영상");
  const [code, setCode] = useState(() => "HYD-" + Math.floor(100 + Math.random() * 900));
  const [location, setLocation] = useState("5F 사운즈 포레스트 인포데스크");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

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
      await onSubmit({
        name: name.trim(),
        category,
        code: code.trim() || "HYD-" + Date.now().toString().slice(-4),
        location: location.trim(),
        description: description.trim() || null,
      });
      // reset
      setName("");
      setDescription("");
      onClose();
    } catch (err) {
      console.error(err);
      alert("물품 등록 중 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#FAF9F5] border border-stone-200 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-scale-up">
        {/* Header */}
        <div className="bg-hyundai-primary text-white p-6 relative">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-serif tracking-widest text-[#E5DEC9]">
              The Hyundai Inventory
            </span>
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <h2 className="text-xl font-bold mt-2 flex items-center gap-2">
            <Plus className="w-5 h-5" />
            신규 대여 물품 등록
          </h2>
          <p className="text-xs text-stone-300 mt-1">
            등록 즉시 모든 사용자에게 실시간으로 공유됩니다.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-hyundai-dark mb-1.5">
              물품명 <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Package className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="예: 소니 A7M4 풀프레임 미러리스 카메라"
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-hyundai-primary/30 focus:border-hyundai-primary transition"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-hyundai-dark mb-1.5">
                카테고리
              </label>
              <div className="relative">
                <Tag className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full pl-10 pr-8 py-2.5 bg-white border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-hyundai-primary/30 focus:border-hyundai-primary transition appearance-none cursor-pointer"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-hyundai-dark">
                  관리 코드
                </label>
                <button
                  type="button"
                  onClick={handleGenerateCode}
                  className="text-[11px] text-hyundai-primary hover:underline flex items-center gap-0.5"
                >
                  <Sparkles className="w-3 h-3" />
                  코드 자동생성
                </button>
              </div>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="예: HYD-CAM-07"
                className="w-full px-3.5 py-2.5 bg-white border border-stone-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-hyundai-primary/30 focus:border-hyundai-primary transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-hyundai-dark mb-1.5">
              비치 및 보관 장소
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="예: 6F 복합문화공간 ALT.1 인포데스크"
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-hyundai-primary/30 focus:border-hyundai-primary transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-hyundai-dark mb-1.5">
              물품 상세 설명 및 대여 주의사항
            </label>
            <div className="relative">
              <FileText className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="구성품 (렌즈, 충전기, 파우치 포함 여부 등) 또는 특이사항을 적어주세요."
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-hyundai-primary/30 focus:border-hyundai-primary transition resize-none"
              />
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl border border-stone-200 text-stone-600 text-sm font-medium hover:bg-stone-100 transition"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-hyundai-primary text-white text-sm font-medium hover:bg-[#234533] active:bg-[#152a1e] transition flex items-center gap-2 shadow-sm disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>등록 중...</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>물품 등록 완료</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
