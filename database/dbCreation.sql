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
  `idUsuarioVendedor` INT NOT NULL,
  `foto` VARCHAR(120) NULL DEFAULT NULL,
  `comentario` VARCHAR(45) NULL DEFAULT NULL,
  `nota` INT NULL DEFAULT NULL,
  `fecha` DATETIME NULL DEFAULT NULL,
  `idDocumentoProducto` INT NOT NULL,
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
  `estado` VARCHAR(45) NULL DEFAULT NULL,
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
('Juan', 'Pérez', 30, 'comprador', 'juan.perez@example.com', 'Calle 123 #45-67, Bogotá', '3001234567', 'juanperez', '$2b$10$uP41SextbAzmP/hjWITrdecMJhb1/JrZzN6M3ptI6EB4zbWcjVDEy', NOW()),
('Maria', 'Gomez', 25, 'cliente', 'maria.gomez@example.com', 'Avenida 456 #78-90, Medellín', '3007654321', 'mariagomez', '$2b$10$uP41SextbAzmP/hjWITrdecMJhb1/JrZzN6M3ptI6EB4zbWcjVDEy', NOW()),
('Carlos', 'Rodriguez', 40, 'administrador', 'carlos.rodriguez@example.com', 'Carrera 789 #12-34, Cali', '3009876543', 'carlosrodriguez', '$2b$10$uP41SextbAzmP/hjWITrdecMJhb1/JrZzN6M3ptI6EB4zbWcjVDEy', NOW()),
('Ana', 'Martinez', 35, 'comprador', 'ana.martinez@example.com', 'Calle 321 #54-76, Barranquilla', '3001230987', 'anamartinez', '$2b$10$uP41SextbAzmP/hjWITrdecMJhb1/JrZzN6M3ptI6EB4zbWcjVDEy', NOW()),
('Luis', 'Lopez', 28, 'cliente', 'luis.lopez@example.com', 'Avenida 654 #32-10, Cartagena', '3004567890', 'luislopez', '$2b$10$uP41SextbAzmP/hjWITrdecMJhb1/JrZzN6M3ptI6EB4zbWcjVDEy', NOW());

-- Inserts for TIENDA
INSERT INTO `ciclomart`.`tienda` (`idTienda`, `idUsuarioAdministrador`, `nombre`, `descripcion`, `telefono`) VALUES
(1, 3, 'Tienda de Bicicletas', 'Venta de bicicletas y accesorios', '3001234567');

-- Inserts for PRODUCTO
INSERT INTO `ciclomart`.`producto` (`idProducto`, `nombre`, `tipo`, `categoria`, `marca`, `fechaPublicacion`) VALUES
(1, 'Bicicleta de Montaña', 'Bicicleta', 'Montaña', 'MarcaX', '2023-01-01'),
(2, 'Casco de Ciclismo', 'Accesorio', 'Seguridad', 'MarcaY', '2023-02-01');

-- Inserts for DOCUMENTOPRODUCTO
INSERT INTO `ciclomart`.`documentoproducto` (`idProducto`, `idUsuario`, `tipo`, `descripcion`, `estado`, `precio`, `fechaCompra`) VALUES
(1, 1, 'Venta', 'Bicicleta de montaña en buen estado', 'Nuevo', 500.00, '2023-01-15'),
(2, 2, 'Venta', 'Casco de ciclismo resistente', 'Nuevo', 50.00, '2023-02-15');

-- Inserts for CARRITO
INSERT INTO `ciclomart`.`carrito` (`idCarrito`, `idUsuario`, `cantidadProductos`, `precioTotal`, `fecha`, `estado`, `metodoPago`, `direccionEnvio`, `descuento`) VALUES
(1, 1, 2, 550.00, '2023-03-01', 'Pendiente', 'Tarjeta de Crédito', 'Calle 123 #45-67, Bogotá', 0.00);

-- Inserts for CARRITOPRODUCTO
INSERT INTO `ciclomart`.`carritoproducto` (`idCarritoProducto`, `idCarrito`, `idProducto`, `cantidad`, `precio`) VALUES
(1, 1, 1, 1, 500.00),
(2, 1, 2, 1, 50.00);

-- Inserts for TRANSACCION
INSERT INTO `ciclomart`.`transaccion` (`idTransaccion`, `idCarrito`, `idComprador`, `idVendedor`, `fecha`, `monto`, `metodoPago`, `estado`) VALUES
(1, 1, 1, 3, '2023-03-02', 550.00, 'Tarjeta de Crédito', 'Completado');

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

SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
