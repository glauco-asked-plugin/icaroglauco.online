

## Introdução

Sou um desenvolvedor pleno e autônomo de tecnologias web, com trajetória construída na prática de estruturar sistemas, interfaces e fluxos de dados de forma direta e funcional.

Recentemente, encontrei nos modelos de linguagem — muito antes da popularização das ferramentas de construção ao vivo — um ponto de inflexão. Não como tendência, mas como meio: uma nova camada onde linguagem deixa de ser apenas descrição e passa a operar como mecanismo real de construção.

É nesse espaço que passo a atuar. Um espaço onde a linguagem, quando bem estruturada, permite cruzar qualquer ponte já concebida — entre interface e lógica, entre abstração e execução, entre intenção e sistema.

---

## One-liner
Site pessoal com landing 3D urbana e cinematográfica, onde um menu circular flutuante organiza as sessões centrais do portfólio em um ambiente inspirado em Need for Speed Carbon, usando galeria fotográfica da pessoa principal como eixo visual vivo.

---

## Problemática

Um site pessoal convencional não comunica presença, identidade e densidade autoral quando o trabalho depende de visão de sistema, semântica, arquitetura e direção estética.

A navegação comum por hero, grids e seções estáticas reduz o impacto da experiência, enquanto o objetivo aqui é transmitir:

- identidade autoral forte  
- pensamento arquitetural  
- integração real com IA  
- projetos como sistemas vivos  

É necessário um modelo onde o usuário **entra em uma cena**, não apenas acessa uma página.

---

## Metodologia

A entrada do site é tratada como um **ambiente 3D navegável**, não uma landing tradicional.

Dois níveis estruturam o sistema:

1. **Entrada (Scene Layer)**  
   Ambiente urbano 3D com menu circular interativo

2. **Sessões (Content Layer)**  
   Páginas full-screen (`100vw x 100vh`) com conteúdo narrativo estruturado

Princípios:

- Interface como extensão do sistema
- Movimento com peso físico (não decorativo)
- IA como camada interpretativa futura
- Identidade pessoal integrada à navegação (galeria viva)

---

## Features

### 1. Landing 3D Urbana

Ambiente inicial com:

- chão urbano (asfalto/concreto)
- fundo profundo (cidade/túnel/fog)
- iluminação neon
- câmera inclinada com leve drift
- atmosfera noturna com grafite

Objetivo: criar presença antes de leitura.

---

### 2. Objeto Central Circular

Hub do sistema de navegação:

- forma circular flutuante
- material metálico escuro
- bordas emissivas
- rotação lenta contínua

Funções:

- âncora visual
- referência espacial
- eixo do menu

---

### 3. Menu Circular (Estilo Need for Speed Carbon)

Itens orbitam o núcleo central.

#### Idle
- inclinação global
- micro movimento
- profundidade perceptível

#### Hover
- item avança em Z
- aumenta escala
- corrige inclinação
- ganha glow e contraste
- demais itens recuam e escurecem
- galeria reage

#### Seleção
- item puxa câmera
- transição contínua para sessão

---

### 4. Galeria Vertical da Pessoa (Elemento estrutural)

Galeria 3D com fotos em pé.

#### Estrutura
- stack vertical ou carousel
- perspectiva inclinada
- profundidade entre imagens

#### Idle
- rotação lenta
- troca suave de foco

#### Hover
- rotação acelera
- imagem alvo vem à frente
- demais desfocam

#### Seleção
- pode dissolver na sessão
- ou compor entrada visual

---

### 5. Estética (Street / Grafite / Carbon)

Paleta:

- preto profundo  
- cinza asfalto  
- azul petróleo  
- roxo neon  
- vermelho urbano  
- verde ácido pontual  

Elementos:

- texturas de rua
- reflexos leves
- bloom controlado
- fog volumétrico
- decals de grafite

---

### 6. Câmera

- posição levemente baixa
- inclinação sutil
- drift contínuo

Estados:

- idle → micro movimento  
- hover → ajuste de foco  
- seleção → avanço (dolly-in)  

---

### 7. Sessões (100vh)

Cada item do menu leva a uma sessão:

#### Overview / Identidade
Visão, posicionamento, narrativa central

#### Portfólio
Projetos estruturados como sistemas

#### Explorer de Sistemas
Navegação de conceitos (DSLs, estruturas)

#### Engenharia / DSL
Abordagem técnica profunda

#### Experiência
Trajetória e impacto

#### Modo Interativo
Componentes e visualizações

#### Contato
Conversão e comunicação

---

### 8. Transição Menu → Sessão

- câmera avança
- item cresce
- galeria reage
- ambiente dissolve
- sessão emerge full-screen

Sem cortes secos. Continuidade espacial obrigatória.

---

### 9. Estrutura das Sessões

Cada sessão:

- ocupa `100vw x 100vh`
- possui identidade visual própria
- usa narrativa em cards
- mantém animação contínua leve
- pode retornar ao menu

---

### 10. Stack Técnica

- React  
- TypeScript  
- react-three-fiber  
- three.js  
- framer-motion  
- react-spring (ou equivalente)  

Pós-processamento:

- bloom leve  
- vignette  
- color grading  
- fog  

---

### 11. Entidades

```ts
type MenuItem = {
  id: string
  label: string
  session: SessionId
  colorAccent: string
  galleryFocusImage: string
  description: string
}

type SessionId =
  | "overview"
  | "portfolio"
  | "systems-explorer"
  | "engineering"
  | "experience"
  | "interactive"
  | "contact"
  
```

## Critérios de Qualidade

- o menu parece um ambiente, não UI plana
- o objeto central tem presença física
- hover é forte e responsivo
- galeria reforça identidade sem ruído
- estética urbana é consistente
- transições são contínuas
- conteúdo mantém densidade e clareza

---

## Futuro

- som ambiente urbano
- partículas atmosféricas
- integração IA contextual
- navegação expandida por cena
- leitura dinâmica de projetos