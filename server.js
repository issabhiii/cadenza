// server.js
(() => {
  'use strict';

  const SUPABASE_URL = 'https://xzydohefpyxsputkzawf.supabase.co';
  const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh6eWRvaGVmcHl4c3B1dGt6YXdmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzMTg1MTgsImV4cCI6MjA2OTg5NDUxOH0.iVwoNDL23MytEJGdAwM4UJGnozrDxhJ3qD1Vcjq1UUM';
  const client = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  const { DateTime } = luxon;

  // Teacher Slots
  window.createTeacherSlot = async function(payload) {
    const { data, error } = await client.from('teacher_slots').insert([payload]).select().single();
    if (error) { console.error("[server] createTeacherSlot error", error); throw error; }
    console.log("[server] createTeacherSlot ok", data);
    return data;
  };

  window.fetchTeacherSlots = async function(dateStr) {
    let q = client.from('teacher_slots').select('*').order('start_time', { ascending: true });
    if (dateStr) q = q.eq('date', dateStr);
    const { data, error } = await q;
    if (error) { console.error("[server] fetchTeacherSlots error", error); throw error; }
    console.log("[server] fetchTeacherSlots ok", data?.length);
    return data || [];
  };

  window.deleteTeacherSlot = async function(id) {
    const { error } = await client.from('teacher_slots').delete().eq('id', id);
    if (error) { console.error("[server] deleteTeacherSlot error", error); throw error; }
    console.log("[server] deleteTeacherSlot ok", id);
    return true;
  };

  // Booked Slots (read)
  window.fetchBookedForSlot = async function(slotId, dateStr) {
    const { data, error } = await client
      .from('booked_slots')
      .select('id, slot_id, date, start_time, end_time, timezone')
      .eq('slot_id', slotId)
      .eq('date', dateStr)
      .order('start_time', { ascending: true });
    if (error) { console.error("[server] fetchBookedForSlot error", error); throw error; }
    console.log("[server] fetchBookedForSlot ok", data?.length, { slotId, dateStr });
    return data || [];
  };

  // (Availability helpers kept if needed elsewhere)
  window.computeAvailableHourLabels = function(slot, userTimezone, bookedRows) {
    const slotStart = DateTime.fromISO(`${slot.date}T${slot.start_time}`, { zone: slot.timezone });
    const slotEnd   = DateTime.fromISO(`${slot.date}T${slot.end_time}`,   { zone: slot.timezone });
    const userStart = slotStart.setZone(userTimezone);
    const userEnd   = slotEnd.setZone(userTimezone);

    const blocks = [];
    let cur = userStart;
    while (cur < userEnd) {
      const next = cur.plus({ hours: 1 });
      blocks.push([cur, next < userEnd ? next : userEnd]);
      cur = next;
    }

    if (!bookedRows?.length) {
      return blocks.map(([s, e]) => `${s.toFormat('hh:mm a')} – ${e.toFormat('hh:mm a')}`);
    }

    const intervals = bookedRows.map(b => {
      const bs = DateTime.fromISO(`${b.date}T${b.start_time}`, { zone: b.timezone }).setZone(userTimezone);
      const be = DateTime.fromISO(`${b.date}T${b.end_time}`,   { zone: b.timezone }).setZone(userTimezone);
      return [bs, be];
    });

    const available = blocks.filter(([s, e]) => intervals.every(([bs, be]) => !(s.toMillis() < be.toMillis() && bs.toMillis() < e.toMillis())));
    return available.map(([s, e]) => `${s.toFormat('hh:mm a')} – ${e.toFormat('hh:mm a')}`);
  };
})();
