-- Script modificado para instanciar la base de datos 
-- de forma remota en freemysqlhosting.net

-- Elimina las referencias completas a las tablas
-- como ciclomart.tabla y algunas otras caracteristicas
-- que no son soportadas por freemysqlhosting.net como la
-- visibilidad de las llaves foraneas

-- -----------------------------------------------------
-- Schema mydb
-- -----------------------------------------------------

-- -----------------------------------------------------
-- Table `usuario`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `usuario` (
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
-- Table `producto`
-- -----------------------------------------------------


CREATE TABLE `producto` (
  `idProducto` INT NOT NULL,
  `tipo` VARCHAR(45) NOT NULL,
  `nombre` VARCHAR(60) NULL,
  `precio` INT NULL,
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

CREATE TABLE `bicicleta` (
	`idBicicleta` INT NOT NULL PRIMARY KEY,
    `tipo de bicicleta` VARCHAR(45) NULL,
    `tamaño del marco` VARCHAR(45) NULL,
    `material del marco` VARCHAR(45) NULL,
    `tamaño de rueda` VARCHAR(45) NULL,
    `tipo de frenos` VARCHAR(45) NULL,
    `velocidades` INT NULL,
    `suspension` VARCHAR(45) NULL,
    `transmision` VARCHAR(45) NULL,
    `peso` INT NULL,
    `color` VARCHAR(45) NULL,
    `extras` VARCHAR(100) NULL,
    FOREIGN KEY (`idBicicleta`) REFERENCES `producto`(`idProducto`)
);

CREATE TABLE `repuesto` (
	`idRepuesto` INT NOT NULL PRIMARY KEY,
    `categoria` VARCHAR(45) NULL,
    `compatibilidad` VARCHAR(45) NULL,
    FOREIGN KEY (`idRepuesto`) REFERENCES `producto`(`idProducto`)
);


-- -----------------------------------------------------
-- Table `tienda`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `tienda` (
  `idTienda` INT NOT NULL,
  `idUsuarioAdministrador` INT NOT NULL,
  `nombre` VARCHAR(45) NULL DEFAULT NULL,
  `descripcion` VARCHAR(45) NULL DEFAULT NULL,
  `telefono` VARCHAR(25) NULL DEFAULT NULL,
  PRIMARY KEY (`idTienda`),
  INDEX `idUsuarioAdministrador` (`idUsuarioAdministrador` ASC),
  CONSTRAINT `tienda_ibfk_1`
    FOREIGN KEY (`idUsuarioAdministrador`)
    REFERENCES `usuario` (`idUsuario`)
    ON UPDATE CASCADE)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `carrito`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `carrito` (
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
  INDEX `idUsuario` (`idUsuario` ASC),
  CONSTRAINT `carrito_ibfk_1`
    FOREIGN KEY (`idUsuario`)
    REFERENCES `usuario` (`idUsuario`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `carritoproducto`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `carritoproducto` (
  `idCarritoProducto` INT NOT NULL AUTO_INCREMENT,
  `idCarrito` INT NOT NULL,
  `idProducto` INT NOT NULL,
  `cantidad` INT NULL DEFAULT NULL,
  `precio` FLOAT NULL DEFAULT NULL,
  PRIMARY KEY (`idCarritoProducto`),
  INDEX `idCarrito` (`idCarrito` ASC),
  INDEX `fk_carritoproducto_producto1_idx` (`idProducto` ASC),
  CONSTRAINT `carritoproducto_ibfk_1`
    FOREIGN KEY (`idCarrito`)
    REFERENCES `carrito` (`idCarrito`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_carritoproducto_producto1`
    FOREIGN KEY (`idProducto`)
    REFERENCES `producto` (`idProducto`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `documentoproducto`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `documentoproducto` (
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
  INDEX `idUsuario` (`idUsuario` ASC),
  INDEX `fk_documentoproducto_tienda1_idx` (`idTienda` ASC),
  INDEX `fk_documentoproducto_carritoproducto1_idx` (`idCarritoProducto` ASC),
  CONSTRAINT `documentoproducto_ibfk_1`
    FOREIGN KEY (`idProducto`)
    REFERENCES `producto` (`idProducto`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `documentoproducto_ibfk_2`
    FOREIGN KEY (`idUsuario`)
    REFERENCES `usuario` (`idUsuario`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_documentoproducto_tienda1`
    FOREIGN KEY (`idTienda`)
    REFERENCES `tienda` (`idTienda`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_documentoproducto_carritoproducto1`
    FOREIGN KEY (`idCarritoProducto`)
    REFERENCES `carritoproducto` (`idCarritoProducto`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `calificacion`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `calificacion` (
  `idCalificacion` INT NOT NULL AUTO_INCREMENT,
  `idUsuarioComprador` INT NOT NULL,
  `idDocumentoProducto` INT NOT NULL,
  `idUsuarioVendedor` INT NOT NULL,
  `foto` VARCHAR(120) NULL DEFAULT NULL,
  `comentario` VARCHAR(45) NULL DEFAULT NULL,
  `nota` INT NULL DEFAULT NULL,
  `fecha` DATETIME NULL DEFAULT NULL,
  PRIMARY KEY (`idCalificacion`),
  INDEX `idUsuarioComprador` (`idUsuarioComprador` ASC),
  INDEX `fk_calificacion_usuario1_idx` (`idUsuarioVendedor` ASC),
  INDEX `fk_calificacion_documentoproducto1_idx` (`idDocumentoProducto` ASC),
  CONSTRAINT `calificacion_ibfk_1`
    FOREIGN KEY (`idUsuarioComprador`)
    REFERENCES `usuario` (`idUsuario`)
    ON DELETE CASCADE,
  CONSTRAINT `fk_calificacion_usuario1`
    FOREIGN KEY (`idUsuarioVendedor`)
    REFERENCES `usuario` (`idUsuario`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_calificacion_documentoproducto1`
    FOREIGN KEY (`idDocumentoProducto`)
    REFERENCES `documentoproducto` (`idDocumentoProducto`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `transaccion`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `transaccion` (
  `idTransaccion` INT NOT NULL AUTO_INCREMENT,
  `idCarrito` INT NOT NULL,
  `idComprador` INT NOT NULL,
  `idVendedor` INT NOT NULL,
  `fecha` DATETIME NULL DEFAULT NULL,
  `monto` FLOAT NULL DEFAULT NULL,
  `metodoPago` VARCHAR(45) NULL DEFAULT NULL,
  `estado` ENUM('proceso','exitosa','fallida'),
  PRIMARY KEY (`idTransaccion`),
  INDEX `idCarrito` (`idCarrito` ASC),
  INDEX `idUsuario` (`idVendedor` ASC),
  INDEX `fk_transaccion_usuario1_idx` (`idComprador` ASC),
  CONSTRAINT `transaccion_ibfk_1`
    FOREIGN KEY (`idCarrito`)
    REFERENCES `carrito` (`idCarrito`)
    ON DELETE CASCADE,
  CONSTRAINT `transaccion_ibfk_2`
    FOREIGN KEY (`idVendedor`)
    REFERENCES `usuario` (`idUsuario`)
    ON DELETE CASCADE,
  CONSTRAINT `fk_transaccion_usuario1`
    FOREIGN KEY (`idComprador`)
    REFERENCES `usuario` (`idUsuario`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `envio`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `envio` (
  `idEnvio` INT NOT NULL AUTO_INCREMENT,
  `idTransaccion` INT NOT NULL,
  `idUsuarioComprador` INT NOT NULL,
  `idUsuarioVendedor` INT NOT NULL,
  `fecha` DATETIME NULL DEFAULT NULL,
  `direccion` VARCHAR(45) NULL DEFAULT NULL,
  `estado` VARCHAR(45) NULL DEFAULT NULL,
  PRIMARY KEY (`idEnvio`),
  INDEX `idTransaccion` (`idTransaccion` ASC),
  INDEX `idUsuarioComprador` (`idUsuarioComprador` ASC),
  INDEX `fk_envio_usuario1_idx` (`idUsuarioVendedor` ASC),
  CONSTRAINT `envio_ibfk_1`
    FOREIGN KEY (`idTransaccion`)
    REFERENCES `transaccion` (`idTransaccion`)
    ON DELETE CASCADE,
  CONSTRAINT `envio_ibfk_2`
    FOREIGN KEY (`idUsuarioComprador`)
    REFERENCES `usuario` (`idUsuario`)
    ON DELETE CASCADE,
  CONSTRAINT `fk_envio_usuario1`
    FOREIGN KEY (`idUsuarioVendedor`)
    REFERENCES `usuario` (`idUsuario`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `mensaje`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `mensaje` (
  `idMensaje` INT NOT NULL AUTO_INCREMENT,
  `idUsuarioEmisor` INT NOT NULL,
  `idUsuarioReceptor` INT NOT NULL,
  `idTransaccion` INT NOT NULL,
  `contenido` TEXT NULL DEFAULT NULL,
  `fecha` DATETIME NULL DEFAULT NULL,
  PRIMARY KEY (`idMensaje`),
  INDEX `idUsuarioEmisor` (`idUsuarioEmisor` ASC),
  INDEX `fk_mensaje_transaccion1_idx` (`idTransaccion` ASC),
  INDEX `fk_mensaje_usuario1_idx` (`idUsuarioReceptor` ASC),
  CONSTRAINT `mensaje_ibfk_1`
    FOREIGN KEY (`idUsuarioEmisor`)
    REFERENCES `usuario` (`idUsuario`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_mensaje_transaccion1`
    FOREIGN KEY (`idTransaccion`)
    REFERENCES `transaccion` (`idTransaccion`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_mensaje_usuario1`
    FOREIGN KEY (`idUsuarioReceptor`)
    REFERENCES `usuario` (`idUsuario`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;
-- -----------------------------------------------------
-- INSERTS
-- -----------------------------------------------------
-- Inserts for USUARIO
INSERT INTO `usuario` (`nombre`, `apellido`, `edad`, `rol`, `correo`, `direccion`, `telefono`, `username`, `password`, `fechaRegistro`) VALUES
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
INSERT INTO `tienda` (`idTienda`, `idUsuarioAdministrador`, `nombre`, `descripcion`, `telefono`) VALUES
(1, 3, 'Tienda de Bicicletas', 'Venta de bicicletas y accesorios', '3001234567');


INSERT INTO producto (idProducto, tipo, nombre, precio, marca, disponibilidad, `método de envio`, fechaPublicacion, condición) VALUES
(20, 'bicicleta', 'Bicicleta de montaña', 700000, 'MarcaX', 'inmediata', 'costo', '2023-04-05', 'Nuevo'),
(42, 'bicicleta', 'Bicicleta de carretera', 1200000, 'MarcaY', 'inmediata', 'costo', '2023-05-10', 'Nuevo'),
(3, 'repuesto', 'Cadena de bicicleta', 50000, 'shimano', 'preventa', 'costo', '2023-06-15', 'Nuevo'),
(4, 'repuesto', 'Llanta de bicicleta', 80000, 'sram', 'preventa', 'costo', '2023-07-20', 'Nuevo'),
(5, 'bicicleta', 'Bicicleta BMX', 500000, 'trek', 'pedido', 'gratis', '2023-08-25', 'Nuevo'),
(6, 'repuesto', 'Frenos de disco', 1000000, 'campagnolo', 'preventa', 'costo', '2023-09-30', 'Nuevo'),
(7, 'bicicleta', 'Bicicleta eléctrica', 1500000, 'giant', 'agotado', 'retiro', '2023-10-05', 'Nuevo'),
(8, 'repuesto', 'Pedales de bicicleta', 40000, 'giant', 'preventa', 'costo', '2023-11-10', 'Nuevo'),
(9, 'bicicleta', 'Bicicleta plegable', 800000, 'trek', 'inmediata', 'costo', '2023-12-15', 'Nuevo'),
(10, 'repuesto', 'Sillín de bicicleta', 60000, 'shimano', 'inmediata', 'retiro', '2024-01-20', 'Nuevo'),
(11, 'bicicleta', 'Bicicleta de paseo', 600000, 'Marcay', 'inmediata', 'costo', '2024-02-25', 'Nuevo'),
(12, 'repuesto', 'Manillar de bicicleta', 700000, 'shimano', 'preventa', 'costo', '2024-03-30', 'Nuevo');

INSERT INTO repuesto (idRepuesto, categoria, compatibilidad) VALUES
(3, 'transmision', 'ruta'),
(4, 'rueda', 'montaña'),
(6, 'frenos', 'ruta'),
(8, 'pedales', 'bmx'),
(10, 'asiento', 'ruta'),
(12, 'manubrio', 'ruta');

INSERT INTO bicicleta (idBicicleta, `tipo de bicicleta`, `tamaño del marco`, `tamaño de rueda` , `material del marco`, `tipo de frenos`, velocidades, suspension, transmision, color, extras) VALUES
(20, 'montala', 'medium', '26', 'aluminio',  'disco', '3', 'doble', 'doble', 'amarillo', 'luces'),
(42, 'ruta', 'large', '26', 'carbono' ,'convencional', '5', 'sin', 'triple', 'rojo', 'timbre'),
(5, 'bmx', 'xl', '27.5', 'carbono', 'convencional', '7', 'doble', 'monoplato', 'azul', 'parrilla'),
(7, 'ruta', 'medium', '27.5', 'carbono', 'disco', '7', 'delantera', 'doble', 'verde', 'candado'),
(9, 'ruta', 'medium', '29', 'acero', 'disco', '10', 'doble', 'triple', 'medio', 'timbre'),
(11, 'montaña', 'large',  '29', 'aluminio', 'convencional', '24', 'doble', 'monoplato', 'amarillo', 'luces');


-- Inserts for DOCUMENTOPRODUCTO
INSERT INTO `documentoproducto` (`idProducto`, `idUsuario`, `tipo`, `descripcion`, `estado`, `precio`, `fechaCompra`) VALUES
(20, 1, 'Venta', 'Bicicleta de montaña en buen estado', 'Nuevo', 500.00, '2023-01-15'),
(10, 2, 'Venta', 'Sillin de bicicleta ergonomico', 'Nuevo', 50.00, '2023-02-15');


-- Inserts for CARRITO
INSERT INTO `carrito` (`idCarrito`, `idUsuario`, `cantidadProductos`, `precioTotal`, `fecha`, `estado`, `metodoPago`, `direccionEnvio`, `descuento`) VALUES
(1, 1, 3, 1200.50, '2023-03-04', 'Completado', 'Transferencia Bancaria', 'Avenida 456 #78-90, Medellín', 10.00),
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
(21, 10, 2, 1200.00, '2023-06-15', 'Pendiente', 'Tarjeta de Crédito', 'Calle 456 #78-90, Bogotá', 5.00),
(22, 10, 3, 1500.00, '2023-06-20', 'Completado', 'PayPal', 'Avenida 123 #45-67, Medellín', 10.00);
-- Inserts for CARRITOPRODUCTO

select * from producto;
-- Inserts for CARRITOPRODUCTO
INSERT INTO `carritoproducto` (`idCarritoProducto`, `idCarrito`, `idProducto`, `cantidad`, `precio`) VALUES
(1, 1, 3, 1, 500.00),
(2, 1, 3, 1, 50.00),
(3, 1, 3, 1, 650.50), -- Total 3 productos para carrito 1
(4, 2, 3, 1, 400.00),
(5, 2, 3, 1, 400.00),
(6, 2, 3, 1, 400.00), -- Total 3 productos para carrito 2
(7, 3, 3, 1, 890.00), -- Total 1 producto para carrito 3
(8, 4, 3, 1, 100.00),
(9, 4, 3, 1, 100.00),
(10, 4, 3, 1, 100.00),
(11, 4, 3, 1, 150.75), -- Total 4 productos para carrito 4
(12, 5, 3, 1, 150.00),
(13, 5, 3, 1, 150.00), -- Total 2 productos para carrito 5
(14, 6, 3, 1, 300.00),
(15, 6, 3, 1, 250.00),
(16, 6, 3, 1, 230.00), -- Total 3 productos para carrito 6
(17, 7, 3, 1, 670.00), -- Total 1 producto para carrito 7
(18, 8, 3, 1, 200.00),
(19, 8, 3, 1, 200.00),
(20, 8, 3, 1, 200.00),
(21, 8, 4, 1, 400.00), -- Total 5 productos para carrito 8
(22, 9, 3, 1, 100.00),
(23, 9, 3, 1, 100.00),
(24, 9, 3, 1, 100.00),
(25, 9, 4, 1, 100.00), -- Total 4 productos para carrito 9
(26, 10, 3, 1, 250.00), -- Total 1 producto para carrito 10
(27, 11, 3, 1, 270.25),
(28, 11, 3, 1, 270.25), -- Total 2 productos para carrito 11
(29, 12, 3, 1, 890.00), -- Total 1 producto para carrito 12
(30, 13, 3, 1, 350.00),
(31, 13, 3, 1, 350.75), -- Total 2 productos para carrito 13
(32, 14, 3, 1, 150.00),
(33, 14, 3, 1, 150.00), -- Total 4 productos para carrito 14
(34, 15, 3, 1, 400.00),
(35, 15, 3, 1, 400.00),
(36, 15, 3, 1, 400.00), -- Total 3 productos para carrito 15
(37, 16, 3, 1, 670.00), -- Total 1 producto para carrito 16
(38, 17, 3, 1, 300.00),
(39, 17, 3, 1, 300.00),
(40, 17, 3, 1, 300.00),
(41, 17, 3, 1, 300.00),
(42, 17, 3, 1, 300.00), -- Total 5 productos para carrito 17
(43, 18, 3, 1, 200.00),
(44, 18, 3, 1, 200.00), -- Total 2 productos para carrito 18
(45, 19, 3, 1, 250.00), -- Total 1 producto para carrito 19
(46, 20, 3, 1, 270.25),
(47, 20, 3, 1, 270.25), -- Total 2 productos para carrito 20
(48, 21, 3, 1, 1000.00),
(49, 21, 3, 1, 200.00), -- Total 2 productos para carrito 21
(50, 22, 3, 1, 1000.00),
(51, 22, 3, 1, 200.00),
(52, 22, 3, 1, 300.00); -- Total 3 productos para carrito 22


-- Inserts for TRANSACCION
INSERT INTO `transaccion` (`idTransaccion`, `idCarrito`, `idComprador`, `idVendedor`, `fecha`, `monto`, `metodoPago`, `estado`) VALUES
(1, 1, 1, 4, '2023-03-05', 1200.50, 'Transferencia Bancaria', 'exitosa'),
(2, 2, 2, 4, '2023-03-05', 1200.50, 'Transferencia Bancaria', 'exitosa'),
(3, 3, 3, 5, '2023-03-10', 890.00, 'Efectivo', 'fallida'),
(4, 4, 4, 6, '2023-03-12', 450.75, 'Tarjeta de Débito', 'exitosa'),
(5, 5, 5, 7, '2023-03-15', 300.00, 'PayPal', 'proceso'),
(6, 6, 6, 1, '2023-03-20', 780.00, 'Tarjeta de Crédito', 'exitosa'),
(7, 7, 7, 2, '2023-03-25', 670.00, 'Transferencia Bancaria', 'fallida'),
(8, 8, 8, 3, '2023-03-28', 1000.00, 'Efectivo', 'exitosa'),
(9, 9, 9, 10, '2023-04-02', 400.00, 'PayPal', 'proceso'),
(10, 10, 1, 10, '2023-04-05', 250.00, 'Tarjeta de Crédito', 'exitosa'),
(11, 11, 2, 10, '2023-04-10', 540.50, 'Transferencia Bancaria', 'exitosa'),
(12, 12, 3, 7, '2023-04-15', 890.00, 'Efectivo', 'fallida'),
(13, 13, 4, 8, '2023-04-20', 700.75, 'Tarjeta de Débito', 'exitosa'),
(14, 14, 5, 9, '2023-04-25', 300.00, 'PayPal', 'exitosa'),
(15, 15, 6, 1, '2023-04-28', 1200.00, 'Tarjeta de Crédito', 'proceso'),
(16, 16, 7, 2, '2023-05-02', 670.00, 'Transferencia Bancaria', 'exitosa'),
(17, 17, 8, 3, '2023-05-05', 1500.00, 'Efectivo', 'exitosa'),
(18, 18, 9, 4, '2023-05-10', 400.00, 'PayPal', 'exitosa'),
(19, 19, 1, 5, '2023-05-12', 250.00, 'Tarjeta de Crédito', 'exitosa'),
(20, 20, 2, 6, '2023-05-15', 540.50, 'Transferencia Bancaria', 'exitosa'),
(21, 21, 10, 4, '2023-06-15', 1200.00, 'Tarjeta de Crédito', 'proceso'),
(22, 22, 10, 5, '2023-06-20', 1500.00, 'PayPal', 'exitosa');

-- Inserts for ENVIO
INSERT INTO `envio` (`idEnvio`, `idTransaccion`, `idUsuarioComprador`, `idUsuarioVendedor`, `fecha`, `direccion`, `estado`) VALUES
(1, 1, 1, 3, '2023-03-03', 'Calle 123 #45-67, Bogotá', 'Enviado');



-- Inserts for CALIFICACION
INSERT INTO `calificacion` (`idCalificacion`, `idUsuarioComprador`, `idUsuarioVendedor`, `foto`, `comentario`, `nota`, `fecha`, `idDocumentoProducto`) VALUES
(1, 1, 3, 'foto1.jpg', 'Excelente producto', 5, '2023-03-04', 5);

-- Inserts for MENSAJE

INSERT INTO `mensaje` (`idMensaje`, `idUsuarioEmisor`, `idUsuarioReceptor`, `idTransaccion`, `contenido`, `fecha`) VALUES
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
    usuario vendedor ON t.idVendedor = vendedor.idUsuario
WHERE 
    t.estado = 'exitosa';


select * from productosCompradorVendedor;
select * from transaccion;
select * from carrito;
select * from carritoProducto; 
select * from producto;
select * from usuario;
