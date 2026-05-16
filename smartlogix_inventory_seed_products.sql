-- SmartLogix inventory seed data for MySQL/MariaDB.
-- Run after creating the smartlogix schema and the products/inventory tables.

USE smartlogix;

START TRANSACTION;

-- Products are upserted by SKU so the script can be executed more than once.
INSERT INTO products (
  id,
  sku,
  name,
  description,
  unit_price,
  category,
  is_active
) VALUES
  (UUID(), 'SLX-ELE-001', 'Smartphone Nova X1 128GB', 'Telefono Android 128GB con pantalla AMOLED y doble SIM', 249990.00, 'Electronica', b'1'),
  (UUID(), 'SLX-ELE-002', 'Notebook ProBook 14 Ryzen 5', 'Notebook 14 pulgadas con 16GB RAM y SSD 512GB', 579990.00, 'Electronica', b'1'),
  (UUID(), 'SLX-ELE-003', 'Audifonos Bluetooth AirBeat', 'Audifonos inalambricos con cancelacion de ruido', 49990.00, 'Electronica', b'1'),
  (UUID(), 'SLX-ELE-004', 'Monitor LED 24 Full HD', 'Monitor de escritorio Full HD con entrada HDMI', 119990.00, 'Electronica', b'1'),
  (UUID(), 'SLX-ELE-005', 'Teclado mecanico RGB', 'Teclado mecanico switch blue con iluminacion RGB', 39990.00, 'Electronica', b'1'),
  (UUID(), 'SLX-ELE-006', 'Mouse ergonomico vertical', 'Mouse optico vertical para trabajo prolongado', 22990.00, 'Electronica', b'1'),
  (UUID(), 'SLX-ELE-007', 'Cargador USB-C 65W', 'Cargador rapido USB-C compatible con notebook y smartphone', 24990.00, 'Electronica', b'1'),
  (UUID(), 'SLX-ELE-008', 'Power bank 20000 mAh', 'Bateria externa de alta capacidad con carga rapida', 34990.00, 'Electronica', b'1'),

  (UUID(), 'SLX-HOG-001', 'Set sabanas king algodon', 'Juego de sabanas king de algodon suave', 32990.00, 'Hogar', b'1'),
  (UUID(), 'SLX-HOG-002', 'Freidora de aire 5L', 'Freidora de aire digital con canasto antiadherente', 74990.00, 'Hogar', b'1'),
  (UUID(), 'SLX-HOG-003', 'Aspiradora ciclonica 1800W', 'Aspiradora compacta con filtro lavable', 89990.00, 'Hogar', b'1'),
  (UUID(), 'SLX-HOG-004', 'Organizador modular cocina', 'Organizador plastico apilable para despensa', 9990.00, 'Hogar', b'1'),
  (UUID(), 'SLX-HOG-005', 'Lampara escritorio LED', 'Lampara LED regulable con brazo flexible', 18990.00, 'Hogar', b'1'),
  (UUID(), 'SLX-HOG-006', 'Cortinas blackout 140x220', 'Par de cortinas blackout para dormitorio o living', 29990.00, 'Hogar', b'1'),
  (UUID(), 'SLX-HOG-007', 'Set toallas 6 piezas', 'Set de toallas de bano y mano en algodon', 26990.00, 'Hogar', b'1'),
  (UUID(), 'SLX-HOG-008', 'Cafetera italiana 6 tazas', 'Cafetera moka de aluminio para cocina', 15990.00, 'Hogar', b'1'),

  (UUID(), 'SLX-OFI-001', 'Silla ergonomica oficina', 'Silla ajustable con soporte lumbar y apoyabrazos', 139990.00, 'Oficina', b'1'),
  (UUID(), 'SLX-OFI-002', 'Escritorio compacto 120 cm', 'Escritorio de melamina para home office', 84990.00, 'Oficina', b'1'),
  (UUID(), 'SLX-OFI-003', 'Pack 10 cuadernos universitarios', 'Cuadernos universitarios cuadriculados de 100 hojas', 14990.00, 'Oficina', b'1'),
  (UUID(), 'SLX-OFI-004', 'Resma papel carta 500 hojas', 'Papel carta blanco para impresora y fotocopia', 5490.00, 'Oficina', b'1'),
  (UUID(), 'SLX-OFI-005', 'Impresora multifuncional WiFi', 'Impresora tinta continua con escaner y WiFi', 159990.00, 'Oficina', b'1'),
  (UUID(), 'SLX-OFI-006', 'Archivador lomo ancho', 'Archivador de palanca tamano oficio', 3990.00, 'Oficina', b'1'),

  (UUID(), 'SLX-DEP-001', 'Bicicleta mountain bike aro 29', 'Bicicleta MTB con frenos de disco y marco aluminio', 249990.00, 'Deporte', b'1'),
  (UUID(), 'SLX-DEP-002', 'Mat yoga antideslizante', 'Colchoneta de yoga 6 mm con textura antideslizante', 12990.00, 'Deporte', b'1'),
  (UUID(), 'SLX-DEP-003', 'Set mancuernas ajustables 20kg', 'Par de mancuernas ajustables para entrenamiento en casa', 69990.00, 'Deporte', b'1'),
  (UUID(), 'SLX-DEP-004', 'Balon futbol profesional', 'Balon de futbol numero 5 costura reforzada', 19990.00, 'Deporte', b'1'),
  (UUID(), 'SLX-DEP-005', 'Zapatillas running hombre', 'Zapatillas livianas para entrenamiento diario', 54990.00, 'Deporte', b'1'),
  (UUID(), 'SLX-DEP-006', 'Botella deportiva 1L', 'Botella reutilizable con marcador de capacidad', 7990.00, 'Deporte', b'1'),

  (UUID(), 'SLX-MOD-001', 'Polera basica unisex', 'Polera de algodon cuello redondo disponible en varios colores', 7990.00, 'Moda', b'1'),
  (UUID(), 'SLX-MOD-002', 'Jeans slim fit mujer', 'Jeans elasticado de tiro medio corte slim', 29990.00, 'Moda', b'1'),
  (UUID(), 'SLX-MOD-003', 'Chaqueta impermeable outdoor', 'Chaqueta liviana resistente al agua y viento', 59990.00, 'Moda', b'1'),
  (UUID(), 'SLX-MOD-004', 'Mochila urbana 25L', 'Mochila con compartimento para notebook y bolsillo frontal', 34990.00, 'Moda', b'1'),
  (UUID(), 'SLX-MOD-005', 'Cinturon cuero sintetico', 'Cinturon formal ajustable color negro', 9990.00, 'Moda', b'1'),
  (UUID(), 'SLX-MOD-006', 'Pack calcetines deportivos', 'Pack de 6 pares de calcetines respirables', 8990.00, 'Moda', b'1'),

  (UUID(), 'SLX-BEL-001', 'Secador pelo ionico 2200W', 'Secador con tecnologia ionica y boquilla concentradora', 39990.00, 'Belleza', b'1'),
  (UUID(), 'SLX-BEL-002', 'Plancha pelo ceramica', 'Plancha alisadora con placas ceramicas y temperatura regulable', 29990.00, 'Belleza', b'1'),
  (UUID(), 'SLX-BEL-003', 'Crema hidratante facial', 'Crema facial para uso diario con acido hialuronico', 12990.00, 'Belleza', b'1'),
  (UUID(), 'SLX-BEL-004', 'Set brochas maquillaje', 'Set de brochas sinteticas para rostro y ojos', 15990.00, 'Belleza', b'1'),
  (UUID(), 'SLX-BEL-005', 'Perfume floral 100ml', 'Fragancia floral de uso diario en formato 100ml', 24990.00, 'Belleza', b'1'),

  (UUID(), 'SLX-ALI-001', 'Cafe grano premium 1kg', 'Cafe de grano tostado medio para espresso o prensa', 18990.00, 'Alimentos', b'1'),
  (UUID(), 'SLX-ALI-002', 'Aceite oliva extra virgen 500ml', 'Aceite de oliva extra virgen botella de vidrio', 6990.00, 'Alimentos', b'1'),
  (UUID(), 'SLX-ALI-003', 'Pack barritas cereal 12 unidades', 'Barritas de cereal con avena y frutos secos', 9990.00, 'Alimentos', b'1'),
  (UUID(), 'SLX-ALI-004', 'Miel natural 1kg', 'Miel pura en formato familiar', 8490.00, 'Alimentos', b'1'),
  (UUID(), 'SLX-ALI-005', 'Mix frutos secos 500g', 'Mezcla de almendras, nueces, pasas y mani', 10990.00, 'Alimentos', b'1'),

  (UUID(), 'SLX-MAS-001', 'Alimento perro adulto 15kg', 'Alimento seco para perro adulto raza mediana', 38990.00, 'Mascotas', b'1'),
  (UUID(), 'SLX-MAS-002', 'Alimento gato indoor 3kg', 'Alimento seco para gato indoor sabor pollo', 18990.00, 'Mascotas', b'1'),
  (UUID(), 'SLX-MAS-003', 'Cama mascota lavable M', 'Cama acolchada lavable para perro o gato', 24990.00, 'Mascotas', b'1'),
  (UUID(), 'SLX-MAS-004', 'Arena sanitaria aglomerante 10kg', 'Arena para gato con control de olor', 12990.00, 'Mascotas', b'1'),
  (UUID(), 'SLX-MAS-005', 'Correa retratil 5m', 'Correa retratil para paseo de mascotas', 9990.00, 'Mascotas', b'1'),

  (UUID(), 'SLX-HER-001', 'Taladro percutor 650W', 'Taladro electrico con funcion percutor y velocidad variable', 44990.00, 'Herramientas', b'1'),
  (UUID(), 'SLX-HER-002', 'Set destornilladores 24 piezas', 'Set de destornilladores y puntas magneticas', 14990.00, 'Herramientas', b'1'),
  (UUID(), 'SLX-HER-003', 'Caja herramientas 16 pulgadas', 'Caja organizadora plastica con bandeja interior', 11990.00, 'Herramientas', b'1'),
  (UUID(), 'SLX-HER-004', 'Guantes seguridad anticorte', 'Par de guantes de trabajo con proteccion anticorte', 6990.00, 'Herramientas', b'1'),
  (UUID(), 'SLX-HER-005', 'Linterna recargable LED', 'Linterna LED recargable con tres modos de luz', 12990.00, 'Herramientas', b'1'),

  (UUID(), 'SLX-JAR-001', 'Macetero ceramico mediano', 'Macetero decorativo de ceramica para interior', 8990.00, 'Jardin', b'1'),
  (UUID(), 'SLX-JAR-002', 'Sustrato universal 20L', 'Tierra preparada para plantas de interior y exterior', 5990.00, 'Jardin', b'1'),
  (UUID(), 'SLX-JAR-003', 'Manguera reforzada 20m', 'Manguera de jardin reforzada con conectores', 18990.00, 'Jardin', b'1'),
  (UUID(), 'SLX-JAR-004', 'Set herramientas jardin', 'Set de pala, rastrillo y trasplantador', 12990.00, 'Jardin', b'1'),
  (UUID(), 'SLX-JAR-005', 'Fertilizante plantas verdes 1L', 'Fertilizante liquido para plantas verdes', 6990.00, 'Jardin', b'1'),

  (UUID(), 'SLX-AUT-001', 'Cargador auto USB dual', 'Cargador para auto con dos puertos USB', 7990.00, 'Automotriz', b'1'),
  (UUID(), 'SLX-AUT-002', 'Soporte celular auto', 'Soporte ajustable para tablero o parabrisas', 9990.00, 'Automotriz', b'1'),
  (UUID(), 'SLX-AUT-003', 'Compresor aire portatil', 'Compresor 12V para neumaticos con manometro digital', 29990.00, 'Automotriz', b'1'),
  (UUID(), 'SLX-AUT-004', 'Kit limpieza auto', 'Kit con shampoo, cera, pano microfibra y aplicador', 19990.00, 'Automotriz', b'1'),

  (UUID(), 'SLX-JUG-001', 'Bloques construccion 500 piezas', 'Set de bloques de construccion compatibles', 24990.00, 'Juguetes', b'1'),
  (UUID(), 'SLX-JUG-002', 'Puzzle 1000 piezas paisaje', 'Puzzle de 1000 piezas con imagen de paisaje', 12990.00, 'Juguetes', b'1'),
  (UUID(), 'SLX-JUG-003', 'Auto control remoto 4x4', 'Vehiculo a control remoto con bateria recargable', 34990.00, 'Juguetes', b'1'),
  (UUID(), 'SLX-JUG-004', 'Juego mesa estrategia familiar', 'Juego de mesa para 2 a 6 jugadores', 21990.00, 'Juguetes', b'1')
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  description = VALUES(description),
  unit_price = VALUES(unit_price),
  category = VALUES(category),
  is_active = VALUES(is_active),
  updated_at = CURRENT_TIMESTAMP(6);

-- Inventory rows are linked to products by SKU, preserving the product UUIDs.
INSERT INTO inventory (
  id,
  product_id,
  stock_available,
  stock_reserved,
  warehouse_location,
  reorder_point
)
SELECT
  UUID(),
  p.id,
  seed.stock_available,
  seed.stock_reserved,
  seed.warehouse_location,
  seed.reorder_point
FROM (
  SELECT 'SLX-ELE-001' AS sku, 45 AS stock_available, 3 AS stock_reserved, 'A1-R01-B01' AS warehouse_location, 8 AS reorder_point UNION ALL
  SELECT 'SLX-ELE-002', 18, 2, 'A1-R01-B02', 5 UNION ALL
  SELECT 'SLX-ELE-003', 72, 6, 'A1-R02-B01', 12 UNION ALL
  SELECT 'SLX-ELE-004', 30, 1, 'A1-R02-B02', 6 UNION ALL
  SELECT 'SLX-ELE-005', 55, 4, 'A1-R03-B01', 10 UNION ALL
  SELECT 'SLX-ELE-006', 80, 5, 'A1-R03-B02', 15 UNION ALL
  SELECT 'SLX-ELE-007', 110, 8, 'A1-R04-B01', 20 UNION ALL
  SELECT 'SLX-ELE-008', 60, 7, 'A1-R04-B02', 12 UNION ALL

  SELECT 'SLX-HOG-001', 36, 2, 'B1-R01-C01', 8 UNION ALL
  SELECT 'SLX-HOG-002', 24, 1, 'B1-R01-C02', 5 UNION ALL
  SELECT 'SLX-HOG-003', 16, 0, 'B1-R02-C01', 4 UNION ALL
  SELECT 'SLX-HOG-004', 140, 10, 'B1-R02-C02', 25 UNION ALL
  SELECT 'SLX-HOG-005', 70, 4, 'B1-R03-C01', 12 UNION ALL
  SELECT 'SLX-HOG-006', 42, 3, 'B1-R03-C02', 8 UNION ALL
  SELECT 'SLX-HOG-007', 58, 5, 'B1-R04-C01', 10 UNION ALL
  SELECT 'SLX-HOG-008', 64, 4, 'B1-R04-C02', 12 UNION ALL

  SELECT 'SLX-OFI-001', 20, 1, 'C1-R01-D01', 4 UNION ALL
  SELECT 'SLX-OFI-002', 14, 0, 'C1-R01-D02', 3 UNION ALL
  SELECT 'SLX-OFI-003', 95, 7, 'C1-R02-D01', 18 UNION ALL
  SELECT 'SLX-OFI-004', 180, 20, 'C1-R02-D02', 40 UNION ALL
  SELECT 'SLX-OFI-005', 12, 1, 'C1-R03-D01', 3 UNION ALL
  SELECT 'SLX-OFI-006', 130, 8, 'C1-R03-D02', 25 UNION ALL

  SELECT 'SLX-DEP-001', 10, 0, 'D1-R01-E01', 2 UNION ALL
  SELECT 'SLX-DEP-002', 85, 5, 'D1-R01-E02', 15 UNION ALL
  SELECT 'SLX-DEP-003', 22, 2, 'D1-R02-E01', 4 UNION ALL
  SELECT 'SLX-DEP-004', 64, 6, 'D1-R02-E02', 12 UNION ALL
  SELECT 'SLX-DEP-005', 38, 4, 'D1-R03-E01', 8 UNION ALL
  SELECT 'SLX-DEP-006', 115, 9, 'D1-R03-E02', 20 UNION ALL

  SELECT 'SLX-MOD-001', 210, 18, 'E1-R01-F01', 35 UNION ALL
  SELECT 'SLX-MOD-002', 74, 6, 'E1-R01-F02', 15 UNION ALL
  SELECT 'SLX-MOD-003', 33, 3, 'E1-R02-F01', 7 UNION ALL
  SELECT 'SLX-MOD-004', 46, 4, 'E1-R02-F02', 9 UNION ALL
  SELECT 'SLX-MOD-005', 90, 5, 'E1-R03-F01', 18 UNION ALL
  SELECT 'SLX-MOD-006', 160, 12, 'E1-R03-F02', 30 UNION ALL

  SELECT 'SLX-BEL-001', 26, 2, 'F1-R01-G01', 5 UNION ALL
  SELECT 'SLX-BEL-002', 34, 2, 'F1-R01-G02', 7 UNION ALL
  SELECT 'SLX-BEL-003', 120, 10, 'F1-R02-G01', 25 UNION ALL
  SELECT 'SLX-BEL-004', 68, 5, 'F1-R02-G02', 12 UNION ALL
  SELECT 'SLX-BEL-005', 40, 3, 'F1-R03-G01', 8 UNION ALL

  SELECT 'SLX-ALI-001', 75, 6, 'G1-R01-H01', 15 UNION ALL
  SELECT 'SLX-ALI-002', 130, 10, 'G1-R01-H02', 25 UNION ALL
  SELECT 'SLX-ALI-003', 95, 8, 'G1-R02-H01', 18 UNION ALL
  SELECT 'SLX-ALI-004', 56, 4, 'G1-R02-H02', 12 UNION ALL
  SELECT 'SLX-ALI-005', 84, 6, 'G1-R03-H01', 16 UNION ALL

  SELECT 'SLX-MAS-001', 48, 5, 'H1-R01-I01', 10 UNION ALL
  SELECT 'SLX-MAS-002', 66, 4, 'H1-R01-I02', 12 UNION ALL
  SELECT 'SLX-MAS-003', 32, 2, 'H1-R02-I01', 6 UNION ALL
  SELECT 'SLX-MAS-004', 78, 6, 'H1-R02-I02', 14 UNION ALL
  SELECT 'SLX-MAS-005', 90, 5, 'H1-R03-I01', 18 UNION ALL

  SELECT 'SLX-HER-001', 28, 2, 'I1-R01-J01', 6 UNION ALL
  SELECT 'SLX-HER-002', 88, 7, 'I1-R01-J02', 15 UNION ALL
  SELECT 'SLX-HER-003', 52, 4, 'I1-R02-J01', 10 UNION ALL
  SELECT 'SLX-HER-004', 120, 8, 'I1-R02-J02', 25 UNION ALL
  SELECT 'SLX-HER-005', 64, 5, 'I1-R03-J01', 12 UNION ALL

  SELECT 'SLX-JAR-001', 70, 5, 'J1-R01-K01', 14 UNION ALL
  SELECT 'SLX-JAR-002', 150, 12, 'J1-R01-K02', 30 UNION ALL
  SELECT 'SLX-JAR-003', 44, 3, 'J1-R02-K01', 8 UNION ALL
  SELECT 'SLX-JAR-004', 62, 4, 'J1-R02-K02', 12 UNION ALL
  SELECT 'SLX-JAR-005', 90, 7, 'J1-R03-K01', 18 UNION ALL

  SELECT 'SLX-AUT-001', 105, 9, 'K1-R01-L01', 20 UNION ALL
  SELECT 'SLX-AUT-002', 82, 6, 'K1-R01-L02', 16 UNION ALL
  SELECT 'SLX-AUT-003', 24, 2, 'K1-R02-L01', 5 UNION ALL
  SELECT 'SLX-AUT-004', 46, 4, 'K1-R02-L02', 9 UNION ALL

  SELECT 'SLX-JUG-001', 38, 3, 'L1-R01-M01', 8 UNION ALL
  SELECT 'SLX-JUG-002', 72, 6, 'L1-R01-M02', 14 UNION ALL
  SELECT 'SLX-JUG-003', 26, 2, 'L1-R02-M01', 5 UNION ALL
  SELECT 'SLX-JUG-004', 50, 4, 'L1-R02-M02', 10
) seed
INNER JOIN products p ON p.sku = seed.sku
ON DUPLICATE KEY UPDATE
  stock_available = VALUES(stock_available),
  stock_reserved = VALUES(stock_reserved),
  warehouse_location = VALUES(warehouse_location),
  reorder_point = VALUES(reorder_point),
  updated_at = CURRENT_TIMESTAMP(6);

COMMIT;

-- Quick validation query:
-- SELECT p.sku, p.name, p.category, p.unit_price, i.stock_available, i.stock_reserved
-- FROM products p
-- INNER JOIN inventory i ON i.product_id = p.id
-- WHERE p.sku LIKE 'SLX-%'
-- ORDER BY p.category, p.sku;
