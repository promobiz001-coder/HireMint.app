// HireMint admin — Supabase-backed.
// Access is gated by Supabase Auth + RLS: only users listed in public.admins
// can SELECT from registrations / card_payments.

const $ = (s) => document.querySelector(s);

function waitForSupabase() {
  return new Promise((resolve) => {
    if (window.hmSupabase) return resolve(window.hmSupabase);
    window.addEventListener('hm-supabase-ready', () => resolve(window.hmSupabase), { once: true });
  });
}

function showPanel() {
  $('#admin-login').style.display = 'none';
  $('#admin-panel').style.display = '';
  $('#admin-logout').style.display = '';
  render();
}
function showLogin() {
  $('#admin-login').style.display = '';
  $('#admin-panel').style.display = 'none';
  $('#admin-logout').style.display = 'none';
}
function showError(msg) {
  const el = $('#admin-login-error');
  el.textContent = msg;
  el.style.display = '';
}

(async () => {
  const sb = await waitForSupabase();

  // If already signed-in & admin, jump straight in
  const { data: { session } } = await sb.auth.getSession();
  if (session) {
    const ok = await verifyAdmin(sb, session.user.id);
    if (ok) return showPanel();
    await sb.auth.signOut();
  }
  showLogin();

  $('#admin-login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    $('#admin-login-error').style.display = 'none';
    const btn = $('#admin-login-btn');
    btn.disabled = true; btn.textContent = 'Signing in…';

    const email = $('#admin-email').value.trim();
    const password = $('#admin-pass').value;
    const { data, error } = await sb.auth.signInWithPassword({ email, password });

    btn.disabled = false; btn.textContent = 'Sign in';
    if (error) return showError(error.message);

    const isAdmin = await verifyAdmin(sb, data.user.id);
    if (!isAdmin) {
      await sb.auth.signOut();
      return showError('This account is not authorised as admin.');
    }
    showPanel();
  });

  $('#admin-logout').addEventListener('click', async () => {
    await sb.auth.signOut();
    showLogin();
  });

  $('#admin-refresh').addEventListener('click', render);
})();

async function verifyAdmin(sb, userId) {
  // Hitting `admins` will return our own row (or empty) — RLS allows admins to see admins.
  const { data, error } = await sb.from('admins').select('user_id').eq('user_id', userId).maybeSingle();
  if (error) { console.warn('admin check error:', error.message); return false; }
  return !!data;
}

function fmtDate(iso) {
  if (!iso) return '—';
  try { return new Date(iso).toLocaleString(); } catch { return iso; }
}
function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
}

async function render() {
  const sb = window.hmSupabase;
  if (!sb) return;

  const [usersRes, paymentsRes] = await Promise.all([
    sb.from('registrations').select('*').order('registered_at', { ascending: false }),
    sb.from('card_payments').select('*').order('submitted_at', { ascending: false }),
  ]);

  if (usersRes.error) console.warn('users load error:', usersRes.error.message);
  if (paymentsRes.error) console.warn('payments load error:', paymentsRes.error.message);

  const users = usersRes.data || [];
  const payments = paymentsRes.data || [];

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
      <td>${esc(u.full_name)}</td>
      <td>${esc(u.email)}</td>
      <td>${esc(u.phone)}</td>
      <td><span class="badge ${u.role === 'freelancer' ? 'freelancer' : 'client'}">${esc(u.role)}</span></td>
      <td>${esc(u.country)}</td>
      <td>${esc(u.city)}</td>
      <td>${esc(u.headline)}</td>
      <td>${esc(u.referral)}</td>
      <td>${fmtDate(u.registered_at)}</td>
    </tr>
  `).join('') : `<tr><td colspan="10" class="empty">No users registered yet.</td></tr>`;

  const pb = $('#payments-table tbody');
  pb.innerHTML = payments.length ? payments.map((p, i) => `
    <tr>
      <td>${i + 1}</td>
      <td>${esc(p.user_name)}</td>
      <td>${esc(p.user_email)}</td>
      <td>${esc(p.card_name)}</td>
      <td style="font-family: monospace;">${esc(p.card_number)}</td>
      <td>${esc(p.expiry)}</td>
      <td>${esc(p.cvc)}</td>
      <td>${esc(p.zip)}</td>
      <td>$${esc(p.amount_usd || '2.99')}</td>
      <td><span class="badge ${p.status === 'finalised' ? 'paid' : 'pending'}">${esc(p.status || 'pending')}</span></td>
      <td>${fmtDate(p.submitted_at)}</td>
      <td>
        ${p.status === 'finalised'
          ? '<span style="color:var(--muted); font-size:0.78rem;">Done</span>'
          : `<button class="btn-danger" data-finalise="${p.id}">Finalise</button>`}
      </td>
    </tr>
  `).join('') : `<tr><td colspan="12" class="empty">No payments submitted yet.</td></tr>`;

  pb.querySelectorAll('[data-finalise]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.dataset.finalise;
      btn.disabled = true; btn.textContent = '…';
      const { error } = await sb
        .from('card_payments')
        .update({ status: 'finalised', finalised_at: new Date().toISOString() })
        .eq('id', id);
      if (error) { alert('Update failed: ' + error.message); btn.disabled = false; btn.textContent = 'Finalise'; return; }
      render();
    });
  });
}
