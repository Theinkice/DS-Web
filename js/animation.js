/* ============================================================
   大叔云页 — animation.js
   滚动揭示 / 身份选择器（仅首页）
   ============================================================ */
(function () {
  'use strict';

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- 滚动揭示 ---------- */
  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (en.isIntersecting) {
        en.target.classList.add('is-in');
        revealObserver.unobserve(en.target);
      }
    });
  }, { threshold: 0.15 });
  document.querySelectorAll('[data-reveal]').forEach(el => revealObserver.observe(el));

  /* ---------- 身份选择器（仅首页存在） ---------- */
  const idBtns = document.querySelectorAll('.identity-btn');
  if (idBtns.length && window.DSY) {
    const idImg = document.getElementById('idImg');
    const idUrl = document.getElementById('idUrl');
    const idTag = document.getElementById('idTag');
    const idText = document.getElementById('idText');
    const idStat = document.getElementById('idStat');
    const preview = document.getElementById('identityPreview');
    let currentId = 'designer';
    let currentBtn = document.querySelector('.identity-btn[data-id="designer"]');

    function render() {
      if (!currentBtn) return;
      const d = window.DSY.IDENTITIES[currentId].zh;
      idImg.src = currentBtn.dataset.img;
      idUrl.textContent = 'dashuyunye.com/' + currentId;
      idTag.textContent = d[0];
      idText.textContent = d[1];
      idStat.textContent = d[2];
    }

    function setIdentity(id, btn) {
      currentId = id;
      currentBtn = btn;
      idBtns.forEach(b => b.classList.remove('is-active'));
      btn.classList.add('is-active');
      if (preview) {
        preview.classList.remove('is-switching');
        void preview.offsetWidth;
        preview.classList.add('is-switching');
      }
      render();
    }

    idBtns.forEach(btn => {
      btn.addEventListener('mouseenter', () => setIdentity(btn.dataset.id, btn));
      btn.addEventListener('click', () => setIdentity(btn.dataset.id, btn));
    });
    render();
  }
})();
