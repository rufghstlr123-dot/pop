import { Item, RentalLog } from "@/types/inventory";
import { db, ref, get, set, update, push, onValue, off } from "./firebase";
import { INITIAL_ITEMS, INITIAL_LOGS } from "./seed-data";

export const InventoryService = {
  isCloudSync(): boolean {
    return true; // Now always true because we use Firebase
  },

  async getItems(): Promise<Item[]> {
    try {
      const snapshot = await get(ref(db, "items"));
      if (snapshot.exists()) {
        const data = snapshot.val();
        return Object.values(data) as Item[];
      }
    } catch (e) {
      console.error("Firebase fetch items error:", e);
    }
    return INITIAL_ITEMS;
  },

  async getLogs(): Promise<RentalLog[]> {
    try {
      const snapshot = await get(ref(db, "rental_logs"));
      if (snapshot.exists()) {
        const data = snapshot.val();
        // Sort by timestamp desc
        const logs = Object.values(data) as RentalLog[];
        return logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      }
    } catch (e) {
      console.error("Firebase fetch logs error:", e);
    }
    return INITIAL_LOGS;
  },

  async triggerUpdate() {
    await set(ref(db, "last_updated"), Date.now());
  },

  async borrowItem(
    itemId: string,
    borrowerName: string,
    borrowerContact?: string,
    expectedReturnDate?: string,
    note?: string
  ): Promise<boolean> {
    try {
      const loanedAt = new Date().toISOString();

      await update(ref(db, `items/${itemId}`), {
        status: "LOANED",
        borrower_name: borrowerName,
        borrower_contact: borrowerContact || null,
        loaned_at: loanedAt,
        expected_return_date: expectedReturnDate || null,
      });

      const itemSnap = await get(ref(db, `items/${itemId}`));
      const itemName = itemSnap.exists() ? itemSnap.val().name : "알 수 없는 물품";

      const newLogRef = push(ref(db, "rental_logs"));
      await set(newLogRef, {
        id: newLogRef.key,
        item_id: itemId,
        item_name: itemName,
        action: "BORROW",
        user_name: borrowerName,
        note: note || borrowerContact || null,
        timestamp: loanedAt,
      });

      await this.triggerUpdate();
      return true;
    } catch (e) {
      console.error("Borrow error:", e);
      return false;
    }
  },

  async returnItem(itemId: string, note?: string): Promise<boolean> {
    try {
      const itemSnap = await get(ref(db, `items/${itemId}`));
      if (!itemSnap.exists()) return false;
      
      const currentItem = itemSnap.val();
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, "0");
      const day = String(now.getDate()).padStart(2, "0");
      const todayStr = `${year}-${month}-${day}`;

      await update(ref(db, `items/${itemId}`), {
        status: "AVAILABLE",
        returned_at: todayStr,
      });

      const newLogRef = push(ref(db, "rental_logs"));
      await set(newLogRef, {
        id: newLogRef.key,
        item_id: itemId,
        item_name: currentItem.name,
        action: "RETURN",
        user_name: currentItem.borrower_name || "미상",
        note: note || "정상 반납 완료",
        timestamp: new Date().toISOString(),
      });

      await this.triggerUpdate();
      return true;
    } catch (e) {
      console.error("Return error:", e);
      return false;
    }
  },

  async addItem(newItem: Partial<Item>): Promise<Item | null> {
    try {
      const hasBorrower = Boolean(newItem.borrower_name && newItem.borrower_name.trim());
      const now = new Date().toISOString();
      const loanedTime = newItem.loaned_at || now;

      const newId = "pop-" + Date.now().toString(36);
      
      const fullItem: Item = {
        id: newId,
        name: newItem.name || `${newItem.category} (${newItem.location})`,
        category: newItem.category || "A2 POP",
        code: newItem.code || (newItem.category?.slice(0, 2) || "PO") + "-" + Math.floor(10 + Math.random() * 90),
        location: newItem.location || "장소 미정",
        status: hasBorrower ? "LOANED" : "AVAILABLE",
        borrower_name: hasBorrower ? newItem.borrower_name!.trim() : null,
        borrower_contact: newItem.borrower_contact || null,
        loaned_at: hasBorrower ? loanedTime : null,
        expected_return_date: newItem.expected_return_date || null,
        returned_at: null,
        description: newItem.description || null,
        created_at: now,
      };

      await set(ref(db, `items/${newId}`), fullItem);

      if (hasBorrower) {
        const newLogRef = push(ref(db, "rental_logs"));
        await set(newLogRef, {
          id: newLogRef.key,
          item_id: fullItem.id,
          item_name: fullItem.name,
          action: "BORROW",
          user_name: fullItem.borrower_name!,
          note: fullItem.description || "신규 등록 및 즉시 대여",
          timestamp: loanedTime,
        });
      }

      await this.triggerUpdate();
      return fullItem;
    } catch (e) {
      console.error("Add item error:", e);
      return null;
    }
  },

  async editItem(itemId: string, data: Partial<Item>): Promise<boolean> {
    try {
      await update(ref(db, `items/${itemId}`), data);
      await this.triggerUpdate();
      return true;
    } catch (e) {
      console.error("Edit item error:", e);
      return false;
    }
  },

  async deleteItem(itemId: string): Promise<boolean> {
    try {
      await set(ref(db, `items/${itemId}`), null);
      await this.triggerUpdate();
      return true;
    } catch (e) {
      console.error("Delete item error:", e);
      return false;
    }
  },

  async resetData(): Promise<boolean> {
    return false; // disabled
  },

  subscribe(onUpdate: () => void): () => void {
    const updateRef = ref(db, "last_updated");
    
    // Listen for changes
    onValue(updateRef, () => {
      onUpdate();
    });

    return () => {
      off(updateRef);
    };
  },
};
