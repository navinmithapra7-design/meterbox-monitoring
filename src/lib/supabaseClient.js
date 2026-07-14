import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Table names
export const READINGS_TABLE = 'meter_box_data';
export const DEVICES_TABLE = 'devices';
export const ALERTS_TABLE = 'alerts';
export const REPORTS_TABLE = 'reports';
