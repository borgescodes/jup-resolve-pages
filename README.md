# Jup Resolve

Duas demonstrações estáticas com identidades, solicitações e políticas sintéticas.

- Showcase: `/jup-resolve-pages/`, oito cenas, mascote e arquitetura em página independente.
- Central de suporte: `/jup-resolve-pages/demo/`, FAQ, triagem, conversa, solicitações, aprovação, rejeição, timeline e prevenção.
- Rotas diretas: `/jup-resolve-pages/demo/jup`, `/jup-resolve-pages/demo/requests`, `/jup-resolve-pages/demo/operacao/acessos`.

O prefixo é definido em `scripts/pages-config.mjs`. O build injeta `jup-base-path`, usa assets com prefixo e gera `404.html` na raiz para navegação direta. Não há backend operacional. Dados permanecem na memória da aba.

## Validar

```sh
npm ci
npm ci --prefix service-desk
npm run lint
npm test
npm run build
npx playwright install chromium
npm run smoke
npm run audit:privacy
```

Build: `dist/`. Evidências: `artifacts/` e artifacts do CI. O CI verifica lint, testes, build, privacidade, segredos e Chromium.

## Privacidade

O scanner público valida regras genéricas para credenciais, emails sintéticos, URLs aprovadas, referências indevidas e arquivos privados. Testes usam somente termos fictícios. A normalização cobre acentos, Unicode, concatenação, HTML, percent encoding e caracteres invisíveis.

A detecção exata de identificadores institucionais requer denylist privada externa, fora deste repositório:

```sh
node scripts/privacy-scan.mjs --tracked dist --denylist /caminho/externo/denylist.json
```

Ela não está disponível no CI público. Não se afirma equivalência de cobertura entre regras genéricas e a auditoria privada. Logs mostram somente categorias e contagens. Para futuros snapshots, executar novamente a auditoria privada e inspeção visual de imagens/metadados antes de qualquer exposição.

## Fontes e assets

Oxanium local e contornos vetoriais derivados: SIL OFL 1.1, com atribuição junto aos arquivos. Montserrat e Inter: OFL. Ícones: licença MIT do Boxicons. Mascote e ilustrações de demonstração são preservados; veja o inventário e os limites de comprovação em [validação](docs/RELEASE_VALIDATION.md).

## Controles de publicação

Preparação privada, PR draft, sem merge ou Pages ativo. Deploy exige execução manual em `main` e autorização futura registrada pela variável `PUBLICATION_AUTHORIZED=true`. Esse controle permanece desabilitado nesta preparação. Revisão humana decide exposição pública e direitos dos assets.
