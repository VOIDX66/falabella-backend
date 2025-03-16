import { AppDataSource } from "./db";
import { Section } from "./entities/section";
import { Category } from "./entities/category";
import { Subcategory } from "./entities/subcategory";
import { SectionCategory } from "./entities/sectioncategory";
import { CategorySubcategory } from "./entities/categorysubcategory";
import { Product } from "./entities/product";

export const seedDatabase = async () => {
  const sectionCount = await AppDataSource.manager.count(Section)
  if (sectionCount > 0){
    console.log("Seed de categorias ya esta cargada")
    return; 
  }
    try {
        console.log("📦 Base de datos conectada");

        // 1) Insertar SECTIONS con slug
        const sectionsData = [
          "Tecnología",
          "Celulares y accesorios",
          "Electrohogar",
          "Moda mujer",
          "Moda hombre"
        ];
        const sections: Section[] = [];
        for (const name of sectionsData) {
          const section = new Section();
          section.name_section = name;
          section.slug = name
              .normalize("NFD") // Descompone caracteres con tilde
              .replace(/[\u0300-\u036f]/g, "") // Elimina los diacríticos (tildes)
              .toLowerCase()
              .replace(/\s+/g, "_"); // Reemplaza espacios con guiones

          // Guardamos la sección con el slug generado
          const savedSection = await AppDataSource.manager.save(section);
          sections.push(savedSection);
        }

        // 2) Insertar CATEGORIES con slug (sin referencia a Section)
        const categoriesData = [
          "Computación",
          "Audio",
          "TV y video",
          "Zona gamer",
          "Consolas",
          "Smartwatch y accesorios",
          "Cámaras y drones",
          "Patinetas eléctricas",
          "Smart Home",
          "Celulares",
          "Audífonos",
          "Accesorios celulares",
          "Refrigeración",
          "Lavado y planchado",
          "Climatización",
          "Cocina",
          "Aspirado y limpieza",
          "Electrodomésticos de cocina",
          "Máquinas de coser",
          "Cuidado personal",
          "Ropa Mujer",
          "Ropa Hombre",
          "Ropa interior y pijamas Mujer",
          "Ropa interior y pijamas Hhombre",
          "Ropa deportiva Mujer",
          "Ropa deportiva Hombre",
          "Accesorios Mujer",
          "Accesorios Hombre",
          "Zapatos Mujer",
          "Zapatos Hombre"
        ];
        const categories: Category[] = [];
        for (const name of categoriesData) {
          const category = new Category();
          category.name_category = name;
          category.slug = name
              .normalize("NFD") // Descompone caracteres con tilde
              .replace(/[\u0300-\u036f]/g, "") // Elimina los diacríticos (tildes)
              .toLowerCase()
              .replace(/\s+/g, "_"); // Reemplaza espacios con guiones

          // Guardamos la categoría con el slug generado
          const savedCategory = await AppDataSource.manager.save(category);
          categories.push(savedCategory);
        }


        // 3) Insertar SUBCATEGORIES (sin referencia a Category)
        const subcategoriesData = [
            "Portátiles",
            "Tablets",
            "Impresoras",
            "Accesorios computación",
            "Monitores",
            "PC de escritorio",
            "Conectividad",
            "Barras de sonido",
            "Equipos de sonido y karaoke",
            "Parlantes",
            "Televisores",
            "Proyectores",
            "Accesorios TV",
            "Streaming",
            "Playstation",
            "Nintendo",
            "Xbox",
            "Videojuegos",
            "Cámaras deportivas",
            "Cámaras instantaneas",
            "Cámaras profesionales",
            "Cámaras semi profesionales",
            "Asistentes por voz",
            "Aspiradoras robot",
            "Iluminación inteligente",
            "Smartphones",
            "Celulares básicos",
            "Audifonos in ear",
            "Audifonos on ear",
            "Audifonos over ear",
            "Baterias externas",
            "Cargadores y cables",
            "Forros y estuches",
            "Protectores de pantalla",
            "Soporte de celulares",
            "Cavas",
            "Congeladores",
            "Dispensadores de agua",
            "Minibares",
            "Nevecones",
            "Nevera congelador superior",
            "Congelador inferior",
            "Lavadoras carga frontal",
            "Lavadoras carga superior",
            "Lavadoras secadoras",
            "Planchas",
            "Secadoras",
            "Aires acondicionados",
            "Calefactores",
            "Calentadores de agua",
            "Purificadores de aire",
            "Ventiladores",
            "Estufas de piso",
            "Estufas empotrables",
            "Extractores y campanas",
            "Hornos empotrables",
            "Lavajillas",
            "Aspiradoras",
            "Hidrolavadoras",
            "Freidoras de aire",
            "Licuadoras",
            "Batidoras",
            "Microondas",
            "Ollas arroceras y multiusos",
            "Sanducheras y wafleras",
            "Cafeteras eléctricas",
            "Cocina divertida",
            "Exprimidores y extractores",
            "Grills y parrillas eléctricas",
            "Hervidores",
            "Hornos eléctricos",
            "Procesadores de alimentos",
            "Tostadoras",
            "Planchas y alisadores",
            "Onduladores de pelo",
            "Barbería",
            "Depiladoras eléctricas",
            "Masajeadores eléctricos",
            "Blazers Mujer",
            "Blusas Mujer", 
            "Camisetas Mujer",
            "Camisetas Hombre",
            "Chaquetas y abrigos Mujer",
            "Chaquetas y abrigos Hombre",
            "Faldas Mujer",
            "Jeans Mujer",
            "Jeans Hombre",
            "Pantalones Mujer",
            "Pantalones Hombre",
            "Sacos y hoodies Mujer",
            "Sacos y hoodies Hombre",
            "Shorts Mujer",
            "Vestidos y enterizos",
            "Vestidos de Baño",
            "Brasiers Mujer",
            "Calzones Mujer",
            "Fajas y moldeadores Mujer",
            "Medias Mujer",
            "Medias Hombre",
            "Packs Mujer",
            "Packs Hombre",
            "Pantuflas Mujer",
            "Pantuflas Hombre",
            "Pijamas Mujer",
            "Pijamas Hombre",
            "Chaquetas y cortavientos Mujer",
            "Chaquetas y cortavientos Hombre",
            "Leggins y licras Mujer",
            "Pantalones shorts y faldas Mujer",
            "Tops deportivos Mujer",
            "Medias deportivas Mujer",
            "Medias deportivas Hombre",
            "Mundo futbol Mujer",
            "Mundo futbol Hombre",
            "Camisetas polo Mujer", 
            "Camisetas polo Hombre", 
            "Camisas Casuales Hombre",
            "Shorts y bermudas Hombre",
            "Pantalonetas de baño Hombre",
            "Trajes formales Hombre",
            "Boxers y calzoncillos Hombre",
            "Pantalones deportivos Hombre",
            "Gorras y sombreros Hombre",
            "Cinturones Hombre",
            "Billeteras Hombre"
        ];
        const subcategories: Subcategory[] = [];
        for (const name of subcategoriesData) {
            const subcat = new Subcategory();
            subcat.name_subcategory = name;
            subcat.slug = name
                .normalize("NFD") // Descompone caracteres con tilde
                .replace(/[\u0300-\u036f]/g, "") // Elimina los diacríticos (tildes)
                .toLowerCase()
                .replace(/\s+/g, "_"); // Reemplaza espacios con guiones

            // Guardamos la subcategoría con el slug generado
            const savedSubcat = await AppDataSource.manager.save(subcat);
            subcategories.push(savedSubcat);
        }

        // 4) Vincular Section ↔ Category en SectionCategory
        const sectionCategoryData = [
            {
                sectionName: "Tecnología",
                categoryNames: [
                    "Computación", 
                    "Audio", 
                    "Smartwatch y accesorios", 
                    "TV y video", 
                    "Zona gamer", 
                    "Consolas", 
                    "Smartwatch y accesorios", 
                    "Cámaras y drones", 
                    "Patinenas elétricas", 
                    "Smart Home"
                ]
            },
            {
                sectionName: "Celulares y accesorios",
                categoryNames: [
                    "Celulares", 
                    "Smartwatch y accesorios", 
                    "Audífonos", 
                    "Accesorios celulares"
                ]
            },
            {
                sectionName: "Electrohogar",
                categoryNames: [
                    "Refrigeración",
                    "Lavado y planchado",
                    "Climatización",
                    "Cocina",
                    "Aspirado y limpieza",
                    "Electrodomésticos de cocina",
                    "Maquinas de coser",
                    "Cuidado personal"
                ]
            },
            {
              sectionName: "Moda mujer",
              categoryNames: [
                "Ropa Mujer",
                "Ropa interior y pijamas Mujer",
                "Ropa deportiva Mujer",
                "Accesorios Mujer",
                "Zapatos Mujer"
              ]
            },
            {
              sectionName: "Moda hombre",
              categoryNames: [
                "Ropa Hombre",
                "Ropa interior y pijamas Hombre",
                "Ropa deportiva Hombre",
                "Accesorios Hombre",
                "Zapatos Hombre"
              ]
            }
        ];

        for (const scItem of sectionCategoryData) {
            const sectionEntity = sections.find(s => s.name_section === scItem.sectionName);
            if (sectionEntity) {
                for (const catName of scItem.categoryNames) {
                    const catEntity = categories.find(c => c.name_category === catName);
                    if (catEntity) {
                        const sectionCategory = new SectionCategory();
                        sectionCategory.section = sectionEntity;
                        sectionCategory.category = catEntity;
                        // Reemplazamos sectionCategory.save() por manager.save(sectionCategory)
                        await AppDataSource.manager.save(sectionCategory);
                    }
                }
            }
        }

        // 5) Vincular Category ↔ Subcategory en CategorySubcategory
        const categorySubcategoryData = [
            {
              categoryName: "Computación",
              subNames: [
                "Portátiles",
                "Tablets",
                "Impresoras",
                "Accesorios computación",
                "Monitores",
                "PC de escritorio",
                "Conectividad"
              ]
            },
            {
              categoryName: "Audio",
              subNames: [
                "Barras de sonido",
                "Equipos de sonido y karaoke",
                "Parlantes",
                "Instrumentos musicales"
              ]
            },
            {
              categoryName: "TV y video",
              subNames: [
                "Televisores",
                "Proyectores",
                "Accesorios TV",
                "Soportes",
                "Streaming"
              ]
            },
            {
              categoryName: "Zona gamer",
              subNames: []
            },
            {
              categoryName: "Consolas",
              subNames: [
                "Playstation",
                "Nintendo",
                "Xbox",
                "Videojuegos"
              ]
            },
            {
              categoryName: "Smartwatch y accesorios",
              subNames: []
            },
            {
              categoryName: "Cámaras y drones",
              subNames: [
                "Cámaras deportivas",
                "Cámaras instantaneas",
                "Cámaras profesionales",
                "Cámaras semi profesionales",
                "Drones"
              ]
            },
            {
              categoryName: "Patinenas elétricas",
              subNames: []
            },
            {
              categoryName: "Smart Home",
              subNames: [
                "Asistentes por voz",
                "Aspiradoras robot",
                "Iluminación inteligente"
              ]
            },
            {
              categoryName: "Celulares",
              subNames: [
                "Smartphones",
                "Celulares básicos"
              ]
            },
            {
              categoryName: "Audífonos",
              subNames: [
                "Audifonos in ear",
                "Audifonos on ear",
                "Audifonos over ear"
              ]
            },
            {
              categoryName: "Accesorios celulares",
              subNames: [
                "Baterias externas",
                "Cargadores y cables",
                "Forros y estuches",
                "Protectores de pantalla",
                "Soporte de celulares"
              ]
            },
            {
              categoryName: "Refrigeración",
              subNames: [
                "Cavas",
                "Congeladores",
                "Dispensadores de agua",
                "Minibares",
                "Nevecones",
                "Nevera congelador superior",
                "Congelador inferior"
              ]
            },
            {
              categoryName: "Lavado y planchado",
              subNames: [
                "Lavadoras carga frontal",
                "Lavadoras carga superior",
                "Lavadoras secadoras",
                "Planchas",
                "Secadoras"
              ]
            },
            {
              categoryName: "Climatización",
              subNames: [
                "Aires acondicionados",
                "Calefactores",
                "Calentadores de agua",
                "Purificadores de aire",
                "Ventiladores"
              ]
            },
            {
              categoryName: "Cocina",
              subNames: [
                "Estufas de piso",
                "Estufas empotrables",
                "Extractores y campanas",
                "Hornos empotrables",
                "Lavajillas"
              ]
            },
            {
              categoryName: "Aspirado y limpieza",
              subNames: [
                "Aspiradoras",
                "Hidrolavadoras"
              ]
            },
            {
              categoryName: "Electrodomésticos de cocina",
              subNames: [
                "Freidoras de aire",
                "Licuadoras",
                "Batidoras",
                "Microondas",
                "Ollas arroceras y multiusos",
                "Sanducheras y wafleras",
                "Cafeteras eléctricas",
                "Cocina divertida",
                "Exprimidores y extractores",
                "Grills y parrillas eléctricas",
                "Hervidores",
                "Hornos eléctricos",
                "Procesadores de alimentos",
                "Tostadoras"
              ]
            },
            {
              categoryName: "Maquinas de coser",
              subNames: []
            },
            {
              categoryName: "Cuidado personal",
              subNames: [
                "Planchas y alisadores",
                "Onduladores de pelo",
                "Barbería",
                "Depiladoras eléctricas",
                "Masajeadores eléctricos"
              ]
            },
            {
              categoryName: "Ropa Mujer",
              subNames: [
                "Blazers Mujer",
                "Blusas Mujer",
                "Camisetas Mujer",
                "Chaquetas y abrigos Mujer",
                "Faldas Mujer",
                "Jeans Mujer",
                "Pantalones Mujer",
                "Sacos y hoodies Mujer",
                "Shorts Mujer",
                "Vestidos y enterizos",
                "Vestidos de Baño",
                "Chaquetas y cortavientos Mujer",
                "Leggins y licras Mujer",
                "Pantalones shorts y faldas Mujer",
                "Camisetas polo Mujer"
              ]
            },
            {
              categoryName: "Ropa Hombre",
              subNames: [
                "Camisetas Hombre",
                "Chaquetas y abrigos Hombre",
                "Jeans Hombre",
                "Pantalones Hombre",
                "Sacos y hoodies Hombre",
                "Chaquetas y cortavientos Hombre",
                "Camisetas polo Hombre",
                "Camisas Casuales Hombre",
                "Shorts y bermudas Hombre",
                "Pantalonetas de baño Hombre",
                "Trajes formales Hombre",
                "Pantalones deportivos Hombre"
              ]
            },
            {
              categoryName: "Ropa interior y pijamas Mujer",
              subNames: [
                "Brasiers Mujer",
                "Calzones Mujer",
                "Fajas y moldeadores Mujer",
                "Medias Mujer",
                "Packs Mujer",
                "Pantuflas Mujer",
                "Pijamas Mujer"
              ]
            },
            {
              categoryName: "Ropa interior y pijamas Hombre",
              subNames: [
                "Medias Hombre",
                "Packs Hombre",
                "Pantuflas Hombre",
                "Pijamas Hombre",
                "Boxers y calzoncillos Hombre"
              ]
            },
            {
              categoryName: "Ropa deportiva Mujer",
              subNames: [
                "Tops deportivos Mujer",
                "Medias deportivas Mujer",
                "Mundo futbol Mujer"
              ]
            },
            {
              categoryName: "Ropa deportiva Hombre",
              subNames: [
                "Medias deportivas Hombre",
                "Mundo futbol Hombre",
                "Pantalones deportivos Hombre"
              ]
            },
            {
              categoryName: "Accesorios Mujer",
              subNames: []
            },
            {
              categoryName: "Accesorios Hombre",
              subNames: [
                "Gorras y sombreros Hombre",
                "Cinturones Hombre",
                "Billeteras Hombre"
              ]
            },
            {
              categoryName: "Zapatos Mujer",
              subNames: []
            },
            {
              categoryName: "Zapatos Hombre",
              subNames: []
            }
        ];

        for (const csItem of categorySubcategoryData) {
            const catEntity = categories.find(c => c.name_category === csItem.categoryName);
            if (catEntity) {
                for (const subName of csItem.subNames) {
                    const subEntity = subcategories.find(s => s.name_subcategory === subName);
                    if (subEntity) {
                        const catSub = new CategorySubcategory();
                        catSub.category = catEntity;
                        catSub.subcategory = subEntity;
                        // Reemplazamos catSub.save() por manager.save(catSub)
                        await AppDataSource.manager.save(catSub);
                    }
                }
            }
        }
        //
        const productsData = [
          {
            brand: "DELL",
            title: 'PORTATIL DELL INSPIRON 3520 15.6" FHD INTEL CORE I5 1235U RAM 24GB DDR4 SSD 2TB + COMBO INALAMBRICO',
            price: 5200000,
            discount_percentage: 53,
            special_discount_percentage: null,
            rating: null, // Se inicializará en 0
            images: ["1_1.avif", "1_2.avif"],
            specifications: {
                              "Requiere Serial Number": "No",
                              "Requiere IMEI": "No",
                              "Tamaño de la pantalla" : 15.6,
                              "Capacidad de almacenamiento" : "2TB",
                              "Caracteristicas de la pantalla" : "FHD",
                              "Cantidad de puertos HDMI" : 1,
                              "Garantia" : "1 año",
                              "Resolución de pantalla" : "1920x1080",
                              "Cantidad de puertos USB" : 3,
                              "Detalle de la garantia" : `
                              La garantía cubre únicamente defectos de fábrica presentes en el producto. Es indispensable conservar la caja original y todos los accesorios incluidos para cualquier gestión relacionada. Los inconvenientes relacionados con el sistema operativo, configuraciones o software no están cubiertos por esta garantía. Asimismo, no aplica en casos de uso indebido, negligencia, golpes, caídas u otros daños físicos ocasionados al producto.
                              `,
                              "Condición del producto" : "Nuevo",
                              "Pantalla touch" : "No",
                              "Memoria RAM" : "24GB",
                              "Núcleos del procesador" : "Octa core",
                              "Velocidad de imagen" : "120Hz",
                              "Procesador" : "Intel Corei5",
                              "Sistema operativo" : "Windows11",
                              "Tipo de computador" : "Notebook",
                              "Marca tarjeta gráfica" : "Integrada"
                            },
            subcategory_slug: "portatiles",
            sold_by: "Technology S.A.S",
            description: `
            Dell Inspiron 3520 Core I5-1235U 24GB 2TB

            Tareas diarias realizadas
            Disfrute de un rendimiento ágil y silencioso, con procesadores Intel Core de 12. generación combinados con opciones de PCIe SSD.

            Disfrute de teclas de mayor tamaño y de un amplio panel táctil para desplazarse con facilidad por el contenido, además del software ComfortView, que es una solución con certificación TuV Rheinland y reduce las nocivas emisiones de luz azul para que no se le canse vista cuando tenga que estar mucho tiempo delante de la pantalla. Además, sus elegantes bordes finos en tres lados admiten una pantalla FHD opcional.

            Un diseño moderno
            Disfrute de un diseño clásico Una cámara web de alta definición integrada le permite conectarse con total confianza y con la seguridad de que su aspecto va a ser excelente. Su PC está desarrollado para aguantar un uso regular, con unas diminutas patas de goma y topes en la bisagra que evitan que se deslice y proporcionan una estabilidad adicional sobre superficies duras.

            CONDICIONES
            Producto Nuevo
            Modelo Inspiron 3520
            N/P P112F-C3VHY
            Marca DELL

            PROCESADOR
            Intel Core i5-1235U
            10 núcleos / 12 subprocesos
            3.30 GHz/4.40 GHz

            MEMORIA TOTAL 64GB
            24GB, DDR4, 2666 MHz

            ALMACENAMIENTO
            2TB CL35 M.2 SSD

            TARJETA DE VÍDEO:
            Intel UHD Graphics

            PANTALLA
            15.6, FHD
            1920 x 1080, 120Hz, WVA, Non-Touch, Anti-Glare, 250 nit, Narrow Border, LED-Backlit

            TECLADO
            no retroiluminado, español (castellano)

            Audio y altavoces
            Dos altavoces estéreo de 2 W, 4 W en total

            Cámara
            cámara HD de 720p a 30 fps con un micrófono integrado.

            Conexión inalámbrica
            Tarjeta inalámbrica Intel Wi-Fi 6 AX201, 2x2, 802.11ax, Bluetooth

            SISTEMA OPERATIVO:
            WINDOWS 11 HOME (LICENCIA ORIGINAL)

            PUERTOS:
            1 HDMI 1.4 port
            2 USB 3.2 Gen 1 ports;
            1 USB 2.0 port
            1 conector de alimentación
            1 puerto para auriculares (combinado para micrófono y auriculares)
            1 ranura para tarjeta SD 3.0
            1 ranura M.2 2230/2280 para unidad de estado solido

            DIMENSIONES
            Ancho 358.50mm
            Profundidad 235.56mm
            Altura 16.96mm - 21.07mm
            Peso 1.65kg

            Normativas
            ENERGY STAR

            BATERIA PRINCIPAL:
            3 celdas, 41 Wh, integrada
            Alimentación
            Adaptador de CA de 65 vatios
            `,
            stock: 10, // Unidades disponibles
          },
          {
            brand: "ASUS",
            title: 'Portátil ASUS Vivobook 16 | Intel Core i5 | 16GB de RAM | 1TB SSD de almacenamiento | Windows 11 |16 Pulgadas | X1605ZA-MB639W | Computador portátil',
            price: 3899900,
            discount_percentage: 40,
            special_discount_percentage: 46,
            rating: 5, // Se inicializará en 0
            images: ["2_1.avif", "2_2.avif", "2_3.avif", "2_4.avif", "2_5.avif", "2_6.avif", "2_7.avif"],
            specifications: {
                              "Disco duro HDD": "No aplica",
                              "RAM expandible": "Sí",
                              "Idioma del teclado": "Español",
                              "Entradas HDMI": 1,
                              "Entradas USB": 3,
                              "Peso del producto": "1.88 kg",
                              "Marca": "ASUS",
                              "Nombre comercial": "ASUS Vivobook 16 X1605ZA",
                              "Tamaño de la pantalla": 16,
                              "Incluye": "No",
                              "Capacidad de almacenamiento": "1 TB",
                              "Modelo": "X1605ZA-MB639W",
                              "País de origen": "China",
                              "Garantía": "1 año",
                              "Resolución de pantalla": "WUXGA",
                              "Conectividad/conexión": "Wifi 6",
                              "Cuenta con bluetooth": "Sí",
                              "Condición del producto": "Nuevo",
                              "Pantalla touch": "No",
                              "Memoria RAM": "16GB",
                              "Alto": "35.87 cm",
                              "Ancho": "24.95 cm",
                              "Núcleos del procesador": "12 core",
                              "Duración de la batería (hrs)": "Hasta 7 horas de batería",
                              "Velocidad de procesamiento (GHz)": "2.5 GHz",
                              "Procesador": "Intel Core i5",
                              "Profundidad": "1.99 cm",
                              "Sistema operativo": "Windows 11",
                              "Tasa de refresco nativa": "60Hz",
                              "Tipo de computador": "Notebook",
                              "Velocidad máxima": "4.5 GHz",
                              "Procesador específico txt": "Intel Core i5",
                              "Marca tarjeta gráfica": "Integrada"
                            },
            subcategory_slug: "portatiles",
            sold_by: "Falabella",
            description: `
            Ficha técnica:
            Procesador: Intel Core I5
            Memoria RAM: 16GB
            Unidad de estado sólido SSD: 1TB
            Resolución de la pantalla: WUXGA (1920 x 1200)
            Tamaño de la pantalla: 16 pulgadas
            Disco duro HDD: No aplica
            Núcleos del procesador: 12 Core
            Memoria total (RAM + Intel Optane): 16GB
            Velocidad de procesamiento (GHz): 2.5 GHz
            Velocidad máxima del procesador: 4.5 GHz
            Modelo del procesador: Intel® Corei5-12500H
            Generación del procesador: 12°
            RAM expandible: Sí
            Características de la pantalla: WUXGA
            Pantalla touch: No
            Tipo de teclado: Chiclet Keyboard with Num-key
            Idioma del teclado: Español
            Sistema de audio: SonicMaster
            Duración aproximada de la batería: Hasta 7 horas de batería
            Entradas HDMI: 1
            Entradas USB: 3
            Unidad óptica: No
            Cámara Web: Sí
            Conexión Bluetooth: Sí
            Conectividad: Wifi 6
            Alto: 35.87 cm
            Ancho: 24.95 cm
            Profundidad: 1.99 cm
            Peso del producto: 1.88 kg
            Incluye accesorios: No
            Sistema operativo: Windows 11
            Marca: ASUS
            Modelo: X1605ZA-MB639W
            Tipo: Portátiles
            Hecho en: China
            Garantía del proveedor: 1 año
            Tasa de refresco: 60Hz
            Nombre comercial: ASUS Vivobook 16 X1605ZA
            Condición del producto: Nuevo
            Capacidad de almacenamiento: 1TB
            Procesador específico: Intel Core i5
            Tarjeta gráfica: Integrada
            Marca procesador: Intel Core I5
            Garantía del proveedor
            1 año.
            Información adicional
            FingerPrint Military Grade.
            INFORMACIÓN SOBRE LA BATERÍA:
            Todas las afirmaciones sobre la duración de la batería son aproximadas. La duración de la batería puede variar dependiendo de varios motivos, entre ellos la configuración y el uso del producto, el software, las condiciones de funcionamiento, la funcionalidad inalámbrica y la administración de energía.
            `,
            stock: 10, // Unidades disponibles
          },
          {
            brand: "SOUNDCORE",
            title: 'Portátil ASUS Vivobook 16 | Intel Core i5 | 16GB de RAM | 1TB SSD de almacenamiento | Windows 11 |16 Pulgadas | X1605ZA-MB639W | Computador portátil',
            price: 462900,
            discount_percentage: 35,
            special_discount_percentage: null,
            rating: null, // Se inicializará en 0
            images: ["3_1.avif", "3_2.avif", "3_3.avif", "3_4.avif", "3_5.avif", "3_6.avif"],
            specifications: {
                              "Peso del producto": "0.617kg",
                              "Audio HQ": "IA",
                              "Aislador de sonido": "Sí",
                              "Incluye micrófono": "Sí",
                              "Cantidad de entradas auxiliares de 3.5 mm": 0,
                              "Modelo": "A3872Z11",
                              "Compatible con": "Universal",
                              "Frecuencia de operación": "No aplica",
                              "País de origen": "China",
                              "Garantía": "18 meses",
                              "Cuenta con bluetooth": "Sí",
                              "Condición del producto": "Nuevo",
                              "Impedancia": 11,
                              "Material": "Sintético",
                              "Potencia": "20Hz-20kHz",
                              "Tipo de auricular": "On-Ear",
                              "Resistente al agua": "IPX5 (Protegido contra el agua en chorros a presión)",
                              "Alto": "No aplica",
                              "Ancho": "No aplica"
                            },
            subcategory_slug: "audifonos_in_ear",
            sold_by: "Falabella",
            description: null,
            stock: 10, // Unidades disponibles
          }
        ];
        
        console.log("🔄 Iniciando inserción de productos...");
        
        const products: Product[] = [];
        
        for (const productData of productsData) {
          try {
            console.log(`📦 Procesando producto: ${productData.title}`);
        
            if (!productData.price) {
              console.error(`❌ ERROR: El producto "${productData.title}" no tiene precio definido.`);
              continue;
            }
        
            const product = new Product();
            product.brand = productData.brand;
            product.title = productData.title;
            product.price = productData.price;
            product.discount_percentage = productData.discount_percentage || null;
            product.special_discount_percentage = productData.special_discount_percentage || null;
            product.rating = productData.rating ?? 0; // Si no tiene, inicia en 0
            product.images = productData.images;
            product.specifications = productData.specifications;
            product.subcategory_slug = productData.subcategory_slug;
            product.sold_by = productData.sold_by || "Marketplace";
            product.description = productData.description || null; // Información adicional
            product.stock = productData.stock ?? 0; // Si no tiene, inicia en 0
        
            console.log(`💾 Guardando en la base de datos: ${product.title}`);
            const savedProduct = await AppDataSource.manager.save(product);
            products.push(savedProduct);
            console.log(`✅ Producto guardado: ${savedProduct.title} (ID: ${savedProduct.id_product})`);
        
          } catch (error) {
            console.error(`❌ ERROR al procesar el producto "${productData.title}":`, error);
          }
        }        
      //
        console.log("✅ Datos insertados correctamente");
    } catch (error) {
        console.error("❌ Error insertando datos:", error);
    }
}