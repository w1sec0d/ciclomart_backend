-- Database setup script
-- CicloMart: Bicycle Marketplace Database Schema
-- 
-- This database supports a marketplace platform for buying and selling bicycles,
-- bike components, accessories, and related items. It handles user management,
-- product listings, shopping carts, payments, ratings, and messaging between users.
--
-- ----------------------------------------------------------
-- DATABASE SUMMARY
-- ----------------------------------------------------------
-- 
-- Core Business Flow:
-- 1. Users register and create accounts (usuario - user)
-- 2. Brands and models (product blueprints) are added to the catalog (marca - brand, modelo - model)
-- 3. Sellers create product listings referencing models (producto - product)
-- 4. Buyers browse products and add items to cart (carrito - cart, carritoProducto - cart-product)
-- 5. Payments are processed through MercadoPago (carrito with payment tracking)
-- 6. Buyers ask questions about products (pregunta - question)
-- 7. After purchase, buyers rate products and sellers (calificacion - rating)
-- 8. Users communicate via messages (mensaje - message)
--
-- Key Relationships:
-- - modelo (model) → marca (brand) - brands have many models
-- - producto (product) → modelo - products reference catalog models or blueprints
-- - producto → usuario (user) - products belong to sellers
-- - carrito (cart) → usuario - carts belong to buyers and involve sellers
-- - carritoProducto (cart product) → carrito + producto - junction table for cart items
-- - calificacion (rating) → producto + usuario - ratings link products to buyers
--
-- Payment Integration:
-- - MercadoPago integration via idPreferencia and idPago fields in carrito, which identify
--   the seller unique id for payment, a discount is made by the marketplace (marketplace fee)
--   and the rest of the payment is sent to the seller.
-- - Order states tracked: pendiente_pago (pending payment) → pendiente_envio (pending shipment) → enviado (sent) → recibido (received)
--
-- Also see: database diagram on /database/diagram


DROP DATABASE IF EXISTS ciclomart;
CREATE DATABASE ciclomart;
USE ciclomart;

-- ----------------------------------------------------------
-- CORE TABLES
-- ----------------------------------------------------------

-- Table: usuario (Users)
-- Purpose: Stores all user accounts including buyers, sellers, and administrators
-- Key Features: Includes shipping address, MercadoPago payment integration fields
-- Fields: nombre (name), apellido (last name), correo (email), telefono (phone), etc.
-- Related Tables: Referenced by producto (product), tienda (store), carrito (cart), pregunta (question), calificacion (rating), mensaje (message)
-- Relationships: One user can have multiple products, carts, ratings, and messages
CREATE TABLE `usuario` (
  `idUsuario` int PRIMARY KEY NOT NULL AUTO_INCREMENT,
  `nombre` varchar(45) NOT NULL,
  `apellido` varchar(45) NOT NULL,
  `fechaNacimiento` date,
  `rol` ENUM ('comprador', 'vendedor', 'administrador') DEFAULT 'comprador',
  `correo` varchar(255) NOT NULL,
  `codigoPostal` varchar(30),
  `direccionNombre` varchar(255),
  `direccionNumero` varchar(255),
  `direccionPiso` varchar(30),
  `direccionApartamento` varchar(30),
  `direccionCiudad` varchar(255) DEFAULT 'Bogotá',
  `telefono` varchar(60),
  `username` varchar(45),
  `password` varchar(64) NOT NULL,
  `reporte` boolean DEFAULT (false),
  `fechaRegistro` datetime DEFAULT (current_timestamp),
  `mp_user_id` varchar(100),
  `mp_access_token` varchar(100),
  `mp_refresh_token` varchar(100),
  `mp_public_key` varchar(100)
);

-- Table: bicicleta (Bicycle Specifications)
-- Purpose: Stores detailed bicycle specifications (frame, brakes, suspension, etc.)
-- Key Features: Only used when the product is a complete bicycle
-- Fields: tamañoMarco (frame size), materialMarco (frame material), tipoFrenos (brake type), etc.
-- Related Tables: Linked to modelo when type is 'bicicleta' (bike)
-- Relationships: One-to-one with modelo (optional)
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
  `extras` text,
  `tarjeta` varchar(255)
);

-- Table: marca (Brands)
-- Purpose: Stores bicycle and component brand names
-- Key Features: Includes index on name for faster searches
-- Related Tables: Referenced by modelo (model)
-- Relationships: One-to-many with modelo (one brand can have many models)
CREATE TABLE `marca` (
  `idMarca` int PRIMARY KEY NOT NULL AUTO_INCREMENT,
  `nombre` varchar(45) NOT NULL,
  INDEX `nombre` (`nombre`)
);

-- Table: modelo (Models/Products Catalog)
-- Purpose: Main blueprint for all products (bikes, components, accessories)
-- Key Features: Type can be 'bicicleta' (bike), 'componente'(component), 'accesorio'(accessory), or 'otro'(other)
-- Related Tables: Links to marca (brand), bicicleta (bike); referenced by documento (document), producto (product), imagen (image)
-- Relationships: Many-to-one with marca (brand), optional one-to-one with bicicleta (bike)
-- Note: This is the main product catalog - individual listings are in 'producto'
CREATE TABLE `modelo` (
  `idModelo` int PRIMARY KEY NOT NULL AUTO_INCREMENT,
  `nombre` varchar(255) NOT NULL,
  `tipo` ENUM ('bicicleta', 'componente', 'accesorio', 'otro') NOT NULL DEFAULT 'bicicleta',
  `descripcion` text NOT NULL,
  `categoria` varchar(100),
  `compatibilidad` text,
  `idBicicleta` int,
  `idMarca` int,
  FOREIGN KEY (`idBicicleta`) REFERENCES `bicicleta` (`idBicicleta`),
  FOREIGN KEY (`idMarca`) REFERENCES `marca` (`idMarca`),
  INDEX `idMarca` (`idMarca`),
  INDEX `nombre` (`nombre`)
);

-- Table: tienda (Stores)
-- Purpose: Represents physical or online stores where products can be sold
-- Key Features: Each store has an administrator (usuario with admin role)
-- Related Tables: Referenced by producto (product), calificacion (rating)
-- Relationships: Many-to-one with usuario (one admin per store, stores can have multiple products)
CREATE TABLE `tienda` (
  `idTienda` int PRIMARY KEY NOT NULL AUTO_INCREMENT,
  `idUsuarioAdministrador` int NOT NULL,
  `nombre` varchar(255),
  `descripcion` text,
  `telefono` varchar(60),
  FOREIGN KEY (`idUsuarioAdministrador`) REFERENCES `usuario` (`idUsuario`),
  INDEX `nombre` (`nombre`)
);

-- Table: documento (User Documents/Ownership Records)
-- Purpose: Stores user-owned items (e.g., documents for bicycles they own)
-- Key Features: Can track purchase date and state of items
-- Fields: fechaCompra (purchase date), estado (status), tipo (type)
-- Related Tables: Links to modelo (model) and usuario (user); referenced by imagen (image)
-- Relationships: Many-to-one with modelo (model) and usuario (user)
-- Note: Used for tracking ownership and documentation of items
CREATE TABLE `documento` (
  `idDocumento` int PRIMARY KEY NOT NULL AUTO_INCREMENT,
  `idModelo` int NOT NULL,
  `idUsuario` int,
  `tipo` varchar(60),
  `descripcion` text,
  `estado` varchar(60),
  `fechaCompra` date,
  FOREIGN KEY (`idModelo`) REFERENCES `modelo` (`idModelo`),
  FOREIGN KEY (`idUsuario`) REFERENCES `usuario` (`idUsuario`),
  INDEX `idUsuario` (`idUsuario`)
);

-- Table: producto (Product Listings)
-- Purpose: Individual product listings with pricing, inventory, and availability
-- Key Features: Tracks sales, exposure, shipping options, and seller information
-- Fields: precio (price), cantidad (quantity), ventas (sales), costoEnvio (shipping cost)
-- Related Tables: Links to modelo, usuario, tienda; referenced by carritoProducto (cart product), pregunta (question), calificacion (rating)
-- Relationships: Many-to-one with modelo, usuario (seller), and optional tienda
-- Note: This is where sellers create listings - separate from the product catalog (modelo)
CREATE TABLE `producto` (
  `idProducto` int PRIMARY KEY NOT NULL AUTO_INCREMENT,
  `idModelo` int NOT NULL,
  `idVendedor` int,
  `idTienda` int,
  `exposicion` int DEFAULT 0,
  `precio` float,
  `precioCompleto` float,
  `cantidad` int DEFAULT 0,
  `ventas` int DEFAULT 0,
  `estado` ENUM ('nuevo', 'usado') DEFAULT 'nuevo',
  `dimensiones` varchar(255),
  `disponibilidad` ENUM ('disponible', 'vendido', 'reservado') DEFAULT 'disponible',
  `costoEnvio` float NOT NULL DEFAULT 0,
  `retiroEnTienda` bool NOT NULL DEFAULT false,
  `fechaPublicacion` datetime DEFAULT (current_timestamp),
  FOREIGN KEY (`idModelo`) REFERENCES `modelo` (`idModelo`),
  FOREIGN KEY (`idVendedor`) REFERENCES `usuario` (`idUsuario`),
  FOREIGN KEY (`idTienda`) REFERENCES `tienda` (`idTienda`)
);  

-- Table: imagen (Images)
-- Purpose: Stores image URLs for users, products, and documents
-- Key Features: Can have images for buyer/seller profiles, product listings, or ownership docs
-- Related Tables: Links to usuario (user), documento (document), modelo (model)
-- Relationships: One-to-one with usuario (profile pics), many-to-one with documento and modelo
-- Note: One image per entity (user, document, or product model)
CREATE TABLE `imagen` (
  `idImagen` int PRIMARY KEY NOT NULL AUTO_INCREMENT,
  `idUsuario` int UNIQUE,
  `idDocumento` int,
  `idModelo` int,
  `url` varchar(255),
  FOREIGN KEY (`idUsuario`) REFERENCES `usuario` (`idUsuario`),
  FOREIGN KEY (`idDocumento`) REFERENCES `documento` (`idDocumento`),
  FOREIGN KEY (`idModelo`) REFERENCES `modelo` (`idModelo`),
  INDEX `imagen_modelo` (`idModelo`),
  INDEX `imagen_documento` (`idDocumento`),
  INDEX `imagen_usuario` (`idUsuario`)
);

-- Table: carrito (Shopping Carts/Orders)
-- Purpose: Represents shopping carts and order transactions
-- Key Features: Tracks payment status, MercadoPago integration (idPreferencia, idPago)
-- Fields: precioTotal (total price), direccionEnvio (shipping address), metodoPago (payment method)
-- Related Tables: Links to usuario (buyer and seller); referenced by carritoProducto (cart product)
-- Relationships: Many-to-one with usuario (both buyer and seller)
-- Note: States: pendiente_pago (pending payment) → pendiente_envio (pending shipment) → enviado (sent) → recibido (received) or fallido (failed)/reembolsado (refunded)
CREATE TABLE `carrito` (
  `idCarrito` int PRIMARY KEY NOT NULL AUTO_INCREMENT,
  `idPreferencia` varchar(255) UNIQUE,
  `idPago` varchar(255) UNIQUE,
  `idVendedor` int NOT NULL,
  `idComprador` int NOT NULL,
  `estado` ENUM('pendiente_pago', 'pendiente_envio', 'enviado', 'recibido', 'fallido', 'reembolsado') DEFAULT 'pendiente_pago',
  `metodoPago` varchar(45),
  `precioTotal` float,
  `fecha` datetime DEFAULT (current_timestamp),
  `direccionEnvio` varchar(255),
  FOREIGN KEY (`idVendedor`) REFERENCES `usuario`(`idUsuario`),
  FOREIGN KEY (`idComprador`) REFERENCES `usuario`(`idUsuario`),
  INDEX (`idPreferencia`)
);

-- Table: carritoProducto (Cart Items)
-- Purpose: Junction table linking products to shopping carts/orders
-- Key Features: Stores quantity per item; links to payment and preference IDs
-- Related Tables: Links to carrito (cart) and producto (product)
-- Relationships: Many-to-one with carrito and producto (one cart has many items, one product can be in many carts)
-- Note: This is the shopping cart items table - multiple products per cart
CREATE TABLE `carritoProducto` (
  `idCarritoProducto` int PRIMARY KEY NOT NULL AUTO_INCREMENT,
  `idCarrito` int NOT NULL,
  `idPago` varchar(255),
  `idPreferencia` varchar(255),
  `idProducto` int NOT NULL,
  `cantidad` int DEFAULT 1,
  `fecha` datetime DEFAULT (current_timestamp),
  FOREIGN KEY (`idCarrito`) REFERENCES `carrito` (`idCarrito`),
  FOREIGN KEY (`idPago`) REFERENCES `carrito` (`idPago`),
  FOREIGN KEY (`idPreferencia`) REFERENCES `carrito` (`idPreferencia`),
  FOREIGN KEY (`idProducto`) REFERENCES `producto` (`idProducto`)
);

-- Table: pregunta (Product Questions)
-- Purpose: Allows buyers to ask sellers questions about products
-- Key Features: Buyers can ask questions, sellers can respond
-- Related Tables: Links to producto (product) and usuario (user)
-- Relationships: Many-to-one with producto and usuario (users can ask multiple questions)
-- Note: Supports Q&A functionality between buyers and sellers
CREATE TABLE `pregunta` (
  `idPregunta` int PRIMARY KEY NOT NULL AUTO_INCREMENT,
  `idProducto` int NOT NULL,
  `idUsuario` int NOT NULL,
  `descripcion` varchar(255) NOT NULL,
  `respuesta` varchar(255),
  FOREIGN KEY (`idProducto`) REFERENCES `producto` (`idProducto`),
  FOREIGN KEY (`idUsuario`) REFERENCES `usuario` (`idUsuario`),
  INDEX `idProducto` (`idProducto`),
  INDEX `idUsuario` (`idUsuario`)
);

-- Table: calificacion (Ratings/Reviews)
-- Purpose: Stores product ratings and reviews from buyers
-- Key Features: Can rate products, sellers, or stores; includes comments and photos
-- Fields: nota (rating), comentario (comment), fecha (date)
-- Related Tables: Links to producto (product), usuario (buyer and seller), optional tienda (store)
-- Relationships: Many-to-one with producto, usuario (both buyer and seller), optional tienda
-- Note: Supports the review and rating system for products and sellers
CREATE TABLE `calificacion` (
  `idCalificacion` int PRIMARY KEY NOT NULL AUTO_INCREMENT,
  `idUsuarioComprador` int NOT NULL,
  `idUsuarioVendedor` int,
  `idProducto` int NOT NULL,
  `idTienda` int,
  `foto` varchar(255),
  `comentario` text,
  `nota` int,
  `fecha` datetime DEFAULT (current_timestamp),
  FOREIGN KEY (`idUsuarioComprador`) REFERENCES `usuario` (`idUsuario`),
  FOREIGN KEY (`idUsuarioVendedor`) REFERENCES `usuario` (`idUsuario`),
  FOREIGN KEY (`idProducto`) REFERENCES `producto` (`idProducto`),
  FOREIGN KEY (`idTienda`) REFERENCES `tienda` (`idTienda`),
  INDEX `idUsuarioComprador` (`idUsuarioComprador`),
  INDEX `fk_calificacion_usuario1_idx` (`idUsuarioVendedor`)
);

-- Table: mensaje (Messages)
-- Purpose: Stores messages between buyers and sellers related to specific cart items
-- Key Features: Buyers and sellers can communicate about orders/products
-- Related Tables: Links to usuario (sender and receiver) and carritoProducto (cart product)
-- Relationships: Many-to-one with usuario (both message sender and receiver) and carritoProducto
-- Note: Enables communication between users regarding specific cart items/orders
CREATE TABLE `mensaje` (
  `idMensaje` int PRIMARY KEY NOT NULL AUTO_INCREMENT,
  `idUsuarioEmisor` int NOT NULL,
  `idUsuarioReceptor` int NOT NULL,
  `idCarritoProducto` int NOT NULL,
  `contenido` text,
  `fecha` datetime,
  FOREIGN KEY (`idUsuarioEmisor`) REFERENCES `usuario` (`idUsuario`),
  FOREIGN KEY (`idUsuarioReceptor`) REFERENCES `usuario` (`idUsuario`),
  FOREIGN KEY (`idCarritoProducto`) REFERENCES `carritoProducto` (`idCarritoProducto`),
  INDEX `idUsuarioEmisor` (`idUsuarioEmisor`),
  INDEX `fk_mensaje_usuario1_idx` (`idUsuarioReceptor`)
);

-- ----------------------------------------------------------
-- Database Entries
-- ----------------------------------------------------------
-- Insert sample users
INSERT INTO `usuario` (`nombre`, `apellido`, `fechaNacimiento`, `rol`, `correo`, `direccionNombre`,`telefono`, `username`, `password`)
VALUES 
('John', 'Smith', '1985-05-15', 'comprador', 'john.smith@example.com', 'Street 123, City', '3001234567', 'johnsmith', '$2b$10$TbLwUaHLc9Pw6hEa8ZqojOgfzzEVjNuGOGLBezxVWTdU7W0r4weE.'),
('Sarah', 'Johnson', '1990-08-22', 'vendedor', 'sarah.johnson@example.com', 'Street 123, City', '3107654321', 'sarahj', '$2b$10$TbLwUaHLc9Pw6hEa8ZqojOgfzzEVjNuGOGLBezxVWTdU7W0r4weE.'),
('Michael', 'Williams', '1978-11-30', 'administrador', 'michael.williams@example.com', 'Street 10, City', '3209876543', 'michaelw', '$2b$10$TbLwUaHLc9Pw6hEa8ZqojOgfzzEVjNuGOGLBezxVWTdU7W0r4weE.');


INSERT INTO `usuario` VALUES
('4', 'Seller', 'Smith', '2003-07-15', 'vendedor', 'seller@example.com', '110382', 'Street 324, City', '48-50', '', '', 'Helsinki', '3001234567', 'mluukkai', '$2b$10$PqKSvdLV5aCgRAXZUSq8IuFcmdy6cyyoADJFFX4/HL7qhJ.XDajmS', '0', '2025-03-01 14:51:26', '2950485379', 'APP_USR-6292844536291010-102714-afebc269123c44f7d1c72086306883a4-2950485379', 'TG-68ffba35d5bea2000188f0d1-2950485379', 'APP_USR-c85d21a5-dfbb-4a28-bf0f-5f7e8299bb39'),
('5', 'Buyer', 'Smith', '2003-04-16', 'comprador', 'buyer@example.com', '110382', 'Street 324, City', '48-50', '', '','Bogotá', '3001234567', 'wisecod', '$2b$10$PqKSvdLV5aCgRAXZUSq8IuFcmdy6cyyoADJFFX4/HL7qhJ.XDajmS', '0', '2025-03-01 15:13:31', NULL, NULL, NULL, NULL);


-- Insert sample brands
-- Note: IDs are explicitly set to ensure foreign key references work correctly
INSERT INTO `marca` (`idMarca`, `nombre`)
VALUES 
(1, 'Trek'),
(2, 'Specialized'),
(3, 'Giant'),
(4, 'Shimano'),
(5, 'GW'),
(6, 'Colnago'),
(7, 'Cannondale'),
(8, 'Bontrager'),
(9, 'SRAM'),
(10, 'RockShox'),
(11, 'Fox Racing'),
(12, 'Maxxis'),
(13, 'Continental'),
(14, 'Schwalbe'),
(15, 'Race Face'),
(16, 'Crankbrothers'),
(17, 'Hope'),
(18, 'Magura');

-- Insert sample models
INSERT INTO `modelo` (`nombre`, `tipo`, `descripcion`, `categoria`, `compatibilidad`, `idMarca`)
VALUES 
-- Bicycles
('Trek Marlin 7', 'bicicleta', 'Trail mountain bike with quality components', 'MTB', 'Compatible with Shimano components', 1),
('Specialized Allez', 'bicicleta', 'Racing road bike for competitive riding', 'Carretera', 'Compatible with Shimano components', 2),
('Giant Defy Advanced', 'bicicleta', 'Endurance road bike with carbon frame', 'Carretera', 'Compatible with Shimano components', 3),
('Trek FX 3', 'bicicleta', 'Versatile fitness hybrid bike', 'Híbrida', 'Compatible with standard components', 1),
('Specialized Rockhopper', 'bicicleta', 'Entry-level mountain bike', 'MTB', 'Compatible with Shimano components', 2),

-- Drivetrains / Transmisión
('Shimano Deore XT Chainring', 'componente', 'MTB single chainring with 32T', 'Transmisión', 'Compatible with mountain bikes', 4),
('Shimano Altus Cassette', 'componente', '8-speed cassette for MTB', 'Transmisión', 'Compatible with 8-speed systems', 4),
('Shimano 105 Groupset', 'componente', '11-speed road groupset', 'Transmisión', 'Compatible with road bikes', 4),
('SRAM GX Eagle Derailleur', 'componente', '12-speed rear derailleur for MTB', 'Transmisión', 'Compatible with SRAM 12-speed', 9),
('SRAM NX Cassette', 'componente', '11-speed wide-range cassette', 'Transmisión', 'Compatible with SRAM 11-speed', 9),
('Shimano Deore Chain', 'componente', '10-speed MTB chain', 'Transmisión', 'Compatible with 10-speed systems', 4),
('SRAM PC-1110 Chain', 'componente', '11-speed chain for MTB and road', 'Transmisión', 'Compatible with 11-speed systems', 9),

-- Brakes / Frenos
('Shimano Deore Hydraulic Disc Brake', 'componente', 'Hydraulic disc brake set front and rear', 'Frenos', 'Compatible with all MTB', 4),
('Shimano BR-R7000 Caliper Brake', 'componente', 'Road bike caliper brake set', 'Frenos', 'Compatible with road bikes', 4),
('SRAM Level TLM Brake', 'componente', 'Trail hydraulic disc brake', 'Frenos', 'Compatible with MTB', 9),
('Magura MT5 Brake Set', 'componente', 'High-performance hydraulic disc brake', 'Frenos', 'Compatible with all bikes', 18),
('Hope Tech 3 E4 Brake', 'componente', 'Premium 4-piston hydraulic brake', 'Frenos', 'Compatible with MTB and e-bikes', 17),
('Generic V-Brake Pads', 'componente', 'Brake pads for rim brakes', 'Frenos', 'Compatible with any V-brake system', null),
('Shimano Resin Disc Brake Pads', 'componente', 'Replacement pads for disc brakes', 'Frenos', 'Compatible with Shimano disc brakes', 4),

-- Suspension / Suspensión
('RockShox Judy Silver TK', 'componente', '100mm travel air fork for XC', 'Suspensión', 'Compatible with MTB 29" or 27.5"', 10),
('RockShox Recon RL', 'componente', '120mm travel fork for trail riding', 'Suspensión', 'Compatible with MTB', 10),
('Fox 34 Float Performance', 'componente', '140mm travel fork for aggressive trail', 'Suspensión', 'Compatible with MTB 29"', 11),
('RockShox Deluxe Select+', 'componente', 'Rear shock for trail bikes', 'Suspensión', 'Compatible with full suspension MTB', 10),
('Fox Float DPS', 'componente', 'Lightweight rear shock', 'Suspensión', 'Compatible with XC and trail bikes', 11),

-- Handlebars / Manubrio
('Race Face Chester Handlebar', 'componente', 'Durable aluminum flat handlebar 780mm', 'Manubrio', 'Compatible with MTB', 15),
('Bontrager Elite Drop Bar', 'componente', 'Road bike drop handlebar 42cm', 'Manubrio', 'Compatible with road bikes', 8),
('Specialized S-Works Carbon Riser', 'componente', 'Lightweight carbon riser bar 760mm', 'Manubrio', 'Compatible with MTB', 2),
('Giant Contact SLR Aero Bar', 'componente', 'Aerodynamic drop bar for road', 'Manubrio', 'Compatible with road bikes', 3),
('Race Face Turbine R Handlebar', 'componente', 'Carbon fiber flat bar 785mm', 'Manubrio', 'Compatible with MTB', 15),

-- Tires / Neumáticos
('Maxxis Minion DHF 29x2.5', 'componente', 'Aggressive trail tire with excellent grip', 'Neumáticos', 'Compatible with 29" MTB', 12),
('Continental Grand Prix 5000 700x25', 'componente', 'High-performance road tire', 'Neumáticos', 'Compatible with road bikes', 13),
('Schwalbe Marathon Plus 26x1.75', 'componente', 'Puncture-proof touring tire', 'Neumáticos', 'Compatible with hybrid and city bikes', 14),
('Maxxis Ardent 27.5x2.4', 'componente', 'All-around trail tire', 'Neumáticos', 'Compatible with 27.5" MTB', 12),
('Continental Mountain King 26x2.2', 'componente', 'XC racing tire', 'Neumáticos', 'Compatible with 26" MTB', 13),
('Schwalbe G-One Speed 700x35', 'componente', 'Gravel racing tire', 'Neumáticos', 'Compatible with gravel and road bikes', 14),

-- Pedals / Pedales
('Shimano PD-M520 SPD', 'componente', 'Clipless MTB pedals', 'Pedales', 'Compatible with all MTB', 4),
('Crankbrothers Stamp 1', 'componente', 'Large platform flat pedals', 'Pedales', 'Compatible with all bikes', 16),
('Shimano PD-R7000 105', 'componente', 'Road clipless pedals', 'Pedales', 'Compatible with road bikes', 4),
('Race Face Chester Pedals', 'componente', 'Composite platform pedals', 'Pedales', 'Compatible with all bikes', 15),

-- Helmets / Casco
('Bontrager Starvos MIPS', 'accesorio', 'Road cycling helmet with MIPS protection', 'Casco', 'Universal fit', 8),
('Specialized Propero III', 'accesorio', 'Lightweight road helmet', 'Casco', 'Universal fit', 2),
('Giant Rev MIPS', 'accesorio', 'All-around cycling helmet', 'Casco', 'Universal fit', 3),
('Fox Speedframe Pro', 'accesorio', 'MTB helmet with extended coverage', 'Casco', 'MTB specific', 11),

-- Saddles / Sillín
('Bontrager Montrose Elite', 'componente', 'Comfortable trail saddle', 'Sillín', 'Compatible with all bikes', 8),
('Specialized Power Arc', 'componente', 'Performance road saddle', 'Sillín', 'Compatible with road bikes', 2),
('Giant Fleet SLR', 'componente', 'Lightweight racing saddle', 'Sillín', 'Compatible with road bikes', 3),

-- Other accessories
('Generic Bike Bell', 'accesorio', 'Standard bicycle bell', 'Accesorios', 'Universal fit', null),
('LED Bike Light Set', 'accesorio', 'Front and rear LED light set', 'Accesorios', 'Universal fit', null),
('Generic Inner Tube', 'componente', 'Universal bicycle inner tube for various wheel sizes', 'Neumáticos', 'Compatible with most bicycles', null);

-- Insert sample images (keeping existing images for first models, adding placeholders for new ones)
INSERT INTO `imagen` (`idUsuario`, `idModelo`, `url`)
VALUES 
(null, 1, 'https://res.cloudinary.com/drfmpnhaz/image/upload/v1739199906/ukc7nxqc5hm79o4utb39.png'),
(null, 2, 'https://res.cloudinary.com/drfmpnhaz/image/upload/v1739200194/qhvxoj4ggjp1qrdn1fpd.png'),
(null, 3, 'https://res.cloudinary.com/drfmpnhaz/image/upload/v1739200646/iyqe0j8piameldruninf.png'),
(null, 4, 'https://res.cloudinary.com/drfmpnhaz/image/upload/v1761693921/trek-fx-3---2025-iv-798681-2_u7vamz.png'),
(null, 5, 'https://res.cloudinary.com/drfmpnhaz/image/upload/v1761694216/specialized-specialized-rockhopper-29-comp-2024_bugp7w.webp'),
(null, 6, 'https://res.cloudinary.com/drfmpnhaz/image/upload/v1739201523/td7nvl10zjctewo5jgld.png'),
(null, 7, 'https://res.cloudinary.com/drfmpnhaz/image/upload/v1739201377/d10mnzoi5xp8ibs1apvm.png'),
(null, 8, 'https://res.cloudinary.com/drfmpnhaz/image/upload/v1761694261/498052-1-bbbd5d-large-1693226651_zrbakd.png'),
(null, 9, 'https://res.cloudinary.com/drfmpnhaz/image/upload/v1761694294/tensorgx_large_99cf6dfe-7854-404d-a4ef-da990ae4f9ab_uqfpez.png'),
(null, 10, 'https://res.cloudinary.com/drfmpnhaz/image/upload/v1761694808/sram-sram-pg-1230-cassette-nx-eagle-12-speeds-11-5_rr1hvf.png'),
(null, 11, 'https://res.cloudinary.com/drfmpnhaz/image/upload/v1761694488/s-l1600_-_2021-11-17T085924.596-removebg-preview_hemfw7.png'),
(null, 12, 'https://res.cloudinary.com/drfmpnhaz/image/upload/v1761694546/s-l1600__21_-removebg-preview_affrbu.png'),
(null, 13, 'https://res.cloudinary.com/drfmpnhaz/image/upload/v1761694625/ShimanoDeoreXTHydraulicBrakeLeverBL-M8100_Left_withBrakeCaliperBR-M8100_Front_8e1bac99-edd6-476e-a40c-0b8d750cf288_h3yzem.png'),
(null, 14, 'https://res.cloudinary.com/drfmpnhaz/image/upload/v1761694675/image-removebg-preview_33_06298793-dfd9-477f-9849-45b782b785c5_1080x_ords00.png'),
(null, 15, 'https://res.cloudinary.com/drfmpnhaz/image/upload/v1761694736/sram-sram-level-hydraulic-disc-brake_nmgczy.png'),
(null, 16, 'https://res.cloudinary.com/drfmpnhaz/image/upload/v1761694866/PimpMyMT5-600x354px_aggzzw.png'),
(null, 17, 'https://res.cloudinary.com/drfmpnhaz/image/upload/v1761695000/Untitled-design--49_oown9a.png'),
(null, 18, 'https://res.cloudinary.com/drfmpnhaz/image/upload/v1740430801/pxjassqtrzvnbrpovqur.png'),
(null, 19, 'https://res.cloudinary.com/drfmpnhaz/image/upload/v1761695115/ShimanoB-TypeB05S-RXResin_umusnp.png'),
(null, 20, 'https://res.cloudinary.com/drfmpnhaz/image/upload/v1761695200/c120mmblackfrontdv_beqh6d.png'),
(null, 21, 'https://res.cloudinary.com/drfmpnhaz/image/upload/v1761695241/c130mmblack3qdv_lq4gim.png'),
(null, 22, 'https://res.cloudinary.com/drfmpnhaz/image/upload/v1761695280/MY26_34SL__PS_E_Matte_GripSL_KaboltSL__2_Hero_1600x1600_vbtyfp.png'),
(null, 23, 'https://res.cloudinary.com/drfmpnhaz/image/upload/v1761695381/rs-sdlxc-sel-230x65-lnm-hb-ss-b1-c-3q-v-v02_rk4bb0.png'),
(null, 24, 'https://res.cloudinary.com/drfmpnhaz/image/upload/v1761695412/dps_performance_3_pos_standard_side_frscuh.png'),
(null, 25, 'https://res.cloudinary.com/drfmpnhaz/image/upload/v1761695445/original_2015_HBR35_CHESTER_RS_20mm_BLK_WHT_pytosd.png'),
(null, 26, 'https://res.cloudinary.com/drfmpnhaz/image/upload/v1761695488/13294_A_1_Elite_Road_Bar_Handlebar_tegp2d.png'),
(null, 27, 'https://res.cloudinary.com/drfmpnhaz/image/upload/v1761695536/21017-00_CMPNT_SW-CARBON-AEROFLY-BAR-25-RD-BAR_SATIN-CARBON_kgi4lp.png'),
(null, 28, 'https://res.cloudinary.com/drfmpnhaz/image/upload/v1761695582/GiantContactSLRAeroHandlebar440mmMy18Propel_ry9dqw.png'),
(null, 29, 'https://res.cloudinary.com/drfmpnhaz/image/upload/v1761695609/original_Handlebar_35mm_Turbine_R_820_RS20_Blue.png_etpjcg.png'),
(null, 30, 'https://res.cloudinary.com/drfmpnhaz/image/upload/v1761695680/Maxxis-Minion-DHF-29er-Tyre-Pushbikes_994x_hqfzmv.png'),
(null, 31, 'https://res.cloudinary.com/drfmpnhaz/image/upload/v1761695783/2a928571-064a-521e-906f-1eece315d15e_oygd1l.png'),
(null, 32, 'https://res.cloudinary.com/drfmpnhaz/image/upload/v1761695839/hs440_schwalbe_marathon-plus.png_q7bxsz.webp'),
(null, 33, 'https://res.cloudinary.com/drfmpnhaz/image/upload/v1761695875/bike-mtb-ardent-skw_taejf7.webp'),
(null, 34, 'https://res.cloudinary.com/drfmpnhaz/image/upload/v1761695973/100514_angle1_1000x1000-300x300_utlmxw_ljmkck.png'),
(null, 35, 'https://res.cloudinary.com/drfmpnhaz/image/upload/v1761696021/Schwalbe_G-One_Speed_V-guard_foldedae_1725021564_uusfiu.png'),
(null, 36, 'https://res.cloudinary.com/drfmpnhaz/image/upload/v1761696062/4_PD-M520SPDPEDALSBLACK_pykbqx.png'),
(null, 37, 'https://res.cloudinary.com/drfmpnhaz/image/upload/v1761696108/Stamp_1_small_purple-_1_1080x_jqez9f.png'),
(null, 38, 'https://res.cloudinary.com/drfmpnhaz/image/upload/v1761696148/10001031_Shimano_105_PD_R7000_Pedale_dio544.png'),
(null, 39, 'https://res.cloudinary.com/drfmpnhaz/image/upload/v1761696247/race-face-chester-pedal-376874-11_kxvhlf.png'),
(null, 40, 'https://res.cloudinary.com/drfmpnhaz/image/upload/v1761696282/CascoBontragerStarvosMips-7_720x_r9l4o4.png'),
(null, 41, 'https://res.cloudinary.com/drfmpnhaz/image/upload/v1761696331/specialized-propero-3-angi-ready_fpaxyl.png'),
(null, 42, 'https://res.cloudinary.com/drfmpnhaz/image/upload/v1761696358/image-f5775c69217a4c8d88528ba7b6a71244_jytkgt.png'),
(null, 43, 'https://res.cloudinary.com/drfmpnhaz/image/upload/v1761696391/25102001_1_nlt6zn.webp'),
(null, 44, 'https://res.cloudinary.com/drfmpnhaz/image/upload/v1761696462/14009_A_1_Montrose_Elite_Saddle_ym3wbn.png'),
(null, 45, 'https://res.cloudinary.com/drfmpnhaz/image/upload/v1761696506/27118-171_SDDL_SW-POWER-ARC-CARBON_RED_HERO_nnqdp6.png'),
(null, 46, 'https://res.cloudinary.com/drfmpnhaz/image/upload/v1761696580/adjustable-bicycle-seat-802743058-kev6w1hj_lc3p2x.png'),
(null, 47, 'https://res.cloudinary.com/drfmpnhaz/image/upload/v1761696643/BBBBBB-14D-MIXED_fta7aj_lsukon.png'),
(null, 48, 'https://res.cloudinary.com/drfmpnhaz/image/upload/v1761696691/L-HEBIKEFRR-1_eqj0yz.png'),
(null, 49, 'https://res.cloudinary.com/drfmpnhaz/image/upload/v1739203206/dgeumsxzyrlqv3kzqdw6.png');

-- Insert sample bicycles
INSERT INTO `bicicleta` (`tipoBicicleta`, `color`, `genero`, `edad`, `tamañoMarco`, `materialMarco`, `tamañoRueda`, `tipoFrenos`, `velocidades`, `suspension`, `transmision`, `tipoPedales`, `manubrio`, `pesoBicicleta`, `pesoMaximo`, `extras`, `tarjeta`)
VALUES 
('MTB', 'Negra', 'Unisex', 'Adulto', 'M', 'Aluminio', '29"', 'Disco', '21', 'Delantera', 'Shimano', 'Plataforma', 'Plano', 14.5, 120, 'Bottle cage, kickstand','https://res.cloudinary.com/drfmpnhaz/image/upload/v1741070744/dwktxnyvetrnhl5yowmg.jpg'),
('Carretera', 'Azul', 'Unisex', 'Adulto', 'L', 'Carbono', '28"', 'Caliper', '22', 'Ninguna', 'Shimano', 'Sin clip', 'Caída', 8.5, 100, 'Carbon seatpost', 'https://res.cloudinary.com/drfmpnhaz/image/upload/v1741070744/dwktxnyvetrnhl5yowmg.jpg'),
('Carretera', 'Azul', 'Unisex', 'Adulto', 'M', 'Carbono', '28"', 'Caliper', '22', 'Ninguna', 'Shimano', 'Sin clip', 'Caída', 8.5, 100, 'Lightweight wheels', 'https://res.cloudinary.com/drfmpnhaz/image/upload/v1741070744/dwktxnyvetrnhl5yowmg.jpg'),
('Híbrida', 'Gris', 'Unisex', 'Adulto', 'M', 'Aluminio', '28"', 'Disco', '24', 'Delantera', 'Shimano', 'Plataforma', 'Plano', 12.8, 130, 'Fenders, rear rack', null),
('MTB', 'Roja', 'Unisex', 'Adulto', 'S', 'Aluminio', '27.5"', 'Disco', '18', 'Delantera', 'Shimano', 'Plataforma', 'Plano', 13.5, 110, 'Bottle cage', null);

-- Insert sample stores
INSERT INTO `tienda` (`idUsuarioAdministrador`, `nombre`, `descripcion`, `telefono`)
VALUES 
(3, 'Bogotá Bike Shop', 'The best bicycle shop in Bogotá with quality bikes and components', '3001234567'),
(3, 'Mountain Riders Store', 'Specialized in mountain bikes and trail gear', '3105551234');

-- Insert sample documents (ownership records for bicycles)
INSERT INTO `documento` (`idModelo`, `idUsuario`, `tipo`, `descripcion`, `estado`, `fechaCompra`)
VALUES 
(1, 4, 'Ownership Card', 'Original purchase invoice for Trek Marlin 7 MTB', 'Activo', '2024-06-15'),
(2, 4, 'Ownership Card', 'Warranty documentation for Specialized Allez road bike', 'Activo', '2024-08-22'),
(3, 4, 'Ownership Card', 'Purchase receipt for Giant Defy Advanced', 'Activo', '2024-09-10');

-- Insert document images (images for ownership documents)
INSERT INTO `imagen` (`idUsuario`, `idDocumento`, `idModelo`, `url`)
VALUES 
(NULL, 1, NULL, 'https://res.cloudinary.com/drfmpnhaz/image/upload/v1741070744/dwktxnyvetrnhl5yowmg.jpg'),
(NULL, 2, NULL, 'https://res.cloudinary.com/drfmpnhaz/image/upload/v1741070744/dwktxnyvetrnhl5yowmg.jpg'),
(NULL, 3, NULL, 'https://res.cloudinary.com/drfmpnhaz/image/upload/v1741070744/dwktxnyvetrnhl5yowmg.jpg');

-- Insert sample products
INSERT INTO `producto` (`idModelo`, `idVendedor`, `idTienda`, `precio`, `precioCompleto`, `cantidad`,`ventas`, `estado`, `disponibilidad`, `costoEnvio`, `retiroEnTienda`)
VALUES 
-- Bicycles
(1, 4, null, 3000000, 3300000, 10, 0, 'nuevo', 'disponible', 0, false),
(2, 4, null, 2400000, 3000000, 5, 2, 'nuevo', 'disponible', 0, false),
(3, 4, null, 11000000, null, 3, 10, 'nuevo', 'disponible', 50000, false),
(4, 4, null, 1800000, null, 8, 3, 'nuevo', 'disponible', 45000, false),
(5, 4, null, 1500000, 1800000, 12, 5, 'nuevo', 'disponible', 40000, false),

-- Drivetrains
(6, 4, null, 290000, 300000, 20, 4, 'nuevo', 'disponible', 0, false),
(7, 4, null, 120000, null, 15, 8, 'nuevo', 'disponible', 0, false),
(8, 4, null, 1500000, null, 5, 2, 'nuevo', 'disponible', 15000, false),
(9, 4, null, 380000, 420000, 10, 6, 'nuevo', 'disponible', 10000, false),
(10, 4, null, 200000, 250000, 18, 3, 'nuevo', 'disponible', 8000, false),
(11, 4, null, 85000, null, 25, 12, 'nuevo', 'disponible', 0, false),
(12, 4, null, 95000, null, 20, 8, 'nuevo', 'disponible', 0, false),

-- Brakes
(13, 4, null, 450000, 500000, 15, 7, 'nuevo', 'disponible', 12000, false),
(14, 4, null, 180000, null, 12, 4, 'nuevo', 'disponible', 8000, false),
(15, 4, null, 380000, 420000, 10, 5, 'nuevo', 'disponible', 0, false),
(16, 4, null, 550000, 600000, 8, 3, 'nuevo', 'disponible', 0, false),
(17, 4, null, 780000, null, 5, 2, 'nuevo', 'disponible', 0, false),
(18, 4, null, 15000, null, 50, 25, 'nuevo', 'disponible', 3000, false),
(19, 4, null, 35000, 40000, 40, 18, 'nuevo', 'disponible', 3000, false),

-- Suspension
(20, 4, null, 1200000, 1400000, 8, 4, 'nuevo', 'disponible', 0, false),
(21, 4, null, 1500000, null, 6, 3, 'nuevo', 'disponible', 20000, false),
(22, 4, null, 2800000, null, 4, 1, 'nuevo', 'disponible', 0, false),
(23, 4, null, 1800000, 2000000, 5, 2, 'nuevo', 'disponible', 20000, false),
(24, 4, null, 2200000, null, 4, 1, 'nuevo', 'disponible', 20000, false),

-- Handlebars
(25, 4, null, 180000, null, 15, 8, 'nuevo', 'disponible', 8000, false),
(26, 4, null, 220000, 250000, 10, 5, 'nuevo', 'disponible', 0, false),
(27, 4, null, 450000, null, 6, 3, 'nuevo', 'disponible', 0, false),
(28, 4, null, 380000, null, 8, 4, 'nuevo', 'disponible', 0, false),
(29, 4, null, 520000, 580000, 5, 2, 'nuevo', 'disponible', 10000, false),

-- Tires
(30, 4, null, 145000, 160000, 30, 15, 'nuevo', 'disponible', 0, false),
(31, 4, null, 180000, null, 25, 12, 'nuevo', 'disponible', 0, false),
(32, 4, null, 120000, null, 35, 20, 'nuevo', 'disponible', 0, false),
(33, 4, null, 135000, 150000, 28, 14, 'nuevo', 'disponible', 0, false),
(34, 4, null, 110000, null, 30, 16, 'nuevo', 'disponible', 8000, false),
(35, 4, null, 155000, null, 22, 10, 'nuevo', 'disponible', 8000, false),

-- Pedals
(36, 4, null, 185000, 200000, 20, 10, 'nuevo', 'disponible', 8000, false),
(37, 4, null, 120000, null, 25, 15, 'nuevo', 'disponible', 0, false),
(38, 4, null, 280000, null, 15, 8, 'nuevo', 'disponible', 10000, false),
(39, 4, null, 95000, 110000, 30, 18, 'nuevo', 'disponible', 5000, false),

-- Helmets
(40, 4, null, 300000, 350000, 15, 8, 'nuevo', 'disponible', 10000, false),
(41, 4, null, 460000, 500000, 10, 5, 'nuevo', 'disponible', 0, false),
(42, 4, null, 280000, null, 12, 6, 'nuevo', 'disponible', 10000, false),
(43, 4, null, 380000, null, 8, 4, 'nuevo', 'disponible', 0, false),

-- Saddles
(44, 4, null, 220000, 250000, 18, 9, 'nuevo', 'disponible', 8000, false),
(45, 4, null, 380000, null, 10, 5, 'nuevo', 'disponible', 10000, false),
(46, 4, null, 450000, 500000, 8, 3, 'nuevo', 'disponible', 10000, false),

-- Accessories
(47, 4, null, 25000, null, 50, 30, 'nuevo', 'disponible', 0, false),
(48, 4, null, 85000, 95000, 35, 20, 'nuevo', 'disponible', 5000, false),

-- Inner Tube (Best Seller - Most Sold Product)
(49, 4, null, 5000, null, 100, 250, 'nuevo', 'disponible', 0, false);

-- Insert sample payments
INSERT INTO `carrito` (`idPreferencia`, `idPago`, `idVendedor`, `idComprador`, `estado`, `metodoPago`, `precioTotal`, `fecha`, `direccionEnvio`)
VALUES 
(1, 1, 2, 1, 'pendiente_pago', 'Tarjeta de Crédito', 1500.00, NOW(), 'Calle 123, Bogotá'),
(2, 2, 2, 2, 'pendiente_pago', 'PayPal', 800.00, NOW(), 'Carrera 45, Medellín'),
(3, 3, 2, 3, 'pendiente_pago', 'Tarjeta de Crédito', 1500.00, NOW(), 'Calle 123, Bogotá'),
(4, 4, 2, 1, 'pendiente_pago', 'Tarjeta de Crédito', 1500.00, NOW(), 'Calle 123, Bogotá'),
(5, 5, 2, 2, 'pendiente_pago', 'PayPal', 800.00, NOW(), 'Carrera 45, Medellín'),
(6, 6, 2, 3, 'pendiente_pago', 'Tarjeta de Crédito', 1500.00, NOW(), 'Calle 123, Bogotá'),
(7, 7, 2, 1, 'pendiente_pago', 'Tarjeta de Crédito', 1500.00, NOW(), 'Calle 123, Bogotá'),
(8, 8, 2, 2, 'pendiente_pago', 'PayPal', 800.00, NOW(), 'Carrera 45, Medellín'),
(9, 9, 2, 3, 'pendiente_pago', 'Tarjeta de Crédito', 1500.00, NOW(), 'Calle 123, Bogotá'),
(10, 10, 2, 1, 'pendiente_pago', 'Tarjeta de Crédito', 1500.00, NOW(), 'Calle 123, Bogotá');

-- Insert sample products of the cart
INSERT INTO `carritoProducto` (`idCarrito`,`idPago`, `idProducto`, `idPreferencia`, `cantidad`, `fecha`)
VALUES 
(1, 1, 1, 1, 2, NOW()),
(1, 2, 2, 2, 1, NOW()),
(1, 3, 3, 3, 1, NOW()),
(1, 4, 4, 4, 3, NOW()),
(1, 5, 5, 5, 2, NOW()),
(1, 6, 6, 6, 1, NOW()),
(1, 7, 7, 7, 2, NOW()),
(1, 8, 8, 8, 1, NOW()),
(1, 9, 9, 9, 1, NOW()),
(1, 10, 10, 10, 3, NOW());

-- Insert sample ratings
INSERT INTO `calificacion` (`idUsuarioComprador`, `idUsuarioVendedor`, `idProducto`, `idTienda`, `foto`, `comentario`, `nota`)
VALUES 
(2, 4, 1, 1, '', 'Excellent bicycle! Very satisfied with the purchase', 5),
(3, 4, 2, 1, '', 'Very satisfied with the quality', 4),
(1, 4, 2, 1, '', 'The bike is good but quite heavy', 3),
(2, 4, 10, null, null, 'Great product, been using it for three months without any flats', 5),
(3, 4, 10, null, null, 'Poor quality, got a flat on the first ride', 1),
(1, 4, 1, 1, '', 'Amazing bike for trail riding!', 5),
(2, 4, 2, 1, '', 'Very happy with this purchase', 4),
(3, 4, 2, 1, '', 'Good bike but a bit pricey', 3),
(2, 4, 13, null, null, 'Excellent braking power, very responsive', 5),
(3, 4, 20, null, null, 'Smooth suspension, great for trails', 5),
(1, 4, 25, null, null, 'Comfortable handlebar, good width', 4),
(2, 4, 30, null, null, 'Great tire, excellent grip on trails', 5),
(3, 4, 36, null, null, 'Perfect pedals for my riding style', 4),
(1, 4, 40, null, null, 'Good helmet, fits well and looks great', 5);

-- Insert sample messages
INSERT INTO `mensaje` (`idUsuarioEmisor`, `idUsuarioReceptor`, `idCarritoProducto`, `contenido`, `fecha`)
VALUES 
(1, 2, 1, 'Is the bicycle still available?', NOW()),
(2, 1, 2, 'Yes, it is still available.', NOW()),
(1, 2, 3, 'Can you ship to Cali?', NOW()),
(2, 1, 3, 'Yes, we ship nationwide.', NOW());

-- ----------------------------------------------------------
-- VIEWS
-- ----------------------------------------------------------
-- Views provide pre-joined, optimized queries for common operations:
-- - Combining multiple tables to show complete product information
-- - Calculating aggregations (averages, totals)
-- - Filtering by status (pending payments, completed orders)
-- Note: Views are read-only and automatically update when underlying tables change

-- View: vista_productos_carrito_usuario
-- Purpose: Shows all products in user shopping carts with related info
-- Joins: carrito + usuario + carritoProducto + producto + modelo
DROP VIEW IF EXISTS vista_productos_carrito_usuario;
CREATE VIEW vista_productos_carrito_usuario AS
SELECT 
    usuario.idUsuario,
    usuario.nombre as usuario,
    usuario.correo,
    carrito.idCarrito,
    carrito.fecha,
    carrito.precioTotal,
    carritoProducto.idCarritoProducto,
    carritoProducto.idProducto,
    carritoProducto.cantidad,
    carritoProducto.idPago,
    carritoProducto.idPreferencia,
    producto.idModelo,
    producto.costoEnvio,
    modelo.nombre
FROM 
    carrito
JOIN 
    usuario ON carrito.idComprador = usuario.idUsuario
JOIN 
    carritoProducto ON carritoProducto.idPago = carrito.idPago
JOIN 
    producto ON producto.idProducto = carritoProducto.idProducto
JOIN 
    modelo ON modelo.idModelo = producto.idModelo
WHERE  
    carrito.estado = 'pendiente_pago'
ORDER BY 
    carrito.fecha DESC;


-- View: vista_completa_producto
-- Purpose: Complete product information including specs, brand, seller, and images
-- Joins: producto + modelo + bicicleta + marca + imagen + usuario (seller)
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
    producto.exposicion,
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
    bicicleta.tarjeta,
    marca.idMarca,
    marca.nombre AS nombreMarca,
    imagen.idImagen,
    imagen.url AS imagenURL,
    usuario.idUsuario AS idVendedor,
    usuario.nombre AS nombreVendedor,
    usuario.apellido AS apellidoVendedor,
    usuario.correo AS correoVendedor,
    usuario.telefono AS telefonoVendedor,
    imagen_vendedor.url AS fotoVendedor
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
LEFT JOIN 
    imagen AS imagen_vendedor ON usuario.idUsuario = imagen_vendedor.idUsuario
ORDER BY 
    producto.ventas DESC;

-- View: vista_producto_calificacion
-- Purpose: Product ratings with detailed review information
-- Joins: producto + modelo + marca + calificacion
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
    calificacion.foto,
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

-- View: vista_producto_calificacion_promedio
-- Purpose: Products with average ratings calculated across all reviews
-- Joins: producto + modelo + marca + calificacion (with AVG aggregation)
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

-- View: vista_compras_pendientes
-- Purpose: Pending purchases awaiting payment processing
-- Joins: usuario + carrito + carritoProducto
CREATE VIEW vista_compras_pendientes AS
SELECT 
    usuario.idUsuario,
    usuario.nombre,
    usuario.correo,
    carrito.idCarrito,
    carrito.fecha,
    carrito.precioTotal,
    carritoProducto.idCarritoProducto,
    carritoProducto.idProducto,
    carritoProducto.cantidad,
    carritoProducto.idPago,
    carritoProducto.idPreferencia,
    carrito.estado AS estadoCarrito,
    carrito.metodoPago,
    carrito.precioTotal AS precioCarrito,
    carrito.direccionEnvio
FROM 
    usuario
JOIN 
    carrito ON usuario.idUsuario = carrito.idVendedor
JOIN 
    carritoProducto ON carrito.idPago = carritoProducto.idPago
WHERE 
    carrito.estado = 'pendiente_pago'
ORDER BY 
    carrito.fecha DESC;

DROP VIEW IF EXISTS vista_compras_usuario;

-- View: vista_compras_usuario
-- Purpose: Complete purchase history for buyers
-- Joins: usuario + carrito + carritoProducto + producto + modelo + marca + imagen
CREATE VIEW vista_compras_usuario AS
SELECT 
    usuario.idUsuario,
    usuario.nombre,
    usuario.apellido,
    usuario.correo,
    carrito.idCarrito,
    carrito.fecha,
    carrito.precioTotal,
    carritoProducto.idCarritoProducto,
    carritoProducto.idProducto,
    carritoProducto.cantidad,
    producto.precio AS precioProducto,
    producto.estado AS estadoProducto,
    producto.disponibilidad AS disponibilidadProducto,
    modelo.nombre AS nombreModelo,
    modelo.tipo AS tipoModelo,
    modelo.descripcion AS descripcionModelo,
    marca.nombre AS nombreMarca,
    imagen.url AS imagenModelo,
    carrito.estado AS estadoCarrito,
    carrito.metodoPago,
    carrito.precioTotal AS precioCarrito,
    carrito.direccionEnvio
FROM 
    usuario
JOIN 
    carrito ON usuario.idUsuario = carrito.idComprador
JOIN 
    carritoProducto ON carrito.idCarrito = carritoProducto.idCarrito
JOIN 
    producto ON carritoProducto.idProducto = producto.idProducto
JOIN 
    modelo ON producto.idModelo = modelo.idModelo
LEFT JOIN 
    marca ON modelo.idMarca = marca.idMarca
LEFT JOIN 
    imagen ON modelo.idModelo = imagen.idModelo
ORDER BY 
    carrito.fecha DESC;

DROP VIEW IF EXISTS vista_ventas_usuario;

-- View: vista_ventas_usuario
-- Purpose: Sales information for sellers
-- Joins: carrito + carritoProducto + producto + usuario (seller)
CREATE VIEW vista_ventas_usuario AS
SELECT 
    carrito.idCarrito,
    carrito.fecha,
    carrito.precioTotal,
    carritoProducto.idProducto,
    carritoProducto.idPago,
    carritoProducto.idPreferencia,
    producto.idVendedor,
    usuario.nombre AS nombreVendedor,
    usuario.apellido AS apellidoVendedor,
    usuario.correo AS correoVendedor
FROM 
    carrito
JOIN 
    carritoProducto ON carrito.idPago = carritoProducto.idPago
JOIN 
    producto ON carritoProducto.idProducto = producto.idProducto
JOIN 
    usuario ON producto.idVendedor = usuario.idUsuario
ORDER BY 
    carrito.fecha DESC;

DROP VIEW IF EXISTS vista_calificaciones_productos_vendedor;

-- View: vista_calificaciones_productos_vendedor
-- Purpose: Ratings received by sellers with buyer and product information
-- Joins: usuario (seller) + calificacion + usuario (buyer) + imagen for both
CREATE VIEW vista_calificaciones_productos_vendedor AS
SELECT 
    u.idUsuario,
    u.nombre,
    u.apellido,
    u.correo,
    u.fechaRegistro,
    u.reporte,
    c.idCalificacion,
    c.idUsuarioComprador,
    c.idUsuarioVendedor,
    c.idProducto,
    c.idTienda,
    c.foto,
    c.comentario,
    c.nota,
    c.fecha,
    iv.url AS imagenVendedor,
    ic.url AS imagenComprador,
    cu.nombre AS nombreComprador,
    cu.apellido AS apellidoComprador
FROM 
    usuario u
LEFT JOIN 
    calificacion c ON u.idUsuario = c.idUsuarioVendedor 
LEFT JOIN 
    usuario cu ON cu.idUsuario = c.idUsuarioComprador
LEFT JOIN 
    imagen iv ON iv.idUsuario = u.idUsuario
LEFT JOIN 
    imagen ic ON ic.idUsuario = c.idUsuarioComprador;

-- Vista de productos asociados a un carrito
DROP VIEW IF EXISTS vista_productos_carrito;

-- View: vista_productos_carrito
-- Purpose: All products in shopping carts with complete details
-- Joins: carrito + carritoProducto + producto + modelo + marca + imagen
CREATE VIEW vista_productos_carrito AS
SELECT 
    carrito.idCarrito,
    carrito.idComprador,
    producto.idVendedor,
    carrito.estado,
    carrito.fecha,
    carrito.precioTotal,
    carritoProducto.idCarritoProducto,
    carritoProducto.idProducto,
    carritoProducto.cantidad,
    producto.idModelo,
    producto.precio,
    producto.precioCompleto,
    producto.cantidad AS cantidadProducto,
    producto.ventas,
    producto.estado AS estadoProducto,
    producto.disponibilidad,
    producto.costoEnvio,
    producto.retiroEnTienda,
    producto.fechaPublicacion,
    modelo.nombre AS nombreModelo,
    modelo.tipo AS tipoModelo,
    modelo.descripcion AS descripcionModelo,
    modelo.categoria AS categoriaModelo,
    modelo.compatibilidad AS compatibilidadModelo,
    marca.nombre AS nombreMarca,
    imagen.url AS imagenModelo
FROM 
    carrito
JOIN 
    carritoProducto ON carrito.idCarrito = carritoProducto.idCarrito
JOIN 
    producto ON carritoProducto.idProducto = producto.idProducto
JOIN 
    modelo ON producto.idModelo = modelo.idModelo
LEFT JOIN 
    marca ON modelo.idMarca = marca.idMarca
LEFT JOIN 
    imagen ON modelo.idModelo = imagen.idModelo
WHERE
    carrito.estado = 'pendiente_pago'
ORDER BY 
    carrito.fecha DESC;


-- ----------------------------------------------
-- Stored procedures
-- ----------------------------------------------

DELIMITER //

-- Change cart status procedure
CREATE PROCEDURE cambiarEstadoCarrito(
    IN p_idCarrito INT,
    IN p_nuevoEstado ENUM('pendiente', 'exitosa', 'fallida')
)
BEGIN
    -- Update the cart status
    UPDATE carrito
    SET estado = p_nuevoEstado
    WHERE idCarrito = p_idCarrito;

    -- Verify if the update was successful
    IF ROW_COUNT() = 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'No se encontró el carrito o no se pudo actualizar el estado';
    END IF;
END //

DELIMITER ;
