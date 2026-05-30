// Supabase client for HireMint static site
// Loads @supabase/supabase-js from CDN and exposes `window.hmSupabase`.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = 'https://yilyjstxmytjbfuyudzd.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlpbHlqc3R4bXl0amJmdXl1ZHpkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAxMTE5MjksImV4cCI6MjA5NTY4NzkyOX0.8O1MWLhiPDHNv15PnngL_VVmC-MYAnRY-1c99QEMry0';

window.hmSupabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: true, autoRefreshToken: true, storageKey: 'hiremint-auth' },
});
window.dispatchEvent(new Event('hm-supabase-ready'));
