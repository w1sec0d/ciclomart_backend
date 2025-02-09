CREATE TABLE `usuario` (
  `idUsuario` INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
  `nombre` VARCHAR(45) NOT NULL,
  `apellido` VARCHAR(45) NOT NULL,
  `fechaNacimiento` DATE,
  `rol` ENUM ('comprador', 'cliente', 'administrador') DEFAULT 'comprador',
  `foto` VARCHAR(255),
  `correo` VARCHAR(255) NOT NULL,
  `direccion` VARCHAR(255),
  `telefono` VARCHAR(60),
  `username` VARCHAR(45),
  `password` VARCHAR(64) NOT NULL,
  `fechaRegistro` DATETIME DEFAULT (now())
);

CREATE TABLE `modelo` (
  `idModelo` INT PRIMARY KEY NOT NULL,
  `nombre` VARCHAR(255) NOT NULL,
  `tipo` VARCHAR(45) NOT NULL,
  `descripcion` VARCHAR(255) NOT NULL,
  `idMarca` INT NOT NULL
);

CREATE TABLE `imagen` (
  `idImagen` INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
  `url` VARCHAR,
  `idModelo` INT,
  `idDocumento` INT,
  `idUsuario` INT
);

CREATE TABLE `bicicleta` (
  `idBicicleta` INT PRIMARY KEY NOT NULL,
  `tipoBicicleta` VARCHAR(45),
  `color` VARCHAR(45),
  `genero` VARCHAR(45),
  `edad` VARCHAR(45),
  `tamañoMarco` VARCHAR(45),
  `materialMarco` VARCHAR(45),
  `tamañoRueda` VARCHAR(45),
  `tipoFrenos` VARCHAR(45),
  `velocidades` VARCHAR(45),
  `suspension` VARCHAR(45),
  `transmision` VARCHAR(45),
  `tipoPedales` VARCHAR(45),
  `manubrio` VARCHAR(45),
  `pesoBicicleta` FLOAT,
  `pesoMaximo` FLOAT,
  `extras` VARCHAR(100),
  `idCadena` INT,
  `idRueda` INT,
  `idPedalier` INT,
  `idSillin` INT,
  `idFreno` INT,
  `idManubrio` INT,
  `idCassette` INT
);

CREATE TABLE `componente` (
  `idComponente` INT PRIMARY KEY NOT NULL,
  `idMarca` INT,
  `nombre` VARCHAR(255) NOT NULL,
  `categoria` VARCHAR,
  `compatibilidad` VARCHAR
);

CREATE TABLE `marca` (
  `idMarca` INT PRIMARY KEY NOT NULL,
  `nombre` VARCHAR(45) NOT NULL
);

CREATE TABLE `tienda` (
  `idTienda` INT PRIMARY KEY NOT NULL,
  `idUsuarioAdministrador` INT NOT NULL,
  `nombre` varchar(255),
  `descripcion` text,
  `telefono` VARCHAR(60)
);

CREATE TABLE `carrito` (
  `idCarrito` INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
  `idUsuario` INT NOT NULL,
  `cantidadProductos` INT DEFAULT '0',
  `precioTotal` FLOAT,
  `fecha` DATETIME,
  `estado` VARCHAR(45),
  `metodoPago` VARCHAR(45),
  `direccionEnvio` VARCHAR(45),
  `descuento` FLOAT
);

CREATE TABLE `carritoProducto` (
  `idCarritoProducto` INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
  `idCarrito` INT NOT NULL,
  `idProducto` INT NOT NULL,
  `cantidad` INT,
  `precio_unitario` FLOAT
);

CREATE TABLE `documento` (
  `idDocumento` INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
  `idModelo` INT NOT NULL,
  `idUsuario` INT,
  `tipo` VARCHAR(60),
  `descripcion` TEXT,
  `estado` VARCHAR(60),
  `fechaCompra` DATE
);

CREATE TABLE `producto` (
  `idProducto` INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
  `idModelo` INT NOT NULL,
  `idTienda` INT,
  `idVendedor` INT,
  `precio` FLOAT,
  `precioCompleto` FLOAT,
  `cantidad` INT DEFAULT 0,
  `estado` ENUM ('nuevo', 'usado') DEFAULT 'nuevo',
  `disponibilidad` ENUM ('disponible', 'vendido', 'reservado') DEFAULT 'disponible',
  `costoEnvio` float NOT NULL DEFAULT 0,
  `retiroEnTienda` BOOL NOT NULL DEFAULT true,
  `fechaPublicacion` datetime DEFAULT 'now()'
);

CREATE TABLE `calificacion` (
  `idCalificacion` INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
  `idUsuarioComprador` INT NOT NULL,
  `idProducto` INT NOT NULL,
  `idUsuarioVendedor` INT,
  `idTienda` INT,
  `foto` VARCHAR(255),
  `comentario` TEXT,
  `nota` INT,
  `fecha` DATETIME DEFAULT 'now()'
);

CREATE TABLE `transaccion` (
  `idTransaccion` INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
  `idCarrito` INT NOT NULL,
  `idComprador` INT NOT NULL,
  `fecha` DATETIME,
  `monto` FLOAT,
  `metodoPago` VARCHAR(45),
  `estado` ENUM ('pendiente', 'exitosa', 'fallida')
);

CREATE TABLE `mensaje` (
  `idMensaje` INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
  `idUsuarioEmisor` INT NOT NULL,
  `idUsuarioReceptor` INT NOT NULL,
  `idTransaccionProducto` INT NOT NULL,
  `contenido` TEXT,
  `fecha` DATETIME
);

CREATE TABLE `transaccionProducto` (
  `idTransaccionProducto` INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
  `idTransaccion` INT NOT NULL,
  `idProducto` INT NOT NULL,
  `cantidad` INT NOT NULL,
  `fecha` DATETIME DEFAULT 'now()',
  `direccion` TEXT,
  `estadoEnvio` VARCHAR(45)
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

CREATE INDEX `idCarrito` ON `carritoProducto` (`idCarrito`);

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

ALTER TABLE `componente` ADD CONSTRAINT `repuesto_ibfk_1` FOREIGN KEY (`idComponente`) REFERENCES `modelo` (`idModelo`);

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

ALTER TABLE `carritoProducto` ADD CONSTRAINT `carritoProducto_ibfk_1` FOREIGN KEY (`idCarrito`) REFERENCES `carrito` (`idCarrito`) ON DELETE CASCADE ON UPDATE CASCADE;

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

ALTER TABLE `usuario` ADD CONSTRAINT `imagen_usuario` FOREIGN KEY (`idUsuario`) REFERENCES `imagen` (`idUsuario`);

ALTER TABLE `producto` ADD FOREIGN KEY (`idModelo`) REFERENCES `modelo` (`idModelo`);

ALTER TABLE `producto` ADD FOREIGN KEY (`idTienda`) REFERENCES `tienda` (`idTienda`);

ALTER TABLE `producto` ADD FOREIGN KEY (`idVendedor`) REFERENCES `usuario` (`idUsuario`);

ALTER TABLE `calificacion` ADD FOREIGN KEY (`idTienda`) REFERENCES `tienda` (`idTienda`);

ALTER TABLE `transaccionProducto` ADD FOREIGN KEY (`idTransaccion`) REFERENCES `transaccion` (`idTransaccion`);

ALTER TABLE `transaccionProducto` ADD FOREIGN KEY (`idProducto`) REFERENCES `producto` (`idProducto`);
