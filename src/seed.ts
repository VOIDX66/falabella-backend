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
          },
          {
            brand: "INDURAMA",
            title: 'Congelador Indurama CI-199 de 200 litros',
            price: 1250000,
            discount_percentage: null,
            special_discount_percentage: null,
            rating: null, // Se inicializará en 0
            images: ["4_1.avif", "4_2.avif", "4_3.avif", "4_4.avif", "4_5.avif"],
            specifications: {
                              "Incluye": "congelador",
                              "Modelo": "CI-199",
                              "Alto": 85,
                              "Ancho": 91,
                              "Color": "Blanco",
                              "Garantía": "1 año",
                              "Capacidad total útil": 199,
                              "Clase de clima": "T (Tropical) 18ºC-43ºC",
                              "Condición del producto": "Nuevo",
                              "Uso": "Industrial",
                              "Características": "Ajuste de temperatura",
                              "Material de electrodomésticos": "Acero",
                              "Cuenta con ruedas": "Sí",
                              "Consumo energético": "36 kWh al mes",
                              "Potencia": "400w",
                              "Eficiencia energética": "A++",
                              "Material de las bandejas": "Policarbonato",
                              "Voltaje": 220,
                              "No frost": "Sí",
                              "Tipo de freezer": "Horizontal"
                            },
            subcategory_slug: "congeladores",
            sold_by: "Innovar",
            description: `
            Resumen de Producto - Congelador CI-199
            El Congelador CI-199 es una solución versátil y eficiente para la conservación de alimentos, ofreciendo un sistema Frost con refrigerante R600, ideal para mantener una temperatura óptima. Su capacidad de producción de hielo es de 13,6 kg en 24 horas, asegurando un frío máximo para un rendimiento superior.
            Características Destacadas:
            Diseño y Exterior:

            Disponible en blanco
            Control de temperatura digital para mayor precisión
            Puerta con llave para mayor seguridad
            Ruedas de alta resistencia para facilitar su movilidad
            Interior y Funcionalidad:

            Sistema doble acción: funciona como congelador y enfriador
            Iluminación LED para mejor visibilidad
            Incluye una canasta metálica para una mejor organización
            Dimensiones:

            Alto: 85 cm
            Ancho: 91 cm
            Profundidad: 55 cm
            Este modelo es ideal para quienes buscan un congelador práctico, seguro y de alto rendimiento.
            `,
            stock: 10, // Unidades disponibles
          },
          {
            brand: "ELECTROLUX",
            title: 'Congelador Horizontal Electrolux 251L con Función Turbo EFCC25C3HUW',
            price: 2209900,
            discount_percentage: 40,
            special_discount_percentage: 50,
            rating: 4.7, // Se inicializará en 0
            images: ["5_1.avif", "5_2.avif", "5_3.avif", "5_4.avif", "5_5.avif"],
            specifications: {
                              "Requiere Serial Number": "No",
                              "Alto": "84.5 cm",
                              "Modelo": "EFCC25C3HUW",
                              "Ancho": "95.4 cm",
                              "Color": "Blanco",
                              "Garantía": "1 año",
                              "Capacidad total útil": 251,
                              "Detalle de la garantía": "12 meses",
                              "Condición del producto": "Nuevo",
                              "Clase de clima": "SN (SubNormal) 10ºC-32ºC",
                              "Características": ["Ajuste de temperatura", "Iluminación", "Bandeja desmontable"],
                              "Uso": "Industrial",
                              "Cuenta con ruedas": "Sí",
                              "Consumo energético": "45 kWh/mes",
                              "Eficiencia energética": "No aplica",
                              "Profundidad": "61.6 cm",
                              "Voltaje": "115 V",
                              "No frost": "No",
                              "Temperatura máxima de congelamiento": "-21 °C",
                              "Tipo de freezer": "Horizontal"
                            },
            subcategory_slug: "congeladores",
            sold_by: "Electrolux",
            description: `
            El congelador horizontal EFCC25C3HUW tiene una capacidad de 251L netos, es de una sola puerta y funciona con control de temperatura mecánico. Brinda el máximo poder de congelamiento, ya que está clasificado con 4 estrellas, alcanzando una temperatura de -18 °C, lo que garantiza que los alimentos se conserven por más tiempo. Además, si necesitas hacer un congelamiento rápido, puedes utilizar la Función Turbo para llegar a -21 °C.

            Aunque su uso principal será congelar, debes saber que este modelo también te permite refrigerar, gracias a su función dual.

            Para organizar los alimentos, dispone de 1 canastilla, donde se pueden guardar pequeños artículos o los que sean de uso más frecuente, pues permite un fácil acceso.

            En cuanto al mecanismo de descongelación, este es manual y tiene un drenaje para eliminar el agua. Utiliza gas refrigerante R600, lo que evita la emisión de gases que afectan la capa de ozono, haciéndolo más ecológico.

            También, cuenta con luz LED que se activa al abrir el congelador, lo que te permitirá ver y acomodar mejor los alimentos y unas luces indicadoras de función. La luz verde indica que el compresor está funcionando correctamente y la luz naranja señala que la opción turbo está encendida.

            Como características adicionales, tiene 4 ruedas, lo que facilita su desplazamiento sin mucho esfuerzo. Su funcionamiento produce un nivel bajo de ruido y, para mayor seguridad, tiene llave, la cual se expulsa al cerrar la puerta.
            `,
            stock: 10, // Unidades disponibles
          },
          {
            brand: "XIAOMI",
            title: 'Xiaomi Redmi Note 14 Pro 256/8GB Azul',
            price: 2199900,
            discount_percentage: 50,
            special_discount_percentage: 52,
            rating: null, // Se inicializará en 0
            images: ["6_1.avif", "6_2.avif", "6_3.avif", "6_4.avif"],
            specifications: {
                              "brand": "XIAOMI",
                              "Capacidad de almacenamiento": "256 GB",
                              "Cámara posterior": "200 MP",
                              "Condición del producto": "Nuevo",
                              "Conectividad": "4G LTE"
                            },
            subcategory_slug: "smartphones",
            sold_by: "Lisertec",
            description: null,
            stock: 10, // Unidades disponibles
          },
          {
            brand: "SAMSUNG",
            title: 'Celular Samsung Galaxy S24 FE 512GB + 8GB - Negro',
            price: 3499900,
            discount_percentage: 20,
            special_discount_percentage: 26,
            rating: null, // Se inicializará en 0
            images: ["7_1.avif", "7_2.avif", "7_3.avif", "7_4.avif"],
            specifications: {
                              "Requiere IMEI": "Sí",
                              "brand": "SAMSUNG",
                              "Requiere Serial Number": "Sí",
                              "Capacidad de almacenamiento": "128 GB",
                              "Tamaño de la pantalla": 6,
                              "Capacidad de la batería (en mAh)": 4700,
                              "Cámara posterior": "50 MP",
                              "Procesador": "Samsung Exynos",
                              "Cámara frontal": "10 MP",
                              "Modelo": "S24FE",
                              "País de origen": "Vietnam",
                              "Color": "Gris",
                              "Detalle de la garantía": "12 meses, directamente con la marca (Samsung).",
                              "Condición del producto": "Nuevo",
                              "Año de lanzamiento": 2024,
                              "Conectividad": "4G",
                              "Memoria expandible": "512GB",
                              "Memoria RAM": "8GB",
                              "Núcleos del procesador": "Deca core",
                              "Sistema operativo específico": "Android 14",
                              "Proveedor de servicio/compañía": "Desbloqueado",
                              "Sistema operativo": "Android",
                              "Resistente al agua": "No"
                            },
            subcategory_slug: "smartphones",
            sold_by: "Comunicaciones",
            description: `
            Conoce el celular Samsung Galaxy S24 FE con Galaxy AI, donde cada foto genera una creatividad sin límites. Sumérgete en la experiencia completa de Galaxy AI y descubre innumerables formas de explorar tu imaginación. Captura fotos, haz círculos, tócalas... descubre por qué vale la pena. Con una pantalla con bisel más delgado. La forma redondeada garantiza un agarre cómodo, mientras que el diseño limpio y plano mejora el placer de la visualización. Con triple cámara de 50MP + 12MP + 8MP y  cámara frontal de 10MP y pantalla larga de 6.7 pulgadas FHD+. Disfruta de un tiempo de juego extendido, alimentado por una batería típica más grande de 4700 mAh. Perfectamente optimizado para la transmisión de video, es tu compañero ideal para un entretenimiento ininterrumpido. Un procesador Samsung Exynos 2400e Deca – Core, con una memoria interna de 512GB y RAM de 8GB. Equipo no incluye cargador solo cable de datos, las garantías son directamente con el fabricante (Samsung).
            `,
            stock: 10, // Unidades disponibles
          },
          {
            brand: "CAELI",
            title: 'chaqueta abrigo ovegera MUJER lluvia frio semi impermeable marca CAELI',
            price: 94900,
            discount_percentage: null,
            special_discount_percentage: null,
            rating: null, // Se inicializará en 0
            images: ["8_1.avif"],
            specifications: {
                              "Incluye": "chaqueta",
                              "Modelo": "PRINCESA",
                              "País de origen": "Colombia",
                              "Largo de mangas": "Manga larga",
                              "Material de vestuario": "Poliéster",
                              "Composición": "tela nailon",
                              "Género": "Mujer",
                              "Tipo de cierre": "Cierre plástico",
                              "Detalle de la garantía": "30 dias por costuras",
                              "Condición del producto": "Nuevo",
                              "Material del forro": "Textil",
                              "Tipo": "Chaquetas",
                              "Tipo de cuello": "Alto"
                            },
            subcategory_slug: "chaquetas_y_abrigos_mujer",
            sold_by: "Caeli",
            description: `
            chaqueta para dama acolchada REF princesa marca CAELI
            dos bolsillos laterales con cremallera
            caucho en el puño 
            2 bolsillo en el forro. 
            Cordón en la capota.
            forrada en ovegero espalda delanteros y capotas mangas en ceda.
            tallas S,M,L,XL,XXL. 
            colores negro , azul oscuro , verde militar, vinotinto, beige, verde manzana, mostaza.
            producto nacional.
            capota desmontable con sistema de cremallera.
            ANTES DE HACER TU COMPRA CONSULTA LA TABLA DE TALLAS
            `,
            stock: 10, // Unidades disponibles
          },
          {
            brand: "BASEMENT",
            title: 'Saco de vestir para Hombre Basement',
            price: 329990,
            discount_percentage: null,
            special_discount_percentage: null,
            rating: null, // Se inicializará en 0
            images: ["9_1.avif", "9_2.avif", "9_3.avif", "9_4.avif", "9_5.avif"],
            specifications: {
                              "Mas verde": "No",
                              "Marca": "Basement",
                              "Estilo": "Vestir",
                              "Temporada": "Toda temporada",
                              "NIT": "900017447-8",
                              "Registro SIC": "900017447",
                              "Cantidad de bolsillos": 2,
                              "Modelo": "VSSL BASIC ST",
                              "Cantidad de bolsillos interiores": 1,
                              "País de origen": "China",
                              "Género": "Hombre",
                              "Fit": "Recto",
                              "Composición": "89% Poliéster 9% Viscosa 2% Elastano"
                            },
            subcategory_slug: "trajes_formales_hombre",
            sold_by: "Falabella",
            description: "Mucho texto",
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