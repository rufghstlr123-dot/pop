"use client";
import React from "react";
import { Item } from "@/types/inventory";
import { RotateCcw, Edit2, CheckCircle2, Trash2 } from "lucide-react";

interface RosterTableProps {
  items: Item[];
  viewMode?: "CURRENT" | "RETURNED";
  highlightedItemIds?: string[];
  onReturn: (item: Item) => void;
  onEdit: (item: Item) => void;
  onDelete?: (item: Item) => void;
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

export function isDMinus1(dateStr: string | null | undefined): boolean {
  if (!dateStr) return false;
  try {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const target = new Date(dateStr);
    if (isNaN(target.getTime())) return false;
    const targetDay = new Date(target.getFullYear(), target.getMonth(), target.getDate()).getTime();
    const diffDays = Math.round((targetDay - today) / (1000 * 60 * 60 * 24));
    return diffDays === 1;
  } catch {
    return false;
  }
}

export const RosterTable: React.FC<RosterTableProps> = ({
  items,
  viewMode = "CURRENT",
  highlightedItemIds = [],
  onReturn,
  onEdit,
  onDelete,
}) => {
  if (items.length === 0) {
    const isReturnedView = viewMode === "RETURNED";
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-12 text-center text-[#666666]">
        <div className="w-12 h-12 rounded-full bg-[#f1f5f9] flex items-center justify-center mb-3">
          <CheckCircle2 className="w-6 h-6 text-[#94a3b8]" />
        </div>
        <p className="font-bold text-[0.9rem] text-[#333333]">
          {isReturnedView
            ? "해당 카테고리에 반납 완료된 과거 기록이 없습니다."
            : "현재 대여 중인 물품이 없습니다."}
        </p>
        <p className="text-[0.8rem] text-[#94a3b8] mt-1">
          {isReturnedView
            ? "대여 중인 물품을 [반납] 처리하면 이곳에 기록됩니다."
            : "좌측 사이드바에서 새 물품을 간편하게 등록해보세요."}
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-x-auto overflow-y-auto bg-white">
      <table className="w-full text-left border-collapse table-fixed min-w-[1250px]">
        {/* Fixed Column Width Definitions for Uniform Display across all categories */}
        <colgroup>
          <col className="w-[115px]" />  {/* 카테고리 (x) */}
          <col className="w-[230px]" />  {/* 설치 장소 (2x) */}
          <col className="w-[230px]" />  {/* 대여자 (2x) */}
          <col className="w-[115px]" />  {/* 대여 일자 (x) */}
          <col className="w-[115px]" />  {/* 반납 예정 일자 (x) */}
          <col className="w-[115px]" />  {/* 반납 일자 (x) */}
          <col className="w-auto" />     {/* 비고 (남는 공간 자유롭게) */}
          <col className="w-[280px]" />  {/* 관리 처리 (버튼 3개 고정 너비) */}
        </colgroup>
        <thead className="bg-[#f3f3f3] sticky top-0 z-20 border-b-2 border-[#bbbbbb]">
          <tr>
            <th className="py-2.5 px-3 font-bold text-[#333333] border-r border-[#d1d1d1] text-center text-[0.8rem]">
              카테고리
            </th>
            <th className="py-2.5 px-4 font-bold text-[#333333] border-r border-[#d1d1d1] text-center text-[0.8rem]">
              설치 장소
            </th>
            <th className="py-2.5 px-4 font-bold text-[#333333] border-r border-[#d1d1d1] text-center text-[0.8rem]">
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
            <th className="py-2.5 px-4 font-bold text-[#333333] border-r border-[#d1d1d1] text-center text-[0.8rem]">
              비고
            </th>
            <th className="py-2.5 px-3 font-bold text-[#333333] text-center text-[0.8rem]">
              관리 처리
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#d1d1d1]">
          {items.map((item) => {
            const isAvailable = item.status === "AVAILABLE";
            const isHighlighted = highlightedItemIds.includes(item.id);

            return (
              <tr
                key={item.id + (isHighlighted ? "-flash" : "")}
                className={`transition-colors ${
                  isHighlighted
                    ? "flash-highlight-5 font-semibold text-[#1e293b]"
                    : "hover:bg-[#f8fafc]"
                }`}
              >
                {/* Category Badge */}
                <td className="py-2.5 px-3 border-r border-[#d1d1d1] text-center whitespace-nowrap">
                  <span
                    className={`px-2 py-0.5 rounded text-[0.8rem] font-semibold border inline-block ${
                      item.category === "A2 POP"
                        ? "bg-[#e0f2fe] text-[#0369a1] border-[#bae6fd]"
                        : item.category === "A3 POP"
                        ? "bg-[#fef3c7] text-[#b45309] border-[#fde68a]"
                        : "bg-[#f3e8ff] text-[#7e22ce] border-[#e9d5ff]"
                    }`}
                  >
                    {item.category}
                  </span>
                </td>

                {/* 설치 장소 */}
                <td className="py-2.5 px-4 border-r border-[#d1d1d1] text-[0.85rem] font-semibold text-[#1e293b] truncate" title={item.location}>
                  {item.location}
                </td>

                {/* 대여자 */}
                <td className="py-2.5 px-4 border-r border-[#d1d1d1] text-[0.85rem] text-[#333333] truncate" title={item.borrower_name || "-"}>
                  {item.borrower_name || "-"}
                </td>

                {/* 대여 일자 */}
                <td className="py-2.5 px-3 border-r border-[#d1d1d1] text-center whitespace-nowrap font-mono text-[0.85rem] text-[#333333]">
                  {formatDate(item.loaned_at)}
                </td>

                {/* 반납 예정 일자 (D-Day 뱃지 없이 날짜만 단정하게 표시) */}
                <td className="py-2.5 px-3 border-r border-[#d1d1d1] text-center whitespace-nowrap font-mono text-[0.85rem] text-[#c2410c] font-semibold">
                  {formatDate(item.expected_return_date)}
                </td>

                {/* 반납 일자 */}
                <td className="py-2.5 px-3 border-r border-[#d1d1d1] text-center whitespace-nowrap font-mono text-[0.85rem] text-[#217346]">
                  {formatDate(item.returned_at)}
                </td>

                {/* 비고 */}
                <td className="py-2.5 px-4 border-r border-[#d1d1d1] text-[0.85rem] text-[#475569] whitespace-pre-line" title={item.description || "-"}>
                  {item.description || "-"}
                </td>

                {/* 관리 처리 */}
                <td className="py-3 px-3 text-center whitespace-nowrap">
                  <div className="flex items-center justify-center gap-3.5">
                    {!isAvailable ? (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onReturn(item);
                        }}
                        className="px-3 py-1.5 rounded-md bg-[#ffedd5] hover:bg-[#fed7aa] text-[#c2410c] border border-[#fdba74] text-[0.85rem] font-bold transition inline-flex items-center gap-1 shadow-sm cursor-pointer"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>반납</span>
                      </button>
                    ) : (
                      <span className="inline-flex items-center justify-center px-3 py-1.5 rounded-md text-[0.85rem] font-bold bg-[#f1f5f9] text-[#64748b] border border-[#e2e8f0]">
                        반납 완료
                      </span>
                    )}

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit(item);
                      }}
                      className="px-3 py-1.5 rounded-md bg-white hover:bg-slate-100 text-[#333333] border border-[#d1d1d1] text-[0.85rem] font-semibold transition inline-flex items-center gap-1 shadow-sm cursor-pointer"
                      title="물품 정보 수정"
                    >
                      <Edit2 className="w-3.5 h-3.5 text-[#64748b]" />
                      <span>수정</span>
                    </button>

                    {onDelete && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(item);
                        }}
                        className="px-3 py-1.5 rounded-md bg-[#fff1f2] hover:bg-[#ffe4e6] text-[#be123c] border border-[#fecdd3] text-[0.85rem] font-semibold transition inline-flex items-center gap-1 shadow-sm cursor-pointer"
                        title="물품 삭제"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>삭제</span>
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
