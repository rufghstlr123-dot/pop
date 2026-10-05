"use client";
import React from "react";
import { X, History, Edit2, CheckCircle2 } from "lucide-react";
import { Item } from "@/types/inventory";

interface HistoryModalProps {
  items: Item[];
  isOpen: boolean;
  onClose: () => void;
  onEdit: (item: Item) => void;
}

function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return "-";
  try {
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) return dateString;
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  } catch {
    return dateString;
  }
}

export const HistoryModal: React.FC<HistoryModalProps> = ({
  items,
  isOpen,
  onClose,
  onEdit,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-[2px]">
      <div className="bg-white border border-[#d1d1d1] rounded-xl w-full max-w-4xl max-h-[85vh] shadow-2xl flex flex-col overflow-hidden animate-scale-up">
        {/* Header */}
        <div className="bg-[#217346] text-white px-5 py-3.5 flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-[1rem] font-bold flex items-center gap-2">
              <History className="w-4 h-4" />
              과거 반납 완료 기록
            </h2>
            <p className="text-[0.75rem] text-[#e6f2ec] mt-0.5">
              정상 반납 처리 완료된 과거 대여 이력 목록입니다. (총 {items.length}건)
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-md hover:bg-white/20 flex items-center justify-center text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Table */}
        <div className="overflow-x-auto overflow-y-auto flex-1 bg-white">
          {items.length === 0 ? (
            <div className="text-center py-16 text-[#94a3b8]">
              <CheckCircle2 className="w-10 h-10 mx-auto mb-2 opacity-40 text-[#217346]" />
              <p className="font-bold text-[0.9rem] text-[#333333]">반납 완료된 과거 이력이 없습니다.</p>
              <p className="text-[0.8rem] text-[#94a3b8] mt-1">대시보드에서 물품을 [반납] 처리하면 이곳에 보관됩니다.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse table-fixed min-w-[850px] text-[0.85rem]">
              <colgroup>
                <col className="w-[90px]" />
                <col className="w-[180px]" />
                <col className="w-[110px]" />
                <col className="w-[110px]" />
                <col className="w-[110px]" />
                <col className="w-[110px]" />
                <col className="w-auto" />
                <col className="w-[80px]" />
              </colgroup>
              <thead className="bg-[#f3f3f3] sticky top-0 z-20 border-b-2 border-[#bbbbbb]">
                <tr>
                  <th className="py-2.5 px-3 font-bold text-[#333333] border-r border-[#d1d1d1] text-center text-[0.8rem]">
                    카테고리
                  </th>
                  <th className="py-2.5 px-3.5 font-bold text-[#333333] border-r border-[#d1d1d1] text-[0.8rem]">
                    설치 장소
                  </th>
                  <th className="py-2.5 px-3.5 font-bold text-[#333333] border-r border-[#d1d1d1] text-[0.8rem]">
                    대여자
                  </th>
                  <th className="py-2.5 px-3 font-bold text-[#333333] border-r border-[#d1d1d1] text-center text-[0.8rem]">
                    대여 일자
                  </th>
                  <th className="py-2.5 px-3 font-bold text-[#333333] border-r border-[#d1d1d1] text-center text-[0.8rem]">
                    반납 예정 일자
                  </th>
                  <th className="py-2.5 px-3 font-bold text-[#333333] border-r border-[#d1d1d1] text-center text-[0.8rem]">
                    반납 일자
                  </th>
                  <th className="py-2.5 px-3.5 font-bold text-[#333333] border-r border-[#d1d1d1] text-[0.8rem]">
                    비고
                  </th>
                  <th className="py-2.5 px-2 font-bold text-[#333333] text-center text-[0.8rem]">
                    관리
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#d1d1d1]">
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-[#f8fafc] transition-colors">
                    <td className="py-2 px-3 border-r border-[#d1d1d1] text-center whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded text-[0.75rem] font-semibold border bg-[#f1f5f9] text-[#475569] border-[#e2e8f0]">
                        {item.category}
                      </span>
                    </td>
                    <td className="py-2 px-3.5 border-r border-[#d1d1d1] font-semibold text-[#1e293b] truncate" title={item.location}>
                      {item.location}
                    </td>
                    <td className="py-2 px-3.5 border-r border-[#d1d1d1] text-[#333333] truncate">
                      {item.borrower_name || "-"}
                    </td>
                    <td className="py-2 px-3 border-r border-[#d1d1d1] text-center font-mono text-[0.8rem] text-[#64748b]">
                      {formatDate(item.loaned_at)}
                    </td>
                    <td className="py-2 px-3 border-r border-[#d1d1d1] text-center font-mono text-[0.8rem] text-[#64748b]">
                      {formatDate(item.expected_return_date)}
                    </td>
                    <td className="py-2 px-3 border-r border-[#d1d1d1] text-center font-mono text-[0.8rem] font-bold text-[#217346]">
                      {formatDate(item.returned_at)}
                    </td>
                    <td className="py-2 px-3.5 border-r border-[#d1d1d1] text-[#475569] truncate" title={item.description || "-"}>
                      {item.description || "-"}
                    </td>
                    <td className="py-2 px-2 text-center whitespace-nowrap">
                      <button
                        onClick={() => {
                          onClose();
                          onEdit(item);
                        }}
                        className="px-2 py-1 rounded bg-white hover:bg-slate-100 text-[#333333] border border-[#d1d1d1] text-[0.75rem] font-semibold transition inline-flex items-center gap-0.5 shadow-2xs"
                        title="이력 수정"
                      >
                        <Edit2 className="w-2.5 h-2.5 text-[#64748b]" />
                        <span>수정</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-[#f8fafc] border-t border-[#d1d1d1] text-right">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-md border border-[#d1d1d1] bg-white text-[#333333] text-[0.85rem] font-semibold hover:bg-slate-100 transition"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};
