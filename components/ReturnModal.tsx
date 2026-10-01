"use client";
import React, { useState } from "react";
import { X, RotateCcw, User, Calendar, CheckCheck, Loader2 } from "lucide-react";
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#FAF9F5] border border-stone-200 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-scale-up">
        {/* Header */}
        <div className="bg-[#8A451E] text-white p-6 relative">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-serif tracking-widest text-amber-200">
              The Hyundai Return Check
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
            <RotateCcw className="w-5 h-5" />
            물품 반납 확인
          </h2>
          <p className="text-xs text-amber-100/80 mt-1">
            반납 즉시 모든 접속자의 화면에서 '대여 가능' 상태로 전환됩니다.
          </p>
        </div>

        {/* Info Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="p-4 bg-white rounded-2xl border border-stone-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-stone-400">물품명</span>
              <span className="text-sm font-bold text-hyundai-dark">
                {item.name}
              </span>
            </div>
            <div className="flex items-center justify-between border-t border-stone-100 pt-2 text-xs">
              <span className="text-stone-400">현재 대여자</span>
              <span className="font-semibold text-amber-900 flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-stone-400" />
                {item.borrower_name || "담당자"}
              </span>
            </div>
            {item.borrower_contact && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-stone-400">소속 / 연락처</span>
                <span className="text-stone-600">{item.borrower_contact}</span>
              </div>
            )}
            {item.loaned_at && (
              <div className="flex items-center justify-between text-xs text-stone-500">
                <span className="text-stone-400">대여 일시</span>
                <span>{new Date(item.loaned_at).toLocaleString("ko-KR")}</span>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-hyundai-dark mb-1.5">
              반납 점검 메모 / 특이사항
            </label>
            <textarea
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="예: 구성품 이상 없음, 완충 상태로 반납함"
              className="w-full px-3.5 py-2.5 bg-white border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#8A451E]/30 focus:border-[#8A451E] transition resize-none"
            />
          </div>

          {/* Action buttons */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 rounded-xl border border-stone-200 text-stone-600 text-sm font-medium hover:bg-stone-100 transition"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-[#8A451E] text-white text-sm font-medium hover:bg-[#723616] active:bg-[#5a2a11] transition flex items-center gap-2 shadow-sm disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>반납 처리 중...</span>
                </>
              ) : (
                <>
                  <CheckCheck className="w-4 h-4" />
                  <span>반납 완료하기</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
