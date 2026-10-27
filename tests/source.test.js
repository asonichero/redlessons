// The source itself: no code hidden at the end of a line comment. (A note put on a line before the rest of its code, in a comment that runs to
// the end of the line, silently turns that code into part of the note: the door that was never built, the figures that stopped moving.)
const test = require('node:test'), assert = require('node:assert/strict');
const fs = require('fs'), path = require('path');

const ROOT = path.join(__dirname, '..');
const files = fs.readdirSync(path.join(ROOT, 'js')).filter(f => f.endsWith('.js')).map(f => path.join('js', f))
  .concat(fs.readdirSync(ROOT).filter(f => f.endsWith('.html')));

test('no code is swallowed by a comment at the end of a line', () => {
  const found = [];
  for (const f of files) {
    fs.readFileSync(path.join(ROOT, f), 'utf8').split('\n').forEach((line, n) => {
      let i = line.indexOf('//');
      while (i > 0 && line[i - 1] === ':') i = line.indexOf('//', i + 2);      // (not a URL's)
      if (i <= 0 || !line.slice(0, i).trim()) return;      // (a comment on a line of its own is a comment)
      // (a parenthesised note, then what reads as code: a name followed by a call, a property or an assignment, and a semicolon; or a key and its value)
      const c = line.slice(i + 2);
      if (/\)\s+[A-Za-z_$][\w$.[\]]*\s*(\.|\(|=)[^;]*;/.test(c) || /\)\s+[A-Za-z_$][\w$]*\s*:\s*[{['"\d]/.test(c)) found.push(f + ':' + (n + 1));      // (or an object's next key)
    });
  }
  assert.deepEqual(found, [], 'code after a line comment, never run: ' + found.join(', '));
});
