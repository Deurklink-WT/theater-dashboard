/**
 * Automatische updates voor geïnstalleerde builds (niet bij `npm start`).
 * Stuurt status naar de renderer (header-banner) via kanaal `update-status`.
 * Eerste check na opstart loopt stil (geen zoek- of up-to-date-banner); bij beschikbare update of fout wél.
 *
 * Private GitHub-repo: API is niet publiek. Zet GH_TOKEN (read-only, alleen repo releases)
 * op de machine, of gebruik UPDATE_BASE_URL naar een publieke map met latest*.yml.
 * Optioneel: bij `npm run build` kan `scripts/inject-update-token.js` een token uit de omgeving
 * in de build schrijven (niet in git; zie docs/UPDATES.md).
 */

const path = require('path');
const { app } = require('electron');
const { autoUpdater } = require('electron-updater');

/** Alleen aanwezig na `npm run inject-update-token` vóór build (zie scripts/). */
let bakedInGithubToken = '';
try {
  bakedInGithubToken = String(require('./generated/update-token')).trim();
} catch (_) {
  /* bestand ontbreekt vóór eerste inject — ok */
}

let intervalId = null;
/** Eerste automatische check na opstart: geen "Zoeken…" / "Je bent up-to-date"-banner; wél bij update of fout. */
let suppressQuietStartupBanner = true;

function loadGithubPublish() {
  try {
    const pkg = require(path.join(__dirname, '..', 'package.json'));
    const pub = pkg?.build?.publish;
    const list = Array.isArray(pub) ? pub : pub ? [pub] : [];
    const g = list.find((p) => p && p.provider === 'github');
    if (g && g.owner && g.repo) return { owner: g.owner, repo: g.repo };
  } catch (_) {
    /* ignore */
  }
  return null;
}

function sendStatus(mainWindow, payload) {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('update-status', payload);
  }
}

function isLikelyPrivateRepoError(msg) {
  const s = String(msg || '');
  return (
    /404|not\s*found|403|401|bad credentials|could not find|unable to find|latest version|ERR_UPDATER/i.test(s) ||
    s.includes('HttpError') ||
    s.includes('releases/latest') ||
    s.includes('api.github.com')
  );
}

function setupAutoUpdater(mainWindow) {
  if (!app.isPackaged) return;
  if (process.env.SKIP_AUTO_UPDATE === '1') return;

  const base = String(process.env.UPDATE_BASE_URL || '').trim().replace(/\/$/, '');
  const ghToken = String(
    process.env.GH_TOKEN || process.env.GITHUB_TOKEN || bakedInGithubToken || ''
  ).trim();

  if (base) {
    try {
      autoUpdater.setFeedURL({ provider: 'generic', url: base });
    } catch (e) {
      console.warn('[Update] UPDATE_BASE_URL ongeldig:', e.message);
    }
  } else {
    const gh = loadGithubPublish();
    if (gh) {
      const feed = {
        provider: 'github',
        owner: gh.owner,
        repo: gh.repo
      };
      if (ghToken) {
        feed.private = true;
        feed.token = ghToken;
      }
      autoUpdater.setFeedURL(feed);
    }
  }

  autoUpdater.autoDownload = true;
  autoUpdater.autoInstallOnAppQuit = true;

  autoUpdater.on('checking-for-update', () => {
    if (suppressQuietStartupBanner) return;
    sendStatus(mainWindow, { phase: 'checking' });
  });

  autoUpdater.on('update-available', (info) => {
    suppressQuietStartupBanner = false;
    sendStatus(mainWindow, {
      phase: 'available',
      version: info?.version || null
    });
  });

  autoUpdater.on('update-not-available', () => {
    if (suppressQuietStartupBanner) {
      suppressQuietStartupBanner = false;
      return;
    }
    sendStatus(mainWindow, { phase: 'not-available' });
  });

  autoUpdater.on('download-progress', (progress) => {
    sendStatus(mainWindow, {
      phase: 'downloading',
      percent: typeof progress?.percent === 'number' ? progress.percent : null,
      version: progress?.version || null
    });
  });

  autoUpdater.on('update-downloaded', (info) => {
    sendStatus(mainWindow, {
      phase: 'downloaded',
      version: info?.version || null
    });
  });

  autoUpdater.on('error', (err) => {
    suppressQuietStartupBanner = false;
    const msg = err?.message || String(err);
    console.warn('[Update]', msg);

    if (!base && !ghToken && isLikelyPrivateRepoError(msg)) {
      sendStatus(mainWindow, {
        phase: 'info',
        info: 'private_repo',
        detail: msg
      });
      return;
    }

    sendStatus(mainWindow, {
      phase: 'error',
      error: msg
    });
  });

  setTimeout(() => {
    autoUpdater.checkForUpdates().catch((e) => {
      suppressQuietStartupBanner = false;
      const msg = e?.message || String(e);
      console.warn('[Update] check failed:', msg);
      // Alleen expliciete info-hint; echte fouten komen via `error`-event (voorkomt dubbele banners).
      if (!base && !ghToken && isLikelyPrivateRepoError(msg)) {
        sendStatus(mainWindow, { phase: 'info', info: 'private_repo', detail: msg });
      }
    });
  }, 8000);

  if (intervalId) clearInterval(intervalId);
  intervalId = setInterval(() => {
    autoUpdater.checkForUpdates().catch(() => {});
  }, 24 * 60 * 60 * 1000);
}

async function checkForUpdatesNow() {
  if (!app.isPackaged) {
    return { ok: false, reason: 'development' };
  }
  if (process.env.SKIP_AUTO_UPDATE === '1') {
    return { ok: false, reason: 'disabled' };
  }
  suppressQuietStartupBanner = false;
  try {
    const r = await autoUpdater.checkForUpdates();
    return {
      ok: true,
      updateAvailable: !!r?.updateInfo,
      version: r?.updateInfo?.version || null
    };
  } catch (e) {
    return { ok: false, error: e?.message || String(e) };
  }
}

/** Start download expliciet (banner-klik). autoDownload kan soms niet starten of vastlopen. */
async function downloadUpdateNow() {
  if (!app.isPackaged) {
    return { ok: false, reason: 'development' };
  }
  if (process.env.SKIP_AUTO_UPDATE === '1') {
    return { ok: false, reason: 'disabled' };
  }
  try {
    await autoUpdater.downloadUpdate();
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e?.message || String(e) };
  }
}

function quitAndInstallUpdate() {
  if (!app.isPackaged) {
    return { ok: false, reason: 'development' };
  }
  if (process.env.SKIP_AUTO_UPDATE === '1') {
    return { ok: false, reason: 'disabled' };
  }
  try {
    autoUpdater.quitAndInstall(false, true);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e?.message || String(e) };
  }
}

module.exports = { setupAutoUpdater, checkForUpdatesNow, downloadUpdateNow, quitAndInstallUpdate };
