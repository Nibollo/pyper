-- update initial data for "Sobre Nosotros" with section-based JSON
UPDATE cms_pages SET content = '[
  {
    "id": "hero-1",
    "type": "hero",
    "title": "SOBRE NOSOTROS",
    "subtitle": "Transformando la educación en Paraguay a través de la innovación y el compromiso con la excelencia.",
    "theme": "dark"
  },
  {
    "id": "content-1",
    "type": "rich-text",
    "title": "Nuestra Historia",
    "body": "Pyper nació de una visión clara: simplificar y potenciar el acceso a herramientas educativas de calidad. Lo que comenzó como una librería tradicional ha evolucionado hasta convertirse en un centro integral de soluciones que une lo mejor del mundo físico y digital.\n\nHoy, somos referentes en la provisión de kits escolares inteligentes y tecnología educativa de vanguardia, sirviendo a miles de estudiantes y cientos de instituciones en todo el país.",
    "icon": "history_edu"
  },
  {
    "id": "grid-1",
    "type": "grid",
    "items": [
      {
        "icon": "rocket_launch",
        "title": "Misión",
        "description": "Empoderar a las futuras generaciones de Paraguay facilitando el acceso a materiales educativos y herramientas tecnológicas de primer nivel."
      },
      {
        "icon": "visibility",
        "title": "Visión",
        "description": "Ser el partner educativo #1 en el país, reconocido por nuestra capacidad de innovar y adaptarnos a las necesidades cambiantes del sector escolar."
      },
      {
        "icon": "favorite",
        "title": "Valores",
        "description": "Calidad, Compromiso Social, Innovación Constante y Honestidad en cada una de nuestras relaciones comerciales."
      }
    ]
  }
]' WHERE slug = 'sobre-nosotros';

-- update initial data for "Sucursales"
UPDATE cms_pages SET content = '[
  {
    "id": "hero-suc",
    "type": "hero",
    "title": "NUESTRAS SUCURSALES",
    "subtitle": "Estamos cerca tuyo para brindarte la mejor atención y soluciones educativas.",
    "theme": "primary"
  },
  {
    "id": "grid-suc",
    "type": "grid",
    "items": [
      {
        "icon": "location_on",
        "title": "Casa Matriz - Asunción",
        "description": "Calle Avda. España 1234, Asunción, Paraguay\n+595 21 000 000\nLunes a Viernes: 08:00 - 18:00"
      },
      {
        "icon": "local_shipping",
        "title": "Puntos de Distribución",
        "description": "✅ Ciudad del Este\n✅ Encarnación\n✅ Coronel Oviedo\n✅ Pedro Juan Caballero"
      }
    ]
  }
]' WHERE slug = 'sucursales';

-- update initial data for "Empleo"
UPDATE cms_pages SET content = '[
  {
    "id": "hero-emp",
    "type": "hero",
    "title": "ÚNETE AL EQUIPO PYPER",
    "subtitle": "¿Te apasiona la educación y la tecnología? Estamos buscando personas innovadoras.",
    "theme": "dark"
  },
  {
    "id": "grid-emp",
    "type": "grid",
    "title": "¿Por qué trabajar con nosotros?",
    "items": [
      { "icon": "rocket", "title": "Crecimiento", "description": "Oportunidades constantes de capacitación." },
      { "icon": "groups", "title": "Ambiente", "description": "Un equipo joven y dinámico." },
      { "icon": "star", "title": "Innovación", "description": "Trabaja con las últimas tecnologías." }
    ]
  },
  {
    "id": "cta-emp",
    "type": "cta",
    "title": "¿No encuentras la vacante ideal?",
    "subtitle": "Envíanos tu currículum de todos modos. Siempre estamos buscando talento excepcional.",
    "buttonText": "recursos.humanos@pyper.com.py",
    "buttonLink": "mailto:recursos.humanos@pyper.com.py",
    "buttonIcon": "mail",
    "theme": "dark"
  }
]' WHERE slug = 'empleo';
