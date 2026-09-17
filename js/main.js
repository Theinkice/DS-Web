/* ============================================================
   大叔云页 — main.js  v4.5
   启动序列（进度平滑过渡 + 里程碑脉冲）/ 整体科技背景 /
   星链粒子 / 光标拖尾（随机轨迹）+ 点击爆发 / 按钮涟漪 /
   页面切换遮罩 / 三点导航 / 微信复制 / 邮件表单 / 案例渲染
   ============================================================ */
(function () {
  'use strict';

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- 首屏英文打字（boot 结束后触发） ---------- */
  const titleEl = document.getElementById('enterTitle');
  const typedEl = document.getElementById('enterTyped');
  function typeTitle() {
    if (!titleEl || !typedEl) return;
    const text = titleEl.dataset.text || 'DASHUYUNYE';
    if (prefersReduced) { typedEl.textContent = text; return; }
    let i = 0;
    (function step() {
      i++;
      typedEl.textContent = text.slice(0, i);
      if (i < text.length) setTimeout(step, 66 + Math.random() * 90);
    })();
  }

  /* ---------- 启动序列 v5：世界构建 + 双门开合（仅首页首次进入） ---------- */
  const boot = document.getElementById('boot');
  const NAV_FLAG = 'dsy-navigated';
  const isInternalNav = () => {
    try { return sessionStorage.getItem(NAV_FLAG) === '1'; } catch (err) { return false; }
  };
  if (boot && isInternalNav()) {
    /* 站内跳转进入：跳过启动动画（页面转场已负责过渡），只留一个特效 */
    boot.classList.add('is-gone');
    document.body.classList.remove('is-booting');
    document.body.classList.add('is-entered');
    typeTitle();
  } else if (boot) {
    const pct = document.getElementById('bootPct');
    const stage = document.getElementById('bootStage');
    const wordEl = document.getElementById('bootWord');
    const blocksEl = document.getElementById('bootBlocks');

    /* 构建字母（DASHUYUNYE 逐个凝聚） */
    const letters = [];
    if (wordEl) {
      for (const ch of 'DASHUYUNYE') {
        const sp = document.createElement('span');
        sp.textContent = ch;
        wordEl.appendChild(sp);
        letters.push(sp);
      }
    }
    /* 构建进度方块 */
    const BLOCKS = 24;
    const cells = [];
    if (blocksEl) {
      for (let i = 0; i < BLOCKS; i++) {
        const b = document.createElement('i');
        blocksEl.appendChild(b);
        cells.push(b);
      }
    }

    const STAGES = [
      [0,  () => 'BUILDING WORLD'],
      [26, () => 'LOADING ASSETS'],
      [50, () => 'VISITOR NODE — LINKED'],
      [74, () => 'ESTABLISHING SIGNAL'],
      [92, () => 'WORLD READY — 欢迎 WELCOME']
    ];
    let p = 0, disp = 0, lastMile = 0, litBlocks = -1;
    let last = performance.now(), stallUntil = 0, lastLabel = '';

    function render() {
      /* 显示值向真实进度缓动，形成 0→100 的顺滑过渡 */
      disp += (p - disp) * 0.16;
      if (p >= 100 && p - disp < 1.2) disp = p;
      const n = Math.min(100, Math.round(disp));
      if (pct) pct.innerHTML = n + '<i>%</i>';
      /* 每跨过 10% 触发一次数字脉冲 */
      const mile = Math.floor(Math.min(100, disp) / 10);
      if (mile > lastMile && pct) {
        lastMile = mile;
        pct.classList.remove('tick');
        void pct.offsetWidth;
        pct.classList.add('tick');
      }
      /* 进度方块点亮（最后 4 块转紫色，预告完成） */
      const lit = Math.floor(Math.min(100, disp) / 100 * BLOCKS);
      if (lit !== litBlocks) {
        litBlocks = lit;
        cells.forEach((c, i) => {
          c.classList.toggle('on', i < lit);
          c.classList.toggle('hot', i < lit && i >= BLOCKS - 4);
        });
      }
      /* 字母随进度逐个凝聚 */
      letters.forEach((sp, i) => sp.classList.toggle('on', disp >= (i + 1) * 9));
      if (stage) {
        let label = STAGES[0][1]();
        for (const st of STAGES) { if (p >= st[0]) label = st[1](); }
        if (label !== lastLabel) { stage.textContent = label; lastLabel = label; }
      }
    }
    function finish() {
      p = 100;
      disp = 100;
      lastMile = 10;
      render();
      setTimeout(() => {
        boot.classList.add('is-done');
        document.body.classList.remove('is-booting');
        document.body.classList.add('is-entered');
        setTimeout(typeTitle, 420);
        setTimeout(() => boot.classList.add('is-gone'), 1500);
      }, 420);
    }
    function tick(now) {
      const dt = Math.min(64, now - last);
      last = now;
      if (now > stallUntil) {
        p += dt * (0.018 + Math.random() * 0.034);
        if (Math.random() < 0.007) stallUntil = now + 110 + Math.random() * 230;
      }
      if (p >= 100) { finish(); return; }
      render();
      requestAnimationFrame(tick);
    }
    if (prefersReduced) {
      finish();
    } else {
      requestAnimationFrame(t => { last = t; tick(t); });
    }
  } else {
    typeTitle();
  }

  /* ---------- 整体科技背景：栅格层 + 双光晕 + 星链粒子 ---------- */
  if (!document.querySelector('.bg-grid')) {
  const g = document.createElement('div');
  g.className = 'bg-grid';
  g.setAttribute('aria-hidden', 'true');
  document.body.prepend(g);
}
if (!document.querySelector('.bg-glow2')) {
  const g2 = document.createElement('div');
  g2.className = 'bg-glow2';
  g2.setAttribute('aria-hidden', 'true');
  document.body.prepend(g2);
}
if (!document.querySelector('.bg-glow')) {
  const glow = document.createElement('div');
  glow.className = 'bg-glow';
  glow.setAttribute('aria-hidden', 'true');
  document.body.prepend(glow);
}
  

  const canvas = document.getElementById('bgParticles');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let W, H, dots = [];
    let mx = -9999, my = -9999;
    const COUNT = window.innerWidth < 768 ? 60 : 92;
    const LINK = 170;
    function resize() {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
    }
    function seed() {
      dots = Array.from({ length: COUNT }, () => ({
        x: Math.random() * W,
        y: Math.random() * H,
        r: Math.random() * 1.8 + 0.5,
        vx: (Math.random() - 0.5) * 0.14,
        vy: -(Math.random() * 0.12 + 0.04),
        a: Math.random() * 0.4 + 0.22,
        tw: 0.4 + Math.random() * 0.6,
        ph: Math.random() * Math.PI * 2,
        c: Math.random() > 0.82 ? '168, 85, 247' : '0, 229, 255'
      }));
    }
    window.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; }, { passive: true });
    function draw(now) {
      ctx.clearRect(0, 0, W, H);
      for (let i = 0; i < dots.length; i++) {
        const d = dots[i];
        for (let j = i + 1; j < dots.length; j++) {
          const b = dots[j];
          const dx = d.x - b.x, dy = d.y - b.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < LINK * LINK) {
            const al = (1 - Math.sqrt(d2) / LINK) * 0.16;
            ctx.strokeStyle = 'rgba(0, 229, 255,' + al.toFixed(3) + ')';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(d.x, d.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
        const mdx = d.x - mx, mdy = d.y - my;
        const md2 = mdx * mdx + mdy * mdy;
        if (md2 < 200 * 200) {
          const md = Math.sqrt(md2) || 1;
          const al = (1 - md / 200) * 0.32;
          ctx.strokeStyle = 'rgba(0, 229, 255,' + al.toFixed(3) + ')';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(d.x, d.y);
          ctx.lineTo(mx, my);
          ctx.stroke();
          d.x += (mdx / md) * 0.5;
          d.y += (mdy / md) * 0.5;
        }
      }
      dots.forEach(d => {
        d.x += d.vx; d.y += d.vy;
        if (d.y < -12) { d.y = H + 12; d.x = Math.random() * W; }
        if (d.x < -12) d.x = W + 12;
        if (d.x > W + 12) d.x = -12;
        const a = d.a * (0.72 + 0.28 * Math.sin(now * 0.001 * d.tw + d.ph));
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(' + d.c + ',' + a.toFixed(3) + ')';
        ctx.fill();
      });
      requestAnimationFrame(draw);
    }
    resize(); seed();
    requestAnimationFrame(t => { draw(t); });
    window.addEventListener('resize', () => { resize(); seed(); });
  }

  /* ---------- 页面转场 v2：斜切遮罩 + 传送文字 + 能量条 ---------- */
  const wipe = document.getElementById('pageWipe');
  if (wipe) {
    const WIPE_WORDS = ['LOADING WORLD', 'SYNCING SIGNAL', 'BUILDING SPACE', 'ESTABLISHING LINK', 'TELEPORTING ...'];
    const pickWord = () => WIPE_WORDS[Math.floor(Math.random() * WIPE_WORDS.length)];
    if (!wipe.querySelector('.pw-core')) {
      wipe.innerHTML = '<div class="pw-core" aria-hidden="true">' +
        '<p class="pw-word mono">' + pickWord() + '</p>' +
        '<div class="pw-bar"><i></i></div>' +
        '</div>';
    }
    const pwWord = wipe.querySelector('.pw-word');

    /* 进入页面：先盖住，再向下滑出揭示内容 */
    wipe.classList.add('is-cover');
    requestAnimationFrame(() => requestAnimationFrame(() => {
      wipe.classList.add('is-leave');
    }));
    wipe.addEventListener('transitionend', () => {
      if (wipe.classList.contains('is-leave')) wipe.classList.add('is-done');
    });

    /* 点站内链接：遮罩向上盖住 → 换页 */
    document.addEventListener('click', e => {
      const a = e.target.closest('a[href]');
      if (!a || a.target === '_blank') return;
      const href = a.getAttribute('href');
      if (!href || !/\.html$/.test(href)) return;
      e.preventDefault();
      if (pwWord) pwWord.textContent = pickWord();
      try { sessionStorage.setItem(NAV_FLAG, '1'); } catch (err) {}
      wipe.classList.remove('is-leave', 'is-done');
      void wipe.offsetWidth;
      wipe.classList.add('is-in');
      setTimeout(() => { window.location.href = href; }, 540);
    });

    /* 浏览器后退（bfcache 恢复）时重放出场动画，避免遮罩卡死 */
    window.addEventListener('pageshow', e => {
      if (!e.persisted) return;
      wipe.classList.remove('is-in', 'is-done');
      wipe.classList.add('is-cover');
      requestAnimationFrame(() => requestAnimationFrame(() => {
        wipe.classList.add('is-leave');
      }));
    });
  }

  /* ---------- HUD 时钟 ---------- */
  const clock = document.getElementById('hudClock');
  if (clock) {
    const tickClock = () => {
      const d = new Date();
      clock.textContent = [d.getHours(), d.getMinutes(), d.getSeconds()]
        .map(n => String(n).padStart(2, '0')).join(':');
    };
    tickClock();
    setInterval(tickClock, 1000);
  }

  /* ---------- 自定义光标（准星）+ 信号丝带拖尾（canvas） ---------- */
  const dot = document.getElementById('cursorDot');
  const ringEl = document.getElementById('cursorRing');
  if (dot && ringEl) {
    const aura = document.createElement('div');
    aura.className = 'cursor-aura';
    aura.setAttribute('aria-hidden', 'true');
    document.body.appendChild(aura);

    /* 丝带拖尾画布 */
    const fx = document.createElement('canvas');
    fx.id = 'fxCanvas';
    fx.setAttribute('aria-hidden', 'true');
    document.body.appendChild(fx);
    const fctx = fx.getContext('2d');
    let FW = 0, FH = 0;
    const sizeFx = () => { FW = fx.width = window.innerWidth; FH = fx.height = window.innerHeight; };
    sizeFx();
    window.addEventListener('resize', sizeFx);

    let mx = -100, my = -100, rx = -100, ry = -100, ax = -100, ay = -100;
    const pts = [];
    window.addEventListener('pointermove', e => {
      if (e.pointerType === 'touch') return;
      mx = e.clientX; my = e.clientY;
      dot.style.transform = 'translate(' + mx + 'px,' + my + 'px) translate(-50%,-50%)';
      const last = pts[pts.length - 1];
      if (!last || Math.hypot(mx - last.x, my - last.y) > 6) {
        pts.push({ x: mx + (Math.random() * 10 - 5), y: my + (Math.random() * 10 - 5), life: 1 });
        if (pts.length > 26) pts.shift();
      }
    }, { passive: true });

    (function drawFx() {
      fctx.clearRect(0, 0, FW, FH);
      for (let i = pts.length - 1; i >= 0; i--) {
        pts[i].life -= 0.03;
        if (pts[i].life <= 0) pts.splice(i, 1);
      }
      if (pts.length > 2) {
        fctx.lineCap = 'round';
        fctx.lineJoin = 'round';
        for (let i = 1; i < pts.length; i++) {
          const p0 = pts[i - 1], p1 = pts[i];
          const t = i / pts.length;
          fctx.strokeStyle = 'rgba(0, 229, 255, ' + (0.55 * t * p1.life).toFixed(3) + ')';
          fctx.lineWidth = 5.5 * t + 0.4;
          fctx.beginPath();
          fctx.moveTo(p0.x, p0.y);
          fctx.lineTo(p1.x, p1.y);
          fctx.stroke();
          if (i % 6 === 0) {
            fctx.fillStyle = 'rgba(168, 85, 247, ' + (0.5 * t * p1.life).toFixed(3) + ')';
            fctx.beginPath();
            fctx.arc(p1.x, p1.y, 2.2, 0, Math.PI * 2);
            fctx.fill();
          }
        }
      }
      rx += (mx - rx) * 0.16;
      ry += (my - ry) * 0.16;
      ringEl.style.transform = 'translate(' + rx + 'px,' + ry + 'px) translate(-50%,-50%)';
      ax += (mx - ax) * 0.08;
      ay += (my - ay) * 0.08;
      aura.style.transform = 'translate(' + ax + 'px,' + ay + 'px) translate(-50%,-50%)';
      requestAnimationFrame(drawFx);
    })();
    document.querySelectorAll('a, button, .identity-btn, .case-card').forEach(el => {
      el.addEventListener('mouseenter', () => ringEl.classList.add('is-hover'));
      el.addEventListener('mouseleave', () => ringEl.classList.remove('is-hover'));
    });
  }
  /* ---------- 点击特效：冲击环 + 火花迸射（全站，贴合信号/能量风格） ---------- */
  document.addEventListener('pointerdown', e => {
  const x = e.clientX, y = e.clientY;
  const ringC = document.createElement('span');
  ringC.className = 'click-ring';
  ringC.style.left = x + 'px';
  ringC.style.top = y + 'px';
  document.body.appendChild(ringC);
  ringC.addEventListener('animationend', () => ringC.remove());
  const n = 14;
  for (let i = 0; i < n; i++) {
    const sp = document.createElement('span');
    const ang = (Math.PI * 2 * i / n) + Math.random() * 0.5;
    const dist = 40 + Math.random() * 66;
    sp.className = 'click-spark' + (Math.random() > 0.7 ? ' t-purple' : '');
    sp.style.left = x + 'px';
    sp.style.top = y + 'px';
    sp.style.setProperty('--dx', (Math.cos(ang) * dist).toFixed(1) + 'px');
    sp.style.setProperty('--dy', (Math.sin(ang) * dist).toFixed(1) + 'px');
    document.body.appendChild(sp);
    sp.addEventListener('animationend', () => sp.remove());
  }
});
  

  /* ---------- 按钮点击涟漪 ---------- */
  const RIPPLE_SEL = '.btn-line, .term-btn, .tier-btn, .topbar-cta, .btn-ghost';
  document.addEventListener('click', e => {
  const btn = e.target.closest(RIPPLE_SEL);
  if (!btn) return;
  const rect = btn.getBoundingClientRect();
  const d = Math.max(rect.width, rect.height) * 2;
  const r = document.createElement('span');
  r.className = 'ripple';
  r.style.width = r.style.height = d + 'px';
  r.style.left = (e.clientX - rect.left - d / 2) + 'px';
  r.style.top = (e.clientY - rect.top - d / 2) + 'px';
  btn.appendChild(r);
  r.addEventListener('animationend', () => r.remove());
});
  

  /* ---------- 移动端汉堡导航 ---------- */
  const navBurger = document.getElementById('navBurger');
  const mMenu = document.getElementById('mMenu');
  if (navBurger && mMenu) {
    const setMenu = open => {
      mMenu.classList.toggle('is-open', open);
      navBurger.classList.toggle('is-open', open);
      navBurger.setAttribute('aria-expanded', String(open));
      mMenu.setAttribute('aria-hidden', String(!open));
      document.body.classList.toggle('menu-lock', open);
    };
    navBurger.addEventListener('click', () => setMenu(!mMenu.classList.contains('is-open')));
    const mClose = document.getElementById('mClose');
    if (mClose) mClose.addEventListener('click', () => setMenu(false));
    mMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setMenu(false)));
  }

  /* ---------- 微信号码复制（toast 提示）+ 放大二维码弹窗 ---------- */
  const qrModal = document.getElementById('qrModal');
  const termOut = document.getElementById('termOut');
  const WX_ID = 'CorinLin';

  function openQr() {
    if (!qrModal) return;
    qrModal.classList.add('is-on');
    qrModal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('menu-lock');
  }
  function closeQr() {
    if (!qrModal) return;
    qrModal.classList.remove('is-on');
    qrModal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('menu-lock');
  }

  // 复制到剪贴板（含非安全上下文降级方案）
  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).catch(() => fallbackCopy(text));
    } else {
      fallbackCopy(text);
    }
  }
  function copyWx() { copyText(WX_ID); }
  function fallbackCopy(text) {
    try {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.cssText = 'position:fixed;opacity:0;top:0;left:0;';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    } catch (err) { /* 静默失败，二维码仍可手动扫码 */ }
  }

  // toast 提示：点击后浮现，2.4 秒后自动消失
  let wxToast = null, wxToastTimer = null;
  function showToast(msg) {
    if (!wxToast) {
      wxToast = document.createElement('div');
      wxToast.className = 'wx-toast mono';
      wxToast.setAttribute('role', 'status');
      document.body.appendChild(wxToast);
    }
    wxToast.innerHTML = msg;
    requestAnimationFrame(() => wxToast.classList.add('is-on'));
    clearTimeout(wxToastTimer);
    wxToastTimer = setTimeout(() => wxToast.classList.remove('is-on'), 2400);
  }
  function showWxToast() { showToast('已复制微信号 <b>' + WX_ID + '</b>'); }

  document.querySelectorAll('[data-wechat]').forEach(el => {
    el.addEventListener('click', () => {
      copyWx();
      showWxToast();
      if (el.id === 'wechatBtn' && termOut) termOut.textContent = '> 微信号已复制：' + WX_ID;
      openQr();
    });
  });

  // 社交图标：抖音号等纯号码点击复制（手机尝试唤起 App，电脑跳网页）
  document.querySelectorAll('[data-copy-id]').forEach(el => {
    el.addEventListener('click', () => {
      const v = el.getAttribute('data-copy-id');
      const label = el.getAttribute('data-copy-label') || '号码';
      copyText(v);
      showToast('已复制' + label + ' <b>' + v + '</b>');
      const url = el.getAttribute('data-open');
      if (!url) return;
      const scheme = el.getAttribute('data-app');
      if (scheme && /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent)) {
        // 手机：先尝试唤起抖音 App，1.4s 内未离开页面则回退网页版
        let left = false;
        const onHide = () => { if (document.hidden) left = true; };
        document.addEventListener('visibilitychange', onHide);
        setTimeout(() => {
          document.removeEventListener('visibilitychange', onHide);
          if (!left && !document.hidden) window.open(url, '_blank', 'noopener');
        }, 1400);
        window.location.href = scheme;
      } else {
        window.open(url, '_blank', 'noopener');
      }
    });
  });

  if (qrModal) {
    const qrMask = document.getElementById('qrMask');
    const qrClose = document.getElementById('qrClose');
    if (qrMask) qrMask.addEventListener('click', closeQr);
    if (qrClose) qrClose.addEventListener('click', closeQr);
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && qrModal.classList.contains('is-on')) closeQr();
    });
  }

  /* ---------- 邮件表单（mailto 直达大叔邮箱） ---------- */
  const mailForm = document.getElementById('mailForm');
  if (mailForm) {
    const formOut = document.getElementById('formOut');
    mailForm.addEventListener('submit', e => {
      e.preventDefault();
      if (!mailForm.checkValidity()) {
        mailForm.reportValidity();
        if (formOut) formOut.textContent = '> 请先填完必填项 PLEASE FILL REQUIRED FIELDS';
        return;
      }
      const f = new FormData(mailForm);
      const subject = encodeURIComponent('【大叔云页】来自 ' + f.get('name') + ' 的建站需求 · ' + f.get('world'));
      const body = encodeURIComponent(
        '称呼 NAME：' + f.get('name') + '\n' +
        '联系方式 CONTACT：' + f.get('contact') + '\n' +
        '选择世界 WORLD：' + f.get('world') + '\n\n' +
        '想构建的世界 MESSAGE：\n' + f.get('msg') + '\n\n— 来自大叔云页官网表单'
      );
      if (formOut) formOut.textContent = '> 正在打开邮件客户端 OPENING MAIL CLIENT ...';
      window.location.href = 'mailto:admin@dsriji.com?subject=' + subject + '&body=' + body;
    });
  }

  /* ---------- 回到顶部 ---------- */
  const toTop = document.getElementById('toTop');
  if (toTop) toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  /* ---------- 案例详情页渲染 ---------- */
  const casePage = document.body.dataset.case;
  if (casePage && window.DSY) {
    const data = window.DSY.CASES.find(c => c.slug === casePage);
    if (data) {
      document.querySelectorAll('[data-case-field]').forEach(el => {
        const field = el.dataset.caseField;
        if (field === 'points') {
          el.innerHTML = data.zh.points.map(pt => '<li>' + pt + '</li>').join('');
        } else if (data.zh[field] !== undefined) {
          el.textContent = data.zh[field];
        }
      });
    }
  }

  /* 案例列表页：填充卡片标题 */
  if (document.body.dataset.page === 'cases' && window.DSY) {
    document.querySelectorAll('[data-case-title]').forEach(el => {
      const c = window.DSY.CASES.find(x => x.slug === el.dataset.caseTitle);
      if (c) el.textContent = c.zh.title;
    });
  }
})();
