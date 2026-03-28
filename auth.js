// ── auth.js — All For The Pet · Supabase Auth ──────────────────────────────────

const SUPABASE_URL = 'https://bixnbbwpfggjmvxkxxcm.supabase.co';
const SUPABASE_KEY = 'sb_publishable_t-NlTtMEbX617Zcqi4Gnag_ca6FqfQa';

const _sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// ── Inject shared styles ────────────────────────────────────────────────────────
const _css = `
  .sidebar-user-panel {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 14px 18px 12px;
    border-top: 1px solid rgba(255,255,255,0.07);
    margin-top: 4px;
  }
  .sidebar-user-avatar {
    width: 34px; height: 34px;
    border-radius: 50%;
    background: rgba(232,84,30,0.12);
    border: 1px solid rgba(232,84,30,0.3);
    display: flex; align-items: center; justify-content: center;
    font-size: 16px; flex-shrink: 0;
    color: #e8541e;
  }
  .sidebar-user-text { min-width: 0; }
  .sidebar-user-name {
    font-size: 13px; font-weight: 500; color: #f5f2eb;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  .sidebar-user-email {
    font-size: 11px; color: #555;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    margin-top: 1px;
  }

  /* Dog Profile Modal */
  .dp-overlay {
    position: fixed; inset: 0;
    background: rgba(0,0,0,0.78);
    z-index: 2000;
    display: none;
    align-items: center;
    justify-content: center;
    padding: 20px;
  }
  .dp-overlay.open { display: flex; animation: dpFadeIn 0.2s ease; }
  @keyframes dpFadeIn { from { opacity: 0; } to { opacity: 1; } }
  .dp-card {
    background: #111111;
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 20px;
    padding: 36px;
    width: 100%;
    max-width: 480px;
    position: relative;
    animation: dpSlideUp 0.2s ease;
  }
  @keyframes dpSlideUp { from { transform: translateY(16px); opacity:0; } to { transform:translateY(0); opacity:1; } }
  .dp-close {
    position: absolute; top: 18px; right: 18px;
    background: rgba(255,255,255,0.06); border: none;
    color: #7a7670; width: 30px; height: 30px;
    border-radius: 50%; font-size: 14px; cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    transition: background 0.15s, color 0.15s;
  }
  .dp-close:hover { background: rgba(255,255,255,0.12); color: #f5f2eb; }
  .dp-title {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 26px; letter-spacing: 2px;
    margin-bottom: 4px; color: #f5f2eb;
  }
  .dp-subtitle { font-size: 13px; color: #7a7670; margin-bottom: 24px; }
  .dp-section-label {
    font-size: 10px; font-weight: 500; letter-spacing: 2px;
    text-transform: uppercase; color: #444;
    margin: 20px 0 10px;
  }
  .dp-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  .dp-field { display: flex; flex-direction: column; gap: 5px; margin-bottom: 10px; }
  .dp-label { font-size: 12px; color: #7a7670; }
  .dp-input {
    background: #1a1a1a;
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 8px; padding: 10px 14px;
    font-family: 'DM Sans', sans-serif; font-size: 14px;
    color: #f5f2eb; outline: none; width: 100%;
    transition: border-color 0.2s;
  }
  .dp-input:focus { border-color: rgba(232,84,30,0.5); }
  .dp-error {
    font-size: 13px; color: #f87171;
    background: rgba(248,113,113,0.08);
    border: 1px solid rgba(248,113,113,0.2);
    border-radius: 8px; padding: 10px 14px;
    margin-bottom: 12px; display: none;
  }
  .dp-success {
    font-size: 13px; color: #4ade80;
    background: rgba(74,222,128,0.08);
    border: 1px solid rgba(74,222,128,0.2);
    border-radius: 8px; padding: 10px 14px;
    margin-bottom: 12px; display: none;
  }
  .dp-btn-row { display: flex; gap: 10px; margin-top: 20px; }
  .dp-btn-save {
    flex: 1; background: #e8541e; color: #f5f2eb; border: none;
    border-radius: 10px; padding: 13px;
    font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 500;
    cursor: pointer; transition: background 0.2s;
  }
  .dp-btn-save:hover:not(:disabled) { background: #f07344; }
  .dp-btn-save:disabled { opacity: 0.5; cursor: not-allowed; }
  .dp-btn-cancel {
    background: #1a1a1a; color: #7a7670;
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 10px; padding: 13px 20px;
    font-family: 'DM Sans', sans-serif; font-size: 14px; cursor: pointer;
    transition: background 0.15s, color 0.15s;
  }
  .dp-btn-cancel:hover { background: #222; color: #f5f2eb; }
`;
(function() {
  const s = document.createElement('style');
  s.textContent = _css;
  document.head.appendChild(s);
})();

// ── Inject Dog Profile Modal HTML ───────────────────────────────────────────────
const _MODAL_HTML = `
<div class="dp-overlay" id="dogProfileModal" onclick="if(event.target===this)closeDogProfile()">
  <div class="dp-card">
    <button class="dp-close" onclick="closeDogProfile()">✕</button>
    <div class="dp-title">YOUR PROFILE</div>
    <div class="dp-subtitle">Manage your account and your dog's information</div>

    <div class="dp-section-label">Account</div>
    <div class="dp-field">
      <label class="dp-label">Your Name</label>
      <input class="dp-input" id="dpFullName" type="text" placeholder="e.g. Jane Smith" autocomplete="name">
    </div>

    <div class="dp-section-label">Dog's Profile</div>
    <div class="dp-field">
      <label class="dp-label">Dog's Name</label>
      <input class="dp-input" id="dpDogName" type="text" placeholder="e.g. Max">
    </div>
    <div class="dp-row">
      <div class="dp-field">
        <label class="dp-label">Breed</label>
        <input class="dp-input" id="dpDogBreed" type="text" placeholder="e.g. Golden Retriever">
      </div>
      <div class="dp-field">
        <label class="dp-label">Age (years)</label>
        <input class="dp-input" id="dpDogAge" type="number" placeholder="e.g. 3" min="0" max="30">
      </div>
    </div>
    <div class="dp-field">
      <label class="dp-label">Weight (kg)</label>
      <input class="dp-input" id="dpDogWeight" type="number" placeholder="e.g. 28.5" min="0" max="200" step="0.1">
    </div>

    <div class="dp-error"   id="dpError"></div>
    <div class="dp-success" id="dpSuccess">✓ Profile saved successfully!</div>
    <div class="dp-btn-row">
      <button class="dp-btn-cancel" onclick="closeDogProfile()">Cancel</button>
      <button class="dp-btn-save"   id="dpSaveBtn" onclick="saveDogProfile()">Save Profile</button>
    </div>
  </div>
</div>
`;
document.addEventListener('DOMContentLoaded', () => {
  document.body.insertAdjacentHTML('beforeend', _MODAL_HTML);
});

// ── Auth Functions ──────────────────────────────────────────────────────────────

async function initAuth() {
  const { data: { session } } = await _sb.auth.getSession();
  if (!session) {
    window.location.href = 'login.html';
    return null;
  }
  _updateSidebarUser(session.user);
  return session.user;
}

function _updateSidebarUser(user) {
  const meta    = user.user_metadata || {};
  const name    = meta.full_name || user.email?.split('@')[0] || 'User';
  const dogName = meta.dog_name  || 'Your Dog';

  const nameEl  = document.getElementById('sidebarUserName');
  const emailEl = document.getElementById('sidebarUserEmail');
  if (nameEl)  nameEl.textContent  = name;
  if (emailEl) emailEl.textContent = user.email || '';

  // Dynamic dog name placeholders
  document.querySelectorAll('#topDogName, .dog-name-display').forEach(el => {
    el.textContent = dogName;
  });
}

function signOut() {
  _sb.auth.signOut().then(() => {
    window.location.href = 'login.html';
  });
}

// ── Dog Profile Modal ───────────────────────────────────────────────────────────

function openDogProfile() {
  _loadDogProfileForm();
  document.getElementById('dpError').style.display   = 'none';
  document.getElementById('dpSuccess').style.display = 'none';
  document.getElementById('dogProfileModal').classList.add('open');
}

function closeDogProfile() {
  document.getElementById('dogProfileModal').classList.remove('open');
}

async function _loadDogProfileForm() {
  const { data: { user } } = await _sb.auth.getUser();
  const meta = user?.user_metadata || {};
  document.getElementById('dpFullName').value  = meta.full_name  || '';
  document.getElementById('dpDogName').value   = meta.dog_name   || '';
  document.getElementById('dpDogBreed').value  = meta.dog_breed  || '';
  document.getElementById('dpDogAge').value    = meta.dog_age    || '';
  document.getElementById('dpDogWeight').value = meta.dog_weight || '';
}

async function saveDogProfile() {
  const profile = {
    full_name:  document.getElementById('dpFullName').value.trim(),
    dog_name:   document.getElementById('dpDogName').value.trim(),
    dog_breed:  document.getElementById('dpDogBreed').value.trim(),
    dog_age:    document.getElementById('dpDogAge').value.trim(),
    dog_weight: document.getElementById('dpDogWeight').value.trim(),
  };

  const btn = document.getElementById('dpSaveBtn');
  btn.disabled    = true;
  btn.textContent = 'Saving...';
  document.getElementById('dpError').style.display   = 'none';
  document.getElementById('dpSuccess').style.display = 'none';

  const { error } = await _sb.auth.updateUser({ data: profile });

  btn.disabled    = false;
  btn.textContent = 'Save Profile';

  if (error) {
    const el = document.getElementById('dpError');
    el.textContent  = error.message;
    el.style.display = 'block';
    return;
  }

  document.getElementById('dpSuccess').style.display = 'block';
  const { data: { user } } = await _sb.auth.getUser();
  _updateSidebarUser(user);

  setTimeout(closeDogProfile, 1200);
}
