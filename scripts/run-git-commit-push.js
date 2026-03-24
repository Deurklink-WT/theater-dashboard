#!/usr/bin/env node
/**
 * Commit + push met logbestand in de reporoot.
 * Gebruik vanaf projectroot: node scripts/run-git-commit-push.js
 */
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const log = path.join(root, '.git-commit-push-log.txt');

function run(cmd) {
  const header = `\n$ ${cmd}\n`;
  try {
    const out = execSync(cmd, { cwd: root, encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 });
    fs.appendFileSync(log, header + out + '\n');
    return out;
  } catch (e) {
    const msg =
      e.stdout || e.stderr
        ? String(e.stdout || '') + '\n' + String(e.stderr || '')
        : String(e.message || e);
    fs.appendFileSync(log, header + msg + '\n');
    throw e;
  }
}

try {
  fs.writeFileSync(log, '', 'utf8');
  try {
    run('rm -f .github/workflows/codeql.yml');
  } catch (_) {
    /* ignore */
  }
  run('git status -sb');
  run('git add -A');
  run('git status');
  run(
    'git commit -m "release: 1.5.8 — geen GitHub-token in builds, CodeQL Node 24, UI-versie"'
  );
  try {
    run('git push -u origin HEAD');
  } catch (_) {
    run('git push -u origin main');
  }
  fs.appendFileSync(log, '\nOK: klaar.\n');
} catch (e) {
  fs.appendFileSync(log, '\nFOUT: ' + (e.message || e) + '\n');
  process.exitCode = 1;
}
