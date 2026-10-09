# Gate de release e auditoria privada

Repositorio permanece privado. Esta documentacao nao autoriza merge, Pages ou alteracao de visibilidade.

## Auditoria exata antes de deploy

1. Obter autorizacao separada para merge. Auditar HEAD definitivo de `main`, apos o merge. Nao reutilizar SHA de PR.
2. Em checkout limpo desse SHA, executar testes, build, scanner publico, Gitleaks e scanner institucional com denylist fora do repositorio.
3. Inspecionar imagens, GIF/WebP, icones, metadados e fontes. Scanner textual nao cobre binarios integralmente.
4. Registrar PASS, contagens, revisao e evidencias em sistema privado. Nao publicar termos da denylist.
5. Mudou SHA, perdeu validade. Executar auditoria novamente.

```sh
git rev-parse HEAD
git status --porcelain
npm ci
npm ci --prefix service-desk
npm run lint
npm test
npm run build
node scripts/privacy-scan.mjs --tracked dist --denylist "/absolute/external/path/denylist.json"
npm run smoke
```

`git status --porcelain` deve estar vazio. `npm run smoke` exige Chromium instalado.

## Travas automatizadas

O job `deploy` so roda com disparo manual `workflow_dispatch` em `main`, `PUBLICATION_AUTHORIZED=true`, e `PRIVATE_AUDIT_APPROVED_SHA` exatamente igual ao SHA do dispatch (`github.sha`). Job `validate` deve concluir com sucesso. Verificacao redundante ocorre antes das etapas de deploy.

Variaveis permanecem sem configuracao nesta preparacao. Definir somente apos autorizacao expressa, prova de auditoria externa do mesmo SHA e revisao de direitos de quaisquer terceiros. Publicar Pages e mudar visibilidade sao decisoes distintas.

## Licencas

MIT limitada ao codigo autoral. Mascote, imagens e identidade com direitos reservados. Ver `LICENSE`, `docs/ASSET_RIGHTS.md` e `docs/LICENSES.md`.

Sem comprovar a cadeia de direitos de eventuais terceiros, nao publicar.
