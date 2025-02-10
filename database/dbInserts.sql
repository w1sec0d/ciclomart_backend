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
('Giant');

-- Insertar modelos de muestra
INSERT INTO `modelo` (`nombre`, `tipo`, `descripcion`, `categoria`, `compatibilidad`, `idMarca`)
VALUES 
('Trek Marlin 7', 'bicicleta', 'Bicicleta de montaña para senderos', 'MTB', 'Compatible con componentes Shimano', 1),
('Specialized Allez', 'bicicleta', 'Bicicleta de carretera para carreras', 'Carretera', 'Compatible con componentes Shimano', 2),
('Giant Defy Advanced', 'bicicleta', 'Bicicleta de carretera de resistencia', 'Carretera', 'Compatible con componentes Shimano', 3);

-- Insertar imágenes de muestra
INSERT INTO `imagen` (`idUsuario`, `idModelo`, `url`)
VALUES 
(1, 1, ''),
(2, 2, ''),
(3, 3, '');

-- Insertar bicicletas de muestra
INSERT INTO `bicicleta` (`tipoBicicleta`, `color`, `genero`, `edad`, `tamañoMarco`, `materialMarco`, `tamañoRueda`, `tipoFrenos`, `velocidades`, `suspension`, `transmision`, `tipoPedales`, `manubrio`, `pesoBicicleta`, `pesoMaximo`, `extras`)
VALUES 
('MTB', 'Rojo', 'Unisex', 'Adulto', 'M', 'Aluminio', '29"', 'Disco', '21', 'Delantera', 'Shimano', 'Plataforma', 'Plano', 14.5, 120, 'Portabotellas'),
('Carretera', 'Azul', 'Unisex', 'Adulto', 'L', 'Carbono', '28"', 'Caliper', '22', 'Ninguna', 'Shimano', 'Sin clip', 'Caída', 8.5, 100, 'Ninguno');

-- Insertar tiendas de muestra
INSERT INTO `tienda` (`idUsuarioAdministrador`, `nombre`, `descripcion`, `telefono`)
VALUES 
(3, 'Tienda de Bicis Bogotá', 'La mejor tienda de bicicletas en Bogotá', '3001234567');

-- Insertar carritos de muestra
INSERT INTO `carrito` (`idUsuario`, `cantidadProductos`, `precioTotal`, `fecha`, `estado`, `metodoPago`, `direccionEnvio`, `descuento`)
VALUES 
(1, 2, 1500.00, NOW(), 'pendiente', 'Tarjeta de Crédito', 'Calle 123, Bogotá', 0),
(2, 1, 800.00, NOW(), 'pendiente', 'PayPal', 'Carrera 45, Medellín', 0);

-- Insertar productos de muestra
INSERT INTO `producto` (`idModelo`, `idVendedor`, `idTienda`, `precio`, `precioCompleto`, `cantidad`, `estado`, `disponibilidad`, `costoEnvio`, `retiroEnTienda`)
VALUES 
(1, 1, 1, 750.00, 800.00, 10, 'nuevo', 'disponible', 50.00, false),
(2, 2, 1, 750.00, 800.00, 5, 'nuevo', 'disponible', 50.00, false),
(3, 3, 1, 800.00, 850.00, 3, 'nuevo', 'disponible', 50.00, false);

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
(2, 3, 2, 1, '', 'Muy satisfecho', 4);

-- Insertar mensajes de muestra
INSERT INTO `mensaje` (`idUsuarioEmisor`, `idUsuarioReceptor`, `idCarritoProducto`, `contenido`, `fecha`)
VALUES 
(1, 2, 1, '¿La bicicleta sigue disponible?', NOW()),
(2, 1, 2, 'Sí, todavía está disponible.', NOW());
