/* ============================================================
   sound.js — 全局背景音乐 + 鼠标点击音效（原创音频，本地文件）
   - BGM: assets/audio/bgm.mp3（进入页面即尝试自动播放，循环）
   - 换页不中断：播放进度实时写入 sessionStorage，新页面从上次
     进度续播，听感连续
   - SFX: assets/audio/click.mp3（每次点击播放，随机微变调）
   - 右下角声音开关，localStorage 记忆偏好（dsy-sound: on/off）
   ============================================================ */
(function () {
  'use strict';

  var KEY = 'dsy-sound';        // 声音开关偏好
  var TIME_KEY = 'dsy-bgm-time';// BGM 播放进度（跨页面续播）
  var enabled = true;
  try { enabled = localStorage.getItem(KEY) !== 'off'; } catch (e) { /* 隐私模式忽略 */ }

  var bgm = null, clickSfx = null, started = false;

  function makeAudio(src, vol) {
    var a = new Audio(src);
    a.volume = vol;
    a.preload = 'auto';
    return a;
  }

  function saveTime() {
    if (!bgm || bgm.paused) return;
    try { sessionStorage.setItem(TIME_KEY, String(bgm.currentTime || 0)); } catch (e) {}
  }

  function ensureAudio() {
    if (bgm) return;
    bgm = makeAudio('assets/audio/bgm.mp3', 0.32);
    bgm.loop = true;
    clickSfx = makeAudio('assets/audio/click.mp3', 0.22);
    // 换页续播：定时保存进度
    bgm.addEventListener('timeupdate', saveTime);
    window.addEventListener('pagehide', saveTime);
    window.addEventListener('beforeunload', saveTime);
    // 恢复上次播放位置
    try {
      var t = parseFloat(sessionStorage.getItem(TIME_KEY));
      if (t > 0 && isFinite(t)) {
        var seek = function () { try { bgm.currentTime = t % bgm.duration; } catch (e) {} };
        if (bgm.readyState >= 1) seek();
        else bgm.addEventListener('loadedmetadata', seek, { once: true });
      }
    } catch (e) {}
  }

  function startBgm() {
    if (!enabled) return;
    ensureAudio();
    var p = bgm.play();
    if (p && p.catch) p.catch(function () { started = false; });
    else started = true;
  }

  function playClick() {
    if (!enabled) return;
    ensureAudio();
    try {
      var s = clickSfx.cloneNode();
      s.volume = 0.16 + Math.random() * 0.08;          // 音量微随机
      s.playbackRate = 0.94 + Math.random() * 0.12;    // 音调微随机，避免机械感
      var p = s.play();
      if (p && p.catch) p.catch(function () {});
    } catch (err) { /* 静默失败 */ }
  }

  // ---------- 声音开关按钮 ----------
  var btn = document.createElement('button');
  btn.id = 'soundToggle';
  btn.type = 'button';
  btn.className = 'mono';
  btn.setAttribute('aria-pressed', enabled ? 'true' : 'false');
  btn.title = enabled ? '关闭声音' : '开启声音';
  btn.innerHTML = '<span class="st-ico" aria-hidden="true">&#9834;</span><span class="st-txt">' + (enabled ? 'SOUND ON' : 'SOUND OFF') + '</span>';
  document.body.appendChild(btn);

  function renderBtn() {
    btn.setAttribute('aria-pressed', enabled ? 'true' : 'false');
    btn.classList.toggle('is-off', !enabled);
    btn.title = enabled ? '关闭声音' : '开启声音';
    btn.querySelector('.st-txt').textContent = enabled ? 'SOUND ON' : 'SOUND OFF';
  }

  btn.addEventListener('click', function (e) {
    e.stopPropagation();
    enabled = !enabled;
    try { localStorage.setItem(KEY, enabled ? 'on' : 'off'); } catch (err) {}
    renderBtn();
    if (enabled) { started = false; startBgm(); }
    else if (bgm) { bgm.pause(); started = false; }
  });

  // ---------- 启动策略 ----------
  // 1) 进入页面立即尝试自动播放（浏览器允许则无感响起，进度无缝续接）
  if (enabled) { started = false; startBgm(); }

  // 2) 若被自动播放策略拦截，则在首次交互时启动
  document.addEventListener('pointerdown', function (e) {
    if (e.target.closest && e.target.closest('#soundToggle')) return;
    if (enabled && !started) { ensureAudio(); startBgm(); }
    playClick();
  }, true);

  // 3) 页面从后台回到前台时，若已开启则续播
  document.addEventListener('visibilitychange', function () {
    if (!document.hidden && enabled && bgm && bgm.paused) {
      var p = bgm.play(); if (p && p.catch) p.catch(function () {});
    }
  });

  renderBtn();
})();
