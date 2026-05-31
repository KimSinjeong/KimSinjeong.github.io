// GARField-style object strip controller: arrow buttons scroll by one card.
(function () {
  function initStrip(section) {
    const strip = section.querySelector('.object-strip');
    const prev = section.querySelector('.strip-arrow--prev');
    const next = section.querySelector('.strip-arrow--next');
    if (!strip || !prev || !next) return;
    const cards = Array.from(strip.querySelectorAll('.object-card'));
    if (cards.length === 0) return;

    // Speed each clip up to 1.5x and keep them frame-aligned. Browsers start independent
    // <video>s at slightly different wall-clock times and accumulate decoder drift, so we
    // (a) reset every video to t=0 once they all report loadeddata, then play together, and
    // (b) periodically nudge any video whose currentTime drifts >150 ms from the master clock.
    const PLAYBACK_RATE = 1.5;
    const DRIFT_THRESHOLD = 0.15; // seconds
    const videos = Array.from(strip.querySelectorAll('video'));
    videos.forEach(function (v) {
      try { v.playbackRate = PLAYBACK_RATE; } catch (_) {}
      v.addEventListener('loadedmetadata', function () { v.playbackRate = PLAYBACK_RATE; });
    });

    function whenReady(v) {
      return new Promise(function (resolve) {
        if (v.readyState >= 2) resolve();
        else v.addEventListener('loadeddata', function onLoad() {
          v.removeEventListener('loadeddata', onLoad);
          resolve();
        });
      });
    }

    function seekZero(v) {
      return new Promise(function (resolve) {
        if (Math.abs(v.currentTime) < 1e-3) { resolve(); return; }
        var onSeeked = function () { v.removeEventListener('seeked', onSeeked); resolve(); };
        v.addEventListener('seeked', onSeeked);
        try { v.currentTime = 0; } catch (_) { v.removeEventListener('seeked', onSeeked); resolve(); }
      });
    }

    Promise.all(videos.map(whenReady)).then(function () {
      videos.forEach(function (v) { v.pause(); v.playbackRate = PLAYBACK_RATE; });
      return Promise.all(videos.map(seekZero));
    }).then(function () {
      // Play all in the same animation frame for tight initial sync.
      requestAnimationFrame(function () {
        videos.forEach(function (v) {
          v.playbackRate = PLAYBACK_RATE;
          var p = v.play();
          if (p && p.catch) p.catch(function () {});
        });
        startDriftCorrection();
      });
    });

    function startDriftCorrection() {
      var master = videos[0];
      function tick() {
        if (master.paused || master.readyState < 2) return;
        var ref = master.currentTime;
        for (var i = 1; i < videos.length; i++) {
          var v = videos[i];
          if (v.readyState < 2) continue;
          var diff = v.currentTime - ref;
          // duration may not be reliable until enough buffered; guard against NaN
          var dur = v.duration;
          if (isFinite(dur) && dur > 0) {
            if (diff > dur * 0.5) diff -= dur;
            else if (diff < -dur * 0.5) diff += dur;
          }
          if (Math.abs(diff) > DRIFT_THRESHOLD) {
            try { v.currentTime = ref; } catch (_) {}
          }
        }
      }
      setInterval(tick, 750);
    }

    function currentLeftIdx() {
      // Index of the first card whose right edge is past the strip's left edge by a small margin.
      const stripLeft = strip.getBoundingClientRect().left;
      for (let i = 0; i < cards.length; i++) {
        const r = cards[i].getBoundingClientRect();
        if (r.right > stripLeft + 4) return i;
      }
      return Math.max(0, cards.length - 1);
    }

    function scrollToCard(idx) {
      const clamped = Math.max(0, Math.min(cards.length - 1, idx));
      const card = cards[clamped];
      // offsetLeft is relative to the offsetParent; both card and strip share the same parent chain
      // in this layout, so subtracting strip.offsetLeft gives the intra-strip coordinate.
      const target = card.offsetLeft - strip.offsetLeft;
      strip.scrollTo({ left: target, behavior: 'smooth' });
    }

    function updateArrows() {
      const maxScroll = strip.scrollWidth - strip.clientWidth;
      const canPrev = strip.scrollLeft > 2;
      const canNext = strip.scrollLeft < maxScroll - 2;
      prev.setAttribute('aria-disabled', canPrev ? 'false' : 'true');
      next.setAttribute('aria-disabled', canNext ? 'false' : 'true');
      // hide both when no overflow at all
      const overflow = maxScroll > 2;
      prev.style.display = overflow ? '' : 'none';
      next.style.display = overflow ? '' : 'none';
    }

    prev.addEventListener('click', function () {
      if (prev.getAttribute('aria-disabled') === 'true') return;
      scrollToCard(currentLeftIdx() - 1);
    });
    next.addEventListener('click', function () {
      if (next.getAttribute('aria-disabled') === 'true') return;
      scrollToCard(currentLeftIdx() + 1);
    });

    strip.addEventListener('scroll', updateArrows, { passive: true });
    window.addEventListener('resize', updateArrows);
    // Defer initial measurement until videos report their dimensions so widths are correct.
    requestAnimationFrame(updateArrows);
    setTimeout(updateArrows, 250);
    setTimeout(updateArrows, 1000);
  }

  function init() {
    document.querySelectorAll('.object-strip-section').forEach(initStrip);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
