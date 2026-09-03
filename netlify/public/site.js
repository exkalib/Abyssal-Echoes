(() => {
  const header = document.querySelector('[data-header]');
  const toast = document.querySelector('[data-toast]');
  const copyButton = document.querySelector('[data-copy-group]');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const panels = [...document.querySelectorAll('[data-page-panel]')];
  const WHEEL_THRESHOLD = 72;
  const TOUCH_THRESHOLD = 56;
  const PAGE_LOCK_MS = reducedMotion ? 180 : 1800;
  let toastTimer = 0;
  let pageLockTimer = 0;
  let wheelResetTimer = 0;
  let wheelDistance = 0;
  let activePanel = 0;
  let pageLocked = false;
  let touchStartX = 0;
  let touchStartY = 0;
  let touchPaging = false;

  const findClosestPanel = () => {
    let closestIndex = 0;
    let closestDistance = Number.POSITIVE_INFINITY;
    panels.forEach((panel, index) => {
      const distance = Math.abs(panel.getBoundingClientRect().top);
      if (distance >= closestDistance) return;
      closestDistance = distance;
      closestIndex = index;
    });
    return closestIndex;
  };

  const syncPageState = () => {
    activePanel = findClosestPanel();
    header?.classList.toggle('scrolled', activePanel > 0);
  };

  const goToPanel = (index) => {
    const nextIndex = Math.max(0, Math.min(index, panels.length - 1));
    if (!panels[nextIndex] || nextIndex === activePanel || pageLocked) return;

    activePanel = nextIndex;
    pageLocked = true;
    header?.classList.toggle('scrolled', activePanel > 0);
    panels[activePanel].scrollIntoView({
      behavior: reducedMotion ? 'auto' : 'smooth',
      block: 'start'
    });

    window.clearTimeout(pageLockTimer);
    pageLockTimer = window.setTimeout(() => {
      pageLocked = false;
      syncPageState();
    }, PAGE_LOCK_MS);
  };

  syncPageState();
  window.addEventListener('scroll', syncPageState, { passive: true });

  window.addEventListener('wheel', (event) => {
    if (event.ctrlKey || event.metaKey || !panels.length) return;
    event.preventDefault();
    window.clearTimeout(wheelResetTimer);
    wheelResetTimer = window.setTimeout(() => {
      wheelDistance = 0;
    }, 180);
    if (pageLocked) return;

    wheelDistance += event.deltaY;
    if (Math.abs(wheelDistance) < WHEEL_THRESHOLD) return;

    goToPanel(activePanel + Math.sign(wheelDistance));
    wheelDistance = 0;
  }, { passive: false });

  window.addEventListener('touchstart', (event) => {
    const touch = event.touches[0];
    if (!touch) return;
    touchStartX = touch.clientX;
    touchStartY = touch.clientY;
    touchPaging = false;
  }, { passive: true });

  window.addEventListener('touchmove', (event) => {
    const touch = event.touches[0];
    if (!touch || touchPaging) return;
    const deltaX = touchStartX - touch.clientX;
    const deltaY = touchStartY - touch.clientY;
    if (Math.abs(deltaY) <= Math.abs(deltaX)) return;

    event.preventDefault();
    if (pageLocked || Math.abs(deltaY) < TOUCH_THRESHOLD) return;
    touchPaging = true;
    goToPanel(activePanel + Math.sign(deltaY));
  }, { passive: false });

  window.addEventListener('touchend', () => { touchPaging = false; }, { passive: true });

  window.addEventListener('keydown', (event) => {
    const target = event.target;
    if (target instanceof Element && target.closest('a, button, input, textarea, select, [contenteditable="true"]')) return;
    if (event.altKey || event.ctrlKey || event.metaKey) return;

    const nextKeys = ['ArrowDown', 'PageDown', ' '];
    const previousKeys = ['ArrowUp', 'PageUp'];
    if (nextKeys.includes(event.key)) {
      event.preventDefault();
      goToPanel(activePanel + 1);
    } else if (previousKeys.includes(event.key)) {
      event.preventDefault();
      goToPanel(activePanel - 1);
    } else if (event.key === 'Home') {
      event.preventDefault();
      goToPanel(0);
    } else if (event.key === 'End') {
      event.preventDefault();
      goToPanel(panels.length - 1);
    }
  });

  document.addEventListener('click', (event) => {
    const link = event.target.closest('a[href^="#"]');
    if (!link) return;
    const target = document.querySelector(link.getAttribute('href'));
    const panel = target?.matches('[data-page-panel]') ? target : target?.closest('[data-page-panel]');
    const index = panels.indexOf(panel);
    if (index < 0) return;

    event.preventDefault();
    pageLocked = false;
    goToPanel(index);
    window.history.replaceState(null, '', link.hash);
  });

  if (reducedMotion || !('IntersectionObserver' in window)) {
    document.querySelectorAll('.reveal').forEach((element) => element.classList.add('visible'));
  } else {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -7% 0px' });

    document.querySelectorAll('.reveal').forEach((element, index) => {
      element.style.transitionDelay = `${Math.min(index % 4, 3) * 70}ms`;
      observer.observe(element);
    });
  }

  const showToast = (message) => {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('visible');
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toast.classList.remove('visible'), 1600);
  };

  copyButton?.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText('1148651999');
      showToast('群号已复制');
    } catch {
      showToast('群号：1148651999');
    }
  });
})();
