// --- VARIÁVEIS GLOBAIS ---
let casasCampo = [];      // Array para armazenar as casas do campo
let casasCidade = [];     // Array para armazenar as casas da cidade
let pessoas = [];         // Array para armazenar as "pessoas" ou elementos de fluxo

let velocidadeBaseFluxo = 0.8; // Velocidade inicial do movimento das pessoas
let modoConexao = 'bidirecional'; // 'bidirecional', 'campoParaCidade', 'cidadeParaCampo'

// --- FUNÇÃO SETUP() ---
// É executada apenas uma vez ao iniciar o sketch
function setup() {
  createCanvas(900, 500); // Cria a tela de desenho com 900px de largura e 500px de altura
  angleMode(DEGREES);    // Define que os ângulos (para rotações, etc.) serão em graus (0 a 360)

  // Inicializa as casas do campo
  // Geramos 3 casas, espaçando-as na metade esquerda da tela
  for (let i = 0; i < 3; i++) {
    let x = map(i, 0, 2, 80, width / 2 - 120); // Distribui as casas de forma mapeada
    casasCampo.push(new CasaCampo(x, height - 120)); // Adiciona uma nova CasaCampo ao array
  }

  // Inicializa as casas da cidade
  // Geramos 3 casas/prédios, espaçando-as na metade direita da tela
  for (let i = 0; i < 3; i++) {
    let x = map(i, 0, 2, width / 2 + 80, width - 150); // Distribui as casas de forma mapeada
    casasCidade.push(new CasaCidade(x, height - 150)); // Adiciona uma nova CasaCidade ao array
  }

  // Inicializa algumas pessoas para começar a animação
  // Geramos 10 pessoas com posições iniciais aleatórias
  for (let i = 0; i < 10; i++) {
    pessoas.push(new Pessoa(random(width), height - 70));
  }
}

// --- FUNÇÃO DRAW() ---
// É executada continuamente, cerca de 60 vezes por segundo, redesenhando a cena
function draw() {
  desenharCenario(); // Chama a função que desenha o fundo (campo e cidade)

  // Desenha e exibe cada casa do campo
  for (let casa of casasCampo) { // Loop 'for...of' é moderno e legível para arrays de objetos
    casa.mostrar(); // Chama o método 'mostrar' de cada objeto CasaCampo
  }

  // Desenha e exibe cada casa da cidade
  for (let casa of casasCidade) {
    casa.mostrar(); // Chama o método 'mostrar' de cada objeto CasaCidade
  }

  // Atualiza a posição e desenha cada pessoa
  // O loop 'for' reverso é seguro para remover elementos de um array enquanto itera
  for (let i = pessoas.length - 1; i >= 0; i--) {
    pessoas[i].atualizar(); // Atualiza a posição e estado da pessoa
    pessoas[i].mostrar();   // Desenha a pessoa na tela
    if (pessoas[i].foraDaTela()) { // Verifica se a pessoa saiu da tela
      pessoas.splice(i, 1); // Remove a pessoa do array para otimizar (não desenhar coisas invisíveis)
    }
  }

  // Adiciona novas pessoas periodicamente, dependendo do modo de conexão
  if (frameCount % 60 === 0) { // Verifica a cada 60 frames (aproximadamente 1 segundo)
    if (modoConexao === 'bidirecional' || modoConexao === 'campoParaCidade') {
      pessoas.push(new Pessoa('campo')); // Cria uma nova pessoa vindo do campo
    }
    if (modoConexao === 'bidirecional' || modoConexao === 'cidadeParaCampo') {
      pessoas.push(new Pessoa('cidade')); // Cria uma nova pessoa vindo da cidade
    }
  }

  exibirInstrucoes(); // Chama a função para mostrar as instruções na tela
}

// --- FUNÇÃO desenharCenario() ---
// Responsável por desenhar o fundo que representa o campo e a cidade
function desenharCenario() {
  // Desenha o céu com um gradiente suave para simular a transição do dia
  let corCeuClaro = color(135, 206, 235); // Azul claro
  let corCeuEscuro = color(70, 130, 180);  // Azul um pouco mais escuro
  for (let y = 0; y < height; y++) {
    let inter = map(y, 0, height, 0, 1);
    let c = lerpColor(corCeuClaro, corCeuEscuro, inter); // Interpola a cor do céu
    stroke(c); // Define a cor da linha
    line(0, y, width, y); // Desenha uma linha horizontal
  }
  noStroke(); // Remove o contorno após desenhar o céu

  // Desenha o lado do CAMPO (metade esquerda da tela)
  fill(100, 150, 70); // Cor verde para o chão do campo
  rect(0, height - 100, width / 2 + 50, 100); // Retângulo para o chão, invadindo um pouco a cidade

  // Desenha algumas colinas/vegetação simples no campo
  fill(120, 160, 80); // Verde um pouco mais claro
  ellipse(width / 4, height - 100, 300, 100); // Colina maior
  ellipse(width / 8, height - 80, 200, 80);   // Colina menor

  // Desenha o lado da CIDADE (metade direita da tela)
  fill(80, 80, 90); // Cinza escuro para o asfalto/chão da cidade
  rect(width / 2 - 50, height - 100, width / 2 + 50, 100); // Retângulo para o chão, invadindo um pouco o campo

  // Adiciona a "estrada" que conecta os dois lados
  fill(60); // Cinza mais escuro
  rect(width / 2 - 20, height - 80, 40, 80); // Um segmento central da estrada
  // Desenha as faixas da estrada
  fill(255, 200, 0); // Amarelo para as faixas
  rect(width / 2 - 2, height - 75, 4, 15);
  rect(width / 2 - 2, height - 55, 4, 15);
  rect(width / 2 - 2, height - 35, 4, 15);

  // Opcional: Desenha um sol ou lua simples
  fill(255, 255, 0); // Amarelo vibrante para o sol
  ellipse(width - 80, 80, 60, 60); // Sol no canto superior direito
}

// --- CLASSE CasaCampo ---
// Define a estrutura e o comportamento de uma casa típica de campo
class CasaCampo {
  constructor(x, y) {
    this.x = x;          // Posição X da casa
    this.y = y;          // Posição Y da base da casa
    this.largura = 100;
    this.altura = 80;
  }

  mostrar() {
    push(); // Salva o estado atual das configurações de desenho (cor, transformações)
    translate(this.x, this.y); // Move a origem do desenho para a posição da casa

    // Corpo da casa (cor de madeira rústica)
    fill(180, 140, 100); // Marrom claro
    rect(0, 0, this.largura, this.altura);

    // Telhado
    fill(120, 80, 50); // Marrom escuro para o telhado
    triangle(0, 0, this.largura, 0, this.largura / 2, -50); // Desenha um telhado triangular

    // Porta
    fill(80, 40, 20); // Marrom escuro para a porta
    rect(this.largura / 2 - 10, this.altura - 30, 20, 30); // Desenha a porta

    // Janela com detalhes rústicos (um "X")
    fill(200, 220, 255); // Azul claro para o vidro da janela
    rect(15, 15, 30, 30);
    stroke(80, 40, 20); // Cor da moldura/cruz
    line(15, 30, 45, 30); // Linha horizontal do "X"
    line(30, 15, 30, 45); // Linha vertical do "X"
    noStroke(); // Remove o contorno para os próximos desenhos

    pop(); // Restaura o estado anterior das configurações de desenho
  }
}

// --- CLASSE CasaCidade ---
// Define a estrutura e o comportamento de uma casa ou prédio típico de cidade
class CasaCidade {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.largura = random(80, 120); // Largura aleatória para variedade nos prédios
    this.altura = random(100, 180); // Altura aleatória para variedade nos prédios
  }

  mostrar() {
    push();
    translate(this.x, this.y); // Move a origem para a posição do prédio

    // Corpo do prédio
    fill(120, 120, 130); // Cinza médio
    rect(0, -this.altura, this.largura, this.altura); // Desenha o corpo do prédio (base no Y, sobe -altura)

    // Janelas (quadrados amarelos que podem piscar)
    for (let i = 0; i < floor(this.altura / 30); i++) { // Calcula o número de andares
      for (let j = 0; j < floor(this.largura / 30); j++) { // Calcula o número de janelas por andar
        if (random() > 0.3) { // 70% de chance de a janela estar "acesa"
          fill(255, 255, 100, random(180, 255)); // Amarelo brilhante com transparência variável
        } else {
          fill(50, 50, 60, 100); // Janela "apagada" (cinza escuro e mais transparente)
        }
        // Desenha a janela, calculando sua posição dentro do prédio
        rect(5 + j * (this.largura / floor(this.largura / 30)) * 0.8, -this.altura + 5 + i * 25, 20, 20);
      }
    }

    pop();
  }
}

// --- CLASSE Pessoa ---
// Representa uma "pessoa" ou um elemento que transita entre o campo e a cidade
class Pessoa {
  constructor(origemTipo) { // 'campo' ou 'cidade' - define de onde a pessoa "nasce"
    this.tipo = origemTipo;
    this.tamanho = random(15, 25); // Tamanho aleatório para variedade
    this.velocidadeIndividual = random(0.8, 1.5); // Velocidade base individual de cada pessoa
    this.cor = color(random(200, 255), random(100, 200), random(50, 150)); // Cor inicial aleatória

    // Define a posição inicial e direção base da pessoa com base em sua origem
    if (this.tipo === 'campo') {
      this.pos = createVector(random(0, width / 3), height - 70); // Nasce no lado esquerdo (campo)
      this.direcao = createVector(1, 0); // Direção inicial para a direita
    } else { // tipo === 'cidade'
      this.pos = createVector(random(width * 2 / 3, width), height - 70); // Nasce no lado direito (cidade)
      this.direcao = createVector(-1, 0); // Direção inicial para a esquerda
    }
  }

  // Atualiza a posição e estado da pessoa
  atualizar() {
    // Calcula a velocidade atual, combinando a individual e a global do fluxo
    let velocidadeAtual = this.velocidadeIndividual * velocidadeBaseFluxo;

    // Acelera o fluxo de acordo com o modo de conexão selecionado
    if (this.tipo === 'campo' && modoConexao === 'campoParaCidade') {
      velocidadeAtual *= 1.8; // Quase dobra a velocidade se o modo for 'campoParaCidade'
    } else if (this.tipo === 'cidade' && modoConexao === 'cidadeParaCampo') {
      velocidadeAtual *= 1.8; // Quase dobra a velocidade se o modo for 'cidadeParaCampo'
    }

    this.pos.x += this.direcao.x * velocidadeAtual; // Move a pessoa na direção X

    // Simula a mudança de característica (cor e tamanho) ao cruzar a fronteira
    if (this.tipo === 'campo' && this.pos.x > width / 2) {
      // Se a pessoa veio do campo e está na cidade, transiciona a cor para um tom mais urbano
      this.cor = lerpColor(this.cor, color(200, 200, 255), 0.05); // Transiciona para azul claro
      this.tamanho = lerp(this.tamanho, 18, 0.05); // Diminui ligeiramente o tamanho
    } else if (this.tipo === 'cidade' && this.pos.x < width / 2) {
      // Se a pessoa veio da cidade e está no campo, transiciona a cor para um tom mais rural
      this.cor = lerpColor(this.cor, color(150, 255, 150), 0.05); // Transiciona para verde claro
      this.tamanho = lerp(this.tamanho, 22, 0.05); // Aumenta ligeiramente o tamanho
    }
  }

  // Desenha a pessoa na tela (como um círculo simples)
  mostrar() {
    fill(this.cor);    // Define a cor da pessoa
    noStroke();        // Sem contorno
    ellipse(this.pos.x, this.pos.y, this.tamanho, this.tamanho); // Desenha um círculo
  }

  // Verifica se a pessoa saiu completamente da tela
  foraDaTela() {
    return (this.pos.x < -this.tamanho || this.pos.x > width + this.tamanho);
  }
}

// --- FUNÇÃO keyPressed() ---
// É executada sempre que uma tecla é pressionada
function keyPressed() {
  if (key === 'C' || key === 'c') { // Se a tecla 'C' (ou 'c') for pressionada
    modoConexao = 'campoParaCidade';
    console.log("Modo: Foco no fluxo Campo -> Cidade"); // Mensagem no console do navegador
  } else if (key === 'U' || key === 'u') { // Se a tecla 'U' (ou 'u') for pressionada
    modoConexao = 'cidadeParaCampo';
    console.log("Modo: Foco no fluxo Cidade -> Campo");
  } else if (key === 'B' || key === 'b') { // Se a tecla 'B' (ou 'b') for pressionada
    modoConexao = 'bidirecional';
    console.log("Modo: Fluxo Bidirecional e Equilibrado");
  } else if (keyCode === UP_ARROW) { // Se a seta para CIMA for pressionada
    velocidadeBaseFluxo += 0.2; // Aumenta a velocidade geral do fluxo
    console.log("Velocidade do fluxo: " + velocidadeBaseFluxo.toFixed(1)); // Exibe a velocidade formatada
  } else if (keyCode === DOWN_ARROW) { // Se a seta para BAIXO for pressionada
    velocidadeBaseFluxo -= 0.2; // Diminui a velocidade geral do fluxo
    velocidadeBaseFluxo = max(0.2, velocidadeBaseFluxo); // Garante que a velocidade mínima seja 0.2
    console.log("Velocidade do fluxo: " + velocidadeBaseFluxo.toFixed(1));
  }
}

// --- FUNÇÃO exibirInstrucoes() ---
// Mostra as instruções de uso na tela do sketch
function exibirInstrucoes() {
  fill(0);     // Cor do texto preto
  textSize(14); // Tamanho da fonte
  textAlign(LEFT, TOP); // Alinhamento do texto no canto superior esquerdo

  // Exibe as instruções para mudar o modo de conexão
  text("Pressione 'C': Foco Campo -> Cidade", 10, 10);
  text("Pressione 'U': Foco Cidade -> Campo", 10, 30);
  text("Pressione 'B': Fluxo Bidirecional", 10, 50);

  // Exibe as instruções para mudar a velocidade do fluxo
  text("Use SETAS (Cima/Baixo) para alterar a velocidade do fluxo.", 10, 70);

  // Exibe o modo de conexão atual
  let textoModo = "Modo atual: ";
  if (modoConexao === 'bidirecional') {
    textoModo += "Bidirecional";
  } else if (modoConexao === 'campoParaCidade') {
    textoModo += "Campo para Cidade";
  } else {
    textoModo += "Cidade para Campo";
  }
  text(textoModo, 10, 90);
}
