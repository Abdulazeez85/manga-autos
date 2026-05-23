/* ============================================================
   MANGA AUTOS — CORE JAVASCRIPT
   ============================================================ */

// ===================== CONFIG =====================
const CONFIG = {
  API_BASE: '/api',
  WHATSAPP_NUMBER: '+2348012345678',
  WHATSAPP_MESSAGE: 'Hello Manga Autos! I am interested in one of your vehicles.',
  CURRENCY: 'NGN',
  CURRENCY_SYMBOL: '₦',
};

// ===================== API LAYER =====================
const API = {
  async get(endpoint, params = {}) {
    const url = new URL(`${CONFIG.API_BASE}${endpoint}`, window.location.origin);
    Object.entries(params).forEach(([k, v]) => {
      if (Array.isArray(v)) {
        v.filter(item => item !== undefined && item !== null && item !== '').forEach(item => url.searchParams.append(k, item));
      } else if (v !== undefined && v !== null && v !== '') {
        url.searchParams.append(k, v);
      }
    });
    const res = await fetch(url);
    if (!res.ok) throw new Error(`API Error: ${res.status}`);
    return res.json();
  },

  async post(endpoint, data = {}) {
    const res = await fetch(`${CONFIG.API_BASE}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`API Error: ${res.status}`);
    return res.json();
  },
};

// ===================== UTILS =====================
const Utils = {
  formatPrice(price) {
    if (price >= 1000000) {
      return `${CONFIG.CURRENCY_SYMBOL}${(price / 1000000).toFixed(1)}M`;
    }
    return `${CONFIG.CURRENCY_SYMBOL}${price.toLocaleString()}`;
  },

  formatPriceFull(price) {
    return `${CONFIG.CURRENCY_SYMBOL}${price.toLocaleString()}`;
  },

  formatMileage(miles) {
    return `${miles.toLocaleString()} km`;
  },

  debounce(fn, delay = 300) {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), delay);
    };
  },

  getInitials(name) {
    return name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();
  },

  getWhatsAppLink(message) {
    return `https://wa.me/${CONFIG.WHATSAPP_NUMBER.replace('+', '')}?text=${encodeURIComponent(message)}`;
  },

  animateCounter(el, target, duration = 2000) {
    const start = 0;
    const step = target / (duration / 16);
    let current = start;
    const timer = setInterval(() => {
      current = Math.min(current + step, target);
      el.textContent = Math.floor(current).toLocaleString() + (el.dataset.suffix || '');
      if (current >= target) clearInterval(timer);
    }, 16);
  },
};

// ===================== THEME =====================
const Theme = {
  key: 'manga-theme',

  init() {
    const saved = localStorage.getItem(this.key) || 'dark';
    this.apply(saved);
    const btn = document.getElementById('themeToggle');
    if (btn) btn.addEventListener('click', () => this.toggle());
  },

  apply(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(this.key, theme);
    const icon = document.querySelector('#themeToggle svg, #themeToggle i');
    if (icon) {
      icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }
  },

  toggle() {
    const current = document.documentElement.getAttribute('data-theme');
    this.apply(current === 'dark' ? 'light' : 'dark');
  },
};

// ===================== WISHLIST =====================
const Wishlist = {
  key: 'manga-wishlist',

  get() {
    return JSON.parse(localStorage.getItem(this.key) || '[]');
  },

  save(list) {
    localStorage.setItem(this.key, JSON.stringify(list));
    this.updateUI();
  },

  toggle(vehicleId) {
    const list = this.get();
    const idx = list.indexOf(vehicleId);
    if (idx === -1) {
      list.push(vehicleId);
      Toast.show('Added to wishlist ♥', 'success');
    } else {
      list.splice(idx, 1);
      Toast.show('Removed from wishlist', 'success');
    }
    this.save(list);
    return idx === -1;
  },

  has(vehicleId) {
    return this.get().includes(vehicleId);
  },

  updateUI() {
    const count = this.get().length;
    const badge = document.querySelector('.wishlist-count');
    if (badge) {
      badge.style.display = count > 0 ? 'flex' : 'none';
      badge.textContent = count;
    }
  },
};

// ===================== COMPARISON =====================
const Comparison = {
  key: 'manga-compare',
  max: 3,

  get() {
    return JSON.parse(localStorage.getItem(this.key) || '[]');
  },

  save(list) {
    localStorage.setItem(this.key, JSON.stringify(list));
  },

  add(vehicleId) {
    const list = this.get();
    if (list.includes(vehicleId)) return false;
    if (list.length >= this.max) {
      Toast.show(`Max ${this.max} vehicles for comparison`, 'error');
      return false;
    }
    list.push(vehicleId);
    this.save(list);
    Toast.show('Added to comparison', 'success');
    return true;
  },

  remove(vehicleId) {
    const list = this.get().filter(id => id !== vehicleId);
    this.save(list);
  },

  clear() {
    this.save([]);
  },
};

// ===================== TOAST =====================
const Toast = {
  container: null,

  init() {
    this.container = document.getElementById('toastContainer');
    if (!this.container) {
      this.container = document.createElement('div');
      this.container.className = 'toast-container';
      this.container.id = 'toastContainer';
      document.body.appendChild(this.container);
    }
  },

  show(message, type = 'success', duration = 3000) {
    if (!this.container) this.init();
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    const icon = type === 'success' ? '✓' : '✕';
    toast.innerHTML = `<span class="toast-icon">${icon}</span><span>${message}</span>`;
    this.container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = '0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, duration);
  },
};

// ===================== NAVBAR =====================
const Navbar = {
  init() {
    const navbar = document.querySelector('.navbar');
    if (!navbar) return;

    window.addEventListener('scroll', () => {
      if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
        navbar.classList.remove('hero-visible');
      } else {
        navbar.classList.remove('scrolled');
      }
    });

    // Mobile menu
    const menuBtn = document.querySelector('.mobile-menu-btn');
    const mobileMenu = document.querySelector('.mobile-menu');
    if (menuBtn && mobileMenu) {
      menuBtn.addEventListener('click', () => {
        mobileMenu.classList.toggle('open');
        document.body.style.overflow = mobileMenu.classList.contains('open') ? 'hidden' : '';
      });
    }

    // Active link
    const path = window.location.pathname;
    document.querySelectorAll('.nav-link, .mobile-nav-link').forEach(link => {
      if (link.getAttribute('href') === path || (path === '/' && link.getAttribute('href') === '/')) {
        link.classList.add('active');
      }
    });
  },
};

// ===================== SCROLL REVEAL =====================
const ScrollReveal = {
  observer: null,

  init() {
    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry, i) => {
          if (entry.isIntersecting) {
            setTimeout(() => {
              entry.target.classList.add('visible');
            }, i * 80);
            this.observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );

    document.querySelectorAll('.reveal').forEach(el => this.observer.observe(el));
  },
};

// ===================== COUNTER ANIMATION =====================
const Counters = {
  init() {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const target = parseInt(el.dataset.target || el.textContent.replace(/\D/g, ''));
          Utils.animateCounter(el, target);
          observer.unobserve(el);
        }
      });
    }, { threshold: 0.5 });

    document.querySelectorAll('[data-counter]').forEach(el => observer.observe(el));
  },
};

// ===================== PAGE LOADER =====================
const PageLoader = {
  init() {
    const loader = document.getElementById('pageLoader');
    if (!loader) return;
    window.addEventListener('load', () => {
      setTimeout(() => loader.classList.add('hidden'), 500);
    });
  },
};

// ===================== CALCULATOR =====================
const Calculator = {
  init() {
    const calc = document.getElementById('loanCalculator');
    if (!calc) return;

    const inputs = calc.querySelectorAll('input[type="range"], input[type="number"]');
    inputs.forEach(input => {
      input.addEventListener('input', () => this.calculate());
    });
    this.calculate();
  },

  calculate() {
    const price = parseFloat(document.getElementById('calcPrice')?.value || 0);
    const down = parseFloat(document.getElementById('calcDown')?.value || 0);
    const rate = parseFloat(document.getElementById('calcRate')?.value || 15) / 100 / 12;
    const months = parseInt(document.getElementById('calcMonths')?.value || 48);

    const principal = price - down;
    let monthly = 0;

    if (rate > 0 && principal > 0) {
      monthly = principal * rate * Math.pow(1 + rate, months) / (Math.pow(1 + rate, months) - 1);
    } else if (principal > 0) {
      monthly = principal / months;
    }

    const totalPayable = monthly * months;
    const totalInterest = totalPayable - principal;

    const monthlyEl = document.getElementById('calcMonthly');
    const totalEl = document.getElementById('calcTotal');
    const interestEl = document.getElementById('calcInterest');

    if (monthlyEl) monthlyEl.textContent = Utils.formatPrice(monthly);
    if (totalEl) totalEl.textContent = Utils.formatPrice(totalPayable);
    if (interestEl) interestEl.textContent = Utils.formatPrice(totalInterest);

    // Update range displays
    ['calcRate', 'calcMonths', 'calcDown'].forEach(id => {
      const el = document.getElementById(id);
      const display = document.getElementById(id + 'Display');
      if (el && display) {
        if (id === 'calcRate') display.textContent = `${el.value}%`;
        else if (id === 'calcMonths') display.textContent = `${el.value} mo`;
        else display.textContent = Utils.formatPrice(parseFloat(el.value));
      }
    });
  },
};

// ===================== VEHICLE CARD TEMPLATE =====================
function createVehicleCard(vehicle) {
  const isWishlisted = Wishlist.has(vehicle.id);
  const price = Utils.formatPrice(vehicle.price);

  return `
    <article class="car-card reveal" data-id="${vehicle.id}">
      <div class="car-card-image">
        <div class="car-img-placeholder">
          <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M8 40h48M14 40l6-16h24l6 16" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
            <circle cx="20" cy="44" r="4" stroke="currentColor" stroke-width="2"/>
            <circle cx="44" cy="44" r="4" stroke="currentColor" stroke-width="2"/>
            <path d="M24 28h16M20 28l4-8h16l4 8" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>
          </svg>
          <span>${vehicle.brand}</span>
        </div>
        <div class="car-card-overlay"></div>
        <div class="car-badge">
          ${vehicle.featured ? '<span class="badge badge-gold">✦ Featured</span>' : ''}
          ${vehicle.condition === 'Brand New' ? '<span class="badge badge-new">New</span>' : ''}
        </div>
        <div class="car-card-actions">
          <button class="card-action-btn wishlist-toggle ${isWishlisted ? 'active' : ''}"
            onclick="event.preventDefault(); Wishlist.toggle('${vehicle.id}'); this.classList.toggle('active')"
            title="Add to wishlist">
            ${isWishlisted ? '♥' : '♡'}
          </button>
          <button class="card-action-btn"
            onclick="event.preventDefault(); Comparison.add('${vehicle.id}')"
            title="Compare">⇔</button>
        </div>
      </div>
      <div class="car-card-body">
        <div class="car-card-meta">
          <span class="car-card-brand">${vehicle.brand}</span>
          <span class="car-card-year">${vehicle.year}</span>
        </div>
        <h3 class="car-card-name">${vehicle.model}</h3>
        <div class="car-card-specs">
          <span class="car-spec">⚙ ${vehicle.transmission}</span>
          <span class="car-spec">⛽ ${vehicle.fuelType}</span>
          <span class="car-spec">📍 ${vehicle.mileage.toLocaleString()} km</span>
        </div>
        <div class="car-card-footer">
          <div class="car-price">
            <span class="car-price-currency">Starting from</span>
            <span class="car-price-amount">${price}</span>
          </div>
          <a href="/details?id=${vehicle.id}" class="car-cta">View Details →</a>
        </div>
      </div>
    </article>
  `;
}

// ===================== INIT =====================
document.addEventListener('DOMContentLoaded', () => {
  PageLoader.init();
  Theme.init();
  Navbar.init();
  Wishlist.updateUI();
  Toast.init();
  ScrollReveal.init();
  Counters.init();
  Calculator.init();
});
