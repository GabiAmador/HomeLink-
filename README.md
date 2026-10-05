# HomeLink

### Espacios que se convierten en hogar.

HomeLink es una aplicación web para la búsqueda, publicación y gestión de propiedades en alquiler en Jinotega, Nicaragua.

La plataforma permite a los usuarios explorar diferentes inmuebles, consultar información detallada, guardar propiedades favoritas, contactar con propietarios y publicar sus propios inmuebles desde una cuenta personal.

---

## Descripción del proyecto

HomeLink nace como una propuesta para facilitar la conexión entre personas que buscan un lugar para vivir y propietarios que desean publicar sus inmuebles.

La aplicación reúne en un mismo espacio funcionalidades de búsqueda, publicación, administración y contacto, ofreciendo una experiencia sencilla, moderna y orientada a las necesidades del mercado inmobiliario local.

---

## Objetivo

Desarrollar una plataforma web que facilite la búsqueda y publicación de inmuebles en alquiler, permitiendo a los usuarios encontrar propiedades de acuerdo con sus necesidades y a los propietarios gestionar sus publicaciones desde un mismo sistema.

---

## Funcionalidades principales

- Registro de usuarios.
- Inicio y cierre de sesión.
- Protección de rutas privadas.
- Exploración de propiedades.
- Visualización detallada de cada inmueble.
- Búsqueda y consulta de propiedades.
- Publicación de inmuebles.
- Edición de inmuebles publicados.
- Eliminación de publicaciones.
- Carga y gestión de imágenes.
- Propiedades favoritas.
- Contacto con propietarios.
- Integración con WhatsApp.
- Sistema de mensajes.
- Dashboard del usuario.
- Cambio de contraseña.
- Eliminación de cuenta.
- Ubicación de propiedades mediante mapa.
- Diseño responsive y adaptable.

---

##  Tecnologías utilizadas

### Frontend

- React
- Vite
- JavaScript
- HTML5
- CSS3
- React Router
- Leaflet
- React Leaflet

### Backend

- PHP
- Laravel
- API REST

### Base de datos

- Base de datos relacional gestionada mediante Laravel.

### Herramientas

- Git
- GitHub
- Visual Studio Code
- Figma

---

## Arquitectura

HomeLink utiliza una arquitectura basada en una aplicación frontend desarrollada con React y un backend desarrollado con Laravel.

La comunicación entre ambas partes se realiza mediante una API REST.

### Estructura general

```text
HomeLink
│
├── Frontend
│   ├── React
│   ├── Vite
│   ├── JavaScript
│   ├── CSS
│   └── React Router
│
├── Backend
│   ├── Laravel
│   ├── PHP
│   └── API REST
│
└── Base de datos
    └── Datos de usuarios e inmuebles
```

---

## Seguridad

La aplicación incorpora mecanismos para proteger las funcionalidades privadas del sistema.

Entre ellos se encuentran:

- Autenticación de usuarios.
- Gestión de sesión mediante token.
- Protección de rutas privadas.
- Validación de acceso al dashboard.
- Control de propietario sobre sus publicaciones.
- Protección de información de autenticación.
- Contraseñas almacenadas de forma segura mediante el sistema de autenticación del backend.

---

## Mapa

HomeLink utiliza Leaflet para mostrar la ubicación de los inmuebles mediante coordenadas geográficas.

Esto permite que los usuarios puedan conocer visualmente la ubicación de una propiedad y obtener una referencia más clara antes de contactarse con el propietario.

---

## Principales interfaces

El sistema cuenta con las siguientes interfaces:

1. Inicio
2. Propiedades
3. Detalle del inmueble
4. Publicar inmueble
5. Iniciar sesión
6. Registro
7. Dashboard
8. Editar inmueble

Las interfaces fueron diseñadas y documentadas utilizando Figma.

---

##  Equipo de trabajo

| Integrante | Responsabilidad |
|---|---|
| Jeniffer Gabriela Villagra Amador | Líder de proyecto / Backend |
| Katerin Gisell Cajina González | Frontend |
| Ryan Analiessy Pineda Gutierrez | QA / Documentación / DevOps |

---

## Instalación y ejecución

### 1. Clonar el repositorio

```bash
git clone https://github.com/GabiAmador/HomeLink-.git
```

### 2. Entrar al proyecto

```bash
cd HomeLink-
```

### 3. Instalar dependencias de PHP

```bash
composer install
```

### 4. Instalar dependencias de JavaScript

```bash
npm install
```

### 5. Configurar el archivo `.env`

Crear el archivo `.env` a partir del archivo de ejemplo y configurar las variables necesarias para el entorno local.

### 6. Generar la clave de Laravel

```bash
php artisan key:generate
```

### 7. Ejecutar las migraciones

```bash
php artisan migrate
```

### 8. Iniciar el servidor de Laravel

```bash
php artisan serve
```

### 9. Iniciar Vite

En otra terminal:

```bash
npm run dev
```

---

## Estructura general del proyecto

```text
HomeLink
│
├── app/
├── database/
├── public/
├── resources/
│   └── js/
│       ├── components/
│       ├── pages/
│       └── services/
│
├── routes/
├── storage/
├── tests/
├── .env.example
├── artisan
├── composer.json
├── package.json
└── README.md
```

---

## Estado del proyecto

**Proyecto funcional — MVP desarrollado.**

HomeLink cuenta con las funcionalidades principales definidas para el proyecto y se encuentra preparado para demostración académica.

---

## Documentación

La documentación del proyecto incluye:

- Descripción del problema.
- Justificación.
- Objetivos.
- Requerimientos funcionales y no funcionales.
- Arquitectura del sistema.
- Modelo de base de datos.
- Diagramas.
- Descripción de funcionalidades.
- Interfaces.
- Pruebas realizadas.
- Conclusiones y recomendaciones.

---

## Repositorio

**GitHub:**  
https://github.com/GabiAmador/HomeLink-

---

## Proyecto académico

**Carrera:** Ingeniería en Sistemas de Información  
**Universidad:** UNAN-León — CUR Jinotega  
**Proyecto:** HomeLink