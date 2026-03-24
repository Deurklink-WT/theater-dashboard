#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const htmlPath = path.join(root, 'src', 'renderer', 'index.html');
const pkgPath = path.join(root, 'package.json');

let html = fs.readFileSync(htmlPath, 'utf8');

html = html.replace(
  /<div class="modal-header-version">v[\d.]+<\/div>/,
  '<div class="modal-header-version">v1.5.8</div>'
);

html = html.replace(
  /<span style="color: #a0aec0;">Theater Dashboard v[\d.]+<\/span>/,
  '<span style="color: #a0aec0;">Theater Dashboard v1.5.8</span>'
);

html = html.replace(
  /<span>v[\d.]+ © 2026 PdV<\/span>/,
  '<span>v1.5.8 © 2026 PdV</span>'
);

const block158 = `                                    <!-- Version 1.5.8 -->
                                    <div style="margin-bottom: 1rem;">
                                        <h5 style="color: #cbd5e0; font-size: 0.95rem; margin-bottom: 0.5rem; ft-weight: 600;">
                                            v1.5.8 (24-03-2026)
                                        </h5>
                                        <ul style="margin-left: 1.25rem; margin-bottom: 0; padding-left: 0.5rem;">
                                            <li style="margin-bottom: 0.25rem;">
                                                <strong style="color: #cbd5e0;">Beveiliging:</strong> Geen GitHub-token meer in installers; build negeert <code>GH_TOKEN</code>/<code>GITHUB_TOKEN</code> daarvoor (zie <code>docs/UPDATES.md</code>).
                                            </li>
                                            <li style="margin-bottom: 0.25rem;">
                                                <strong style="color: #cbd5e0;">CI:</strong> CodeQL-workflow met acties compatibel met Node 24 op GitHub Actions.
                                            </li>
                                            <li style="margin-bottom: 0.25rem;">
                                                <strong style="color: #cbd5e0;">UI:</strong> Versie in instellingen en footer op 1.5.8.
                                            </li>
                                        </ul>
                                    </div>

`;

const marker = '<!-- Version 1.5.6 -->';
if (!html.includes('<!-- Version 1.5.8 -->')) {
  html = html.replace(marker, block158 + marker);
}

fs.writeFileSync(htmlPath, html, 'utf8');
console.log('OK:', htmlPath);

const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
pkg.version = '1.5.8';
fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n', 'utf8');
console.log('OK:', pkgPath, '→ 1.5.8');
