import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Project = {
  id: string;
  name: string;
  description: string;
  location: string;
  image_url: string;
  price_from: number;
  units_available: number;
  total_units: number;
  delivery_date: string;
  amenities: string[];
  is_featured: boolean;
  status: string;
  created_at: string;
  updated_at: string;
};

export type Client = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  message?: string;
  created_at: string;
};

export type Operation = {
  id: string;
  project_id: string;
  client_id: string;
  operation_type: string;
  amount?: number;
  status: string;
  notes?: string;
  created_at: string;
  updated_at: string;
};

export type PageConfig = {
  id: string;
  hero_title: string;
  hero_subtitle: string;
  contact_email: string;
  contact_phone: string;
  maps_embed_url?: string;
  updated_at: string;
};
