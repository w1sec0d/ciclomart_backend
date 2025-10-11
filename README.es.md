# CicloMart (Backend) - Compra y venta de bicicletas y repuestos de ciclismo

[![en](https://img.shields.io/badge/Language-English-green)](README.md) [![es](https://img.shields.io/badge/Idioma-Español-green)](README.es.md)

- Link de la app: [ciclomart.com](https://ciclomart.com)

## Descripción

CicloMart es una aplicación web de compra-venta de bicicletas y repuestos de ciclismo. Ofrece una experiencia única, segura y confiable, al exigir documentación legal de propiedad a los vendedores. Los usuarios pueden encontrar exactamente lo que buscan usando filtros avanzados como grupos de transmisión, suspensión, peso, rines, frenos entre muchas otras características relevantes.

## Miembros del equipo

- **Juan David Madrid Contreras** - [JuMad-SE](https://github.com/JuMad-SE)
- **Carlos David Ramirez Muñoz** - [w1sec0d](https://github.com/w1sec0d)
- **Johan David Rodriguez Gutierrez** - [Homeroso](https://github.com/Homeroso)
- **Ronald Daniel Jacanamejoy Mutumbajoy** - [RonaldDaniel20](https://github.com/RonaldDaniel20)

## Instalación para desarrolladores

1. Clona el repositorio:

   ```bash
   git clone https://github.com/RonaldDaniel20/CicloMart_Back.git
   ```

2. Instala las dependencias:

   ```bash
    npm install
   ```

3. Ejecuta el servidor de desarrollo:

   ```bash
    npm run dev
   ```

Para ejecutar correctamente el projecto debe incluirse un archivo .env en la raiz del proyecto con las siguientes variables de entorno:

- DB_PORT: Puerto de la base de datos
- DB_HOST: Host de la base de datos
- DB_USER: Usuario de la base de datos
- DB_PASSWORD: Contraseña de la base de datos
- DB_NAME: Nombre de la base de datos
- FRONTEND_URL: URL del frontend de la aplicación
- JWT_SECRET: Clave secreta para el JSON Web Token
- EMAIL_ONLINE: Correo electrónico para el envío de correo
- PASSWORD_ONLINE: Contraseña del correo electrónico para el envío de correo
- EMAIL_HOST: Host del correo electrónico
- EMAIL_PORT: Puerto del correo electrónico
- BACKEND_URL: URL del backend de la aplicación
- MP_ACCESS_TOKEN: Token de acceso de MercadoPago (Payment Gateway)
- MP_CLIENT_ID: ID de cliente de MercadoPago (Payment Gateway)
- MP_CLIENT_SECRET: Secreto de cliente de MercadoPago (Payment Gateway)
- MP_PUBLIC_KEY: Clave pública de MercadoPago (Payment Gateway)
- MP_REDIRECT_URL: URL de redirección de MercadoPago (Payment Gateway)

Estos parametros deben coincidir con una instancia de base de datos MySQL, puede ser inicializada con el script en `./database/dbCreation.sql`

## Licencia

Es posible usar el proyecto con fines educativos y no-comerciales únicamente. Ver más detalles a continuación:

[![License: CC BY-NC 4.0](https://img.shields.io/badge/License-CC%20BY--NC%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by-nc/4.0/)
