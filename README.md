# Bolão Dus Mininu Copa 2026

Aplicativo web em React + TypeScript para gerenciar um bolão entre amigos.

## O que já vem pronto

- Layout visual premium inspirado no mockup enviado: sidebar escura, hero com foto real de Copa, avatares dos participantes, ranking em destaque e cards esportivos.
- Dashboard com cards, ranking, gráficos e estatísticas por grupo.
- Cadastro/importação de participantes, jogos, palpites e palpites de longo prazo via Excel.
- Pontuação automática por jogo:
  - 10 pontos: placar exato.
  - 7 pontos: vencedor/empate e saldo de gols.
  - 5 pontos: vencedor ou empate.
  - 0 pontos: erro.
- Pontuação de longo prazo:
  - Campeão: 30.
  - Vice: 20.
  - Artilheiro: 15.
  - Posição final do Brasil: 20.
- Tela individual de participante.
- Tela de jogos por grupo.
- Simulador de resultados futuros.
- Botão `Atualizar resultados` usando API-Football da API-Sports quando houver chave, com fallback de busca pública na web quando não houver chave.
- Exportação de ranking em PDF e Excel.
- Exportação de estatísticas completas em Excel.
- Persistência local no navegador via `localStorage`.

## Formato do Excel

O importador espera um arquivo `.xlsx` com estas abas:

### Formato principal: jogos e palpites na mesma aba

| Grupo | Jogo | Resultado Real | Willie | Rhômulo | JP |
| --- | --- | --- | --- | --- | --- |
| A | México x África do Sul | 2x0 | 1x1 | 1x1 | 2x0 |

Depois de `Resultado Real`, cada coluna é tratada como um participante. Células vazias ou com `-` são ignoradas.

### Longo prazo

| Participante | Campeão | Vice-Campeão | Artilheiro | Posição do Brasil |
| --- | --- | --- | --- | --- |
| Willie | França | Espanha | Mbappé | Semifinal |

O importador também continua aceitando o formato antigo com abas separadas:

- `Jogos`: Grupo, Mandante, Visitante, Resultado.
- `Palpites`: Participante, Jogo, Palpite.
- `Longo Prazo`: Participante, Campeão, Vice, Artilheiro, Posição Brasil.

## Comandos

```bash
pnpm install
pnpm run dev
pnpm run build
```

## Deploy na Vercel

O projeto está pronto para deploy como aplicação Vite:

- Build command: `pnpm run build`
- Output directory: `dist`

O deploy também inclui a rota serverless `api/update-results.ts`, usada pelo botão `Atualizar resultados`.

Configure estas variáveis de ambiente na Vercel:

- `API_FOOTBALL_KEY`: sua chave da API-Sports.
- `API_FOOTBALL_LEAGUE_ID`: opcional, padrão `1`.
- `API_FOOTBALL_SEASON`: opcional, padrão `2026`.

No teste local, você também pode colar a chave na aba `Importar`, no campo `API-Football / API-Sports`.
Sem chave, o botão ainda tenta atualizar por busca pública na web e por um snapshot de resultados públicos recentes.

## Banco de dados

Esta versão usa persistência local no navegador para funcionar imediatamente. Para produção com múltiplos usuários, o próximo passo natural é conectar o mesmo modelo de dados a Supabase, mantendo as tabelas:

- `participants`
- `matches`
- `predictions`
- `long_term_picks`
- `long_term_official_results`

## Imagem

A foto do hero usa uma imagem real do jogo França x Croácia, final da Copa do Mundo 2018, disponível no Wikimedia Commons sob licença CC BY-SA 4.0:
https://commons.wikimedia.org/wiki/File:2018_World_Cup_Final_-_France_v_Croatia.jpg
