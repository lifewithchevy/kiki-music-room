/* ═══════════════════════════════════════════════════════════
   AUDIÓ SALON — Vinyl Player Engine
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

    /* Vinyl warmth */
    const warm = audioCtx.createBiquadFilter();
    warm.type = 'lowshelf';
    warm.frequency.value = 320;
    warm.gain.value = 4;

    const rolloff = audioCtx.createBiquadFilter();
    rolloff.type = 'highshelf';
    rolloff.frequency.value = 7000;
    rolloff.gain.value = -5;

    /* VU analyser */
    analyser = audioCtx.createAnalyser();
    analyser.fftSize = 512;
    vuData = new Uint8Array(analyser.frequencyBinCount);

    mediaSource
        .connect(warm)
        .connect(rolloff)
        .connect(musicGain)
        .connect(analyser)
        .connect(audioCtx.destination);
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
const albums   = [];
let currentAlbum = null;
let currentTrackIndex = 0;
let isPlaying = false;
let isPowered = false;
let speed = 33;
let busy = false;             // true while a cue choreography is mid-flight
let platterAnim = null;       // Web Animations API handle for the record spin

const sleep = ms => new Promise(r => setTimeout(r, ms));

/* Smoothly ramp the platter rotation rate (0 = stopped, 1 = 33⅓, 1.35 ≈ 45) */
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
            /* smoothstep easing for natural motor ramp */
            const e = t * t * (3 - 2 * t);
            platterAnim.playbackRate = start + (target - start) * e;
            if (t < 1) requestAnimationFrame(step);
            else resolve();
        }
        step();
    });
}

/* Stylus drop sound — short low-frequency thump + tiny crackle */
function playStylusDrop() {
    if (audioCtx.state === 'suspended') return;
    const t = audioCtx.currentTime;

    /* Thump */
    const thumpBuf = audioCtx.createBuffer(1, audioCtx.sampleRate * 0.12, audioCtx.sampleRate);
    const td = thumpBuf.getChannelData(0);
    for (let i = 0; i < td.length; i++) {
        const env = Math.exp(-i / 800);
        td[i] = (Math.random() * 2 - 1) * env;
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

/* Soft motor whir when platter starts (subtle, brief) */
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

const record       = $('record');
const tonearm      = $('tonearm');
const powerBtn     = $('powerBtn');
const labelDisc    = $('labelDisc');
const labelArtist  = $('labelArtist');
const labelAlbum   = $('labelAlbum');
const tbArt        = $('tbArt');
const tbTrack      = $('tbTrack');
const tbArtist     = $('tbArtist');
const playBtn      = $('playBtn');
const playIcon     = $('playIcon');
const pauseIcon    = $('pauseIcon');
const prevBtn      = $('prevBtn');
const nextBtn      = $('nextBtn');
const progressFill = $('progressFill');
const progressHead = $('progressHead');
const progressTrack= $('progressTrack');
const currentTimeEl= $('currentTime');
const totalTimeEl  = $('totalTime');
const volumeSlider = $('volumeSlider');
const albumRow     = $('albumRow');
const emptyCollection = $('emptyCollection');
const searchInput  = $('searchInput');
const crackleToggle= $('crackleToggle');
const vuBars       = document.querySelectorAll('.vu-bar');

/* Modal */
const modalOverlay = $('modalOverlay');
const openAddBtn   = $('openAddBtn');
const emptyAddBtn  = $('emptyAddBtn');
const modalClose   = $('modalClose');
const cancelBtn    = $('cancelBtn');
const saveBtn      = $('saveBtn');
const inputArtist  = $('inputArtist');
const inputAlbum   = $('inputAlbum');
const inputFiles   = $('inputFiles');
const fileLabel    = $('fileLabel');
const colorSwatches= $('colorSwatches');
const customColor  = $('customColor');

/* Sidebar upload + Spotify */
const sidebarFiles = $('sidebarFiles');
const spotifyUrl   = $('spotifyUrl');
const spotifyLoad  = $('spotifyLoad');
const spotifyNote  = $('spotifyNote');

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

/* ═══ Transport bar album sleeve art ═══ */
function updateTbArt(album) {
    const g = gradientFor(album.color);
    tbArt.innerHTML = `
        <div class="tb-sleeve-wrap" style="background:${g}">
            <div class="tb-sleeve-shine"></div>
            <div class="tb-sleeve-vinyl"></div>
            <div class="tb-sleeve-label">
                <div class="tb-sleeve-title">${escapeHtml(album.title)}</div>
                <div class="tb-sleeve-artist">${escapeHtml(album.artist)}</div>
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

    /* VU meter */
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

/* ═══ Load record onto platter ═══ */
async function loadAlbum(album, autoPlay = false) {
    /* If already playing, stop first (with full choreography) */
    if (isPlaying) await stopPlayback();

    /* If a different record is on the platter, fade it out first */
    const isSwap = currentAlbum && currentAlbum.id !== album.id;
    if (isSwap) {
        record.classList.remove('loaded');
        await sleep(450);
    }

    currentAlbum = album;
    currentTrackIndex = 0;

    /* Update label */
    labelDisc.style.background = album.color;
    labelDisc.style.setProperty('--label-color', album.color);
    labelArtist.textContent = album.artist;
    labelAlbum.textContent  = album.title;

    /* Now-playing art — vinyl sleeve preview */
    updateTbArt(album);

    /* Track info */
    tbTrack.textContent  = album.tracks[0]?.name || album.title;
    tbArtist.textContent = album.artist;

    /* Highlight grid card */
    document.querySelectorAll('.album-card').forEach(c =>
        c.classList.toggle('active', c.dataset.id === album.id));

    /* Drop record onto the platter with bounce */
    record.classList.remove('settling');
    record.classList.add('loaded', 'dropping');
    /* the drop animation runs against `transform` — the platter spin
       animation also touches transform, so pause it during the drop */
    if (platterAnim) platterAnim.pause();

    setTimeout(() => {
        record.classList.remove('dropping');
        record.classList.add('settling');
        setTimeout(() => record.classList.remove('settling'), 400);
        if (platterAnim) platterAnim.play();
    }, 850);

    /* Auto-play after the record settles */
    if (autoPlay) {
        await sleep(900);
        if (!isPowered) togglePower(true);
        beginPlayback();
    }
}

function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, c => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));
}

/* ═══ Power & choreographed playback ═══ */
function togglePower(force) {
    isPowered = force !== undefined ? force : !isPowered;
    powerBtn.classList.toggle('on', isPowered);
    document.querySelector('.platter').classList.toggle('powered', isPowered);
    if (!isPowered && isPlaying) stopPlayback();
}

const platterEl = document.querySelector('.platter');
const cueLever  = document.getElementById('cueLever');
const motorStatus = document.getElementById('motorStatus');

/**
 * Play sequence:
 *   1. Power LED on, motor whir
 *   2. Platter ramps up to target speed
 *   3. Tonearm cues up (lifts off rest)
 *   4. Tonearm swings over the record
 *   5. Tonearm lowers (cue down) — stylus drop sound
 *   6. Audio + crackle begin
 */
async function beginPlayback() {
    if (busy) return;
    if (!currentAlbum || currentAlbum.tracks.length === 0) return;
    busy = true;

    if (!isPowered) togglePower(true);
    if (audioCtx.state === 'suspended') await audioCtx.resume();
    ensureAudioGraph();

    /* Motor */
    motorStatus.classList.add('running');
    cueLever.classList.add('engaged');
    playMotorStart();

    /* Platter ramps up */
    const target = speed === 45 ? 1.35 : 1.0;
    const platterRamp = rampPlatter(target, 1100);

    /* While platter spins up, lift the tonearm */
    await sleep(250);
    tonearm.classList.add('cued-up');

    /* Wait for platter to be near speed */
    await sleep(450);

    /* Swing arm over the record (still cued up) */
    tonearm.classList.add('over-record-up');
    await sleep(900);

    /* Lower the arm onto the record */
    tonearm.classList.remove('cued-up', 'over-record-up');
    tonearm.classList.add('over-record');
    playStylusDrop();

    await sleep(450);

    /* Now music starts */
    const track = currentAlbum.tracks[currentTrackIndex];
    audioEl.src = track.url;
    try {
        await audioEl.play();
        isPlaying = true;
        startCrackle();
        updatePlayUI();
        cancelAnimationFrame(rafId);
        rafId = requestAnimationFrame(tick);
        tbTrack.textContent  = track.name;
        tbArtist.textContent = currentAlbum.artist;
    } catch (err) {
        console.warn('Playback failed:', err);
    }

    await platterRamp;
    busy = false;
}

/**
 * Stop sequence (reverse choreography):
 *   1. Audio fades / pauses
 *   2. Tonearm lifts (cue up)
 *   3. Tonearm swings back to rest position
 *   4. Tonearm lowers onto the rest cradle
 *   5. Platter ramps down
 */
async function stopPlayback() {
    if (!isPlaying && !tonearm.classList.contains('over-record')) return;
    busy = true;

    /* Pause audio first */
    isPlaying = false;
    audioEl.pause();
    stopCrackle();
    cancelAnimationFrame(rafId);
    updatePlayUI();
    vuBars.forEach(b => b.classList.remove('lit'));

    /* Lift the arm off the record */
    tonearm.classList.remove('over-record');
    tonearm.classList.add('over-record-up');
    await sleep(350);

    /* Swing back to rest position */
    tonearm.classList.remove('over-record-up');
    tonearm.classList.add('cued-up');
    await sleep(800);

    /* Lower arm onto rest cradle */
    tonearm.classList.remove('cued-up');
    cueLever.classList.remove('engaged');
    await sleep(350);

    /* Spin down the platter */
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

tonearm.addEventListener('click', () => {
    if (!currentAlbum || busy) return;
    isPlaying ? stopPlayback() : beginPlayback();
});

cueLever.addEventListener('click', () => {
    if (!currentAlbum || busy) return;
    isPlaying ? stopPlayback() : beginPlayback();
});

playBtn.addEventListener('click', () => {
    if (!currentAlbum || busy) return;
    isPlaying ? stopPlayback() : beginPlayback();
});

prevBtn.addEventListener('click', () => {
    if (!currentAlbum) return;
    if (audioEl.currentTime > 3 && isPlaying) {
        audioEl.currentTime = 0;
        return;
    }
    if (currentTrackIndex > 0) {
        currentTrackIndex--;
        if (isPlaying) {
            const t = currentAlbum.tracks[currentTrackIndex];
            audioEl.src = t.url;
            audioEl.play();
            tbTrack.textContent = t.name;
        }
    }
});

nextBtn.addEventListener('click', () => {
    if (!currentAlbum) return;
    if (currentTrackIndex < currentAlbum.tracks.length - 1) {
        currentTrackIndex++;
        if (isPlaying) {
            const t = currentAlbum.tracks[currentTrackIndex];
            audioEl.src = t.url;
            audioEl.play().catch(() => {});
            tbTrack.textContent = t.name;
        }
    } else {
        /* Skip to next album */
        const albumIdx = albums.findIndex(a => a.id === currentAlbum?.id);
        if (albumIdx >= 0 && albumIdx < albums.length - 1) {
            loadAlbum(albums[albumIdx + 1], isPlaying);
        }
    }
});

document.querySelectorAll('.speed-pill').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.speed-pill').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        speed = parseInt(btn.dataset.speed);
        /* If platter is spinning, transition to new speed */
        if (platterAnim && platterAnim.playbackRate > 0) {
            const target = speed === 45 ? 1.35 : 1.0;
            rampPlatter(target, 600);
        }
    });
});

audioEl.addEventListener('ended', async () => {
    /* Next track within the same album */
    if (currentAlbum && currentTrackIndex < currentAlbum.tracks.length - 1) {
        currentTrackIndex++;
        const t = currentAlbum.tracks[currentTrackIndex];
        audioEl.src = t.url;
        audioEl.play().catch(() => {});
        tbTrack.textContent = t.name;
        return;
    }

    /* Next album in the collection (playlist continues seamlessly) */
    const albumIdx = albums.findIndex(a => a.id === currentAlbum?.id);
    if (albumIdx >= 0 && albumIdx < albums.length - 1) {
        const next = albums[albumIdx + 1];
        currentAlbum = next;
        currentTrackIndex = 0;
        /* Update label disc */
        labelDisc.style.background = next.color;
        labelDisc.style.setProperty('--label-color', next.color);
        labelArtist.textContent = next.artist;
        labelAlbum.textContent  = next.title;
        /* Update transport art */
        updateTbArt(next);
        /* Highlight the new card */
        document.querySelectorAll('.album-card').forEach(c =>
            c.classList.toggle('active', c.dataset.id === next.id));
        const t = next.tracks[0];
        audioEl.src = t.url;
        audioEl.play().catch(() => {});
        tbTrack.textContent  = t.name;
        tbArtist.textContent = next.artist;
        return;
    }

    /* End of the full playlist — stop like the record ran out */
    await stopPlayback();
    progressFill.style.width = '0%';
    progressHead.style.left  = '0%';
    currentTimeEl.textContent = '0:00';
    totalTimeEl.textContent   = '0:00';
});

/* ═══ Collection ═══ */
function renderCollection(filter = '') {
    albumRow.innerHTML = '';
    const list = albums.filter(a => {
        const t = (a.title + ' ' + a.artist).toLowerCase();
        return t.includes(filter.toLowerCase());
    });

    emptyCollection.style.display = albums.length === 0 ? 'block' : 'none';

    list.forEach(album => {
        const card = document.createElement('div');
        card.className = 'album-card';
        card.dataset.id = album.id;
        if (currentAlbum && currentAlbum.id === album.id) card.classList.add('active');

        card.innerHTML = `
            <div class="album-cover">
                <div class="album-cover-art" style="--cover-bg: ${album.color}; background: ${gradientFor(album.color)}">
                    <div class="album-cover-text">
                        <div class="cover-title">${escapeHtml(album.title)}</div>
                        <div class="cover-artist">${escapeHtml(album.artist)}</div>
                    </div>
                </div>
                <div class="album-cover-overlay">
                    <button class="cover-play-btn" title="Play">
                        <svg viewBox="0 0 16 16" fill="currentColor" width="14" height="14">
                            <polygon points="4,2 14,8 4,14"/>
                        </svg>
                    </button>
                </div>
            </div>
            <div class="album-info">
                <div class="album-info-title">${escapeHtml(album.title)}</div>
                <div class="album-info-artist">${escapeHtml(album.artist)}</div>
            </div>
        `;

        card.querySelector('.cover-play-btn').addEventListener('click', e => {
            e.stopPropagation();
            loadAlbum(album, true);
        });
        card.addEventListener('click', () => loadAlbum(album));
        albumRow.appendChild(card);
    });
}

searchInput.addEventListener('input', () => renderCollection(searchInput.value));

/* ═══ Sidebar quick-upload ═══ */
const QUICK_COLORS = ['#8b3a3a','#3d5a4a','#2c4858','#5a3d6a','#6b4226','#2a4a5a'];
const MAX_TRACKS = 15;

sidebarFiles?.addEventListener('change', () => {
    let files = Array.from(sidebarFiles.files);
    if (!files.length) return;
    if (files.length > MAX_TRACKS) {
        files = files.slice(0, MAX_TRACKS);
        showSpotifyNote(`Only the first ${MAX_TRACKS} songs were added.`);
    }

    const firstName = files[0].name.replace(/\.[^/.]+$/, '');
    const title  = firstName.length > 40 ? firstName.slice(0, 40) + '…' : firstName;
    const artist = 'Uploaded';
    const color  = QUICK_COLORS[Math.floor(Math.random() * QUICK_COLORS.length)];

    const tracks = files.map(f => ({
        name: f.name.replace(/\.[^/.]+$/, ''),
        url:  URL.createObjectURL(f),
    }));

    const album = { id: Date.now().toString(), artist, title, color, tracks };
    albums.push(album);
    renderCollection(searchInput.value);
    loadAlbum(album);
    sidebarFiles.value = '';
});

/* ═══ Spotify URL ═══ */
function showSpotifyNote(msg) {
    if (!spotifyNote) return;
    spotifyNote.textContent = msg;
    spotifyNote.classList.add('visible');
    clearTimeout(showSpotifyNote._t);
    showSpotifyNote._t = setTimeout(() => spotifyNote.classList.remove('visible'), 5000);
}

spotifyLoad?.addEventListener('click', () => {
    const url = (spotifyUrl?.value || '').trim();
    if (!url) return;
    if (!url.includes('spotify.com')) {
        showSpotifyNote('Please paste a valid Spotify playlist URL.');
        return;
    }
    showSpotifyNote('Spotify streaming requires an API key & Premium. Upload local files instead.');
});

spotifyUrl?.addEventListener('keydown', e => {
    if (e.key === 'Enter') spotifyLoad?.click();
});

/* ═══ Add Album modal ═══ */
let chosenColor = '#8b3a3a';

function openModal() { modalOverlay.classList.remove('hidden'); }
function closeModal() {
    modalOverlay.classList.add('hidden');
    inputArtist.value = '';
    inputAlbum.value = '';
    inputFiles.value = '';
    fileLabel.textContent = 'Choose audio files from your computer';
}

openAddBtn?.addEventListener('click', openModal);
emptyAddBtn?.addEventListener('click', openModal);
modalClose.addEventListener('click', closeModal);
cancelBtn.addEventListener('click', closeModal);
modalOverlay.addEventListener('click', e => {
    if (e.target === modalOverlay) closeModal();
});

colorSwatches.querySelectorAll('.swatch').forEach(sw => {
    sw.addEventListener('click', () => {
        colorSwatches.querySelectorAll('.swatch').forEach(s => s.classList.remove('active'));
        sw.classList.add('active');
        chosenColor = sw.dataset.color;
        customColor.value = chosenColor;
    });
});

customColor.addEventListener('input', e => {
    chosenColor = e.target.value;
    colorSwatches.querySelectorAll('.swatch').forEach(s => s.classList.remove('active'));
});

inputFiles.addEventListener('change', () => {
    const n = inputFiles.files.length;
    fileLabel.textContent = n === 0
        ? 'Choose audio files from your computer'
        : `${n} track${n > 1 ? 's' : ''} ready`;
});

saveBtn.addEventListener('click', () => {
    const artist = inputArtist.value.trim();
    const title  = inputAlbum.value.trim();
    const files  = inputFiles.files;

    if (!artist || !title || files.length === 0) {
        alert('Please add an artist, album title, and at least one audio file.');
        return;
    }

    const tracks = Array.from(files).slice(0, MAX_TRACKS).map(f => ({
        name: f.name.replace(/\.[^/.]+$/, ''),
        url:  URL.createObjectURL(f),
    }));

    const album = {
        id: Date.now().toString(),
        artist, title,
        color: chosenColor,
        tracks,
    };

    albums.push(album);
    renderCollection(searchInput.value);
    closeModal();
    loadAlbum(album);
});

/* ═══ Demo album ═══ */
function buildDemoAlbum() {
    const sr = audioCtx.sampleRate;
    const dur = 18;
    const buf = audioCtx.createBuffer(2, sr * dur, sr);
    const notes = [261.63, 329.63, 392.00, 523.25, 440.00, 349.23, 293.66, 261.63];

    for (let ch = 0; ch < 2; ch++) {
        const d = buf.getChannelData(ch);
        for (let i = 0; i < d.length; i++) {
            const t   = i / sr;
            const seg = dur / notes.length;
            const ni  = Math.min(Math.floor(t / seg), notes.length - 1);
            const f   = notes[ni];
            const pos = (t % seg) / seg;
            const env = Math.sin(pos * Math.PI) * 0.35;
            d[i] = (
                Math.sin(2 * Math.PI * f * t) * 0.6 +
                Math.sin(2 * Math.PI * f * 2 * t) * 0.25 +
                Math.sin(2 * Math.PI * f * 3 * t) * 0.1
            ) * env;
        }
    }

    const off = new OfflineAudioContext(2, buf.length, sr);
    const src = off.createBufferSource();
    src.buffer = buf;
    src.connect(off.destination);
    src.start();

    off.startRendering().then(rendered => {
        const blob = new Blob([toWav(rendered)], { type: 'audio/wav' });
        const url  = URL.createObjectURL(blob);
        albums.push({
            id: 'demo-1',
            artist: 'Velvet Hours',
            title:  'After Midnight Sessions',
            color:  '#8b3a3a',
            tracks: [{ name: 'Side A — Opening', url }],
        });
        albums.push({
            id: 'demo-2',
            artist: 'Marlow & The Quiet',
            title:  'Brass & Linen',
            color:  '#3d5a4a',
            tracks: [{ name: 'Untitled No. 3', url }],
        });
        albums.push({
            id: 'demo-3',
            artist: 'Eloise Margaux',
            title:  'Letters to Paris',
            color:  '#c4953a',
            tracks: [{ name: 'Mon Cœur', url }],
        });
        albums.push({
            id: 'demo-4',
            artist: 'The Reading Room',
            title:  'Sunday Mornings',
            color:  '#6b4226',
            tracks: [{ name: 'Quiet Reverie', url }],
        });
        albums.push({
            id: 'demo-5',
            artist: 'Coleman Trio',
            title:  'Smoke & Cedar',
            color:  '#2c4858',
            tracks: [{ name: 'Late Set', url }],
        });
        renderCollection();
    });
}

function toWav(buf) {
    const nc = buf.numberOfChannels, sr = buf.sampleRate;
    const len = buf.length * nc * 2 + 44;
    const ab  = new ArrayBuffer(len);
    const v   = new DataView(ab);
    let o = 0;
    const ws = s => { for (let i = 0; i < s.length; i++) v.setUint8(o++, s.charCodeAt(i)); };
    ws('RIFF'); v.setUint32(o,len-8,true);o+=4;
    ws('WAVE'); ws('fmt '); v.setUint32(o,16,true);o+=4;
    v.setUint16(o,1,true);o+=2;
    v.setUint16(o,nc,true);o+=2;
    v.setUint32(o,sr,true);o+=4;
    v.setUint32(o,sr*nc*2,true);o+=4;
    v.setUint16(o,nc*2,true);o+=2;
    v.setUint16(o,16,true);o+=2;
    ws('data'); v.setUint32(o,buf.length*nc*2,true);o+=4;
    const chs = Array.from({length:nc},(_,i)=>buf.getChannelData(i));
    for (let i=0;i<buf.length;i++)
        for (let c=0;c<nc;c++) {
            const s = Math.max(-1,Math.min(1,chs[c][i]));
            v.setInt16(o,s*0x7FFF,true);o+=2;
        }
    return ab;
}

/* ═══ Init ═══ */
buildDemoAlbum();
updatePlayUI();
