# Festa em Dia

App de celular (iOS e Android) para organizar eventos: a pessoa escolhe o tipo de evento e recebe um checklist com prazos calculados a partir da data. Feito com [Expo](https://expo.dev) (React Native) e TypeScript.

## O que o app faz

- **17 tipos de evento** com checklist pronto: casamento, aniversário de 1 ano, 15 anos, batizado, chá de bebê, chá revelação, aniversário infantil e adulto, noivado, chá de panela, despedida de solteiro(a), bodas, formatura, primeira comunhão, confraternização de empresa, chá de casa nova e evento personalizado.
- **Checklist com prazos reais**, por etapa (12 meses antes … depois do evento). Se faltar menos tempo do que o modelo pede, o cronograma é comprimido.
- **Checklist editável** em cada evento, e **modelos padrão editáveis** (aba Modelos), com opção de restaurar o original e criar modelos próprios.
- **Convidados**: convites por família ou casal (adultos e crianças), resposta (aguardando, confirmado, não vai), mesas, mensagem de convite pronta para o WhatsApp e importação de vários convites colando uma lista.
- **Fornecedores**: orçamentos por categoria, etiqueta de menor preço, contrato e parcelas.
- **Orçamento**: total comprometido, já pago, próximos pagamentos e avisos de atraso.
- **Calculadora** de salgados, doces, bolo, bebidas e churrasco.

Os dados ficam salvos no próprio aparelho (AsyncStorage). Ainda não há login nem sincronização entre aparelhos.

## Ver no celular sem instalar nada no computador

A versão web do app fica publicada no GitHub Pages:
**https://acfanacarolinafarias-cell.github.io/festa-em-dia/**

Abra o link no navegador do celular. Para ter um ícone na tela inicial: no iPhone, Safari → Compartilhar → "Adicionar à Tela de Início"; no Android, Chrome → menu ⋮ → "Adicionar à tela inicial". Os dados ficam salvos no navegador do próprio celular.

Para atualizar o site, gere a versão web e publique a pasta `dist` no branch `gh-pages`:

```bash
npx expo export --platform web --output-dir dist
cp dist/index.html dist/404.html && touch dist/.nojekyll
```

## Como rodar (com um computador)

Pré-requisito: Node.js 20 ou mais recente.

```bash
npm install
npx expo start
```

Depois, leia o QR code com o app **Expo Go** no celular (Android ou iPhone) ou aperte `a` / `i` para abrir em um emulador.

> O seletor de data usa `@react-native-community/datetimepicker`, que já vem no Expo Go. Na versão web a data é digitada como DD/MM/AAAA.

## Verificações

```bash
npx tsc --noEmit   # tipos
npx expo lint      # lint
```

## Estrutura

```
src/
  app/                rotas (Expo Router): cada arquivo é uma tela
    (tabs)/           abas "Meus eventos" e "Modelos"
    novo.tsx          criar evento (tipo + dados)
    evento/[id]/      evento e telas de edição (tarefa, convidado, fornecedor, …)
  features/           abas do evento: checklist, convidados, fornecedores, orçamento, calculadora
  domain/             regras do app, sem dependência de tela: tipos, modelos de checklist, datas, cálculos
  store/              estado global e gravação no aparelho
  ui/                 componentes visuais e tema (claro e escuro)
```

Os checklists padrão ficam em `src/domain/templates.ts`, num formato fácil de editar: uma linha com a etapa (`m12`, `m6`, `s1`, `d0`, `pos`…) seguida das tarefas, cada uma com o código da categoria na frente.

## Próximos passos sugeridos

1. Login e sincronização na nuvem (ex.: Supabase ou Firebase), para usar em mais de um celular e dividir a organização com outras pessoas.
2. Página do evento para o convidado confirmar presença sozinho (RSVP por link).
3. Lembretes por notificação (`expo-notifications`) para tarefas e parcelas que estão vencendo.
4. Publicação nas lojas com EAS Build: antes, definir `ios.bundleIdentifier` e `android.package` em `app.json`.
