# Trajetória de Poço

App web (HTML + JavaScript puro, sem build) para construir trajetórias direcionais de poço, no estilo Compass.

## Recursos
- **Início / Alvos**: tie-in, azimute da VS e lista de alvos.
- **Métodos** (cada um em sua aba): Hold, Nudge, Slant, Dogleg/Toolface e Optimum Align (com alinhamento alvo 1 → alvo 2 e project back).
- **Tabela** alimentada a cada cálculo; clicar numa linha destaca a estação e o trecho nos gráficos.
- **Gráficos**: planta, seção vertical, Inc×MD, Azi×MD, DLS×MD e TVD×MD.
- **Discretização** automática da trajetória (passo configurável), sobreposta aos gráficos.

Os cálculos são portes dos módulos Python `clsTrajectoryCalculation`, `hold`, `nudge`, `slant`, `dogleg_tf`, `optimum_align` e `survey_creation`.

## Estrutura
```
index.html          # página
css/style.css       # estilos
js/core.js          # mínima curvatura, geometria, solver Levenberg-Marquardt
js/methods.js       # Hold, Nudge, Slant, Dogleg/TF, Optimum Align
js/ui.js            # abas, formulários, tabela
js/discretize.js    # discretização (survey_creation)
js/charts.js        # seleção de linha e gráficos (Chart.js)
js/main.js          # inicialização
```
Os scripts são carregados na ordem do `index.html` e compartilham o escopo global.

## Rodar localmente (VS Code)
1. Abra a pasta no VS Code.
2. Instale a extensão **Live Server** (sugerida automaticamente) e clique em *Go Live*.
   Também funciona abrindo o `index.html` direto no navegador.
3. O Chart.js é carregado de um CDN (cdnjs), então é preciso internet.

## Subir no GitHub
```bash
git init
git add .
git commit -m "App web de trajetória de poço"
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/SEU_REPO.git
git push -u origin main
```

## Publicar no GitHub Pages
O workflow em `.github/workflows/pages.yml` publica o site a cada push na `main`.
No repositório, vá em **Settings → Pages → Source** e escolha **GitHub Actions**.

## Diferenças em relação ao Python
- Curve, Curve-Hold e Optimum Align usam um Levenberg-Marquardt próprio no lugar do `least_squares` do scipy.
- Nudge Inline varre o DLS em passos de 0.01 (o original usa 0.001).
- Slant não tem o fallback iterativo do original.
- Tolerância de "alvo atingido": 0.01 m.

## Interception Analysis e 3D Alignment

A aba **Interceptação** permite importar o survey de um poço-alvo e planejar uma trajetória de aproximação:

1. Importe um CSV com cabeçalho contendo `MD`, `Inc` e `Azi` (separador ponto e vírgula, vírgula ou tabulação).
2. Informe as coordenadas iniciais do survey-alvo (`TVD`, `N/S`, `E/W`) no mesmo referencial do tie-in do poço em planejamento.
3. Gere e selecione pontos candidatos ao longo do survey-alvo.
4. Informe `DLS 1` e `DLS 2` e execute **Construir alinhamento**. O cálculo reutiliza o Curve-Hold-Curve do **Optimum Align** existente; não adiciona otimização independente de MD ou DLS.
5. A análise calcula a menor distância entre os eixos, MD correspondente em cada poço, separações horizontal/vertical e ângulo entre tangentes.

A análise geométrica usa interpolação de mínima curvatura entre estações e aproximação segmentar com discretização interna de 20 m. Os resultados são uma avaliação geométrica, não substituem análise de incerteza ISCWSA, ranging magnético ou critérios operacionais de interceptação.
