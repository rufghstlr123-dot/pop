"use client";
import React, { useState } from "react";
import { X, RotateCcw, User, CheckCheck, Loader2 } from "lucide-react";
import { Item } from "@/types/inventory";

interface ReturnModalProps {
  item: Item | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (itemId: string, note?: string) => Promise<void>;
}

export const ReturnModal: React.FC<ReturnModalProps> = ({
  item,
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [note, setNote] = useState("정상 작동 확인 및 반납 완료");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !item) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit(item.id, note.trim() || undefined);
      onClose();
    } catch (err) {
      console.error(err);
      alert("반납 처리 중 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-[2px]">
      <div className="bg-white border border-[#d1d1d1] rounded-xl w-full max-w-md shadow-2xl overflow-hidden animate-scale-up">
        {/* Header */}
        <div className="bg-[#c2410c] text-white px-5 py-3.5 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold flex items-center gap-1.5">
              <RotateCcw className="w-4 h-4" />
              물품 반납 확인
            </h2>
            <p className="text-[11px] text-[#ffedd5] mt-0.5">
              반납 처리 즉시 모든 접속자 화면에서 '대여 가능'으로 갱신됩니다.
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="w-7 h-7 rounded-md hover:bg-white/20 flex items-center justify-center text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-5 space-y-3.5 text-xs">
          <div className="p-3 bg-[#f8fafc] rounded-lg border border-[#e2e8f0] space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[#64748b]">반납 대상</span>
              <span className="font-bold text-[#1e293b]">{item.name}</span>
            </div>
            <div className="flex items-center justify-between pt-1 border-t border-[#e2e8f0]">
              <span className="text-[#64748b]">현재 대여자</span>
              <span className="font-bold text-[#c2410c] flex items-center gap-1">
                <User className="w-3 h-3 text-[#64748b]" />
                {item.borrower_name || "담당자"}
              </span>
            </div>
            {item.borrower_contact && (
              <div className="flex items-center justify-between">
                <span className="text-[#64748b]">연락처</span>
                <span className="text-[#333333]">{item.borrower_contact}</span>
              </div>
            )}
          </div>

          <div>
            <label className="block font-bold text-[#333333] mb-1">
              반납 점검 메모 / 특이사항
            </label>
            <textarea
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="예: 구성품 이상 없음, 정상 작동 확인"
              className="w-full px-3 py-2 border border-[#d1d1d1] rounded-md text-xs bg-white focus:outline-none focus:border-[#c2410c] focus:ring-2 focus:ring-[#ffedd5] transition resize-none"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-md border border-[#d1d1d1] bg-white text-[#333333] font-semibold hover:bg-slate-100 transition"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-md bg-[#c2410c] hover:bg-[#9a3412] text-white font-bold transition flex items-center gap-1.5 shadow-sm disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>처리 중...</span>
                </>
              ) : (
                <>
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span>반납 완료</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
