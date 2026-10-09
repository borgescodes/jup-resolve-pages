# Validação da release privada

Data: 2026-10-09, America/Sao_Paulo. Preparação validada localmente; publicação depende de revisão humana e CI do SHA final.

## Revisões do destino

SHA do snapshot de implementação validado: `415c7585e9e6f8ed2d99e36e856d39cf6e8c3da9`.
Raiz independente e vazia de `main`: `750f07dc5a5dca8d7d8c1ba7e63f8f8efd0b6179`.
O commit deste relatório acrescenta documentação e evidências. Um arquivo não pode incluir o hash do próprio commit. O CI gera uma cópia deste relatório no artifact com SHA exato do checkout, conferido contra o head do PR. `release-revision.json` atesta a revisão final.

## Inventário

`FILE_INVENTORY.json` lista caminhos, tamanhos e SHA-256 dos blobs Git de todos os demais arquivos rastreados. O próprio inventário é excluído para evitar autorreferência. Build e dependências não são versionados. Arquivos da exportação foram conferidos contra os hashes homologados em área externa; nenhum metadado Git foi importado.

## Gates executados

| Gate | Resultado |
| --- | --- |
| Instalações `npm ci`, raiz e suporte | PASS; zero vulnerabilidades reportadas |
| Lint | PASS |
| Testes | PASS: 188, zero falhas/skips; 8 scripts + 9 showcase + 171 suporte |
| Build e scanner público | PASS na árvore e build; prefixo central `/jup-resolve-pages` |
| Auditoria privada complementar | PASS; denylist externa, 138 regressões negativas, zero achados em metadados binários |
| Gitleaks 8.30.1 | PASS na árvore, build e todo histórico novo; zero achados; logs redigidos |
| Assets HTTP | PASS: 76 arquivos com HTTP 200 |
| Chromium | PASS: oito cenas em 1440, 768 e 390 px; navegação direta e fluxos completos |
| Links externos | PASS: 7 URLs; link do destino privado validado autenticado; preconnects não são páginas |
| Revisão independente | Dois bypasses corrigidos com regressões; nenhum achado técnico acionável restante |

O CI repete lint, testes, build, privacy, Gitleaks e Chromium no SHA exato do head do PR. Seu resultado definitivo deve ser lido no GitHub e no artifact com atestação de revisão. A denylist privada não está disponível no CI.

## Evidências e comparação visual

`evidence/smoke-report.json`: zero erros JavaScript, requisições de backend, recursos falhos e requests inesperados. Capturas em `evidence/` abrangem 24 combinações cena/largura, iframe, arquitetura independente, FAQ, conversa, criação, aprovação, rejeição, timeline e isolamento de identidade. Prevenção e navegação direta foram exercitadas. Rotas profundas usam HTTP 404 com UI inicializada pelo fallback estático, comportamento esperado do Pages.

24 screenshots comparadas à baseline reexecutada no mesmo Chromium local. Máximo de pixels com diferença acima de 10 níveis por canal: 0,190% em 1440, 0,126% em 768 e 0,046% em 390. Inspeção lado a lado não encontrou mudança de layout. Animações/tempos de captura impedem igualdade pixel a pixel. Imagens raster, fontes locais, CSS e JS do showcase foram preservados byte a byte. Somente links de crédito/repositório foram atualizados no HTML; orientação de senha usa documentação pública do fornecedor. Métricas: `evidence/visual-comparison.json`.

## Privacidade e ancestralidade

Scanner genérico e fixtures fictícias. Normalização cobre acentos, escapes Unicode, concatenação literal com aspas variadas/comentários, percent encoding UTF-8 e caracteres invisíveis. Bloqueia credenciais, emails não sintéticos, URLs não aprovadas, arquivos privados e referências indevidas. Arquivo da denylist é recusado se estiver dentro do repositório por caminho lexical ou canônico. Detecção institucional exata depende da denylist externa; não se afirma equivalência de cobertura com as regras públicas.

Raiz vazia nova, snapshot novo e documentação nova. Único remoto é o destino. Todos os refs possuem ancestralidade nova, sem interseção com commits anteriores: `evidence/ancestry-summary.json`. Auditoria adicional percorre blobs de texto de todos os commits novos antes do push. Nenhum identificador da origem é divulgado.

## Licenças e riscos residuais

`LICENSES.md`: Oxanium e SVGs derivados OFL, Montserrat OFL, Inter OFL, JetBrains Mono embutida OFL, Boxicons MIT e GSAP Standard No Charge com avisos preservados. Imagens, fontes, metadados e favicon inspecionados; binários preservados.

- Mascote, laptop e ilustrações próprias exigem comprovação humana de direitos antes da exposição; a baseline não fornece licença independente desses assets.
- Nenhuma nova licença geral de código foi concedida nesta preparação.
- Inspeção visual e metadados não equivalem a OCR exaustivo de todos os frames animados.
- Normalização não interpreta programas JavaScript arbitrários nem todos os confusables Unicode.
- Showcase depende de CDNs públicos para Montserrat/Boxicons; suporte usa recursos locais.
- CI verde no SHA final, revisão do PR e direitos dos assets são gates obrigatórios para qualquer decisão posterior de publicação.

## Controles

Destino privado, PR draft, sem merge ou Pages ativo. Deploy exige `workflow_dispatch`, `main` e `PUBLICATION_AUTHORIZED=true`, não configurada nesta preparação. Revisão humana futura decide exposição e autorização. PRs anteriores permanecem intactos.
