// ── All For The Pet — PWA: Service Worker + Install Prompt ───────────────────

// ── Register Service Worker ───────────────────────────────────────────────────
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js')
      .catch(err => console.warn('[SW] Registration failed:', err));
  });
}

// ── Install banner ────────────────────────────────────────────────────────────
let _installPrompt = null;

// Inject banner HTML once DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  // Don't show if already running as standalone PWA
  if (window.matchMedia('(display-mode: standalone)').matches) return;
  // Don't show if user already dismissed this session
  if (sessionStorage.getItem('pwa-dismissed')) return;

  const banner = document.createElement('div');
  banner.id = 'pwa-banner';
  banner.innerHTML = `
    <style>
      #pwa-banner {
        display: none;
        position: fixed;
        bottom: 76px;
        left: 12px;
        right: 12px;
        background: #111111;
        border: 1px solid rgba(232,84,30,0.45);
        border-radius: 16px;
        padding: 14px 16px;
        z-index: 9999;
        align-items: center;
        gap: 12px;
        box-shadow: 0 8px 32px rgba(0,0,0,0.55);
        animation: pwaSlideUp 0.3s ease;
        font-family: 'DM Sans', sans-serif;
      }
      @keyframes pwaSlideUp {
        from { transform: translateY(20px); opacity: 0; }
        to   { transform: translateY(0);    opacity: 1; }
      }
      #pwa-banner .pwa-icon { font-size: 30px; flex-shrink: 0; }
      #pwa-banner .pwa-text { flex: 1; }
      #pwa-banner .pwa-title {
        font-size: 14px; font-weight: 500; color: #f5f2eb; margin-bottom: 2px;
      }
      #pwa-banner .pwa-sub { font-size: 12px; color: #7a7670; }
      #pwa-banner .pwa-install {
        background: #e8541e; color: #fff; border: none;
        border-radius: 8px; padding: 8px 16px;
        font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 500;
        cursor: pointer; white-space: nowrap; flex-shrink: 0;
        transition: background 0.2s;
      }
      #pwa-banner .pwa-install:hover { background: #f07344; }
      #pwa-banner .pwa-close {
        background: none; border: none; color: #555;
        font-size: 18px; cursor: pointer; padding: 4px; line-height: 1;
        flex-shrink: 0;
      }
      @media (min-width: 769px) {
        #pwa-banner {
          left: auto; right: 24px;
          bottom: 24px;
          max-width: 360px;
        }
      }
    </style>
    <div class="pwa-icon">🐾</div>
    <div class="pwa-text">
      <div class="pwa-title">Add to Home Screen</div>
      <div class="pwa-sub">Use All For The Pet like an app</div>
    </div>
    <button class="pwa-install" id="pwa-install-btn">Install</button>
    <button class="pwa-close" id="pwa-close-btn" aria-label="Dismiss">✕</button>
  `;
  document.body.appendChild(banner);

  document.getElementById('pwa-install-btn').addEventListener('click', () => {
    if (_installPrompt) {
      _installPrompt.prompt();
      _installPrompt.userChoice.then(() => { _installPrompt = null; });
    }
    _hideBanner();
  });

  document.getElementById('pwa-close-btn').addEventListener('click', () => {
    _hideBanner();
    sessionStorage.setItem('pwa-dismissed', '1');
  });
});

function _hideBanner() {
  const b = document.getElementById('pwa-banner');
  if (b) b.style.display = 'none';
}

function _showBanner() {
  const b = document.getElementById('pwa-banner');
  if (b && !sessionStorage.getItem('pwa-dismissed')) b.style.display = 'flex';
}

// Listen for the browser's install prompt event
window.addEventListener('beforeinstallprompt', e => {
  e.preventDefault();
  _installPrompt = e;
  _showBanner();
});

// Hide banner once installed
window.addEventListener('appinstalled', () => {
  _hideBanner();
  _installPrompt = null;
});
