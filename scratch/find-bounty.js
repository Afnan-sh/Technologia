const fs = require('fs');
const path = require('path');

const ignoreDirs = new Set(['node_modules', '.next', '.git', 'dev.db', '.gemini']);
const results = [];

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (ignoreDirs.has(entry.name)) continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(fullPath);
    } else if (entry.isFile()) {
      if (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx') || entry.name.endsWith('.js') || entry.name.endsWith('.json') || entry.name.endsWith('.md') || entry.name.endsWith('.prisma')) {
        const content = fs.readFileSync(fullPath, 'utf8');
        const lines = content.split('\n');
        lines.forEach((line, idx) => {
          if (/bount(y|ies)/i.test(line)) {
            results.push({ file: fullPath, lineNum: idx + 1, line: line.trim() });
          }
        });
      }
    }
  }
}

walk('.');
console.log(JSON.stringify(results, null, 2));
