import type { CategoryId, GuestStatus, PhaseId, TemplateTask, VendorStatus } from './types';

export type Phase = { id: PhaseId; label: string; /** dias antes do evento (negativo = depois) */ days: number };

export const PHASES: Phase[] = [
  { id: 'm12', label: '12 meses antes', days: 365 },
  { id: 'm9', label: '9 meses antes', days: 270 },
  { id: 'm6', label: '6 meses antes', days: 180 },
  { id: 'm4', label: '4 meses antes', days: 120 },
  { id: 'm3', label: '3 meses antes', days: 90 },
  { id: 'm2', label: '2 meses antes', days: 60 },
  { id: 'm1', label: '1 mês antes', days: 30 },
  { id: 's2', label: '2 semanas antes', days: 14 },
  { id: 's1', label: '1 semana antes', days: 7 },
  { id: 'd1', label: 'Véspera', days: 1 },
  { id: 'd0', label: 'No dia', days: 0 },
  { id: 'pos', label: 'Depois do evento', days: -7 },
];
export const PHASE_BY_ID = Object.fromEntries(PHASES.map((p) => [p.id, p])) as Record<PhaseId, Phase>;

export const CATEGORIES: Record<CategoryId, string> = {
  pl: 'Planejamento', lo: 'Local', cb: 'Comida e bebida', de: 'Decoração', cv: 'Convidados',
  fo: 'Fornecedores', rb: 'Roupa e beleza', do: 'Documentos', ce: 'Cerimônia', dd: 'Dia do evento', po: 'Pós-evento',
};

export const GUEST_STATUS: Record<GuestStatus, string> = { pend: 'Aguardando', sim: 'Confirmado', nao: 'Não vai' };
export const VENDOR_STATUS: Record<VendorStatus, string> = { pesq: 'Pesquisando', orc: 'Orçamento recebido', ok: 'Contratado', desc: 'Descartado' };
export const VENDOR_CATEGORIES = ['Local', 'Buffet', 'Bolo e doces', 'Bebidas e bar', 'Fotografia', 'Filmagem', 'Música e DJ', 'Decoração e flores', 'Cerimonial', 'Cabelo e maquiagem', 'Roupas e trajes', 'Convites e papelaria', 'Lembrancinhas', 'Recreação', 'Transporte', 'Igreja ou celebrante', 'Outros'];
export const GUEST_GROUPS = ['Família', 'Amigos', 'Trabalho', 'Padrinhos', 'Vizinhos', 'Escola'];

type BuiltInType = { id: string; g: string; n: string; lead: number; tpl: string };

/**
 * Checklists padrão. Formato: uma linha com o id da etapa (m12, m9, ... pos)
 * seguida das tarefas daquela etapa, cada uma como "<categoria> <texto>".
 */
export const BUILT_IN_TYPES: BuiltInType[] = [
  {id:'casamento',g:'Casal',n:'Casamento',lead:420,tpl:`m12
pl Definir o orçamento total e quem vai contribuir
pl Escolher a data (e uma data reserva)
pl Decidir o formato: religioso, civil, simbólico ou mini wedding
cv Fazer a primeira lista de convidados
lo Visitar e reservar o local da festa
ce Reservar igreja ou espaço da cerimônia
fo Contratar assessoria ou cerimonialista
pl Criar uma pasta para contratos, recibos e comprovantes
m9
fo Contratar buffet e agendar a degustação
fo Contratar fotógrafo
fo Contratar filmagem
fo Contratar DJ, banda ou músicos da cerimônia
de Contratar decoração e flores
cv Escolher padrinhos e madrinhas
cv Enviar o save the date
rb Pesquisar e escolher o vestido da noiva
pl Criar o site do casamento
m6
ce Definir o celebrante
fo Encomendar bolo e doces finos
fo Contratar o bar e as bebidas
pl Montar a lista de presentes (ou cotas via Pix)
rb Escolher o traje do noivo
rb Definir roupas de padrinhos, daminhas e pajens
pl Pesquisar e reservar a lua de mel
fo Encomendar convites e papelaria
lo Indicar hospedagem para convidados de fora
fo Contratar transporte (carro dos noivos, van para convidados)
m4
rb Contratar cabelo e maquiagem (com teste)
fo Escolher as lembrancinhas
de Definir iluminação e mobiliário
pl Comprar as alianças
fo Contratar extras (cabine de fotos, telão, pista de LED)
ce Escolher as músicas da cerimônia
m3
do Dar entrada na habilitação de casamento no cartório
cv Enviar os convites
cb Fechar o cardápio após a degustação
rb Primeira prova do vestido
ce Fazer o curso de noivos (se religioso)
ce Definir o roteiro da cerimônia (ordem de entrada do cortejo)
m2
cv Controlar as confirmações de presença
rb Comprar sapatos e acessórios
ce Escrever os votos
fo Confirmar horários com todos os fornecedores
de Definir mesa do bolo, plaquinhas e sinalização
m1
cv Fechar o número final de convidados com o buffet
cv Montar o mapa de mesas
dd Montar o cronograma do dia e enviar aos fornecedores
rb Prova final do vestido e do traje
rb Teste de cabelo e maquiagem
pl Separar os pagamentos finais dos fornecedores
pl Organizar documentos e seguro-viagem da lua de mel
s2
do Confirmar a data do civil no cartório
cv Ligar para quem não confirmou presença
dd Montar o kit de emergência (agulha, linha, remédios, curativos)
dd Definir quem cuida de quê no dia
s1
fo Reunião final com o cerimonial
de Entregar lembrancinhas e itens de decoração no local
rb Retirar vestido e traje
pl Fazer as malas da lua de mel
d1
ce Ensaio da cerimônia
rb Separar roupa, alianças e documentos
pl Descansar e dormir cedo
d0
rb Dia da noiva e do noivo (cabelo e maquiagem)
dd Entregar as alianças ao responsável
dd Aproveitar o dia
pos
po Devolver itens alugados (trajes, decoração)
po Enviar mensagens de agradecimento
po Avaliar os fornecedores
po Receber fotos e vídeo
do Atualizar documentos com o novo nome (se houver)`},
  {id:'aniv1',g:'Bebê e criança',n:'Aniversário de 1 ano',lead:120,tpl:`m4
pl Definir o orçamento
pl Escolher data e horário (respeitando a soneca do bebê)
pl Escolher o tema
cv Fazer a lista de convidados
lo Reservar salão, buffet infantil ou espaço
m3
fo Contratar o buffet (salgados e bebidas)
fo Contratar fotógrafo
de Contratar decoração ou kit pegue e monte
fo Encomendar bolo e docinhos
fo Agendar o ensaio smash the cake (opcional)
m2
fo Contratar recreação ou montar área kids
cb Planejar comidinhas para bebês e crianças pequenas
fo Escolher e encomendar as lembrancinhas
cv Enviar convites (digital ou impresso)
rb Escolher a roupa do bebê e da família
m1
cv Controlar as confirmações de presença
cb Calcular salgados, doces e bebidas
de Encomendar topo de bolo, painel e balões
dd Montar playlist infantil
rb Comprar uma roupa reserva para o bebê
s2
fo Confirmar fornecedores e horários
dd Montar o cronograma (parabéns antes do sono do bebê)
de Comprar descartáveis, velas e itens de mesa
s1
cv Lembrar os convidados pelo WhatsApp
dd Preparar a bolsa do bebê para o dia
dd Definir quem ajuda na recepção e nas fotos
d1
de Montar a decoração (se pegue e monte)
cb Retirar bolo e doces
d0
dd Cantar parabéns no horário combinado
dd Registrar os momentos em fotos e vídeos
pos
po Agradecer os convidados e enviar fotos
po Anotar os presentes recebidos
po Devolver itens alugados`},
  {id:'aniv15',g:'Marcos da vida',n:'Festa de 15 anos',lead:365,tpl:`m12
pl Definir orçamento e estilo (festa, viagem ou os dois)
pl Escolher a data
pl Escolher o tema e a paleta de cores
lo Reservar o salão
fo Contratar cerimonialista
m9
fo Contratar o buffet
fo Contratar fotógrafo e filmagem
fo Contratar DJ ou banda, som e iluminação
de Contratar a decoração
cv Fazer a lista de convidados (família e amigos)
m6
rb Escolher o vestido da debutante (entrada e troca)
ce Escolher o par da valsa
ce Escolher os homenageados das 15 velas e 15 rosas
fo Contratar coreógrafo para a valsa
fo Agendar o ensaio fotográfico de 15 anos
fo Encomendar bolo e doces finos
m4
rb Contratar cabelo e maquiagem
fo Encomendar os convites
fo Escolher as lembrancinhas
dd Escolher as músicas (entrada, valsa, festa)
fo Contratar extras (cabine de fotos, pista de LED, telão)
m3
cv Enviar os convites
ce Começar os ensaios da valsa
dd Produzir o vídeo de retrospectiva (fotos da infância)
rb Primeira prova do vestido
rb Definir a roupa do pai e do par da valsa
m2
cv Controlar as confirmações de presença
rb Comprar sapatos (e chinelos para a pista)
dd Escrever discursos e homenagens
m1
cv Fechar o número de convidados
cv Montar o mapa de mesas
dd Montar o cronograma da noite (entrada, valsa, velas, parabéns)
rb Prova final do vestido
rb Teste de cabelo e maquiagem
s2
fo Reunião final com o cerimonialista
cv Cobrar quem não confirmou
dd Definir os responsáveis no dia
s1
ce Ensaio geral da valsa e da entrada
de Entregar lembrancinhas e itens no salão
rb Retirar o vestido
d1
rb Separar vestido, sapatos, acessórios e kit de emergência
pl Descansar
d0
rb Cabelo e maquiagem
dd Aproveitar a festa
pos
po Agradecer os convidados
po Receber fotos e vídeo
po Devolver itens alugados
po Avaliar os fornecedores`},
  {id:'batizado',g:'Religioso',n:'Batizado',lead:90,tpl:`m3
ce Escolher a igreja e confirmar a data do batismo
ce Escolher os padrinhos
do Separar documentos (certidão do bebê e dados dos padrinhos)
pl Definir o orçamento e o local da recepção
m2
ce Fazer o curso de batismo (pais e padrinhos)
cv Fazer a lista de convidados
lo Reservar local ou restaurante para a recepção
fo Contratar fotógrafo
m1
cv Enviar os convites
rb Comprar a roupa de batizado do bebê
ce Providenciar vela, toalha ou manta (conforme a paróquia)
fo Encomendar bolo e doces
fo Encomendar as lembrancinhas (terços, sabonetes, etc.)
s2
cv Confirmar as presenças
cb Definir o cardápio do almoço ou recepção
de Decorar a mesa
ce Confirmar horário e regras da igreja (fotos, flores)
s1
ce Pagar a taxa ou oferta da paróquia (se houver)
dd Preparar a bolsa do bebê
cv Lembrar os padrinhos do horário
d0
dd Chegar com antecedência à igreja
dd Levar documentos e itens da cerimônia
pos
po Agradecer padrinhos e convidados
do Guardar a certidão de batismo
po Enviar as fotos para a família`},
  {id:'chabebe',g:'Bebê e criança',n:'Chá de bebê',lead:60,tpl:`m2
pl Definir a data (ideal entre o 7º e o 8º mês)
pl Definir quem organiza e o orçamento
cv Fazer a lista de convidados
lo Escolher o local
pl Montar a lista de presentes (fraldas por tamanho, enxoval)
m1
cv Enviar convites com a lista de presentes
de Escolher tema e decoração
cb Definir o cardápio
fo Encomendar bolo e doces
dd Planejar as brincadeiras
s2
cv Confirmar as presenças
de Comprar prêmios das brincadeiras e lembrancinhas
dd Preparar uma lista para anotar os presentes
s1
cb Comprar bebidas e descartáveis
dd Montar a playlist
d0
de Montar a mesa e a decoração
dd Anotar quem deu cada presente
pos
po Agradecer os convidados
po Organizar as fraldas por tamanho`},
  {id:'charevelacao',g:'Bebê e criança',n:'Chá revelação',lead:30,tpl:`m1
pl Marcar a data depois do exame de sexagem
pl Escolher quem guarda o segredo (o laboratório envia o envelope)
cv Fazer a lista de convidados
lo Escolher o local
de Escolher a forma de revelação (bolo, balão, fumaça, confete)
s2
cv Enviar os convites
fo Encomendar o bolo ou item da revelação
de Decoração em azul e rosa
dd Organizar os palpites (time menino x time menina)
s1
cv Confirmar as presenças
cb Comprar comidas e bebidas
fo Combinar quem grava o momento
d0
dd Gravar a revelação
dd Recolher os palpites
pos
po Compartilhar o vídeo com a família`},
  {id:'infantil',g:'Bebê e criança',n:'Aniversário infantil',lead:90,tpl:`m3
pl Definir o orçamento
pl Escolher o tema junto com a criança
cv Fazer a lista de convidados (incluindo colegas da escola)
lo Reservar buffet infantil ou salão
m2
fo Contratar recreação e brinquedos (pula-pula, piscina de bolinhas)
fo Contratar fotógrafo
fo Encomendar bolo e docinhos
de Contratar a decoração
fo Contratar personagem vivo (opcional)
m1
cv Enviar os convites (inclusive pela escola)
fo Encomendar as lembrancinhas
cb Calcular comidas e bebidas
rb Comprar roupa ou fantasia do aniversariante
s2
cv Confirmar presenças (crianças e pais acompanhantes)
fo Confirmar os fornecedores
dd Montar o cronograma (chegada, brincadeiras, parabéns)
s1
de Comprar velas e descartáveis
cv Mandar lembrete aos convidados
d1
cb Retirar bolo e doces
d0
dd Cantar parabéns
dd Registrar fotos e vídeos
pos
po Agradecer os convidados
po Anotar os presentes
po Devolver brinquedos alugados`},
  {id:'adulto',g:'Marcos da vida',n:'Aniversário adulto',lead:60,tpl:`m2
pl Definir o estilo (jantar, festa, churrasco, barzinho)
pl Definir o orçamento
cv Fazer a lista de convidados
lo Reservar o local
m1
cv Enviar os convites
cb Definir cardápio e bebidas
fo Contratar DJ ou montar a playlist
de Planejar a decoração
fo Encomendar o bolo
s2
cv Confirmar as presenças
cb Calcular comida e bebida
dd Combinar quem ajuda
s1
cb Comprar bebidas, gelo e descartáveis
rb Escolher a roupa
d1
cb Adiantar o que der para preparar
d0
dd Receber os convidados
dd Cantar parabéns
pos
po Agradecer os convidados
po Devolver itens alugados`},
  {id:'noivado',g:'Casal',n:'Noivado',lead:60,tpl:`m2
pl Definir o formato (jantar em família, festa, pedido surpresa)
pl Comprar as alianças de noivado
cv Fazer a lista de convidados (as duas famílias)
lo Reservar o local
m1
cv Enviar os convites
cb Definir o cardápio
fo Contratar fotógrafo
de Planejar a decoração
s2
cv Confirmar as presenças
dd Preparar as palavras do brinde
s1
cb Comprar bebidas para o brinde
rb Escolher a roupa
d0
dd Brinde e troca de alianças
pos
po Agradecer os convidados
pl Começar a planejar o casamento`},
  {id:'chapanela',g:'Casal',n:'Chá de panela',lead:60,tpl:`m2
pl Definir quem organiza (madrinhas, amigas, família)
pl Escolher data e local
cv Fazer a lista de convidados
pl Montar a lista de presentes (cozinha e casa)
m1
cv Enviar os convites
de Escolher tema e decoração
cb Definir o cardápio
dd Planejar brincadeiras e prendas
s2
cv Confirmar as presenças
fo Encomendar bolo e doces
dd Comprar os prêmios
s1
cb Comprar bebidas e descartáveis
d0
dd Anotar os presentes
dd Fazer as brincadeiras
pos
po Agradecer os convidados`},
  {id:'despedida',g:'Casal',n:'Despedida de solteiro(a)',lead:60,tpl:`m2
pl Definir quem organiza
pl Escolher o formato (viagem, festa, jantar, passeio)
cv Fazer a lista do grupo
pl Definir o valor por pessoa
m1
lo Reservar local ou hospedagem
pl Combinar a divisão de custos (Pix para quem organiza)
cv Convidar o grupo
dd Planejar atividades e surpresas
s2
pl Cobrar os pagamentos
rb Encomendar camisetas ou acessórios personalizados
s1
dd Montar o roteiro do dia
pl Organizar o transporte de ida e volta
d0
dd Aproveitar
pos
pl Fechar as contas
po Compartilhar as fotos`},
  {id:'bodas',g:'Casal',n:'Bodas / renovação de votos',lead:120,tpl:`m4
pl Definir o formato (cerimônia, festa, jantar, viagem)
pl Definir o orçamento
cv Fazer a lista de convidados
lo Reservar o local
m3
ce Convidar o celebrante
fo Contratar o buffet
fo Contratar fotógrafo
de Planejar decoração com referências do casamento original
m2
cv Enviar os convites
rb Escolher as roupas
dd Montar o vídeo de retrospectiva do casal
ce Escrever os novos votos
m1
cv Confirmar as presenças
fo Encomendar o bolo
dd Montar o cronograma
s1
fo Confirmar os fornecedores
d0
dd Renovar os votos
pos
po Agradecer os convidados`},
  {id:'formatura',g:'Marcos da vida',n:'Formatura',lead:365,tpl:`m12
pl Decidir entre comissão de formatura ou festa própria
pl Definir o orçamento (colação, baile, culto, fotos)
fo Contratar empresa de formatura (se for pela turma)
m6
fo Contratar fotógrafo ou álbum
cv Dividir os convidados por evento (cota de convites)
m4
rb Escolher a roupa do baile
ce Confirmar data e ensaio da colação
lo Reservar o jantar com a família
m2
cv Distribuir os convites
rb Agendar cabelo e maquiagem
m1
rb Prova da roupa
do Conferir documentos e quitação com a faculdade
s1
dd Retirar a beca
dd Organizar o transporte da família
d0
dd Colação de grau ou baile
pos
do Solicitar o diploma
po Receber as fotos`},
  {id:'comunhao',g:'Religioso',n:'Primeira comunhão',lead:90,tpl:`m3
ce Confirmar a data com a paróquia ou catequese
pl Definir o orçamento
lo Escolher o local da recepção
m2
cv Fazer a lista de convidados
fo Contratar fotógrafo
rb Comprar a roupa (vestido branco ou terno)
ce Encomendar lembrancinhas religiosas (terços, santinhos)
m1
cv Enviar os convites
fo Encomendar bolo e doces
cb Definir o cardápio
s2
cv Confirmar as presenças
ce Confirmar as regras da igreja
s1
ce Ensaio da celebração
d0
dd Chegar cedo à igreja
pos
po Agradecer os convidados`},
  {id:'empresa',g:'Grupos e datas',n:'Confraternização de empresa',lead:60,tpl:`m2
pl Definir o orçamento por pessoa
pl Escolher a data
lo Reservar local ou restaurante
cv Fechar a lista de participantes (e acompanhantes)
m1
cv Enviar convite oficial com confirmação de presença
cb Definir cardápio com opções (vegetariano, sem glúten, sem álcool)
fo Contratar música ou atração
pl Organizar o amigo secreto (sorteio e valor)
s2
cv Confirmar o número de participantes
fo Comprar brindes e premiações
dd Organizar o transporte de volta
s1
dd Montar o roteiro (discurso, homenagens, sorteios)
d0
dd Receber os participantes
pos
po Enviar pesquisa de satisfação
po Compartilhar as fotos`},
  {id:'casanova',g:'Grupos e datas',n:'Chá de casa nova',lead:30,tpl:`m1
pl Escolher a data (depois da mudança)
cv Fazer a lista de convidados
pl Montar a lista de presentes
s2
cv Enviar os convites com o endereço
cb Definir o cardápio (petiscos, churrasco)
s1
cb Comprar bebidas e gelo
de Arrumar a casa
cv Mandar lembrete aos convidados
d0
dd Fazer o tour pela casa
pos
po Agradecer os convidados`},
  {id:'livre',g:'Outro',n:'Evento personalizado',lead:60,tpl:`m2
pl Definir o orçamento
pl Escolher data e horário
cv Fazer a lista de convidados
lo Reservar o local
m1
cv Enviar os convites
cb Definir comida e bebida
s1
cv Confirmar as presenças
d0
dd Aproveitar o evento
pos
po Agradecer os convidados`}
];

let seq = 0;
export const newId = () => Date.now().toString(36).slice(-4) + Math.random().toString(36).slice(2, 8) + (seq++).toString(36);

export function parseTemplate(str: string): TemplateTask[] {
  const out: TemplateTask[] = [];
  let phase: PhaseId = 'm1';
  for (const line of str.split('\n')) {
    const s = line.trim();
    if (!s) continue;
    if (s in PHASE_BY_ID) { phase = s as PhaseId; continue; }
    out.push({ id: newId(), p: phase, c: s.slice(0, 2) as CategoryId, t: s.slice(3) });
  }
  return out;
}

export const DEFAULT_TEMPLATES: Record<string, TemplateTask[]> = Object.fromEntries(
  BUILT_IN_TYPES.map((t) => [t.id, parseTemplate(t.tpl)]),
);
