'use strict';

/**
 * Netwerkadapter-detectie voor sACN multicast.
 * Op Windows moet addMembership() het lokale interface-IP kennen;
 * zonder dat komt er geen verkeer binnen, ook al zendt SACNViewer wel.
 */

const os = require('os');
const { execSync } = require('child_process');

/** Hypervisor-ranges — wel tonen, niet automatisch prefereren. */
function isHypervisorVirtual(address) {
  return address.startsWith('192.168.56.') || address.startsWith('192.168.57.');
}

function isLinkLocal(address) {
  return address.startsWith('169.254.');
}

function isLikelyVirtual(address) {
  return isHypervisorVirtual(address) || isLinkLocal(address);
}

function ipv4Family(family) {
  return family === 'IPv4' || family === 4;
}

function listMacHardwarePorts() {
  try {
    const text = execSync('networksetup -listallhardwareports', { encoding: 'utf8', timeout: 5000 });
    const ports = [];
    let current = null;
    let inVlan = false;
    let vlan = null;

    for (const line of text.split('\n')) {
      const vlanName = line.match(/^VLAN User Defined Name:\s*(.+)$/);
      if (vlanName) {
        if (vlan) ports.push(vlan);
        vlan = { label: vlanName[1].trim(), device: '', mac: '', parent: '', tag: '' };
        inVlan = true;
        continue;
      }
      if (inVlan && vlan) {
        const parent = line.match(/^Parent Device:\s*(\S+)$/);
        if (parent) { vlan.parent = parent[1]; continue; }
        const dev = line.match(/^Device \("Hardware" Port\):\s*(\S+)$/);
        if (dev) { vlan.device = dev[1]; continue; }
        const tag = line.match(/^Tag:\s*(\d+)$/);
        if (tag) {
          vlan.tag = tag[1];
          vlan.label = `${vlan.label} (VLAN ${tag[1]})`;
          continue;
        }
        if (line.trim() === '' && vlan.device) {
          ports.push(vlan);
          vlan = null;
          inVlan = false;
        }
        continue;
      }

      const hw = line.match(/^Hardware Port:\s*(.+)$/);
      if (hw) {
        if (current) ports.push(current);
        current = { label: hw[1].trim(), device: '', mac: '' };
        continue;
      }
      const dev = line.match(/^Device:\s*(\S+)$/);
      if (dev && current) {
        current.device = dev[1];
        continue;
      }
      const mac = line.match(/^Ethernet Address:\s*(\S+)$/i);
      if (mac && current) current.mac = mac[1].toLowerCase();
    }
    if (current) ports.push(current);
    if (vlan && vlan.device) ports.push(vlan);
    return ports.filter((p) => p.device);
  } catch (_) {
    return [];
  }
}

/** Alleen IPs die echt op een lokale adapter zitten — geen gateways. */
function isKnownLocalAddress(address) {
  const { interfaces } = listInterfaces();
  return interfaces.some((i) => i.address === address && i.selectable);
}

function validateInterfaceSelection(value) {
  const raw = String(value || '').trim();
  if (!raw || raw.toLowerCase() === 'auto') return { ok: true, value: 'auto' };
  if (!isKnownLocalAddress(raw)) {
    return {
      ok: false,
      error: `${raw} is geen actieve adapter op deze machine. Kies een adapter uit de lijst of Automatisch.`,
    };
  }
  return { ok: true, value: raw };
}

function listWindowsAdapters() {
  try {
    const script = [
      'Get-NetAdapter',
      '| Select-Object Name,InterfaceDescription,Status,MacAddress',
      '| ConvertTo-Json -Compress',
    ].join(' ');
    const text = execSync(`powershell -NoProfile -Command "${script}"`, {
      encoding: 'utf8',
      timeout: 10000,
    });
    const data = JSON.parse(text.trim() || '[]');
    const list = Array.isArray(data) ? data : [data];
    return list
      .filter((a) => a && a.Name)
      .map((a) => ({
        label: String(a.InterfaceDescription || a.Name).trim(),
        device: String(a.Name).trim(),
        mac: String(a.MacAddress || '').replace(/-/g, ':').toLowerCase(),
        inactive: String(a.Status || '').toLowerCase() !== 'up',
      }));
  } catch (_) {
    return [];
  }
}

function listLinuxInterfaces() {
  try {
    const names = execSync('ls /sys/class/net', { encoding: 'utf8', timeout: 5000 })
      .split(/\s+/)
      .map((s) => s.trim())
      .filter(Boolean);
    return names.map((device) => {
      let mac = '';
      let operstate = '';
      try {
        mac = execSync(`cat /sys/class/net/${device}/address`, { encoding: 'utf8', timeout: 2000 }).trim();
      } catch (_) { /* ignore */ }
      try {
        operstate = execSync(`cat /sys/class/net/${device}/operstate`, { encoding: 'utf8', timeout: 2000 }).trim();
      } catch (_) { /* ignore */ }
      return {
        label: device,
        device,
        mac,
        inactive: operstate !== 'up' && operstate !== 'unknown',
      };
    });
  } catch (_) {
    return [];
  }
}

function listHardwarePorts() {
  if (process.platform === 'darwin') return listMacHardwarePorts();
  if (process.platform === 'win32') return listWindowsAdapters();
  return listLinuxInterfaces();
}

function indexOsInterfaces() {
  const nets = os.networkInterfaces();
  const byName = new Map();

  for (const [name, addrs] of Object.entries(nets)) {
    if (!addrs || !addrs.length) continue;

    const ipv4 = [];
    let hasIpv6 = false;
    let internal = false;
    let mac = '';

    for (const addr of addrs) {
      if (addr.mac && addr.mac !== '00:00:00:00:00:00') mac = addr.mac.toLowerCase();
      if (addr.internal) internal = true;
      if (ipv4Family(addr.family)) {
        ipv4.push({
          address: addr.address,
          netmask: addr.netmask,
          internal: !!addr.internal,
          linkLocal: isLinkLocal(addr.address),
          virtual: isHypervisorVirtual(addr.address),
        });
      } else {
        hasIpv6 = true;
      }
    }

    const externalIpv4 = ipv4.filter((a) => !a.internal);
    byName.set(name, {
      ipv4,
      externalIpv4,
      hasIpv6,
      internal: internal && externalIpv4.length === 0,
      mac,
    });
  }

  return byName;
}

function buildInterfaceEntry(name, label, osInfo, hwMeta) {
  const externalIpv4 = osInfo ? osInfo.externalIpv4 : [];
  const primary = externalIpv4[0] || (osInfo && osInfo.ipv4[0]) || null;
  const address = primary ? primary.address : '';
  const internal = !!(osInfo && osInfo.internal) || name === 'lo' || name === 'lo0';
  const inactive = !!(hwMeta && hwMeta.inactive) || (!address && !internal && !!(osInfo && osInfo.hasIpv6));
  const ipv6Only = !address && !internal && !!(osInfo && osInfo.hasIpv6);

  return {
    name,
    label: label || name,
    address,
    netmask: primary ? primary.netmask : '',
    mac: (osInfo && osInfo.mac) || (hwMeta && hwMeta.mac) || '',
    internal,
    inactive: inactive || ipv6Only,
    ipv6Only,
    linkLocal: primary ? primary.linkLocal : false,
    virtual: primary ? primary.virtual : false,
    selectable: !!address && !internal,
    recommended: false,
  };
}

/** Alle netwerkadapters — hardware + OS, inclusief inactieve zonder IP. */
function listInterfaces() {
  const osIfaces = indexOsInterfaces();
  const hardware = listHardwarePorts();
  const out = [];
  const seen = new Set();

  for (const hw of hardware) {
    const osInfo = osIfaces.get(hw.device);
    out.push(buildInterfaceEntry(hw.device, hw.label, osInfo, hw));
    seen.add(hw.device);
  }

  for (const [name, osInfo] of osIfaces.entries()) {
    if (seen.has(name)) continue;
    out.push(buildInterfaceEntry(name, name, osInfo, null));
    seen.add(name);
  }

  out.sort((a, b) => {
    if (a.selectable !== b.selectable) return a.selectable ? -1 : 1;
    if (a.internal !== b.internal) return a.internal ? 1 : -1;
    return String(a.label).localeCompare(String(b.label), 'nl');
  });

  let recommended = '';
  for (const iface of out) {
    if (iface.selectable && !iface.linkLocal && !iface.virtual) {
      recommended = iface.address;
      break;
    }
  }
  if (!recommended) {
    const fallback = out.find((i) => i.selectable);
    recommended = fallback ? fallback.address : '';
  }

  for (const iface of out) {
    iface.recommended = !!recommended && iface.address === recommended;
  }

  return { interfaces: out, recommended };
}

/**
 * Bepaal op welke interface-IP's we multicast moeten joinen.
 * @param {string} configValue - '', 'auto', of een specifiek IP
 */
function resolveJoinAddresses(configValue) {
  const { interfaces } = listInterfaces();
  const usable = interfaces.filter((i) => i.selectable);

  const raw = String(configValue || '').trim().toLowerCase();
  if (!raw || raw === 'auto') {
    return {
      mode: 'auto',
      addresses: usable.map((i) => i.address),
      selected: '',
    };
  }

  const match = usable.find((i) => i.address === configValue.trim());
  if (match) {
    return { mode: 'manual', addresses: [match.address], selected: match.address };
  }

  // Onbekend IP — toch proberen (adapter kan net gewisseld zijn)
  return { mode: 'manual', addresses: [configValue.trim()], selected: configValue.trim(), unknown: true };
}

function sanitizeConfigInterface(configValue) {
  const check = validateInterfaceSelection(configValue);
  if (check.ok) return check.value;
  return 'auto';
}

module.exports = {
  listInterfaces,
  resolveJoinAddresses,
  isLikelyVirtual,
  isHypervisorVirtual,
  isLinkLocal,
  isKnownLocalAddress,
  validateInterfaceSelection,
  sanitizeConfigInterface,
};
