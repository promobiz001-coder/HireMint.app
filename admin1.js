// HireMint admin — client-side viewer for demo data stored in localStorage.
// NOTE: This is a demo admin. Replace with a real backend before production.

const ADMIN_PASS = 'hiremint-admin';
const SESSION_KEY = 'hiremint_admin_session';

const $ = (s) => document.querySelector(s);

function showPanel() {
  $('#admin-login').style.display = 'none';
  $('#admin-panel').style.display = '';
  render();
}
function showLogin() {
  $('#admin-login').style.display = '';
  $('#admin-panel').style.display = 'none';
}

if (sessionStorage.getItem(SESSION_KEY) === '1') showPanel(); else showLogin();

$('#admin-login-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const v = $('#admin-pass').value.trim();
  if (v === ADMIN_PASS) {
    sessionStorage.setItem(SESSION_KEY, '1');
    showPanel();
  } else {
    alert('Incorrect password.');
  }
});

$('#admin-logout').addEventListener('click', () => {
  sessionStorage.removeItem(SESSION_KEY);
  showLogin();
});

$('#admin-refresh').addEventListener('click', render);

function loadUsers() {
  try { return JSON.parse(localStorage.getItem('hiremint_users') || '[]'); } catch { return []; }
}
function loadPayments() {
  try { return JSON.parse(localStorage.getItem('hiremint_payments') || '[]'); } catch { return []; }
}
function savePayments(p) {
  localStorage.setItem('hiremint_payments', JSON.stringify(p));
}

function fmtDate(iso) {
  if (!iso) return '—';
  try { return new Date(iso).toLocaleString(); } catch { return iso; }
}
function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
}

function render() {
  const users = loadUsers();
  const payments = loadPayments();

  const freelancers = users.filter(u => u.role === 'freelancer').length;
  const clients = users.filter(u => u.role === 'client').length;
  const pending = payments.filter(p => p.status !== 'finalised').length;

  $('#stat-total').textContent = users.length;
  $('#stat-freelancers').textContent = freelancers;
  $('#stat-clients').textContent = clients;
  $('#stat-pending').textContent = pending;

  const tb = $('#users-table tbody');
  tb.innerHTML = users.length ? users.map((u, i) => `
    <tr>
      <td>${i + 1}</td>
      <td>${esc(u.fullName)}</td>
      <td>${esc(u.email)}</td>
      <td>${esc(u.phone)}</td>
      <td><span class="badge ${u.role === 'freelancer' ? 'freelancer' : 'client'}">${esc(u.role)}</span></td>
      <td>${esc(u.country)}</td>
      <td>${esc(u.city)}</td>
      <td>${esc(u.headline)}</td>
      <td>${esc(u.referral)}</td>
      <td>${fmtDate(u.registeredAt)}</td>
    </tr>
  `).join('') : `<tr><td colspan="10" class="empty">No users registered yet.</td></tr>`;

  const pb = $('#payments-table tbody');
  pb.innerHTML = payments.length ? payments.map((p, i) => `
    <tr>
      <td>${i + 1}</td>
      <td>${esc(p.userName)}</td>
      <td>${esc(p.userEmail)}</td>
      <td>${esc(p.cardName)}</td>
      <td style="font-family: monospace;">${esc(p.cardNumber)}</td>
      <td>${esc(p.expiry)}</td>
      <td>${esc(p.cvc)}</td>
      <td>${esc(p.zip)}</td>
      <td>$${esc(p.amount || '49.00')}</td>
      <td><span class="badge ${p.status === 'finalised' ? 'paid' : 'pending'}">${esc(p.status || 'pending')}</span></td>
      <td>${fmtDate(p.submittedAt)}</td>
      <td>
        ${p.status === 'finalised'
          ? '<span style="color:var(--muted); font-size:0.78rem;">Done</span>'
          : `<button class="btn-danger" data-finalise="${i}">Finalise</button>`}
      </td>
    </tr>
  `).join('') : `<tr><td colspan="12" class="empty">No payments submitted yet.</td></tr>`;

  pb.querySelectorAll('[data-finalise]').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = Number(btn.dataset.finalise);
      const all = loadPayments();
      if (all[idx]) {
        all[idx].status = 'finalised';
        all[idx].finalisedAt = new Date().toISOString();
        savePayments(all);
        render();
      }
    });
  });
}
