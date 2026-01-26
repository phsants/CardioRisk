# CardioRisk - Avaliador de Risco Cardiovascular

Aplicação web para estratificação de risco cardiovascular baseada na **Diretriz Brasileira de Dislipidemias e Prevenção da Aterosclerose - SBC 2025**.

## 🚀 Tecnologias

- **React 18** - Biblioteca UI
- **Vite** - Build tool (ultra-rápido)
- **React Router** - Roteamento
- **TanStack Query** - Gerenciamento de estado servidor
- **Tailwind CSS** - Estilização
- **Framer Motion** - Animações
- **Lucide React** - Ícones
- **date-fns** - Manipulação de datas

## 📦 Instalação

```bash
# Instalar dependências
npm install

# Rodar em desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview do build
npm run preview
```

## 🏗️ Estrutura do Projeto

```
├── src/
│   ├── components/
│   │   ├── ui/          # Componentes UI (shadcn/ui)
│   │   ├── guidelines/  # Componentes de diretrizes
│   │   ├── results/     # Componentes de resultados
│   │   └── screening/   # Componentes de triagem
│   ├── pages/           # Páginas da aplicação
│   ├── entities/       # Entidades de dados
│   ├── utils/           # Funções utilitárias
│   ├── App.jsx          # Componente principal
│   └── main.jsx         # Ponto de entrada
├── Components/          # Componentes (legado)
├── Pages/               # Páginas (legado)
├── Entities/            # Entidades (legado)
├── Layout.js            # Layout principal
└── package.json
```

## 🎯 Funcionalidades

- ✅ **Triagem Adaptativa**: Questionário inteligente que se adapta às respostas
- ✅ **Classificação de Risco**: Motor de regras baseado na Diretriz SBC 2025
- ✅ **Metas Lipídicas**: Cálculo automático de metas por categoria de risco
- ✅ **Histórico**: Acompanhamento de avaliações anteriores
- ✅ **Diretriz Completa**: Consulta aos critérios e metas da diretriz

## 📋 Categorias de Risco

- **Baixo Risco**: LDL-c ≤ 130 mg/dL
- **Risco Intermediário**: LDL-c ≤ 100 mg/dL
- **Alto Risco**: LDL-c ≤ 70 mg/dL
- **Muito Alto Risco**: LDL-c ≤ 50 mg/dL
- **Risco Extremo**: LDL-c ≤ 30 mg/dL

## 🔧 Configuração

O projeto usa **Vite** como bundler para máxima performance:

- ⚡ HMR (Hot Module Replacement) instantâneo
- 🚀 Build otimizado com code splitting
- 📦 Tree shaking automático
- 🎯 Path aliases configurados (`@/` → `src/`)

## 📝 Licença

Este projeto é baseado na Diretriz Brasileira de Dislipidemias e Prevenção da Aterosclerose - SBC 2025.

---

**Desenvolvido com ❤️ para auxiliar na prevenção cardiovascular**


