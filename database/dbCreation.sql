-- MySQL Workbench Forward Engineering

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

-- -----------------------------------------------------
-- Schema mydb
-- -----------------------------------------------------
DROP SCHEMA IF EXISTS `mydb` ;

-- -----------------------------------------------------
-- Schema mydb
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS `ciclomart` DEFAULT CHARACTER SET utf8 ;
USE `ciclomart` ;

-- -----------------------------------------------------
-- Table `mydb`.`usuario`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `ciclomart`.`usuario` (
  `idUsuario` INT NOT NULL,
  `nombre` VARCHAR(45) NOT NULL,
  `edad` INT NULL,
  `rol` ENUM('comprador', 'cliente', 'administrador') NOT NULL,
  `correo` VARCHAR(45) NULL,
  `direccion` VARCHAR(45) NULL,
  `telefono` VARCHAR(45) NULL,
  PRIMARY KEY (`idUsuario`))
ENGINE = InnoDB;

-- -----------------------------------------------------
-- Insert 20 users into `ciclomart`.`usuario`
-- -----------------------------------------------------
INSERT INTO `ciclomart`.`usuario` (`idUsuario`, `nombre`, `edad`, `rol`, `correo`, `direccion`, `telefono`) VALUES
(1, 'Juan Pérez', 30, 'comprador', 'juan.perez@example.com', 'Calle 123 #45-67, Bogotá', '3001234567'),
(2, 'María Gómez', 25, 'cliente', 'maria.gomez@example.com', 'Carrera 10 #20-30, Medellín', '3002345678'),
(3, 'Carlos Rodríguez', 40, 'administrador', 'carlos.rodriguez@example.com', 'Avenida 1 #2-3, Cali', '3003456789'),
(4, 'Ana Martínez', 35, 'comprador', 'ana.martinez@example.com', 'Calle 45 #67-89, Barranquilla', '3004567890'),
(5, 'Luis García', 28, 'cliente', 'luis.garcia@example.com', 'Carrera 15 #16-17, Cartagena', '3005678901'),
(6, 'Laura Hernández', 32, 'administrador', 'laura.hernandez@example.com', 'Avenida 3 #4-5, Bucaramanga', '3006789012'),
(7, 'Jorge López', 27, 'comprador', 'jorge.lopez@example.com', 'Calle 78 #90-12, Pereira', '3007890123'),
(8, 'Sofía Díaz', 22, 'cliente', 'sofia.diaz@example.com', 'Carrera 8 #9-10, Manizales', '3008901234'),
(9, 'Andrés Torres', 45, 'administrador', 'andres.torres@example.com', 'Avenida 6 #7-8, Ibagué', '3009012345'),
(10, 'Marta Ramírez', 29, 'comprador', 'marta.ramirez@example.com', 'Calle 34 #56-78, Santa Marta', '3000123456'),
(11, 'Pedro Sánchez', 33, 'cliente', 'pedro.sanchez@example.com', 'Carrera 12 #34-56, Villavicencio', '3001234568'),
(12, 'Lucía Morales', 26, 'administrador', 'lucia.morales@example.com', 'Avenida 9 #10-11, Pasto', '3002345679'),
(13, 'Diego Ruiz', 38, 'comprador', 'diego.ruiz@example.com', 'Calle 56 #78-90, Montería', '3003456780'),
(14, 'Paula Jiménez', 31, 'cliente', 'paula.jimenez@example.com', 'Carrera 14 #15-16, Neiva', '3004567891'),
(15, 'Ricardo Castro', 36, 'administrador', 'ricardo.castro@example.com', 'Avenida 7 #8-9, Armenia', '3005678902'),
(16, 'Elena Vargas', 24, 'comprador', 'elena.vargas@example.com', 'Calle 67 #89-12, Popayán', '3006789013'),
(17, 'Fernando Ortiz', 39, 'cliente', 'fernando.ortiz@example.com', 'Carrera 11 #12-13, Tunja', '3007890124'),
(18, 'Gabriela Mendoza', 34, 'administrador', 'gabriela.mendoza@example.com', 'Avenida 4 #5-6, Sincelejo', '3008901235'),
(19, 'Hugo Paredes', 37, 'comprador', 'hugo.paredes@example.com', 'Calle 89 #90-12, Valledupar', '3009012346'),
(20, 'Isabel Ríos', 23, 'cliente', 'isabel.rios@example.com', 'Carrera 13 #14-15, Cúcuta', '3000123457');

SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
