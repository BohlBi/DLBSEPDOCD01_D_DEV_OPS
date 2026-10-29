// Reine Funktionen zur Versionsberechnung aus Conventional Commits.
// Werden von scripts/next-version.mjs genutzt und in test/semver.test.js getestet.

const HEADER = /^(?<type>[a-z]+)(?:\((?<scope>[^)]+)\))?(?<breaking>!)?: (?<subject>.+)$/;
const RANK = { none: 0, patch: 1, minor: 2, major: 3 };

/** Zerlegt eine Commit-Nachricht (Titel + Text) nach Conventional Commits. */
export function parseCommit(message) {
  const [header = '', ...bodyLines] = message.trim().split('\n');
  const match = HEADER.exec(header.trim());
  if (!match) return null;
  const body = bodyLines.join('\n');
  const { type, scope, breaking, subject } = match.groups;
  return {
    type,
    scope: scope ?? null,
    subject,
    breaking: Boolean(breaking) || /^BREAKING[ -]CHANGE:/m.test(body),
  };
}

/** Ordnet einem Commit die Art der Versionserhöhung zu. */
export function bumpForCommit(commit) {
  if (!commit) return 'none';
  if (commit.breaking) return 'major';
  if (commit.type === 'feat') return 'minor';
  if (commit.type === 'fix' || commit.type === 'perf') return 'patch';
  return 'none';
}

/** Höchste Erhöhung über alle Commit-Nachrichten. */
export function determineBump(messages) {
  return messages
    .map((m) => bumpForCommit(parseCommit(m)))
    .reduce((a, b) => (RANK[b] > RANK[a] ? b : a), 'none');
}

/** Erhöht eine Version "X.Y.Z" (optional mit führendem "v"). */
export function bumpVersion(current, bump) {
  const parts = current.replace(/^v/, '').split('.').map(Number);
  if (parts.length !== 3 || parts.some((n) => !Number.isInteger(n) || n < 0)) {
    throw new Error(`Keine gültige Version: ${current}`);
  }
  const [major, minor, patch] = parts;
  switch (bump) {
    case 'major': return `${major + 1}.0.0`;
    case 'minor': return `${major}.${minor + 1}.0`;
    case 'patch': return `${major}.${minor}.${patch + 1}`;
    case 'none': return null;
    default: throw new Error(`Unbekannte Erhöhung: ${bump}`);
  }
}

/** Release Notes als Markdown, gruppiert nach Commit-Typ. */
export function buildChangelog(messages) {
  const groups = { major: [], feat: [], fix: [] };
  for (const message of messages) {
    const c = parseCommit(message);
    if (!c) continue;
    const line = `- ${c.scope ? `**${c.scope}:** ` : ''}${c.subject}`;
    if (c.breaking) groups.major.push(line);
    else if (c.type === 'feat') groups.feat.push(line);
    else if (c.type === 'fix' || c.type === 'perf') groups.fix.push(line);
  }
  const sections = [
    ['Breaking Changes', groups.major],
    ['Features', groups.feat],
    ['Fehlerbehebungen', groups.fix],
  ].filter(([, lines]) => lines.length > 0);
  return sections.map(([title, lines]) => `### ${title}\n${lines.join('\n')}`).join('\n\n');
}
