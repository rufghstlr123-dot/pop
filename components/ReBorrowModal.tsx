"use client";
import React, { useState, useEffect } from "react";
import { X, Play, Loader2, RotateCw } from "lucide-react";
import { Item } from "@/types/inventory";

interface ReBorrowModalProps {
  item: Item | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (
    itemId: string,
    data: {
      borrower_name: string;
      loaned_at: string;
      expected_return_date?: string;
      description?: string;
    }
  ) => Promise<void>;
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

export const ReBorrowModal: React.FC<ReBorrowModalProps> = ({
  item,
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [borrowerName, setBorrowerName] = useState("");
  const [loanedAt, setLoanedAt] = useState(getTodayString);
  const [expectedReturnDate, setExpectedReturnDate] = useState("");
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setBorrowerName("");
      setLoanedAt(getTodayString());
      setExpectedReturnDate("");
      setNote("");
    }
  }, [isOpen]);

  if (!isOpen || !item) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!borrowerName.trim()) {
      alert("대여자를 입력해주세요.");
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(item.id, {
        borrower_name: borrowerName.trim(),
        loaned_at: loanedAt.trim() || getTodayString(),
        expected_return_date: expectedReturnDate.trim() || undefined,
        description: note.trim() || undefined,
      });
      onClose();
    } catch (err) {
      console.error(err);
      alert("대여 처리에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-[2px]">
      <div className="bg-white border border-[#d1d1d1] rounded-xl w-full max-w-md shadow-2xl overflow-hidden animate-scale-up">
        {/* Header */}
        <div className="bg-[#217346] text-white px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center">
              <RotateCw className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-[1rem] font-bold">다시 대여하기</h2>
              <p className="text-[0.75rem] text-[#e6f2ec]">
                {item.category} ({item.location})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="w-7 h-7 rounded hover:bg-white/20 flex items-center justify-center text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-3.5 text-[0.85rem]">
          <div className="p-2.5 rounded-md bg-[#f8fafc] border border-[#e2e8f0] text-[0.8rem] text-[#475569]">
            <p className="font-semibold text-[#1e293b]">{item.location}</p>
            <p className="text-[0.75rem] text-[#64748b] mt-0.5">이 물품을 새로운 대여자에게 다시 대여 등록합니다.</p>
          </div>

          <div>
            <label className="block text-[0.8rem] font-semibold text-[#333333] mb-1">
              대여자 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              autoFocus
              value={borrowerName}
              onChange={(e) => setBorrowerName(e.target.value)}
              placeholder="대여자 이름 입력"
              className="w-full px-2.5 py-1.5 border border-[#d1d1d1] rounded-md text-[0.85rem] bg-white focus:outline-none focus:border-[#217346] focus:ring-2 focus:ring-[#e6f2ec] transition"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[0.8rem] font-semibold text-[#333333] mb-1">
                대여 일자
              </label>
              <input
                type="text"
                maxLength={10}
                value={loanedAt}
                onChange={(e) => setLoanedAt(formatDateInput(e.target.value))}
                placeholder="YYYY-MM-DD"
                className="w-full px-2.5 py-1.5 border border-[#d1d1d1] rounded-md text-[0.85rem] font-mono bg-white focus:outline-none focus:border-[#217346] focus:ring-2 focus:ring-[#e6f2ec] transition"
              />
            </div>

            <div>
              <label className="block text-[0.8rem] font-semibold text-[#333333] mb-1">
                반납 예정 일자
              </label>
              <input
                type="text"
                maxLength={10}
                value={expectedReturnDate}
                onChange={(e) => setExpectedReturnDate(formatDateInput(e.target.value))}
                placeholder="YYYY-MM-DD"
                className="w-full px-2.5 py-1.5 border border-[#d1d1d1] rounded-md text-[0.85rem] font-mono bg-white focus:outline-none focus:border-[#217346] focus:ring-2 focus:ring-[#e6f2ec] transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-[0.8rem] font-semibold text-[#333333] mb-1">
              비고
            </label>
            <textarea
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder=""
              className="w-full px-2.5 py-1.5 border border-[#d1d1d1] rounded-md text-[0.85rem] bg-white focus:outline-none focus:border-[#217346] focus:ring-2 focus:ring-[#e6f2ec] transition resize-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-3 py-1.5 rounded-md border border-[#d1d1d1] bg-white text-[#333333] text-[0.85rem] font-semibold hover:bg-slate-100 transition"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-1.5 rounded-md bg-[#217346] hover:bg-[#185a37] text-white text-[0.85rem] font-bold transition flex items-center gap-1 shadow-xs disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>대여 처리 중...</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>대여 시작</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
