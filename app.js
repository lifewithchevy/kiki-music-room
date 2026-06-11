/* ═══════════════════════════════════════════════════════════
   85 VINYLS — Music Room Engine
   ═══════════════════════════════════════════════════════════ */

/* ═══ ROOM CONFIG — per-room customization, share-link driven ═══ */
/* ── ava.85vinyls.com branch: Ava's room is the default ── */
const DEFAULT_ROOM = {
    name:      'Ava’s Vinyls',
    tagline:   'Music Room',
    title:     'Happy Birthday Ava',
    subtitle:  '',
    artist:    'Ava',
    wood:      '#7a1616',
    turntable: '#511010',
    bgStyle:   'photo',    // 'wood' | 'pegboard' | 'photo'
    accent:    'gold',     // 'silver' | 'gold'  (tonearm tint)
    tracks: [
        { name: "KATSEYE - PINKY UP", type: 'youtube', ytId: "7F1ET2XHQfk", color: "#8b3a3a" },
        { name: "KATSEYE - Debut", type: 'youtube', ytId: "bYg6aMDQ_TA", color: "#a0552c" },
        { name: "KATSEYE - Touch", type: 'youtube', ytId: "l9CZykYZkOQ", color: "#c4953a" },
        { name: "KATSEYE - My Way", type: 'youtube', ytId: "1P8BbTY8gWo", color: "#3d5a4a" },
        { name: "KATSEYE - I'm Pretty", type: 'youtube', ytId: "xQl4jd77bGY", color: "#2c4858" },
        { name: "KATSEYE - Tonight I Might", type: 'youtube', ytId: "6oqywcXsQik", color: "#5a3d6a" },
        { name: "KATSEYE - Touch (ft. YEONJUN of TOMORROW X TOGETHER)", type: 'youtube', ytId: "86cojHkoefk", color: "#6b4226" },
        { name: "KATSEYE - Flame (from the Netflix Series \"Jentry Chau vs the Underworld\")", type: 'youtube', ytId: "e8tScmvnpL8", color: "#7a3f2a" },
        { name: "KATSEYE - Gnarly", type: 'youtube', ytId: "R2-yomhYAj4", color: "#3a5a3a" },
        { name: "KATSEYE - Gnarly - Ice Spice Remix", type: 'youtube', ytId: "lNzLuzmx5aY", color: "#4a4a6a" },
        { name: "KATSEYE - Gabriela", type: 'youtube', ytId: "CjnB56tSCQI", color: "#8b3a3a" },
        { name: "KATSEYE - Gameboy", type: 'youtube', ytId: "-bC4iak3kxg", color: "#a0552c" },
        { name: "KATSEYE - Mean Girls", type: 'youtube', ytId: "MGcPpYhuq-8", color: "#c4953a" },
        { name: "KATSEYE - M.I.A", type: 'youtube', ytId: "4H7ZJQPPThY", color: "#3d5a4a" },
        { name: "KATSEYE - Time Lapse", type: 'youtube', ytId: "uav-2BxMv9U", color: "#2c4858" },
        { name: "Monster High - Monster High Fright Song", type: 'youtube', ytId: "BxY5l4ZK61I", color: "#5a3d6a" },
        { name: "YEONJUN - Let Me Tell You (feat. Daniela of KATSEYE)", type: 'youtube', ytId: "2xbTnB6we0Q", color: "#6b4226" },
        { name: "KATSEYE - M.I.A - VALORANT Game Changers Version", type: 'youtube', ytId: "mX-dgjFS6eY", color: "#7a3f2a" },
        { name: "KATSEYE - Internet Girl", type: 'youtube', ytId: "5q9EjSUovc4", color: "#3a5a3a" },
        { name: "LE SSERAFIM - SPAGHETTI (Member ver.)", type: 'youtube', ytId: "rQSDEVfYFnE", color: "#4a4a6a" },
        { name: "ILLIT - NOT CUTE ANYMORE", type: 'youtube', ytId: "x_RYZsOfpKY", color: "#8b3a3a" },
        { name: "LE SSERAFIM - ANTIFRAGILE", type: 'youtube', ytId: "pyf8cbqyfPs", color: "#a0552c" },
        { name: "LE SSERAFIM - CRAZY", type: 'youtube', ytId: "n6B5gQXlB-0", color: "#c4953a" },
        { name: "ILLIT - Magnetic", type: 'youtube', ytId: "Vk5-c_v4gMU", color: "#3d5a4a" },
        { name: "ILLIT - jellyous", type: 'youtube', ytId: "GkG60kISnfc", color: "#2c4858" },
        { name: "ILLIT - NOT ME", type: 'youtube', ytId: "9nEp9eeGaJk", color: "#5a3d6a" },
        { name: "YENA - Catch Catch", type: 'youtube', ytId: "NOiyDlWl534", color: "#6b4226" },
        { name: "Hearts2Hearts - RUDE!", type: 'youtube', ytId: "F7sGJVUrkjQ", color: "#7a3f2a" },
        { name: "ILLIT - Tick-Tack", type: 'youtube', ytId: "-nEGVrzPaiU", color: "#3a5a3a" },
        { name: "CORTIS - GO!", type: 'youtube', ytId: "WXS-o57VJ5w", color: "#4a4a6a" },
        { name: "The Debut: Dream Academy - Girls Don’t Like", type: 'youtube', ytId: "rJjUspLdq3I", color: "#8b3a3a" },
        { name: "LE SSERAFIM - BOOMPALA", type: 'youtube', ytId: "V1Lr-_AxeR8", color: "#a0552c" }
    ]   // Ava's playlist (resolved from her Spotify playlist)
};

function b64urlDecode(str) {
    return decodeURIComponent(escape(atob(str.replace(/-/g, '+').replace(/_/g, '/'))));
}
function b64urlEncode(str) {
    return btoa(unescape(encodeURIComponent(str))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function decodeRoom() {
    try {
        const p = new URLSearchParams(location.search).get('room');
        if (!p) return { ...DEFAULT_ROOM };
        const json = JSON.parse(b64urlDecode(p));
        return { ...DEFAULT_ROOM, ...json };
    } catch (e) {
        console.warn('Bad room param:', e);
        return { ...DEFAULT_ROOM };
    }
}

const ROOM = decodeRoom();

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

/* Split "Artist - Title" so the artist sits above the spindle, fully readable */
function setVinylLabel(name) {
    const parts = String(name).split(' - ');
    labelArtist.textContent = parts[0] || name;
    labelAlbum.textContent  = parts.slice(1).join(' - ');
}
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
                <div class="tb-sleeve-artist">${escapeHtml(ROOM.artist)}</div>
            </div>
        </div>`;
}

/* ═══ Volume ═══ */
volumeSlider.addEventListener('input', () => {
    const v = Number(volumeSlider.value) / 100;
    if (musicGain)   musicGain.gain.value = v;
    if (crackleGain) crackleGain.gain.value = 0.22 * v;
    if (ytReady) { try { ytPlayer.setVolume(Number(volumeSlider.value)); } catch (_) {} }
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
    const t = curTrack();
    let cur = 0, dur = 0;
    if (isYT(t) && ytReady) {
        try { cur = ytPlayer.getCurrentTime() || 0; dur = ytPlayer.getDuration() || 0; } catch (_) {}
    } else if (audioEl.duration) {
        cur = audioEl.currentTime; dur = audioEl.duration;
    }
    if (dur) {
        const pct = (cur / dur) * 100;
        progressFill.style.width = pct + '%';
        progressHead.style.left  = pct + '%';
        currentTimeEl.textContent = fmt(cur);
        totalTimeEl.textContent   = fmt(dur);
    }
    if (isPlaying) syncLyrics(cur);
    if (isPlaying && isYT(t)) {
        /* YouTube audio can't feed the analyser (cross-origin) — gentle faux meter */
        vuBars.forEach((b, i) => b.classList.toggle('lit', Math.random() < 0.45 - i * 0.04));
    } else if (analyser && isPlaying) {
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
    const r = progressTrack.getBoundingClientRect();
    const frac = (e.clientX - r.left) / r.width;
    const t = curTrack();
    if (isYT(t) && ytReady) {
        const dur = ytPlayer.getDuration() || 0;
        if (dur) ytPlayer.seekTo(frac * dur, true);
    } else if (audioEl.duration) {
        audioEl.currentTime = frac * audioEl.duration;
    }
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
                ? 'Add a song to begin'
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
    setVinylLabel(track.name);

    updateTbArt(track);
    tbTrack.textContent  = track.name;
    tbArtist.textContent = ROOM.artist;

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
    if (lyricsOpen) fetchLyrics(track);

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
    try {
        if (isYT(track)) {
            ytStop();
            ytLoadAndPlay(track.ytId);
            isPlaying = true;
        } else {
            ytStop();
            audioEl.src = track.url;
            await audioEl.play();
            isPlaying = true;
        }
        startCrackle();
        updatePlayUI();
        cancelAnimationFrame(rafId);
        rafId = requestAnimationFrame(tick);
        tbTrack.textContent  = track.name;
        tbArtist.textContent = ROOM.artist;
        if (lyricsOpen) fetchLyrics(track);
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
    ytPause();
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

function currentPlayheadTime() {
    const t = curTrack();
    if (isYT(t) && ytReady) { try { return ytPlayer.getCurrentTime() || 0; } catch (_) { return 0; } }
    return audioEl.currentTime || 0;
}

prevBtn.addEventListener('click', () => {
    if (currentTrackIdx < 0) return;
    if (isPlaying && currentPlayheadTime() > 3) {
        const t = curTrack();
        if (isYT(t) && ytReady) ytPlayer.seekTo(0, true);
        else audioEl.currentTime = 0;
        return;
    }
    if (currentTrackIdx > 0) {
        if (isPlaying) playTrackImmediate(currentTrackIdx - 1);
        else { currentTrackIdx--; setSourceVisual(playlist[currentTrackIdx]); renderTrackList(); }
    }
});

nextBtn.addEventListener('click', () => {
    if (currentTrackIdx < 0) return;
    if (currentTrackIdx < playlist.length - 1) {
        if (isPlaying) playTrackImmediate(currentTrackIdx + 1);
        else { currentTrackIdx++; setSourceVisual(playlist[currentTrackIdx]); renderTrackList(); }
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

/* ═══ Auto-advance when track ends (audio source; YT handled via onStateChange) ═══ */
audioEl.addEventListener('ended', () => { if (!isYT(curTrack())) handleTrackEnded(); });

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
    const wrap = document.querySelector('.cabinet-wrap');
    if (wrap) wrap.style.zoom = '';                 // let immersive CSS sizing take over
    const el = document.documentElement;
    const req = el.requestFullscreen || el.webkitRequestFullscreen || el.mozRequestFullScreen || el.msRequestFullscreen;
    if (req) req.call(el).catch(() => {});
}
function exitImmersive() {
    document.body.classList.remove('immersive');
    const exit = document.exitFullscreen || document.webkitExitFullscreen || document.mozCancelFullScreen || document.msExitFullscreen;
    if (exit && document.fullscreenElement) exit.call(document).catch(() => {});
    setTimeout(fitCabinet, 60);                     // re-fit to the stage
}

immersiveBtn.addEventListener('click', enterImmersive);
exitImmersiveBtn.addEventListener('click', exitImmersive);

/* Sync immersive class if user exits fullscreen via browser (Esc, F11, etc.) */
document.addEventListener('fullscreenchange', () => {
    if (!document.fullscreenElement) { document.body.classList.remove('immersive'); scheduleFit(); }
});
document.addEventListener('webkitfullscreenchange', () => {
    if (!document.webkitFullscreenElement) { document.body.classList.remove('immersive'); scheduleFit(); }
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

/* ═══════════════════════════════════════════════════════════
   YOUTUBE AUDIO SOURCE  (plays youtube-type tracks)
   ═══════════════════════════════════════════════════════════ */
let ytPlayer = null, ytReady = false, ytPending = null;

window.onYouTubeIframeAPIReady = function () {
    ytPlayer = new YT.Player('ytHost', {
        height: '120', width: '120',
        playerVars: { autoplay: 0, controls: 0, disablekb: 1, playsinline: 1, rel: 0, fs: 0, modestbranding: 1 },
        events: {
            onReady: () => {
                ytReady = true;
                try { ytPlayer.setVolume(Number(volumeSlider.value)); } catch (_) {}
                if (ytPending) { const id = ytPending; ytPending = null; ytLoadAndPlay(id); }
            },
            onStateChange: e => { if (e.data === YT.PlayerState.ENDED) handleTrackEnded(); }
        }
    });
};

function ytLoadAndPlay(id) {
    if (!ytReady) { ytPending = id; return; }
    try {
        ytPlayer.loadVideoById(id);
        ytPlayer.setVolume(Number(volumeSlider.value));
        ytPlayer.playVideo();
    } catch (_) {}
}
function ytPause() { try { if (ytReady) ytPlayer.pauseVideo(); } catch (_) {} }
function ytStop()  { try { if (ytReady) ytPlayer.stopVideo();  } catch (_) {} ytPending = null; }

const curTrack = () => (currentTrackIdx >= 0 ? playlist[currentTrackIdx] : null);
const isYT = t => t && t.type === 'youtube';

/* ═══════════════════════════════════════════════════════════
   ADD-BY-LINK  (YouTube + Spotify)
   ═══════════════════════════════════════════════════════════ */
const linkInput  = $('linkInput');
const linkAddBtn = $('linkAddBtn');
const linkStatus = $('linkStatus');

function setLinkStatus(msg, ok = false, warn = false) {
    if (!linkStatus) return;
    linkStatus.textContent = msg || '';
    linkStatus.dataset.state = msg ? (ok ? 'ok' : warn ? 'warn' : 'busy') : '';
}

function parseYouTube(url) {
    const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|v\/|live\/))([\w-]{11})/);
    if (m) return m[1];
    if (/^[\w-]{11}$/.test(url.trim())) return url.trim();
    return null;
}
function parseSpotifyTrack(url) {
    return /open\.spotify\.com\/(?:intl-[a-z]+\/)?track\//.test(url);
}

async function fetchTimeout(url, ms = 6000) {
    const ctrl = new AbortController();
    const id = setTimeout(() => ctrl.abort(), ms);
    try { return await fetch(url, { signal: ctrl.signal }); }
    finally { clearTimeout(id); }
}

async function fetchYouTubeTitle(id) {
    try {
        const r = await fetchTimeout(`https://www.youtube.com/oembed?format=json&url=https://www.youtube.com/watch?v=${id}`);
        if (r.ok) { const j = await r.json(); return j.title || null; }
    } catch (_) {}
    return null;
}

async function fetchSpotifyMeta(url) {
    try {
        const r = await fetchTimeout(`https://open.spotify.com/oembed?url=${encodeURIComponent(url)}`);
        if (r.ok) { const j = await r.json(); return { title: j.title || '', thumb: j.thumbnail_url || '' }; }
    } catch (_) {}
    return null;
}

/* Best-effort Spotify→YouTube match via public Piped instances (no API key). */
const PIPED_HOSTS = [
    'https://pipedapi.kavin.rocks',
    'https://pipedapi.adminforge.de',
    'https://pipedapi.leptons.xyz',
    'https://pipedapi.reallyaweso.me'
];
async function resolveToYouTube(query) {
    if (!query) return null;
    for (const host of PIPED_HOSTS) {
        try {
            const r = await fetchTimeout(`${host}/search?q=${encodeURIComponent(query)}&filter=videos`, 5000);
            if (!r.ok) continue;
            const j = await r.json();
            const item = (j.items || []).find(i => typeof i.url === 'string' && i.url.includes('watch?v='));
            if (item) return item.url.split('watch?v=')[1].slice(0, 11);
        } catch (_) {}
    }
    return null;
}

function addTrack(t, autoLoad = true) {
    const wasEmpty = playlist.length === 0;
    playlist.push({
        id:    `${Date.now()}-${Math.random()}`,
        name:  t.name || 'Untitled',
        type:  t.type || 'audio',
        ytId:  t.ytId || null,
        url:   t.url  || null,
        color: t.color || QUICK_COLORS[Math.floor(Math.random() * QUICK_COLORS.length)]
    });
    renderTrackList();
    if (wasEmpty && autoLoad) loadTrack(0, false);
}

async function addFromLink(raw) {
    const url = (raw || '').trim();
    if (!url) return;

    const ytId = parseYouTube(url);
    if (ytId) {
        setLinkStatus('Adding…');
        const title = await fetchYouTubeTitle(ytId);
        addTrack({ name: title || 'YouTube track', type: 'youtube', ytId });
        setLinkStatus('Added ✓', true);
        if (linkInput) linkInput.value = '';
        setTimeout(() => setLinkStatus(''), 1800);
        return;
    }

    if (parseSpotifyTrack(url)) {
        setLinkStatus('Matching on YouTube…');
        const meta  = await fetchSpotifyMeta(url);
        const query = meta && meta.title ? meta.title : '';
        const vid   = await resolveToYouTube(query);
        if (vid) {
            addTrack({ name: query || 'Spotify track', type: 'youtube', ytId: vid });
            setLinkStatus('Added ✓', true);
            if (linkInput) linkInput.value = '';
            setTimeout(() => setLinkStatus(''), 1800);
        } else {
            setLinkStatus('Could not auto-match. Paste the YouTube link instead.', false, true);
        }
        return;
    }

    setLinkStatus('Use a YouTube or Spotify link.', false, true);
}

linkAddBtn?.addEventListener('click', () => addFromLink(linkInput?.value));
linkInput?.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); addFromLink(linkInput.value); } });

/* ═══ Centralized source visuals + mid-playback switching ═══ */
function setSourceVisual(t) {
    labelDisc.style.background = t.color;
    labelDisc.style.setProperty('--label-color', t.color);
    setVinylLabel(t.name);
    updateTbArt(t);
    tbTrack.textContent  = t.name;
    tbArtist.textContent = ROOM.artist;
    if (lyricsOpen) fetchLyrics(t);
}

/* Switch tracks while already playing (next / prev / auto-advance) */
function playTrackImmediate(idx) {
    if (idx < 0 || idx >= playlist.length) return;
    currentTrackIdx = idx;
    const t = playlist[idx];
    setSourceVisual(t);
    if (isYT(t)) {
        audioEl.pause();
        ytLoadAndPlay(t.ytId);
    } else {
        ytStop();
        audioEl.src = t.url;
        audioEl.play().catch(() => {});
    }
    renderTrackList();
}

async function handleTrackEnded() {
    if (currentTrackIdx < playlist.length - 1) {
        playTrackImmediate(currentTrackIdx + 1);
    } else {
        await stopPlayback();
        progressFill.style.width  = '0%';
        progressHead.style.left   = '0%';
        currentTimeEl.textContent = '0:00';
        totalTimeEl.textContent   = '0:00';
    }
}

/* ═══════════════════════════════════════════════════════════
   LYRICS  (LRCLIB — free, synced when available)
   ═══════════════════════════════════════════════════════════ */
const lyricsToggle = $('lyricsToggle');
const lyricsPanel  = $('lyricsPanel');
const lyricsClose  = $('lyricsClose');
const lyricsBody   = $('lyricsBody');
const lyricsTrackEl = $('lyricsTrack');

let lyricsOpen   = false;
let lyricsCache  = {};          // trackId -> { synced:[{t,line}]|null, plain:string|null }
let activeSynced = null;        // currently rendered synced array
let activeLyricsId = null;
let lastActiveLine = -1;

function splitArtistTitle(name) {
    const parts = String(name).split(/\s+[-–—]\s+/);
    if (parts.length >= 2) return { artist: parts[0].trim(), title: parts.slice(1).join(' - ').trim() };
    return { artist: '', title: String(name).trim() };
}

/* "Clean" a noisy youtube title for better matching */
function cleanTitle(s) {
    return String(s)
        .replace(/\((?:official|lyric|audio|video|4k|hd|remaster|visualizer)[^)]*\)/gi, '')
        .replace(/\[[^\]]*\]/g, '')
        .replace(/(?:official\s*(?:music\s*)?video|lyrics?|audio|visualizer|4k\s*remaster|remaster(?:ed)?)/gi, '')
        .replace(/\s{2,}/g, ' ')
        .trim();
}

function parseLRC(lrc) {
    const out = [];
    String(lrc).split('\n').forEach(raw => {
        const text = raw.replace(/\[[0-9:.]+\]/g, '').trim();
        const stamps = [...raw.matchAll(/\[(\d+):(\d+)(?:\.(\d+))?\]/g)];
        stamps.forEach(m => {
            const t = (+m[1]) * 60 + (+m[2]) + (m[3] ? (+('0.' + m[3])) : 0);
            out.push({ t, line: text });
        });
    });
    out.sort((a, b) => a.t - b.t);
    return out;
}

async function lrclibSearch(query) {
    try {
        const r = await fetchTimeout(`https://lrclib.net/api/search?q=${encodeURIComponent(query)}`, 12000);
        if (!r.ok) return null;
        const arr = await r.json();
        if (!Array.isArray(arr) || !arr.length) return null;
        return arr.find(x => x.syncedLyrics) || arr.find(x => x.plainLyrics) || arr[0];
    } catch (_) { return null; }
}

async function fetchLyrics(track) {
    if (!track) return;
    if (lyricsTrackEl) lyricsTrackEl.textContent = track.name;
    if (lyricsCache[track.id]) { renderLyrics(track.id); return; }

    if (lyricsOpen) lyricsBody.innerHTML = `<div class="lyrics-empty">Looking for lyrics…</div>`;

    const { artist, title } = splitArtistTitle(track.name);
    const ct = cleanTitle(title);
    let hit = await lrclibSearch(`${artist} ${ct}`.trim());
    if (!hit) hit = await lrclibSearch(ct);
    if (!hit) hit = await lrclibSearch(cleanTitle(track.name));

    lyricsCache[track.id] = {
        synced: hit && hit.syncedLyrics ? parseLRC(hit.syncedLyrics) : null,
        plain:  hit && hit.plainLyrics  ? hit.plainLyrics : null
    };
    renderLyrics(track.id);
}

function renderLyrics(trackId) {
    activeLyricsId = trackId;
    lastActiveLine = -1;
    const data = lyricsCache[trackId];
    if (!lyricsBody) return;
    if (!data || (!data.synced && !data.plain)) {
        activeSynced = null;
        lyricsBody.innerHTML = `<div class="lyrics-empty">No lyrics found for this track.<br><span>Lyrics come from LRCLIB and don’t cover every song.</span></div>`;
        return;
    }
    if (data.synced && data.synced.length) {
        activeSynced = data.synced;
        lyricsBody.innerHTML = data.synced
            .map((l, i) => `<div class="lyric-line" data-i="${i}">${l.line ? escapeHtml(l.line) : '♪'}</div>`)
            .join('');
    } else {
        activeSynced = null;
        lyricsBody.innerHTML = `<div class="lyrics-plain">${
            data.plain.split('\n').map(l => l.trim() ? escapeHtml(l) : '<br>').join('<br>')
        }</div>`;
    }
}

function syncLyrics(time) {
    if (!lyricsOpen || !activeSynced || activeLyricsId !== (curTrack() && curTrack().id)) return;
    let idx = -1;
    for (let i = 0; i < activeSynced.length; i++) {
        if (activeSynced[i].t <= time + 0.15) idx = i; else break;
    }
    if (idx === lastActiveLine) return;
    lastActiveLine = idx;
    const lines = lyricsBody.querySelectorAll('.lyric-line');
    lines.forEach((el, i) => el.classList.toggle('active', i === idx));
    const activeEl = lines[idx];
    if (activeEl) activeEl.scrollIntoView({ block: 'center', behavior: 'smooth' });
}

function openLyrics() {
    lyricsOpen = true;
    lyricsPanel.classList.add('open');
    lyricsToggle.dataset.on = 'true';
    const t = curTrack();
    if (t) fetchLyrics(t); else lyricsBody.innerHTML = `<div class="lyrics-empty">Press play to load lyrics.</div>`;
}
function closeLyrics() {
    lyricsOpen = false;
    lyricsPanel.classList.remove('open');
    lyricsToggle.dataset.on = 'false';
}
lyricsToggle?.addEventListener('click', () => lyricsOpen ? closeLyrics() : openLyrics());
lyricsClose?.addEventListener('click', closeLyrics);

/* ═══════════════════════════════════════════════════════════
   ROOM THEMING + CUSTOMIZATION
   ═══════════════════════════════════════════════════════════ */
/* Natural wood grain via SVG turbulence (procedural rosewood):
   organic, wavy vertical grain with near-black veins over a red field. */
function buildWood(base) {
    const dark  = darken(base, 32);
    const light = lighten(base, 20);
    const svg =
        `<svg xmlns='http://www.w3.org/2000/svg' width='760' height='620' preserveAspectRatio='none'>` +
        `<defs>` +
            `<linearGradient id='b' x1='0' y1='0' x2='1' y2='0'>` +
                `<stop offset='0' stop-color='${dark}'/>` +
                `<stop offset='0.22' stop-color='${light}'/>` +
                `<stop offset='0.5' stop-color='${base}'/>` +
                `<stop offset='0.78' stop-color='${light}'/>` +
                `<stop offset='1' stop-color='${dark}'/>` +
            `</linearGradient>` +
            /* stretched fractal noise -> vertical organic streaks; 5 octaves = detail */
            `<filter id='g' x='-2%' y='-2%' width='104%' height='104%'>` +
                `<feTurbulence type='fractalNoise' baseFrequency='0.055 0.004' numOctaves='6' seed='17' result='n'/>` +
                `<feColorMatrix in='n' type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.7 0.7 0.7 0 -0.2'/>` +
                `<feComponentTransfer><feFuncA type='gamma' amplitude='1' exponent='3' offset='0'/></feComponentTransfer>` +
            `</filter>` +
        `</defs>` +
        `<rect width='760' height='620' fill='url(#b)'/>` +
        `<rect width='760' height='620' filter='url(#g)' fill='#1a0303'/>` +
        `</svg>`;
    const uri = 'data:image/svg+xml,' + encodeURIComponent(svg);
    return `linear-gradient(180deg, rgba(0,0,0,0.40) 0%, rgba(0,0,0,0.06) 30%, rgba(0,0,0,0.30) 100%), url("${uri}") center / cover no-repeat`;
}

/* Perforated pegboard panel (Technics-style wall) built from a base color */
function buildPegboard(base) {
    const hole     = 'radial-gradient(circle at 50% 42%, rgba(0,0,0,0.62) 1.7px, rgba(0,0,0,0.18) 2.3px, transparent 3px) 0 0 / 26px 26px';
    const hilite   = 'radial-gradient(circle at 50% 38%, rgba(255,255,255,0.05) 1.4px, transparent 2px) 0 0 / 26px 26px';
    const lighting = `radial-gradient(ellipse at 50% 32%, ${lighten(base,34)} 0%, ${base} 46%, ${darken(base,30)} 100%)`;
    return `${hilite}, ${hole}, ${lighting}, ${darken(base,12)}`;
}

/* Muted matte-metal body finish (soft, low sheen — no brushing lines) */
function buildTurntableFace(t) {
    const sheen = 'radial-gradient(140% 95% at 50% 24%, rgba(255,255,255,0.045) 0%, rgba(255,255,255,0.0) 46%)';
    const body  = `linear-gradient(180deg, ${lighten(t,5)} 0%, ${t} 48%, ${darken(t,9)} 100%)`;
    return `${sheen}, ${body}`;
}

/* Photographic wood background with a focused light pooled on the turntable:
   a soft glow at center, darkening to shadow at the corners (spotlight vignette). */
function buildWoodPhoto() {
    const spotlight = 'radial-gradient(ellipse 64% 72% at 50% 43%, rgba(255,236,214,0.10) 0%, rgba(255,236,214,0.04) 22%, rgba(0,0,0,0) 40%, rgba(0,0,0,0.46) 74%, rgba(0,0,0,0.74) 100%)';
    const depth     = 'linear-gradient(180deg, rgba(0,0,0,0.22) 0%, rgba(0,0,0,0.0) 32%, rgba(0,0,0,0.20) 100%)';
    return `${spotlight}, ${depth}, url("wood-red.jpg") center / cover no-repeat`;
}

function applyTheme(wood, turntable, bgStyle, accent) {
    const stage = document.querySelector('.hero-stage');
    if (stage) {
        stage.style.background =
            bgStyle === 'photo'    ? buildWoodPhoto() :
            bgStyle === 'pegboard' ? buildPegboard(wood) :
                                     buildWood(wood);
        stage.classList.toggle('lit', bgStyle === 'photo');  // spotlight overlay
    }
    const face = document.querySelector('.cabinet-face');
    if (face) face.style.background = buildTurntableFace(turntable);
    /* Match the top/bottom edge trims to the body so the whole unit is one color */
    const topTrim = document.querySelector('.cabinet-top-trim');
    if (topTrim) topTrim.style.background = `linear-gradient(180deg, ${lighten(turntable, 10)} 0%, ${turntable} 100%)`;
    const botTrim = document.querySelector('.cabinet-bottom-trim');
    if (botTrim) botTrim.style.background = `linear-gradient(180deg, ${darken(turntable, 6)} 0%, ${darken(turntable, 13)} 100%)`;
    document.body.classList.toggle('accent-gold', accent === 'gold');
    applyArmAccent(accent);
}

/* Recolor ONLY the arm tube (the #armGrad cylinder gradient). Everything else
   on the tonearm — headshell, cartridge, pivot, rests — stays black plastic. */
const ARM_BRASS = ['#e0c074', '#c19a3e', '#7c5d22', '#a9842d', '#cfa848', '#f0d588'];
const ARM_STEEL = ['#141414', '#0d0d0d', '#070707', '#111111', '#1d1d1d', '#2a2a2a'];
function applyArmAccent(accent) {
    const grad = document.getElementById('armGrad');
    if (!grad) return;
    const stops = grad.querySelectorAll('stop');
    const set = accent === 'gold' ? ARM_BRASS : ARM_STEEL;
    stops.forEach((s, i) => { if (set[i]) s.setAttribute('stop-color', set[i]); });
}

/* Apply text + colors (safe to call repeatedly, e.g. live preview) */
function applyChrome(r) {
    document.title = r.name || '85 Vinyls';
    const setText = (sel, val) => { const el = document.querySelector(sel); if (el && val != null) el.textContent = val; };
    setText('.brand-name',   r.name);
    setText('.brand-tagline', r.tagline);
    setText('#greetingTime', r.title);
    setText('.greeting-sub', r.subtitle);
    if (tbArtist && currentTrackIdx < 0) tbArtist.textContent = r.artist;
    applyTheme(
        r.wood      || DEFAULT_ROOM.wood,
        r.turntable || DEFAULT_ROOM.turntable,
        r.bgStyle   || DEFAULT_ROOM.bgStyle,
        r.accent    || DEFAULT_ROOM.accent
    );
}

/* Load link-based tracks from a shared room (call once) */
function loadRoomTracks(r) {
    if (!Array.isArray(r.tracks) || !r.tracks.length) return;
    r.tracks.forEach(t => playlist.push({
        id:    `${Date.now()}-${Math.random()}`,
        name:  t.name || 'Untitled',
        type:  t.type || 'audio',
        ytId:  t.ytId || null,
        url:   t.src  || t.url || null,
        color: t.color || QUICK_COLORS[Math.floor(Math.random() * QUICK_COLORS.length)]
    }));
    renderTrackList();
    loadTrack(0, false);
}

/* Tracks that can travel in a share link (youtube ids + http audio urls; not blob: uploads) */
function shareableTracks() {
    return playlist
        .filter(t => t.type === 'youtube' || (t.url && /^https?:/i.test(t.url)))
        .map(t => ({ name: t.name, type: t.type || 'audio', ytId: t.ytId || undefined, src: t.url || undefined, color: t.color }));
}

/* ═══ Customize / Create Room modal ═══ */
(() => {
    const openBtn  = $('customizeBtn');
    const modal    = $('roomModal');
    if (!openBtn || !modal) return;
    const closeBtn = $('roomModalClose');
    const f = {
        title:     $('cfgTitle'),
        subtitle:  $('cfgSubtitle'),
        name:      $('cfgName'),
        artist:    $('cfgArtist'),
        wood:      $('cfgWood'),
        turntable: $('cfgTurntable'),
    };
    const shareInput = $('cfgShareLink');
    const copyBtn    = $('cfgCopyBtn');

    /* Segmented (non-input) selections */
    const seg = { bgStyle: ROOM.bgStyle, accent: ROOM.accent };

    /* One-click looks */
    const PRESETS = {
        walnut:   { wood: '#3c2610', turntable: '#0d0d0d', bgStyle: 'wood', accent: 'silver' },
        redwood:  { wood: '#6a1414', turntable: '#1a0c0c', bgStyle: 'wood', accent: 'gold'   },
        technics: { wood: '#7a1616', turntable: '#511010', bgStyle: 'photo', accent: 'gold'  },
        midnight: { wood: '#1f2433', turntable: '#0c0f18', bgStyle: 'wood', accent: 'silver' }
    };

    function syncSegUI() {
        document.querySelectorAll('.seg-opt').forEach(el => {
            el.classList.toggle('active', seg[el.dataset.group] === el.dataset.value);
        });
    }

    function collect() {
        return {
            name:      (f.name.value.trim())     || DEFAULT_ROOM.name,
            tagline:   ROOM.tagline || DEFAULT_ROOM.tagline,
            title:     (f.title.value.trim())    || DEFAULT_ROOM.title,
            subtitle:  (f.subtitle.value.trim()) || DEFAULT_ROOM.subtitle,
            artist:    (f.artist.value.trim())   || DEFAULT_ROOM.artist,
            wood:      f.wood.value,
            turntable: f.turntable.value,
            bgStyle:   seg.bgStyle,
            accent:    seg.accent,
            tracks:    shareableTracks()
        };
    }

    function applyPreset(name) {
        const p = PRESETS[name];
        if (!p) return;
        f.wood.value      = p.wood;
        f.turntable.value = p.turntable;
        seg.bgStyle       = p.bgStyle;
        seg.accent        = p.accent;
        syncSegUI();
        refresh();
    }
    function buildLink(cfg) {
        return `${location.origin}${location.pathname}?room=${b64urlEncode(JSON.stringify(cfg))}`;
    }
    function refresh() {
        const cfg = collect();
        applyChrome(cfg);                 // live preview
        shareInput.value = buildLink(cfg);
    }

    function open() {
        f.title.value     = ROOM.title;
        f.subtitle.value  = ROOM.subtitle;
        f.name.value      = ROOM.name;
        f.artist.value    = ROOM.artist;
        f.wood.value      = ROOM.wood;
        f.turntable.value = ROOM.turntable;
        seg.bgStyle       = ROOM.bgStyle || DEFAULT_ROOM.bgStyle;
        seg.accent        = ROOM.accent  || DEFAULT_ROOM.accent;
        syncSegUI();
        refresh();
        modal.classList.remove('hidden');
    }
    function close() {
        modal.classList.add('hidden');
        applyChrome(ROOM);                // revert preview to the live room
    }

    openBtn.addEventListener('click', open);
    closeBtn?.addEventListener('click', close);
    modal.addEventListener('click', e => { if (e.target === modal) close(); });
    Object.values(f).forEach(el => {
        el.addEventListener('input', refresh);
        el.addEventListener('change', refresh);
    });
    document.querySelectorAll('.seg-opt').forEach(el => {
        el.addEventListener('click', () => { seg[el.dataset.group] = el.dataset.value; syncSegUI(); refresh(); });
    });
    document.querySelectorAll('.preset-chip').forEach(el => {
        el.addEventListener('click', () => applyPreset(el.dataset.preset));
    });
    copyBtn?.addEventListener('click', async () => {
        try {
            await navigator.clipboard.writeText(shareInput.value);
            copyBtn.textContent = 'Copied!';
            setTimeout(() => copyBtn.textContent = 'Copy share link', 1600);
        } catch {
            shareInput.select();
            document.execCommand('copy');
            copyBtn.textContent = 'Copied!';
            setTimeout(() => copyBtn.textContent = 'Copy share link', 1600);
        }
    });
})();

/* ═══ Fit the turntable to the stage (never clip top/bottom on short viewports) ═══ */
function fitCabinet() {
    const wrap  = document.querySelector('.cabinet-wrap');
    const stage = document.querySelector('.hero-stage');
    if (!wrap || !stage) return;
    if (document.body.classList.contains('immersive')) { wrap.style.zoom = ''; return; }
    wrap.style.zoom = '1';                       // measure natural size
    const cw = wrap.offsetWidth, ch = wrap.offsetHeight;
    if (!cw || !ch) return;
    const availW = stage.clientWidth  - 36;
    const availH = stage.clientHeight - 24;
    const scale = Math.min(1, availW / cw, availH / ch);
    wrap.style.zoom = scale;
}

let _fitRAF = null;
function scheduleFit() {
    cancelAnimationFrame(_fitRAF);
    _fitRAF = requestAnimationFrame(fitCabinet);
}
window.addEventListener('resize', scheduleFit);
window.addEventListener('load', scheduleFit);

/* ═══ Init ═══ */
applyChrome(ROOM);
loadRoomTracks(ROOM);
renderTrackList();
updatePlayUI();
fitCabinet();
setTimeout(fitCabinet, 60);   // re-fit after fonts/layout settle
