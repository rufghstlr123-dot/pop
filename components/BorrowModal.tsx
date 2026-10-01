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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-[2px]">
      <div className="bg-white border border-[#d1d1d1] rounded-xl w-full max-w-lg shadow-2xl overflow-hidden animate-scale-up">
        {/* sp-blond Modal Header */}
        <div className="bg-[#217346] text-white px-5 py-3.5 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold flex items-center gap-1.5">
              물품 대여 신청
            </h2>
            <p className="text-[11px] text-[#e6f2ec] mt-0.5">
              신청 완료 시 모든 접속자 화면에서 즉시 '대여 중'으로 전환됩니다.
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

        {/* Item Info Box */}
        <div className="px-5 pt-4 pb-1">
          <div className="p-3 bg-[#f8fafc] rounded-lg border border-[#e2e8f0] flex items-center justify-between text-xs">
            <div>
              <div className="flex items-center gap-1.5">
                <span className="px-1.5 py-0.5 rounded bg-white text-[#475569] font-medium border border-[#cbd5e1] text-[10px]">
                  {item.category}
                </span>
                <span className="font-mono text-[#64748b] text-[11px]">#{item.code}</span>
              </div>
              <h4 className="font-bold text-sm text-[#1e293b] mt-1">{item.name}</h4>
              <p className="text-[11px] text-[#64748b] mt-0.5">비치 위치: {item.location}</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-3 text-xs">
          <div>
            <label className="block font-bold text-[#333333] mb-1">
              대여자 성함 / 직함 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={borrowerName}
              onChange={(e) => setBorrowerName(e.target.value)}
              placeholder="예: 홍길동 매니저"
              className="w-full px-3 py-2 border border-[#d1d1d1] rounded-md text-xs bg-white focus:outline-none focus:border-[#217346] focus:ring-2 focus:ring-[#e6f2ec] transition"
            />
          </div>

          <div>
            <label className="block font-bold text-[#333333] mb-1">
              소속 부서 / 연락처
            </label>
            <input
              type="text"
              value={borrowerContact}
              onChange={(e) => setBorrowerContact(e.target.value)}
              placeholder="예: 마케팅팀 / 010-1234-5678"
              className="w-full px-3 py-2 border border-[#d1d1d1] rounded-md text-xs bg-white focus:outline-none focus:border-[#217346] focus:ring-2 focus:ring-[#e6f2ec] transition"
            />
          </div>

          <div>
            <label className="block font-bold text-[#333333] mb-1">
              반납 예정 일시
            </label>
            <input
              type="datetime-local"
              value={expectedReturnDate}
              onChange={(e) => setExpectedReturnDate(e.target.value)}
              className="w-full px-3 py-2 border border-[#d1d1d1] rounded-md text-xs bg-white focus:outline-none focus:border-[#217346] focus:ring-2 focus:ring-[#e6f2ec] transition"
            />
          </div>

          <div>
            <label className="block font-bold text-[#333333] mb-1">
              대여 목적 / 사용 장소
            </label>
            <textarea
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="예: 5F 사운즈 포레스트 촬영 지원용"
              className="w-full px-3 py-2 border border-[#d1d1d1] rounded-md text-xs bg-white focus:outline-none focus:border-[#217346] focus:ring-2 focus:ring-[#e6f2ec] transition resize-none"
            />
          </div>

          {/* Action buttons */}
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
              className="px-5 py-2 rounded-md bg-[#217346] hover:bg-[#185a37] text-white font-bold transition flex items-center gap-1.5 shadow-sm disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>처리 중...</span>
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>대여 확정</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
