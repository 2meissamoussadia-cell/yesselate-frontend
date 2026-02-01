const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/modules/dashboard/components/views/DashboardHome.tsx');
let s = fs.readFileSync(filePath, 'utf8');

// Mojibake: UTF-8 bytes interpreted as Windows-1252/Latin-1. Replace using Unicode escapes.
// Emoji: F0 9F 93 xx -> ð Ÿ " x (U+00F0 U+0178 U+201C + last byte as W1252)
const fixes = [
  { from: /\u00e2\u20ac\u201c/g, to: '\u2014' },             // â€" -> — (left quote)
  { from: /\u00e2\u20ac\u201d/g, to: '\u2014' },             // â€" -> — (right quote, UTF-8 E2 80 94)
  { from: /\u00f0\u0178\u201c\u017e/g, to: '\ud83d\udcde' }, // ðŸ"ž -> 📞
  { from: /\u00f0\u0178\u201c\u00a7/g, to: '\ud83d\udce7' }, // ðŸ"§ -> 📧
  { from: /\u00f0\u0178\u201c\u201d/g, to: '\ud83d\udce4' }, // ðŸ"" -> 📤
  { from: /\u00f0\u0178\u201d\u201d/g, to: '\ud83d\udce4' }, // ðŸ"" (two right quotes) -> 📤
  { from: /\u00f0\u0178\u201c\u00a4/g, to: '\ud83d\udce4' }, // ðŸ"¤ -> 📤
  { from: /\u00f0\u0178\u201c\u2039/g, to: '\ud83d\udccb' }, // ðŸ"‹ -> 📋
  { from: /\u00f0\u0178\u201c\u00b4/g, to: '\ud83d\udcb4' }, // ðŸ"´ -> 💴
  { from: /\u00f0\u0178\u201d\u00b4/g, to: '\ud83d\udcb4' }, // ðŸ"´ (right quote) -> 💴
  { from: /\u00f0\u0178\u017e\u00a8/g, to: '\ud83c\udfa8' }, // ðŸŽ¨ -> 🎨
  { from: /\u00e2\u0089\u00a5/g, to: '\u2265' },            // â‰¥ -> ≥
  { from: /\u00c3\u00a9/g, to: '\u00e9' },                  // Ã© -> é
  { from: /\u00c3\u00a0/g, to: '\u00e0' },                  // Ã  -> à
];

// Literal string replacements (in case regex code points differ)
s = s.split('\u00e2\u20ac\u201d').join('\u2014'); // â€" -> —
s = s.split('\u00e2\u20ac\u201c').join('\u2014');

let count = 0;
for (const { from: regex, to } of fixes) {
  const before = s.length;
  s = s.replace(regex, to);
  if (s.length !== before || (regex.source.length === 1 && s.includes(to))) count++;
}

fs.writeFileSync(filePath, s, 'utf8');
console.log('Fixed DashboardHome.tsx encoding');
