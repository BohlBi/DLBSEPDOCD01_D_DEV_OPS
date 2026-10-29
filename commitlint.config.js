// Erzwingt Conventional Commits: typ(scope): beschreibung
export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // Deutsche Beschreibungen mit Großbuchstaben (z. B. Substantive) erlauben
    'subject-case': [0],
  },
};
