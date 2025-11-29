export interface Transaction {
  id: string;
  user_id: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  description?: string;
  created_at: string;
}

export interface Goal {
  id: string;
  user_id: string;
  title: string;
  target_amount: number;
  current_amount: number;
  icon: string;
  color: string;
  created_at: string;
}

export interface UserProfile {
  id: string;
  full_name: string;
  avatar_url: string;
  email: string;
}
