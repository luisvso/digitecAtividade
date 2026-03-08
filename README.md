#  StudyFlow — Gestão de Atividades Escolares

Aplicação web para organizar matérias e atividades acadêmicas, desenvolvida como desafio prático para a **Digitec**.

---

##  Demonstração

> Abra o arquivo `index.html` em um servidor local para usar a aplicação completa com todas as APIs funcionando.

---

##  Funcionalidades

- **Matérias** — adicione, selecione e remova matérias
- **Atividades** — cadastre atividades dentro de cada matéria com:
  - Nome
  - Categoria (Prova, Estudo, Trabalho, Lista, Seminário, Projeto, Exercício, Outro)
  - Prioridade (Alta, Média, Baixa)
  - Nota (0–10)
  - Data
- **Média automática** — calculada em tempo real
- **Filtro por categoria** — filtre as atividades por tipo dentro de cada matéria
- **Estatísticas** — cards com média geral, total de atividades, prioridades altas e status
- **Remoção com confirmação** — modal de confirmação antes de excluir qualquer item
- **Persistência local** — dados salvos no `localStorage`, sem perder informações ao fechar o browser

---

##  Integrações com APIs

| API | Uso | Documentação |
|-----|-----|-------------|
| [Open-Meteo](https://open-meteo.com/) | Clima em tempo real com base na localização do usuário |
| [BrasilAPI](https://brasilapi.com.br/) | Verificação de feriados nacionais brasileiros 

Ambas as APIs possuem **fallback automático** — se estiverem indisponíveis, a aplicação usa dados locais sem quebrar.

---

##  Estrutura do Projeto

```
studyflow/
├── index.html   # Estrutura HTML da aplicação
├── style.css    # Estilos e tema visual
├── script.js    # Lógica, estado e integrações
└── README.md    # Este arquivo
```

---

##  Como Rodar

### Opção 1 — VS Code (recomendado)

1. Instale a extensão [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer)
2. Abra a pasta do projeto no VS Code
3. Clique em **Go Live** na barra inferior
4. Acesse `http://localhost:5500`
---

## 🛠️ Tecnologias Utilizadas

- **HTML5**
- **CSS3** 
- **JavaScript**

---

### Cálculo de Média

Considera apenas atividades com nota preenchida. Retorna `null` se não houver nenhuma nota registrada.

```js
média = soma das notas / quantidade de notas
```

### Segurança

Todos os textos inseridos pelo usuário passam pela função `escHtml()` antes de serem injetados no DOM, prevenindo ataques XSS.

---

##  Design

- Tema dark com paleta de cores consistente via variáveis CSS
- Fontes: **Syne** (títulos) e **DM Sans** (corpo) via Google Fonts
- Animações de entrada nos cards (`slideIn`) e no modal (`popIn`)
- Efeito de vidro fosco no header (`backdrop-filter: blur`)
- Barra de prioridade colorida com efeito glow nos cards de atividade

---

Desenvolvido como desafio prático para processo seletivo da **Digitec**.
