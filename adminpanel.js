// --- SUPABASE CONFIG ---
const supabaseUrl = 'https://xzydohefpyxsputkzawf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh6eWRvaGVmcHl4c3B1dGt6YXdmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzMTg1MTgsImV4cCI6MjA2OTg5NDUxOH0.iVwoNDL23MytEJGdAwM4UJGnozrDxhJ3qD1Vcjq1UUM';
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

// --- LOGIN OVERLAY LOGIC ---
const loginOverlay = document.getElementById('login-overlay');
const loginForm = document.getElementById('login-form');
const devBtn = document.getElementById('dev-bypass');
const adminGreeting = document.getElementById('admin-greeting');
const logoutBtn = document.getElementById('logout-btn');

window.adminUser = null;

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
      errorCode = 'DB-UPDATE-LASTLOGIN';
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

document.addEventListener('DOMContentLoaded', () => {
  updateAdminGreeting();
});

// --- REGISTRATIONS TABLE DYNAMIC LOGIC ---

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

      // View More button logic
      tr.querySelector('button[data-row]').onclick = () => showDetailsModal(reg);
    });
  } catch (err) {
    if (emptyMsg) emptyMsg.textContent = "Failed to load registrations. Try reloading.";
    if (emptyMsg) emptyMsg.classList.remove('hidden');
    console.error("Registrations fetch error:", err);
  }
}

// --- VIEW MORE MODAL LOGIC ---

function showDetailsModal(reg) {
  const modal = document.getElementById('view-modal');
  const content = document.getElementById('modal-content');
  content.innerHTML = `
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
  modal.classList.remove('hidden');
}

document.getElementById('close-modal').onclick = () => {
  document.getElementById('view-modal').classList.add('hidden');
};
document.getElementById('view-modal').onclick = (e) => {
  if (e.target.id === 'view-modal') document.getElementById('view-modal').classList.add('hidden');
};

// --- EXPORT CSV ---

document.getElementById('export-csv').addEventListener('click', async () => {
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
