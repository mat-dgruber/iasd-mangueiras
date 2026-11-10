// Fonte canônica: templates/integrations/openapi_diff.mjs (guia-scalar-openapi-dx.md §8) — instalado por SCALAR-04
// Uso: node openapi_diff.mjs <spec-base.json> <spec-proposta.json>  → exit 1 se houver breaking changes.
import { readFileSync } from 'node:fs';

const [basePath, propostaPath] = process.argv.slice(2);
const base = JSON.parse(readFileSync(basePath, 'utf-8'));
const proposta = JSON.parse(readFileSync(propostaPath, 'utf-8'));

const HTTP_METHODS = ['get', 'post', 'put', 'patch', 'delete', 'options', 'head'];
const breaking = [];
let hasMinorChanges = false;

const basePaths = base.paths ?? {};
const propostaPaths = proposta.paths ?? {};

for (const [route, baseItem] of Object.entries(basePaths)) {
  const propostaItem = propostaPaths[route];
  if (!propostaItem) {
    breaking.push(`- Rota removida: \`${route}\``);
    continue;
  }

  for (const method of HTTP_METHODS) {
    const baseOp = baseItem?.[method];
    if (!baseOp) continue;

    const propostaOp = propostaItem?.[method];
    if (!propostaOp) {
      breaking.push(`- Operação removida: \`${method.toUpperCase()} ${route}\``);
      continue;
    }

    const baseResponses = Object.keys(baseOp.responses ?? {}).filter((code) => code.startsWith('2'));
    const propostaResponses = new Set(Object.keys(propostaOp.responses ?? {}));
    for (const status of baseResponses) {
      if (!propostaResponses.has(status)) {
        breaking.push(`- Resposta de sucesso ${status} removida em \`${method.toUpperCase()} ${route}\``);
      }
    }
  }
}

for (const route of Object.keys(propostaPaths)) {
  if (!basePaths[route]) {
    hasMinorChanges = true;
  }
}

const recommendedBump = breaking.length > 0 ? 'MAJOR' : hasMinorChanges ? 'MINOR' : 'PATCH';
console.log(`Recomendação SemVer: ${recommendedBump}`);

if (breaking.length > 0) {
  console.error('Breaking changes detectadas no contrato da API!');
  console.log(breaking.join('\n'));
  process.exit(1);
}

