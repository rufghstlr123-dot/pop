"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Search, RotateCcw, HelpCircle, Package, CheckCircle2, Clock } from "lucide-react";
import { Item, RentalLog, InventoryStats } from "@/types/inventory";
import { InventoryService } from "@/lib/inventory-service";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { RosterTable } from "@/components/RosterTable";
import { ItemCard } from "@/components/ItemCard";
import { BorrowModal } from "@/components/BorrowModal";
import { ReturnModal } from "@/components/ReturnModal";
import { HistoryModal } from "@/components/HistoryModal";
import { SyncGuideModal } from "@/components/SyncGuideModal";
import {
  RealtimeNotification,
  NotificationMessage,
} from "@/components/RealtimeNotification";

const CATEGORIES = [
  "전체",
  "음향/오디오",
  "카메라/영상",
  "IT/업무장비",
  "뷰티/스타일링",
  "행사/의전",
  "기타 편의용품",
];

export default function HomePage() {
  const [items, setItems] = useState<Item[]>([]);
  const [logs, setLogs] = useState<RentalLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCloud, setIsCloud] = useState(false);

  // Filters & Views
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("전체");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "AVAILABLE" | "LOANED">("ALL");
  const [viewMode, setViewMode] = useState<"TABLE" | "GRID">("TABLE");

  // Modals
  const [selectedBorrowItem, setSelectedBorrowItem] = useState<Item | null>(null);
  const [selectedReturnItem, setSelectedReturnItem] = useState<Item | null>(null);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isGuideModalOpen, setIsGuideModalOpen] = useState(false);

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
          "다른 사용자의 대여/반납 변경사항이 즉시 반영되었습니다.",
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
    setIsCloud(InventoryService.isCloudSync());
    loadData();

    const unsubscribe = InventoryService.subscribe(() => {
      loadData(true);
    });

    return () => {
      unsubscribe();
    };
  }, [loadData]);

  // Statistics
  const stats: InventoryStats = useMemo(() => {
    const total = items.length;
    const available = items.filter((i) => i.status === "AVAILABLE").length;
    const loaned = items.filter((i) => i.status === "LOANED").length;
    return { total, available, loaned };
  }, [items]);

  // Filter items
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      if (statusFilter === "AVAILABLE" && item.status !== "AVAILABLE") return false;
      if (statusFilter === "LOANED" && item.status !== "LOANED") return false;
      if (selectedCategory !== "전체" && item.category !== selectedCategory) return false;

      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchName = item.name.toLowerCase().includes(query);
        const matchCode = item.code.toLowerCase().includes(query);
        const matchLocation = item.location.toLowerCase().includes(query);
        const matchBorrower = item.borrower_name?.toLowerCase().includes(query) ?? false;
        const matchCategory = item.category.toLowerCase().includes(query);
        return matchName || matchCode || matchLocation || matchBorrower || matchCategory;
      }

      return true;
    });
  }, [items, statusFilter, selectedCategory, searchQuery]);

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
      addNotification("대여 완료", `'${item?.name || "물품"}' 대여가 등록되었습니다.`, "BORROW");
    } else {
      alert("대여 처리에 실패했습니다.");
    }
  };

  const handleReturnSubmit = async (itemId: string, note?: string) => {
    const success = await InventoryService.returnItem(itemId, note);
    if (success) {
      await loadData();
      const item = items.find((i) => i.id === itemId);
      addNotification("반납 완료", `'${item?.name || "물품"}'이(가) 정상 반납되었습니다.`, "RETURN");
    } else {
      alert("반납 처리에 실패했습니다.");
    }
  };

  const handleAddItem = async (newItem: Omit<Item, "id" | "status" | "borrower_name" | "borrower_contact" | "loaned_at" | "expected_return_date" | "created_at">) => {
    const created = await InventoryService.addItem(newItem);
    if (created) {
      await loadData();
      addNotification("신규 등록", `'${created.name}'이(가) 등록되었습니다.`, "ADD");
    } else {
      alert("등록에 실패했습니다.");
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    const success = await InventoryService.deleteItem(itemId);
    if (success) {
      await loadData();
      addNotification("물품 삭제", "해당 물품이 목록에서 제거되었습니다.", "INFO");
    }
  };

  const handleResetData = async () => {
    if (confirm("샘플 초기 데이터로 복구하시겠습니까?")) {
      await InventoryService.resetData();
      await loadData();
      addNotification("초기화 완료", "샘플 데이터로 복구되었습니다.", "INFO");
    }
  };

  return (
    <div className="w-full flex items-center justify-center p-0 sm:p-2 lg:p-4">
      {/* Target Site (sp-blond) style App Container */}
      <div className="w-full max-w-[1720px] h-[calc(100vh-2rem)] min-h-[720px] bg-white rounded-xl shadow-xl border border-[#d1d1d1] flex flex-col overflow-hidden">
        {/* App Header */}
        <Header
          isCloud={isCloud}
          totalCount={stats.total}
          availableCount={stats.available}
          loanedCount={stats.loaned}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          viewMode={viewMode}
          onToggleViewMode={setViewMode}
          onOpenHistoryModal={() => setIsHistoryModalOpen(true)}
          onOpenGuideModal={() => setIsGuideModalOpen(true)}
          onRefresh={() => loadData()}
        />

        {/* Sub Navigation & Search Bar (sp-blond sub-bar) */}
        <div className="px-5 py-2.5 bg-[#f8fafc] border-b border-[#d1d1d1] flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 text-xs">
            <span className="text-[#64748b] font-medium">선택된 카테고리:</span>
            <span className="px-2 py-0.5 rounded font-bold bg-[#e6f2ec] text-[#217346] border border-[#bbf7d0]">
              {selectedCategory}
            </span>
            <span className="text-[#cbd5e1]">|</span>
            <span className="text-[#64748b]">
              총 <strong className="text-[#1e293b] font-mono">{filteredItems.length}</strong>건 표시 중
            </span>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-80">
            <Search className="w-3.5 h-3.5 text-[#94a3b8] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="물품명, 관리코드, 위치, 대여자 검색..."
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

        {/* Main Content Area (Sidebar + Spreadsheet / Card) */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left Sidebar */}
          <Sidebar
            categories={CATEGORIES}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            stats={stats}
            onAddItem={handleAddItem}
            onResetData={handleResetData}
          />

          {/* Right Main Viewer */}
          <main className="flex-1 flex flex-col overflow-hidden bg-white">
            {loading ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center space-y-2">
                  <div className="w-8 h-8 border-2 border-[#217346] border-t-transparent rounded-full animate-spin mx-auto"></div>
                  <p className="text-xs text-[#666666]">데이터를 불러오는 중입니다...</p>
                </div>
              </div>
            ) : viewMode === "TABLE" ? (
              <RosterTable
                items={filteredItems}
                onBorrow={(i) => setSelectedBorrowItem(i)}
                onReturn={(i) => setSelectedReturnItem(i)}
                onDelete={(id) => handleDeleteItem(id)}
              />
            ) : (
              <div className="flex-1 overflow-y-auto p-5 bg-[#f8fafc]">
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {filteredItems.map((item) => (
                    <ItemCard
                      key={item.id}
                      item={item}
                      onBorrow={(i) => setSelectedBorrowItem(i)}
                      onReturn={(i) => setSelectedReturnItem(i)}
                      onDelete={(id) => handleDeleteItem(id)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Bottom Status Ribbon */}
            <div className="px-4 py-2 bg-[#f3f3f3] border-t border-[#d1d1d1] flex items-center justify-between text-[11px] text-[#666666] shrink-0">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
                  동기화 서버 정상 가동 중
                </span>
                <span>·</span>
                <span>새로고침 없이 모든 접속자에게 실시간 반영</span>
              </div>
              <div className="font-mono text-[#94a3b8]">
                THE HYUNDAI SERVICE DESK v1.0
              </div>
            </div>
          </main>
        </div>
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

      <HistoryModal
        logs={logs}
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
      />

      <SyncGuideModal
        isOpen={isGuideModalOpen}
        onClose={() => setIsGuideModalOpen(false)}
        isCloud={isCloud}
      />

      {/* Realtime Toast Notifications */}
      <RealtimeNotification
        notifications={notifications}
        onDismiss={dismissNotification}
      />
    </div>
  );
}
