/*
  # Create real estate projects schema

  1. New Tables
    - `projects`
      - `id` (uuid, primary key)
      - `name` (text, project name)
      - `description` (text, full description)
      - `location` (text, address or location)
      - `image_url` (text, main image URL)
      - `price_from` (numeric, starting price)
      - `units_available` (integer, available units)
      - `total_units` (integer, total units in project)
      - `delivery_date` (text, estimated delivery)
      - `amenities` (jsonb, list of amenities)
      - `is_featured` (boolean, featured on homepage)
      - `status` (text, project status)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `clients`
      - `id` (uuid, primary key)
      - `name` (text, client name)
      - `email` (text, client email)
      - `phone` (text, phone number)
      - `message` (text, contact message)
      - `created_at` (timestamptz)
    
    - `operations`
      - `id` (uuid, primary key)
      - `project_id` (uuid, foreign key to projects)
      - `client_id` (uuid, foreign key to clients)
      - `operation_type` (text, sale/reservation)
      - `amount` (numeric, operation amount)
      - `status` (text, pending/completed/cancelled)
      - `notes` (text, additional notes)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `page_config`
      - `id` (uuid, primary key)
      - `hero_title` (text, hero section title)
      - `hero_subtitle` (text, hero section subtitle)
      - `contact_email` (text, contact email)
      - `contact_phone` (text, contact phone)
      - `maps_embed_url` (text, Google Maps embed URL)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Public read access for projects and page_config
    - Authenticated access for clients, operations management
*/

CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  location text NOT NULL,
  image_url text NOT NULL,
  price_from numeric NOT NULL,
  units_available integer NOT NULL DEFAULT 0,
  total_units integer NOT NULL,
  delivery_date text NOT NULL,
  amenities jsonb DEFAULT '[]'::jsonb,
  is_featured boolean DEFAULT false,
  status text DEFAULT 'available',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  message text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS operations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  client_id uuid REFERENCES clients(id) ON DELETE CASCADE,
  operation_type text NOT NULL,
  amount numeric,
  status text DEFAULT 'pending',
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS page_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hero_title text DEFAULT 'Tu Hogar del Futuro',
  hero_subtitle text DEFAULT 'Departamentos en pozo con diseño vanguardista',
  contact_email text DEFAULT 'info@example.com',
  contact_phone text DEFAULT '+54 11 1234-5678',
  maps_embed_url text,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE operations ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view projects"
  ON projects FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert projects"
  ON projects FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update projects"
  ON projects FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete projects"
  ON projects FOR DELETE
  TO authenticated
  USING (true);

CREATE POLICY "Anyone can insert clients"
  ON clients FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Authenticated users can view clients"
  ON clients FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can view operations"
  ON operations FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert operations"
  ON operations FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update operations"
  ON operations FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete operations"
  ON operations FOR DELETE
  TO authenticated
  USING (true);

CREATE POLICY "Anyone can view page config"
  ON page_config FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can update page config"
  ON page_config FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

INSERT INTO page_config (hero_title, hero_subtitle, contact_email, contact_phone, maps_embed_url)
VALUES (
  'Tu Hogar del Futuro',
  'Departamentos en pozo con diseño vanguardista',
  'info@example.com',
  '+54 11 1234-5678',
  'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d52562.18084201652!2d-58.445!3d-34.605!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzTCsDM2JzE4LjAiUyA1OMKwMjYnNDIuMCJX!5e0!3m2!1sen!2sar!4v1234567890'
)
ON CONFLICT DO NOTHING;