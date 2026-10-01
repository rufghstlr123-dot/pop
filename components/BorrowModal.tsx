"use client";
import React, { useState } from "react";
import { X, User, Phone, Calendar, FileText, Check, Loader2 } from "lucide-react";
import { Item } from "@/types/inventory";

interface BorrowModalProps {
  item: Item | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (
    itemId: string,
    borrowerName: string,
    borrowerContact?: string,
    expectedReturnDate?: string,
    note?: string
  ) => Promise<void>;
}

export const BorrowModal: React.FC<BorrowModalProps> = ({
  item,
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [borrowerName, setBorrowerName] = useState("");
  const [borrowerContact, setBorrowerContact] = useState("");
  const [expectedReturnDate, setExpectedReturnDate] = useState(() => {
    // Default to tomorrow 18:00
    const d = new Date();
    d.setDate(d.getDate() + 1);
    d.setHours(18, 0, 0, 0);
    return d.toISOString().slice(0, 16);
  });
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !item) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!borrowerName.trim()) {
      alert("대여자 이름을 입력해주세요.");
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(
        item.id,
        borrowerName.trim(),
        borrowerContact.trim() || undefined,
        expectedReturnDate ? new Date(expectedReturnDate).toISOString() : undefined,
        note.trim() || undefined
      );
      // Reset form
      setBorrowerName("");
      setBorrowerContact("");
      setNote("");
      onClose();
    } catch (err) {
      console.error(err);
      alert("대여 처리 중 오류가 발생했습니다.");
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
              The Hyundai Rental Desk
            </span>
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <h2 className="text-xl font-bold mt-2">물품 대여 신청</h2>
          <p className="text-xs text-stone-300 mt-1">
            다른 사용자에게도 즉시 실시간으로 대여 상태가 반영됩니다.
          </p>
        </div>

        {/* Item Summary Card */}
        <div className="px-6 pt-5 pb-2">
          <div className="p-3.5 bg-white rounded-xl border border-stone-200/80 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-[10px] font-medium tracking-wide uppercase px-2 py-0.5 rounded bg-stone-100 text-stone-600">
                {item.category}
              </span>
              <h4 className="font-bold text-sm text-hyundai-dark mt-1">
                {item.name}
              </h4>
              <p className="text-[11px] text-stone-400 mt-0.5">
                위치: {item.location} · 코드: #{item.code}
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-hyundai-dark mb-1.5">
              대여자 성함 / 직함 <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={borrowerName}
                onChange={(e) => setBorrowerName(e.target.value)}
                placeholder="예: 홍길동 매니저 / 김현대"
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-hyundai-primary/30 focus:border-hyundai-primary transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-hyundai-dark mb-1.5">
              소속 부서 / 연락처
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={borrowerContact}
                onChange={(e) => setBorrowerContact(e.target.value)}
                placeholder="예: 공간기획팀 / 010-1234-5678"
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-hyundai-primary/30 focus:border-hyundai-primary transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-hyundai-dark mb-1.5">
              반납 예정 일시
            </label>
            <div className="relative">
              <Calendar className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="datetime-local"
                value={expectedReturnDate}
                onChange={(e) => setExpectedReturnDate(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-hyundai-primary/30 focus:border-hyundai-primary transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-hyundai-dark mb-1.5">
              대여 목적 / 사용 장소
            </label>
            <div className="relative">
              <FileText className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
              <textarea
                rows={2}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="예: 5F 사운즈 포레스트 주말 팝업 행사 촬영 지원용"
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
                  <span>실시간 처리 중...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>대여 확정하기</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
