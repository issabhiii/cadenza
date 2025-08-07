// supabaseClient.js
(() => {
  const SUPABASE_URL      = 'https://xzydohefpyxsputkzawf.supabase.co';
  const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh6eWRvaGVmcHl4c3B1dGt6YXdmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzMTg1MTgsImV4cCI6MjA2OTg5NDUxOH0.iVwoNDL23MytEJGdAwM4UJGnozrDxhJ3qD1Vcjq1UUM';

  const client = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  window.saveRegistration = async function(data) {
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
      .select();

    if (error) {
      // more detailed logging:
      console.error('❌ Supabase insert error:', error);
      console.error('→ message:', error.message);
      console.error('→ details:', error.details);
      console.error('→ hint:', error.hint);
      console.error('→ code:', error.code);
      throw error;
    }

    console.log('✅ Supabase insert success:', inserted);
    return inserted;
  };
})();
