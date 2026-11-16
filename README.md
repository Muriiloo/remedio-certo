# 💊 Remédio Certo

Aplicativo mobile desenvolvido para a disciplina de **Desenvolvimento Mobile** do curso de **Análise e Desenvolvimento de Sistemas (ADS)**.

O **Remédio Certo** é um aplicativo desenvolvido para auxiliar **idosos no controle e organização de seus medicamentos**, ajudando a lembrar quais remédios devem ser tomados e em quais horários.

A aplicação também pode ser utilizada por **cuidadores e familiares**, facilitando o acompanhamento da rotina de medicamentos de pessoas que possuem pouco contato ou familiaridade com a tecnologia.

---

## 📱 Sobre o projeto

O uso correto de medicamentos é uma tarefa importante na rotina de muitas pessoas, especialmente idosos que precisam tomar diferentes remédios ao longo do dia.

Pensando nesse problema, o **Remédio Certo** foi desenvolvido com uma proposta simples: oferecer uma interface fácil de entender e utilizar, permitindo cadastrar medicamentos e receber lembretes nos horários definidos.

O projeto busca aplicar conceitos de desenvolvimento mobile na criação de uma solução para um **problema real do cotidiano**.

---

## 🎯 Objetivo

O principal objetivo do Remédio Certo é:

> **Ajudar idosos a manter uma rotina organizada de medicamentos, reduzindo as chances de esquecer ou tomar um remédio no horário incorreto.**

Além disso, o aplicativo busca proporcionar uma experiência simples e acessível para usuários que possuem pouca familiaridade com smartphones.

---

## ✨ Funcionalidades

Entre as principais funcionalidades do aplicativo estão:

* 💊 Cadastro, edição e exclusão de medicamentos
* ⏰ Definição dos horários para tomar cada medicamento
* 🔔 Lembretes (notificações) nos horários dos medicamentos, com ações diretas na notificação
* ✅ Rotina do dia com a próxima dose e indicação de doses atrasadas
* 📦 Controle de estoque, com aviso de estoque baixo
* 🕘 Histórico de doses dos últimos 7 dias, com percentual de adesão
* 🚨 Aviso ao contato de emergência (WhatsApp ou SMS) quando uma dose atrasa muito
* 📍 Farmácias próximas, com distância, endereço, horário, rota e ligação (veja abaixo)
* 👴 Interface simples e intuitiva, pensando principalmente no público idoso

### 📍 Farmácias próximas

A tela de farmácias usa a localização do aparelho e consome a API **[Nominatim](https://nominatim.org/)** do **OpenStreetMap** para buscar farmácias em até 3 km, ordenadas por distância.

* Não exige chave de API nem cadastro.
* A requisição é identificada com um `User-Agent` próprio (exigência do Nominatim) e o uso respeita o limite de 1 requisição por segundo.
* Endereço, horário e telefone aparecem apenas quando estão preenchidos no OpenStreetMap, então a cobertura varia conforme a região.
* Dados © colaboradores do [OpenStreetMap](https://www.openstreetmap.org/copyright).

---

## 🛠️ Tecnologias utilizadas

O projeto está sendo desenvolvido utilizando:

* **React Native** — desenvolvimento da aplicação mobile
* **Expo** — ambiente e ferramentas para desenvolvimento com React Native
* **TypeScript** — linguagem de programação
* **Expo Router** — navegação entre telas
* **NativeWind** — estilização com classes utilitárias
* **Expo SQLite** — armazenamento local dos dados
* **Expo Notifications** — lembretes nos horários dos medicamentos
* **Expo Location** — localização para buscar farmácias próximas
* **API Nominatim (OpenStreetMap)** — busca de farmácias próximas
* **Git e GitHub** — versionamento e gerenciamento do código

---

## 🚀 Como executar o projeto

### Pré-requisitos

Antes de executar o projeto, é necessário ter instalado:

* [Node.js](https://nodejs.org/)
* [Expo](https://expo.dev/)
* Git
* Um dispositivo Android/iOS ou um emulador

### 1. Clone o repositório

```bash
git clone https://github.com/seu-usuario/remedio-certo.git
```

### 2. Acesse a pasta do projeto

```bash
cd remedio-certo
```

### 3. Instale as dependências

```bash
npm install
```

### 4. Inicie o projeto

```bash
npx expo start
```

Após iniciar o Expo, será exibido um QR Code no terminal ou no navegador.

É possível executar o aplicativo utilizando:

* 📱 **Expo Go** em um dispositivo físico
* 🤖 **Android Emulator**
* 🍎 **iOS Simulator**
* 🌐 **Web**, caso o projeto possua suporte configurado

---
