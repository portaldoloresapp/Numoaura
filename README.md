# Numoaura 💰

Numoaura é um aplicativo moderno de gestão financeira pessoal desenvolvido com **React Native** e **Expo**. Ele ajuda você a rastrear seus gastos, gerenciar metas financeiras ("Caixinhas") e visualizar análises detalhadas do seu fluxo de caixa com uma interface elegante e fluida.

## ✨ Funcionalidades

-   **Dashboard Interativo**: Visão geral do saldo diário, atalhos rápidos e atividade recente com navegação por data.
-   **Gestão de Transações**: Adicione receitas e despesas com categorização inteligente e ícones intuitivos.
-   **Histórico Detalhado**: Visualize suas transações agrupadas por data, com filtros dinâmicos por categoria (Mercado, Casa, Lazer, etc.).
-   **Caixinhas (Metas)**: Crie objetivos financeiros, acompanhe o progresso visualmente com barras animadas e faça depósitos ou resgates parciais/totais.
-   **Modo Avançado (Estatísticas)**: Carrossel de gráficos interativos (Pizza, Barras, Donut) para analisar seus hábitos de consumo e taxa de economia.
-   **Personalização**: Configure quais widgets aparecem na sua tela inicial através do menu de configurações.
-   **Autenticação Segura**: Login, Cadastro e Gestão de Perfil integrados com Supabase Auth.
-   **Design Premium**: Interface adaptável, animações suaves (Reanimated) e feedback tátil.

## 🛠️ Tecnologias Utilizadas

-   **Framework**: [React Native](https://reactnative.dev/) com [Expo](https://expo.dev/) (Managed Workflow)
-   **Linguagem**: [TypeScript](https://www.typescriptlang.org/)
-   **Backend & Auth**: [Supabase](https://supabase.com/)
-   **Navegação**: [Expo Router](https://docs.expo.dev/router/introduction/)
-   **Animações**: [React Native Reanimated](https://docs.swmansion.com/react-native-reanimated/)
-   **Ícones**: [Lucide React Native](https://lucide.dev/guide/packages/lucide-react-native)
-   **Gráficos**: SVG customizado com `react-native-svg`
-   **Datas**: [Date-fns](https://date-fns.org/)

## 🚀 Como Executar o Projeto

### Pré-requisitos

-   Node.js instalado.
-   Gerenciador de pacotes (Yarn recomendado).
-   Conta no Supabase (para backend).

### Instalação

1.  Clone o repositório:
    ```bash
    git clone https://github.com/seu-usuario/numoaura.git
    cd numoaura
    ```

2.  Instale as dependências:
    ```bash
    yarn install
    ```

3.  Configure as variáveis de ambiente:
    Crie um arquivo `.env` na raiz do projeto com suas credenciais do Supabase:
    ```env
    EXPO_PUBLIC_SUPABASE_URL=sua_url_do_supabase
    EXPO_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima_do_supabase
    ```

4.  Inicie o servidor de desenvolvimento:
    ```bash
    yarn run dev
    ```

5.  Abra o app:
    -   Escaneie o QR Code com o app **Expo Go** (Android/iOS).
    -   Ou pressione `a` para abrir no emulador Android / `i` para simulador iOS.

## 🗂️ Estrutura do Projeto

-   `app/`: Rotas e telas do aplicativo (baseado em arquivos).
    -   `(tabs)/`: Telas principais da navegação inferior (Home, Carteira, Histórico, Menu).
    -   `auth/`: Telas de autenticação (Login, Cadastro).
    -   `settings/`: Telas de configuração.
-   `components/`: Componentes reutilizáveis (Cards, Botões, Gráficos, Modais).
-   `context/`: Gerenciamento de estado global (Auth, Preferências).
-   `lib/`: Configurações de serviços externos (Supabase, Storage).
-   `constants/`: Temas, cores e espaçamentos globais.
-   `types/`: Definições de interfaces TypeScript.

## 🤝 Contribuição

Contribuições são bem-vindas! Sinta-se à vontade para abrir issues ou enviar pull requests para melhorias.

---

Desenvolvido com 💚
