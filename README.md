# CicloMart_Back

Proyecto del curso Ingeniería de Software II de la Universidad Nacional de Colombia. Grupo de trabajo: CICLOMART

## Descripción

CicloMart es una aplicación web de compra-venta de bicicletas y repuestos de ciclismo. Ofrece una experiencia única, segura y confiable, al exigir documentación legal de propiedad a los vendedores. Los usuarios pueden encontrar exactamente lo que buscan usando filtros avanzados como grupos de transmisión, suspensión, peso, rines, frenos entre muchas otras características relevantes.

## Nombre del equipo

**CICLOMART**

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

Para ejecutar correctamente el projecto debe incluirse un archivo .env en la raiz del proyecto con las siguientes variables de entorno: DB_PORT, DB_HOST, DB_USER, DB_PASSWORD y DB_NAME

Estos parametros deben coincidir con una instancia de base de datos MySQL, puede ser inicializada con el script en `./database/dbCreation.sql`

## Licencia
Es posible usar el proyecto con fines educativos y no-comerciales únicamente. Ver más detalles a continuación:

[![License: CC BY-NC 4.0](https://img.shields.io/badge/License-CC%20BY--NC%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by-nc/4.0/)
