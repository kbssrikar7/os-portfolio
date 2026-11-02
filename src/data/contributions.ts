/** Verified against the merged pull request; kept local for static export. */
export const contributions = [
  {
    project: 'Focuser',
    repositoryUrl: 'https://github.com/aadeshrao123/Focuser',
    pullRequestUrl: 'https://github.com/aadeshrao123/Focuser/pull/42',
    pullRequestNumber: 42,
    mergedAt: '2026-10-06',
    mergedLabel: 'October 6, 2026',
    description: 'An open-source website and application blocker built in Rust.',
    title: 'Hidden CLI password prompts',
    summary:
      'Stopped CLI password locks from exposing secrets in shell history and process listings. Enabling and unlocking protection now prompt for the password in the terminal without echoing it.',
    stack: ['Rust', 'CLI', 'rpassword'],
    details: [
      'Prompted for a password and confirmation on enable, and stopped before changing protection on empty or mismatched input.',
      'Wrote prompts to the terminal so JSON output stays clean, and failed clearly when a prompt is needed without an interactive terminal.',
      'Kept explicit password arguments working, with eight regression tests covering confirmation, input errors, missing terminals, and conflicting unlock methods.',
    ],
  },
  {
    project: 'Focuser',
    repositoryUrl: 'https://github.com/aadeshrao123/Focuser',
    pullRequestUrl: 'https://github.com/aadeshrao123/Focuser/pull/16',
    pullRequestNumber: 16,
    mergedAt: '2026-09-27',
    mergedLabel: 'September 27, 2026',
    description: 'An open-source website and application blocker built in Rust.',
    title: 'Password & random-text unlock',
    summary:
      'Added two ways to deliberately end a block list’s protection early: enter a password or retype a random-text challenge. Built the flow across the Rust backend, CLI, and desktop UI.',
    stack: ['Rust', 'TypeScript', 'Tauri', 'Argon2'],
    details: [
      'Hashed passwords with Argon2 and persisted single-use unlock challenges in the database so they survive separate CLI processes.',
      'Preserved existing protection when block lists are updated, and kept scheduled blocking active after an unlock.',
      'Added an unlock-method selector, translated error messages, and tests for wrong answers, challenge replay, and protection persistence.',
    ],
  },
] as const;
