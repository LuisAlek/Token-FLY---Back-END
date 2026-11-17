# TokenFLY - Backend

API REST de TokenFLY: autenticación con JWT, cuestionarios y foro moderado. Construida con Express 4, TypeScript, Zod, Mongoose y MongoDB Atlas bajo Arquitectura Hexagonal con Vertical Slicing.

Este repositorio contiene únicamente el backend y es autocontenido; el frontend se mantiene en un repositorio aparte.

## Stack

| Capa | Tecnologías |
| --- | --- |
| Runtime | Node.js 20+, Express 4 |
| Lenguaje | TypeScript 5 (CommonJS, `strict`) |
| Validación | Zod 4 |
| Persistencia | MongoDB Atlas, Mongoose 8 |
| Seguridad | JWT, bcryptjs, Helmet, CORS, express-rate-limit |

## Requisitos

- Node.js 20 o superior.
- npm 9 o superior.
- Un clúster accesible de MongoDB Atlas.

## Configuración

Crea un archivo `.env` en la raíz de esta carpeta (ignorado por Git):

```dotenv
NODE_ENV=development
PORT=4000
CORS_ORIGIN=http://localhost:5173
MONGODB_URI=mongodb+srv://USUARIO:CONTRASENA@cluster0.xxxxx.mongodb.net/tokenfly?retryWrites=true&w=majority
JWT_SECRET=cambia-este-secreto-por-uno-largo-y-aleatorio-de-32-caracteres
JWT_EXPIRES_IN=7d
ADMIN_USERNAME=AdminTokenFLY
ADMIN_EMAIL=admin@tokenfly.com
ADMIN_PASSWORD=Admin1234
```

| Variable | Obligatoria | Descripción |
| --- | --- | --- |
| `MONGODB_URI` | Sí | Cadena de conexión a MongoDB Atlas. |
| `JWT_SECRET` | Sí | Secreto de firma con al menos 16 caracteres (se recomiendan 32+). |
| `NODE_ENV` | No | `development`, `production` o `test`. Por defecto `development`. |
| `PORT` | No | Puerto HTTP. Por defecto `4000`. |
| `CORS_ORIGIN` | No | Origen(es) permitidos, separados por coma. |
| `JWT_EXPIRES_IN` | No | Vigencia del token. Por defecto `7d`. |
| `ADMIN_*` | No | Datos usados por el seed del administrador. |

Las variables se validan al iniciar con Zod (`src/config/env.ts`): si falta una obligatoria o es inválida, el proceso aborta con el detalle del error.

## Instalación y ejecución

```powershell
npm install
npm run seed:admin
npm run dev
```

La API queda disponible en `http://localhost:4000/api`.

El seed es idempotente: si el correo del administrador ya existe, actualiza su nombre, contraseña y rol.

## Scripts

| Comando | Descripción |
| --- | --- |
| `npm run dev` | Inicia la API con recarga automática (`tsx watch`). |
| `npm run build` | Compila TypeScript en `dist/`. |
| `npm start` | Ejecuta la compilación de producción. |
| `npm run typecheck` | Verifica tipos sin generar archivos. |
| `npm run seed:admin` | Crea o actualiza el administrador inicial. |

## Estructura

```text
src/
  server.ts                  Arranque de Express, middlewares y apagado limpio
  config/
    env.ts                   Carga y validación de variables de entorno
  shared/
    application/UseCase.ts   Contrato de casos de uso
    domain/                  Errores, roles y ValueObject base
    infrastructure/
      container.ts           Raíz de composición de dependencias
      db/mongo.ts            Conexión a MongoDB
      http/                  asyncHandler, validación, 404 y errores
      security/              JWT y hashing de contraseñas
    types/express.d.ts       Tipado de la request autenticada
  scripts/
    seedAdmin.ts             Seed del administrador
  modules/
    auth/                    Registro, login y usuario actual
    quiz/                    Cuestionarios publicados y administración
    forum/                   Comentarios con moderación y política de contenido
```

Cada módulo sigue las capas `domain/` (entidades, value objects, repositorios), `application/` (casos de uso y DTOs), `infrastructure/` (Mongoose y middlewares) y `controllers/` (schemas, controladores y rutas).

## Contenido de las carpetas

### Raíz de `backend/`

| Archivo | Responsabilidad |
| --- | --- |
| `package.json` | Dependencias y scripts de desarrollo, build, ejecución y seed. |
| `tsconfig.json` | Compilación a CommonJS en `dist/` con `strict` activado. |
| `.env` | Variables de entorno locales (ignorado por Git). |
| `.gitignore` | Exclusiones de dependencias, build, logs y secretos. |
| `dist/` | Salida generada por `npm run build`; no se edita ni se versiona. |

### `src/`

| Archivo | Responsabilidad |
| --- | --- |
| `server.ts` | Crea la app de Express, registra Helmet/CORS/JSON/morgan, monta los routers, expone `/api/health` y gestiona el apagado limpio. |

### `src/config/`

| Archivo | Responsabilidad |
| --- | --- |
| `env.ts` | Carga `.env` con dotenv, valida las variables con Zod y exporta `env` y `corsOrigins`. |

### `src/shared/`

| Archivo | Responsabilidad |
| --- | --- |
| `application/UseCase.ts` | Interfaz genérica que implementan todos los casos de uso. |
| `domain/errors.ts` | Jerarquía de errores de aplicación y HTTP (`AppError` y derivados). |
| `domain/roles.ts` | Roles disponibles (`user`, `admin`). |
| `domain/ValueObject.ts` | Clase base para value objects con validación encapsulada. |
| `infrastructure/container.ts` | Raíz de composición: instancia repositorios, servicios, casos de uso y controladores. |
| `infrastructure/db/mongo.ts` | Conexión y desconexión de Mongoose con manejo de eventos. |
| `infrastructure/http/asyncHandler.ts` | Envuelve handlers async y delega errores al middleware. |
| `infrastructure/http/errorMiddleware.ts` | Traduce errores de dominio, Zod y Mongo a respuestas HTTP. |
| `infrastructure/http/notFound.ts` | Respuesta 404 uniforme para rutas inexistentes. |
| `infrastructure/http/validate.ts` | Valida `body`, `params` y `query` con schemas Zod. |
| `infrastructure/security/jwt.ts` | `JwtTokenService`: firma, verificación y decodificación de tokens. |
| `infrastructure/security/password.ts` | `BcryptPasswordHasher`: hash y comparación de contraseñas. |
| `types/express.d.ts` | Extiende `Express.Request` con el usuario autenticado. |

### `src/modules/auth/`

| Archivo | Responsabilidad |
| --- | --- |
| `domain/user.entity.ts` | Entidad `User` con estado privado y getters. |
| `domain/email.vo.ts` | Value object de email con `EMAIL_REGEX` (`.co` / `.com`). |
| `domain/password.vo.ts` | Value object de contraseña con límites de longitud. |
| `domain/ports.ts` | Puertos de hashing y emisión de tokens. |
| `domain/user.repository.ts` | Interfaz del repositorio de usuarios. |
| `application/registerUser.ts` | Caso de uso de registro con auto-login. |
| `application/loginUser.ts` | Caso de uso de inicio de sesión. |
| `application/getCurrentUser.ts` | Caso de uso que devuelve el usuario autenticado. |
| `application/authResult.ts` | Tipo compartido de resultado de autenticación. |
| `infrastructure/UserModel.ts` | Esquema y modelo Mongoose de usuario. |
| `infrastructure/MongoUserRepository.ts` | Implementación del repositorio sobre Mongoose. |
| `infrastructure/authMiddleware.ts` | `AuthGuard` y `RoleGuard` para proteger rutas. |
| `controllers/AuthController.ts` | Adapta HTTP a los casos de uso de autenticación. |
| `controllers/auth.routes.ts` | Rutas `/api/auth/*` con guards y validación. |
| `controllers/auth.schemas.ts` | Schemas Zod de registro y login. |

### `src/modules/quiz/`

| Archivo | Responsabilidad |
| --- | --- |
| `domain/quiz.entity.ts` | Entidad `Quiz` con preguntas, borrador y estado publicado. |
| `domain/question.factory.ts` | Crea y valida preguntas (3 opciones incorrectas y 1 correcta). |
| `domain/quizEvaluator.ts` | Corrige respuestas y calcula el puntaje final. |
| `domain/quiz.repository.ts` | Interfaz del repositorio de cuestionarios. |
| `application/listPublishedQuizzes.ts` | Lista los cuestionarios publicados. |
| `application/getPublishedQuiz.ts` | Obtiene un cuestionario publicado por id. |
| `application/checkAnswer.ts` | Valida una respuesta sin revelar la correcta. |
| `application/submitQuiz.ts` | Envía todas las respuestas y devuelve el resultado. |
| `application/manageQuiz.ts` | Casos de uso de administración: listar, obtener, crear, actualizar, publicar y eliminar. |
| `application/quizFactory.ts` | Reconstruye entidades `Quiz` desde los datos de entrada. |
| `application/quiz.dto.ts` | `QuizPresenter`: transforma entidades en DTOs de respuesta. |
| `infrastructure/QuizModel.ts` | Esquema y modelo Mongoose de cuestionarios. |
| `infrastructure/MongoQuizRepository.ts` | Implementación del repositorio sobre Mongoose. |
| `controllers/QuizController.ts` | Adapta HTTP a los casos de uso públicos. |
| `controllers/AdminQuizController.ts` | Adapta HTTP a los casos de uso de administración. |
| `controllers/quiz.routes.ts` | Exporta `quizRouter` y `adminQuizRouter` con guards y validación. |
| `controllers/quiz.schemas.ts` | Schemas Zod de creación, actualización y respuestas. |

### `src/modules/forum/`

| Archivo | Responsabilidad |
| --- | --- |
| `domain/comment.entity.ts` | Entidad `Comment` con autor, contenido y fechas. |
| `domain/contentPolicy.ts` | Política de contenido: longitud y bloqueo de enlaces, URLs, imágenes y videos. |
| `domain/comment.repository.ts` | Interfaz del repositorio de comentarios. |
| `application/manageComments.ts` | Casos de uso para listar, crear, editar y eliminar comentarios. |
| `application/comment.dto.ts` | `CommentPresenter`: transforma entidades en DTOs de respuesta. |
| `infrastructure/CommentModel.ts` | Esquema y modelo Mongoose de comentarios. |
| `infrastructure/MongoCommentRepository.ts` | Implementación del repositorio sobre Mongoose. |
| `controllers/ForumController.ts` | Adapta HTTP a los casos de uso del foro. |
| `controllers/forum.routes.ts` | Rutas `/api/forum/comments/*` con guards y validación. |
| `controllers/forum.schemas.ts` | Schemas Zod de comentarios y paginación. |

### `src/scripts/`

| Archivo | Responsabilidad |
| --- | --- |
| `seedAdmin.ts` | Valida `ADMIN_*`, conecta a MongoDB y hace upsert del administrador con contraseña cifrada. |

## Endpoints

Todas las respuestas usan `{ "data": ... }`. Los errores usan `{ "message": "...", "code": "...", "errors": { ... } }`.

| Método | Ruta | Auth | Descripción |
| --- | --- | --- | --- |
| `GET` | `/api/health` | No | Estado del servicio y la base de datos. |
| `POST` | `/api/auth/register` | No | Registro con auto-login. |
| `POST` | `/api/auth/login` | No | Inicio de sesión. |
| `GET` | `/api/auth/me` | Usuario | Datos del usuario autenticado. |
| `GET` | `/api/quizzes` | Usuario | Cuestionarios publicados. |
| `GET` | `/api/quizzes/:quizId` | Usuario | Detalle de un cuestionario publicado. |
| `POST` | `/api/quizzes/:quizId/check-answer` | Usuario | Valida una respuesta sin revelar la correcta. |
| `POST` | `/api/quizzes/:quizId/submit` | Usuario | Envía respuestas y obtiene el resultado. |
| `GET` | `/api/admin/quizzes` | Admin | Cuestionarios del administrador. |
| `GET` | `/api/admin/quizzes/:quizId` | Admin | Detalle editable. |
| `POST` | `/api/admin/quizzes` | Admin | Crea un cuestionario. |
| `PUT` | `/api/admin/quizzes/:quizId` | Admin | Actualiza un cuestionario. |
| `PATCH` | `/api/admin/quizzes/:quizId/publish` | Admin | Publica un cuestionario. |
| `DELETE` | `/api/admin/quizzes/:quizId` | Admin | Elimina un cuestionario. |
| `GET` | `/api/forum/comments` | Usuario | Comentarios paginados. |
| `POST` | `/api/forum/comments` | Usuario | Crea un comentario. |
| `PATCH` | `/api/forum/comments/:commentId` | Autor/Admin | Edita un comentario. |
| `DELETE` | `/api/forum/comments/:commentId` | Autor/Admin | Elimina un comentario. |

Las rutas autenticadas esperan:

```http
Authorization: Bearer <token>
```

## Solución de problemas

- **Timeout de MongoDB:** verifica la cadena de conexión y permite tu IP en MongoDB Atlas.
- **CORS bloqueado:** agrega el origen exacto del frontend en `CORS_ORIGIN`.
- **401 al recargar:** el token expiró o `JWT_SECRET` cambió; vuelve a iniciar sesión.
- **El admin no existe:** ejecuta `npm run seed:admin` con las variables `ADMIN_*` configuradas.
- **Variables de entorno inválidas:** el backend muestra al iniciar las variables que fallan la validación.
