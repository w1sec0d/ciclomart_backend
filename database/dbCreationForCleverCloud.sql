-- Script generado por dbdiagram.io

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
  `idMarca` int 
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
  `ventas` int DEFAULT 0,
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

------------------------------------------------------------
-- Inserts
------------------------------------------------------------
-- Insertar usuarios de muestra
INSERT INTO `usuario` (`nombre`, `apellido`, `fechaNacimiento`, `rol`, `correo`, `direccion`, `telefono`, `username`, `password`)
VALUES 
('Juan', 'Perez', '1985-05-15', 'comprador', 'juan.perez@ejemplo.com', 'Calle 123, Bogotá', '3001234567', 'juanp', 'contrasena123'),
('Maria', 'Gomez', '1990-08-22', 'cliente', 'maria.gomez@ejemplo.com', 'Carrera 45, Medellín', '3107654321', 'mariag', 'contrasena123'),
('Carlos', 'Lopez', '1978-11-30', 'administrador', 'carlos.lopez@ejemplo.com', 'Avenida 10, Cali', '3209876543', 'carlosl', 'contrasena123');

-- Insertar marcas de muestra
INSERT INTO `marca` (`nombre`)
VALUES 
('Trek'),
('Specialized'),
('Giant'),
('Shimano'),
('Bontrager');

-- Insertar modelos de muestra
INSERT INTO `modelo` (`nombre`, `tipo`, `descripcion`, `categoria`, `compatibilidad`, `idMarca`)
VALUES 
('Trek Marlin 7', 'bicicleta', 'Bicicleta de montaña para senderos', 'MTB', 'Compatible con componentes Shimano', 1),
('Specialized Allez', 'bicicleta', 'Bicicleta de carretera para carreras', 'Carretera', 'Compatible con componentes Shimano', 2),
('Giant Defy Advanced', 'bicicleta', 'Bicicleta de carretera de resistencia', 'Carretera', 'Compatible con componentes Shimano', 3),
('Plato Shimano Deore XT', 'componente', 'Monoplato mtb', 'Transmisión', 'Compatible con bicicletas de montaña', 4),
('Pacha Shimano Altus', 'componente', 'Pacha altus de 8 velocidades', 'Transmisión', 'Compatible con bicicletas de carretera', 4),
('Shimano 105', 'componente', 'Grupo de transmisión de 10 velocidades', 'Transmisión', 'Compatible con bicicletas de carretera', 4),
('Casco Bontrager Starvos', 'accesorio', 'Casco de ciclismo de carretera', 'Casco', 'Talla única', 1),
('Casco Specialized Propero', 'accesorio', 'Casco de ciclismo de carretera', 'Casco', 'Talla única', 2),
('Casco Giant Rev', 'accesorio', 'Casco de ciclismo de carretera', 'Casco', 'Talla única', 3),
('Neumático MTB rin 26"', 'componente', 'Neumatico rin 26"', 'Neumáticos', 'Compatible con bicicletas de montaña', null);

-- Insertar imágenes de muestra
INSERT INTO `imagen` (`idUsuario`, `idModelo`, `url`)
VALUES 
(null, 1, 'https://res.cloudinary.com/drfmpnhaz/image/upload/v1739199906/ukc7nxqc5hm79o4utb39.png'),
(null, 2, 'https://res.cloudinary.com/drfmpnhaz/image/upload/v1739200194/qhvxoj4ggjp1qrdn1fpd.png'),
(null, 3, 'https://res.cloudinary.com/drfmpnhaz/image/upload/v1739200646/iyqe0j8piameldruninf.png'),
(null, 4, 'https://res.cloudinary.com/drfmpnhaz/image/upload/v1739201523/td7nvl10zjctewo5jgld.png'),
(null, 5, 'https://res.cloudinary.com/drfmpnhaz/image/upload/v1739201377/d10mnzoi5xp8ibs1apvm.png'),
(null, 6, ''),
(null, 7, ''),
(null, 8, ''),
(null, 9, ''),
(null, 10, 'https://res.cloudinary.com/drfmpnhaz/image/upload/v1739203206/dgeumsxzyrlqv3kzqdw6.png');

-- Insertar bicicletas de muestra
INSERT INTO `bicicleta` (`tipoBicicleta`, `color`, `genero`, `edad`, `tamañoMarco`, `materialMarco`, `tamañoRueda`, `tipoFrenos`, `velocidades`, `suspension`, `transmision`, `tipoPedales`, `manubrio`, `pesoBicicleta`, `pesoMaximo`, `extras`)
VALUES 
('MTB', 'Negra', 'Unisex', 'Adulto', 'M', 'Aluminio', '29"', 'Disco', '21', 'Delantera', 'Shimano', 'Plataforma', 'Plano', 14.5, 120, 'Portabotellas'),
('Carretera', 'Azul', 'Unisex', 'Adulto', 'L', 'Carbono', '28"', 'Caliper', '22', 'Ninguna', 'Shimano', 'Sin clip', 'Caída', 8.5, 100, 'Ninguno'),
('Carretera','Azul','Unisex','Adulto','M','Carbono','28"','Caliper','22','Ninguna','Shimano','Sin clip','Caída',8.5,100,'Ninguno');

-- Insertar tiendas de muestra
INSERT INTO `tienda` (`idUsuarioAdministrador`, `nombre`, `descripcion`, `telefono`)
VALUES 
(3, 'Tienda de Bicis Bogotá', 'La mejor tienda de bicicletas en Bogotá', '3001234567');

-- Insertar carritos de muestra
INSERT INTO `carrito` (`idUsuario`, `cantidadProductos`, `precioTotal`, `fecha`, `estado`, `metodoPago`, `direccionEnvio`, `descuento`)
VALUES 
(1, 2, 1500.00, NOW(), 'exitosa', 'Tarjeta de Crédito', 'Calle 123, Bogotá', 0),
(2, 1, 800.00, NOW(), 'exitosa', 'PayPal', 'Carrera 45, Medellín', 0);

-- Insertar productos de muestra
INSERT INTO `producto` (`idModelo`, `idVendedor`, `idTienda`, `precio`, `precioCompleto`, `cantidad`,`ventas`, `estado`, `disponibilidad`, `costoEnvio`, `retiroEnTienda`)
VALUES 
(1, 1, null, 3000000, 3300000, 10,0, 'nuevo', 'disponible', 50.00, false),
(2, 2, null, 2400000, 3000000, 5,2, 'nuevo', 'disponible', 0, false),
(3, 3, null, 11000000, null, 3,10, 'nuevo', 'disponible', 50.00, false),
(4, 1, null, 290000, 300000, 20,4, 'nuevo', 'disponible', 0, false),
(5, 2, null, 120000, null, 15,0, 'nuevo', 'disponible', 0, false),
(6, 3, null, 1500000, null, 5,0, 'nuevo', 'disponible', 0, false),
(7, 1, null, 300000, null, 10,0, 'nuevo', 'disponible', 0, false),
(8, 2, null, 460000, 500000, 5,0, 'nuevo', 'disponible', 0, false),
(9, 3, null, 60000, null, 3,0, 'nuevo', 'disponible', 0, false),
(10, 1, null, 5000, null, 15,9, 'nuevo', 'disponible', 0, false);

-- Insertar productos del carrito de muestra
INSERT INTO `carritoProducto` (`idProducto`, `idCarrito`, `cantidad`, `precio_unitario`, `direccion`, `estadoEnvio`)
VALUES 
(1, 1, 1, 750.00, 'Calle 123, Bogotá', 'Pendiente'),
(2, 1, 1, 750.00, 'Calle 123, Bogotá', 'Pendiente'),
(3, 2, 1, 800.00, 'Carrera 45, Medellín', 'Pendiente');

-- Insertar documentos de muestra
INSERT INTO `documento` (`idModelo`, `idUsuario`, `tipo`, `descripcion`, `estado`, `fechaCompra`)
VALUES 
(1, 1, 'Factura', 'Compra de Trek Marlin 7', 'Completado', '2023-01-15'),
(2, 2, 'Factura', 'Compra de Specialized Allez', 'Completado', '2023-02-20');

-- Insertar calificaciones de muestra
INSERT INTO `calificacion` (`idUsuarioComprador`, `idUsuarioVendedor`, `idProducto`, `idTienda`, `foto`, `comentario`, `nota`)
VALUES 
(1, 2, 1, 1, '', '¡Excelente bicicleta!', 5),
(2, 3, 2, 1, '', 'Muy satisfecho', 4),
(3, 2, 2, 1, '', 'La bici es buena pero es muy pesada', 3),
(2,1,10,null, null, 'Muy buen producto, voy tres meses y no me he pinchado', 5),
(3,1,10,null, null, 'Muy malo, me pinche a la primera salida', 1);

-- Insertar mensajes de muestra
INSERT INTO `mensaje` (`idUsuarioEmisor`, `idUsuarioReceptor`, `idCarritoProducto`, `contenido`, `fecha`)
VALUES 
(1, 2, 1, '¿La bicicleta sigue disponible?', NOW()),
(2, 1, 2, 'Sí, todavía está disponible.', NOW());

------------------------------------------------------------
-- Vistas
------------------------------------------------------------
-- Crear la vista consolidada
DROP VIEW IF EXISTS vista_completa_producto;
CREATE VIEW vista_completa_producto AS
SELECT 
    producto.idProducto,
    producto.precio,
    producto.precioCompleto,
    producto.cantidad,
    producto.ventas,
    producto.estado,
    producto.disponibilidad,
    producto.costoEnvio,
    producto.retiroEnTienda,
    producto.fechaPublicacion,
    modelo.idModelo,
    modelo.nombre,
    modelo.tipo,
    modelo.descripcion AS descripcionModelo,
    modelo.categoria,
    modelo.compatibilidad,
    bicicleta.idBicicleta,
    bicicleta.tipoBicicleta,
    bicicleta.color,
    bicicleta.genero,
    bicicleta.edad,
    bicicleta.tamañoMarco,
    bicicleta.materialMarco,
    bicicleta.tamañoRueda,
    bicicleta.tipoFrenos,
    bicicleta.velocidades,
    bicicleta.suspension,
    bicicleta.transmision,
    bicicleta.tipoPedales,
    bicicleta.manubrio,
    bicicleta.pesoBicicleta,
    bicicleta.pesoMaximo,
    bicicleta.extras,
    marca.idMarca,
    marca.nombre AS nombreMarca,
    imagen.idImagen,
    imagen.url AS imagenURL,
    usuario.idUsuario AS idVendedor,
    usuario.nombre AS nombreVendedor,
    usuario.apellido AS apellidoVendedor,
    usuario.correo AS correoVendedor
FROM 
    producto
JOIN 
    modelo ON producto.idModelo = modelo.idModelo
LEFT JOIN 
    bicicleta ON modelo.idModelo = bicicleta.idBicicleta
LEFT JOIN 
    marca ON modelo.idMarca = marca.idMarca
LEFT JOIN 
    imagen ON modelo.idModelo = imagen.idModelo
LEFT JOIN 
    usuario ON producto.idVendedor = usuario.idUsuario
ORDER BY 
    producto.ventas DESC;

DROP VIEW IF EXISTS vista_producto_calificacion;
CREATE VIEW vista_producto_calificacion AS
SELECT 
    producto.idProducto,
    producto.precio,
    producto.precioCompleto,
    producto.cantidad,
    producto.ventas,
    producto.estado,
    producto.disponibilidad,
    producto.costoEnvio,
    producto.retiroEnTienda,
    producto.fechaPublicacion,
    modelo.idModelo,
    modelo.nombre AS nombreModelo,
    modelo.tipo,
    modelo.descripcion AS descripcionModelo,
    modelo.categoria,
    modelo.compatibilidad,
    marca.idMarca,
    marca.nombre AS nombreMarca,
    calificacion.idCalificacion,
    calificacion.nota AS puntuacion,
    calificacion.comentario,
    calificacion.fecha AS fechaCalificacion
FROM 
    producto
JOIN 
    modelo ON producto.idModelo = modelo.idModelo
LEFT JOIN 
    marca ON modelo.idMarca = marca.idMarca
RIGHT JOIN 
    calificacion ON producto.idProducto = calificacion.idProducto
ORDER BY 
    producto.ventas DESC;

DROP VIEW IF EXISTS vista_producto_calificacion_promedio;
CREATE VIEW vista_producto_calificacion_promedio AS
SELECT 
    producto.idProducto,
    producto.precio,
    producto.precioCompleto,
    producto.cantidad,
    producto.ventas,
    producto.estado,
    producto.disponibilidad,
    producto.costoEnvio,
    producto.retiroEnTienda,
    producto.fechaPublicacion,
    modelo.idModelo,
    modelo.nombre AS nombreModelo,
    modelo.tipo,
    modelo.descripcion AS descripcionModelo,
    modelo.categoria,
    modelo.compatibilidad,
    marca.idMarca,
    marca.nombre AS nombreMarca,
    ROUND(AVG(calificacion.nota), 1) AS avg_calificacion
FROM 
    producto
JOIN 
    modelo ON producto.idModelo = modelo.idModelo
LEFT JOIN 
    marca ON modelo.idMarca = marca.idMarca
LEFT JOIN 
    calificacion ON producto.idProducto = calificacion.idProducto
GROUP BY 
    producto.idProducto,
    producto.precio,
    producto.precioCompleto,
    producto.cantidad,
    producto.ventas,
    producto.estado,
    producto.disponibilidad,
    producto.costoEnvio,
    producto.retiroEnTienda,
    producto.fechaPublicacion,
    modelo.idModelo,
    modelo.nombre,
    modelo.tipo,
    modelo.descripcion,
    modelo.categoria,
    modelo.compatibilidad,
    marca.idMarca,
    marca.nombre
ORDER BY 
    producto.ventas DESC;

DROP VIEW IF EXISTS vista_compras_pendientes;
CREATE VIEW vista_compras_pendientes AS
SELECT 
    usuario.idUsuario,
    usuario.nombre,
    usuario.correo,
    carrito.idCarrito,
    carrito.fecha,
    carrito.precioTotal,
    carrito.metodoPago,
    carrito.direccionEnvio,
    carritoProducto.idCarritoProducto,
    carritoProducto.idProducto,
    carritoProducto.cantidad,
    carritoProducto.precio_unitario
FROM 
    carrito
JOIN 
    usuario ON carrito.idUsuario = usuario.idUsuario
JOIN 
    carritoProducto ON carrito.idCarrito = carritoProducto.idCarrito
WHERE 
    carrito.estado != 'exitosa'
ORDER BY 
    carrito.fecha DESC;
    
    DROP VIEW IF EXISTS vista_compras_usuario;
CREATE VIEW vista_compras_usuario AS
SELECT 
    usuario.idUsuario,
    usuario.nombre,
    usuario.correo,
    carrito.idCarrito,
    carrito.fecha,
    carrito.precioTotal,
    carrito.metodoPago,
    carrito.direccionEnvio,
    carritoProducto.idCarritoProducto,
    carritoProducto.idProducto,
    carritoProducto.cantidad,
    carritoProducto.precio_unitario
FROM 
    carrito
JOIN 
    usuario ON carrito.idUsuario = usuario.idUsuario
JOIN 
    carritoProducto ON carrito.idCarrito = carritoProducto.idCarrito
-- WHERE 
   -- carrito.estado = 'exitosa'
ORDER BY 
    carrito.fecha DESC;