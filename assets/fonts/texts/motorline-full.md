# Motorline

Uma planilha de produção com muitas colunas e rolagem horizontal constante virou uma interface que mostra só o essencial e explica cada dado com um clique. O redesenho aproximou o que a planilha espalhava: a peça em falta no estoque e a produção dessa mesma peça na máquina responsável.

---

## O que o sistema resolvia

A dor não era falta de dados, era excesso mal organizado. Informação importante se perdia no meio de informação secundária, as siglas das colunas se confundiam e não havia explicação para o que cada uma significava. O redesenho transformou o controle numa tabela hierarquizada, que revela informação sob demanda e mantém visível apenas o indispensável para a decisão. O que antes não cabia em uma tela passou a se adaptar a vários formatos.

---

## Contexto

Setor: controle de produção e estoque.

Meu papel: [preencher, ex: UX/UI e front-end, do wireframe ao início da implementação da tabela].

Formato: [solo ou time, e período].

Stack: Figma, HTML, CSS, JavaScript, design system.

---

## Usuários

Quem administra a produção no dia a dia. Precisava cruzar, na mesma leitura, a peça em falta no estoque com a produção dessa peça na máquina responsável, sem depender de decorar siglas nem caçar a informação numa planilha que rolava para os lados. Precisava de hierarquia clara para separar o urgente do secundário e decidir com confiança.

---

## O ponto de partida

A origem era uma planilha com muitas colunas e rolagem horizontal constante. Uma das dores centrais era justamente cruzar a peça em falta no estoque com a produção dessa mesma peça na máquina responsável, algo que a planilha afastava em vez de aproximar. Somava-se a isso o excesso de informação no meio dos dados que realmente importavam e a ausência de explicação em cada coluna: as siglas se confundiam e eram difíceis de memorizar.

---

## Decisões de design

Três decisões guiaram o layout.

A primeira foi esconder e mostrar informação conforme a necessidade de quem administra, deixando em tela só o indispensável. Antes o que não cabia em uma tela, agora se adapta a vários formatos.

A segunda foi dar a cada coluna uma explicação acessível com um clique, para que a função do dado fosse identificada na hora, sem depender de memória nem de decorar siglas.

A terceira foi estabelecer uma hierarquia visual clara, separando o urgente do secundário e devolvendo confiança a quem decide com base naqueles dados.

---

## Design System

O sistema de design foi construído sobre o Atomic Design, metodologia de Brad Frost. Os átomos, menores unidades, definem cores, ícones e tipografia. Combinados, formam moléculas como os botões. As moléculas se agrupam em organismos, caso dos botões compostos e dos filtros. Esses blocos sobem para templates, como a própria tabela, e chegam às páginas, como esta. A consistência do resultado vem dessa base.

---

## Solução

Com o design system aplicado, a hierarquia das informações ficou legível: dá para entender a tabela, perceber suas urgências e sentir mais confiança ao tomar uma decisão com base em dados. A tabela aberta disponibiliza, com um clique, a identificação exata da função daqueles dados. O que antes exigia rolagem horizontal e memória de siglas passou a caber, priorizado, na tela.

---

## Onde o projeto parou

Atuei no design de ponta a ponta, do wireframe ao layout final, com prototipação e validação em testes com usuários. Iniciei a implementação do front-end da tabela antes de deixar o projeto. O sistema não chegou a medir, em uso real, a redução do tempo de leitura ou de erro. O que fica é uma solução desenhada para atacar diretamente as dores da planilha original: aproximar estoque e produção, priorizar o indispensável e tornar cada dado autoexplicável.
