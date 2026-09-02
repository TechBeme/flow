<div align="center">
  <img src="public/favicon.png" alt="Logo de Flow" width="112" />

  # Flow

  **Un espacio de trabajo open source para crear imágenes y videos con IA mediante APIs.**

  Convierte prompts e imágenes de referencia en historias visuales con Nano Banana, Omni y Veo desde una interfaz única, enfocada y cinematográfica.

  [![Demo](https://img.shields.io/badge/demo-flow.techbe.me-111111?style=for-the-badge)](https://flow.techbe.me)
  [![Estrellas en GitHub](https://img.shields.io/github/stars/TechBeme/flow?style=for-the-badge&logo=github&color=F4C430)](https://github.com/TechBeme/flow/stargazers)
  [![CI](https://img.shields.io/github/actions/workflow/status/TechBeme/flow/ci.yml?branch=main&style=for-the-badge&label=CI)](https://github.com/TechBeme/flow/actions/workflows/ci.yml)
  [![Licencia MIT](https://img.shields.io/badge/licencia-MIT-2ea44f?style=for-the-badge)](LICENSE)

  **Idiomas:** [🇺🇸 English](README.md) · [🇧🇷 Português](README.pt-BR.md) · Español

  [Documentación](docs/GETTING-STARTED.md) · [Reportar un error](https://github.com/TechBeme/flow/issues/new?template=bug_report.yml) · [Solicitar una función](https://github.com/TechBeme/flow/issues/new?template=feature_request.yml)
</div>

> [!IMPORTANT]
> La URL de la demo pública está reservada en [flow.techbe.me](https://flow.techbe.me). Hasta que se anuncie su despliegue, ejecuta Flow localmente con la guía de este README.

![Espacio de generación de Flow con controles de modelo, proporción, duración, resolución y prompt](docs/images/generation-controls.png)

## ¿Por qué Flow?

La mayoría de las herramientas de medios generativos separan la creación de imágenes, la generación de videos, las referencias, los archivos y el historial del proyecto en distintas pantallas. Flow reúne todo el ciclo creativo en un único espacio visual:

- **Crea imágenes y videos en el mismo proyecto** sin cambiar de producto.
- **Elige el modelo exacto de la API** en lugar de depender de un selector genérico de calidad.
- **Controla el resultado** con proporciones, tamaños, duraciones, resoluciones y niveles de razonamiento específicos para cada modelo.
- **Usa referencias de forma natural** subiendo, pegando o arrastrando imágenes al compositor.
- **Conserva el contexto creativo** con galerías, reutilización de prompts, descargas e historial de medios.
- **Controla tu infraestructura** con una aplicación Next.js bajo licencia MIT conectada a tu propio proyecto y credenciales.

## Capturas de pantalla

| Panel de proyectos | Espacio creativo |
| --- | --- |
| ![Panel de proyectos de Flow](docs/images/dashboard.png) | ![Espacio de imágenes y videos de Flow](docs/images/workspace.png) |

### Controles de generación

![Detalle de los controles de modelo, proporción, tamaño, cantidad y prompt de Flow](docs/images/generation-controls.png)

## Modelos disponibles

Flow muestra actualmente las siguientes opciones en la interfaz. La disponibilidad, las cuotas, las regiones compatibles y el acceso a modelos preview dependen de la configuración del proveedor y pueden variar entre proyectos.

### Generación de imágenes

| Nombre en la interfaz | ID del modelo en Vertex AI API | Controles de salida |
| --- | --- | --- |
| Nano Banana Pro | `gemini-3-pro-image` | 1K, 2K y 4K; proporciones compatibles con el modelo |
| Nano Banana 2 | `gemini-3.1-flash-image` | 512, 1K, 2K y 4K; nivel de razonamiento; proporciones ampliadas |
| Nano Banana 2 Lite | `gemini-3.1-flash-lite-image` | 1K; proporciones compatibles con el modelo |

### Generación de videos

| Nombre en la interfaz | ID del modelo en Vertex AI API | Duración | Resolución |
| --- | --- | --- | --- |
| Omni 1.1 Flash | `gemini-omni-1.1-flash-preview` | 3 a 10 segundos | 360p, 720p, 1080p, 4K |
| Veo 3.1 - Lite | `veo-3.1-lite-generate-001` | 4, 6 u 8 segundos | 720p, 1080p |
| Veo 3.1 - Fast | `veo-3.1-fast-generate-001` | 4, 6 u 8 segundos | 720p, 1080p |
| Veo 3.1 - Quality | `veo-3.1-generate-001` | 4, 6 u 8 segundos | 720p, 1080p, 4K |

En Veo, las salidas superiores a 720p utilizan una duración de 8 segundos, de acuerdo con la restricción implementada en la integración actual. Flow admite video en `16:9` y `9:16`, generación de texto a video y generación de imagen a video.

## Funciones

- Generación de texto a imagen y texto a video
- Flujos de imagen a imagen e imagen a video
- Hasta cuatro imágenes por solicitud
- Referencias mediante carga, pegado, arrastre o reutilización desde la galería
- Tamaños, proporciones, duraciones y resoluciones por modelo
- Seguimiento asíncrono de operaciones de Omni y Veo
- Creación, renombrado, eliminación y miniaturas visuales de proyectos
- Biblioteca persistente de proyectos y medios en PostgreSQL
- Interfaz creativa enfocada en escritorio
- Vista previa, zoom, descarga, eliminación y reutilización de prompts
- Interfaz de producto en portugués y documentación en tres idiomas
- Autenticación directa con la Vertex AI API, sin clave de Google AI Studio

## Tecnologías

[![Next.js](https://img.shields.io/badge/Next.js_16-000000?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React_19-20232a?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178c6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS_4-06b6d4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Vertex AI API](https://img.shields.io/badge/API-Vertex_AI-4285F4?logo=googlecloud&logoColor=white)](https://cloud.google.com/vertex-ai)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-4169E1?logo=postgresql&logoColor=white)](https://neon.tech/)

- Next.js App Router y route handlers del servidor
- React 19, TypeScript, Tailwind CSS 4, Motion, Radix UI y Zustand
- PostgreSQL serverless con Neon
- Autenticación OAuth mediante cuenta de servicio
- Vertex AI API para imágenes Gemini, Interactions API y operaciones de larga duración de Veo

## Arquitectura

```mermaid
flowchart LR
    U[Navegador] -->|Proyectos y controles| N[Aplicación Next.js]
    N -->|CRUD| P[(PostgreSQL / Neon)]
    N -->|Solicitud OAuth firmada| A[OAuth]
    A --> V[Vertex AI API]
    V --> I[Modelos de imagen Gemini]
    V --> O[Interactions API de Omni]
    V --> E[Operaciones de Veo]
    I --> N
    O --> N
    E --> N
```

El navegador nunca recibe las credenciales del proveedor. La autenticación y las llamadas a los modelos se ejecutan únicamente en route handlers del servidor. Consulta [Arquitectura](docs/ARCHITECTURE.md) para conocer los flujos y módulos.

## Inicio rápido

### Requisitos

- Node.js 20.9 o superior
- Base de datos PostgreSQL
- Proyecto con facturación y Vertex AI API habilitada
- Cuenta de servicio autorizada para invocar los modelos
- Acceso y cuota para los modelos que quieras utilizar

### 1. Clonar e instalar

```bash
git clone https://github.com/TechBeme/flow.git
cd flow
npm install
```

### 2. Configurar el entorno

```bash
cp .env.example .env.local
```

Para desarrollo local, guarda el archivo de cuenta de servicio fuera del historial de Git y referencia su ruta:

```dotenv
DATABASE_URL=postgresql://USER:PASSWORD@HOST/DATABASE?sslmode=require
GOOGLE_APPLICATION_CREDENTIALS=./vertex.json
GOOGLE_CLOUD_PROJECT=tu-proyecto
GOOGLE_CLOUD_LOCATION=global
GOOGLE_CLOUD_VIDEO_LOCATION=us-central1
```

`vertex.json`, `.env.local` y los patrones comunes de credenciales están ignorados por Git. Nunca publiques una clave privada real.

### 3. Ejecutar Flow

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000), crea un proyecto y comienza a generar. El esquema de la base de datos se crea automáticamente en la primera solicitud de proyectos o medios.

Consulta [Getting Started](docs/GETTING-STARTED.md) para el proceso completo.

## Despliegue en Vercel

1. Importa el repositorio de GitHub en Vercel.
2. Añade `DATABASE_URL`.
3. Añade el JSON completo de la cuenta de servicio como `GOOGLE_SERVICE_ACCOUNT_JSON`.
4. Configura las regiones opcionales cuando tu proyecto lo requiera.
5. Despliega y conecta tu dominio personalizado.

Flow también acepta `GOOGLE_SERVICE_ACCOUNT_JSON_BASE64`. El método basado en archivo `GOOGLE_APPLICATION_CREDENTIALS` está orientado principalmente al desarrollo local y a despliegues en contenedores.

> [!WARNING]
> Flow todavía no incluye autenticación de usuarios, rate limiting ni cuotas por usuario. No expongas públicamente una instalación conectada a APIs facturables sin añadir control de acceso y protección contra abuso.

Consulta [Despliegue](docs/DEPLOYMENT.md) y [Configuración](docs/CONFIGURATION.md) para obtener más detalles.

## Comandos

| Comando | Propósito |
| --- | --- |
| `npm run dev` | Iniciar el servidor de desarrollo |
| `npm run lint` | Ejecutar ESLint |
| `npx tsc --noEmit` | Validar TypeScript sin generar archivos |
| `npm run build` | Crear el build de producción |
| `npm start` | Servir el build de producción |

## Documentación

- [Getting Started](docs/GETTING-STARTED.md)
- [Configuración](docs/CONFIGURATION.md)
- [Arquitectura](docs/ARCHITECTURE.md)
- [Referencia de la API](docs/API.md)
- [Desarrollo](docs/DEVELOPMENT.md)
- [Pruebas](docs/TESTING.md)
- [Despliegue](docs/DEPLOYMENT.md)
- [Política de seguridad](SECURITY.md)

## Contribuir

Las contribuciones son bienvenidas. Lee [CONTRIBUTING.md](CONTRIBUTING.md), crea una rama enfocada, ejecuta lint, typecheck y build, y abre un pull request.

Si Flow te resulta útil, deja una **estrella en el repositorio**, compártelo con otro creador y cuéntanos qué construiste.

## Seguridad

No informes vulnerabilidades en issues públicos. Sigue [SECURITY.md](SECURITY.md) y evita incluir credenciales, IDs privados, medios confidenciales o datos personales.

## Aviso legal

Flow es un proyecto open source independiente. No está afiliado, respaldado ni patrocinado por Google. Google Cloud, Vertex AI, Gemini, Nano Banana, Omni y Veo son marcas o nombres de productos de sus respectivos propietarios. Los modelos, APIs, precios, cuotas, disponibilidad y funciones pueden cambiar.

Eres responsable de tus costes de infraestructura, del contenido generado, de la seguridad del despliegue y del cumplimiento de los términos y leyes aplicables.

## Licencia

Publicado bajo la [Licencia MIT](LICENSE).

---

<div align="center">

**Desarrollado por [Rafael Vieira](https://github.com/TechBeme)**

[![GitHub](https://img.shields.io/badge/GitHub-TechBeme-181717?logo=github)](https://github.com/TechBeme)
[![Fiverr](https://img.shields.io/badge/Fiverr-Tech__Be-1DBF73?logo=fiverr)](https://www.fiverr.com/tech_be)
[![Upwork](https://img.shields.io/badge/Upwork-Perfil-14a800?logo=upwork)](https://www.upwork.com/freelancers/~01f0abcf70bbd95376)
[![Email](https://img.shields.io/badge/Email-contact@techbe.me-EA4335?logo=gmail)](mailto:contact@techbe.me)

</div>
