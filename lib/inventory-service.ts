import { Item, RentalLog } from "@/types/inventory";
import { supabase, isSupabaseConfigured } from "./supabase";
import { INITIAL_ITEMS, INITIAL_LOGS } from "./seed-data";

const BROADCAST_CHANNEL_NAME = "hyundai_inventory_sync";

function getBroadcastChannel(): BroadcastChannel | null {
  if (typeof window !== "undefined" && "BroadcastChannel" in window) {
    try {
      return new BroadcastChannel(BROADCAST_CHANNEL_NAME);
    } catch {
      return null;
    }
  }
  return null;
}

let currentServerVersion = 0;

export const InventoryService = {
  isCloudSync(): boolean {
    return isSupabaseConfigured;
  },

  async getItems(): Promise<Item[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from("items")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data) {
        return data as Item[];
      }
    }

    // 서버 API 동기화 (다중 브라우저, 시크릿 모드, 모바일 등 모든 접속자 완벽 공유)
    try {
      const res = await fetch("/api/data", { cache: "no-store" });
      if (res.ok) {
        const json = await res.json();
        if (json.version) currentServerVersion = json.version;
        if (json.items) return json.items;
      }
    } catch (e) {
      console.warn("Server API fetch error, fallback to seed:", e);
    }

    return INITIAL_ITEMS;
  },

  async getLogs(): Promise<RentalLog[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from("rental_logs")
        .select("*")
        .order("timestamp", { ascending: false })
        .limit(50);

      if (!error && data) {
        return data as RentalLog[];
      }
    }

    try {
      const res = await fetch("/api/data", { cache: "no-store" });
      if (res.ok) {
        const json = await res.json();
        if (json.logs) return json.logs;
      }
    } catch (e) {
      console.warn("Server API fetch error:", e);
    }

    return INITIAL_LOGS;
  },

  async borrowItem(
    itemId: string,
    borrowerName: string,
    borrowerContact?: string,
    expectedReturnDate?: string,
    note?: string
  ): Promise<boolean> {
    const loanedAt = new Date().toISOString();

    if (isSupabaseConfigured && supabase) {
      const { error: itemError } = await supabase
        .from("items")
        .update({
          status: "LOANED",
          borrower_name: borrowerName,
          borrower_contact: borrowerContact || null,
          loaned_at: loanedAt,
          expected_return_date: expectedReturnDate || null,
        })
        .eq("id", itemId);

      if (itemError) {
        console.error("Supabase borrow error:", itemError);
        return false;
      }

      const { data: itemData } = await supabase
        .from("items")
        .select("name")
        .eq("id", itemId)
        .single();

      await supabase.from("rental_logs").insert({
        item_id: itemId,
        item_name: itemData?.name || "알 수 없는 물품",
        action: "BORROW",
        user_name: borrowerName,
        note: note || borrowerContact || null,
        timestamp: loanedAt,
      });

      return true;
    }

    // 서버 API 호출
    try {
      const res = await fetch("/api/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "BORROW",
          payload: { itemId, borrowerName, borrowerContact, expectedReturnDate, note },
        }),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.version) currentServerVersion = json.version;
        getBroadcastChannel()?.postMessage({ type: "SYNC_UPDATED" });
        return true;
      }
    } catch (e) {
      console.error("Borrow API error:", e);
    }
    return false;
  },

  async returnItem(itemId: string, note?: string): Promise<boolean> {
    const timestamp = new Date().toISOString();

    if (isSupabaseConfigured && supabase) {
      const { data: currentItem, error: getErr } = await supabase
        .from("items")
        .select("name, borrower_name")
        .eq("id", itemId)
        .single();

      if (getErr || !currentItem) {
        console.error("Error finding item for return:", getErr);
        return false;
      }

      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, "0");
      const day = String(now.getDate()).padStart(2, "0");
      const todayStr = `${year}-${month}-${day}`;

      const { error: itemError } = await supabase
        .from("items")
        .update({
          status: "AVAILABLE",
          returned_at: todayStr,
        })
        .eq("id", itemId);

      if (itemError) {
        console.error("Supabase return error:", itemError);
        return false;
      }

      await supabase.from("rental_logs").insert({
        item_id: itemId,
        item_name: currentItem.name,
        action: "RETURN",
        user_name: currentItem.borrower_name || "미확인",
        note: note || "정상 반납 완료",
        timestamp,
      });

      return true;
    }

    // 서버 API 호출
    try {
      const res = await fetch("/api/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "RETURN",
          payload: { itemId, note },
        }),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.version) currentServerVersion = json.version;
        getBroadcastChannel()?.postMessage({ type: "SYNC_UPDATED" });
        return true;
      }
    } catch (e) {
      console.error("Return API error:", e);
    }
    return false;
  },

  async addItem(newItem: Omit<Item, "id" | "status" | "borrower_name" | "borrower_contact" | "loaned_at" | "expected_return_date" | "created_at">): Promise<Item | null> {
    if (isSupabaseConfigured && supabase) {
      const fullItem: Item = {
        ...newItem,
        id: "hyd-" + Date.now().toString(36),
        status: "AVAILABLE",
        borrower_name: null,
        borrower_contact: null,
        loaned_at: null,
        expected_return_date: null,
        created_at: new Date().toISOString(),
      };
      const { data, error } = await supabase.from("items").insert(fullItem).select().single();
      if (!error && data) {
        return data as Item;
      }
      return null;
    }

    // 서버 API 호출
    try {
      const res = await fetch("/api/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "ADD",
          payload: newItem,
        }),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.version) currentServerVersion = json.version;
        getBroadcastChannel()?.postMessage({ type: "SYNC_UPDATED" });
        return json.item;
      }
    } catch (e) {
      console.error("Add item API error:", e);
    }
    return null;
  },

  async editItem(itemId: string, data: Partial<Item>): Promise<boolean> {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from("items").update(data).eq("id", itemId);
      return !error;
    }

    try {
      const res = await fetch("/api/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "EDIT",
          payload: { itemId, data },
        }),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.version) currentServerVersion = json.version;
        getBroadcastChannel()?.postMessage({ type: "SYNC_UPDATED" });
        return true;
      }
    } catch (e) {
      console.error("Edit item API error:", e);
    }
    return false;
  },

  async deleteItem(itemId: string): Promise<boolean> {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from("items").delete().eq("id", itemId);
      return !error;
    }

    try {
      const res = await fetch("/api/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "DELETE",
          payload: { itemId },
        }),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.version) currentServerVersion = json.version;
        getBroadcastChannel()?.postMessage({ type: "SYNC_UPDATED" });
        return true;
      }
    } catch (e) {
      console.error("Delete API error:", e);
    }
    return false;
  },

  async resetData(): Promise<boolean> {
    try {
      const res = await fetch("/api/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "RESET" }),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.version) currentServerVersion = json.version;
        getBroadcastChannel()?.postMessage({ type: "SYNC_UPDATED" });
        return true;
      }
    } catch (e) {
      console.error("Reset API error:", e);
    }
    return false;
  },

  // 실시간 변경 구독
  subscribe(onUpdate: () => void): () => void {
    if (isSupabaseConfigured && supabase) {
      const channel = supabase
        .channel("hyundai_inventory_realtime")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "items" },
          () => {
            onUpdate();
          }
        )
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "rental_logs" },
          () => {
            onUpdate();
          }
        )
        .subscribe();

      return () => {
        supabase?.removeChannel(channel);
      };
    }

    // 서버 기반 스마트 실시간 폴링 + 브라우저 채널 즉각 반응
    const channel = getBroadcastChannel();
    const handleBroadcast = () => {
      onUpdate();
    };

    if (channel) {
      channel.addEventListener("message", handleBroadcast);
    }

    // 1초 주기로 서버 버전 확인 (매우 가벼운 ping 요청)
    const intervalId = setInterval(async () => {
      try {
        const res = await fetch(`/api/data?version=${currentServerVersion}`, { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          if (data.changed) {
            currentServerVersion = data.version;
            onUpdate();
          }
        }
      } catch {
        // network issue ignore
      }
    }, 1000);

    const handleFocus = () => {
      onUpdate();
    };
    window.addEventListener("focus", handleFocus);

    return () => {
      clearInterval(intervalId);
      if (channel) {
        channel.removeEventListener("message", handleBroadcast);
        channel.close();
      }
      window.removeEventListener("focus", handleFocus);
    };
  },
};
