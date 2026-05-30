import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

const routes = ['/', '/update', '/m365', '/program-news'];
const environments = {
  pages: 'https://microsoft-elevate.com',
  azure: 'https://purple-mud-005887500.7.azurestaticapps.net',
};

function getArg(name, fallback) {
  const prefix = `--${name}=`;
  const arg = process.argv.find((item) => item.startsWith(prefix));
  return arg ? arg.slice(prefix.length) : fallback;
}

const envName = getArg('env', 'azure');
const baseUrl = getArg('base-url', environments[envName]);
const routeArg = getArg('routes', routes.join(','));
const selectedRoutes = routeArg.split(',').map((route) => route.trim()).filter(Boolean);
const dryRun = process.argv.includes('--dry-run');

if (!baseUrl) {
  throw new Error(`Unknown environment "${envName}". Use --base-url=https://...`);
}

const date = new Date().toISOString().slice(0, 10);
const outputDir = join(process.cwd(), '..', 'reports', 'performance', `${date}-${envName}`);
mkdirSync(outputDir, { recursive: true });

const plannedRuns = selectedRoutes.map((route) => {
  const url = new URL(route, baseUrl).toString();
  const safeRoute = route === '/' ? 'root' : route.replace(/^\//, '').replace(/[^\w.-]+/g, '-');
  return {
    route,
    url,
    jsonPath: join(outputDir, `${safeRoute}.json`),
    htmlPath: join(outputDir, `${safeRoute}.html`),
  };
});

if (dryRun) {
  writeFileSync(join(outputDir, 'plan.json'), `${JSON.stringify(plannedRuns, null, 2)}\n`);
  console.log(`Prepared ${plannedRuns.length} Lighthouse run(s) in ${outputDir}`);
  process.exit(0);
}

const summary = [];
for (const run of plannedRuns) {
  const result = spawnSync('npx', [
    '--yes',
    'lighthouse',
    run.url,
    '--preset=desktop',
    '--chrome-flags=--headless',
    '--output=json',
    '--output=html',
    `--output-path=${run.jsonPath}`,
    '--quiet',
  ], {
    stdio: 'inherit',
  });

  if (result.status !== 0) {
    process.exit(result.status || 1);
  }

  summary.push({
    route: run.route,
    url: run.url,
    jsonPath: run.jsonPath,
    htmlPath: run.htmlPath,
  });
}

writeFileSync(join(outputDir, 'summary.json'), `${JSON.stringify(summary, null, 2)}\n`);
console.log(`Wrote Lighthouse reports to ${outputDir}`);
