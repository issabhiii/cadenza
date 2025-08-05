// supabaseClient.js
(() => {
  const SUPABASE_URL     = 'https://xzydohefpyxsputkzawf.supabase.co';
  const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh6eWRvaGVmcHl4c3B1dGt6YXdmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzMTg1MTgsImV4cCI6MjA2OTg5NDUxOH0.iVwoNDL23MytEJGdAwM4UJGnozrDxhJ3qD1Vcjq1UUM';

  // Comes from your <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
  const client = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  /**
   * Insert a new contact into your "contact_requests" table.
   * @throws {Error} with full Supabase error info if it fails.
   */
  window.saveContact = async function(name, email, whatsapp, message) {
    const { data, error } = await client
      .from('contact_requests')    // ← your actual table name
      .insert([{ name, email, whatsapp, message }]);

    if (error) {
      // build a more descriptive Error
      const { message: msg, details, hint, code } = error;
      let full = `Supabase insert error: ${msg}`;
      if (details) full += `\nDetails: ${details}`;
      if (hint)    full += `\nHint: ${hint}`;
      if (code)    full += `\nCode: ${code}`;
      throw new Error(full);
    }

    return data;
  };
})();
