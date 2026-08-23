import { readFileSync, existsSync } from 'node:fs';

const files = ['public/robots.txt', 'public/sitemap.xml', 'public/llms.txt', 'public/llms-full.txt'];

for (const file of files) {
  if (!existsSync(file)) throw new Error(`Missing ${file}`);
}

const robots = readFileSync('public/robots.txt', 'utf8');
const sitemap = readFileSync('public/sitemap.xml', 'utf8');
const llms = readFileSync('public/llms.txt', 'utf8');
const index = readFileSync('src/index.html', 'utf8');

for (const bot of ['GPTBot', 'ClaudeBot', 'PerplexityBot', 'Bytespider', 'ChatGPT-User']) {
  if (!robots.includes(`User-agent: ${bot}`)) throw new Error(`Missing bot ${bot}`);
}

if (!robots.includes('Sitemap: https://iasdmangueiras.org.br/sitemap.xml')) throw new Error('Missing absolute sitemap');
if (!sitemap.includes('<loc>https://iasdmangueiras.org.br/</loc>')) throw new Error('Missing home in sitemap');
if (!llms.includes('> Site oficial da IASD Mangueiras')) throw new Error('Missing llms citation block');
if (!index.includes('<link rel="describedby" href="/llms.txt">')) throw new Error('Missing llms discovery link');

console.log('public SEO/GEO files verified');
