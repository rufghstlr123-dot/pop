"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Item, RentalLog, InventoryStats } from "@/types/inventory";
import { InventoryService } from "@/lib/inventory-service";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { RosterTable, isDMinus1 } from "@/components/RosterTable";
import { EditModal } from "@/components/EditModal";
import { AlertCircle } from "lucide-react";

const CATEGORIES = ["전체", "A2 POP", "A3 POP", "철제배너"];

export default function HomePage() {
  const [items, setItems] = useState<Item[]>([]);
  const [logs, setLogs] = useState<RentalLog[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters & State
  const [selectedCategory, setSelectedCategory] = useState("전체");
  const [viewMode, setViewMode] = useState<"CURRENT" | "RETURNED">("CURRENT");
  const [isHighlightActive, setIsHighlightActive] = useState(false);

  // Modals
  const [selectedEditItem, setSelectedEditItem] = useState<Item | null>(null);

  const loadData = useCallback(async () => {
    try {
      const [fetchedItems, fetchedLogs] = await Promise.all([
        InventoryService.getItems(),
        InventoryService.getLogs(),
      ]);

      setItems(fetchedItems);
      setLogs(fetchedLogs);
    } catch (err) {
      console.error("Failed to load inventory data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();

    const unsubscribe = InventoryService.subscribe(() => {
      loadData();
    });

    return () => {
      unsubscribe();
    };
  }, [loadData]);

  // Statistics for current selected category
  const categoryStats: InventoryStats = useMemo(() => {
    const targetItems = selectedCategory === "전체" ? items : items.filter((i) => i.category === selectedCategory);
    const total = targetItems.length;
    const available = targetItems.filter((i) => i.status === "AVAILABLE").length;
    const loaned = targetItems.filter((i) => i.status === "LOANED").length;
    return { total, available, loaned };
  }, [items, selectedCategory]);

  // D-1 Urgent alert items (tomorrow due date)
  const d1Items = useMemo(() => {
    return items.filter(
      (i) => i.status === "LOANED" && isDMinus1(i.expected_return_date)
    );
  }, [items]);

  // Filter items based on selected category & viewMode toggle
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // Category filter
      if (selectedCategory !== "전체" && item.category !== selectedCategory) {
        return false;
      }

      // Status filter
      if (selectedCategory === "전체") {
        return item.status === "LOANED";
      } else {
        if (viewMode === "RETURNED") {
          return item.status === "AVAILABLE" && Boolean(item.returned_at || item.borrower_name);
        } else {
          return item.status === "LOANED";
        }
      }
    });
  }, [items, selectedCategory, viewMode]);

  // Actions: Direct return without popup
  // Actions: Direct return without popup
  const handleDirectReturn = async (item: Item) => {
    if (!confirm(`'${item.location} (${item.category})' 물품을 즉시 반납 처리하시겠습니까?`)) {
      return;
    }
    const success = await InventoryService.returnItem(item.id);
    if (success) {
      await loadData();
    } else {
      alert("반납 처리에 실패했습니다.");
    }
  };

  const handleEditSubmit = async (itemId: string, updatedData: Partial<Item>) => {
    const success = await InventoryService.editItem(itemId, updatedData);
    if (success) {
      await loadData();
    } else {
      alert("수정에 실패했습니다.");
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    const success = await InventoryService.deleteItem(itemId);
    if (success) {
      await loadData();
    } else {
      alert("삭제 처리에 실패했습니다.");
    }
  };

  const handleAddItem = async (itemData: {
    category: string;
    location: string;
    borrower_name?: string;
    loaned_at?: string;
    expected_return_date?: string;
    description?: string;
  }) => {
    const created = await InventoryService.addItem({
      name: `${itemData.category} (${itemData.location})`,
      category: itemData.category,
      code: itemData.category.slice(0, 2) + "-" + Math.floor(10 + Math.random() * 90),
      location: itemData.location,
      description: itemData.description || null,
      borrower_name: itemData.borrower_name || null,
      loaned_at: itemData.loaned_at || null,
      expected_return_date: itemData.expected_return_date || null,
      returned_at: null,
    } as any);

    if (created) {
      await loadData();
    } else {
      alert("등록에 실패했습니다.");
    }
  };

  const handleTriggerHighlight = () => {
    setIsHighlightActive(false);
    setTimeout(() => {
      setIsHighlightActive(true);
    }, 20);

    // 5번 반짝인 후 자동 중단 (0.7s * 5 = 3.5s)
    setTimeout(() => {
      setIsHighlightActive(false);
    }, 3600);
  };

  const handleResetData = async () => {
    if (confirm("모든 데이터를 기본 샘플 데이터로 복구하시겠습니까?")) {
      await InventoryService.resetData();
      await loadData();
    }
  };

  return (
    <div className="app-container">
      {/* App Header (sp-blond style with live clock) */}
      <Header />

      {/* Main Content Area (Sidebar + Spreadsheet) */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <Sidebar
          categories={CATEGORIES}
          selectedCategory={selectedCategory}
          onSelectCategory={(cat) => {
            setSelectedCategory(cat);
            setViewMode("CURRENT");
          }}
          stats={categoryStats}
          onAddItem={handleAddItem}
          onResetData={handleResetData}
        />

        {/* Right Main Table Viewer */}
        <main className="flex-1 flex flex-col overflow-hidden bg-white">
          {/* Due Alert Banner: Only shows for D-1 items */}
          {d1Items.length > 0 && viewMode === "CURRENT" && (
            <div className="px-5 py-2 bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-200 flex items-center justify-between shrink-0 text-[0.8rem]">
              <div className="flex items-center gap-2 text-amber-900 font-medium">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  <strong>반납 예정 알림:</strong> 내일(D-1) 반납 예정인 물품이 있습니다.
                </span>
              </div>
              <button
                onClick={handleTriggerHighlight}
                className={`px-3 py-1 rounded-md text-[0.75rem] font-bold border transition cursor-pointer flex items-center gap-1 shadow-2xs ${
                  isHighlightActive
                    ? "bg-[#217346] text-white border-[#217346]"
                    : "bg-white text-amber-900 border-amber-300 hover:bg-amber-100"
                }`}
                title="클릭 시 해당 물품을 대시보드에서 5회 하이라이트합니다."
              >
                <span>총 {d1Items.length}건</span>
              </button>
            </div>
          )}

          {/* Sub Header Toggle: Appears only for specific categories, NOT for "전체" */}
          {selectedCategory !== "전체" && (
            <div className="px-5 py-2.5 bg-[#f8fafc] border-b border-[#d1d1d1] flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-[0.85rem] font-bold text-[#1e293b]">{selectedCategory}</span>
                <span className="text-[0.75rem] text-[#64748b]">
                  ({viewMode === "CURRENT" ? "현재 대여 중" : "과거 반납 기록"} {filteredItems.length}건)
                </span>
              </div>

              {/* Toggle Segment */}
              <div className="flex items-center bg-[#e2e8f0] p-0.5 rounded-lg text-[0.8rem] font-bold">
                <button
                  onClick={() => setViewMode("CURRENT")}
                  className={`px-3 py-1 rounded-md transition-all ${
                    viewMode === "CURRENT"
                      ? "bg-white text-[#217346] shadow-xs"
                      : "text-[#64748b] hover:text-[#1e293b]"
                  }`}
                >
                  현재 대여 중
                </button>
                <button
                  onClick={() => setViewMode("RETURNED")}
                  className={`px-3 py-1 rounded-md transition-all ${
                    viewMode === "RETURNED"
                      ? "bg-[#217346] text-white shadow-xs"
                      : "text-[#64748b] hover:text-[#1e293b]"
                  }`}
                >
                  과거 반납 기록
                </button>
              </div>
            </div>
          )}

          {loading ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center space-y-2">
                <div className="w-8 h-8 border-2 border-[#217346] border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="text-[0.85rem] text-[#666666]">데이터를 불러오는 중입니다...</p>
              </div>
            </div>
          ) : (
            <RosterTable
              items={filteredItems}
              viewMode={viewMode}
              highlightedItemIds={isHighlightActive ? d1Items.map((i) => i.id) : []}
              onReturn={handleDirectReturn}
              onEdit={(i) => setSelectedEditItem(i)}
            />
          )}

          {/* Bottom Bar */}
          <div className="px-4 py-1.5 bg-[#f3f3f3] border-t border-[#d1d1d1] flex items-center justify-end text-[0.8rem] text-[#94a3b8] shrink-0 font-mono min-h-[28px]">
          </div>
        </main>
      </div>

      {/* Edit Modal */}
      <EditModal
        item={selectedEditItem}
        isOpen={Boolean(selectedEditItem)}
        onClose={() => setSelectedEditItem(null)}
        onSubmit={handleEditSubmit}
        onDelete={handleDeleteItem}
      />
    </div>
  );
}
