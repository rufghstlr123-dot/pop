"use client";
import React, { useState, useEffect } from "react";
import { X, Check, Loader2, Trash2 } from "lucide-react";
import { Item } from "@/types/inventory";

interface EditModalProps {
  item: Item | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (itemId: string, updatedData: Partial<Item>) => Promise<void>;
  onDelete?: (itemId: string) => Promise<void>;
}

function formatDateInput(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 8);
  if (digits.length <= 4) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 4)}-${digits.slice(4)}`;
  return `${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6, 8)}`;
}

export const EditModal: React.FC<EditModalProps> = ({
  item,
  isOpen,
  onClose,
  onSubmit,
  onDelete,
}) => {
  const [location, setLocation] = useState("");
  const [borrowerName, setBorrowerName] = useState("");
  const [issuerName, setIssuerName] = useState("");
  const [quantity, setQuantity] = useState<number | string>(1);
  const [loanedAt, setLoanedAt] = useState("");
  const [expectedReturnDate, setExpectedReturnDate] = useState("");
  const [isAnnual, setIsAnnual] = useState(false);
  const [returnedAt, setReturnedAt] = useState("");
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (item) {
      const annual = item.loaned_at === "연간" || item.expected_return_date === "연간";
      setLocation(item.location || "");
      setBorrowerName(item.borrower_name || "");
      setIssuerName(item.issuer_name || "");
      setQuantity(item.quantity ?? 1);
      setIsAnnual(annual);
      setLoanedAt(annual ? "" : (item.loaned_at || ""));
      setExpectedReturnDate(annual ? "" : (item.expected_return_date || ""));
      setReturnedAt(item.returned_at || "");
      setNote(item.description || "");
    }
  }, [item]);

  if (!isOpen || !item) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!location.trim()) {
      alert("설치 장소를 입력해주세요.");
      return;
    }

    const qty = parseInt(String(quantity).trim(), 10);
    if (isNaN(qty) || qty < 1) {
      alert("수량을 1개 이상 입력해주세요.");
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(item.id, {
        location: location.trim(),
        borrower_name: borrowerName.trim() || null,
        issuer_name: issuerName.trim() || null,
        quantity: qty,
        loaned_at: isAnnual ? "연간" : (loanedAt.trim() || null),
        expected_return_date: isAnnual ? "연간" : (expectedReturnDate.trim() || null),
        returned_at: returnedAt.trim() || null,
        description: note.trim() || null,
        status: returnedAt.trim() ? "AVAILABLE" : (borrowerName.trim() ? "LOANED" : "AVAILABLE"),
      });
      onClose();
    } catch (err) {
      console.error(err);
      alert("수정 처리 중 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-[2px]">
      <div className="bg-white border border-[#d1d1d1] rounded-xl w-full max-w-md shadow-2xl overflow-hidden animate-scale-up">
        {/* Header */}
        <div className="bg-[#217346] text-white px-5 py-3 flex items-center justify-between">
          <div>
            <h2 className="text-[1rem] font-bold">물품 정보 수정</h2>
            <p className="text-[0.75rem] text-[#e6f2ec]">
              {item.category} ({item.location})
            </p>
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
        <form onSubmit={handleSubmit} className="p-5 space-y-3 text-[0.85rem]">
          <div>
            <label className="block text-[0.8rem] font-semibold text-[#333333] mb-1">
              설치 장소 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-2.5 py-1.5 border border-[#d1d1d1] rounded-md text-[0.85rem] bg-white focus:outline-none focus:border-[#217346] focus:ring-2 focus:ring-[#e6f2ec] transition"
            />
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="col-span-2">
              <label className="block text-[0.8rem] font-semibold text-[#333333] mb-1">
                대여자
              </label>
              <input
                type="text"
                value={borrowerName}
                onChange={(e) => setBorrowerName(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-[#d1d1d1] rounded-md text-[0.85rem] bg-white focus:outline-none focus:border-[#217346] focus:ring-2 focus:ring-[#e6f2ec] transition"
              />
            </div>
            <div>
              <label className="block text-[0.8rem] font-semibold text-[#333333] mb-1">
                수량 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                inputMode="numeric"
                required
                value={quantity}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, "");
                  setQuantity(val);
                }}
                placeholder="1"
                className="w-full px-2 py-1.5 border border-[#d1d1d1] rounded-md text-[0.85rem] bg-white focus:outline-none focus:border-[#217346] focus:ring-2 focus:ring-[#e6f2ec] transition text-center font-semibold"
              />
            </div>
          </div>

          <div>
            <label className="block text-[0.8rem] font-semibold text-[#333333] mb-1">
              불출자
            </label>
            <input
              type="text"
              value={issuerName}
              onChange={(e) => setIssuerName(e.target.value)}
              className="w-full px-2.5 py-1.5 border border-[#d1d1d1] rounded-md text-[0.85rem] bg-white focus:outline-none focus:border-[#217346] focus:ring-2 focus:ring-[#e6f2ec] transition"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[0.8rem] font-semibold text-[#333333] mb-1">
                대여 일자
              </label>
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  maxLength={10}
                  disabled={isAnnual}
                  value={isAnnual ? "연간" : loanedAt}
                  onChange={(e) => setLoanedAt(formatDateInput(e.target.value))}
                  placeholder="YYYY-MM-DD"
                  className={`flex-1 min-w-0 px-2.5 py-1.5 border border-[#d1d1d1] rounded-md text-[0.85rem] font-mono transition ${
                    isAnnual
                      ? "bg-[#f1f5f9] text-[#217346] font-bold text-center cursor-not-allowed"
                      : "bg-white focus:outline-none focus:border-[#217346] focus:ring-2 focus:ring-[#e6f2ec]"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setIsAnnual((prev) => !prev)}
                  className={`px-2.5 py-1.5 rounded-md text-[0.8rem] font-bold border transition shrink-0 cursor-pointer ${
                    isAnnual
                      ? "bg-[#217346] text-white border-[#217346] shadow-xs"
                      : "bg-white text-[#334155] border-[#d1d1d1] hover:bg-[#e6f2ec] hover:text-[#217346] hover:border-[#217346]"
                  }`}
                >
                  연간
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[0.8rem] font-semibold text-[#333333] mb-1">
                반납 예정 일자
              </label>
              <input
                type="text"
                maxLength={10}
                disabled={isAnnual}
                value={isAnnual ? "연간" : expectedReturnDate}
                onChange={(e) => setExpectedReturnDate(formatDateInput(e.target.value))}
                placeholder="YYYY-MM-DD"
                className={`w-full px-2.5 py-1.5 border border-[#d1d1d1] rounded-md text-[0.85rem] font-mono transition ${
                  isAnnual
                    ? "bg-[#f1f5f9] text-[#217346] font-bold text-center cursor-not-allowed"
                    : "bg-white focus:outline-none focus:border-[#217346] focus:ring-2 focus:ring-[#e6f2ec]"
                }`}
              />
            </div>
          </div>

          <div>
            <label className="block text-[0.8rem] font-semibold text-[#333333] mb-1">
              반납 일자 (실제 반납일)
            </label>
            <input
              type="text"
              maxLength={10}
              value={returnedAt}
              onChange={(e) => setReturnedAt(formatDateInput(e.target.value))}
              placeholder="YYYY-MM-DD (미반납 시 비워두기)"
              className="w-full px-2.5 py-1.5 border border-[#d1d1d1] rounded-md text-[0.85rem] font-mono bg-white focus:outline-none focus:border-[#217346] focus:ring-2 focus:ring-[#e6f2ec] transition"
            />
          </div>

          <div>
            <label className="block text-[0.8rem] font-semibold text-[#333333] mb-1">
              비고
            </label>
            <textarea
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-2.5 py-1.5 border border-[#d1d1d1] rounded-md text-[0.85rem] bg-white focus:outline-none focus:border-[#217346] focus:ring-2 focus:ring-[#e6f2ec] transition resize-none"
            />
          </div>

          {/* Buttons */}
          <div className="pt-2 flex items-center justify-between border-t border-[#eeeeee]">
            <div />

            <div className="flex items-center gap-2">
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
                    <span>저장 중...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>수정 완료</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
