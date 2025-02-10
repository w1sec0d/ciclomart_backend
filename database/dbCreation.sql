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
  `tipo` ENUM ('bicicleta', 'repuesto', 'accesorio', 'otro') NOT NULL DEFAULT 'bicicleta',
  `descripcion` text NOT NULL,
  `idMarca` int NOT NULL
);

CREATE TABLE `imagen` (
  `idImagen` int PRIMARY KEY NOT NULL AUTO_INCREMENT,
  `url` varchar(255),
  `idModelo` int,
  `idDocumento` int,
  `idUsuario` int
);

CREATE TABLE `bicicleta` (
  `idBicicleta` int PRIMARY KEY NOT NULL,
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
  `extras` varchar(100),
  `idCadena` int,
  `idRueda` int,
  `idPedalier` int,
  `idSillin` int,
  `idFreno` int,
  `idManubrio` int,
  `idCassette` int
);

CREATE TABLE `componente` (
  `idComponente` int PRIMARY KEY NOT NULL,
  `idModelo` int,
  `idMarca` int,
  `nombre` varchar(255) NOT NULL,
  `categoria` varchar(255),
  `compatibilidad` varchar(255)
);

CREATE TABLE `marca` (
  `idMarca` int PRIMARY KEY NOT NULL,
  `nombre` varchar(45) NOT NULL
);

CREATE TABLE `tienda` (
  `idTienda` int PRIMARY KEY NOT NULL,
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
  `estado` varchar(45),
  `metodoPago` varchar(45),
  `direccionEnvio` varchar(45),
  `descuento` float
);

CREATE TABLE `carritoProducto` (
  `idCarritoProducto` int PRIMARY KEY NOT NULL AUTO_INCREMENT,
  `idCarrito` int NOT NULL,
  `idProducto` int NOT NULL,
  `cantidad` int,
  `precio_unitario` float
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
  `idTienda` int,
  `idVendedor` int,
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
  `idProducto` int NOT NULL,
  `idUsuarioVendedor` int,
  `idTienda` int,
  `foto` varchar(255),
  `comentario` text,
  `nota` int,
  `fecha` datetime DEFAULT (current_timestamp)
);

CREATE TABLE `transaccion` (
  `idTransaccion` int PRIMARY KEY NOT NULL AUTO_INCREMENT,
  `idCarrito` int NOT NULL,
  `idComprador` int NOT NULL,
  `fecha` datetime,
  `monto` float,
  `metodoPago` varchar(45),
  `estado` ENUM ('pendiente', 'exitosa', 'fallida')
);

CREATE TABLE `mensaje` (
  `idMensaje` int PRIMARY KEY NOT NULL AUTO_INCREMENT,
  `idUsuarioEmisor` int NOT NULL,
  `idUsuarioReceptor` int NOT NULL,
  `idTransaccionProducto` int NOT NULL,
  `contenido` text,
  `fecha` datetime
);

CREATE TABLE `transaccionProducto` (
  `idTransaccionProducto` int PRIMARY KEY NOT NULL AUTO_INCREMENT,
  `idTransaccion` int NOT NULL,
  `idProducto` int NOT NULL,
  `cantidad` int NOT NULL,
  `fecha` datetime DEFAULT (current_timestamp),
  `direccion` text,
  `estadoEnvio` varchar(45)
);

CREATE INDEX `idMarca` ON `modelo` (`idMarca`);

CREATE INDEX `nombre` ON `modelo` (`nombre`);

CREATE INDEX `imagen_modelo` ON `imagen` (`idModelo`);

CREATE INDEX `imagen_documento` ON `imagen` (`idDocumento`);

CREATE INDEX `imagen_usuario` ON `imagen` (`idUsuario`);

CREATE INDEX `modelo_ibfk_1` ON `bicicleta` (`idCadena`);

CREATE INDEX `modelo_ibfk_2` ON `bicicleta` (`idRueda`);

CREATE INDEX `modelo_ibfk_3` ON `bicicleta` (`idPedalier`);

CREATE INDEX `modelo_ibfk_4` ON `bicicleta` (`idSillin`);

CREATE INDEX `modelo_ibfk_5` ON `bicicleta` (`idFreno`);

CREATE INDEX `modelo_ibfk_6` ON `bicicleta` (`idManubrio`);

CREATE INDEX `modelo_ibfk_7` ON `bicicleta` (`idCassette`);

CREATE INDEX `nombre` ON `componente` (`nombre`);

CREATE INDEX `marca_ibfk_1` ON `componente` (`idMarca`);

CREATE INDEX `nombre` ON `marca` (`nombre`);

CREATE INDEX `nombre` ON `tienda` (`nombre`);

CREATE INDEX `idUsuario` ON `carrito` (`idUsuario`);

CREATE INDEX `idUsuario` ON `documento` (`idUsuario`);

CREATE INDEX `idUsuarioComprador` ON `calificacion` (`idUsuarioComprador`);

CREATE INDEX `fk_calificacion_usuario1_idx` ON `calificacion` (`idUsuarioVendedor`);

CREATE INDEX `idCarrito` ON `transaccion` (`idCarrito`);

CREATE INDEX `fk_transaccion_usuario1_idx` ON `transaccion` (`idComprador`);

CREATE INDEX `idUsuarioEmisor` ON `mensaje` (`idUsuarioEmisor`);

CREATE INDEX `fk_mensaje_usuario1_idx` ON `mensaje` (`idUsuarioReceptor`);

CREATE INDEX `fk_transaccionProducto_transaccion_idx` ON `transaccionProducto` (`idTransaccion`);

CREATE INDEX `fk_transaccionProducto_producto_idx` ON `transaccionProducto` (`idProducto`);

ALTER TABLE `marca` ADD CONSTRAINT `idMarca` FOREIGN KEY (`idMarca`) REFERENCES `modelo` (`idMarca`);

ALTER TABLE `bicicleta` ADD CONSTRAINT `bicicleta_ibfk_1` FOREIGN KEY (`idBicicleta`) REFERENCES `modelo` (`idModelo`);

ALTER TABLE `componente` ADD FOREIGN KEY (`idModelo`) REFERENCES `modelo` (`idModelo`);

ALTER TABLE `componente` ADD CONSTRAINT `modelo_ibfk_1` FOREIGN KEY (`idComponente`) REFERENCES `bicicleta` (`idCadena`);

ALTER TABLE `componente` ADD CONSTRAINT `modelo_ibfk_2` FOREIGN KEY (`idComponente`) REFERENCES `bicicleta` (`idRueda`);

ALTER TABLE `componente` ADD CONSTRAINT `modelo_ibfk_3` FOREIGN KEY (`idComponente`) REFERENCES `bicicleta` (`idPedalier`);

ALTER TABLE `componente` ADD CONSTRAINT `modelo_ibfk_4` FOREIGN KEY (`idComponente`) REFERENCES `bicicleta` (`idSillin`);

ALTER TABLE `componente` ADD CONSTRAINT `modelo_ibfk_5` FOREIGN KEY (`idComponente`) REFERENCES `bicicleta` (`idFreno`);

ALTER TABLE `componente` ADD CONSTRAINT `modelo_ibfk_6` FOREIGN KEY (`idComponente`) REFERENCES `bicicleta` (`idManubrio`);

ALTER TABLE `componente` ADD CONSTRAINT `modelo_ibfk_7` FOREIGN KEY (`idComponente`) REFERENCES `bicicleta` (`idCassette`);

ALTER TABLE `componente` ADD CONSTRAINT `marca_ibfk_1` FOREIGN KEY (`idComponente`) REFERENCES `marca` (`idMarca`);

ALTER TABLE `tienda` ADD CONSTRAINT `tienda_ibfk_1` FOREIGN KEY (`idUsuarioAdministrador`) REFERENCES `usuario` (`idUsuario`) ON UPDATE CASCADE;

ALTER TABLE `carrito` ADD CONSTRAINT `carrito_ibfk_1` FOREIGN KEY (`idUsuario`) REFERENCES `usuario` (`idUsuario`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `carritoProducto` ADD FOREIGN KEY (`idCarrito`) REFERENCES `carrito` (`idCarrito`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `carritoProducto` ADD FOREIGN KEY (`idProducto`) REFERENCES `producto` (`idProducto`) ON DELETE NO ACTION ON UPDATE NO ACTION;

ALTER TABLE `documento` ADD CONSTRAINT `documento_ibfk_1` FOREIGN KEY (`idModelo`) REFERENCES `modelo` (`idModelo`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `documento` ADD CONSTRAINT `documento_ibfk_2` FOREIGN KEY (`idUsuario`) REFERENCES `usuario` (`idUsuario`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `calificacion` ADD CONSTRAINT `calificacion_ibfk_1` FOREIGN KEY (`idUsuarioComprador`) REFERENCES `usuario` (`idUsuario`) ON DELETE CASCADE;

ALTER TABLE `calificacion` ADD CONSTRAINT `fk_calificacion_usuario1` FOREIGN KEY (`idUsuarioVendedor`) REFERENCES `usuario` (`idUsuario`) ON DELETE NO ACTION ON UPDATE NO ACTION;

ALTER TABLE `calificacion` ADD FOREIGN KEY (`idProducto`) REFERENCES `producto` (`idProducto`) ON DELETE NO ACTION ON UPDATE NO ACTION;

ALTER TABLE `transaccion` ADD CONSTRAINT `transaccion_ibfk_1` FOREIGN KEY (`idCarrito`) REFERENCES `carrito` (`idCarrito`) ON DELETE CASCADE;

ALTER TABLE `transaccion` ADD CONSTRAINT `fk_transaccion_usuario1` FOREIGN KEY (`idComprador`) REFERENCES `usuario` (`idUsuario`) ON DELETE NO ACTION ON UPDATE NO ACTION;

ALTER TABLE `mensaje` ADD CONSTRAINT `mensaje_ibfk_1` FOREIGN KEY (`idUsuarioEmisor`) REFERENCES `usuario` (`idUsuario`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `mensaje` ADD FOREIGN KEY (`idTransaccionProducto`) REFERENCES `transaccionProducto` (`idTransaccionProducto`) ON DELETE NO ACTION ON UPDATE NO ACTION;

ALTER TABLE `mensaje` ADD CONSTRAINT `fk_mensaje_usuario1` FOREIGN KEY (`idUsuarioReceptor`) REFERENCES `usuario` (`idUsuario`) ON DELETE NO ACTION ON UPDATE NO ACTION;

ALTER TABLE `imagen` ADD CONSTRAINT `imagen_modelo` FOREIGN KEY (`idModelo`) REFERENCES `modelo` (`idModelo`);

ALTER TABLE `imagen` ADD CONSTRAINT `imagen_documento` FOREIGN KEY (`idDocumento`) REFERENCES `documento` (`idDocumento`);

ALTER TABLE `imagen` ADD CONSTRAINT `imagen_usuario` FOREIGN KEY (`idUsuario`) REFERENCES `usuario` (`idUsuario`);

ALTER TABLE `producto` ADD FOREIGN KEY (`idModelo`) REFERENCES `modelo` (`idModelo`);

ALTER TABLE `producto` ADD FOREIGN KEY (`idTienda`) REFERENCES `tienda` (`idTienda`);

ALTER TABLE `producto` ADD FOREIGN KEY (`idVendedor`) REFERENCES `usuario` (`idUsuario`);

ALTER TABLE `transaccionProducto` ADD FOREIGN KEY (`idTransaccion`) REFERENCES `transaccion` (`idTransaccion`);

ALTER TABLE `transaccionProducto` ADD FOREIGN KEY (`idProducto`) REFERENCES `producto` (`idProducto`);
