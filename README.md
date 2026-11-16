# VALORANT Champions Mayhem

Jogo tático de **Draft de Equipes**, **Simulação do Torneio VCT Champions (2022–2026)**, **Grid Diário (Immaculate Grid)** e **Trivia estilo LoLdle**.

## Modos de Jogo

1. **Draft & Torneio VCT (`Draft & Torneio`)**
   - Monte seu elenco com 5 funções táticas (**Duelista**, **Controlador**, **Iniciador**, **Sentinela** e **Flex**) escolhendo atletas históricos do VCT Champions (2022 a 2026).
   - **Dificuldades**:
     - **Normal**: 3 Rerolls, sem vetos adversários.
     - **Difícil**: 2 Rerolls, 3 atletas banidos pelo adversário.
     - **Master**: 1 Reroll, 6 atletas banidos pelo adversário.
   - **Traits & Sinergias**: Químicas reais entre ex-companheiros de equipe, bônus de Campeões Mundiais e traits lendárias/raras (*Final Boss*, *Gelo nas Veias*, *Rei do First Blood*, *Mestre do Clutch*, etc.).
   - **Simulação Round a Round**: Dispute Fase de Grupos, Quartas, Semifinais e Grande Final (MD3 / MD5) com estatísticas de ACS, K/D, Clutches e eleição do MVP da campanha.

2. **Grid Diário (`Grid Diário`)**
   - Desafio tático 3×3 estilo *Immaculate Grid* nos modos **Infinito** (gerado proceduralmente e 100% solúvel) e **Clássico** (12 tabuleiros temáticos).

3. **Trivia VCT (`Trivia LoLdle`)**
   - Descubra o jogador misterioso do VCT em até 8 palpites nos modos **Desafio Diário** e **Treino Livre**, com dicas de nacionalidade e inicial do nick.

4. **Sala de Troféus (`Troféus`)**
   - Histórico completo de campanhas salvas localmente e galeria de **12 Conquistas VCT**.

---

## Como Executar

### Opção 1: Servidor de Desenvolvimento (Recomendado para edição)

```bash
npm install
npm run dev
```

Acesse `http://localhost:3000`.

### Opção 2: Abrir diretamente pelo `index.html` (Live Server ou Navegador)

O arquivo `index.html` na raiz já conta com fallback automático para o pacote pré-compilado em `./dist/`, funcionando tanto via `npm run dev` quanto abrindo o `index.html` diretamente no navegador ou via extensão **Live Server** no VS Code.

### Build de Produção

```bash
npm run build
```
