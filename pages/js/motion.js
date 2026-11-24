import { api } from './state.js';

export function trackFunnel(eventName) {
  try {
    api('/telemetry/event', { event: eventName }).catch(() => {});
  } catch {}
}

/**
 * Native GPU-Accelerated Smooth Scroll
 * Leaves scroll handling completely to the browser compositor thread for 120fps buttery performance.
 */
export function initSmoothScroll() {
  if (typeof document !== 'undefined' && document.documentElement) {
    document.documentElement.style.scrollBehavior = 'smooth';
  }
}

/**
 * 21st.dev & Impeccable-inspired luxury scroll reveals.
 * Uses lightweight IntersectionObserver with zero scroll hijacking.
 */
export function initScrollReveals() {
  initSmoothScroll();
  const els = [...document.querySelectorAll('[data-reveal]')];
  const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;

  if (reduceMotion || typeof IntersectionObserver === 'undefined') {
    els.forEach((el) => el.classList.add('is-revealed'));
  } else {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-revealed');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.05, rootMargin: '0px 0px 50px 0px' },
    );

    els.forEach((el, idx) => {
      el.style.setProperty('--reveal-delay', `${Math.min(idx * 40, 240)}ms`);
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.95) {
        el.classList.add('is-revealed');
      } else {
        el.classList.add('will-reveal');
        io.observe(el);
      }
    });

    // Safety auto-reveal after 400ms so nothing stays hidden
    setTimeout(() => {
      document.querySelectorAll('[data-reveal].will-reveal').forEach((el) => {
        el.classList.add('is-revealed');
      });
    }, 400);
  }

  // RAF-throttled Spotlight effect (zero frame drop)
  if (!reduceMotion && !window.__jbSpotlightBound) {
    window.__jbSpotlightBound = true;
    let ticking = false;
    document.addEventListener(
      'pointermove',
      (e) => {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(() => {
          ticking = false;
          const card = e.target?.closest?.('.card, .service-card, .package-card, .jb-path, .jb-reward-card, .cta-band, .gift-live-card, .hero-reference-card');
          if (!card) return;
          const rect = card.getBoundingClientRect();
          card.style.setProperty('--mx', `${e.clientX - rect.left}px`);
          card.style.setProperty('--my', `${e.clientY - rect.top}px`);
        });
      },
      { passive: true },
    );
  }
}

/**
 * Luxury Metallic Rose-Gold Petals Membership Medallion
 */
export function renderSignatureBloomSVG(filledCount = 4, totalPetals = 8, lightMode = true, userBalance = null) {
  let balance = Number.isFinite(userBalance) ? userBalance : (filledCount > 8 ? filledCount : null);
  let tierName = 'عضوية البتلة الفضية';
  let pct = 0;
  let deg = 0;

  if (balance !== null) {
    if (balance >= 500) {
      tierName = 'عضوية بتلات VIP';
      pct = 100;
      deg = 360;
    } else if (balance >= 200) {
      tierName = 'عضوية الدلال الذهبي';
      pct = Math.min(100, Math.round(((balance - 200) / 300) * 100));
      deg = Math.round((pct / 100) * 360);
    } else {
      tierName = 'عضوية البتلة الفضية';
      pct = Math.min(100, Math.round((balance / 200) * 100));
      deg = Math.round((pct / 100) * 360);
    }
  } else {
    const ratio = Math.max(0, Math.min(1, filledCount / Math.max(1, totalPetals)));
    pct = Math.round(ratio * 100);
    deg = Math.round(ratio * 360);
    tierName = pct >= 80 ? 'عضوية بتلات VIP' : (pct >= 40 ? 'عضوية الدلال الذهبي' : 'عضوية البتلة الفضية');
  }

  return `
    <div class="jb-luxury-medallion-card ${lightMode ? 'is-light' : 'is-dark'}" role="img" aria-label="وسام برنامج بتلات J الفاخر">
      <div class="jb-medallion-ring-wrap">
        <div class="jb-medallion-beam" aria-hidden="true"></div>
        <div class="jb-medallion-ring" style="--petal-deg:${deg}deg">
          <div class="jb-medallion-core">
            <img src="/J_BEAUTY/apps/customer/assets/brand/monogram.svg" alt="J Beauty Spa" class="jb-medallion-logo" style="width:58px;height:58px;object-fit:contain">
          </div>
        </div>
      </div>
      <div class="jb-medallion-meta">
        <span class="jb-medallion-kicker">✦ J PETALS PRIVILÈGE ✦</span>
        <strong class="jb-medallion-title">${tierName}</strong>
        <div class="jb-medallion-pill-row">
          <span class="jb-medallion-pill">1 ريال = 1 بتلة</span>
          <span class="jb-medallion-pill is-gold">${pct}% اكتمال</span>
        </div>
      </div>
    </div>
  `;
}
