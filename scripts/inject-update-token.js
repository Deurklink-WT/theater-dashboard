#!/usr/bin/env node
/**
 * Schrijft src/generated/update-token.js vóór electron-builder.
 * Leest GH_TOKEN of GITHUB_TOKEN uit de omgeving (CI/lokale release-build).
 *
 * ⚠️  Nooit een echte token in git committen — alleen deze build-stap gebruiken.
 * ⚠️  Een token in de geïnstalleerde app is uit de binary te halen; gebruik een
 *     fine-grained PAT met minimale rechten, of liever UPDATE_BASE_URL.
 */
const fs = require('fs');
const path = require('path');

const out = path.join(__dirname, '..', 'src', 'generated', 'update-token.js');
const token = String(process.env.GH_TOKEN || process.env.GITHUB_TOKEN || '').trim();
const allowBakedToken = String(process.env.ALLOW_BAKED_UPDATE_TOKEN || '').trim() === '1';
const tokenForModule = allowBakedToken ? token : '';

fs.mkdirSync(path.dirname(out), { recursive: true });

const body = `/** Auto-generated door scripts/inject-update-token.js — niet bewerken. */
module.exports = ${JSON.stringify(tokenForModule)};
`;

fs.writeFileSync(out, body, 'utf8');

if (token && allowBakedToken) {
  console.log(
    '[inject-update-token] token weggeschreven (lengte ' + token.length + ', niet in logs tonen)'
  );
} else if (token && !allowBakedToken) {
  console.log(
    '[inject-update-token] token gedetecteerd maar NIET ingebakken (set ALLOW_BAKED_UPDATE_TOKEN=1 om expliciet toe te staan)'
  );
} else {
  console.log(
    '[inject-update-token] geen GH_TOKEN/GITHUB_TOKEN — lege module'
  );
}
