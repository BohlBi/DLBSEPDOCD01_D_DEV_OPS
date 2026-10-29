#!/usr/bin/env node
// Berechnet die nächste Version aus den Commits seit dem letzten Tag vX.Y.Z.
//
// Aufruf: node scripts/next-version.mjs [--ref <commit>] [--pre <suffix>] [--changelog <datei>]
//   --ref        Commit, für den gerechnet wird (Standard: HEAD)
//   --pre        Vorab-Kennung, z. B. "rc.a1b2c3d" -> 1.5.0-rc.a1b2c3d
//   --changelog  schreibt Release Notes (Markdown) in die angegebene Datei
//
// Ausgabe: version, bump und previous auf stdout sowie in $GITHUB_OUTPUT (falls gesetzt).
// Gibt es keine release-relevanten Commits, ist version leer.
import { execFileSync } from 'node:child_process';
import { appendFileSync, writeFileSync } from 'node:fs';
import { parseArgs } from 'node:util';
import { determineBump, bumpVersion, buildChangelog } from './semver.mjs';

const { values } = parseArgs({
  options: {
    ref: { type: 'string', default: 'HEAD' },
    pre: { type: 'string' },
    changelog: { type: 'string' },
  },
});

const git = (...args) =>
  execFileSync('git', args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();

let lastTag = null;
try {
  lastTag = git('describe', '--tags', '--abbrev=0', '--match', 'v[0-9]*.[0-9]*.[0-9]*', values.ref);
} catch {
  // Noch kein Release vorhanden: Startpunkt 0.0.0, alle Commits zählen.
}

const range = lastTag ? `${lastTag}..${values.ref}` : values.ref;
// Merge-Commits ("Merge pull request …") tragen keine Information, nur die Squash-Commits zählen.
const messages = git('log', range, '--no-merges', '--format=%B%x1e')
  .split('\x1e')
  .map((m) => m.trim())
  .filter(Boolean);

const bump = determineBump(messages);
const next = bumpVersion(lastTag ?? '0.0.0', bump);
const version = next && values.pre ? `${next}-${values.pre}` : (next ?? '');

if (values.changelog) writeFileSync(values.changelog, buildChangelog(messages) + '\n');

const result = { version, bump, previous: lastTag ?? '' };
for (const [key, value] of Object.entries(result)) console.log(`${key}=${value}`);
if (process.env.GITHUB_OUTPUT) {
  appendFileSync(process.env.GITHUB_OUTPUT,
    Object.entries(result).map(([k, v]) => `${k}=${v}`).join('\n') + '\n');
}
