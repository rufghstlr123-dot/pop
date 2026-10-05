export type ItemStatus = 'AVAILABLE' | 'LOANED';

export interface Item {
  id: string;
  name: string;
  category: string;
  code: string;
  location: string;
  status: ItemStatus;
  borrower_name: string | null;
  borrower_contact: string | null;
  loaned_at: string | null;
  expected_return_date: string | null;
  returned_at?: string | null;
  description: string | null;
  created_at: string;
}

export type ActionType = 'BORROW' | 'RETURN';

export interface RentalLog {
  id: string;
  item_id: string;
  item_name: string;
  action: ActionType;
  user_name: string;
  note: string | null;
  timestamp: string;
}

export interface InventoryStats {
  total: number;
  available: number;
  loaned: number;
}
