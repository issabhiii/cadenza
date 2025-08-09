// supabaseClient.js
(() => {
  'use strict';

  const SUPABASE_URL = 'https://xzydohefpyxsputkzawf.supabase.co';
  const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh6eWRvaGVmcHl4c3B1dGt6YXdmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzMTg1MTgsImV4cCI6MjA2OTg5NDUxOH0.iVwoNDL23MytEJGdAwM4UJGnozrDxhJ3qD1Vcjq1UUM';

  if (!window.supabase) {
    console.error("[supabaseClient] supabase library missing. Ensure <script src='https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2'></script> is loaded first.");
  }
  const client = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  console.log("[supabaseClient] client created", { SUPABASE_URL });

  // Call Edge Function to create Meet + insert booked_slots
  // window.bookSlot = async function bookSlot(payload) {
  //   console.log("[supabaseClient] bookSlot payload", payload);
  //   try {
  //     const url = `${SUPABASE_URL}/functions/v1/book-slot`;
  //     const res = await fetch(url, {
  //       method: 'POST',
  //       headers: { 'content-type': 'application/json' },
  //       body: JSON.stringify(payload)
  //     });
  //     console.log("[supabaseClient] bookSlot response status", res.status);
  //     const text = await res.text();
  //     let json;
  //     try { json = JSON.parse(text); } catch { json = { raw:text }; }
  //     console.log("[supabaseClient] bookSlot response body", json);

  //     if (!res.ok) {
  //       throw new Error(`book-slot failed: ${res.status} ${text}`);
  //     }
  //     return json;
  //   } catch (err) {
  //     console.error("[supabaseClient] bookSlot error", err);
  //     throw err;
  //   }
  // };
  // No-op in v1
window.bookSlot = async function bookSlot() {
  console.log("[supabaseClient] bookSlot is disabled in v1");
  return { ok: false, gmeet_link: null };
};


  // Save registration row
  window.saveRegistration = async function saveRegistration(data) {
    console.log("[supabaseClient] saveRegistration payload", data);
    try {
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
        .single();

      if (error) {
        console.error('[supabaseClient] saveRegistration error', error);
        throw error;
      }
      console.log('[supabaseClient] saveRegistration success', inserted);
      return inserted;
    } catch (err) {
      console.error('[supabaseClient] saveRegistration exception', err);
      throw err;
    }
  };
  // Insert a booking row directly (temporary helper until Edge Function is live)
window.insertBookedSlot = async function insertBookedSlot(payload) {
  console.log("[supabaseClient] insertBookedSlot payload", payload);
  const { data, error } = await client
    .from('booked_slots')
    .insert([{
      slot_id: payload.slot_id,
      date: payload.date,                 // 'YYYY-MM-DD'
      start_time: payload.start_time,     // 'HH:mm'
      end_time: payload.end_time,         // 'HH:mm'
      timezone: payload.timezone,         // e.g. 'Asia/Kolkata'
      student_name: payload.student_name, // optional columns if you have them
      student_email: payload.student_email
    }])
    .select()
    .single();

  if (error) {
    console.error("[supabaseClient] insertBookedSlot error", error);
    throw error;
  }
  console.log("[supabaseClient] insertBookedSlot success", data);
  return data;
};

})();
