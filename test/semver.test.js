import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  parseCommit, determineBump, bumpVersion, buildChangelog,
} from '../scripts/semver.mjs';

test('parseCommit erkennt Typ, Scope und Breaking Change', () => {
  assert.deepEqual(parseCommit('feat(overview): neuer Button'), {
    type: 'feat', scope: 'overview', subject: 'neuer Button', breaking: false,
  });
  assert.equal(parseCommit('feat(api)!: Endpunkt geändert').breaking, true);
  assert.equal(parseCommit('fix: x\n\nBREAKING CHANGE: Feld entfernt').breaking, true);
  assert.equal(parseCommit('Merge pull request #12 from x/dev'), null);
});

test('determineBump nimmt die höchste Erhöhung', () => {
  assert.equal(determineBump(['chore(deps): update', 'docs: readme']), 'none');
  assert.equal(determineBump(['fix(map): x', 'chore: y']), 'patch');
  assert.equal(determineBump(['fix: x', 'feat(report): y']), 'minor');
  assert.equal(determineBump(['feat: x', 'refactor(core)!: y']), 'major');
  assert.equal(determineBump([]), 'none');
});

test('bumpVersion erhöht nach SemVer', () => {
  assert.equal(bumpVersion('v1.4.2', 'patch'), '1.4.3');
  assert.equal(bumpVersion('1.4.2', 'minor'), '1.5.0');
  assert.equal(bumpVersion('1.4.2', 'major'), '2.0.0');
  assert.equal(bumpVersion('0.0.0', 'minor'), '0.1.0');
  assert.equal(bumpVersion('1.4.2', 'none'), null);
  assert.throws(() => bumpVersion('1.4', 'patch'));
});

test('buildChangelog gruppiert nach Breaking Changes, Features und Fixes', () => {
  const notes = buildChangelog([
    'feat(report): Fotoupload',
    'fix(map): Koordinaten',
    'chore: aufräumen',
    'feat(api)!: neue Paginierung',
  ]);
  assert.match(notes, /### Breaking Changes\n- \*\*api:\*\* neue Paginierung/);
  assert.match(notes, /### Features\n- \*\*report:\*\* Fotoupload/);
  assert.match(notes, /### Fehlerbehebungen\n- \*\*map:\*\* Koordinaten/);
  assert.doesNotMatch(notes, /aufräumen/);
});
