// --- SUPABASE CONFIG ---
const supabaseUrl = 'https://xzydohefpyxsputkzawf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh6eWRvaGVmcHl4c3B1dGt6YXdmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzMTg1MTgsImV4cCI6MjA2OTg5NDUxOH0.iVwoNDL23MytEJGdAwM4UJGnozrDxhJ3qD1Vcjq1UUM';
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

window.adminUser = null;

document.addEventListener('DOMContentLoaded', () => {

  // --- DOM Refs ---
  const loginOverlay = document.getElementById('login-overlay');
  const loginForm = document.getElementById('login-form');
  const devBtn = document.getElementById('dev-bypass');
  const adminGreeting = document.getElementById('admin-greeting');
  const logoutBtn = document.getElementById('logout-btn');
  const exportCsvBtn = document.getElementById('export-csv');
  const viewModal = document.getElementById('view-modal');
  const closeModalBtn = document.getElementById('close-modal');
  const modalContent = document.getElementById('modal-content');

  // --- LOGIN LOGIC ---
  function updateAdminGreeting() {
    if (window.adminUser && window.adminUser.name) {
      adminGreeting.textContent = `Welcome, ${window.adminUser.name.toLowerCase()}!`;
    } else {
      adminGreeting.textContent = 'Welcome, Admin!';
    }
  }
  function hideOverlay() {
    loginOverlay.classList.add('fadeout');
    setTimeout(() => {
      loginOverlay.style.display = 'none';
      updateAdminGreeting();
      fetchAndDisplayRegistrations();
      // After login, fetch slots for today for the admin calendar
      adminSelectedDate = new Date();
      fetchAndShowTeacherSlots().then(showAdminTimeSlots);
    }, 600);
  }
  if (loginForm) {
    loginForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      const email = document.getElementById('admin-email').value.trim().toLowerCase();
      const password = document.getElementById('admin-password').value;
      let errorCode = '';
      try {
        errorCode = 'DB-CONNECT';
        const { data, error } = await supabase
          .from('admins')
          .select('admin_name, admin_email, admin_clearance')
          .eq('admin_email', email)
          .eq('admin_password', password)
          .maybeSingle();
        if (error) {
          errorCode = 'DB-QUERY';
          throw error;
        }
        if (!data) {
          errorCode = 'INVALID-CREDS';
          alert('[LOGIN-FAIL] Invalid admin credentials! [ERR_CODE: ' + errorCode + ']');
          return;
        }
        window.adminUser = {
          name: data.admin_name,
          email: data.admin_email,
          clearance: data.admin_clearance
        };
        await supabase.from('admins').update({ last_login: new Date().toISOString() }).eq('admin_email', email);
        hideOverlay();
      } catch (err) {
        alert(`Database error! [ERR_CODE: ${errorCode}]\n\n${err.name || 'Error'}: ${err.message || err}`);
        console.error(`[ERR_CODE: ${errorCode}]`, err);
      }
    });
  }
  if (devBtn) {
    devBtn.addEventListener('click', function() {
      window.adminUser = {
        name: 'Dev',
        email: 'dev@local',
        clearance: 'root'
      };
      hideOverlay();
    });
  }
  if (logoutBtn) {
    logoutBtn.addEventListener('click', function() {
      window.adminUser = null;
      location.reload();
    });
  }
  updateAdminGreeting();

  // --- REGISTRATIONS TABLE ---
  async function fetchAndDisplayRegistrations() {
    const tbody = document.getElementById('registrations-tbody');
    const emptyMsg = document.getElementById('registrations-empty');
    if (tbody) tbody.innerHTML = '';
    if (emptyMsg) emptyMsg.classList.add('hidden');
    try {
      const { data, error } = await supabase
        .from('registrations')
        .select('id, name, age, email, phone, course, previous_experience, country, timezone, created_at, calendar_date, calendar_time, calendar_link')
        .order('created_at', { ascending: false });
      if (error) throw error;
      if (!data || data.length === 0) {
        if (emptyMsg) emptyMsg.classList.remove('hidden');
        return;
      }
      data.forEach((reg, idx) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td class="px-2 py-2 font-medium text-[#3C2A1E]">${reg.name || ''}</td>
          <td class="px-2 py-2">${reg.age != null ? reg.age : ''}</td>
          <td class="px-2 py-2">${reg.course || ''}</td>
          <td class="px-2 py-2">${reg.calendar_date || ''}</td>
          <td class="px-2 py-2">${reg.calendar_time || ''}</td>
          <td class="px-2 py-2 text-right">
            <button class="text-blue-700 underline font-medium" data-row="${idx}">View More</button>
          </td>
        `;
        tbody.appendChild(tr);

        tr.querySelector('button[data-row]').onclick = () => showDetailsModal(reg);
      });
    } catch (err) {
      if (emptyMsg) emptyMsg.textContent = "Failed to load registrations. Try reloading.";
      if (emptyMsg) emptyMsg.classList.remove('hidden');
      console.error("Registrations fetch error:", err);
    }
  }

  // --- VIEW MORE MODAL ---
  function showDetailsModal(reg) {
    modalContent.innerHTML = `
      <div><span class="font-bold">Name:</span> ${reg.name || ''}</div>
      <div><span class="font-bold">Age:</span> ${reg.age != null ? reg.age : ''}</div>
      <div><span class="font-bold">Email:</span> ${reg.email || ''}</div>
      <div><span class="font-bold">Phone:</span> ${reg.phone || ''}</div>
      <div><span class="font-bold">Course:</span> ${reg.course || ''}</div>
      <div><span class="font-bold">Previous Experience:</span> ${reg.previous_experience || ''}</div>
      <div><span class="font-bold">Country:</span> ${reg.country || ''}</div>
      <div><span class="font-bold">Timezone:</span> ${reg.timezone || ''}</div>
      <div><span class="font-bold">Registered At:</span> ${reg.created_at || ''}</div>
      <div><span class="font-bold">Class Date:</span> ${reg.calendar_date || ''}</div>
      <div><span class="font-bold">Class Time:</span> ${reg.calendar_time || ''}</div>
      <div><span class="font-bold">Calendar Link:</span> ${reg.calendar_link || ''}</div>
    `;
    viewModal.classList.remove('hidden');
  }
  closeModalBtn.onclick = () => viewModal.classList.add('hidden');
  viewModal.onclick = (e) => {
    if (e.target.id === 'view-modal') viewModal.classList.add('hidden');
  };

  // --- EXPORT CSV ---
  if (exportCsvBtn) {
    exportCsvBtn.addEventListener('click', async () => {
      try {
        const { data, error } = await supabase
          .from('registrations')
          .select('name, age, email, phone, course, previous_experience, country, timezone, created_at, calendar_date, calendar_time, calendar_link');
        if (error || !data) throw error || new Error("No data");
        const csv = [
          ['Name', 'Age', 'Email', 'Phone', 'Course', 'Previous Experience', 'Country', 'Timezone', 'Registered At', 'Class Date', 'Class Time', 'Calendar Link'],
          ...data.map(row => [
            row.name, row.age, row.email, row.phone, row.course, row.previous_experience, row.country, row.timezone, row.created_at, row.calendar_date, row.calendar_time, row.calendar_link
          ])
        ].map(row => row.map(x => `"${(x || '').toString().replace(/"/g, '""')}"`).join(",")).join("\n");
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `registrations_${Date.now()}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } catch (e) {
        alert("Export failed. Try again.");
      }
    });
  }

  // === TEACHER SLOT CALENDAR FOR ADMIN ===

  function populateTeacherTz() {
    const teacherSlotTz = document.getElementById('teacher-slot-tz');
    const timezones = [
      "Asia/Kolkata","Asia/Dubai","Asia/Singapore","Asia/Tokyo",
      "Europe/London","Europe/Berlin","Europe/Paris","Europe/Moscow",
      "America/New_York","America/Chicago","America/Denver","America/Los_Angeles",
      "Australia/Sydney"
    ];
    teacherSlotTz.innerHTML = '';
    timezones.forEach(tz=>{
      const o = document.createElement('option');
      o.value=tz;
      o.textContent=tz.replace('_',' ');
      if(tz==='Asia/Kolkata') o.selected=true;
      teacherSlotTz.appendChild(o);
    });
  }
  populateTeacherTz();

  let adminCurrentDate = new Date();
  let adminSelectedDate = new Date();
  let adminTeacherSlots = [];

  function renderAdminCalendar() {
    const calendarDays = document.getElementById('calendar-days');
    const currentMonthYear = document.getElementById('current-month-year');
    calendarDays.innerHTML = '';
    const y = adminCurrentDate.getFullYear();
    const m = adminCurrentDate.getMonth();
    currentMonthYear.textContent = new Date(y,m,1)
      .toLocaleDateString('en-US',{month:'long',year:'numeric'});

    const firstDay = new Date(y,m,1).getDay();
    const daysInMonth = new Date(y,m+1,0).getDate();
    const prevMonthDays = new Date(y,m,0).getDate();

    for(let i=0;i<firstDay;i++){
      const d = prevMonthDays-firstDay+i+1;
      const el = createAdminDayElement(d,true);
      calendarDays.appendChild(el);
    }
    for(let d=1; d<=daysInMonth; d++){
      const el = createAdminDayElement(d,false);
      const today = new Date();
      if(y===today.getFullYear() && m===today.getMonth() && d===today.getDate()){
        el.classList.add('bg-indigo-100','font-semibold');
      }
      if(adminSelectedDate && y===adminSelectedDate.getFullYear() && m===adminSelectedDate.getMonth() && d===adminSelectedDate.getDate()){
        el.classList.add('bg-indigo-600','text-white');
      }
      calendarDays.appendChild(el);
    }
    const total = firstDay+daysInMonth;
    const rem = (7 - total%7)%7;
    for(let i=1;i<=rem;i++){
      const el = createAdminDayElement(i,true);
      calendarDays.appendChild(el);
    }
  }
  function createAdminDayElement(day, isGray){
    const el = document.createElement('div');
    el.className = 'w-10 h-10 flex items-center justify-center text-sm font-medium rounded-full cursor-pointer hover:bg-gray-100';
    if(isGray) el.classList.add('text-gray-400');
    el.textContent = day;
    el.addEventListener('click', async () => {
      if(isGray) return;
      const y = adminCurrentDate.getFullYear();
      const m = adminCurrentDate.getMonth();
      adminSelectedDate = new Date(y,m,day);
      await fetchAndShowTeacherSlots();
      renderAdminCalendar();
      showAdminTimeSlots();
    });
    return el;
  }
  function formatLocalDate(date) {
    return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  }

  async function fetchTeacherSlots(dateStr) {
    let query = supabase.from('teacher_slots').select('*').order('start_time', { ascending: true });
    if (dateStr) query = query.eq('date', dateStr);
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }
  async function createTeacherSlot(payload) {
    const { error } = await supabase.from('teacher_slots').insert([payload]);
    if (error) throw error;
  }
  async function deleteTeacherSlot(id) {
    const { error } = await supabase.from('teacher_slots').delete().eq('id', id);
    if (error) throw error;
  }

  async function fetchAndShowTeacherSlots() {
    if(!adminSelectedDate) return;
    try {
      const dateStr = formatLocalDate(adminSelectedDate);
      adminTeacherSlots = await fetchTeacherSlots(dateStr);
    } catch (e) {
      adminTeacherSlots = [];
      alert("Failed to fetch slots!");
    }
  }
  function showAdminTimeSlots() {
    const selectedDateText = document.getElementById('selected-date-text');
    const grid = document.querySelector('#time-slots > div');
    if (!adminSelectedDate) {
      selectedDateText.textContent = "Select a date";
      grid.innerHTML = '';
      return;
    }
    selectedDateText.textContent = adminSelectedDate
      .toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric',year:'numeric'});
    if (!adminTeacherSlots.length) {
      grid.innerHTML = '<div class="text-gray-500">No slots for this date.</div>';
      document.getElementById('time-slots').classList.add('show');
      return;
    }
    grid.innerHTML = '';
    adminTeacherSlots.forEach(slot => {
      const div = document.createElement('div');
      div.className = 'flex justify-between items-center bg-indigo-100 border border-indigo-300 rounded-md p-3 mb-2';
      div.innerHTML = `
        <span class="font-medium text-gray-800">
          ${slot.start_time} – ${slot.end_time} (${slot.timezone}) <span class="ml-2 text-xs text-gray-500">by ${slot.teacher_name || ''}</span>
        </span>
        <button data-id="${slot.id}" class="text-red-600 hover:text-red-800">Delete</button>
      `;
      div.querySelector('button').onclick = async e => {
        try {
          await deleteTeacherSlot(slot.id);
          adminTeacherSlots = adminTeacherSlots.filter(s=>s.id!==slot.id);
          showAdminTimeSlots();
        } catch(err) {
          alert('Delete failed: '+err.message);
        }
      };
      grid.appendChild(div);
    });
    document.getElementById('time-slots').classList.add('show');
  }

  // Calendar navigation/events
  document.getElementById('prev-month').onclick = () => { 
    adminCurrentDate.setMonth(adminCurrentDate.getMonth()-1); 
    renderAdminCalendar(); 
  };
  document.getElementById('next-month').onclick = () => { 
    adminCurrentDate.setMonth(adminCurrentDate.getMonth()+1); 
    renderAdminCalendar(); 
  };
  document.getElementById('add-teacher-slot-btn').onclick = () => {
    document.getElementById('teacher-slot-modal').classList.remove('hidden');
    document.getElementById('teacher-name').value = '';
    document.getElementById('teacher-slot-date').value = '';
    document.getElementById('teacher-slot-start').value = '';
    document.getElementById('teacher-slot-end').value = '';
  };
  document.getElementById('teacher-slot-cancel').onclick = () => {
    document.getElementById('teacher-slot-modal').classList.add('hidden');
  };
  document.getElementById('teacher-slot-save').onclick = async () => {
    const name = document.getElementById('teacher-name').value.trim();
    const date = document.getElementById('teacher-slot-date').value;
    const start = document.getElementById('teacher-slot-start').value;
    const end = document.getElementById('teacher-slot-end').value;
    const tz = document.getElementById('teacher-slot-tz').value;
    if(!name || !date || !start || !end) {
      alert('All fields required');
      return;
    }
    try {
      await createTeacherSlot({ teacher_name: name, date, start_time: start, end_time: end, timezone: tz });
      document.getElementById('teacher-slot-modal').classList.add('hidden');
      await fetchAndShowTeacherSlots();
      showAdminTimeSlots();
    } catch(e) {
      alert('Save failed: ' + e.message);
    }
  };

  // Initial render
  renderAdminCalendar();
  fetchAndShowTeacherSlots().then(showAdminTimeSlots);

});
