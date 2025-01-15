-- MySQL Workbench Forward Engineering

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

-- -----------------------------------------------------
-- Schema mydb
-- -----------------------------------------------------
-- -----------------------------------------------------
-- Schema ciclomart
-- -----------------------------------------------------
DROP SCHEMA IF EXISTS `ciclomart` ;

-- -----------------------------------------------------
-- Schema ciclomart
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS `ciclomart`;
USE `ciclomart` ;

-- -----------------------------------------------------
-- Table `ciclomart`.`usuario`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `ciclomart`.`usuario` (
  `idUsuario` INT NOT NULL AUTO_INCREMENT,
  `nombre` VARCHAR(45) NOT NULL,
  `apellido` VARCHAR(45) NOT NULL,
  `edad` INT NULL DEFAULT NULL,
  `rol` ENUM('comprador', 'cliente', 'administrador') NOT NULL,
  `foto` VARCHAR(255) NULL,
  `correo` VARCHAR(45) NOT NULL,
  `direccion` VARCHAR(45) NULL DEFAULT NULL,
  `telefono` VARCHAR(45) NULL DEFAULT NULL,
  `username` VARCHAR(45) NULL DEFAULT NULL,
  `password` VARCHAR(64) NOT NULL,
  `fechaRegistro` DATETIME NOT NULL,
  PRIMARY KEY (`idUsuario`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `ciclomart`.`producto`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `ciclomart`.`producto` (
  `idProducto` INT NOT NULL,
  `nombre` VARCHAR(60) NULL DEFAULT NULL,
  `tipo` VARCHAR(45) NULL DEFAULT NULL,
  `categoria` VARCHAR(45) NULL DEFAULT NULL,
  `marca` VARCHAR(45) NULL DEFAULT NULL,
  `fechaPublicacion` VARCHAR(45) NULL DEFAULT NULL,
  PRIMARY KEY (`idProducto`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `ciclomart`.`tienda`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `ciclomart`.`tienda` (
  `idTienda` INT NOT NULL,
  `idUsuarioAdministrador` INT NOT NULL,
  `nombre` VARCHAR(45) NULL DEFAULT NULL,
  `descripcion` VARCHAR(45) NULL DEFAULT NULL,
  `telefono` VARCHAR(25) NULL DEFAULT NULL,
  PRIMARY KEY (`idTienda`),
  INDEX `idUsuarioAdministrador` (`idUsuarioAdministrador` ASC) VISIBLE,
  CONSTRAINT `tienda_ibfk_1`
    FOREIGN KEY (`idUsuarioAdministrador`)
    REFERENCES `ciclomart`.`usuario` (`idUsuario`)
    ON UPDATE CASCADE)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `ciclomart`.`carrito`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `ciclomart`.`carrito` (
  `idCarrito` INT NOT NULL AUTO_INCREMENT,
  `idUsuario` INT NOT NULL,
  `cantidadProductos` INT NULL DEFAULT '0',
  `precioTotal` FLOAT NULL DEFAULT NULL,
  `fecha` DATETIME NULL DEFAULT NULL,
  `estado` VARCHAR(45) NULL DEFAULT NULL,
  `metodoPago` VARCHAR(45) NULL DEFAULT NULL,
  `direccionEnvio` VARCHAR(45) NULL DEFAULT NULL,
  `descuento` FLOAT NULL DEFAULT NULL,
  PRIMARY KEY (`idCarrito`),
  INDEX `idUsuario` (`idUsuario` ASC) VISIBLE,
  CONSTRAINT `carrito_ibfk_1`
    FOREIGN KEY (`idUsuario`)
    REFERENCES `ciclomart`.`usuario` (`idUsuario`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `ciclomart`.`carritoproducto`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `ciclomart`.`carritoproducto` (
  `idCarritoProducto` INT NOT NULL AUTO_INCREMENT,
  `idCarrito` INT NOT NULL,
  `idProducto` INT NOT NULL,
  `cantidad` INT NULL DEFAULT NULL,
  `precio` FLOAT NULL DEFAULT NULL,
  PRIMARY KEY (`idCarritoProducto`),
  INDEX `idCarrito` (`idCarrito` ASC) VISIBLE,
  INDEX `fk_carritoproducto_producto1_idx` (`idProducto` ASC) INVISIBLE,
  CONSTRAINT `carritoproducto_ibfk_1`
    FOREIGN KEY (`idCarrito`)
    REFERENCES `ciclomart`.`carrito` (`idCarrito`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_carritoproducto_producto1`
    FOREIGN KEY (`idProducto`)
    REFERENCES `ciclomart`.`producto` (`idProducto`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `ciclomart`.`documentoproducto`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `ciclomart`.`documentoproducto` (
  `idDocumentoProducto` INT NOT NULL AUTO_INCREMENT,
  `idProducto` INT NOT NULL,
  `idUsuario` INT NULL,
  `idTienda` INT NULL,
  `idCarritoProducto` INT NULL,
  `tipo` VARCHAR(45) NULL DEFAULT NULL,
  `descripcion` VARCHAR(45) NULL DEFAULT NULL,
  `estado` VARCHAR(45) NULL DEFAULT NULL,
  `precio` FLOAT NULL DEFAULT NULL,
  `fechaCompra` VARCHAR(45) NULL DEFAULT NULL,
  PRIMARY KEY (`idDocumentoProducto`),
  INDEX `idUsuario` (`idUsuario` ASC) VISIBLE,
  INDEX `fk_documentoproducto_tienda1_idx` (`idTienda` ASC) VISIBLE,
  INDEX `fk_documentoproducto_carritoproducto1_idx` (`idCarritoProducto` ASC) VISIBLE,
  CONSTRAINT `documentoproducto_ibfk_1`
    FOREIGN KEY (`idProducto`)
    REFERENCES `ciclomart`.`producto` (`idProducto`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `documentoproducto_ibfk_2`
    FOREIGN KEY (`idUsuario`)
    REFERENCES `ciclomart`.`usuario` (`idUsuario`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_documentoproducto_tienda1`
    FOREIGN KEY (`idTienda`)
    REFERENCES `ciclomart`.`tienda` (`idTienda`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_documentoproducto_carritoproducto1`
    FOREIGN KEY (`idCarritoProducto`)
    REFERENCES `ciclomart`.`carritoproducto` (`idCarritoProducto`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `ciclomart`.`calificacion`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `ciclomart`.`calificacion` (
  `idCalificacion` INT NOT NULL AUTO_INCREMENT,
  `idUsuarioComprador` INT NOT NULL,
  `idDocumentoProducto` INT NOT NULL,
  `idUsuarioVendedor` INT NOT NULL,
  `foto` VARCHAR(120) NULL DEFAULT NULL,
  `comentario` VARCHAR(45) NULL DEFAULT NULL,
  `nota` INT NULL DEFAULT NULL,
  `fecha` DATETIME NULL DEFAULT NULL,
  PRIMARY KEY (`idCalificacion`),
  INDEX `idUsuarioComprador` (`idUsuarioComprador` ASC) VISIBLE,
  INDEX `fk_calificacion_usuario1_idx` (`idUsuarioVendedor` ASC) VISIBLE,
  INDEX `fk_calificacion_documentoproducto1_idx` (`idDocumentoProducto` ASC) VISIBLE,
  CONSTRAINT `calificacion_ibfk_1`
    FOREIGN KEY (`idUsuarioComprador`)
    REFERENCES `ciclomart`.`usuario` (`idUsuario`)
    ON DELETE CASCADE,
  CONSTRAINT `fk_calificacion_usuario1`
    FOREIGN KEY (`idUsuarioVendedor`)
    REFERENCES `ciclomart`.`usuario` (`idUsuario`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_calificacion_documentoproducto1`
    FOREIGN KEY (`idDocumentoProducto`)
    REFERENCES `ciclomart`.`documentoproducto` (`idDocumentoProducto`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `ciclomart`.`transaccion`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `ciclomart`.`transaccion` (
  `idTransaccion` INT NOT NULL AUTO_INCREMENT,
  `idCarrito` INT NOT NULL,
  `idComprador` INT NOT NULL,
  `idVendedor` INT NOT NULL,
  `fecha` DATETIME NULL DEFAULT NULL,
  `monto` FLOAT NULL DEFAULT NULL,
  `metodoPago` VARCHAR(45) NULL DEFAULT NULL,
  `estado` ENUM('proceso','exitosa','fallida'),
  PRIMARY KEY (`idTransaccion`),
  INDEX `idCarrito` (`idCarrito` ASC) VISIBLE,
  INDEX `idUsuario` (`idVendedor` ASC) VISIBLE,
  INDEX `fk_transaccion_usuario1_idx` (`idComprador` ASC) VISIBLE,
  CONSTRAINT `transaccion_ibfk_1`
    FOREIGN KEY (`idCarrito`)
    REFERENCES `ciclomart`.`carrito` (`idCarrito`)
    ON DELETE CASCADE,
  CONSTRAINT `transaccion_ibfk_2`
    FOREIGN KEY (`idVendedor`)
    REFERENCES `ciclomart`.`usuario` (`idUsuario`)
    ON DELETE CASCADE,
  CONSTRAINT `fk_transaccion_usuario1`
    FOREIGN KEY (`idComprador`)
    REFERENCES `ciclomart`.`usuario` (`idUsuario`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `ciclomart`.`envio`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `ciclomart`.`envio` (
  `idEnvio` INT NOT NULL AUTO_INCREMENT,
  `idTransaccion` INT NOT NULL,
  `idUsuarioComprador` INT NOT NULL,
  `idUsuarioVendedor` INT NOT NULL,
  `fecha` DATETIME NULL DEFAULT NULL,
  `direccion` VARCHAR(45) NULL DEFAULT NULL,
  `estado` VARCHAR(45) NULL DEFAULT NULL,
  PRIMARY KEY (`idEnvio`),
  INDEX `idTransaccion` (`idTransaccion` ASC) VISIBLE,
  INDEX `idUsuarioComprador` (`idUsuarioComprador` ASC) VISIBLE,
  INDEX `fk_envio_usuario1_idx` (`idUsuarioVendedor` ASC) VISIBLE,
  CONSTRAINT `envio_ibfk_1`
    FOREIGN KEY (`idTransaccion`)
    REFERENCES `ciclomart`.`transaccion` (`idTransaccion`)
    ON DELETE CASCADE,
  CONSTRAINT `envio_ibfk_2`
    FOREIGN KEY (`idUsuarioComprador`)
    REFERENCES `ciclomart`.`usuario` (`idUsuario`)
    ON DELETE CASCADE,
  CONSTRAINT `fk_envio_usuario1`
    FOREIGN KEY (`idUsuarioVendedor`)
    REFERENCES `ciclomart`.`usuario` (`idUsuario`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `ciclomart`.`mensaje`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `ciclomart`.`mensaje` (
  `idMensaje` INT NOT NULL AUTO_INCREMENT,
  `idUsuarioEmisor` INT NOT NULL,
  `idUsuarioReceptor` INT NOT NULL,
  `idTransaccion` INT NOT NULL,
  `contenido` TEXT NULL DEFAULT NULL,
  `fecha` DATETIME NULL DEFAULT NULL,
  PRIMARY KEY (`idMensaje`),
  INDEX `idUsuarioEmisor` (`idUsuarioEmisor` ASC) VISIBLE,
  INDEX `fk_mensaje_transaccion1_idx` (`idTransaccion` ASC) VISIBLE,
  INDEX `fk_mensaje_usuario1_idx` (`idUsuarioReceptor` ASC) VISIBLE,
  CONSTRAINT `mensaje_ibfk_1`
    FOREIGN KEY (`idUsuarioEmisor`)
    REFERENCES `ciclomart`.`usuario` (`idUsuario`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_mensaje_transaccion1`
    FOREIGN KEY (`idTransaccion`)
    REFERENCES `ciclomart`.`transaccion` (`idTransaccion`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_mensaje_usuario1`
    FOREIGN KEY (`idUsuarioReceptor`)
    REFERENCES `ciclomart`.`usuario` (`idUsuario`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;
-- -----------------------------------------------------
-- INSERTS
-- -----------------------------------------------------

-- Inserts for USUARIO
INSERT INTO `ciclomart`.`usuario` (`nombre`, `apellido`, `edad`, `rol`, `correo`, `direccion`, `telefono`, `username`, `password`, `fechaRegistro`) VALUES
('Sofía', 'Ramírez', 27, 'cliente', 'sofia.ramirez@example.com', 'Carrera 15 #34-56, Bogotá', '3102345678', 'sofiaramirez', '$2b$10$uP41SextbAzmP/hjWITrdecMJhb1/JrZzN6M3ptI6EB4zbWcjVDEy', NOW()),
('Diego', 'Torres', 33, 'comprador', 'diego.torres@example.com', 'Calle 98 #22-45, Medellín', '3209876543', 'diegotorres', '$2b$10$uP41SextbAzmP/hjWITrdecMJhb1/JrZzN6M3ptI6EB4zbWcjVDEy', NOW()),
('Laura', 'Fernández', 29, 'administrador', 'laura.fernandez@example.com', 'Avenida 50 #10-20, Cali', '3123456789', 'laurafernandez', '$2b$10$uP41SextbAzmP/hjWITrdecMJhb1/JrZzN6M3ptI6EB4zbWcjVDEy', NOW()),
('Miguel', 'Castro', 45, 'cliente', 'miguel.castro@example.com', 'Carrera 7 #45-67, Barranquilla', '3115678901', 'miguelcastro', '$2b$10$uP41SextbAzmP/hjWITrdecMJhb1/JrZzN6M3ptI6EB4zbWcjVDEy', NOW()),
('Camila', 'García', 31, 'comprador', 'camila.garcia@example.com', 'Calle 45 #67-89, Cartagena', '3136789012', 'camilagarcia', '$2b$10$uP41SextbAzmP/hjWITrdecMJhb1/JrZzN6M3ptI6EB4zbWcjVDEy', NOW()),
('Felipe', 'Moreno', 37, 'cliente', 'felipe.moreno@example.com', 'Avenida 60 #30-40, Bucaramanga', '3147890123', 'felipemoreno', '$2b$10$uP41SextbAzmP/hjWITrdecMJhb1/JrZzN6M3ptI6EB4zbWcjVDEy', NOW()),
('Andrea', 'Ortiz', 26, 'administrador', 'andrea.ortiz@example.com', 'Carrera 25 #50-60, Pereira', '3158901234', 'andreaortiz', '$2b$10$uP41SextbAzmP/hjWITrdecMJhb1/JrZzN6M3ptI6EB4zbWcjVDEy', NOW()),
('Javier', 'Hernández', 39, 'comprador', 'javier.hernandez@example.com', 'Calle 10 #40-50, Santa Marta', '3169012345', 'javierhernandez', '$2b$10$uP41SextbAzmP/hjWITrdecMJhb1/JrZzN6M3ptI6EB4zbWcjVDEy', NOW()),
('Daniela', 'Ruiz', 24, 'cliente', 'daniela.ruiz@example.com', 'Avenida 90 #20-30, Manizales', '3170123456', 'danielaruiz', '$2b$10$uP41SextbAzmP/hjWITrdecMJhb1/JrZzN6M3ptI6EB4zbWcjVDEy', NOW()),
('Héctor', 'Navarro', 41, 'administrador', 'hector.navarro@example.com', 'Carrera 18 #34-56, Cúcuta', '3181234567', 'hectornavarro', '$2b$10$uP41SextbAzmP/hjWITrdecMJhb1/JrZzN6M3ptI6EB4zbWcjVDEy', NOW());

-- Inserts for TIENDA
INSERT INTO `ciclomart`.`tienda` (`idTienda`, `idUsuarioAdministrador`, `nombre`, `descripcion`, `telefono`) VALUES
(1, 3, 'Tienda de Bicicletas', 'Venta de bicicletas y accesorios', '3001234567');

-- Inserts for PRODUCTO
-- Inserts for PRODUCTO
INSERT INTO `ciclomart`.`producto` (`idProducto`, `nombre`, `tipo`, `categoria`, `marca`, `fechaPublicacion`) VALUES
(1, 'Bicicleta de Montaña', 'Bicicleta', 'Montaña', 'MarcaX', '2023-01-01'),
(2, 'Casco de Ciclismo', 'Accesorio', 'Seguridad', 'MarcaY', '2023-02-01'),
(3, 'Bicicleta Eléctrica', 'Bicicleta', 'Eléctrica', 'MarcaC', '2023-06-01'),
(4, 'Luces de Bicicleta', 'Accesorio', 'Seguridad', 'MarcaD', '2023-07-01'),
(5, 'Candado de Bicicleta', 'Accesorio', 'Seguridad', 'MarcaE', '2023-08-01');

-- Inserts for DOCUMENTOPRODUCTO
INSERT INTO `ciclomart`.`documentoproducto` (`idProducto`, `idUsuario`, `tipo`, `descripcion`, `estado`, `precio`, `fechaCompra`) VALUES
(1, 1, 'Venta', 'Bicicleta de montaña en buen estado', 'Nuevo', 500.00, '2023-01-15'),
(2, 2, 'Venta', 'Casco de ciclismo resistente', 'Nuevo', 50.00, '2023-02-15');

-- Inserts for CARRITO
INSERT INTO `ciclomart`.`carrito` (`idCarrito`, `idUsuario`, `cantidadProductos`, `precioTotal`, `fecha`, `estado`, `metodoPago`, `direccionEnvio`, `descuento`) VALUES
(1,1, 3, 1200.50, '2023-03-04', 'Completado', 'Transferencia Bancaria', 'Avenida 456 #78-90, Medellín', 10.00),
(2, 2, 3, 1200.50, '2023-03-04', 'Completado', 'Transferencia Bancaria', 'Avenida 456 #78-90, Medellín', 10.00),
(3, 3, 1, 890.00, '2023-03-09', 'Cancelado', 'Efectivo', 'Carrera 789 #12-34, Cali', 0.00),
(4, 4, 4, 450.75, '2023-03-11', 'Pendiente', 'Tarjeta de Débito', 'Calle 321 #54-76, Barranquilla', 5.00),
(5, 5, 2, 300.00, '2023-03-14', 'Pendiente', 'PayPal', 'Avenida 654 #32-10, Cartagena', 0.00),
(6, 6, 3, 780.00, '2023-03-19', 'Completado', 'Tarjeta de Crédito', 'Carrera 15 #34-56, Bogotá', 15.00),
(7, 7, 1, 670.00, '2023-03-24', 'Cancelado', 'Transferencia Bancaria', 'Calle 98 #22-45, Medellín', 0.00),
(8, 8, 5, 1000.00, '2023-03-27', 'Completado', 'Efectivo', 'Avenida 50 #10-20, Cali', 20.00),
(9, 9, 4, 400.00, '2023-04-01', 'Pendiente', 'PayPal', 'Carrera 7 #45-67, Barranquilla', 0.00),
(10, 1, 1, 250.00, '2023-04-04', 'Completado', 'Tarjeta de Crédito', 'Calle 123 #45-67, Bogotá', 0.00),
(11, 2, 2, 540.50, '2023-04-09', 'Completado', 'Transferencia Bancaria', 'Avenida 456 #78-90, Medellín', 10.00),
(12, 3, 3, 890.00, '2023-04-14', 'Cancelado', 'Efectivo', 'Carrera 789 #12-34, Cali', 0.00),
(13, 4, 2, 700.75, '2023-04-19', 'Completado', 'Tarjeta de Débito', 'Calle 321 #54-76, Barranquilla', 5.00),
(14, 5, 4, 300.00, '2023-04-24', 'Completado', 'PayPal', 'Avenida 654 #32-10, Cartagena', 0.00),
(15, 6, 3, 1200.00, '2023-04-27', 'Pendiente', 'Tarjeta de Crédito', 'Carrera 15 #34-56, Bogotá', 15.00),
(16, 7, 1, 670.00, '2023-05-01', 'Completado', 'Transferencia Bancaria', 'Calle 98 #22-45, Medellín', 0.00),
(17, 8, 5, 1500.00, '2023-05-04', 'Completado', 'Efectivo', 'Avenida 50 #10-20, Cali', 20.00),
(18, 9, 2, 400.00, '2023-05-09', 'Completado', 'PayPal', 'Carrera 7 #45-67, Barranquilla', 0.00),
(19, 1, 1, 250.00, '2023-05-11', 'Completado', 'Tarjeta de Crédito', 'Calle 123 #45-67, Bogotá', 0.00),
(20, 2, 2, 540.50, '2023-05-14', 'Completado', 'Transferencia Bancaria', 'Avenida 456 #78-90, Medellín', 10.00),
(21, 11, 2, 1200.00, '2023-06-15', 'Pendiente', 'Tarjeta de Crédito', 'Calle 456 #78-90, Bogotá', 5.00),
(22, 11, 3, 1500.00, '2023-06-20', 'Completado', 'PayPal', 'Avenida 123 #45-67, Medellín', 10.00);
-- Inserts for CARRITOPRODUCTO
-- Inserts for CARRITOPRODUCTO
INSERT INTO `ciclomart`.`carritoproducto` (`idCarritoProducto`, `idCarrito`, `idProducto`, `cantidad`, `precio`) VALUES
(1, 1, 1, 1, 500.00),
(2, 1, 2, 1, 50.00),
(3, 1, 3, 1, 650.50), -- Total 3 productos para carrito 1
(4, 2, 1, 1, 400.00),
(5, 2, 2, 1, 400.00),
(6, 2, 3, 1, 400.00), -- Total 3 productos para carrito 2
(7, 3, 1, 1, 890.00), -- Total 1 producto para carrito 3
(8, 4, 1, 1, 100.00),
(9, 4, 2, 1, 100.00),
(10, 4, 3, 1, 100.00),
(11, 4, 4, 1, 150.75), -- Total 4 productos para carrito 4
(12, 5, 1, 1, 150.00),
(13, 5, 2, 1, 150.00), -- Total 2 productos para carrito 5
(14, 6, 1, 1, 300.00),
(15, 6, 2, 1, 250.00),
(16, 6, 3, 1, 230.00), -- Total 3 productos para carrito 6
(17, 7, 1, 1, 670.00), -- Total 1 producto para carrito 7
(18, 8, 1, 1, 200.00),
(19, 8, 2, 1, 200.00),
(20, 8, 3, 1, 200.00),
(21, 8, 4, 1, 400.00), -- Total 5 productos para carrito 8
(22, 9, 1, 1, 100.00),
(23, 9, 2, 1, 100.00),
(24, 9, 3, 1, 100.00),
(25, 9, 4, 1, 100.00), -- Total 4 productos para carrito 9
(26, 10, 1, 1, 250.00), -- Total 1 producto para carrito 10
(27, 11, 1, 1, 270.25),
(28, 11, 2, 1, 270.25), -- Total 2 productos para carrito 11
(29, 12, 1, 1, 890.00), -- Total 1 producto para carrito 12
(30, 13, 1, 1, 350.00),
(31, 13, 2, 1, 350.75), -- Total 2 productos para carrito 13
(32, 14, 1, 1, 150.00),
(33, 14, 2, 1, 150.00), -- Total 4 productos para carrito 14
(34, 15, 1, 1, 400.00),
(35, 15, 2, 1, 400.00),
(36, 15, 3, 1, 400.00), -- Total 3 productos para carrito 15
(37, 16, 1, 1, 670.00), -- Total 1 producto para carrito 16
(38, 17, 1, 1, 300.00),
(39, 17, 2, 1, 300.00),
(40, 17, 3, 1, 300.00),
(41, 17, 4, 1, 300.00),
(42, 17, 5, 1, 300.00), -- Total 5 productos para carrito 17
(43, 18, 1, 1, 200.00),
(44, 18, 2, 1, 200.00), -- Total 2 productos para carrito 18
(45, 19, 1, 1, 250.00), -- Total 1 producto para carrito 19
(46, 20, 1, 1, 270.25),
(47, 20, 2, 1, 270.25), -- Total 2 productos para carrito 20
(48, 21, 5, 1, 1000.00),
(49, 21, 3, 1, 200.00), -- Total 2 productos para carrito 21
(50, 22, 2, 1, 1000.00),
(51, 22, 5, 1, 200.00),
(52, 22, 3, 1, 300.00); -- Total 3 productos para carrito 22

-- Inserts for TRANSACCION
INSERT INTO `ciclomart`.`transaccion` (`idTransaccion`, `idCarrito`, `idComprador`, `idVendedor`, `fecha`, `monto`, `metodoPago`, `estado`) VALUES
(1, 1, 1, 4, '2023-03-05', 1200.50, 'Transferencia Bancaria', 'exitosa'),
(2, 2, 2, 4, '2023-03-05', 1200.50, 'Transferencia Bancaria', 'exitosa'),
(3, 3, 3, 5, '2023-03-10', 890.00, 'Efectivo', 'fallida'),
(4, 4, 4, 6, '2023-03-12', 450.75, 'Tarjeta de Débito', 'exitosa'),
(5, 5, 5, 7, '2023-03-15', 300.00, 'PayPal', 'proceso'),
(6, 6, 6, 1, '2023-03-20', 780.00, 'Tarjeta de Crédito', 'exitosa'),
(7, 7, 7, 2, '2023-03-25', 670.00, 'Transferencia Bancaria', 'fallida'),
(8, 8, 8, 3, '2023-03-28', 1000.00, 'Efectivo', 'exitosa'),
(9, 9, 9, 11, '2023-04-02', 400.00, 'PayPal', 'proceso'),
(10, 10, 1, 11, '2023-04-05', 250.00, 'Tarjeta de Crédito', 'exitosa'),
(11, 11, 2, 11, '2023-04-10', 540.50, 'Transferencia Bancaria', 'exitosa'),
(12, 12, 3, 7, '2023-04-15', 890.00, 'Efectivo', 'fallida'),
(13, 13, 4, 8, '2023-04-20', 700.75, 'Tarjeta de Débito', 'exitosa'),
(14, 14, 5, 9, '2023-04-25', 300.00, 'PayPal', 'exitosa'),
(15, 15, 6, 1, '2023-04-28', 1200.00, 'Tarjeta de Crédito', 'proceso'),
(16, 16, 7, 2, '2023-05-02', 670.00, 'Transferencia Bancaria', 'exitosa'),
(17, 17, 8, 3, '2023-05-05', 1500.00, 'Efectivo', 'exitosa'),
(18, 18, 9, 4, '2023-05-10', 400.00, 'PayPal', 'exitosa'),
(19, 19, 1, 5, '2023-05-12', 250.00, 'Tarjeta de Crédito', 'exitosa'),
(20, 20, 2, 6, '2023-05-15', 540.50, 'Transferencia Bancaria', 'exitosa'),
(21, 21, 11, 4, '2023-06-15', 1200.00, 'Tarjeta de Crédito', 'proceso'),
(22, 22, 11, 5, '2023-06-20', 1500.00, 'PayPal', 'exitosa');

-- Inserts for ENVIO
INSERT INTO `ciclomart`.`envio` (`idEnvio`, `idTransaccion`, `idUsuarioComprador`, `idUsuarioVendedor`, `fecha`, `direccion`, `estado`) VALUES
(1, 1, 1, 3, '2023-03-03', 'Calle 123 #45-67, Bogotá', 'Enviado');

-- Inserts for CALIFICACION
INSERT INTO `ciclomart`.`calificacion` (`idCalificacion`, `idUsuarioComprador`, `idUsuarioVendedor`, `foto`, `comentario`, `nota`, `fecha`, `idDocumentoProducto`) VALUES
(1, 1, 3, 'foto1.jpg', 'Excelente producto', 5, '2023-03-04', 1);

-- Inserts for MENSAJE
INSERT INTO `ciclomart`.`mensaje` (`idMensaje`, `idUsuarioEmisor`, `idUsuarioReceptor`, `idTransaccion`, `contenido`, `fecha`) VALUES
(1, 1, 3, 1, 'Hola, estoy interesado en tu producto', '2023-03-01'),
(2, 3, 1, 1, 'Hola, claro, está disponible', '2023-03-02');


-- Eliminar la vista si existe
DROP VIEW IF EXISTS productosCompradorVendedor;

-- Crear la vista
CREATE VIEW productosCompradorVendedor AS
SELECT 
    t.idTransaccion,
    t.idComprador,
    t.idVendedor,
    c.metodoPago AS metodoPago,
    comprador.nombre AS compradorNombre,
    comprador.apellido AS compradorApellido,	
    vendedor.nombre AS vendedorNombre,
    vendedor.apellido AS vendedorApellido,
	p.idProducto,    
	p.nombre AS nombre_producto,
    p.tipo AS tipo_producto,
    p.categoria AS categoria_producto,
    p.marca AS marca_producto,
    cp.cantidad,
    cp.precio
FROM 
    transaccion t
JOIN 
    carrito c ON t.idCarrito = c.idCarrito
JOIN 
    carritoproducto cp ON c.idCarrito = cp.idCarrito
JOIN 
    producto p ON cp.idProducto = p.idProducto
JOIN 
    usuario comprador ON t.idComprador = comprador.idUsuario
JOIN 
    usuario vendedor ON t.idVendedor = vendedor.idUsuario;



select * from productosCompradorVendedor;
select * from transaccion;
select * from carrito;
select * from carritoProducto; 
select * from producto;
select * from usuario;

SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
