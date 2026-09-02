<div align="center">
  <img src="public/favicon.png" alt="Logo do Flow" width="112" />

  # Flow

  **Um workspace open source para criar imagens e vídeos com IA por meio de APIs.**

  Transforme prompts e imagens de referência em histórias visuais com Nano Banana, Omni e Veo dentro de uma única interface cinematográfica.

  <p>
    <a href="https://flow.techbe.me"><strong>Demo ao vivo</strong></a>
    |
    <a href="#começando">Início rápido</a>
    |
    <a href="#modelos-disponíveis">Provedor</a>
    |
    <a href="CONTRIBUTING.md">Contribuir</a>
  </p>

  <p>
    <a href="https://github.com/TechBeme/flow/actions/workflows/ci.yml"><img alt="CI" src="https://github.com/TechBeme/flow/actions/workflows/ci.yml/badge.svg" /></a>
    <a href="LICENSE"><img alt="Licença MIT" src="https://img.shields.io/badge/license-MIT-d5ff47" /></a>
    <a href="https://nextjs.org"><img alt="Next.js 16" src="https://img.shields.io/badge/Next.js-16-black?logo=next.js" /></a>
    <a href="https://www.typescriptlang.org"><img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-strict-3178c6?logo=typescript&logoColor=white" /></a>
    <a href="https://github.com/TechBeme/flow/stargazers"><img alt="Estrelas no GitHub" src="https://img.shields.io/github/stars/TechBeme/flow?style=social" /></a>
  </p>

  **Idiomas:** [🇺🇸 English](README.md) · 🇧🇷 Português · [🇪🇸 Español](README.es.md)

  <p>
    <a href="https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FTechBeme%2Fflow&amp;env=DATABASE_URL%2CGOOGLE_SERVICE_ACCOUNT_JSON&amp;envDescription=PostgreSQL%20connection%20and%20Google%20service-account%20JSON%20for%20generation&amp;envLink=https%3A%2F%2Fgithub.com%2FTechBeme%2Fflow%2Fblob%2Fmain%2Fdocs%2FCONFIGURATION.md"><img alt="Deploy com Vercel" src="https://vercel.com/button" /></a>
  </p>
</div>

![Workspace de geração do Flow com controles de modelo, proporção, duração, resolução e prompt](docs/images/generation-controls.png)

## Por que usar o Flow?

O Flow reúne o ciclo criativo de geração de mídia em um único workspace visual:

- Crie imagens e vídeos dentro do mesmo projeto.
- Escolha explicitamente cada modelo do Vertex AI.
- Controle proporção, tamanho, duração, resolução e nível de raciocínio conforme o modelo.
- Envie, cole ou arraste imagens de referência para o composer.
- Organize resultados em galerias, reutilize prompts e baixe os arquivos.
- Mantenha controle do stack com uma aplicação Next.js sob licença MIT conectada ao seu próprio projeto Google Cloud.

## Capturas de tela

| Dashboard de projetos | Workspace criativo |
| --- | --- |
| ![Dashboard de projetos do Flow](docs/images/dashboard.png) | ![Workspace de imagens e vídeos do Flow](docs/images/workspace.png) |

### Controles de geração

![Detalhe dos controles de modelo, proporção, tamanho, quantidade e prompt do Flow](docs/images/generation-controls.png)

## Modelos disponíveis

### Imagem

| Nome na interface | ID no Vertex AI | Controles |
| --- | --- | --- |
| Nano Banana Pro | `gemini-3-pro-image` | 1K, 2K e 4K; proporções suportadas pelo modelo |
| Nano Banana 2 | `gemini-3.1-flash-image` | 512, 1K, 2K e 4K; nível de raciocínio; proporções estendidas |
| Nano Banana 2 Lite | `gemini-3.1-flash-lite-image` | 1K; proporções suportadas pelo modelo |

### Vídeo

| Nome na interface | ID no Vertex AI | Duração | Resolução |
| --- | --- | --- | --- |
| Omni 1.1 Flash | `gemini-omni-1.1-flash-preview` | 3 a 10 segundos | 360p, 720p, 1080p, 4K |
| Veo 3.1 - Lite | `veo-3.1-lite-generate-001` | 4, 6 ou 8 segundos | 720p, 1080p |
| Veo 3.1 - Fast | `veo-3.1-fast-generate-001` | 4, 6 ou 8 segundos | 720p, 1080p |
| Veo 3.1 - Quality | `veo-3.1-generate-001` | 4, 6 ou 8 segundos | 720p, 1080p, 4K |

No Veo, saídas acima de 720p usam duração de 8 segundos. Vídeos suportam `16:9` e `9:16`, geração por texto e geração usando uma imagem inicial. A disponibilidade real, região, cota e acesso a modelos preview dependem do seu projeto Google Cloud.

## Recursos

- Texto para imagem e texto para vídeo
- Imagem para imagem e imagem para vídeo
- Até quatro imagens por solicitação
- Referências por upload, colar, arrastar ou reutilizar da galeria
- Controles específicos para cada modelo
- Acompanhamento assíncrono de gerações Omni e Veo
- Projetos com nome, miniatura e galeria persistente
- Preview, zoom, download, exclusão e reutilização de prompt
- Interface criativa focada em desktop
- Interface em inglês, português e espanhol, com detecção do navegador e seletor persistente
- Integração direta com Vertex AI, sem chave do Google AI Studio

## Stack

- Next.js 16 com App Router
- React 19 e TypeScript
- Tailwind CSS 4, Motion e Radix UI
- Zustand para estado no cliente
- PostgreSQL serverless com Neon
- OAuth de conta de serviço do Google Cloud
- Vertex AI Gemini, Interactions API e operações longas do Veo

## Começando

### Pré-requisitos

- Node.js 20.9 ou superior
- Banco PostgreSQL
- Projeto Google Cloud com faturamento e Vertex AI API ativados
- Conta de serviço com permissão para usar Vertex AI
- Acesso e cota para os modelos desejados

### Instalação

```bash
git clone https://github.com/TechBeme/flow.git
cd flow
npm install
cp .env.example .env.local
```

Configure o ambiente local:

```dotenv
DATABASE_URL=postgresql://USER:PASSWORD@HOST/DATABASE?sslmode=require
GOOGLE_APPLICATION_CREDENTIALS=./vertex.json
GOOGLE_CLOUD_PROJECT=seu-projeto-google-cloud
GOOGLE_CLOUD_LOCATION=global
GOOGLE_CLOUD_VIDEO_LOCATION=us-central1
```

Depois execute:

```bash
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000). O schema do banco é criado automaticamente na primeira solicitação de projetos ou mídias.

Leia o passo a passo completo em [Getting Started](docs/GETTING-STARTED.md) e todas as opções em [Configuration](docs/CONFIGURATION.md).

## Deploy no Vercel

1. Importe o repositório no Vercel.
2. Configure `DATABASE_URL`.
3. Cole o JSON completo da conta de serviço em `GOOGLE_SERVICE_ACCOUNT_JSON`.
4. Configure as regiões opcionais quando necessário.
5. Faça o deploy e conecte o domínio.

Também é possível usar `GOOGLE_SERVICE_ACCOUNT_JSON_BASE64`. O modo `GOOGLE_APPLICATION_CREDENTIALS` é mais indicado para desenvolvimento local ou containers.

> [!WARNING]
> O Flow ainda não possui autenticação de usuários, rate limit ou limite de gasto por usuário. Não exponha publicamente uma implantação ligada a um projeto Google Cloud faturável sem adicionar proteção contra abuso.

Veja [Deployment](docs/DEPLOYMENT.md) para os cuidados de produção.

## Documentação

- [Getting Started](docs/GETTING-STARTED.md)
- [Configuração](docs/CONFIGURATION.md)
- [Arquitetura](docs/ARCHITECTURE.md)
- [Referência da API](docs/API.md)
- [Desenvolvimento](docs/DEVELOPMENT.md)
- [Testes](docs/TESTING.md)
- [Deploy](docs/DEPLOYMENT.md)
- [Política de segurança](SECURITY.md)

## Contribuindo

Contribuições são bem-vindas. Leia [CONTRIBUTING.md](CONTRIBUTING.md), crie uma branch focada, valide lint/typecheck/build e abra um pull request.

Se o Flow for útil, deixe uma **estrela no repositório**, compartilhe com outro criador e conte o que você construiu.

## Aviso

Flow é um projeto open source independente. Não possui afiliação, endosso ou patrocínio do Google. Google Cloud, Vertex AI, Gemini, Nano Banana, Omni e Veo são marcas ou nomes de produtos de seus respectivos proprietários. APIs, disponibilidade, preços, cotas e recursos podem mudar.

Você é responsável pelos custos em nuvem, conteúdo gerado, segurança do deploy e cumprimento dos termos aplicáveis.

## Licença

Distribuído sob a [Licença MIT](LICENSE).

---

<div align="center">

**Desenvolvido por [Rafael Vieira](https://github.com/TechBeme)**

[![GitHub](https://img.shields.io/badge/GitHub-TechBeme-181717?logo=github)](https://github.com/TechBeme)
[![Fiverr](https://img.shields.io/badge/Fiverr-Tech__Be-1DBF73?logo=fiverr)](https://www.fiverr.com/tech_be)
[![Upwork](https://img.shields.io/badge/Upwork-Perfil-14a800?logo=upwork)](https://www.upwork.com/freelancers/~01f0abcf70bbd95376)
[![Email](https://img.shields.io/badge/Email-contact@techbe.me-EA4335?logo=gmail)](mailto:contact@techbe.me)

</div>
