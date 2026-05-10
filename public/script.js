/* ============================================================
   MerakAi — Marketing site script
   - Inject logo SVGs (animated in nav, static in footer)
   - Animate logo once per session (sessionStorage)
   - Respect prefers-reduced-motion
   - Handle waitlist form submission via Formspree (with graceful fallback)
   - Smooth scroll on anchor links
   ============================================================ */
(function () {
  'use strict';

  // ----- Logo geometry constants -----
  const STEM = { x: 75, y: 155, w: 9, h: 92 };
  const BEAM = { x: 28, y: 195, w: 104, h: 7 };
  const PIVOT = { x: 80, y: 198 };
  const DOT_ON_BEAM = { cx: 124, cy: 190, r: 9 };
  const TIP_ANGLE_DEG = 32;
  const PERIOD_DOT = { cx: 396, cy: 218, r: 6 };
  const SESSION_KEY = 'merakai:brand-animation-played';

  /**
   * Build the MerakAi logo as an SVG element.
   * @param {Object} opts - Options
   * @param {boolean} opts.animate - Whether to play the reveal animation
   * @param {string} opts.variant - 'dark' (default) or 'light'
   * @returns {SVGElement}
   */
  function buildLogo(opts) {
    const animate = opts && opts.animate;
    const variant = (opts && opts.variant) || 'dark';

    const colors = variant === 'light'
      ? { stem: '#0A0E18', accent: '#378ADD', text: '#0A0E18', italic: '#378ADD' }
      : { stem: '#F2F4F8', accent: '#5BA3EF', text: '#F2F4F8', italic: '#5BA3EF' };

    const NS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('xmlns', NS);
    // Tight viewBox showing just the logo + room for animation arc above wordmark
    svg.setAttribute('viewBox', '0 30 460 230');
    svg.setAttribute('fill', 'none');
    svg.setAttribute('role', 'img');
    svg.setAttribute('aria-label', 'MerakAi');
    svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
    svg.style.width = '100%';
    svg.style.height = 'auto';
    svg.style.display = 'block';

    // Vertical stem
    const stem = document.createElementNS(NS, 'rect');
    stem.setAttribute('x', STEM.x);
    stem.setAttribute('y', STEM.y);
    stem.setAttribute('width', STEM.w);
    stem.setAttribute('height', STEM.h);
    stem.setAttribute('fill', colors.stem);
    svg.appendChild(stem);

    // Beam group (rotates if animating; pre-rotated if static)
    const beamGroup = document.createElementNS(NS, 'g');
    if (!animate) {
      beamGroup.setAttribute('transform', `rotate(${TIP_ANGLE_DEG} ${PIVOT.x} ${PIVOT.y})`);
    }

    const beam = document.createElementNS(NS, 'rect');
    beam.setAttribute('x', BEAM.x);
    beam.setAttribute('y', BEAM.y);
    beam.setAttribute('width', BEAM.w);
    beam.setAttribute('height', BEAM.h);
    beam.setAttribute('fill', colors.accent);
    beamGroup.appendChild(beam);

    const dotAttached = document.createElementNS(NS, 'circle');
    dotAttached.setAttribute('cx', DOT_ON_BEAM.cx);
    dotAttached.setAttribute('cy', DOT_ON_BEAM.cy);
    dotAttached.setAttribute('r', DOT_ON_BEAM.r);
    dotAttached.setAttribute('fill', colors.accent);
    dotAttached.setAttribute('opacity', animate ? '0' : '1');
    beamGroup.appendChild(dotAttached);

    svg.appendChild(beamGroup);

    // Wordmark
    const merak = document.createElementNS(NS, 'text');
    merak.setAttribute('x', '150');
    merak.setAttribute('y', '222');
    merak.setAttribute('font-family', 'Fraunces, Georgia, serif');
    merak.setAttribute('font-size', '64');
    merak.setAttribute('font-weight', '500');
    merak.setAttribute('letter-spacing', '-1.2');
    merak.setAttribute('fill', colors.text);
    merak.textContent = 'Merak';
    svg.appendChild(merak);

    const ai = document.createElementNS(NS, 'text');
    ai.setAttribute('x', '340');
    ai.setAttribute('y', '222');
    ai.setAttribute('font-family', 'Fraunces, Georgia, serif');
    ai.setAttribute('font-size', '64');
    ai.setAttribute('font-weight', '500');
    ai.setAttribute('font-style', 'italic');
    ai.setAttribute('letter-spacing', '-1.2');
    ai.setAttribute('fill', colors.italic);
    ai.textContent = 'Ai';
    svg.appendChild(ai);

    if (!animate) return svg;

    // Animation: flying dot + beam rotation via JS-driven RAF (works reliably across browsers)
    const dotFlying = document.createElementNS(NS, 'circle');
    dotFlying.setAttribute('cx', PERIOD_DOT.cx);
    dotFlying.setAttribute('cy', PERIOD_DOT.cy);
    dotFlying.setAttribute('r', PERIOD_DOT.r);
    dotFlying.setAttribute('fill', colors.accent);
    svg.appendChild(dotFlying);

    runAnimation(svg, beamGroup, dotAttached, dotFlying);

    return svg;
  }

  // Animation timings (ms)
  const T = {
    balanceEnd: 900,
    arcEnd: 2700,
    impactEnd: 3100,
    tipEnd: 4600,
    restEnd: 5200,
  };
  const START = { cx: 396, cy: 218 };
  const C1 = { cx: 412, cy: 40 };
  const C2 = { cx: 200, cy: 40 };
  const END = { cx: DOT_ON_BEAM.cx, cy: DOT_ON_BEAM.cy };

  function easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }
  function easeInOutSine(t) {
    return -(Math.cos(Math.PI * t) - 1) / 2;
  }
  function cbez(t, p0, p1, p2, p3) {
    const u = 1 - t;
    return u * u * u * p0 + 3 * u * u * t * p1 + 3 * u * t * t * p2 + t * t * t * p3;
  }

  function runAnimation(svg, beamGroup, dotAttached, dotFlying) {
    let startTime = null;

    function tick(now) {
      if (!startTime) startTime = now;
      const elapsed = now - startTime;

      if (elapsed < T.balanceEnd) {
        // Hold — period sits as full stop
        dotFlying.setAttribute('cx', START.cx);
        dotFlying.setAttribute('cy', START.cy);
        dotFlying.setAttribute('opacity', '1');
        dotAttached.setAttribute('opacity', '0');
        beamGroup.style.transform = 'rotate(0deg)';
      } else if (elapsed < T.arcEnd) {
        // Travel — arc over wordmark
        const t = (elapsed - T.balanceEnd) / (T.arcEnd - T.balanceEnd);
        const et = easeInOutCubic(t);
        dotFlying.setAttribute('cx', cbez(et, START.cx, C1.cx, C2.cx, END.cx));
        dotFlying.setAttribute('cy', cbez(et, START.cy, C1.cy, C2.cy, END.cy));
        dotFlying.setAttribute('opacity', '1');
        dotAttached.setAttribute('opacity', '0');
        beamGroup.style.transform = 'rotate(0deg)';
      } else if (elapsed < T.impactEnd) {
        // Impact shiver
        dotFlying.setAttribute('opacity', '0');
        dotAttached.setAttribute('opacity', '1');
        const t = (elapsed - T.arcEnd) / (T.impactEnd - T.arcEnd);
        const shiver = Math.sin(t * Math.PI) * 0.9;
        beamGroup.style.transform = `rotate(${shiver}deg)`;
      } else if (elapsed < T.tipEnd) {
        // Slow tip
        dotFlying.setAttribute('opacity', '0');
        dotAttached.setAttribute('opacity', '1');
        const t = (elapsed - T.impactEnd) / (T.tipEnd - T.impactEnd);
        const et = easeInOutSine(t);
        beamGroup.style.transform = `rotate(${et * TIP_ANGLE_DEG}deg)`;
      } else if (elapsed < T.restEnd) {
        // Rest at final position
        dotFlying.setAttribute('opacity', '0');
        dotAttached.setAttribute('opacity', '1');
        beamGroup.style.transform = `rotate(${TIP_ANGLE_DEG}deg)`;
      } else {
        // Done — leave at final state
        return;
      }

      requestAnimationFrame(tick);
    }

    // Set CSS transform-origin via inline style on the group
    beamGroup.style.transformOrigin = `${PIVOT.x}px ${PIVOT.y}px`;

    requestAnimationFrame(tick);
  }

  /**
   * Decide whether to animate the nav logo on this load.
   * - Plays once per browser session (cleared when tab closes)
   * - Respects prefers-reduced-motion
   */
  function shouldAnimateNavLogo() {
    try {
      const reducedMotion =
        window.matchMedia &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (reducedMotion) return false;

      if (window.sessionStorage) {
        if (window.sessionStorage.getItem(SESSION_KEY) === '1') return false;
        window.sessionStorage.setItem(SESSION_KEY, '1');
      }
      return true;
    } catch (e) {
      return false;
    }
  }

  /**
   * Initialize: inject logos and wire up form
   */
  function init() {
    // Nav logo — animates once per session
    const navHost = document.getElementById('navLogo');
    if (navHost) {
      const animate = shouldAnimateNavLogo();
      const logo = buildLogo({ animate, variant: 'dark' });
      navHost.appendChild(logo);
    }

    // Footer logo — always static
    const footerHost = document.getElementById('footerLogo');
    if (footerHost) {
      const logo = buildLogo({ animate: false, variant: 'dark' });
      footerHost.appendChild(logo);
    }

    // Waitlist form
    const form = document.getElementById('waitlistForm');
    const successBlock = document.getElementById('waitlistSuccess');
    if (form && successBlock) {
      form.addEventListener('submit', function (event) {
        // If the form action still has the placeholder, fall back to mailto
        if (form.action.indexOf('FORMSPREE_ENDPOINT_HERE') > -1) {
          event.preventDefault();
          const email = form.querySelector('input[name="email"]').value;
          const subject = encodeURIComponent('MerakAi waitlist signup');
          const body = encodeURIComponent(`Email: ${email}`);
          window.location.href = `mailto:support@merakidiscovery.com?subject=${subject}&body=${body}`;
          return;
        }

        // Otherwise, submit to Formspree via fetch for inline UX
        event.preventDefault();
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalLabel = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = 'Sending...';

        const formData = new FormData(form);

        fetch(form.action, {
          method: 'POST',
          body: formData,
          headers: { Accept: 'application/json' },
        })
          .then(function (response) {
            if (response.ok) {
              form.hidden = true;
              successBlock.hidden = false;
              successBlock.scrollIntoView({ behavior: 'smooth', block: 'center' });
            } else {
              throw new Error('Submission failed');
            }
          })
          .catch(function () {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalLabel;
            alert(
              'Sorry — something went wrong. Please email us directly at support@merakidiscovery.com'
            );
          });
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
