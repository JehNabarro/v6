# Diagnóstico de Liderança

Consultores gastavam, em média, 6 horas para redigir um único relatório. O sistema foi desenhado para atacar esse número por dois lados: reunir todos os documentos do participante num só lugar, a uma busca de distância, e colocar uma IA que revisa incongruências enquanto o consultor escreve.

*(nome fictício por acordo de confidencialidade)*

---

## O que o sistema resolvia

O gargalo não era escrever, era juntar. O consultor perdia horas caçando documentos espalhados antes mesmo de começar o relatório, e depois revisando manualmente à procura de contradições. O sistema centralizou clientes, participantes, consultores e projetos num único gerenciador, deixou cada documento acessível na hora, e delegou a checagem de incongruências para uma IA. O consultor volta a fazer o que só ele faz: analisar.

---

## Contexto

Setor: consultoria de diagnóstico de liderança.

Meu papel: [preencher, ex: UX/UI e desenvolvimento low-code, do mapa de site ao redesign].

Formato: [solo ou time, e período].

Stack: low-code, Figma, modelagem de dados, integração de IA.

---

## Usuários

Dois perfis com dores diferentes:

**Consultores** escreviam os relatórios e carregavam as 6 horas. Precisavam de contexto reunido e de menos retrabalho de revisão.

**Administradores** gerenciavam clientes, participantes, consultores e projetos. Precisavam achar qualquer registro rápido, sem navegar por várias telas.

---

## A restrição: construir antes de desenhar

O desenvolvimento começou antes de existir layout. Modelei os dados e estruturei a aplicação direto no low-code, priorizando função. O primeiro protótipo era propositalmente cru no visual, focado só em provar que o fluxo fechava. Só depois de rodando eu apliquei testes de usabilidade e fiz a engenharia reversa da experiência.

---

## A virada de arquitetura

O problema mais caro não era visual, era de fluxo. Para completar um cadastro, o usuário entrava e saía a cada etapa: respondia, voltava, entrava de novo. Refiz a arquitetura de informação para que, uma vez iniciado o ciclo, todas as etapas seguissem em sequência, sem sair da tela. O mapa do site, antes vertical, virou horizontal, refletindo esse fluxo contínuo.

---

## Modelagem de dados

Documentei a estrutura por trás da aplicação: como clientes, participantes, consultores, projetos e documentos se relacionam. Foi essa base que permitiu o acesso rápido a qualquer registro e sustentou o fluxo de relatório de ponta a ponta.

---

## A IA no fluxo

O diferencial que atacava direto as 6 horas. Enquanto o consultor escreve o relatório, a IA revisa e aponta incongruências no texto. A checagem de consistência, que antes era manual e demorada, passou a acontecer durante a escrita, não depois dela.

---

## Redesign

*(aqui vai o antes/depois, com menos justificativa)*

O redesenho partiu de uma decisão de contexto, não de gosto: administradores passam o dia inteiro na tela. Tirei o fundo branco para reduzir cansaço visual em uso prolongado e usei o cinza no topo para separar a área de ação principal e destacar a marca. Padronizei ícones, cores, bordas e botões para dar previsibilidade. Trouxe informações e projetos recentes para a página inicial, de modo que a busca por qualquer cliente ou empresa começasse já resolvida. A trilha de navegação ficou acima do nome da página, deixando claro o caminho percorrido.

---

## Onde o projeto parou

A produção foi interrompida por fim de investimento, antes do lançamento. O sistema não chegou a medir a redução das 6 horas em uso real. O que fica é uma solução desenhada e tecnicamente construída para esse alvo, e um aprendizado que levo comigo: entregar função primeiro no low-code me deu um produto real para testar cedo, mas exigiu disciplina para refatorar a arquitetura depois, em vez de deixar as decisões técnicas iniciais congelarem a experiência.
