# 🏆 Quiniela Mundial 2026

Aplicación web para predecir los resultados de los partidos del **Mundial FIFA 2026**. Los usuarios pueden registrarse, hacer sus predicciones partido a partido y competir en una tabla de posiciones global.

---

## ✨ Características

- 🔐 **Autenticación** con Supabase (Magic Link / OTP por correo)
- ⚽ **Partidos** — visualiza partidos próximos, en vivo y finalizados por grupo y fase
- 🎯 **Predicciones** — predice el marcador y el primer goleador de cada partido
- 🏅 **Tabla de posiciones** — ranking en tiempo real con puntos, aciertos exactos y aciertos de resultado
- 📱 **Diseño mobile-first** — optimizada para usarse desde el celular

---

## 🛠️ Stack Tecnológico

| Tecnología | Versión | Uso |
|---|---|---|
| [Next.js](https://nextjs.org/) | 16.2.0 | Framework principal (App Router) |
| [React](https://react.dev/) | 19.2.4 | UI |
| [TypeScript](https://www.typescriptlang.org/) | 5.7.3 | Tipado estático |
| [Tailwind CSS](https://tailwindcss.com/) | 4.x | Estilos |
| [Supabase](https://supabase.com/) | 2.x | Auth y base de datos |
| [Radix UI](https://www.radix-ui.com/) | — | Componentes accesibles |
| [React Hook Form](https://react-hook-form.com/) | 7.x | Manejo de formularios |
| [Zod](https://zod.dev/) | 3.x | Validación de esquemas |
| [Lucide React](https://lucide.dev/) | 0.564 | Íconos |
| [Recharts](https://recharts.org/) | 2.x | Gráficas y estadísticas |
| [SWR](https://swr.vercel.app/) | 2.x | Fetching y caché de datos |

---

## 📁 Estructura del Proyecto

```
quiniela/
├── app/                    # App Router de Next.js
│   ├── globals.css         # Estilos globales
│   ├── layout.tsx          # Layout raíz
│   └── page.tsx            # Página principal
├── components/
│   ├── app-shell.tsx       # Shell principal con navegación
│   ├── auth/               # Pantalla de login y registro
│   ├── matches/            # Vista de partidos
│   ├── predictions/        # Vista de predicciones del usuario
│   ├── leaderboard/        # Tabla de posiciones
│   ├── theme-provider.tsx  # Proveedor de tema (dark/light)
│   └── ui/                 # Componentes base de UI (shadcn)
├── hooks/
│   ├── use-mobile.ts       # Hook para detectar mobile
│   └── use-toast.ts        # Hook para notificaciones
├── lib/
│   ├── api.ts              # Capa de API y tipos principales
│   ├── auth-context.tsx    # Contexto de autenticación
│   ├── supabase/           # Cliente de Supabase
│   └── utils.ts            # Utilidades generales
├── public/                 # Archivos estáticos
├── styles/                 # Estilos adicionales
├── .env.local              # Variables de entorno (no versionar)
├── next.config.mjs         # Configuración de Next.js
├── tailwind.config         # Configuración de Tailwind
└── tsconfig.json           # Configuración de TypeScript
```

---

## 🚀 Instalación y Puesta en Marcha

### Prerrequisitos

- [Node.js](https://nodejs.org/) v18 o superior
- Una cuenta en [Supabase](https://supabase.com/)

### 1. Clonar el repositorio

```bash
git clone <url-del-repositorio>
cd quiniela
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

Crea un archivo `.env.local` en la raíz del proyecto con las siguientes variables:

```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key

# Opcional: URL base de tu API backend (si no se define, usa datos mock)
NEXT_PUBLIC_API_URL=https://tu-api.com
```

> **Nota:** Puedes obtener `SUPABASE_URL` y `SUPABASE_ANON_KEY` desde la sección **Project Settings → API** de tu proyecto en Supabase.

### 4. Iniciar el servidor de desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

---

## 📜 Scripts Disponibles

| Comando | Descripción |
|---|---|
| `npm run dev` | Inicia el servidor de desarrollo |
| `npm run build` | Compila la app para producción |
| `npm run start` | Inicia el servidor de producción |
| `npm run lint` | Ejecuta el linter (ESLint) |

---

## 🗺️ Flujo de la Aplicación

```
Inicio
  └── ¿Usuario autenticado?
        ├── No → Pantalla de Auth (Login / Registro con Magic Link)
        └── Sí → App Shell
                  ├── 📅 Partidos      → Ver partidos y hacer predicciones
                  ├── 🎯 Mis Picks     → Ver historial de predicciones y puntos
                  └── 🏆 Tabla         → Ranking de todos los participantes
```

---

## 🔑 Autenticación

El sistema utiliza **Supabase Auth con Magic Link (OTP)**:

1. El usuario ingresa su correo en el formulario de registro o inicio de sesión.
2. Supabase envía un enlace mágico al correo.
3. Al hacer clic en el enlace, el usuario queda autenticado automáticamente.

No se requiere contraseña.

---

## 📊 Sistema de Puntuación

| Tipo de acierto | Puntos |
|---|---|
| Resultado correcto (ganó X) | +3 pts |
| Marcador exacto | +5 pts |
| Primer goleador correcto | +2 pts |

---

## 🧪 Modo Mock (sin backend)

Si la variable `NEXT_PUBLIC_API_URL` **no está definida**, la app carga datos de ejemplo locales para facilitar el desarrollo y demostración. Esto incluye:

- Partidos simulados en distintos estados (próximo, en vivo, finalizado)
- Predicciones de ejemplo
- Tabla de posiciones con usuarios ficticios

---

## 🤝 Contribuciones

1. Haz un fork del repositorio
2. Crea una rama para tu feature: `git checkout -b feature/mi-feature`
3. Haz commit de tus cambios: `git commit -m 'feat: agrega mi feature'`
4. Haz push a la rama: `git push origin feature/mi-feature`
5. Abre un Pull Request

---

## 📄 Licencia

Este proyecto es privado. Todos los derechos reservados.
