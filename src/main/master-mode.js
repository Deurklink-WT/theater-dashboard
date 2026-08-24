const crypto = require('crypto');
const dgram = require('dgram');
const http = require('http');
const os = require('os');

const DISCOVERY_PORT = Number(process.env.SHIFT_HAPPENS_MASTER_DISCOVERY_PORT || 38471);
const DEFAULT_MASTER_PORT = Number(process.env.SHIFT_HAPPENS_MASTER_PORT || 3847);
/** Vereist env SHIFT_HAPPENS_MASTER_UNLOCK_PASSWORD; leeg = fail-closed (geen ontgrendeling). */
const UNLOCK_PASSWORD = String(process.env.SHIFT_HAPPENS_MASTER_UNLOCK_PASSWORD || '').trim();
const UNLOCK_GRANT_MS = 90 * 1000;

function listIpv4Addresses() {
  const out = [];
  const nets = os.networkInterfaces();
  for (const rows of Object.values(nets || {})) {
    for (const row of rows || []) {
      if (!row || row.internal || row.family !== 'IPv4') continue;
      if (!row.address) continue;
      out.push(String(row.address));
    }
  }
  return [...new Set(out)];
}

function normalizePort(v, fallback = DEFAULT_MASTER_PORT) {
  const n = Number(v);
  if (!Number.isFinite(n) || n < 1 || n > 65535) return fallback;
  return Math.round(n);
}

class MasterModeService {
  constructor({ getName }) {
    this.getName = getName;
    this.nodeId = crypto.randomUUID();
    this.server = null;
    this.discoverySocket = null;
    this.heartbeatTimer = null;
    this.running = false;
    this.masterPort = DEFAULT_MASTER_PORT;
    this.unlockedUntil = 0;
  }

  getStatus() {
    return {
      enabled: this.running,
      port: this.masterPort,
      discoveryPort: DISCOVERY_PORT,
      nodeId: this.nodeId,
      addresses: this.running ? listIpv4Addresses() : [],
      name: this.getName()
    };
  }

  unlock(password) {
    if (!UNLOCK_PASSWORD || String(password || '') !== UNLOCK_PASSWORD) {
      return { success: false, error: 'INVALID_PASSWORD' };
    }
    this.unlockedUntil = Date.now() + UNLOCK_GRANT_MS;
    return { success: true, validMs: UNLOCK_GRANT_MS };
  }

  hasUnlockGrant() {
    return Date.now() < this.unlockedUntil;
  }

  async discoverMaster({ timeoutMs = 1200 } = {}) {
    return new Promise((resolve) => {
      const socket = dgram.createSocket({ type: 'udp4', reuseAddr: true });
      let done = false;
      const seen = new Set();
      const masters = [];
      const stop = () => {
        if (done) return;
        done = true;
        try {
          socket.close();
        } catch (_) {
          /* ignore */
        }
        resolve(masters);
      };
      socket.on('error', () => stop());
      socket.on('message', (buf, rinfo) => {
        try {
          const msg = JSON.parse(String(buf));
          if (!msg || msg.app !== 'shift-happens-master' || msg.type !== 'announce') return;
          if (!msg.nodeId || msg.nodeId === this.nodeId) return;
          const key = `${msg.nodeId}|${rinfo.address}|${msg.port}`;
          if (seen.has(key)) return;
          seen.add(key);
          masters.push({
            nodeId: String(msg.nodeId),
            name: String(msg.name || ''),
            address: String(rinfo.address || ''),
            port: normalizePort(msg.port),
            timestamp: String(msg.timestamp || '')
          });
        } catch (_) {
          /* ignore */
        }
      });
      socket.bind(0, '0.0.0.0', () => {
        try {
          socket.setBroadcast(true);
          const query = Buffer.from(
            JSON.stringify({
              app: 'shift-happens-master',
              type: 'query',
              nodeId: this.nodeId,
              timestamp: new Date().toISOString()
            })
          );
          socket.send(query, DISCOVERY_PORT, '255.255.255.255');
        } catch (_) {
          stop();
        }
      });
      setTimeout(stop, Math.max(200, Number(timeoutMs) || 1200));
    });
  }

  async start(config = {}) {
    const masterPort = normalizePort(config.port);
    const name = this.getName();
    if (this.running && this.masterPort === masterPort) {
      return { success: true, alreadyRunning: true, status: this.getStatus() };
    }
    const skipUnlock = config && config.skipUnlock === true;
    if (!skipUnlock && !this.hasUnlockGrant()) {
      return { success: false, error: 'LOCKED', message: 'Master mode vereist ontgrendeling met wachtwoord.' };
    }
    const existing = await this.discoverMaster({ timeoutMs: 1000 });
    if (existing.length > 0) {
      return {
        success: false,
        error: 'MASTER_EXISTS',
        existingMaster: existing[0],
        message: `Er draait al een master op ${existing[0].address}:${existing[0].port}.`
      };
    }

    if (this.running) await this.stop();
    try {
      await this.startHttpServer(masterPort);
      await this.startDiscoverySocket(name, masterPort);
      this.masterPort = masterPort;
      this.running = true;
      this.unlockedUntil = 0;
      return { success: true, status: this.getStatus() };
    } catch (error) {
      await this.stop();
      return { success: false, error: 'START_FAILED', message: error.message || String(error) };
    }
  }

  async stop() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
    if (this.discoverySocket) {
      try {
        this.discoverySocket.close();
      } catch (_) {
        /* ignore */
      }
      this.discoverySocket = null;
    }
    if (this.server) {
      await new Promise((resolve) => {
        try {
          this.server.close(() => resolve());
        } catch (_) {
          resolve();
        }
      });
      this.server = null;
    }
    this.running = false;
    return { success: true, status: this.getStatus() };
  }

  async applyConfig(appConfig = {}, opts = {}) {
    const enabled = appConfig.masterModeEnabled === true;
    if (!enabled) return this.stop();
    const port = normalizePort(appConfig.masterModePort);
    return this.start({ port, skipUnlock: opts.skipUnlock === true });
  }

  async startHttpServer(port) {
    await new Promise((resolve, reject) => {
      this.server = http.createServer((req, res) => {
        const path = String(req.url || '/').split('?')[0];
        if (req.method === 'GET' && path === '/api/health') {
          const body = {
            ok: true,
            service: 'shift-happens-master',
            nodeId: this.nodeId,
            mode: 'master'
          };
          res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
          res.end(JSON.stringify(body));
          return;
        }
        if (req.method === 'GET' && path === '/api/master-info') {
          res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
          res.end(JSON.stringify(this.getStatus()));
          return;
        }
        res.writeHead(404, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ ok: false, error: 'Not Found' }));
      });
      this.server.on('error', reject);
      this.server.listen(port, '0.0.0.0', () => resolve());
    });
  }

  async startDiscoverySocket(name, port) {
    await new Promise((resolve, reject) => {
      this.discoverySocket = dgram.createSocket({ type: 'udp4', reuseAddr: true });
      this.discoverySocket.on('error', reject);
      this.discoverySocket.on('message', (buf, rinfo) => {
        let msg = null;
        try {
          msg = JSON.parse(String(buf));
        } catch (_) {
          return;
        }
        if (!msg || msg.app !== 'shift-happens-master' || msg.type !== 'query') return;
        const payload = Buffer.from(
          JSON.stringify({
            app: 'shift-happens-master',
            type: 'announce',
            nodeId: this.nodeId,
            name,
            port,
            timestamp: new Date().toISOString()
          })
        );
        try {
          this.discoverySocket.send(payload, rinfo.port, rinfo.address);
        } catch (_) {
          /* ignore */
        }
      });
      this.discoverySocket.bind(DISCOVERY_PORT, '0.0.0.0', () => {
        try {
          this.discoverySocket.setBroadcast(true);
        } catch (_) {
          /* ignore */
        }
        resolve();
      });
    });

    const announce = () => {
      if (!this.discoverySocket) return;
      const payload = Buffer.from(
        JSON.stringify({
          app: 'shift-happens-master',
          type: 'announce',
          nodeId: this.nodeId,
          name: this.getName(),
          port: this.masterPort,
          timestamp: new Date().toISOString()
        })
      );
      try {
        this.discoverySocket.send(payload, DISCOVERY_PORT, '255.255.255.255');
      } catch (_) {
        /* ignore */
      }
    };
    announce();
    this.heartbeatTimer = setInterval(announce, 4000);
  }
}

module.exports = {
  MasterModeService,
  normalizePort
};
