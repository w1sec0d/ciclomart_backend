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
  PRIMARY KEY (`idUsuario`));

-- -----------------------------------------------------
-- PRODUCTO
-- -----------------------------------------------------

CREATE TABLE `ciclomart`.`producto` (
  `idProducto` INT NOT NULL,
  `tipo` VARCHAR(45) NOT NULL,
  `nombre` VARCHAR(60) NULL,
  `precio` INT NOT NULL,
  `marca` VARCHAR(45) NULL,
  `disponibilidad` VARCHAR(45) NULL,
  `método de envio` VARCHAR(45) NULL,
  `fechaPublicacion` VARCHAR(45) NULL,
  `condición` VARCHAR(45) NULL,
  `tipo de bicicleta` VARCHAR(45) NULL,
	`tamaño del marco` VARCHAR(45) NULL,
	`material del marco` VARCHAR(45) NULL,
	`tamaño de rueda` VARCHAR(45) NULL,
	`tipo de frenos` VARCHAR(45) NULL,
	`velocidades` INT NULL,
	`suspensión` VARCHAR(45) NULL,
	`transmision` VARCHAR(45) NULL,
	`peso` INT NULL,
	`color` VARCHAR(45) NULL,
	`extras` VARCHAR(100) NULL,
     `categoria` VARCHAR(45) NULL,
    `compatibilidad` VARCHAR(45) NULL,
  PRIMARY KEY (`idProducto`));

CREATE TABLE `ciclomart`.`bicicleta` (
	`idBicicleta` INT NOT NULL PRIMARY KEY,
    `tipo de bicicleta` VARCHAR(45) NULL,
    `tamaño del marco` VARCHAR(45) NULL,
    `material del marco` VARCHAR(45) NULL,
    `tamaño de rueda` VARCHAR(45) NULL,
    `tipo de frenos` VARCHAR(45) NULL,
    `velocidades` INT NULL,
    `suspensión` VARCHAR(45) NULL,
    `transmision` VARCHAR(45) NULL,
    `peso` INT NULL,
    `color` VARCHAR(45) NULL,
    `extras` VARCHAR(100) NULL,
    FOREIGN KEY (`idBicicleta`) REFERENCES `ciclomart`.`producto`(`idProducto`)
);

CREATE TABLE `ciclomart`.`repuesto` (
	`idRepuesto` INT NOT NULL PRIMARY KEY,
    `categoria` VARCHAR(45) NULL,
    `compatibilidad` VARCHAR(45) NULL,
    FOREIGN KEY (`idRepuesto`) REFERENCES `ciclomart`.`producto`(`idProducto`)
);
-- ----------------------------------------
-- Trigger para insertar en tabla correspondiente
-- ----------------------------------------

DELIMITER //

CREATE TRIGGER InsertarCorrespondiente
AFTER INSERT ON `ciclomart`.`producto`
FOR EACH ROW
BEGIN
	IF NEW.`tipo` = 'bicicleta' THEN
        INSERT INTO `ciclomart`.`bicicleta` (`idBicicleta`) VALUES (NEW.`idProducto`);
    ELSEIF NEW.`tipo` = 'repuesto' THEN
		INSERT INTO `ciclomart`.`repuesto` (`idRepuesto`) VALUES (NEW.`idProducto`);
	END IF;
END; //

DELIMITER ;


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

-- -----------------------------------------------------
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
);

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
);

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
);

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
);

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
);

-- -----------------------------------------------------
-- INSERTS
-- -----------------------------------------------------
INSERT INTO ciclomart.producto (idProducto, tipo, nombre, precio, marca, disponibilidad, `método de envio`, fechaPublicacion, condición, `tipo de bicicleta`, `tamaño del marco`, `material del marco`, `tamaño de rueda`, `tipo de frenos`, velocidades, suspensión, transmision, peso, color, extras, categoria, compatibilidad)
VALUES
(1, 'bicicleta', 'mountain bike', 500, 'giant', 'inmediata', 'gratis', '2023-01-01', 'nuevo', 'montaña', 'M', 'aluminio', '29', 'disco', 21, 'delantera', 'shimano', 15, 'negro', 'portabotellas', NULL, NULL),
(2, 'bicicleta', 'road bike', 750, 'MarcaX', 'preventa', 'costo', '2023-02-01', 'nuevo', 'carretera', 'L', 'carbono', '28', 'caliper', 18, 'ninguna', 'sram', 8, 'rojo', 'luces', NULL, NULL),
(3, 'repuesto', 'cadena de bicicleta', 25, 'shimano', 'pedido', 'retiro', '2023-03-01', 'nuevo', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'transmision', 'universal'),
(4, 'repuesto', 'llanta de bicicleta', 40, 'sram', 'agotado', 'gratis', '2023-04-01', 'nuevo', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'ruedas', '29'),
(5, 'bicicleta', 'bmx', 300, 'MarcaY', 'inmediata', 'costo', '2023-05-01', 'nuevo', 'bmx', 'S', 'acero', '20', 'v-brake', 1, 'ninguna', 'ninguna', 12, 'azul', 'pegatinas', NULL, NULL),
(6, 'repuesto', 'sillín de bicicleta', 35, 'campagnolo', 'preventa', 'retiro', '2023-06-01', 'nuevo', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'asiento', 'universal'),
(7, 'bicicleta', 'hybrid bike', 600, 'giant', 'pedido', 'gratis', '2023-07-01', 'nuevo', 'híbrida', 'M', 'aluminio', '27.5', 'disco', 24, 'delantera', 'shimano', 14, 'verde', 'guardabarros', NULL, NULL),
(8, 'repuesto', 'pedales de bicicleta', 20, 'shimano', 'agotado', 'costo', '2023-08-01', 'nuevo', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'pedales', 'universal'),
(9, 'bicicleta', 'electric bike', 1200, 'MarcaX', 'inmediata', 'retiro', '2023-09-01', 'nuevo', 'eléctrica', 'L', 'aluminio', '29', 'disco', 21, 'delantera', 'bosch', 20, 'negro', 'batería extra', NULL, NULL),
(10, 'repuesto', 'frenos de disco', 50, 'sram', 'preventa', 'gratis', '2023-10-01', 'nuevo', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'frenos', 'universal'),
(11, 'bicicleta', 'gravel bike', 850, 'MarcaY', 'preventa', 'costo', '2023-11-01', 'nuevo', 'gravel', 'M', 'carbono', '28', 'disco', 22, 'ninguna', 'shimano', 9, 'gris', 'bolsa de cuadro', NULL, NULL),
(12, 'bicicleta', 'folding bike', 450, 'giant', 'pedido', 'gratis', '2023-12-01', 'nuevo', 'plegable', 'S', 'aluminio', '20', 'v-brake', 7, 'ninguna', 'ninguna', 11, 'blanco', 'portaequipajes', NULL, NULL),
(13, 'repuesto', 'cambio trasero', 60, 'campagnolo', 'inmediata', 'retiro', '2024-01-01', 'nuevo', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'transmision', 'campagnolo'),
(14, 'repuesto', 'manillar de bicicleta', 30, 'shimano', 'agotado', 'costo', '2024-02-01', 'nuevo', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'manillar', 'universal'),
(15, 'bicicleta', 'cruiser bike', 550, 'MarcaX', 'inmediata', 'gratis', '2024-03-01', 'nuevo', 'crucero', 'L', 'acero', '26', 'coaster', 1, 'ninguna', 'ninguna', 18, 'verde', 'cesta delantera', NULL, NULL),
(16, 'repuesto', 'tija de sillín', 45, 'sram', 'preventa', 'retiro', '2024-04-01', 'nuevo', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'asiento', 'universal'),
(17, 'bicicleta', 'tandem bike', 1300, 'MarcaY', 'pedido', 'costo', '2024-05-01', 'nuevo', 'tándem', 'XL', 'aluminio', '28', 'disco', 21, 'delantera', 'shimano', 25, 'azul', 'doble asiento', NULL, NULL),
(18, 'repuesto', 'horquilla de suspensión', 120, 'shimano', 'agotado', 'gratis', '2024-06-01', 'nuevo', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'suspensión', '29'),
(19, 'bicicleta', 'fixie bike', 400, 'giant', 'inmediata', 'retiro', '2024-07-01', 'nuevo', 'fixie', 'M', 'acero', '28', 'caliper', 1, 'ninguna', 'ninguna', 10, 'negro', 'correa de cuero', NULL, NULL),
(20, 'repuesto', 'bielas de bicicleta', 70, 'campagnolo', 'preventa', 'costo', '2024-08-01', 'nuevo', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'transmision', 'campagnolo');

INSERT INTO `ciclomart`.`usuario` (`nombre`, `apellido`, `edad`, `rol`, `correo`, `direccion`, `telefono`, `username`, `password`, `fechaRegistro`) VALUES
('Juan', 'Pérez', 30, 'comprador', 'juan.perez@example.com', 'Calle 123 #45-67, Bogotá', '3001234567', 'juanperez', '$2b$10$uP41SextbAzmP/hjWITrdecMJhb1/JrZzN6M3ptI6EB4zbWcjVDEy', NOW()),
('Maria', 'Gomez', 25, 'cliente', 'maria.gomez@example.com', 'Avenida 456 #78-90, Medellín', '3007654321', 'mariagomez', '$2b$10$uP41SextbAzmP/hjWITrdecMJhb1/JrZzN6M3ptI6EB4zbWcjVDEy', NOW()),
('Carlos', 'Rodriguez', 40, 'administrador', 'carlos.rodriguez@example.com', 'Carrera 789 #12-34, Cali', '3009876543', 'carlosrodriguez', '$2b$10$uP41SextbAzmP/hjWITrdecMJhb1/JrZzN6M3ptI6EB4zbWcjVDEy', NOW()),
('Ana', 'Martinez', 35, 'comprador', 'ana.martinez@example.com', 'Calle 321 #54-76, Barranquilla', '3001230987', 'anamartinez', '$2b$10$uP41SextbAzmP/hjWITrdecMJhb1/JrZzN6M3ptI6EB4zbWcjVDEy', NOW()),
('Luis', 'Lopez', 28, 'cliente', 'luis.lopez@example.com', 'Avenida 654 #32-10, Cartagena', '3004567890', 'luislopez', '$2b$10$uP41SextbAzmP/hjWITrdecMJhb1/JrZzN6M3ptI6EB4zbWcjVDEy', NOW());


-- Inserts for DOCUMENTOPRODUCTO
INSERT INTO `ciclomart`.`documentoProducto` (`idProducto`, `idUsuario`, `tipo`, `descripcion`, `estado`, `precio`, `fechaCompra`) VALUES
(1, 1, 'Venta', 'Bicicleta de montaña en buen estado', 'Nuevo', 500.00, '2023-01-15'),
(2, 2, 'Venta', 'Casco de ciclismo resistente', 'Nuevo', 50.00, '2023-02-15');

-- Inserts for TIENDA
INSERT INTO `ciclomart`.`tienda` (`idTienda`, `idUsuarioAdministrador`, `nombre`, `descripcion`, `telefono`) VALUES
(1, 3, 'Tienda de Bicicletas', 'Venta de bicicletas y accesorios', '3001234567');

-- Inserts for TIENDA-PRODUCTO
INSERT INTO `ciclomart`.`tiendaProducto` (`idTienda`, `idProducto`, `cantidad`, `precio`) VALUES
(1, 1, 10, 500.00),
(1, 2, 20, 50.00);

-- Inserts for CARRITO
INSERT INTO `ciclomart`.`carrito` (`idCarrito`, `idUsuario`, `cantidadProductos`, `precioTotal`, `fecha`, `estado`, `metodoPago`, `direccionEnvio`, `descuento`) VALUES
(1, 1, 2, 550.00, '2023-03-01', 'Pendiente', 'Tarjeta de Crédito', 'Calle 123 #45-67, Bogotá', 0.00);

-- Inserts for CARRITO-PRODUCTO
INSERT INTO `ciclomart`.`carritoProducto` (`idCarritoProducto`, `idCarrito`, `idTienda`, `idProducto`, `idUsuario`, `cantidad`, `precio`) VALUES
(1, 1, 1, 1, 1, 1, 500.00),
(2, 1, 1, 2, 1, 1, 50.00);

-- Inserts for TRANSACCION
INSERT INTO `ciclomart`.`transaccion` (`idTransaccion`, `idCarrito`, `idUsuario`, `fecha`, `monto`, `metodoPago`, `estado`) VALUES
(1, 1, 1, '2023-03-02', 550.00, 'Tarjeta de Crédito', 'Completado');

-- Inserts for ENVIO
INSERT INTO `ciclomart`.`envio` (`idEnvio`, `idTransaccion`, `idUsuarioComprador`, `fecha`, `direccion`, `estado`) VALUES
(1, 1, 1, '2023-03-03', 'Calle 123 #45-67, Bogotá', 'Enviado');

-- Inserts for CALIFICACION
INSERT INTO `ciclomart`.`calificacion` (`idCalificacion`, `idUsuarioComprador`, `foto`, `comentario`, `nota`, `fecha`, `idProducto`, `idUsuarioVendedor`, `idTienda`) VALUES
(1, 1, 'foto1.jpg', 'Excelente producto', 5, '2023-03-04', 1, 2, 1);

-- Inserts for MENSAJE
INSERT INTO `ciclomart`.`mensaje` (`idMensaje`, `idUsuarioEmisor`, `idUsuarioReceptor`, `contenido`, `fecha`) VALUES
(1, 1, 2, 'Hola, estoy interesado en tu producto', '2023-03-01'),
(2, 2, 1, 'Hola, claro, está disponible', '2023-03-02');

SELECT * FROM producto;

SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
