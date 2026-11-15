export {}; // a module, so the declarations below stay in this file

/*
 * Node's own modules, reached through `require` and typed here rather than by
 * adding `@types/node`: this is the only file in the app that wants them, and
 * a test is not a reason to take on a dependency.
 */
const {execFileSync} = require('child_process') as {
  execFileSync: (file: string, args: string[], opts: {stdio: string}) => void;
};
const {mkdtempSync, writeFileSync} = require('fs') as {
  mkdtempSync: (prefix: string) => string;
  writeFileSync: (path: string, data: string) => void;
};
const {tmpdir} = require('os') as {tmpdir: () => string};
const {join} = require('path') as {join: (...parts: string[]) => string};

/**
 * The hook that keeps this repository from saying who helped write it.
 *
 * Two sessions have added an attribution trailer from their own config, and
 * the second cost a history rewrite and a force-push over master to take one
 * line out of one September commit. The rule now refuses the commit instead of
 * being remembered.
 */
/* Jest runs from the project root, so the hook is where the repo keeps it. */
const HOOK = './.githooks/commit-msg';

/** Run the hook over a message, and say whether it let the commit through. */
function accepts(message: string): boolean {
  const file = join(mkdtempSync(join(tmpdir(), 'msg-')), 'COMMIT_EDITMSG');
  writeFileSync(file, message);
  try {
    execFileSync(HOOK, [file], {stdio: 'pipe'});
    return true;
  } catch {
    return false;
  }
}

describe('the commit-msg hook', () => {
  it('lets an ordinary message through', () => {
    expect(accepts('fix: convert sodium to salt\n\nSalt is 2.5 times the sodium in it.\n')).toBe(true);
  });

  it('refuses the trailer that got onto master', () => {
    expect(
      accepts('Switch package manager from npm to yarn\n\nCo-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>\n'),
    ).toBe(false);
  });

  it('refuses the session link and the generated-with line too', () => {
    expect(accepts('feat: a thing\n\nClaude-Session: https://claude.ai/code/session_x\n')).toBe(false);
    expect(accepts('feat: a thing\n\n🤖 Generated with [Claude Code](https://claude.com/claude-code)\n')).toBe(false);
  });

  it('does not care which model name is on it', () => {
    expect(accepts('feat: a thing\n\nCo-Authored-By: Claude 5 <noreply@anthropic.com>\n')).toBe(false);
    expect(accepts('feat: a thing\n\nco-authored-by: claude <noreply@anthropic.com>\n')).toBe(false);
  });

  it('leaves a real person’s co-author line alone', () => {
    // The rule is about this repository not crediting an assistant, not about
    // banning the trailer: a second human on a commit is a fact worth keeping.
    expect(
      accepts('feat: a thing\n\nCo-Authored-By: Ada Lovelace <ada@example.com>\n'),
    ).toBe(true);
  });

  it('leaves the word alone in the body, where it is prose rather than a trailer', () => {
    expect(
      accepts('docs: note what the assistant got wrong\n\nClaude read sodium as salt for a week.\n'),
    ).toBe(true);
  });
});
