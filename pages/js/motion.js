import { api } from './state.js';

export function trackFunnel(eventName) {
  try {
    api('/telemetry/event', { event: eventName }).catch(() => {});
  } catch {}
}

/**
 * Smooth Scroll Engine (Lenis & GSAP-inspired inertia scrolling)
 * Smoothly interpolates window scroll positions with RAF easing for couture fluidity.
 */
export function initSmoothScroll() {
  if (typeof window === 'undefined') return;
  if (window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches) return;
  if (window.__jbLenisInit) return;
  window.__jbLenisInit = true;

  let currentY = window.scrollY;
  let targetY = window.scrollY;
  let isMoving = false;

  const onWheel = (e) => {
    // Allow native scrolling inside nested scrollable elements (modals, dialogs, drawers)
    if (e.target?.closest?.('textarea, select, [data-native-scroll], dialog[open], .ops-sidebar, .wheel-modal-shell')) return;
    e.preventDefault();
    const maxScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
    targetY = Math.max(0, Math.min(maxScroll, targetY + e.deltaY * 1.08));
    if (!isMoving) {
      isMoving = true;
      requestAnimationFrame(updateScroll);
    }
  };

  const updateScroll = () => {
    const diff = targetY - currentY;
    if (Math.abs(diff) > 0.5) {
      currentY += diff * 0.12;
      window.scrollTo(0, Math.round(currentY));
      requestAnimationFrame(updateScroll);
    } else {
      currentY = targetY;
      window.scrollTo(0, targetY);
      isMoving = false;
    }
  };

  window.addEventListener('wheel', onWheel, { passive: false });
  window.addEventListener('scroll', () => {
    if (!isMoving) {
      currentY = window.scrollY;
      targetY = window.scrollY;
    }
  }, { passive: true });
}

/**
 * 21st.dev & Impeccable-inspired luxury scroll stagger reveals + interactive spotlight glow.
 * Progressive enhancement: elements stay visible even if IntersectionObserver is unavailable.
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
      { threshold: 0.06, rootMargin: '0px 0px -24px 0px' },
    );

    els.forEach((el, idx) => {
      el.style.setProperty('--reveal-delay', `${Math.min(idx * 55, 280)}ms`);
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.95) {
        el.classList.add('is-revealed');
      } else {
        el.classList.add('will-reveal');
        io.observe(el);
      }
    });

    // Safety auto-reveal after 500ms so nothing ever remains hidden
    setTimeout(() => {
      document.querySelectorAll('[data-reveal].will-reveal').forEach((el) => {
        el.classList.add('is-revealed');
      });
    }, 500);
  }

  // Interactive cursor spotlight on luxury cards (21st.dev Spotlight Card effect)
  if (!reduceMotion && !window.__jbSpotlightBound) {
    window.__jbSpotlightBound = true;
    document.addEventListener(
      'pointermove',
      (e) => {
        const card = e.target?.closest?.('.card, .service-card, .package-card, .jb-path, .jb-reward-card, .cta-band, .gift-live-card, .hero-reference-card');
        if (!card) return;
        const rect = card.getBoundingClientRect();
        card.style.setProperty('--mx', `${e.clientX - rect.left}px`);
        card.style.setProperty('--my', `${e.clientY - rect.top}px`);
      },
      { passive: true },
    );
  }
}

/**
 * Luxury Metallic Rose-Gold Petals Membership Medallion (replaces primitive SVG flower).
 * Uses the official J Beauty Spa brand emblem framed in an orbital rose-gold progress ring.
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
