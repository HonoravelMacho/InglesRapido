# 📚 InglêsRápido — Meu Laboratório de Idiomas

Olá! Este é o **InglêsRápido**, um aplicativo experimental e super pessoal que desenvolvi para testar e colocar em prática meu próprio método de memorização acelerada de inglês. 

Não se trata de uma plataforma comercial ou de um curso de inglês tradicional. É um espaço de aprendizado despretensioso, construído sob medida para o meu ritmo, onde posso revisar termos essenciais, ouvir a pronúncia exata de cada palavra e fixá-las através de contextos reais e cotidianos.

---

## 💡 O Método Experimental

A base do aplicativo está dividida em **Três Fases de Aprendizado**:
1. **Fase 1 (Termos Estruturais Básicos):** Foco nas partículas fundamentais, preposições e pronomes que sustentam o idioma.
2. **Fase 2 (Força Bruta):** Expansão direta de vocabulário com substantivos, verbos e adjetivos de uso frequente.
3. **Fase 3 (Contextos Avançados):** Frases mais robustas e estruturas idiomáticas de transição para o uso real do idioma.

### Como funciona no dia a dia:
* **Estudo Ativo (Flashcards):** O clássico método de cartões de memorização. O card mostra a palavra em inglês e a frase de exemplo onde ela aparece (com opção de revelar a tradução se eu esquecer). Clicando no card, ele vira para mostrar a tradução da palavra e a pronúncia fonética adaptada para o português.
* **Tabela Geral (Lista de Palavras):** Uma visão geral onde consigo pesquisar termos específicos, filtrar por categoria gramatical (verbos, substantivos, adjetivos) ou por progresso (Aprendidos, Difíceis, Pendentes), além de ver as frases de exemplo diretamente ali.
* **Pronúncia por Áudio (Text-To-Speech):** Um leitor por síntese de voz integrado que me permite ouvir a pronúncia correta de qualquer palavra isolada ou frase de exemplo ao clicar no botão de som 🔊.

---

## 🛠️ Tecnologias Utilizadas

Para manter o aplicativo leve, bonito e altamente responsivo, ele foi construído usando:
* **Vite + React + TypeScript** (como base de desenvolvimento estruturada e ágil)
* **Tailwind CSS** (para um visual limpo, com excelente espaçamento e tipografia)
* **Lucide React** (para ícones minimalistas e intuitivos)
* **Web Speech API (SpeechSynthesis)** (para simular a pronúncia nativa das palavras e frases sem precisar de servidores externos)

---

## 🚀 Como Rodar o Projeto Localmente

Se você quiser baixar este projeto e rodá-lo no seu computador (ou atualizar no seu GitHub), o processo é bem simples. Você vai precisar do [Node.js](https://nodejs.org/) instalado na sua máquina.

### 1. Clonar ou Baixar o Repositório
Baixe os arquivos do projeto para a sua máquina ou clone o repositório usando o Git:
```bash
git clone <url-do-seu-repositorio>
cd <nome-da-pasta-do-projeto>
```

### 2. Instalar as Dependências
Abra o seu terminal na pasta raiz do projeto e instale os pacotes necessários:
```bash
npm install
```

### 3. Executar em Modo de Desenvolvimento
Para abrir o servidor local de testes e ver as atualizações em tempo real, execute:
```bash
npm run dev
```
Após o comando, o terminal exibirá um endereço local (geralmente `http://localhost:3000` ou `http://localhost:5173`). Basta abrir esse link no seu navegador para usar!

### 4. Gerar Versão Final (Build)
Se quiser compilar o aplicativo para colocar no ar (no GitHub Pages, por exemplo):
```bash
npm run build
```
Os arquivos prontos e otimizados serão gerados dentro da pasta `dist/`.

---

## 🎯 Configurações Pessoais de Estudo

Todo o progresso é salvo diretamente no navegador de forma automática. Assim, quando volto a estudar, continuo exatamente de onde parei, sem complicação ou necessidade de login.

> *"O aprendizado de um novo idioma não é uma corrida de velocidade, mas sim de constância e contato diário."* 🚀
