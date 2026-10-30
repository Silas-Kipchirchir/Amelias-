/* Paste your Supabase project URL and anon/public key below.
   Never put a service_role key in website code. */
window.AMELIAS_CONFIG = {
  SUPABASE_URL: "https://bwwpxtoopwqdqzhkgqws.supabase.co",
  SUPABASE_ANON_KEY: "sb_publishable_dbwimiyvQyEQ7guIVjhFGw_GTCxDB-o",
  WHATSAPP_NUMBER: "254784904677",
  PHONE_DISPLAY: "0729 339 019",
  PHONE_TEL: "+254729339019",
  EMAIL: ""
};
window.AMELIAS_SUPABASE_READY = !!(
  window.supabase &&
  window.AMELIAS_CONFIG.SUPABASE_URL.startsWith("https://") &&
  !window.AMELIAS_CONFIG.SUPABASE_URL.includes("YOUR_") &&
  window.AMELIAS_CONFIG.SUPABASE_ANON_KEY &&
  !window.AMELIAS_CONFIG.SUPABASE_ANON_KEY.includes("YOUR_")
);
window.AMELIAS_DB = window.AMELIAS_SUPABASE_READY
  ? window.supabase.createClient(window.AMELIAS_CONFIG.SUPABASE_URL, window.AMELIAS_CONFIG.SUPABASE_ANON_KEY)
  : null;
