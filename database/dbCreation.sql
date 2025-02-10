-- Script generado por dbdiagram.io
-- Inicializa la base de datos ciclomart en mysql workbench 8.0

-- Recomiendo crear un esquema aparte para probar
DROP DATABASE IF EXISTS ciclomart2;
CREATE DATABASE ciclomart2;
USE ciclomart2;

CREATE TABLE `usuario` (
  `idUsuario` int PRIMARY KEY NOT NULL AUTO_INCREMENT,
  `nombre` varchar(45) NOT NULL,
  `apellido` varchar(45) NOT NULL,
  `fechaNacimiento` date,
  `rol` ENUM ('comprador', 'cliente', 'administrador') DEFAULT 'comprador',
  `correo` varchar(255) NOT NULL,
  `direccion` varchar(255),
  `telefono` varchar(60),
  `username` varchar(45),
  `password` varchar(64) NOT NULL,
  `fechaRegistro` datetime DEFAULT (current_timestamp)
);

CREATE TABLE `modelo` (
  `idModelo` int PRIMARY KEY NOT NULL AUTO_INCREMENT,
  `nombre` varchar(255) NOT NULL,
  `tipo` ENUM ('bicicleta', 'componente', 'accesorio', 'otro') NOT NULL DEFAULT 'bicicleta',
  `descripcion` text NOT NULL,
  `categoria` varchar(100),
  `compatibilidad` text,
  `idBicicleta` int,
  `idMarca` int NOT NULL
);

CREATE TABLE `imagen` (
  `idImagen` int PRIMARY KEY NOT NULL AUTO_INCREMENT,
  `idUsuario` int,
  `idDocumento` int,
  `idModelo` int,
  `url` varchar(255)
);

CREATE TABLE `bicicleta` (
  `idBicicleta` int PRIMARY KEY NOT NULL AUTO_INCREMENT,
  `tipoBicicleta` varchar(45),
  `color` varchar(45),
  `genero` varchar(45),
  `edad` varchar(45),
  `tamañoMarco` varchar(45),
  `materialMarco` varchar(45),
  `tamañoRueda` varchar(45),
  `tipoFrenos` varchar(45),
  `velocidades` varchar(45),
  `suspension` varchar(45),
  `transmision` varchar(45),
  `tipoPedales` varchar(45),
  `manubrio` varchar(45),
  `pesoBicicleta` float,
  `pesoMaximo` float,
  `extras` text
);

CREATE TABLE `marca` (
  `idMarca` int PRIMARY KEY NOT NULL AUTO_INCREMENT,
  `nombre` varchar(45) NOT NULL
);

CREATE TABLE `tienda` (
  `idTienda` int PRIMARY KEY NOT NULL AUTO_INCREMENT,
  `idUsuarioAdministrador` int NOT NULL,
  `nombre` varchar(255),
  `descripcion` text,
  `telefono` varchar(60)
);

CREATE TABLE `carrito` (
  `idCarrito` int PRIMARY KEY NOT NULL AUTO_INCREMENT,
  `idUsuario` int NOT NULL,
  `cantidadProductos` int DEFAULT 0,
  `precioTotal` float,
  `fecha` datetime,
  `estado` ENUM ('pendiente', 'exitosa', 'fallida') DEFAULT 'pendiente',
  `metodoPago` varchar(45),
  `direccionEnvio` varchar(45),
  `descuento` float
);

CREATE TABLE `carritoProducto` (
  `idCarritoProducto` int PRIMARY KEY NOT NULL AUTO_INCREMENT,
  `idProducto` int NOT NULL,
  `idCarrito` int NOT NULL,
  `cantidad` int,
  `precio_unitario` float,
  `fecha` datetime DEFAULT (current_timestamp),
  `direccion` text,
  `estadoEnvio` varchar(45)
);

CREATE TABLE `documento` (
  `idDocumento` int PRIMARY KEY NOT NULL AUTO_INCREMENT,
  `idModelo` int NOT NULL,
  `idUsuario` int,
  `tipo` varchar(60),
  `descripcion` text,
  `estado` varchar(60),
  `fechaCompra` date
);

CREATE TABLE `producto` (
  `idProducto` int PRIMARY KEY NOT NULL AUTO_INCREMENT,
  `idModelo` int NOT NULL,
  `idVendedor` int,
  `idTienda` int,
  `precio` float,
  `precioCompleto` float,
  `cantidad` int DEFAULT 0,
  `estado` ENUM ('nuevo', 'usado') DEFAULT 'nuevo',
  `disponibilidad` ENUM ('disponible', 'vendido', 'reservado') DEFAULT 'disponible',
  `costoEnvio` float NOT NULL DEFAULT 0,
  `retiroEnTienda` bool NOT NULL DEFAULT false,
  `fechaPublicacion` datetime DEFAULT (current_timestamp)
);

CREATE TABLE `calificacion` (
  `idCalificacion` int PRIMARY KEY NOT NULL AUTO_INCREMENT,
  `idUsuarioComprador` int NOT NULL,
  `idUsuarioVendedor` int,
  `idProducto` int NOT NULL,
  `idTienda` int,
  `foto` varchar(255),
  `comentario` text,
  `nota` int,
  `fecha` datetime DEFAULT (current_timestamp)
);

CREATE TABLE `mensaje` (
  `idMensaje` int PRIMARY KEY NOT NULL AUTO_INCREMENT,
  `idUsuarioEmisor` int NOT NULL,
  `idUsuarioReceptor` int NOT NULL,
  `idCarritoProducto` int NOT NULL,
  `contenido` text,
  `fecha` datetime
);

CREATE INDEX `idMarca` ON `modelo` (`idMarca`);

CREATE INDEX `nombre` ON `modelo` (`nombre`);

CREATE INDEX `imagen_modelo` ON `imagen` (`idModelo`);

CREATE INDEX `imagen_documento` ON `imagen` (`idDocumento`);

CREATE INDEX `imagen_usuario` ON `imagen` (`idUsuario`);

CREATE INDEX `nombre` ON `marca` (`nombre`);

CREATE INDEX `nombre` ON `tienda` (`nombre`);

CREATE INDEX `idUsuario` ON `carrito` (`idUsuario`);

CREATE INDEX `idUsuario` ON `documento` (`idUsuario`);

CREATE INDEX `idUsuarioComprador` ON `calificacion` (`idUsuarioComprador`);

CREATE INDEX `fk_calificacion_usuario1_idx` ON `calificacion` (`idUsuarioVendedor`);

CREATE INDEX `idUsuarioEmisor` ON `mensaje` (`idUsuarioEmisor`);

CREATE INDEX `fk_mensaje_usuario1_idx` ON `mensaje` (`idUsuarioReceptor`);

ALTER TABLE `modelo` ADD FOREIGN KEY (`idBicicleta`) REFERENCES `bicicleta` (`idBicicleta`);

ALTER TABLE `modelo` ADD FOREIGN KEY (`idMarca`) REFERENCES `marca` (`idMarca`);

ALTER TABLE `imagen` ADD FOREIGN KEY (`idUsuario`) REFERENCES `usuario` (`idUsuario`);

ALTER TABLE `imagen` ADD FOREIGN KEY (`idDocumento`) REFERENCES `documento` (`idDocumento`);

ALTER TABLE `imagen` ADD FOREIGN KEY (`idModelo`) REFERENCES `modelo` (`idModelo`);

ALTER TABLE `bicicleta` ADD FOREIGN KEY (`idBicicleta`) REFERENCES `modelo` (`idModelo`);

ALTER TABLE `tienda` ADD FOREIGN KEY (`idUsuarioAdministrador`) REFERENCES `usuario` (`idUsuario`);

ALTER TABLE `carrito` ADD FOREIGN KEY (`idUsuario`) REFERENCES `usuario` (`idUsuario`);

ALTER TABLE `carritoProducto` ADD FOREIGN KEY (`idProducto`) REFERENCES `producto` (`idProducto`);

ALTER TABLE `carritoProducto` ADD FOREIGN KEY (`idCarrito`) REFERENCES `carrito` (`idCarrito`);

ALTER TABLE `documento` ADD FOREIGN KEY (`idModelo`) REFERENCES `modelo` (`idModelo`);

ALTER TABLE `documento` ADD FOREIGN KEY (`idUsuario`) REFERENCES `usuario` (`idUsuario`);

ALTER TABLE `producto` ADD FOREIGN KEY (`idModelo`) REFERENCES `modelo` (`idModelo`);

ALTER TABLE `producto` ADD FOREIGN KEY (`idVendedor`) REFERENCES `usuario` (`idUsuario`);

ALTER TABLE `producto` ADD FOREIGN KEY (`idTienda`) REFERENCES `tienda` (`idTienda`);

ALTER TABLE `calificacion` ADD FOREIGN KEY (`idUsuarioComprador`) REFERENCES `usuario` (`idUsuario`);

ALTER TABLE `calificacion` ADD FOREIGN KEY (`idUsuarioVendedor`) REFERENCES `usuario` (`idUsuario`);

ALTER TABLE `calificacion` ADD FOREIGN KEY (`idProducto`) REFERENCES `producto` (`idProducto`);

ALTER TABLE `calificacion` ADD FOREIGN KEY (`idTienda`) REFERENCES `tienda` (`idTienda`);

ALTER TABLE `mensaje` ADD FOREIGN KEY (`idUsuarioEmisor`) REFERENCES `usuario` (`idUsuario`);

ALTER TABLE `mensaje` ADD FOREIGN KEY (`idUsuarioReceptor`) REFERENCES `usuario` (`idUsuario`);

ALTER TABLE `mensaje` ADD FOREIGN KEY (`idCarritoProducto`) REFERENCES `carritoProducto` (`idCarritoProducto`);
