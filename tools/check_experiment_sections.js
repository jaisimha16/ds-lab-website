// test helper: dump every experiment section's source code to JSON for local execution
const fs = require('fs');
const vm = require('vm');
const ctx = { window: {} };
vm.createContext(ctx);
vm.runInContext(fs.readFileSync('assets/js/data.js', 'utf8'), ctx);
const LAB = ctx.LAB;
const out = [];
LAB.experiments.forEach(e => {
  e.sections.forEach(s => out.push({ id: e.id, letter: s.letter, title: s.title, code: s.code || '' }));
});
fs.writeFileSync('tools/_sections.json', JSON.stringify(out, null, 1));
console.log('sections:', out.length);
