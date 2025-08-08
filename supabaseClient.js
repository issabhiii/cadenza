// supabaseClient.js
(() => {
  const SUPABASE_URL = 'https://xzydohefpyxsputkzawf.supabase.co';
  const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh6eWRvaGVmcHl4c3B1dGt6YXdmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzMTg1MTgsImV4cCI6MjA2OTg5NDUxOH0.iVwoNDL23MytEJGdAwM4UJGnozrDxhJ3qD1Vcjq1UUM';

  const client = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  /**
   * Save a student registration to Supabase.
   * @param {Object} data - The registration form data.
   * @returns {Promise<Object>} - The inserted registration row.
   */
  window.saveRegistration = async function(data) {
    try {
      if (!data || typeof data !== "object") {
        throw new Error("No registration data provided!");
      }
      console.log('⏳ Supabase: saving registration', data);

      const { data: inserted, error } = await client
        .from('registrations')
        .insert([{
          name: data.name,
          age: data.age,
          email: data.email,
          phone: data.phone,
          course: data.course,
          previous_experience: data.previous_experience,
          country: data.country,
          calendar_date: data.calendar_date,
          calendar_time: data.calendar_time,
          calendar_timezone: data.calendar_timezone,
          calendar_link: data.calendar_link
        }])
        .select()
        .single(); // ensure a single inserted row is returned

      if (error) {
        // More detailed logging:
        console.error('❌ Supabase insert error:', error);
        throw error;
      }

      console.log('✅ Supabase insert success:', inserted);
      return inserted;
    } catch (err) {
      // You can also show an alert or custom UI error message here if desired
      console.error('❗ Error in saveRegistration:', err);
      throw err;
    }
  };
})();
