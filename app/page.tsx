"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Search } from "lucide-react";
import { Item, RentalLog, InventoryStats } from "@/types/inventory";
import { InventoryService } from "@/lib/inventory-service";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { RosterTable } from "@/components/RosterTable";
import { BorrowModal } from "@/components/BorrowModal";
import { ReturnModal } from "@/components/ReturnModal";
import {
  RealtimeNotification,
  NotificationMessage,
} from "@/components/RealtimeNotification";

const CATEGORIES = ["A2 POP", "A3 POP", "철제배너"];

export default function HomePage() {
  const [items, setItems] = useState<Item[]>([]);
  const [logs, setLogs] = useState<RentalLog[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters & State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("A2 POP");

  // Modals
  const [selectedBorrowItem, setSelectedBorrowItem] = useState<Item | null>(null);
  const [selectedReturnItem, setSelectedReturnItem] = useState<Item | null>(null);

  // Notifications
  const [notifications, setNotifications] = useState<NotificationMessage[]>([]);

  const addNotification = useCallback(
    (title: string, description: string, type: "BORROW" | "RETURN" | "ADD" | "INFO" = "INFO") => {
      const id = Date.now().toString() + Math.random().toString(36).slice(2, 6);
      const newNotification: NotificationMessage = { id, title, description, type };

      setNotifications((prev) => [newNotification, ...prev.slice(0, 4)]);

      setTimeout(() => {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
      }, 4000);
    },
    []
  );

  const dismissNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const loadData = useCallback(async (showNotificationOnChange = false) => {
    try {
      const [fetchedItems, fetchedLogs] = await Promise.all([
        InventoryService.getItems(),
        InventoryService.getLogs(),
      ]);

      setItems(fetchedItems);
      setLogs(fetchedLogs);

      if (showNotificationOnChange) {
        addNotification(
          "실시간 동기화 완료",
          "다른 사용자의 변경사항이 실시간으로 반영되었습니다.",
          "INFO"
        );
      }
    } catch (err) {
      console.error("Failed to load inventory data:", err);
    } finally {
      setLoading(false);
    }
  }, [addNotification]);

  useEffect(() => {
    loadData();

    const unsubscribe = InventoryService.subscribe(() => {
      loadData(true);
    });

    return () => {
      unsubscribe();
    };
  }, [loadData]);

  // Statistics for current selected category
  const categoryStats: InventoryStats = useMemo(() => {
    const catItems = items.filter((i) => i.category === selectedCategory);
    const total = catItems.length;
    const available = catItems.filter((i) => i.status === "AVAILABLE").length;
    const loaned = catItems.filter((i) => i.status === "LOANED").length;
    return { total, available, loaned };
  }, [items, selectedCategory]);

  // Filter items by category and search
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      if (item.category !== selectedCategory) return false;

      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchLocation = item.location.toLowerCase().includes(query);
        const matchBorrower = item.borrower_name?.toLowerCase().includes(query) ?? false;
        const matchDesc = item.description?.toLowerCase().includes(query) ?? false;
        return matchLocation || matchBorrower || matchDesc;
      }

      return true;
    });
  }, [items, selectedCategory, searchQuery]);

  // Actions
  const handleBorrowSubmit = async (
    itemId: string,
    borrowerName: string,
    borrowerContact?: string,
    expectedReturnDate?: string,
    note?: string
  ) => {
    const success = await InventoryService.borrowItem(
      itemId,
      borrowerName,
      borrowerContact,
      expectedReturnDate,
      note
    );
    if (success) {
      await loadData();
      const item = items.find((i) => i.id === itemId);
      addNotification("대여 완료", `'${item?.location || "물품"}' 대여가 등록되었습니다.`, "BORROW");
    } else {
      alert("대여 처리에 실패했습니다.");
    }
  };

  const handleReturnSubmit = async (itemId: string, note?: string) => {
    const success = await InventoryService.returnItem(itemId, note);
    if (success) {
      await loadData();
      const item = items.find((i) => i.id === itemId);
      addNotification("반납 완료", `'${item?.location || "물품"}'이(가) 정상 반납되었습니다.`, "RETURN");
    } else {
      alert("반납 처리에 실패했습니다.");
    }
  };

  const handleAddItem = async (itemData: {
    category: string;
    location: string;
    borrower_name?: string;
    description?: string;
  }) => {
    const created = await InventoryService.addItem({
      name: `${itemData.category} (${itemData.location})`,
      category: itemData.category,
      code: itemData.category.slice(0, 2) + "-" + Math.floor(10 + Math.random() * 90),
      location: itemData.location,
      description: itemData.description || null,
      borrower_name: itemData.borrower_name || null,
    } as any);

    if (created) {
      await loadData();
      addNotification("신규 등록", `'${itemData.location}'에 ${itemData.category}이(가) 등록되었습니다.`, "ADD");
    } else {
      alert("등록에 실패했습니다.");
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    const success = await InventoryService.deleteItem(itemId);
    if (success) {
      await loadData();
      addNotification("삭제 완료", "해당 항목이 삭제되었습니다.", "INFO");
    }
  };

  const handleResetData = async () => {
    if (confirm("기본 샘플 데이터로 복구하시겠습니까?")) {
      await InventoryService.resetData();
      await loadData();
      addNotification("초기화 완료", "기본 데이터로 복구되었습니다.", "INFO");
    }
  };

  return (
    <div className="app-container">
      {/* App Header (sp-blond style) */}
      <Header onRefresh={() => loadData()} />

      {/* Sub Navigation Bar (Search Box) */}
      <div className="px-5 py-2 bg-[#f8fafc] border-b border-[#d1d1d1] flex items-center justify-end gap-3 shrink-0">
        {/* Search Box */}
        <div className="relative w-72">
          <Search className="w-3.5 h-3.5 text-[#94a3b8] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="설치 장소, 대여자, 비고 검색..."
            className="w-full pl-8 pr-7 py-1.5 bg-white border border-[#d1d1d1] rounded-md text-xs focus:outline-none focus:border-[#217346] focus:ring-2 focus:ring-[#e6f2ec] transition placeholder:text-[#94a3b8]"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-[#94a3b8] hover:text-[#475569]"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Main Content Area (Sidebar + Spreadsheet) */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <Sidebar
          categories={CATEGORIES}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          stats={categoryStats}
          onAddItem={handleAddItem}
          onResetData={handleResetData}
        />

        {/* Right Main Table Viewer */}
        <main className="flex-1 flex flex-col overflow-hidden bg-white">
          {loading ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center space-y-2">
                <div className="w-8 h-8 border-2 border-[#217346] border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="text-xs text-[#666666]">데이터를 불러오는 중입니다...</p>
              </div>
            </div>
          ) : (
            <RosterTable
              items={filteredItems}
              onBorrow={(i) => setSelectedBorrowItem(i)}
              onReturn={(i) => setSelectedReturnItem(i)}
              onDelete={(id) => handleDeleteItem(id)}
            />
          )}

          {/* Bottom Bar */}
          <div className="px-4 py-1.5 bg-[#f3f3f3] border-t border-[#d1d1d1] flex items-center justify-end text-[11px] text-[#94a3b8] shrink-0 font-mono">
            THEHYUNDAI RENTAL
          </div>
        </main>
      </div>

      {/* Modals */}
      <BorrowModal
        item={selectedBorrowItem}
        isOpen={Boolean(selectedBorrowItem)}
        onClose={() => setSelectedBorrowItem(null)}
        onSubmit={handleBorrowSubmit}
      />

      <ReturnModal
        item={selectedReturnItem}
        isOpen={Boolean(selectedReturnItem)}
        onClose={() => setSelectedReturnItem(null)}
        onSubmit={handleReturnSubmit}
      />

      {/* Realtime Toast Notifications */}
      <RealtimeNotification
        notifications={notifications}
        onDismiss={dismissNotification}
      />
    </div>
  );
}
