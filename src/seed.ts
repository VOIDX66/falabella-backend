import { AppDataSource } from "./db";
import { Section } from "./entities/section";
import { Category } from "./entities/category";
import { Subcategory } from "./entities/subcategory";
import { SectionCategory } from "./entities/sectioncategory";
import { CategorySubcategory } from "./entities/categorysubcategory";

export const seedDatabase = async () => {
    try {
        console.log("📦 Base de datos conectada");

        // 1) Insertar SECTIONS
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
            // Reemplazamos section.save() por AppDataSource.manager.save(section)
            const savedSection = await AppDataSource.manager.save(section);
            sections.push(savedSection);
        }

        // 2) Insertar CATEGORIES (sin referencia a Section)
        const categoriesData = [
            "Computación",
            "Audio",
            "TV y video",
            "Zona gamer",
            "Consolas",
            "Smartwatch y accesorios",
            "Cámaras y drones",
            "Patinenas elétricas",
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
            "Maquinas de coser",
            "Cuidado personal",
            "Ropa",
            "Ropa interior y pijamas",
            "Ropa deportiva",
            "Accesorios",
            "Zapatos"
        ];
        const categories: Category[] = [];
        for (const name of categoriesData) {
            const category = new Category();
            category.name_category = name;
            // Reemplazamos category.save() por AppDataSource.manager.save(category)
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
            "Blazers",
            "Blusas",
            "Camisetas",
            "Chaquetas y abrigos",
            "Faldas",
            "Jeans",
            "Pantalones",
            "Sacos y hoodies",
            "Shorts",
            "Vestidos y enterizos",
            "Vestidos de Baño",
            "Brasiers",
            "Calzones",
            "Fajas y moldeadores",
            "Medias",
            "Packs",
            "Pantuflas",
            "Pijamas",
            "Chaquetas y cortavientos",
            "Leggins y licras",
            "Pantalones, shorts y faldas",
            "Sacos y hoddies",
            "Tops deportivos",
            "Medias deportivas",
            "Mundo futbol",
            "Camisetas polo",
            "Camisas Casuales",
            "Shorts y bermudas",
            "Pantalonetas de baño",
            "Trajes formales",
            "Boxers y calzoncillos",
            "Pantalones deportivos",
            "Gorras y sombreros",
            "Cinturones",
            "Billeteras"
        ];
        const subcategories: Subcategory[] = [];
        for (const name of subcategoriesData) {
            const subcat = new Subcategory();
            subcat.name_subcategory = name;
            // Reemplazamos subcat.save() por AppDataSource.manager.save(subcat)
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
                    "Ropa",
                    "Ropa interior y pijamas",
                    "Ropa deportiva",
                    "Accesorios",
                    "Zapatos"
                ]
            },
            {
                sectionName: "Moda hombre",
                categoryNames: [
                    "Ropa",
                    "Ropa interior y pijamas",
                    "Ropa deportiva",
                    "Accesorios",
                    "Zapatos"
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
              categoryName: "Ropa",
              subNames: [
                "Blazers",
                "Blusas",
                "Camisetas",
                "Chaquetas y abrigos",
                "Faldas",
                "Jeans",
                "Pantalones",
                "Sacos y hoodies",
                "Shorts",
                "Vestidos y enterizos",
                "Vestidos de Baño",
                "Camisetas polo",
                "Camisas casuales",
                "Shorts y bermudas",
                "Pantalones de baño",
                "Trajes formales"
              ]
            },
            {
              categoryName: "Ropa interior y pijamas",
              subNames: [
                "Brasiers",
                "Calzones",
                "Fajas y moldeadores",
                "Medias",
                "Packs",
                "Pantuflas",
                "Pijamas",
                "Boxers y calzoncillos"
              ]
            },
            {
              categoryName: "Ropa deportiva",
              subNames: [
                "Camisetas",
                "Chaquetas y cortavientos",
                "Leggins y licras",
                "Pantalones, shorts y faldas",
                "Sacos y hoddies",
                "Tops deportivos",
                "Medias deportivas",
                "Mundo futbol",
                "Pantalones deportivos",
                "Pantalonetas"
              ]
            },
            {
              categoryName: "Accesorios",
              subNames: [
                "Gorras y sombreros",
                "Cinturones",
                "Billeteras"
              ]
            },
            {
              categoryName: "Zapatos",
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

        console.log("✅ Datos insertados correctamente");
    } catch (error) {
        console.error("❌ Error insertando datos:", error);
    } finally {
        await AppDataSource.destroy();
    }
};