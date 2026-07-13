import { readFile } from 'node:fs/promises';

const htmlPath = new URL('../my-docs/plan/plan.html', import.meta.url);
let html = '';

try {
  html = await readFile(htmlPath, 'utf8');
} catch (error) {
  console.error(`FAIL: my-docs/plan/plan.html okunamadi: ${error.message}`);
  process.exit(1);
}

const expectations = [
  ['doctype', /<!doctype html>/i],
  ['Turkish language', /<html[^>]+lang="tr"/i],
  ['viewport', /name="viewport"/i],
  ['embedded styles', /<style[\s>]/i],
  ['embedded script', /<script[\s>]/i],
  ['plan version', /Plan v1\.0/],
  ['review dialog', /id="review-dialog"/],
  ['review drawer', /id="review-drawer"/],
  ['Markdown export', /id="export-reviews"/],
  ['Markdown import', /id="import-reviews"/],
  ['review storage', /yula-plan-reviews-v1/],
  ['progress storage', /yula-plan-progress-v1/],
  ...Array.from({ length: 6 }, (_, index) => [`phase ${index}`, new RegExp(`\\{n:${index},title:`)]),
  ...Array.from({ length: 12 }, (_, index) => [`BC-${index + 1}`, new RegExp(`BC-${index + 1}(?!\\d)`)]),
  ...Array.from({ length: 14 }, (_, index) => {
    const id = String(index + 1).padStart(4, '0');
    return [`ADR-${id}`, new RegExp(`ADR-${id}`)];
  }),
];

const forbidden = [
  ['remote script', /<script[^>]+src=["']https?:/i],
  ['remote stylesheet', /<link[^>]+href=["']https?:/i],
  ['remote image', /<img[^>]+src=["']https?:/i],
];

const failures = expectations.filter(([, pattern]) => !pattern.test(html)).map(([label]) => `eksik: ${label}`);
failures.push(...forbidden.filter(([, pattern]) => pattern.test(html)).map(([label]) => `yasak: ${label}`));

if (failures.length) {
  console.error(`FAIL (${failures.length}):\n- ${failures.join('\n- ')}`);
  process.exit(1);
}

console.log(`PASS: ${expectations.length} sozlesme kontrolu, ${forbidden.length} uzak-kaynak kontrolu.`);
