// J Beauty Spa — Smart Periodic & Ops-Controlled Wheel of Rewards
// Strict Client Luxury Brand Palette: #C5A078 (Soft Gold), #86585B (Rose Mauve), #D5AAA5 (Dusty Pink), #EACBC5 (Blush), #F5E6E1 (Ivory Pink), #D9AAA9 (Rose Pink)

import { state, t, toast, href, esc } from './state.js';
import { openDialog } from './components.js';

export const DEFAULT_WHEEL_PRIZES = [
  { id: 'jb5', title_ar: 'خصم 5%', title_en: '5% OFF', desc_ar: 'خصم 5% ترحيبي على جلستك القادمة', desc_en: '5% welcome discount on your next visit', code: 'JB5', discount_type: 'percent', value: 5, color: '#86585B', textColor: '#FFFFFF' },
  { id: 'jb7', title_ar: 'خصم 7%', title_en: '7% OFF', desc_ar: 'خصم 7% لطيف على خدمات السبا والأظافر', desc_en: '7% off spa & nail rituals', code: 'JB7', discount_type: 'percent', value: 7, color: '#C5A078', textColor: '#FFFFFF' },
  { id: 'jbsar10', title_ar: 'خصم 10 ريال', title_en: '10 SAR OFF', desc_ar: 'خصم 10 ريال فوري على حجزك', desc_en: '10 SAR instant savings on your booking', code: 'JBSAR10', discount_type: 'fixed', value: 10, color: '#D5AAA5', textColor: '#3E2932' },
  { id: 'jb10', title_ar: 'خصم 10%', title_en: '10% OFF', desc_ar: 'الجائزة الكبرى: خصم 10% على الباقات والخدمات', desc_en: 'Grand Prize: 10% off rituals & packages', code: 'JB10', discount_type: 'percent', value: 10, color: '#EACBC5', textColor: '#3E2932' },
  { id: 'jbsar15', title_ar: 'خصم 15 ريال', title_en: '15 SAR OFF', desc_ar: 'خصم 15 ريال فوري للطلبات فوق 180 ريال', desc_en: '15 SAR off bookings over 180 SAR', code: 'JBSAR15', discount_type: 'fixed', value: 15, color: '#D9AAA9', textColor: '#FFFFFF' },
  { id: 'jbpetals20', title_ar: '20 بتلة هدية', title_en: '20 Bonus Petals', desc_ar: 'قسيمة تعادل 20 بتلة خصم فوري', desc_en: 'Instant voucher worth 20 Petals', code: 'JBPETALS20', discount_type: 'fixed', value: 10, color: '#F5E6E1', textColor: '#86585B' },
];

export function getWheelPrizes() {
  const configured = state.catalog?.settings?.wheel_prizes;
  if (Array.isArray(configured) && configured.length >= 2) {
    return configured;
  }
  return DEFAULT_WHEEL_PRIZES;
}

export function isWheelEligible() {
  const s = state.catalog?.settings || {};
  if (s.wheel_enabled === false) return false;

  try {
    const lastSpinRaw = localStorage.getItem('jbeauty_wheel_last_spin');
    if (!lastSpinRaw) return true;

    if (s.wheel_first_visit_only === true) {
      return false;
    }

    const lastSpinMs = Number(lastSpinRaw);
    const cooldownDays = Math.max(1, Number(s.wheel_cooldown_days || 14));
    const cooldownMs = cooldownDays * 24 * 60 * 60 * 1000;
    return Date.now() - lastSpinMs >= cooldownMs;
  } catch {
    return true;
  }
}

export function isWheelVisible() {
  return isWheelEligible();
}

let currentRotation = 0;
let isSpinning = false;

// HiDPI Retina canvas setup
function prepareHiDpiCanvas(canvas, size = 360) {
  const dpr = Math.min(window.devicePixelRatio || 2, 3);
  if (canvas.width !== size * dpr || canvas.height !== size * dpr) {
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;
  }
  const ctx = canvas.getContext('2d');
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.scale(dpr, dpr);
  return { ctx, size };
}

export function drawWheel(canvas, rotationAngle = 0) {
  if (!canvas) return;
  const { ctx, size } = prepareHiDpiCanvas(canvas, 360);
  const prizes = getWheelPrizes();
  const w = size;
  const h = size;
  const cx = w / 2;
  const cy = h / 2;
  const radius = cx - 18;

  ctx.clearRect(0, 0, w, h);

  const numSlices = prizes.length;
  const arcSize = (Math.PI * 2) / numSlices;

  // Outer Gold Shadow & Glow
  ctx.save();
  ctx.translate(cx, cy);

  // Outer Bezel Layer (Metallic Gold Gradient)
  const bezelGrad = ctx.createRadialGradient(0, 0, radius - 4, 0, 0, radius + 14);
  bezelGrad.addColorStop(0, '#C5A078');
  bezelGrad.addColorStop(0.5, '#EACBC5');
  bezelGrad.addColorStop(1, '#86585B');
  ctx.beginPath();
  ctx.arc(0, 0, radius + 12, 0, Math.PI * 2);
  ctx.fillStyle = bezelGrad;
  ctx.fill();

  ctx.rotate(rotationAngle);

  // Render Slices
  for (let i = 0; i < numSlices; i++) {
    const angle = i * arcSize;
    const prize = prizes[i];

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, radius, angle, angle + arcSize);
    ctx.closePath();

    ctx.fillStyle = prize.color || '#C5A078';
    ctx.fill();

    // Crisp inner divider
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.stroke();

    // Slice Typography
    ctx.save();
    ctx.rotate(angle + arcSize / 2);
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = prize.textColor || '#FFFFFF';
    ctx.font = '600 14px "IBM Plex Sans Arabic", "Noto Naskh Arabic", sans-serif';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
    ctx.shadowBlur = 3;
    ctx.fillText(t(prize.title_ar, prize.title_en), radius - 26, 0);
    ctx.restore();
  }

  // Inner Gold Border
  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, Math.PI * 2);
  ctx.lineWidth = 3;
  ctx.strokeStyle = '#FFFFFF';
  ctx.stroke();

  // Perimeter Pearl Studs
  const numStuds = numSlices * 4;
  for (let i = 0; i < numStuds; i++) {
    const a = (i * Math.PI * 2) / numStuds;
    const sx = Math.cos(a) * (radius + 6);
    const sy = Math.sin(a) * (radius + 6);
    ctx.beginPath();
    ctx.arc(sx, sy, 3, 0, Math.PI * 2);
    ctx.fillStyle = '#FFFFFF';
    ctx.shadowColor = 'rgba(197, 160, 120, 0.6)';
    ctx.shadowBlur = 4;
    ctx.fill();
  }

  ctx.restore(); // Exit wheel rotation

  // Center Hub (Fixed Medallion)
  ctx.save();
  ctx.translate(cx, cy);

  // Center Outer Bezel
  ctx.beginPath();
  ctx.arc(0, 0, 42, 0, Math.PI * 2);
  const hubGrad = ctx.createRadialGradient(0, 0, 20, 0, 0, 42);
  hubGrad.addColorStop(0, '#FFFFFF');
  hubGrad.addColorStop(0.7, '#F5E6E1');
  hubGrad.addColorStop(1, '#C5A078');
  ctx.fillStyle = hubGrad;
  ctx.shadowColor = 'rgba(62, 41, 50, 0.25)';
  ctx.shadowBlur = 10;
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = '#C5A078';
  ctx.stroke();

  // Center Inner Lotus Emblem
  ctx.fillStyle = '#86585B';
  ctx.font = '700 13px "IBM Plex Sans Arabic", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.shadowBlur = 0;
  ctx.fillText('✦ J Spa ✦', 0, 0);
  ctx.restore();

  // Top Pointer (High-Res 3D Metallic Indicator)
  ctx.save();
  ctx.translate(cx, 22);

  ctx.beginPath();
  ctx.moveTo(-16, -10);
  ctx.lineTo(16, -10);
  ctx.lineTo(0, 26);
  ctx.closePath();

  const ptrGrad = ctx.createLinearGradient(-16, 0, 16, 0);
  ptrGrad.addColorStop(0, '#86585B');
  ptrGrad.addColorStop(0.5, '#C5A078');
  ptrGrad.addColorStop(1, '#684245');
  ctx.fillStyle = ptrGrad;
  ctx.shadowColor = 'rgba(62, 41, 50, 0.35)';
  ctx.shadowBlur = 8;
  ctx.shadowOffsetY = 4;
  ctx.fill();

  ctx.lineWidth = 2;
  ctx.strokeStyle = '#FFFFFF';
  ctx.stroke();
  ctx.restore();

  ctx.restore(); // Restore initial DPR scaling
}

export function openRewardsWheelDialog() {
  const s = state.catalog?.settings || {};
  if (s.wheel_enabled === false) {
    toast(t('عجلة المكافآت غير متاحة حالياً.', 'Rewards wheel is currently paused.'));
    return;
  }

  const eligible = isWheelEligible();
  let savedPrize = null;
  try {
    const raw = localStorage.getItem('jbeauty_wheel_prize');
    if (raw) savedPrize = JSON.parse(raw);
  } catch {}

  openDialog(`
    <div class="wheel-modal-shell" style="max-width:440px;margin:0 auto;text-align:center">
      <div style="text-align:center;margin-bottom:14px">
        <span class="eyebrow" style="color:var(--rose-mauve);font-weight:700">✦ ${t('هدية الزيارة الأولى والعروض الدورية', 'EXCLUSIVE REWARDS')} ✦</span>
        <h2 style="margin:4px 0 6px;color:var(--plum);font-size:24px;font-family:var(--font-ar-display)">${t('عجلة مكافآت J Beauty Spa 🌸', 'J Beauty Spa Wheel of Rewards 🌸')}</h2>
        <p class="muted" style="margin:0;font-size:14px">${t('دوري العجلة لفرصة ربح كود خصم لطيف لجلستك المنزلية القادمة.', 'Spin the wheel for a special promo code on your upcoming home session.')}</p>
      </div>

      <div class="wheel-stage-container" style="position:relative;display:flex;justify-content:center;align-items:center;margin:12px auto 16px;min-height:360px">
        <canvas id="rewards-wheel-canvas" style="filter:drop-shadow(0 14px 36px rgba(134,88,91,0.22));border-radius:50%"></canvas>
      </div>

      <div id="wheel-action-area" style="text-align:center">
        ${
          !eligible && savedPrize
            ? `
              <div class="card" style="background:var(--cream-bg);border:1.5px solid var(--soft-gold);padding:16px 20px;border-radius:var(--r-md);margin-bottom:14px;box-shadow:var(--shadow-soft)">
                <span class="badge" style="background:var(--rose-mauve);color:#fff;margin-bottom:6px">${t('جائزتك الفعالة', 'Your Active Prize')}</span>
                <h3 style="margin:4px 0;color:var(--plum)">${esc(t(savedPrize.title_ar, savedPrize.title_en))}</h3>
                <p class="muted" style="margin:0 0 10px;font-size:14px">${esc(t(savedPrize.desc_ar, savedPrize.desc_en))}</p>
                <div class="row" style="justify-content:center;gap:10px;flex-wrap:wrap">
                  <div style="font-size:17px;font-weight:700;letter-spacing:1px;padding:6px 14px;background:#fff;border:1px dashed var(--soft-gold);border-radius:var(--r-sm);color:var(--rose-mauve)">${esc(savedPrize.code)}</div>
                  <button type="button" class="btn small" id="copy-wheel-code-btn">${t('نسخ الكود', 'Copy Code')}</button>
                  <button type="button" class="btn small light" id="apply-wheel-booking-btn">${t('تطبيق في الحجز', 'Use in Booking')}</button>
                </div>
              </div>
              <p class="muted" style="font-size:13px;margin:0">${t('يمكنك تدوير العجلة مجدداً في العرض الدوري القادم.', 'You can spin again during the next periodic reward window.')}</p>
            `
            : `
              <button type="button" class="btn shimmer-btn" id="spin-wheel-btn" style="min-width:240px;font-size:16px;padding:14px 32px;box-shadow:var(--shadow-gold)">
                ${t('تدوير العجلة الآن ✦', 'Spin the Wheel ✦')}
              </button>
            `
        }
      </div>
    </div>
  `);

  const canvas = document.querySelector('#rewards-wheel-canvas');
  drawWheel(canvas, currentRotation);
  const actionArea = document.querySelector('#wheel-action-area');

  const setupPrizeActions = (prize) => {
    document.querySelector('#copy-wheel-code-btn')?.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(prize.code);
        toast(t('تم نسخ كود الخصم: ' + prize.code, 'Coupon copied: ' + prize.code));
      } catch {
        toast(prize.code);
      }
    });

    document.querySelector('#apply-wheel-booking-btn')?.addEventListener('click', () => {
      state.draft.coupon_code = prize.code;
      state.draft.coupon = {
        code: prize.code,
        discount_type: prize.discount_type,
        value: prize.value,
        name: prize.title_ar,
      };
      document.querySelector('#modal')?.close();
      toast(t('تم تفعيل كود الخصم في حجزك 🌸', 'Coupon activated in your booking 🌸'));
      history.pushState({}, '', href('booking'));
      window.dispatchEvent(new PopStateEvent('popstate'));
    });
  };

  if (!eligible && savedPrize) {
    setupPrizeActions(savedPrize);
  }

  const startSpin = () => {
    if (isSpinning) return;
    const prizes = getWheelPrizes();
    isSpinning = true;
    const currentBtn = document.querySelector('#spin-wheel-btn');
    if (currentBtn) currentBtn.disabled = true;

    const prizeIndex = Math.floor(Math.random() * prizes.length);
    const winningPrize = prizes[prizeIndex];

    const numSlices = prizes.length;
    const arcSize = (Math.PI * 2) / numSlices;
    const targetSliceCenter = (prizeIndex + 0.5) * arcSize;
    const desiredFinalAngle = Math.PI * 1.5 - targetSliceCenter;
    const extraRotations = (5 + Math.floor(Math.random() * 3)) * (Math.PI * 2);

    const initialRotation = currentRotation;
    const startAngle = initialRotation % (Math.PI * 2);
    const totalRotationNeeded = extraRotations + (desiredFinalAngle - startAngle);

    const duration = 4000;
    const startTime = performance.now();
    const easeOutQuart = (x) => 1 - Math.pow(1 - x, 4);

    const animateSpin = (nowTs) => {
      const elapsed = nowTs - startTime;
      const progress = Math.min(1, elapsed / duration);
      const eased = easeOutQuart(progress);

      currentRotation = initialRotation + totalRotationNeeded * eased;
      drawWheel(canvas, currentRotation);

      if (progress < 1) {
        requestAnimationFrame(animateSpin);
      } else {
        isSpinning = false;
        try {
          localStorage.setItem('jbeauty_wheel_prize', JSON.stringify(winningPrize));
          localStorage.setItem('jbeauty_wheel_last_spin', String(Date.now()));
        } catch {}
        syncWheelFloatingVisibility();
        toast(t('مبروك! فزت بـ ' + winningPrize.title_ar + ' 🌸', 'Congratulations! You won ' + winningPrize.title_en + ' 🌸'));

        if (actionArea) {
          actionArea.innerHTML = `
            <div class="card" style="background:var(--cream-bg);border:1.5px solid var(--soft-gold);padding:18px 20px;border-radius:var(--r-md);margin-bottom:10px;animation:fadeIn 0.4s ease-out">
              <span class="badge" style="background:var(--rose-mauve);color:#fff;margin-bottom:8px">🎉 ${t('مبروك! جائزتك الخاصة', 'Congratulations!')}</span>
              <h3 style="margin:4px 0;color:var(--plum);font-size:20px">${esc(t(winningPrize.title_ar, winningPrize.title_en))}</h3>
              <p class="muted" style="margin:0 0 12px;font-size:14px">${esc(t(winningPrize.desc_ar, winningPrize.desc_en))}</p>
              <div class="row" style="justify-content:center;gap:10px;flex-wrap:wrap">
                <div style="font-size:18px;font-weight:700;letter-spacing:1px;padding:8px 18px;background:#fff;border:1.5px dashed var(--soft-gold);border-radius:var(--r-sm);color:var(--rose-mauve)">${esc(winningPrize.code)}</div>
                <button type="button" class="btn small" id="copy-wheel-code-btn">${t('نسخ الكود', 'Copy Code')}</button>
                <button type="button" class="btn small light" id="apply-wheel-booking-btn">${t('تطبيق في الحجز ✦', 'Apply in Booking ✦')}</button>
              </div>
            </div>
            <p class="muted" style="font-size:13px;margin:0">${t('تم حفظ الكود في جهازك ويمكنك استخدامه عند تأكيد حجزك.', 'Code saved on your device and ready to apply.')}</p>
          `;
          setupPrizeActions(winningPrize);
        }
      }
    };

    requestAnimationFrame(animateSpin);
  };

  document.querySelector('#spin-wheel-btn')?.addEventListener('click', startSpin);
}

export function initWheelFloatingButton() {
  if (document.querySelector('#floating-rewards-wheel-btn')) return;

  const btn = document.createElement('button');
  btn.type = 'button';
  btn.id = 'floating-rewards-wheel-btn';
  btn.className = 'floating-wheel-pill';
  btn.setAttribute('aria-label', t('عجلة المكافآت', 'Rewards Wheel'));
  btn.innerHTML = `
    <span class="wheel-icon-spin">🎡</span>
    <span class="wheel-label">${t('هدية زيارتك', 'Your Gift')}</span>
  `;

  btn.addEventListener('click', () => {
    openRewardsWheelDialog();
  });

  document.body.appendChild(btn);
  syncWheelFloatingVisibility();
}

export function syncWheelFloatingVisibility() {
  const btn = document.querySelector('#floating-rewards-wheel-btn');
  if (!btn) return;
  const visible = isWheelVisible();
  btn.style.display = visible ? 'flex' : 'none';
}
