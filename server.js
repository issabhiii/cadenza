// supabaseClient.js
(() => {
  const SUPABASE_URL = 'https://xzydohefpyxsputkzawf.supabase.co';
  const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh6eWRvaGVmcHl4c3B1dGt6YXdmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzMTg1MTgsImV4cCI6MjA2OTg5NDUxOH0.iVwoNDL23MytEJGdAwM4UJGnozrDxhJ3qD1Vcjq1UUM';

  const client = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  window.createTeacherSlot = async function(payload) {
    try {
      console.log('Creating teacher slot:', payload);
      const { data, error } = await client
        .from('teacher_slots')
        .insert([payload])
        .select()
        .single();
      
      if (error) {
        console.error('Supabase createTeacherSlot error:', error);
        throw error;
      }
      return data;
    } catch (error) {
      console.error('Error in createTeacherSlot:', error);
      throw error;
    }
  };

  window.fetchTeacherSlots = async function(dateStr) {
    try {
      console.log('Fetching teacher slots for:', dateStr || 'all dates');
      let query = client
        .from('teacher_slots')
        .select('*')
        .order('start_time', { ascending: true });
      
      if (dateStr) {
        query = query.eq('date', dateStr);
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error('Supabase fetchTeacherSlots error:', error);
        throw error;
      }
      return data;
    } catch (error) {
      console.error('Error in fetchTeacherSlots:', error);
      throw error;
    }
  };

  window.deleteTeacherSlot = async function(id) {
    try {
      console.log('Deleting teacher slot:', id);
      const { error } = await client
        .from('teacher_slots')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error('Supabase deleteTeacherSlot error:', error);
        throw error;
      }
      return true;
    } catch (error) {
      console.error('Error in deleteTeacherSlot:', error);
      throw error;
    }
  };

  window.saveRegistration = async function(data) {
    try {
      console.log('Saving registration:', data);
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
        console.error('Supabase saveRegistration error:', error);
        throw error;
      }
      return inserted;
    } catch (error) {
      console.error('Error in saveRegistration:', error);
      throw error;
    }
  };
})();