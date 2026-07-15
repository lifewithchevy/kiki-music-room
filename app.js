/* ═══════════════════════════════════════════════════════════
   KIKI — Music Room Engine
   ═══════════════════════════════════════════════════════════ */

const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
const audioEl  = new Audio();
audioEl.crossOrigin = 'anonymous';

let mediaSource = null, musicGain = null;
let analyser = null, vuData = null;
let crackleNode = null, crackleGain = null;
let crackleEnabled = true;

function ensureAudioGraph() {
    if (mediaSource) return;
    mediaSource = audioCtx.createMediaElementSource(audioEl);
    musicGain   = audioCtx.createGain();
    musicGain.gain.value = Number(volumeSlider.value) / 100;

    const warm = audioCtx.createBiquadFilter();
    warm.type = 'lowshelf';
    warm.frequency.value = 320;
    warm.gain.value = 4;

    const rolloff = audioCtx.createBiquadFilter();
    rolloff.type = 'highshelf';
    rolloff.frequency.value = 7000;
    rolloff.gain.value = -5;

    analyser = audioCtx.createAnalyser();
    analyser.fftSize = 512;
    vuData = new Uint8Array(analyser.frequencyBinCount);

    mediaSource.connect(warm).connect(rolloff).connect(musicGain)
               .connect(analyser).connect(audioCtx.destination);
}

function startCrackle() {
    if (crackleNode || !crackleEnabled) return;
    const len = audioCtx.sampleRate * 4;
    const buf = audioCtx.createBuffer(1, len, audioCtx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) {
        const base = (Math.random() * 2 - 1) * 0.012;
        const pop  = Math.random() < 0.00025 ? (Math.random() * 2 - 1) * 0.45 : 0;
        const tick = Math.random() < 0.0008  ? (Math.random() * 2 - 1) * 0.12 : 0;
        d[i] = base + pop + tick;
    }
    crackleNode = audioCtx.createBufferSource();
    crackleNode.buffer = buf;
    crackleNode.loop = true;

    crackleGain = audioCtx.createGain();
    crackleGain.gain.value = 0.22 * (Number(volumeSlider.value) / 100);

    const band = audioCtx.createBiquadFilter();
    band.type = 'bandpass';
    band.frequency.value = 1800;
    band.Q.value = 0.6;

    crackleNode.connect(band).connect(crackleGain).connect(audioCtx.destination);
    crackleNode.start();
}

function stopCrackle() {
    try { crackleNode?.stop(); } catch(_) {}
    crackleNode?.disconnect();
    crackleGain?.disconnect();
    crackleNode = crackleGain = null;
}

/* ═══ State ═══ */
const playlist = [];       // flat: { id, name, url, color }
let currentTrackIdx = -1;
let isPlaying  = false;
let isPowered  = false;
let speed      = 33;
let busy       = false;
let platterAnim = null;

const sleep = ms => new Promise(r => setTimeout(r, ms));

function ensurePlatterAnim() {
    if (platterAnim) return platterAnim;
    platterAnim = record.animate(
        [{ transform: 'rotate(0deg)' }, { transform: 'rotate(360deg)' }],
        { duration: 1820, iterations: Infinity, easing: 'linear' }
    );
    platterAnim.playbackRate = 0;
    return platterAnim;
}

function rampPlatter(target, duration = 1500) {
    ensurePlatterAnim();
    const start = platterAnim.playbackRate;
    const t0 = performance.now();
    return new Promise(resolve => {
        function step() {
            const elapsed = performance.now() - t0;
            const t = Math.min(1, elapsed / duration);
            const e = t * t * (3 - 2 * t);
            platterAnim.playbackRate = start + (target - start) * e;
            if (t < 1) requestAnimationFrame(step);
            else resolve();
        }
        step();
    });
}

function playStylusDrop() {
    if (audioCtx.state === 'suspended') return;
    const t = audioCtx.currentTime;
    const thumpBuf = audioCtx.createBuffer(1, audioCtx.sampleRate * 0.12, audioCtx.sampleRate);
    const td = thumpBuf.getChannelData(0);
    for (let i = 0; i < td.length; i++) {
        td[i] = (Math.random() * 2 - 1) * Math.exp(-i / 800);
    }
    const tSrc = audioCtx.createBufferSource();
    tSrc.buffer = thumpBuf;
    const tFilt = audioCtx.createBiquadFilter();
    tFilt.type = 'lowpass';
    tFilt.frequency.value = 600;
    const tGain = audioCtx.createGain();
    tGain.gain.value = 0.5 * (Number(volumeSlider.value) / 100);
    tSrc.connect(tFilt).connect(tGain).connect(audioCtx.destination);
    tSrc.start(t);
}

function playMotorStart() {
    if (audioCtx.state === 'suspended') return;
    const t = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(40, t);
    osc.frequency.linearRampToValueAtTime(60, t + 0.6);
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.03 * (Number(volumeSlider.value) / 100), t + 0.2);
    gain.gain.linearRampToValueAtTime(0, t + 1.4);
    osc.connect(gain).connect(audioCtx.destination);
    osc.start(t);
    osc.stop(t + 1.5);
}

/* ═══ DOM refs ═══ */
const $ = id => document.getElementById(id);

const record        = $('record');
const tonearm       = $('tonearm');
const powerBtn      = $('powerBtn');
const labelDisc     = $('labelDisc');
const labelArtist   = $('labelArtist');
const labelAlbum    = $('labelAlbum');
const tbArt         = $('tbArt');
const tbTrack       = $('tbTrack');
const tbArtist      = $('tbArtist');
const playBtn       = $('playBtn');
const playIcon      = $('playIcon');
const pauseIcon     = $('pauseIcon');
const prevBtn       = $('prevBtn');
const nextBtn       = $('nextBtn');
const progressFill  = $('progressFill');
const progressHead  = $('progressHead');
const progressTrack = $('progressTrack');
const currentTimeEl = $('currentTime');
const totalTimeEl   = $('totalTime');
const volumeSlider  = $('volumeSlider');
const crackleToggle = $('crackleToggle');
const searchInput   = $('searchInput');
const vuBars        = document.querySelectorAll('.vu-bar');
const sidebarFiles  = $('sidebarFiles');
const trackListEl   = $('trackList');
const uploadHint    = $('uploadHint');

/* ═══ Helpers ═══ */
const fmt = s => !s || isNaN(s)
    ? '0:00'
    : `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

function adjustHex(hex, amt) {
    const c = hex.replace('#', '');
    const n = c.length === 3 ? c.split('').map(x=>x+x).join('') : c;
    const r = Math.max(0, Math.min(255, parseInt(n.slice(0,2),16) + amt));
    const g = Math.max(0, Math.min(255, parseInt(n.slice(2,4),16) + amt));
    const b = Math.max(0, Math.min(255, parseInt(n.slice(4,6),16) + amt));
    return `#${[r,g,b].map(v=>v.toString(16).padStart(2,'0')).join('')}`;
}

const lighten = (hex, n) => adjustHex(hex, n);
const darken  = (hex, n) => adjustHex(hex, -n);

function gradientFor(color) {
    return `linear-gradient(145deg, ${lighten(color, 25)}, ${color} 50%, ${darken(color, 35)})`;
}

function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, c => ({
        '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
    }[c]));
}

/* ═══ Transport bar sleeve art ═══ */
function updateTbArt(track) {
    const g = gradientFor(track.color);
    tbArt.innerHTML = `
        <div class="tb-sleeve-wrap" style="background:${g}">
            <div class="tb-sleeve-shine"></div>
            <div class="tb-sleeve-vinyl"></div>
            <div class="tb-sleeve-label">
                <div class="tb-sleeve-title">${escapeHtml(track.name)}</div>
                <div class="tb-sleeve-artist">Kiki</div>
            </div>
        </div>`;
}

/* ═══ Volume ═══ */
volumeSlider.addEventListener('input', () => {
    const v = Number(volumeSlider.value) / 100;
    if (musicGain)   musicGain.gain.value = v;
    if (crackleGain) crackleGain.gain.value = 0.22 * v;
});

/* ═══ Crackle toggle ═══ */
crackleToggle.addEventListener('click', () => {
    crackleEnabled = !crackleEnabled;
    crackleToggle.dataset.on = crackleEnabled;
    if (!crackleEnabled) stopCrackle();
    else if (isPlaying)  startCrackle();
});

/* ═══ Progress / VU loop ═══ */
let rafId = null;

function tick() {
    if (audioEl.duration) {
        const pct = (audioEl.currentTime / audioEl.duration) * 100;
        progressFill.style.width = pct + '%';
        progressHead.style.left  = pct + '%';
        currentTimeEl.textContent = fmt(audioEl.currentTime);
        totalTimeEl.textContent   = fmt(audioEl.duration);
    }
    if (analyser && isPlaying) {
        analyser.getByteFrequencyData(vuData);
        let sum = 0;
        for (let i = 0; i < 32; i++) sum += vuData[i];
        const avg = sum / 32;
        const litCount = Math.min(8, Math.round((avg / 200) * 8));
        vuBars.forEach((b, i) => b.classList.toggle('lit', i < litCount));
    } else {
        vuBars.forEach(b => b.classList.remove('lit'));
    }
    if (isPlaying) rafId = requestAnimationFrame(tick);
}

progressTrack.addEventListener('click', e => {
    if (!audioEl.duration) return;
    const r = progressTrack.getBoundingClientRect();
    audioEl.currentTime = ((e.clientX - r.left) / r.width) * audioEl.duration;
});

/* ═══ Render sidebar track list ═══ */
function renderTrackList(filter = '') {
    if (!trackListEl) return;
    const countEl = document.getElementById('trackCount');
    if (countEl) countEl.textContent = playlist.length ? `${playlist.length} song${playlist.length !== 1 ? 's' : ''}` : '';
    const list = filter
        ? playlist.filter(t => t.name.toLowerCase().includes(filter.toLowerCase()))
        : playlist;

    if (list.length === 0) {
        trackListEl.innerHTML = `<div class="track-empty">${
            playlist.length === 0
                ? 'Upload songs to begin'
                : 'No results'
        }</div>`;
        return;
    }

    trackListEl.innerHTML = list.map((t, i) => {
        const realIdx = playlist.indexOf(t);
        const isActive = realIdx === currentTrackIdx;
        return `<div class="track-item ${isActive ? 'active' : ''}" data-idx="${realIdx}">
            <span class="track-num">${String(i + 1).padStart(2, '0')}</span>
            <span class="track-name">${escapeHtml(t.name)}</span>
        </div>`;
    }).join('');

    trackListEl.querySelectorAll('.track-item').forEach(el => {
        el.addEventListener('click', () => {
            const idx = parseInt(el.dataset.idx);
            if (idx === currentTrackIdx) {
                if (isPlaying) stopPlayback();
                else if (!busy) beginPlayback();
            } else {
                loadTrack(idx, true);
            }
        });
    });

    const activeEl = trackListEl.querySelector('.active');
    if (activeEl) activeEl.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
}

searchInput?.addEventListener('input', () => renderTrackList(searchInput.value));

/* ═══ Load a track onto the platter ═══ */
async function loadTrack(idx, autoPlay = false) {
    if (idx < 0 || idx >= playlist.length) return;
    if (isPlaying) await stopPlayback();

    currentTrackIdx = idx;
    const track = playlist[idx];

    labelDisc.style.background = track.color;
    labelDisc.style.setProperty('--label-color', track.color);
    labelArtist.textContent = track.name;
    labelAlbum.textContent  = '';

    updateTbArt(track);
    tbTrack.textContent  = track.name;
    tbArtist.textContent = 'Kiki';

    record.classList.remove('settling');
    record.classList.add('loaded', 'dropping');
    if (platterAnim) platterAnim.pause();
    setTimeout(() => {
        record.classList.remove('dropping');
        record.classList.add('settling');
        setTimeout(() => record.classList.remove('settling'), 400);
        if (platterAnim) platterAnim.play();
    }, 850);

    renderTrackList();

    if (autoPlay) {
        await sleep(900);
        if (!isPowered) togglePower(true);
        beginPlayback();
    }
}

/* ═══ Power ═══ */
function togglePower(force) {
    isPowered = force !== undefined ? force : !isPowered;
    powerBtn.classList.toggle('on', isPowered);
    document.querySelector('.platter').classList.toggle('powered', isPowered);
    if (!isPowered && isPlaying) stopPlayback();
}

const platterEl       = document.querySelector('.platter');
const tonearmAssembly = document.getElementById('tonearmAssembly');
const motorStatus     = document.getElementById('motorStatus');

/* ═══ Begin playback (choreographed) ═══ */
async function beginPlayback() {
    if (busy) return;
    if (currentTrackIdx < 0 || !playlist[currentTrackIdx]) return;
    busy = true;

    if (!isPowered) togglePower(true);
    if (audioCtx.state === 'suspended') await audioCtx.resume();
    ensureAudioGraph();

    motorStatus.classList.add('running');
    playMotorStart();

    const target = speed === 45 ? 1.35 : 1.0;
    const platterRamp = rampPlatter(target, 1100);

    await sleep(250);
    tonearm.classList.add('cued-up');
    await sleep(450);
    tonearm.classList.add('over-record-up');
    await sleep(900);
    tonearm.classList.remove('cued-up', 'over-record-up');
    tonearm.classList.add('over-record');
    playStylusDrop();
    await sleep(450);

    const track = playlist[currentTrackIdx];
    audioEl.src = track.url;
    try {
        await audioEl.play();
        isPlaying = true;
        startCrackle();
        updatePlayUI();
        cancelAnimationFrame(rafId);
        rafId = requestAnimationFrame(tick);
        tbTrack.textContent  = track.name;
        tbArtist.textContent = 'Kiki';
    } catch (err) {
        console.warn('Playback failed:', err);
    }

    await platterRamp;
    busy = false;
}

/* ═══ Stop playback (choreographed) ═══ */
async function stopPlayback() {
    if (!isPlaying && !tonearm.classList.contains('over-record')) return;
    busy = true;

    isPlaying = false;
    audioEl.pause();
    stopCrackle();
    cancelAnimationFrame(rafId);
    updatePlayUI();
    vuBars.forEach(b => b.classList.remove('lit'));

    tonearm.classList.remove('over-record');
    tonearm.classList.add('over-record-up');
    await sleep(350);

    tonearm.classList.remove('over-record-up');
    tonearm.classList.add('cued-up');
    await sleep(800);

    tonearm.classList.remove('cued-up');
    await sleep(350);

    motorStatus.classList.remove('running');
    await rampPlatter(0, 1300);

    busy = false;
}

function updatePlayUI() {
    playIcon.style.display  = isPlaying ? 'none'  : 'block';
    pauseIcon.style.display = isPlaying ? 'block' : 'none';
}

/* ═══ Controls ═══ */
powerBtn.addEventListener('click', () => togglePower());

tonearmAssembly.addEventListener('click', () => {
    if (currentTrackIdx < 0 || busy) return;
    isPlaying ? stopPlayback() : beginPlayback();
});

playBtn.addEventListener('click', () => {
    if (currentTrackIdx < 0 || busy) return;
    isPlaying ? stopPlayback() : beginPlayback();
});

prevBtn.addEventListener('click', () => {
    if (currentTrackIdx < 0) return;
    if (audioEl.currentTime > 3 && isPlaying) {
        audioEl.currentTime = 0;
        return;
    }
    if (currentTrackIdx > 0) {
        currentTrackIdx--;
        const t = playlist[currentTrackIdx];
        if (isPlaying) {
            audioEl.src = t.url;
            audioEl.play().catch(() => {});
            tbTrack.textContent = t.name;
            updateTbArt(t);
            labelDisc.style.background = t.color;
            labelDisc.style.setProperty('--label-color', t.color);
            labelArtist.textContent = t.name;
        }
        renderTrackList();
    }
});

nextBtn.addEventListener('click', () => {
    if (currentTrackIdx < 0) return;
    if (currentTrackIdx < playlist.length - 1) {
        currentTrackIdx++;
        const t = playlist[currentTrackIdx];
        if (isPlaying) {
            audioEl.src = t.url;
            audioEl.play().catch(() => {});
            tbTrack.textContent = t.name;
            updateTbArt(t);
            labelDisc.style.background = t.color;
            labelDisc.style.setProperty('--label-color', t.color);
            labelArtist.textContent = t.name;
        }
        renderTrackList();
    }
});

// Speed dial (circular)
document.getElementById('speedDial')?.addEventListener('click', () => {
    const dial = document.getElementById('speedDial');
    const next = dial.dataset.speed === '33' ? '45' : '33';
    dial.dataset.speed = next;
    speed = parseInt(next);
    dial.querySelector('.ctrl-dial-ptr').style.setProperty('--pa', next === '33' ? '-45deg' : '-135deg');
    dial.querySelectorAll('.cdm').forEach(m => m.classList.toggle('active', m.dataset.val === next));
    if (platterAnim && platterAnim.playbackRate > 0)
        rampPlatter(speed === 45 ? 1.35 : 1.0, 600);
});

// Size dial
document.getElementById('sizeDial')?.addEventListener('click', () => {
    const dial = document.getElementById('sizeDial');
    const next = dial.dataset.size === '12' ? '7' : '12';
    dial.dataset.size = next;
    dial.querySelector('.ctrl-dial-ptr').style.setProperty('--pa', next === '7' ? '-45deg' : '-135deg');
    dial.querySelectorAll('.cdm').forEach(m => m.classList.toggle('active', m.dataset.val === next));
});

// Bluetooth button
document.getElementById('btBtn')?.addEventListener('click', () => {
    document.getElementById('btBtn').classList.toggle('active');
});

/* ═══ Auto-advance when track ends (loops back to the start after the last track) ═══ */
audioEl.addEventListener('ended', async () => {
    if (playlist.length === 0) return;
    currentTrackIdx = currentTrackIdx < playlist.length - 1 ? currentTrackIdx + 1 : 0;
    const t = playlist[currentTrackIdx];
    labelDisc.style.background = t.color;
    labelDisc.style.setProperty('--label-color', t.color);
    labelArtist.textContent = t.name;
    updateTbArt(t);
    audioEl.src = t.url;
    audioEl.play().catch(() => {});
    tbTrack.textContent  = t.name;
    tbArtist.textContent = 'Kiki';
    renderTrackList();
});

/* ═══ Upload ═══ */
const QUICK_COLORS = [
    '#8b3a3a','#3d5a4a','#2c4858','#5a3d6a',
    '#6b4226','#7a3f2a','#3a5a3a','#4a4a6a'
];
const MAX_TRACKS = 15;

sidebarFiles?.addEventListener('change', () => {
    let files = Array.from(sidebarFiles.files).sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));
    if (!files.length) return;
    if (files.length > MAX_TRACKS) files = files.slice(0, MAX_TRACKS);

    const wasEmpty = playlist.length === 0;
    const color = QUICK_COLORS[Math.floor(Math.random() * QUICK_COLORS.length)];

    files.forEach(f => {
        playlist.push({
            id:    `${Date.now()}-${Math.random()}`,
            name:  f.name.replace(/\.[^/.]+$/, ''),
            url:   URL.createObjectURL(f),
            color,
        });
    });

    renderTrackList();
    if (wasEmpty) loadTrack(0, false);
    sidebarFiles.value = '';
});

/* ═══ Immersive mode ═══ */
const immersiveBtn     = $('immersiveBtn');
const exitImmersiveBtn = $('exitImmersiveBtn');

function enterImmersive() {
    document.body.classList.add('immersive');
    document.body.classList.remove('cursor-idle'); // show cursor, 3s timer restarts via mousemove
    const el = document.documentElement;
    const req = el.requestFullscreen || el.webkitRequestFullscreen || el.mozRequestFullScreen || el.msRequestFullscreen;
    if (req) req.call(el).catch(() => {});
}
function exitImmersive() {
    document.body.classList.remove('immersive');
    const exit = document.exitFullscreen || document.webkitExitFullscreen || document.mozCancelFullScreen || document.msExitFullscreen;
    if (exit && document.fullscreenElement) exit.call(document).catch(() => {});
}

immersiveBtn.addEventListener('click', enterImmersive);
exitImmersiveBtn.addEventListener('click', exitImmersive);

/* Sync immersive class if user exits fullscreen via browser (Esc, F11, etc.) */
document.addEventListener('fullscreenchange', () => {
    if (!document.fullscreenElement) document.body.classList.remove('immersive');
});
document.addEventListener('webkitfullscreenchange', () => {
    if (!document.webkitFullscreenElement) document.body.classList.remove('immersive');
});

document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && document.body.classList.contains('immersive')) {
        exitImmersive();
        return;
    }
    if (e.code === 'Space' && e.target === document.body) {
        e.preventDefault();
        if (currentTrackIdx < 0 || busy) return;
        isPlaying ? stopPlayback() : beginPlayback();
    }
});

/* ═══ Cursor idle hide ═══ */
(() => {
    let idleTimer;
    const IDLE_MS = 3000;
    const hide = () => document.body.classList.add('cursor-idle');
    const show = () => {
        document.body.classList.remove('cursor-idle');
        clearTimeout(idleTimer);
        idleTimer = setTimeout(hide, IDLE_MS);
    };
    document.addEventListener('mousemove', show, { passive: true });
    document.addEventListener('mousedown', show, { passive: true });
    idleTimer = setTimeout(hide, IDLE_MS);
})();

/* ═══ Mobile playlist sheet ═══ */
(() => {
    const btn = document.getElementById('mobilePLBtn');
    const sidebar = document.querySelector('.sidebar');
    if (!btn || !sidebar) return;

    const overlay = document.createElement('div');
    overlay.className = 'mobile-overlay';
    document.body.appendChild(overlay);

    const open  = () => { sidebar.classList.add('mobile-open');    overlay.classList.add('visible'); };
    const close = () => { sidebar.classList.remove('mobile-open'); overlay.classList.remove('visible'); };

    btn.addEventListener('click', () => sidebar.classList.contains('mobile-open') ? close() : open());
    overlay.addEventListener('click', close);

    /* Auto-close when a track is tapped on mobile */
    sidebar.addEventListener('click', e => {
        if (e.target.closest('.track-row') && window.innerWidth <= 720) close();
    });
})();

/* ═══ Init ═══ */
renderTrackList();
updatePlayUI();
