-- MySQL Workbench Forward Engineering

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

-- -----------------------------------------------------
-- Schema mydb
-- -----------------------------------------------------
DROP SCHEMA IF EXISTS `ciclomart` ;

-- -----------------------------------------------------
-- Schema mydb
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS `ciclomart` DEFAULT CHARACTER SET utf8 ;
USE `ciclomart` ;

-- -----------------------------------------------------
-- USUARIO
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `ciclomart`.`usuario` (
  `idUsuario` INT NOT NULL AUTO_INCREMENT,
  `nombre` VARCHAR(45) NOT NULL,
  `apellido` VARCHAR(45) NOT NULL,
  `edad` INT NULL,
  `rol` ENUM('comprador', 'cliente', 'administrador') NOT NULL,
  `correo` VARCHAR(45) NOT NULL,
  `direccion` VARCHAR(45) NULL,
  `telefono` VARCHAR(45) NULL,
  `username` VARCHAR(45) NULL,
  `password` VARCHAR(64) NOT NULL,
  `fechaRegistro` DATETIME NOT NULL,
  PRIMARY KEY (`idUsuario`))
ENGINE = InnoDB;

-- -----------------------------------------------------
-- PRODUCTO
-- -----------------------------------------------------
CREATE TABLE `ciclomart`.`producto` (
  `idProducto` INT NOT NULL,
  `nombre` VARCHAR(60) NULL,
  `tipo` VARCHAR(45) NULL,
  `categoria` VARCHAR(45) NULL,
  `marca` VARCHAR(45) NULL,
  `fechaPublicacion` VARCHAR(45) NULL,
  PRIMARY KEY (`idProducto`));
  
-- -----------------------------------------------------
-- DOCUMENTOPRODUCTO
-- -----------------------------------------------------

CREATE TABLE `ciclomart`.`documentoProducto` (
  `idProducto` INT NOT NULL,
  `idUsuario` INT NOT NULL,
  `tipo` VARCHAR(45) NULL,
  `descripcion` VARCHAR(45) NULL,
  `estado` VARCHAR(45) NULL,
  `precio` FLOAT NULL,
  `fechaCompra` VARCHAR(45) NULL,
  PRIMARY KEY (`idProducto`, `idUsuario`),
  FOREIGN KEY (`idProducto`) REFERENCES `producto`(`idProducto`) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (`idUsuario`) REFERENCES `usuario`(`idUsuario`) ON DELETE CASCADE ON UPDATE CASCADE
);

-- -----------------------------------------------------
-- TIENDA
-- -----------------------------------------------------
CREATE TABLE `ciclomart`.`tienda` (
  `idTienda` INT NOT NULL,
  `idUsuarioAdministrador` INT NOT NULL,
  `nombre` VARCHAR(45) NULL,
  `descripcion` VARCHAR(45) NULL,
  `telefono` VARCHAR(25) NULL,
  PRIMARY KEY (`idTienda`),
  FOREIGN KEY (`idUsuarioAdministrador`) REFERENCES `usuario`(`idUsuario`) ON UPDATE CASCADE
);
  
-- -----------------------------------------------------
-- TIENDA-PRODUCTO
-- -----------------------------------------------------
CREATE TABLE `ciclomart`.`tiendaProducto` (
  `idTienda` INT NOT NULL,
  `idProducto` INT NOT NULL,
  `cantidad` INT NULL,
  `precio` FLOAT NULL,
  PRIMARY KEY (`idTienda`, `idProducto`),
  FOREIGN KEY (`idTienda`) REFERENCES `tienda`(`idTienda`) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (`idProducto`) REFERENCES `producto`(`idProducto`) ON DELETE CASCADE ON UPDATE CASCADE
);

-- -----------------------------------------------------
-- CARRITO
-- -----------------------------------------------------
CREATE TABLE `ciclomart`.`carrito` (
  `idCarrito` INT NOT NULL AUTO_INCREMENT,
  `idUsuario` INT NOT NULL,
  `cantidadProductos` INT NULL DEFAULT 0,
  `precioTotal` FLOAT NULL,
  `fecha` DATETIME NULL,
  `estado` VARCHAR(45) NULL,
  `metodoPago` VARCHAR(45) NULL,
  `direccionEnvio` VARCHAR(45) NULL,
  `descuento` FLOAT NULL,

  PRIMARY KEY (`idCarrito`),
  FOREIGN KEY (`idUsuario`) REFERENCES `usuario`(`idUsuario`) ON DELETE CASCADE ON UPDATE CASCADE -- La id del carro es la misma que la del usuario
);


-- CARRITO-PRODUCTO
-- Representa cierto producto a comprar en cierta tienda
-- -----------------------------------------------------
CREATE TABLE `ciclomart`.`carritoProducto` (
  `idCarritoProducto` INT NOT NULL AUTO_INCREMENT,
  `idCarrito` INT NOT NULL,
  `idTienda` INT NOT NULL,
  `idProducto` INT NOT NULL,
  `idUsuario` INT NOT NULL,
  `cantidad` INT NULL,
  `precio` FLOAT NULL,
  PRIMARY KEY (`idCarritoProducto`),
  FOREIGN KEY (`idCarrito`) REFERENCES `carrito`(`idCarrito`) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (`idTienda`, `idProducto`) REFERENCES `tiendaProducto`(`idTienda`, `idProducto`) ON UPDATE CASCADE,
  FOREIGN KEY (`idProducto`, `idUsuario`) REFERENCES `documentoProducto`(`idProducto`, `idUsuario`) ON UPDATE CASCADE
) ENGINE=InnoDB;


-- -----------------------------------------------------
-- TRANSACCION
-- -----------------------------------------------------
CREATE TABLE `ciclomart`.`transaccion` (
  `idTransaccion` INT NOT NULL AUTO_INCREMENT,
  `idCarrito` INT NOT NULL,
  `idUsuario` INT NOT NULL,
  `fecha` DATETIME NULL,
  `monto` FLOAT NULL,
  `metodoPago` VARCHAR(45) NULL,
  `estado` VARCHAR(45) NULL,
  PRIMARY KEY (`idTransaccion`),
  FOREIGN KEY (`idCarrito`) REFERENCES `carrito`(`idCarrito`) ON DELETE CASCADE,
  FOREIGN KEY (`idUsuario`) REFERENCES `usuario`(`idUsuario`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- -----------------------------------------------------
-- ENVIO
-- -----------------------------------------------------
CREATE TABLE `ciclomart`.`envio` (
  `idEnvio` INT NOT NULL AUTO_INCREMENT,
  `idTransaccion` INT NOT NULL,
  `idUsuarioComprador` INT NOT NULL,
  `fecha` DATETIME NULL,
  `direccion` VARCHAR(45) NULL,
  `estado` VARCHAR(45) NULL,
  PRIMARY KEY (`idEnvio`),
  FOREIGN KEY (`idTransaccion`) REFERENCES `transaccion`(`idTransaccion`) ON DELETE CASCADE,
  FOREIGN KEY (`idUsuarioComprador`) REFERENCES `usuario`(`idUsuario`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- -----------------------------------------------------
-- CALIFICACION
-- -----------------------------------------------------
CREATE TABLE `ciclomart`.`calificacion` (
  `idCalificacion` INT NOT NULL AUTO_INCREMENT,
  `idUsuarioComprador` INT NOT NULL,
  `foto` VARCHAR(120) NULL,
  `comentario` VARCHAR(45) NULL,
  `nota` INT NULL,
  `fecha` DATETIME NULL,
  `idProducto` INT NOT NULL,
  `idUsuarioVendedor` INT NOT NULL,
  `idTienda` INT NOT NULL,
  PRIMARY KEY (`idCalificacion`),
  FOREIGN KEY (`idUsuarioComprador`) REFERENCES `usuario`(`idUsuario`) ON DELETE CASCADE,
  FOREIGN KEY (`idTienda`, `idProducto`) REFERENCES `tiendaProducto`(`idTienda`, `idProducto`) ON DELETE CASCADE,
  FOREIGN KEY (`idProducto`, `idUsuarioVendedor`) REFERENCES `documentoProducto`(`idProducto`, `idUsuario`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- -----------------------------------------------------
-- MENSAJE
-- -----------------------------------------------------
CREATE TABLE `ciclomart`.`mensaje` (
  `idMensaje` INT NOT NULL AUTO_INCREMENT,
  `idUsuarioEmisor` INT NOT NULL,
  `idUsuarioReceptor` INT NOT NULL,
  `contenido` TEXT(255) NULL,
  `fecha` DATETIME NULL,
  PRIMARY KEY (`idMensaje`),
  FOREIGN KEY (`idUsuarioEmisor`) REFERENCES `usuario`(`idUsuario`) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (`idUsuarioReceptor`) REFERENCES `usuario`(`idUsuario`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
