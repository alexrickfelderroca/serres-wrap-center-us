/* =====================================================================
   SERRES — site-wide language switcher (EN / ES)
   ---------------------------------------------------------------------
   • The static HTML ships in ENGLISH (SEO base language). This script
     reversibly translates static DOM text nodes + a few attributes
     against a curated EN→ES dictionary: the inline English text must
     match a dictionary key byte-for-byte. Anything not in the dictionary
     is left untouched (graceful — car names, film names, codes, place
     names, PPF/SiO₂/3M, units, etc. stay as-is).
   • A dictionary value of "" renders nothing in Spanish (used for inline
     fragments whose words reflow into other fragments).
   • Injects a segmented EN/ES switcher into the desktop nav and the
     mobile overlay menu, styled to match the chrome / dark aesthetic.
   • Persists the choice in localStorage and re-applies on every page.
   • Data-driven sections (price tiers, testimonials, finish filters)
     manage their own copy and just listen for `serres:langchange`.
   Auto-loaded by assets/serres-enhance.js on every page.
   ===================================================================== */
(function () {
  "use strict";

  var STORE = "serres-lang";
  var LANGS = ["en", "es"];
  var LABELS = { en: "EN", es: "ES" };

  /* ===================================================================
     DICTIONARY  —  "English source" : "español"
     A value of "" means: render nothing in Spanish (used for
     inline-split headings whose words reflow into other fragments).
     =================================================================== */
  var DICT = {
    /* ---------- NAV / shared actions ---------- */
    "Services": "Servicios",
    "Gallery": "Galería",
    "Projects": "Proyectos",
    "Prices": "Precios",
    "Why SERRES": "Por qué SERRES",
    "Contact": "Contacto",
    "Get a Quote": "Pedir presupuesto",
    "Explore Services": "Ver servicios",
    "Back to site": "Volver al sitio",
    "All services": "Todos los servicios",
    "Call the Studio": "Llamar al taller",
    "Talk to the Studio": "Hablar con el taller",
    "See the Gallery": "Ver la galería",
    "See the Work": "Ver el trabajo",
    "See Projects": "Ver proyectos",
    "Request Your Build": "Solicita tu proyecto",
    "What's Included": "Qué incluye",
    "About the Exclusive": "Sobre el Exclusivo",
    "Scroll": "Desliza",
    "Chat on WhatsApp": "Escríbenos por WhatsApp",
    "Open menu": "Abrir menú",
    "Close menu": "Cerrar menú",

    /* ---------- HOME ---------- */
    "PPF, Car Wrap & Detailing in Boca Raton | SERRES":
      "PPF, Car Wrap y Detailing en Boca Raton | SERRES",
    "Premium Detailing & Customization":
      "Detailing y personalización premium",
    "Elevate": "Eleva",
    "your dream": "tu sueño",
    "PPF, custom Car Wrap and concours-level detailing in Boca Raton, Florida — engineered for the cars you build your life around. One workshop. Obsessive standards.":
      "PPF, Car Wrap a medida y detailing de nivel concours en Boca Raton, Florida, pensados para los coches alrededor de los que construyes tu vida. Un taller. Estándares obsesivos.",
    "The SERRES Build": "La transformación SERRES",
    "Our services": "Nuestros servicios",
    "Choose where to begin.": "Elige por dónde empezar.",
    "Six specialities, one standard. Tap a service to see the process, materials and pricing.":
      "Seis especialidades, un mismo estándar. Toca un servicio para ver el proceso, los materiales y los precios.",
    "Invisible protection": "Protección invisible",
    "Color change": "Cambio de color",
    "Seal & gloss": "Sellado y brillo",
    "Inside & outside": "Interior y exterior",
    "Aero & stance": "Aero y stance",
    "We make your": "Hacemos realidad tu",
    "dream car": "coche soñado",
    "a reality": "",
    "CAR WRAP": "CAR WRAP",
    "Ceramic": "Cerámica",
    "Paint Correction": "Corrección de pintura",
    "Body Kits": "Body Kits",
    "Scroll to transform": "Desliza para transformar",
    "Book your build": "Reserva tu proyecto",
    "Bring us the car.": "Tráenos el coche.",
    "We'll redefine it.": "Lo redefiniremos.",
    "Studio": "Taller",
    "Hours": "Horario",
    "Phone": "Teléfono",
    "Mon–Sat · By appointment": "Lun–Sáb · Con cita previa",
    "Follow & chat": "Síguenos y escríbenos",
    "Premium paint protection, custom wraps, and concours-level detailing.":
      "Protección de pintura, Car Wrap a medida y detailing de nivel concours.",
    "Paint Protection Film": "Paint Protection Film",
    "Boca Raton, Florida": "Boca Raton, Florida",
    "Follow": "Síguenos",
    "© 2026 SERRES. All rights reserved.":
      "© 2026 SERRES. Todos los derechos reservados.",
    "PPF · Car Wrap · Detailing · Paint Correction · Body Kits":
      "PPF · Car Wrap · Detailing · Corrección de pintura · Body Kits",
    "Call SERRES": "Llamar a SERRES",

    /* ---------- GALLERY ---------- */
    "Projects & Work Gallery — PPF, Car Wrap & Detailing | SERRES": "Proyectos y Galería de Trabajos — PPF, Car Wrap y Detailing | SERRES",
    "Our": "Nuestros",
    "The Showroom": "El showroom",
    "The": "La",
    "Every car gets its own room in this gallery of work. All of it shot by us — no stock photos, no rented cars. Pick a build below, or scroll the floor.":
      "Cada coche tiene su propia sala en esta galería de trabajos. Todo fotografiado por nosotros — sin fotos de stock ni coches de alquiler. Elige un proyecto abajo o recorre la planta.",
    "RAUH-Welt Begriff": "RAUH-Welt Begriff",
    "A widebody RAUH-Welt 993 — riveted arches, race wing and a mirror-silver finish.":
      "Un RAUH-Welt 993 widebody — pasos de rueda remachados, alerón de competición y un acabado plata espejo.",
    "Detailing": "Detailing",
    "Frames": "Tomas",
    "G87 · Frozen Grey Wrap": "G87 · Car Wrap gris frozen",
    "A new G87 M2 wrapped in a deep frozen grey, photographed on a city rooftop with a communications tower behind it. Matte body, gloss-black detailing, carbon accents.":
      "Un M2 G87 nuevo con Car Wrap en un gris frozen profundo, fotografiado en una azotea urbana con una torre de telecomunicaciones detrás. Carrocería mate, detalles en negro brillo, acentos de carbono.",
    "A90 · Pearl White": "A90 · Blanco perla",
    "A pearl-white GR Supra protected and sealed, then taken out into the open countryside.":
      "Un GR Supra blanco perla protegido y sellado, llevado después a campo abierto.",
    "E92 · Gloss Black": "E92 · Negro brillo",
    "A lowered E92 335i in deep gloss black — caught rolling at speed on the highway and parked up on a cypress-lined coast road. Paint correction and a slick protective finish.":
      "Un E92 335i rebajado en negro brillo profundo — captado rodando a velocidad en la autopista y aparcado en una carretera de costa bordeada de cipreses. Corrección de pintura y un acabado protector deslizante.",
    "G09 · Matte Black": "G09 · Negro mate",
    "A matte-black XM wrapped in full PPF and finished inside and out — illuminated kidney grille, Alcantara starlight headliner and quad exhaust, shot on a quiet, sun-broken back road.":
      "Un XM negro mate cubierto con PPF completo y rematado por dentro y por fuera — parrilla iluminada, cielo estrellado de Alcantara y escape cuádruple, fotografiado en una carretera secundaria tranquila con el sol entre las nubes.",
    "Your car next": "El próximo, tu coche",
    "Earn your": "Gánate tu",
    "own room.": "propia sala.",
    "© 2026 SERRES. All rights reserved. \u00A0·\u00A0 Shot on real client cars":
      "© 2026 SERRES. Todos los derechos reservados. \u00A0·\u00A0 Sobre coches reales de clientes",
    /* gallery shot captions (visible on hover + in lightbox) */
    "In the studio": "En el estudio",
    "Mirror finish": "Acabado espejo",
    "Doors open": "Puertas abiertas",
    "Widebody profile": "Perfil widebody",
    "Detail bay": "Box de detailing",
    "Snow-dusted": "Con nieve",
    "Winter": "Invierno",
    "Rooftop": "Azotea",
    "Tower": "Torre",
    "Rear detail": "Detalle trasero",
    "Wrap": "Wrap",
    "Farmhouse driveway": "Entrada de la finca",
    "Mountain road": "Carretera de montaña",
    "Gloss": "Brillo",
    "Dappled light": "Luz tamizada",
    "Rolling shot": "Toma rodando",
    "On the road": "En la carretera",
    "Coast road": "Carretera de costa",
    "Gloss black": "Negro brillo",
    "Back road": "Carretera secundaria",
    "Lit grille": "Parrilla iluminada",
    "Detail": "Detalle",
    "Quad exhaust": "Escape cuádruple",
    "Starlight headliner": "Cielo estrellado",
    "Interior": "Interior",
    "Cockpit": "Habitáculo",
    /* gallery lightbox data-note strings */
    "Front three-quarter · In the studio": "Tres cuartos delantero · En el estudio",
    "From above · Mirror finish": "Desde arriba · Acabado espejo",
    "Doors open · Front": "Puertas abiertas · Frontal",
    "Side profile · Detail bay": "Perfil lateral · Box de detailing",
    "Snow-dusted · The ramp": "Con nieve · La rampa",
    "Frozen grey · Rooftop": "Gris frozen · Azotea",
    "Front end · Tower": "Frontal · Torre",
    "Rear deck detail": "Detalle trasero",
    "Pearl white · Farmhouse driveway": "Blanco perla · Entrada de la finca",
    "Rear quarter · Mountain road": "Cuarto trasero · Carretera de montaña",
    "Rear three-quarter · Dappled light": "Tres cuartos trasero · Luz tamizada",
    "Gloss black · Rolling shot": "Negro brillo · Toma rodando",
    "Gloss black · Coast road": "Negro brillo · Carretera de costa",
    "Front three-quarter · Back road": "Tres cuartos delantero · Carretera secundaria",
    "Illuminated kidney grille": "Parrilla iluminada",
    "Rear · Quad exhaust": "Trasera · Escape cuádruple",
    "Alcantara starlight headliner": "Cielo estrellado de Alcantara",
    "Cockpit · M steering wheel": "Habitáculo · Volante M",
    "Jump to a car": "Ir a un coche",
    "Ligier · Matte Black Car Wrap": "Ligier · Car Wrap negro mate",
    "A Ligier microcar transformed with a matte black Car Wrap — red grille accents, black wheels with red details and smoked lights. The same standard of finish, in a small footprint.":
      "Un microcoche Ligier transformado con Car Wrap negro mate — acentos rojos en la parrilla, llantas en negro con detalles rojos y ópticas ahumadas. El mismo estándar de acabado, en formato pequeño.",
    "Matte Black": "Negro mate",
    "Hex lighting": "Luz hexagonal",
    "Rear three-quarter · In the studio": "Tres cuartos trasero · En el estudio",
    "Front three-quarter · Hex lighting": "Tres cuartos delantero · Luz hexagonal",
    "F40 · Satin Grey Car Wrap": "F40 · Car Wrap gris satinado",
    "1 Series": "Serie 1",
    "A 1 Series taken from its factory color to a satin grey Car Wrap — gloss black grille and contrasting roof, shot under the studio hex lights.":
      "Un Serie 1 llevado del color de fábrica a un Car Wrap gris satinado — parrilla en negro brillo y techo en contraste, fotografiado bajo las luces hexagonales del estudio.",
    /* gallery — Porsche Cayenne (09) */
    "E-Hybrid · Satin Black Wrap": "E-Hybrid · Car Wrap negro satinado",
    "A new-generation Cayenne E-Hybrid transformed with a satin black Car Wrap — blacked-out trim, gloss-black wheels and the acid-green calipers left as the only flash of color.":
      "Un Cayenne E-Hybrid de nueva generación transformado con Car Wrap negro satinado — molduras en negro, llantas negro brillo y las pinzas verde ácido como único toque de color.",
    "Head-on · Studio lights": "De frente · Luces del estudio",
    "Front quarter · Acid-green calipers": "Cuarto delantero · Pinzas verde ácido",
    "Acid-green calipers": "Pinzas verde ácido",
    "Porsche crest · Satin black hood": "Escudo Porsche · Capó negro satinado",
    "The crest": "El escudo",
    /* gallery — Porsche 911 Carrera GTS (10) */
    "992 · Satin Sand Wrap": "992 · Car Wrap arena satinado",
    "A 992 Carrera GTS in a full color change to a satin sand Car Wrap — gloss-black roof, black wheels, red calipers and the PORSCHE side script kept in black.":
      "Un 992 Carrera GTS con cambio de color completo a Car Wrap arena satinado — techo negro brillo, llantas negras, pinzas rojas y el lateral PORSCHE en negro.",
    "Satin Sand": "Arena satinada",
    "Head-on · Satin sand finish": "De frente · Acabado arena satinada",
    "Rear three-quarter · The green wall": "Tres cuartos trasero · La pared verde",
    "The green wall": "La pared verde",
    "Light bar · GTS badge": "Barra de luz · Emblema GTS",
    "Light bar": "Barra de luz",

    /* ---------- PRICES (static chrome only; tiers handled in-page) ---------- */
    "SERRES — Prices": "Precios — PPF, Car Wrap, Ceramic Coating y Detailing | SERRES",
    "Transparent Pricing": "Precios transparentes",
    "Pick your": "Elige tu",
    "level.": "nivel.",
    "PPF (from €890), Car Wrap (from €250), Ceramic Coating (from €340) and detailing (from €35), VAT included. Three levels per service; every car is confirmed with an exact quote in person.":
      "Precios de PPF (desde 890 €), Car Wrap (desde 250 €), Ceramic Coating (desde 340 €) y detailing (desde 35 €), IVA incluido. Tres niveles por servicio; cada coche se confirma con un presupuesto exacto en persona.",
    "Guide prices · final quote depends on vehicle size, condition & film choice · no maintenance kit included":
      "Precios orientativos · el presupuesto final depende del tamaño del vehículo, su estado y la elección de film · no incluyen kit de mantenimiento",
    "Compare": "Compara",
    "levels": "niveles",
    "Want everything?": "¿Lo quieres todo?",
    "The full build is a": "El proyecto completo es un",
    "Exclusive.": "Exclusivo.",
    "PPF, wrap, correction, ceramic, interior and body work — one car, one vision, priced as a single project. We take on a limited number each year.":
      "PPF, Car Wrap, corrección, Ceramic Coating, interior y carrocería — un coche, una visión, presupuestado como un único proyecto. Aceptamos un número limitado cada año.",
    "© 2026 SERRES. All rights reserved. \u00A0·\u00A0 Guide prices in EUR, VAT included":
      "© 2026 SERRES. Todos los derechos reservados. \u00A0·\u00A0 Precios orientativos en EUR, IVA incluido",

    /* ---------- PROJECTS / EXCLUSIVO ---------- */
    "Exclusive — Car Transformation Projects in Boca Raton | SERRES": "Exclusivo — Proyectos de Transformación en Boca Raton | SERRES",
    "Exclusive": "Exclusivo",
    "One car.": "Un coche.",
    "Everything.": "Todo.",
    "Builds a year": "Exclusivos al año",
    "Car at a time": "Coche a la vez",
    "Bespoke": "A medida",
    "The Exclusive is our complete car transformation project in Boca Raton: paint correction, color change, PPF, Ceramic Coating, body work and interior — every discipline we have, applied to one car as a single project.":
      "Exclusivo es nuestro proyecto de transformación completa de coches en Boca Raton: corrección de pintura, cambio de color, PPF, Ceramic Coating, carrocería e interior — cada disciplina que tenemos, aplicada a un coche como un único proyecto.",
    "The Scope": "El alcance",
    "Every discipline.": "Cada disciplina.",
    "One vision.": "Una visión.",
    "An Exclusive isn't a bundle of services — it's one design, executed across every surface of the car.":
      "Un Exclusivo no es un paquete de servicios — es un único diseño, ejecutado en cada superficie del coche.",
    "The foundation. Multi-stage machine polishing until the paint reads flawless under hex lighting.":
      "La base. Pulido a máquina multietapa hasta que la pintura se ve impecable bajo la luz hexagonal.",
    "The identity. A full color change or signature film chosen in a one-to-one design consultation.":
      "La identidad. Un cambio de color completo o un film signature elegido en una consulta de diseño personalizada.",
    "The insurance. Self-healing film over the finished surfaces, edges tucked, invisible.":
      "El seguro. Film autorreparable sobre las superficies acabadas, bordes ocultos, invisible.",
    "Ceramic Coating": "Ceramic Coating",
    "The seal. Multi-layer SiO₂ over paint, film and glass for years of slick protection.":
      "El sellado. SiO₂ multicapa sobre pintura, film y cristales para años de protección deslizante.",
    "Body & Stance": "Carrocería y stance",
    "The silhouette. Aero, arches, wheels and fitment resolved as part of the same design.":
      "La silueta. Aero, pasos de rueda, llantas y encaje resueltos como parte del mismo diseño.",
    "Interior Revival": "Renovación de interior",
    "The cockpit. Steam-cleaned, conditioned and protected until it matches the outside.":
      "El habitáculo. Limpiado a vapor, acondicionado y protegido hasta igualar el exterior.",
    "Explore": "Ver más",
    "How it works": "Cómo funciona",
    "Three steps to": "Tres pasos hacia",
    "a different car.": "un coche distinto.",
    "The Consultation": "La consulta",
    "Bring the car, or just the idea. We talk colors, films, stance and budget — and tell you honestly what's worth doing on your car.":
      "Trae el coche, o solo la idea. Hablamos de colores, films, stance y presupuesto — y te decimos con honestidad qué merece la pena hacer en tu coche.",
    "The Blueprint": "El plano",
    "You receive a single document: the full design, the exact scope, the timeline and a fixed price estimation. No surprises later.":
      "Recibes un único documento: el diseño completo, el alcance exacto, los plazos y una estimación de precio cerrada. Sin sorpresas después.",
    "The Build": "El proyecto",
    "Your car gets the studio to itself. One team, start to finish — with photo updates at every milestone until handover day.":
      "Tu coche tiene el taller para él solo. Un equipo, de principio a fin — con fotos en cada hito hasta el día de la entrega.",
    "Limited by design": "Limitado por diseño",
    "Six Exclusives.": "Seis Exclusivos.",
    "Per year. That's it.": "Al año. Nada más.",
    "A full build takes over the studio for weeks, so we only accept a handful each year. Tell us about your car — if the vision fits, we'll reserve your slot and prepare your estimation.":
      "Un proyecto completo ocupa el taller durante semanas, así que solo aceptamos unos pocos al año. Cuéntanos tu coche — si la visión encaja, reservamos tu plaza y preparamos tu estimación.",
    "© 2026 SERRES. All rights reserved. \u00A0·\u00A0 Exclusivo — limited full builds":
      "© 2026 SERRES. Todos los derechos reservados. \u00A0·\u00A0 Exclusivo — proyectos completos limitados",

    /* ---------- WHY SERRES (static; testimonials in-page) ---------- */
    "Detailing Studio in Boca Raton — Why SERRES": "Estudio de Detailing en Boca Raton — Por Qué SERRES",
    "Why": "Por qué",
    "Cars Transformed": "Coches transformados",
    "Average Rating": "Valoración media",
    "Workshop": "Taller",
    "We are a detailing studio in Boca Raton, Florida, with one obsession: doing it properly. No shortcuts, no “good enough” — meticulous prep, premium materials and the same standards applied to a daily driver and a hypercar alike.":
      "Somos un estudio de detailing en Boca Raton, Florida, con una obsesión: hacerlo bien. Sin atajos, sin “ya vale” — solo preparación meticulosa, materiales premium y los mismos estándares aplicados a un coche diario y a un hiperdeportivo por igual.",
    "The Difference": "La diferencia",
    "Standards you": "Estándares que",
    "can measure.": "puedes medir.",
    "Four principles that decide whether a car leaves the studio — or stays until it's right.":
      "Cuatro principios que deciden si un coche sale del taller — o se queda hasta que está perfecto.",
    "Obsessive": "Preparación",
    "prep": "obsesiva",
    "Most of the work happens before the result shows. Decontamination, measurement and correction come first — every time.":
      "La mayor parte del trabajo ocurre antes de que se vea el resultado. Descontaminación, inspección y corrección van primero — siempre.",
    "Results": "Resultados",
    "on display": "a la vista",
    "Controlled hex lighting and panel-by-panel inspection. We show you the finish under the light, not just in photos.":
      "Iluminación hexagonal controlada y revisión panel a panel. Te enseñamos el acabado bajo la luz, no solo en fotos.",
    "Premium": "Materiales",
    "materials": "premium",
    "Only certified films, coatings and compounds — backed by real manufacturer warranties, never grey-market stock.":
      "Solo films, recubrimientos y compuestos certificados — respaldados por garantías reales de fabricante, nunca stock de mercado gris.",
    "One": "Un solo",
    "workshop": "taller",
    "One point of contact from start to finish: the same team that quotes your car is the team that hands it back.":
      "Un único interlocutor de principio a fin: el mismo equipo que presupuesta tu coche es el que te lo entrega.",
    "What clients say": "Lo que dicen los clientes",
    "Trusted with": "La confianza de",
    "the cars they": "los coches que",
    "love most.": "más quieren.",
    "From a first wrap to a full PPF and correction build — these are the people who handed us the keys, and what they said when they got them back.":
      "Desde un primer Car Wrap hasta un proyecto completo de PPF y corrección — estas son las personas que nos dieron las llaves, y lo que dijeron al recuperarlas.",
    "Avg Rating": "Valoración media",
    "Cars": "Coches",
    "Referrals": "Recomendaciones",
    "Bring us the car": "Tráenos el coche",
    "Hold us to the": "Exígenos el",
    "standard.": "estándar.",
    "© 2026 SERRES. All rights reserved. \u00A0·\u00A0 Premium Detailing & Customization":
      "© 2026 SERRES. Todos los derechos reservados. \u00A0·\u00A0 Detailing y personalización premium",

    /* ---------- SERVICE: shared ---------- */
    "The Transformation": "La transformación",
    "The Process": "El proceso",
    "Drag to reveal": "Desliza para revelar",
    "Drag to compare before and after": "Desliza para comparar antes y después",
    "Before": "Antes",
    "After": "Después",
    "Vehicle": "Vehículo",
    "Coverage": "Cobertura",
    "Warranty": "Garantía",
    "Finish": "Acabado",
    "Film": "Film",
    "Process": "Proceso",
    "Effect": "Efecto",
    "Coating": "Recubrimiento",
    "Lifespan": "Durabilidad",
    "Defects": "Defectos",
    "Turnaround": "Plazo",
    "Kit": "Kit",
    "Fitment": "Encaje",

    /* ---------- SERVICE: PPF ---------- */
    "SERRES — Paint Protection Film (PPF)": "PPF en Barcelona — Protección de Pintura | SERRES",
    "Service 03 · Paint Protection Film": "Servicio 03 · Paint Protection Film",
    "Paint": "Paint",
    "Armor": "Armor",
    "We install PPF in Boca Raton, Florida, at our own workshop: an invisible urethane skin over your factory paint that absorbs stone chips, swirls and bug acid. Self-healing film with a 3-year warranty, from 890 €. Available clear, gloss, satin and full colour-shift.":
      "Instalamos PPF en Boca Raton, Florida, en nuestro propio taller: una piel de uretano invisible sobre tu pintura de fábrica que absorbe impactos de piedra, micro-arañazos y ácido de insectos. Film autorregenerable con 3 años de garantía, desde 890 €. Disponible en transparente, brillo, satinado y colour-shift completo.",
    "Self-Healing": "Autorreparable",
    "Film Colors": "Colores de film",
    "Gloss in.": "Entra en brillo.",
    "Satin out.": "Sale en satinado.",
    "This BMW M2 came in on factory gloss. We wrapped it in a full satin protection film — drag to reveal the new finish.":
      "Este BMW M2 llegó en brillo de fábrica. Lo cubrimos con un film de protección satinado completo — desliza para revelar el nuevo acabado.",
    "Every panel was decontaminated, paint-corrected and measured before a single piece of film was laid. The satin PPF then went on edge-to-edge — bumper, arches, mirrors, door shuts — wrapping the factory gloss in a deep, stealth matte skin.":
      "Cada panel fue descontaminado, corregido y medido antes de colocar una sola pieza de film. El PPF satinado se aplicó de borde a borde — paragolpes, pasos de rueda, espejos, marcos de puerta — envolviendo el brillo de fábrica en una piel mate sigilosa y profunda.",
    "The result is a colour-and-texture change and a protective layer in one: stone-chip resistance, self-healing topcoat and a finish that's fully reversible.":
      "El resultado es un cambio de color y textura y una capa protectora en uno: resistencia a impactos de piedra, capa superior autorreparable y un acabado totalmente reversible.",
    "Satin Self-Healing PPF": "PPF satinado autorreparable",
    "Full body wrap": "Cobertura de carrocería completa",
    "Why PPF": "Por qué PPF",
    "Protection you": "Protección que",
    "never see.": "no se ve.",
    "A premium film engineered to take the damage so your paint never does.":
      "Un film premium diseñado para llevarse el daño y que tu pintura nunca lo sufra.",
    "Stone-chip": "Defensa contra",
    "defense": "impactos",
    "Absorbs the impact of gravel, debris and road grit across the highest-risk panels.":
      "Absorbe el impacto de gravilla, restos y suciedad de la carretera en los paneles de mayor riesgo.",
    "Self-healing": "Capa superior",
    "topcoat": "autorreparable",
    "Light swirls and scratches vanish with heat from the sun or warm water.":
      "Los micro-arañazos y rayas leves desaparecen con el calor del sol o agua caliente.",
    "Stain &": "Resistente a",
    "UV resistant": "manchas y UV",
    "Repels bug acid, sap, salt and fuel, and blocks the UV that fades paint over time.":
      "Repele ácido de insectos, savia, sal y combustible, y bloquea los UV que decoloran la pintura con el tiempo.",
    "Fully": "Totalmente",
    "removable": "reversible",
    "Lifts cleanly years later with no residue — protecting resale and original finish.":
      "Se retira limpio años después sin residuos — protegiendo el valor de reventa y el acabado original.",
    "Three layers,": "Tres capas,",
    "one invisible skin.": "una piel invisible.",
    "Each PPF panel is a precision-engineered stack — a sacrificial self-healing topcoat, a shock-absorbing urethane core and a clear, conformable adhesive that disappears over your paint.":
      "Cada panel de PPF es una estructura de precisión — una capa superior autorreparable de sacrificio, un núcleo de uretano que absorbe impactos y un adhesivo transparente y adaptable que desaparece sobre tu pintura.",
    "Self-healing topcoat": "Capa superior autorreparable",
    "Elastomeric · heals with heat": "Elastomérica · cura con calor",
    "Urethane core": "Núcleo de uretano",
    "Impact & abrasion barrier": "Barrera de impacto y abrasión",
    "Clear adhesive": "Adhesivo transparente",
    "Conformable · residue-free": "Adaptable · sin residuos",
    "Color PPF": "PPF de color",
    "Protect it.": "Protégelo.",
    "Express it.": "Exprésalo.",
    "PPF isn't only clear. 50+ colors from several professional brands — gloss, satin, matte and colour-shift — a finish change and a shield in a single film.":
      "El PPF no es solo transparente. Más de 50 colores de varias marcas profesionales — brillo, satinado, mate y colour-shift — un cambio de acabado y un escudo en un solo film.",
    "Previous color": "Color anterior",
    "Next color": "Color siguiente",
    "Finishes shown are representative of the protection film ranges we install. Final swatches confirmed in-studio under our lighting before application.":
      "Los acabados mostrados son representativos de las gamas de film de protección con las que trabajamos. Las muestras finales se confirman en el taller bajo nuestra iluminación antes de aplicar.",
    "Shield your car": "Blinda tu coche",
    "Protect what you": "Protege lo que",
    "drive.": "conduces.",
    "© 2026 SERRES. All rights reserved. \u00A0·\u00A0 Paint Protection Film · Inozetek · 3M":
      "© 2026 SERRES. Todos los derechos reservados. \u00A0·\u00A0 Paint Protection Film · Inozetek · 3M",

    /* ---------- SERVICE: CERAMIC ---------- */
    "SERRES — Ceramic Coating": "Tratamiento Cerámico para Coche en Barcelona | SERRES",
    "Service 02 · Ceramic Coating": "Servicio 02 · Ceramic Coating",
    "Liquid": "Cristal",
    "Glass": "líquido",
    "Surface Hardness": "Dureza superficial",
    "Protection": "Protección",
    "Water Contact": "Contacto del agua",
    "The SERRES ceramic coating for cars in Boca Raton: a SiO₂ coating that chemically bonds to the paint — sealing the gloss with a slick, hydrophobic layer that repels water, grime and UV for years.":
      "El tratamiento cerámico para coche en Boca Raton de SERRES: un recubrimiento SiO₂ que se adhiere químicamente a la pintura — sella el brillo con una capa hidrófoba y deslizante que repele agua, suciedad y UV durante años.",
    "Water just": "El agua",
    "lets go.": "se suelta.",
    "Same hood, same hex light. Drag the slider to watch flat, clinging water snap into tight beads that roll straight off.":
      "Mismo capó, misma luz hexagonal. Desliza el control para ver cómo el agua plana y pegada se convierte en gotas apretadas que ruedan al instante.",
    "Before coating, water lies flat across the panel and clings — dragging dust, minerals and road film into the surface as it slowly dries into spots.":
      "Antes del recubrimiento, el agua queda plana sobre el panel y se adhiere — arrastrando polvo, minerales y película de carretera a la superficie mientras se seca en manchas.",
    "Once our ceramic layer cures, the surface energy drops dramatically. Water can't wet the paint, so it pulls into beads and sheets away — taking dirt with it and leaving the gloss untouched.":
      "Una vez cura nuestra capa cerámica, la energía superficial cae drásticamente. El agua no puede mojar la pintura, así que forma gotas y resbala — llevándose la suciedad y dejando el brillo intacto.",
    "Sedan · Gloss Black": "Sedán · Negro brillo",
    "SiO₂ ceramic · 2 layers": "Cerámica SiO₂ · 2 capas",
    "Hydrophobic · self-cleaning": "Hidrófobo · autolimpiante",
    "Up to 5 years": "Hasta 5 años",
    "Prep. Coat.": "Prepara. Aplica.",
    "Cure.": "Cura.",
    "Ceramic is only as good as the surface beneath it. We correct and decontaminate first, then bond the coating and cure it in.":
      "La cerámica solo es tan buena como la superficie de debajo. Primero corregimos y descontaminamos, luego adherimos el recubrimiento y lo curamos.",
    "Prep & Decon": "Preparación y descontaminación",
    "Wash · clay · paint correction": "Lavado · clay · corrección de pintura",
    "Every defect is locked in forever once coated — so we decontaminate, clay and machine-correct the paint to a clean, swirl-free base first.":
      "Cada defecto queda sellado para siempre una vez recubierto — por eso primero descontaminamos, pasamos clay y corregimos a máquina hasta una base limpia y sin micro-arañazos.",
    "Application": "Aplicación",
    "SiO₂ ceramic · hand-levelled": "Cerámica SiO₂ · nivelada a mano",
    "The liquid coating is laid down panel by panel and levelled by hand in tight sections, bonding chemically with the clear coat as it flashes.":
      "El recubrimiento líquido se aplica panel a panel y se nivela a mano en secciones pequeñas, adhiriéndose químicamente al barniz a medida que evapora.",
    "Cure": "Curado",
    "Controlled cure · 24h dwell": "Curado controlado · 24h de reposo",
    "The coating is left to cross-link and harden in a dust-free, climate-controlled bay — setting into the slick, glass-hard shell.":
      "El recubrimiento se deja reticular y endurecer en un box sin polvo y con clima controlado — fraguando en una capa deslizante y dura como el cristal.",
    "Water tells": "El agua cuenta",
    "the whole story.": "toda la historia.",
    "Hydrophobic performance is measured by water contact angle — the higher the angle, the tighter water beads and the faster it sheets away. Bare paint barely holds a bead.":
      "El rendimiento hidrófobo se mide por el ángulo de contacto del agua — cuanto mayor el ángulo, más apretadas las gotas y más rápido resbalan. La pintura desnuda apenas forma gota.",
    "Bare paint": "Pintura desnuda",
    "Ceramic coated": "Con cerámica",
    "Seal in the shine": "Sella el brillo",
    "Lock in the": "Fija el",
    "gloss.": "brillo.",
    "© 2026 SERRES. All rights reserved. \u00A0·\u00A0 SiO₂ Ceramic Coating":
      "© 2026 SERRES. Todos los derechos reservados. \u00A0·\u00A0 Ceramic Coating SiO₂",

    /* ---------- SERVICE: DETAILING ---------- */
    "SERRES — Detailing": "Detailing y Limpieza Interior de Coche en Barcelona | SERRES",
    "Service 05 · Detailing": "Servicio 05 · Detailing",
    "Showroom": "Como recién",
    "Fresh": "entregado",
    "In & Out": "Dentro y fuera",
    "Hand Finished": "Acabado a mano",
    "Cut Corners": "Atajos",
    "Car detailing in Boca Raton, Florida: steam cleaning, decontamination and hand finishing, inside and out, at our own studio. Deep Clean from €150.":
      "Detailing de coche en Boca Raton, Florida: limpieza a vapor, descontaminación y acabado a mano, por dentro y por fuera, en nuestro propio estudio. Deep Clean desde 150 €.",
    "Interior Detailing": "Detailing de interior",
    "Lived-in": "De usado",
    "to like-new.": "a como nuevo.",
    "Ground-in dust, dull plastics and tired leather — steam-cleaned, conditioned and reset until the cabin feels factory again.":
      "Polvo incrustado, plásticos apagados y cuero cansado — limpiados a vapor, acondicionados y reiniciados hasta que el habitáculo se siente de fábrica otra vez.",
    "Dust & Grime": "Polvo y suciedad",
    "Steam-Cleaned": "Limpio a vapor",
    "Exterior Detailing": "Detailing de exterior",
    "Dust-caked": "De lleno de polvo",
    "to deep gloss.": "a brillo profundo.",
    "A full decontamination wash lifts road film and fallout, then we dry and dress every panel until the paint reads wet under the lights.":
      "Un lavado de descontaminación completo retira la película de carretera y la contaminación férrica, luego secamos y tratamos cada panel hasta que la pintura se ve húmeda bajo las luces.",
    "Dusty & Dull": "Sucio y apagado",
    "Deep Gloss": "Brillo profundo",
    "Strip. Clean.": "Retira. Limpia.",
    "Protect.": "Protege.",
    "A full inside-and-out reset — we remove what's built up, clean down to the surface, then dress and protect every finish.":
      "Un reinicio completo por dentro y por fuera — quitamos lo acumulado, limpiamos hasta la superficie, luego tratamos y protegemos cada acabado.",
    "Decontaminate": "Descontaminar",
    "Foam wash · clay · fallout": "Lavado con espuma · clay · descontaminación",
    "A pH-neutral foam bath lifts loose grime, then clay and iron remover pull out the bonded road film and brake fallout a wash leaves behind.":
      "Un baño de espuma de pH neutro retira la suciedad suelta, luego el clay y el descontaminante férrico sacan la película de carretera y la contaminación de freno que deja un lavado.",
    "Deep Clean": "Limpieza profunda",
    "Steam · extraction · brushes": "Vapor · extracción · cepillos",
    "Inside, every panel, vent and seam is steamed and agitated; carpets and leather are extracted and wiped down until the cabin is truly clean.":
      "Dentro, cada panel, rejilla y costura se trata a vapor y se cepilla; alfombras y cuero se extraen y se limpian hasta que el habitáculo está realmente limpio.",
    "Dress & Protect": "Tratar y proteger",
    "Sealant · conditioner · UV": "Sellador · acondicionador · UV",
    "Paint is sealed for gloss and beading, trim and leather are conditioned and UV-protected, and the glass gets a rain-repellent treatment and is left streak-free.":
      "La pintura se sella para brillo y repelencia, los plásticos y el cuero se acondicionan y protegen de los UV, y los cristales reciben un tratamiento antilluvia y quedan sin marcas.",
    "Inside & out": "Por dentro y por fuera",
    "Make it feel": "Haz que se sienta",
    "new again.": "nuevo otra vez.",
    "© 2026 SERRES. All rights reserved. \u00A0·\u00A0 Interior & Exterior Detailing":
      "© 2026 SERRES. Todos los derechos reservados. \u00A0·\u00A0 Detailing de interior y exterior",

    /* ---------- SERVICE: PAINT CORRECTION ---------- */
    "SERRES — Paint Correction": "Pulido y Corrección de Pintura de Coche en Barcelona | SERRES",
    "Service 04 · Paint Correction": "Servicio 04 · Corrección de pintura",
    "Staged": "Pulido",
    "polishing": "por etapas",
    "Stage Polish": "Pulido por etapas",
    "Defect Removal": "Eliminación de defectos",
    "Holograms": "Hologramas",
    "SERRES car polishing in Boca Raton is a multi-stage machine paint correction that removes micro-scratches, holograms and oxidation, restoring the true gloss and depth of your paint. We work from our own studio, by appointment.":
      "El pulido de coche en Boca Raton de SERRES es una corrección multietapa a máquina que elimina micro-arañazos, hologramas y oxidación, devolviendo el brillo y la profundidad reales a tu pintura. Trabajamos desde nuestro propio estudio, con cita previa.",
    "From hazy": "De turbio",
    "to mirror.": "a espejo.",
    "Same panel, same light. Drag the slider to see swirls and dullness give way to a flawless, reflective finish.":
      "Mismo panel, misma luz. Desliza el control para ver cómo los micro-arañazos y la opacidad dan paso a un acabado impecable y reflectante.",
    "This BMW arrived with years of wash-induced swirls and micro-marring dulling its gloss black — light scattering in every direction instead of reflecting cleanly.":
      "Este BMW llegó con años de micro-arañazos de lavado y micro-marcas apagando su negro brillo — la luz dispersándose en todas direcciones en vez de reflejarse limpia.",
    "We assessed the clear coat, then cut, refined and finished the paint by machine until the defects were gone. The hex lighting now mirrors back razor-sharp, with deep, wet-looking reflections restored.":
      "Evaluamos el estado del barniz, luego cortamos, refinamos y acabamos la pintura a máquina hasta eliminar los defectos. La luz hexagonal ahora se refleja nítida, con reflejos profundos y de aspecto húmedo restaurados.",
    "BMW Coupé · Gloss Black": "BMW Coupé · Negro brillo",
    "Stage polishing · Stage 3": "Pulido por etapas · Etapa 3",
    "Swirls · holograms · oxidation": "Micro-arañazos · hologramas · oxidación",
    "Sealed & protected": "Sellado y protegido",
    "Stage 1. Stage 2.": "Etapa 1. Etapa 2.",
    "Stage 3.": "Etapa 3.",
    "No two paints are alike: the polish adapts to the condition of your paint and the level of correction needed — from a one-stage enhancement to a full three-stage correction.":
      "No hay dos pinturas iguales: el pulido se adapta al estado de tu pintura y al nivel de corrección necesario — desde un realce de una etapa hasta una corrección completa de tres.",
    "A measured, three-stage system — never a one-hit polish. We remove only what's needed and finish to true clarity.":
      "Un sistema medido de tres etapas — nunca un pulido de una sola pasada. Eliminamos solo lo necesario y acabamos hasta una claridad real.",
    "Stage 1 · Cut": "Etapa 1 · Corte",
    "Cutting pad · heavy compound": "Boina de corte · compound agresivo",
    "The aggressive stage — levelling deeper scratches, swirls and oxidation by removing a precise micron-thin layer of clear coat.":
      "La etapa agresiva — eliminando arañazos más profundos, micro-arañazos y oxidación al retirar una capa de barniz de micras precisa.",
    "Stage 2 · Refine": "Etapa 2 · Refinado",
    "Polishing pad · medium polish": "Boina de pulido · pulido medio",
    "The haze and micro-marring left by cutting are refined away, building back clarity and lifting gloss across the panel.":
      "La turbidez y las micro-marcas que deja el corte se refinan, recuperando claridad y elevando el brillo en todo el panel.",
    "Stage 3 · Finish": "Etapa 3 · Acabado",
    "Finishing pad · fine polish": "Boina de acabado · pulido fino",
    "The final mirror-finish (jewelling) pass eliminates holograms and brings the paint to a true, defect-free gloss before it's sealed in.":
      "La pasada final de acabado espejo (jewelling) elimina hologramas y lleva la pintura a un brillo real y sin defectos antes de sellarla.",
    "The numbers,": "Los números,",
    "not just the shine.": "no solo el brillo.",
    "Gloss is expressed in GU (gloss units): the higher the number, the deeper and sharper the reflection. Typical results on neglected paint:":
      "El brillo se expresa en GU (unidades de brillo): cuanto más alto, más profundo y nítido el reflejo. Resultados típicos en pintura descuidada:",
    "On arrival": "A la llegada",
    "After correction": "Tras la corrección",
    "Restore the depth": "Recupera la profundidad",
    "Bring back the": "Devuelve el",
    "© 2026 SERRES. All rights reserved. \u00A0·\u00A0 Multi-Stage Machine Polishing":
      "© 2026 SERRES. Todos los derechos reservados. \u00A0·\u00A0 Pulido por etapas a máquina",

    /* ---------- SERVICE: VINYL ---------- */
    "SERRES — Car Wrap / Vinyl": "Car Wrap en Barcelona — Cambio de Color | SERRES",
    "Service 01 · Car Wrap": "Servicio 01 · Car Wrap",
    "Car": "Car",
    "Film Colors ": "Colores de film ",
    "Finish Families": "Familias de acabado",
    "Pro film brands": "Marcas profesionales",
    "Reversible": "Reversible",
    "Film layers": "Capas de film",
    "Layers": "Capas",
    "Car wrapping in Boca Raton, Florida: we wrap your car with a full or partial color change using 3M, Avery Dennison and Inozetek films — over 150 colors in matte, satin, gloss, metallic and colour-flip. Full car from €1,490, fully reversible, at our own workshop.":
      "Car wrapping en Boca Raton, Florida: vinilamos tu coche con cambio de color total o parcial usando films 3M, Avery Dennison e Inozetek — más de 150 colores en mate, satinado, brillo, metalizado y colour-flip. Coche completo desde 1.490 €, totalmente reversible, en nuestro propio taller.",
    "The Palette": "La paleta",
    "Every color to": "Todos los colores para",
    "wrap your car": "vinilar tu coche",
    "We work with several professional brands. Pick the brand, filter by color family and drag to explore.":
      "Trabajamos con varias marcas profesionales. Elige la marca, filtra por familia de color y desliza para explorar.",
    "Scroll left": "Desplazar a la izquierda",
    "Scroll right": "Desplazar a la derecha",
    "One panel at": "Un panel a",
    "a time.": "la vez.",
    "This BMW XM arrived in factory gloss black. We stripped it back, decontaminated every surface and re-skinned it in a deep satin-black film — bumper to roofline, mirror caps to door shuts.":
      "Este BMW XM llegó en negro brillo de fábrica. Lo desnudamos, descontaminamos cada superficie y lo revestimos con un film negro satinado profundo — del paragolpes al techo, de los retrovisores a los marcos de puerta.",
    "Drag the slider to see the change. No paint touched, fully reversible, and protecting the original finish underneath.":
      "Desliza el control para ver el cambio. Sin tocar la pintura, totalmente reversible y protegiendo el acabado original de debajo.",
    "3M\u2122 2080 Satin Black": "3M\u2122 2080 Satin Black",
    "Full body color change": "Cambio de color de carrocería completa",
    "5–7 days": "5–7 días",
    "Book your wrap": "Reserva tu Car Wrap",
    "Found your": "¿Has encontrado tu",
    "color?": "color?",
    "© 2026 SERRES. All rights reserved. \u00A0·\u00A0 Car Wrap · 3M · Avery Dennison · Inozetek":
      "© 2026 SERRES. Todos los derechos reservados. \u00A0·\u00A0 Car Wrap · 3M · Avery Dennison · Inozetek",

    /* ---------- SERVICE: BODY KITS ---------- */
    "SERRES — Body Kits": "Montaje de Body Kits en Barcelona | SERRES",
    "Service 06 · Body Kits": "Servicio 06 · Body Kits",
    "Built for": "Hecho para",
    "Presence": "impactar",
    "Kit Types": "Tipos de kit",
    "Transformation": "Transformación",
    "We fit body kits at our own workshop in Boca Raton, Florida: installation, painting and OEM-level fitment of lips, diffusers, spoilers and widebody conversions, from €450. Custom rims and exhaust tips too, to completely transform your car.":
      "Realizamos el montaje de body kits en nuestro propio taller de Boca Raton, Florida: instalación, pintura y ajuste a nivel OEM de labios, difusores, alerones y conversiones widebody, desde 450 €. También llantas a medida y colas de escape para transformar por completo tu coche.",
    "Stock to": "De serie a",
    "street weapon.": "arma de calle.",
    "Same Golf GTI, same spot. Drag the slider to watch a factory rear turn into full aero — diffuser, spoiler, splitters and blacked-out tips.":
      "Mismo Golf GTI, mismo sitio. Desliza el control para ver cómo una trasera de serie se convierte en aero completo — difusor, alerón, splitters y colas en negro.",
    "This Mk7 GTI came in on its standard rear end — clean, but conservative. The owner wanted real road presence without touching the paint.":
      "Este GTI Mk7 llegó con su trasera estándar — limpia, pero conservadora. El propietario quería presencia real en carretera sin tocar la pintura.",
    "We fitted a full rear aero package: an aggressive diffuser, extended roof spoiler, side and rear splitters and gloss-black exhaust tips — all colour-matched and mounted to factory standards.":
      "Montamos un paquete aero trasero completo: un difusor agresivo, alerón de techo extendido, splitters laterales y traseros y colas de escape en negro brillo — todo igualado en color y montado a estándares de fábrica.",
    "VW Golf GTI Mk7 · Tornado Red": "VW Golf GTI Mk7 · Tornado Red",
    "Rear diffuser · spoiler · splitters": "Difusor trasero · alerón · splitters",
    "Gloss-black exhaust tips": "Colas de escape en negro brillo",
    "Bolt-on · OEM-grade": "Atornillado · nivel OEM",
    "What We Fit": "Qué montamos",
    "Kits, rims": "Kits, llantas",
    "& tips.": "y colas.",
    "We install all types of body kits, plus the details that finish the look — custom rims and exhaust tips, sourced and fitted with precision.":
      "Instalamos todo tipo de body kits, además de los detalles que rematan el look — llantas a medida y colas de escape, suministradas y montadas con precisión.",
    "All types · OEM & aftermarket": "Todos los tipos · OEM y aftermarket",
    "Front lips, splitters, side skirts, rear diffusers, spoilers and full widebody conversions — dry-fitted, colour-matched and mounted to factory standards.":
      "Labios delanteros, splitters, faldones laterales, difusores traseros, alerones y conversiones widebody completas — montados en seco, igualados en color y fijados a estándares de fábrica.",
    "Custom Rims": "Llantas a medida",
    "Sizing · finishes · fitment": "Medidas · acabados · encaje",
    "The right wheel changes everything. We spec diameter, ET (offset) and finish to fill the arches and lock in the stance — then fit and balance them properly.":
      "La llanta correcta lo cambia todo. Definimos diámetro, ET (offset) y acabado para llenar los pasos de rueda y fijar el stance — luego las montamos y equilibramos como toca.",
    "Exhaust Tips": "Colas de escape",
    "Gloss black · chrome · carbon": "Negro brillo · cromo · carbono",
    "The finishing detail at the rear — blacked-out, polished or carbon tips, sized and aligned to sit clean against the bumper and diffuser.":
      "El detalle final en la trasera — colas en negro, pulidas o de carbono, dimensionadas y alineadas para quedar limpias contra el paragolpes y el difusor.",
    "Change the stance": "Cambia la postura",
    "Give it real": "Dale presencia",
    "presence.": "de verdad.",
    "© 2026 SERRES. All rights reserved. \u00A0·\u00A0 Body Kits · Custom Rims · Exhaust Tips":
      "© 2026 SERRES. Todos los derechos reservados. \u00A0·\u00A0 Body Kits · Llantas a medida · Colas de escape",

    /* ===================================================================
       DATA-DRIVEN SECTIONS — rendered from JS, translated in-page via
       window.SERRES_I18N.t() and re-rendered on `serres:langchange`.
       =================================================================== */

    /* ---------- PRICES: tab labels + UI words ---------- */
    "Car Wrap": "Car Wrap",
    "Correction + Ceramic": "Pulido + Cerámica",
    "pricing": "precios",
    "Most chosen": "Más elegido",
    "From": "Desde",
    "from": "desde",
    "Book via WhatsApp": "Reserva por WhatsApp",
    "Request a quote": "Pide presupuesto",
    "On request": "A consultar",
    "Message us to calculate your price": "Escríbenos para calcular tu precio",
    "Feature": "Característica",
    "Guide price": "Precio orientativo",

    /* ---------- PRICES: service blurbs ---------- */
    "Color change with films from several professional brands — from subtle accents to a full identity change.":
      "Cambio de color con films de varias marcas profesionales — desde acentos sutiles hasta un cambio de identidad completo.",
    "Self-healing paint protection film — 50+ colors from several professional brands — over the areas the road attacks first, or the whole car.":
      "Film de protección de pintura autorreparable — más de 50 colores de varias marcas profesionales — sobre las zonas que la carretera ataca primero, o el coche entero.",
    "Stage polishing to remove the swirls, then a Ceramic Coating to lock the gloss in — the two steps that belong together.":
      "Pulido por etapas para eliminar los micro-arañazos y, a continuación, un tratamiento Ceramic Coating que sella el brillo — los dos pasos que van de la mano.",
    "Machine polishing that removes swirls, holograms and oxidation — measured, not guessed.":
      "Pulido a máquina que elimina micro-arañazos, hologramas y oxidación — medido, no improvisado.",
    "From a proper reset wash to a full showroom revival, inside and out.":
      "Desde un lavado de reinicio en condiciones hasta una renovación de exposición completa, por dentro y por fuera.",
    "Aero and body work sourced, fitted and finished like it left the factory that way.":
      "Aero y carrocería suministrados, montados y rematados como si saliera así de fábrica.",

    /* ---------- PRICES: tier names ---------- */
    "Accents": "Acentos",
    "Full Color Change": "Cambio de color completo",
    "Signature Wrap": "Car Wrap Signature",
    "Front Pack": "Pack frontal",
    "Pro": "Pro",
    "Full Body": "Carrocería completa",
    "Essential": "Esencial",
    "Enhancement": "Realce",
    "Two-Stage": "Dos etapas",
    "Showroom Reset": "Reinicio de exposición",
    "Aero Parts": "Piezas aero",
    "Full Kit Fitted": "Kit completo montado",
    "Stage 1 polish to revive the gloss, then one ceramic layer to seal it — real protection, entry price.":
      "Pulido de Etapa 1 que revive el brillo y, después, una capa cerámica que lo sella — protección real, precio de entrada.",
    "Stage 2 correction plus a two-layer ceramic coat and rain-repellent glass — our standard.":
      "Corrección de Etapa 2 más un recubrimiento cerámico de dos capas y antilluvia en los cristales — nuestro estándar.",
    "Full Stage 3 correction under hex lighting, then a multi-layer ceramic stack and interior protection.":
      "Corrección completa de Etapa 3 bajo luz hexagonal y, después, varias capas cerámicas y protección de interior.",

    /* ---------- PRICES: tier descriptions ---------- */
    "Roof, mirrors and detail pieces — change the attitude, not the whole car.":
      "Techo, retrovisores y piezas de detalle — cambia la actitud, no el coche entero.",
    "Every exterior panel wrapped edge-to-edge in the color you actually wanted.":
      "Cada panel exterior vinilado de borde a borde en el color que de verdad querías.",
    "Premium and colour-flip films, with the service tailored to the vehicle configuration.":
      "Films premium y camaleón — servicio según configuración del vehículo.",
    "Bumper, partial hood and mirrors — the high-impact essentials covered.":
      "Paragolpes, capó parcial y retrovisores — lo esencial de alto impacto, cubierto.",
    "Full hood, fenders, bumper, mirrors and headlights — seamless coverage, sealed with a Ceramic Coating over the film.":
      "Capó completo, aletas, paragolpes, retrovisores y faros — cobertura sin costuras, sellada con Ceramic Coating sobre el film.",
    "Every painted panel protected, edges tucked — invisible armor, total peace of mind.":
      "Cada panel pintado protegido, bordes ocultos — blindaje invisible, tranquilidad total.",
    "Decontamination and a single coating layer — real protection, entry price.":
      "Descontaminación y una capa de recubrimiento — protección real, precio de entrada.",
    "Light polish, two coating layers, plus wheels and glass — our standard.":
      "Pulido ligero, dos capas de recubrimiento, más llantas y cristales — nuestro estándar.",
    "Full polish, multi-layer stack, wheels-off coating and interior protection.":
      "Pulido completo, varias capas, recubrimiento con llantas desmontadas y protección de interior.",
    "Single-stage polish that revives gloss and clears light wash marring.":
      "Pulido de una etapa que revive el brillo y elimina el micro-marcado de lavado.",
    "Cut and refine — the sweet spot for most daily-driven paint.":
      "Corte y refinado — el punto justo para la mayoría de pinturas de uso diario.",
    "Three-stage correction finished under hex lighting and gloss readings.":
      "Corrección de tres etapas rematada bajo luz hexagonal y mediciones de brillo.",
    "Exterior decontamination wash plus interior vacuum and wipe-down.":
      "Lavado de descontaminación exterior más aspirado y repaso del interior.",
    "Steam-cleaned interior, extracted carpets, decontaminated exterior, sealed paint.":
      "Interior limpiado a vapor, alfombras extraídas, exterior descontaminado, pintura sellada.",
    "Everything — engine bay, trim restoration, leather conditioning, 12-month sealant.":
      "Todo — vano motor, restauración de plásticos, acondicionado de cuero, sellante de 12 meses.",
    "Splitters, spoilers and diffusers — supplied and fitted with OEM-level care.":
      "Splitters, alerones y difusores — suministrados y montados con cuidado de nivel OEM.",
    "A complete body kit installed and paint-matched to your car.":
      "Un body kit completo instalado e igualado en color a tu coche.",
    "Kit, wheels, stance and arch work — a different car when it rolls out.":
      "Kit, llantas, stance y trabajo de pasos de rueda — otro coche cuando sale.",

    /* ---------- PRICES: turnaround notes ---------- */
    "From 1 day in the studio": "Desde 1 día en el taller",
    "From 3–4 days in the studio": "Desde 3–4 días en el taller",
    "From 5–7 days in the studio": "Desde 5–7 días en el taller",
    "From 2–3 days in the studio": "Desde 2–3 días en el taller",
    "From 5–8 days in the studio": "Desde 5–8 días en el taller",
    "1 day in the studio": "1 día en el taller",
    "1–2 days in the studio": "1–2 días en el taller",
    "2–3 days in the studio": "2–3 días en el taller",
    "3–4 days in the studio": "3–4 días en el taller",
    "Approx. 3 hours": "Aprox. 3 horas",
    "From 3–5 days in the studio": "Desde 3–5 días en el taller",
    "2–4 weeks · by consultation": "2–4 semanas · con consulta",

    /* ---------- PRICES: comparison-row labels ---------- */
    "Films from professional brands": "Films de marcas profesionales",
    "Service per vehicle configuration": "Servicio según configuración del vehículo",
    "Premium & colour-flip films": "Films premium y camaleón",
    "Design consultation": "Consulta de diseño",
    "Maintenance kit": "Kit de mantenimiento",
    "Film warranty": "Garantía del film",
    "Headlight protection": "Protección de faros",
    "Wrapped edges — no visible lines": "Bordes cubiertos — sin líneas visibles",
    "Door cups & sill protection": "Protección de manetas y faldones",
    "Ceramic Coating over film": "Ceramic Coating sobre el film",
    "Paint preparation": "Preparación de pintura",
    "Coating layers": "Capas de recubrimiento",
    "Rain-repellent glass treatment": "Antilluvia para los cristales",
    "Interior leather & fabric": "Cuero y tela del interior",
    "Maintenance plan": "Plan de mantenimiento",
    "Rated durability": "Durabilidad estimada",
    "Polishing stages": "Etapas de pulido",
    "Hologram-free finish": "Acabado sin hologramas",
    "Protective sealant": "Sellante protector",
    "Ceramic upgrade available": "Mejora cerámica disponible",
    "Exterior decon wash": "Lavado de descontaminación exterior",
    "Interior vacuum & wipe-down": "Aspirado y repaso interior",
    "Steam clean & carpet extraction": "Limpieza a vapor y extracción de alfombras",
    "Leather cleaned & conditioned": "Cuero limpiado y acondicionado",
    "Engine bay detail": "Detallado del vano motor",
    "Trim & plastics restored": "Plásticos restaurados",
    "Paint sealant": "Sellante de pintura",
    "Scope": "Alcance",
    "Supply & professional fitting": "Suministro y montaje profesional",
    "Paint-matched finish": "Acabado igualado en color",
    "Fitment & clearance check": "Comprobación de encaje y holguras",
    "Arch & clearance work": "Trabajo de pasos de rueda y holguras",
    "Wrap / PPF integration": "Integración con Car Wrap / PPF",
    "Sourcing consultation": "Asesoramiento de compra",

    /* ---------- PRICES: comparison-cell values ---------- */
    "Roof · mirrors · accents": "Techo · retrovisores · acentos",
    "Full exterior": "Exterior completo",
    "Full exterior + door shuts": "Exterior completo + marcos",
    "Optional": "Opcional",
    "3 yr": "3 años",
    "5 yr": "5 años",
    "2 yr": "2 años",
    "Bumper + partial hood": "Paragolpes + capó parcial",
    "Full front end": "Frontal completo",
    "Every painted panel": "Cada panel pintado",
    "Decon wash": "Lavado de descon.",
    "Decon + light polish": "Descon. + pulido ligero",
    "Decon + full polish": "Descon. + pulido completo",
    "Stage 1 — enhance": "Etapa 1 — realce",
    "Stage 2 — cut & refine": "Etapa 2 — corte y refinado",
    "Stage 3 — full correction": "Etapa 3 — corrección completa",
    "6 months": "6 meses",
    "12 months": "12 meses",
    "Splitter · spoiler · diffuser": "Splitter · alerón · difusor",
    "Complete body kit": "Body kit completo",
    "Kit + wheels + stance": "Kit + llantas + stance",

    /* ---------- WHY SERRES: testimonial roles, services, quotes ---------- */
    "Satin PPF": "PPF satinado",
    "Full Wrap": "Car Wrap completo",
    "PPF + Ceramic": "PPF + Cerámica",

    /* ---------- VINYL / PPF: finish families (display only — data-finish
       attribute keeps its English value for CSS + filtering) ---------- */
    "All": "Todos",
    "Satin": "Satinado",
    "Matte": "Mate",
    "Color Flip": "Camaleón",
    "Color Shift": "Camaleón",
    "Flip": "Camaleón",
    "Gloss Metallic": "Brillo metalizado",
    "Satin Metallic": "Satinado metalizado",
    "Matte Metallic": "Mate metalizado",
    "Metallic": "Metalizado",
    "Frozen Matte": "Frozen Matte",
    "Pearl": "Perla",

    /* ---------- STRINGS BAKED IN SPANISH (added when the HTML source
       was converted to Spanish; EN key = original English text) ---------- */
    "PPF · Wraps · Paint Correction": "PPF · Car Wrap · Corrección de pintura",
    "Detailing Studio": "Estudio de detailing",
    "SERRES Wrap Center on Google Maps": "SERRES Wrap Center en Google Maps",
    "Factory Gloss": "Brillo de fábrica",
    "SERRES Satin Wrap": "Car Wrap satinado SERRES",
    "Water Sheets Flat": "El agua queda plana",
    "Beads & Rolls Off": "Forma gotas y resbala",
    "yr": "años",
    "Swirled & Hazy": "Micro-arañazos y turbidez",
    "Corrected Gloss": "Brillo corregido",
    "Factory Rear": "Trasera de serie",
    "Full Aero Kit": "Kit aero completo",
    "Choose a service": "Elige un servicio",
    "The Studio": "El estudio",
    "Land Rover · Satin Black Wrap": "Land Rover · Car Wrap negro satinado",
    "A Range Rover Sport taken from factory gloss to a deep satin-black vinyl wrap — every panel, mirror and pillar colour-matched, then shot under the hexagon lights so the new finish does the talking.":
      "Un Range Rover Sport llevado del brillo de fábrica a un Car Wrap negro satinado profundo — cada panel, retrovisor y pilar igualado en color, fotografiado después bajo las luces hexagonales para que el nuevo acabado hable por sí solo.",
    "Satin Black": "Negro satinado",
    "Front three-quarter": "Tres cuartos delantero",
    "Satin Wrap": "Car Wrap satinado",
    "Head-on": "De frente",
    "Image viewer": "Visor de imágenes",
    "Close viewer": "Cerrar visor",
    "Previous image": "Imagen anterior",
    "Next image": "Imagen siguiente",
    "Satin black · Front three-quarter": "Negro satinado · Tres cuartos delantero",
    "Head-on · Satin black finish": "De frente · Acabado negro satinado",

    /* ---------- SEO META DESCRIPTIONS (baked in Spanish in the HTML;
       EN key = legacy English description shown when switching to EN) ---------- */
    "PPF, Car Wrap and detailing studio in Boca Raton, Florida: Ceramic Coating, multi-stage polishing and body kits. Get a quote on WhatsApp.":
      "Estudio de PPF, Car Wrap y detailing en Boca Raton, Florida: Ceramic Coating, pulido por etapas y body kits. Pide presupuesto por WhatsApp.",
    "SERRES PPF — self-healing paint protection film that shields high-impact areas from stone chips, swirls and the road. Available clear, gloss, satin and colour-shift finishes.":
      "Instalación de PPF autorreparable con más de 50 colores de varias marcas profesionales. Packs frontal y coche completo desde 890 €. Sant Cugat, Barcelona.",
    "SERRES Car Wrap — full and partial colour-change wraps with films from several professional brands. Matte, satin, gloss, metallic and colour-flip finishes, precision-fit to every panel.":
      "Car Wrap: cambio de color con films 3M, Avery Dennison e Inozetek. Más de 150 colores. Coche completo desde 1.490 €. Sant Cugat del Vallès.",
    "SERRES Ceramic Coating — a liquid-glass SiO₂ layer that bonds to your paint for years of hydrophobic, high-gloss, swirl-resistant protection.":
      "Tratamiento Ceramic Coating SiO2 con hasta 5 años de protección. Preparación y pulido según pack. Desde 340 €. Sant Cugat, Barcelona.",
    "SERRES Paint Correction — multi-stage machine polishing that removes swirls, holograms and oxidation to restore true, mirror-clear depth to your paint.":
      "Pulido por etapas a máquina: Etapa 1, 2 o 3 según el estado de tu pintura. Adiós a arañazos, remolinos y hologramas. Sant Cugat, Barcelona.",
    "SERRES Detailing — deep interior steam-cleaning and exterior decontamination that takes your car from neglected to showroom-fresh, inside and out.":
      "Limpieza integral: vapor, tapicería, cuero y motor. Deep Clean desde 150 €, Showroom Reset desde 490 €. Estudio premium en Sant Cugat.",
    "SERRES Body Kits — aggressive aero, custom rims and exhaust tips fitted to factory standards. We install all types of body kits to transform stance and presence.":
      "Instalación y pintura de body kits, spoilers y widebody con ajuste OEM. Desde 450 €. Sant Cugat del Vallès.",
    "PPF from €890, Car Wrap from €250, Ceramic Coating from €340 and detailing from €35, VAT included. Ask SERRES for your exact quote.":
      "Precios de PPF desde 890 €, Car Wrap desde 250 €, Ceramic Coating desde 340 € y detailing desde 35 €, IVA incluido. Pide tu presupuesto exacto en SERRES.",
    "Detailing studio in Sant Cugat del Vallès: PPF, Car Wrap and paint correction with certified materials and a documented process.":
      "Estudio de detailing en Sant Cugat del Vallès: PPF, Car Wrap y corrección de pintura con materiales certificados y un proceso documentado.",
    "SERRES projects: a gallery of real PPF, Car Wrap, Ceramic Coating and detailing work on Porsche, BMW, Toyota and Range Rover.":
      "Proyectos de SERRES: galería de trabajos reales de PPF, Car Wrap, Ceramic Coating y detailing en Porsche, BMW, Toyota y Range Rover.",
    "SERRES Exclusive: complete car transformation projects in Boca Raton. Correction, color change, PPF, Ceramic Coating and interior. Only 6 a year.":
      "Exclusivo SERRES: proyectos de transformación completa de coches en Boca Raton. Corrección, cambio de color, PPF, Ceramic Coating e interior. Solo 6 al año.",

    /* ---------- SEO package 2026-07-09: FAQ, keyword lines, blog ---------- */
    "Home": "Inicio",
    "Complete transformation projects in Boca Raton": "Proyectos de transformación completa en Boca Raton",
    "All articles": "Todos los artículos",
    "How much does it cost to wrap a car": "Cuánto cuesta vinilar un coche",
    "Contents": "Contenido",
    "Keep reading": "Sigue leyendo",
    "Related articles": "Artículos relacionados",
    "Detailing studio in Boca Raton, Florida": "Estudio de detailing en Boca Raton, Florida",
    "Professional detailing in Boca Raton": "Detailing profesional en Boca Raton",
    "PPF protection for your paint": "Protección PPF para tu pintura",
    "PPF, Car Wrap & Detailing in Boca Raton": "PPF, Car Wrap y Detailing en Boca Raton",
    "Workshop in Boca Raton": "Taller en Boca Raton",
    "PPF, Car Wrap and detailing in Boca Raton": "PPF, Car Wrap y detailing en Boca Raton",
    "SERRES is a PPF, Car Wrap and detailing workshop in Boca Raton, Florida. We work with films from several professional brands: PPF in more than 50 colors and 3M, Avery Dennison and Inozetek vinyls with more than 150 colors for color changes.": "SERRES es un taller de PPF, Car Wrap y detailing en Boca Raton, Florida. Trabajamos con films de varias marcas profesionales: PPF con más de 50 colores y vinilos 3M, Avery Dennison e Inozetek con más de 150 colores para el cambio de color.",
    "Every project is booked by appointment and inspected panel by panel under controlled hexagonal lighting; if anything falls short of our standard, it is redone before delivery. We complete the range with Ceramic Coating, multi-stage polishing, detailing and body kits, with published guide prices, VAT included.": "Cada proyecto se trabaja con cita previa y se revisa panel a panel bajo iluminación hexagonal controlada; si algo no cumple nuestro estándar, se repite antes de la entrega. Completamos la gama con Ceramic Coating, pulido por etapas, detailing y body kits, con precios orientativos publicados e IVA incluido.",
    "How much does PPF installation cost in Boca Raton?": "¿Cuánto cuesta instalar PPF en Boca Raton?",
    "The front-end PPF pack starts at 890 € and the full car at 2,390 €, with a 3-year film warranty and VAT included. Message us on WhatsApp with your car's model and we'll send you an exact quote.": "El pack frontal de PPF parte de 890 € y el coche completo de 2.390 €, con 3 años de garantía del film e IVA incluido. Escríbenos por WhatsApp con el modelo de tu coche y te pasamos un presupuesto exacto.",
    "How long does a full Car Wrap take?": "¿Cuánto tarda un Car Wrap completo?",
    "A full color change takes several days in the workshop: we remove trim, wrap panel by panel and check every edge before delivery. When you book your appointment we confirm the exact lead time for your car.": "Un cambio de color completo requiere varios días de taller: desmontamos piezas, forramos panel a panel y revisamos cada borde antes de la entrega. Al reservar tu cita te confirmamos el plazo exacto para tu coche.",
    "Where is the SERRES workshop?": "¿Dónde está el taller de SERRES?",
    "Our workshop is in Boca Raton, Florida, and we work by appointment only: Monday to Friday from 09:00 to 19:00 and Saturdays from 10:00 to 14:00.": "Nuestro taller está en Boca Raton, Florida, y trabajamos solo con cita previa: de lunes a viernes de 09:00 a 19:00 y sábados de 10:00 a 14:00.",
    "PPF or ceramic": "PPF o cerámico",
    "PPF in Boca Raton — paint protection for your car": "PPF en Boca Raton — protección de pintura para tu coche",
    "Frequently asked questions": "Preguntas frecuentes",
    "PPF, made": "PPF, en",
    "clear.": "claro.",
    "What we get asked before protecting a car. If your case is different, message us on WhatsApp.": "Lo que nos preguntan antes de proteger un coche. Si tu caso es distinto, escríbenos por WhatsApp.",
    "The front pack starts at 890 €, the full front at 1.190 € and the full body at 2.390 €, VAT included. The final price depends on the model and the condition of the paint, which is why we confirm a fixed quote after seeing the car or photos via WhatsApp.": "El pack frontal parte de 890 €, el frontal completo de 1.190 € y la carrocería completa de 2.390 €, IVA incluido. El precio final depende del modelo y del estado de la pintura, por eso confirmamos presupuesto cerrado tras ver el coche o fotos por WhatsApp.",
    "How long does PPF last and what warranty does it have?": "¿Cuánto dura el PPF y qué garantía tiene?",
    "We work with self-healing film from several professional brands with a 3-year manufacturer warranty against yellowing, cracking and delamination. With correct washing, the film keeps its clarity throughout its service life and is removed without damaging the original paint.": "Trabajamos con film autorregenerable de varias marcas profesionales con 3 años de garantía del fabricante contra amarilleo, grietas y delaminación. Con lavados correctos, el film mantiene su transparencia durante toda su vida útil y se retira sin dañar la pintura original.",
    "Does PPF really self-heal?": "¿El PPF se autorregenera de verdad?",
    "Yes. The film's top coat is self-healing: wash micro-scratches and light scuffs disappear with the heat of the sun or warm water. Gravel impacts are absorbed by the thickness of the film before they reach the paint.": "Sí. La capa superior del film es autorregenerable: las micro-rayaduras de lavado y los roces leves desaparecen con el calor del sol o agua templada. Los impactos de gravilla quedan absorbidos por el espesor del film sin llegar a la pintura.",
    "What is the installation process like?": "¿Cómo es el proceso de instalación?",
    "Paint decontamination and correction, cutting the pattern specific to your model, application in a clean booth and a panel-by-panel review under controlled hexagonal lighting. The process takes place in our own workshop in Boca Raton and, if anything falls short of our standard, it is redone before delivery.": "Descontaminación y corrección de la pintura, corte del patrón específico de tu modelo, aplicación en cabina limpia y revisión panel a panel bajo iluminación hexagonal controlada. El proceso se realiza en nuestro propio taller de Boca Raton y, si algo no cumple nuestro estándar, se repite antes de la entrega.",
    "How many days does it take and how do I book?": "¿Cuántos días tarda y cómo pido cita?",
    "A front end is delivered in 1-2 working days; a full body, in 3-5 days. We work by appointment from Monday to Saturday: call or message us on WhatsApp at +34 649 66 33 80 and we confirm your date and quote the same day.": "Un frontal se entrega en 1-2 días laborables; la carrocería completa, en 3-5 días. Trabajamos con cita previa de lunes a sábado: llama o escribe por WhatsApp al +34 649 66 33 80 y te confirmamos fecha y presupuesto en el mismo día.",
    "Which is better, PPF or a ceramic coating?": "¿Qué es mejor, PPF o tratamiento cerámico?",
    "They are different things: PPF physically protects against stone chips and scratches; Ceramic Coating SiO₂ (from 340 €) adds gloss, hydrophobic behavior and easier washing. The most complete combination is PPF on the impact zones and Ceramic Coating on the rest, and we can quote both together.": "Son cosas distintas: el PPF protege físicamente contra impactos de piedras y arañazos; el Ceramic Coating SiO₂ (desde 340 €) aporta brillo, hidrofobia y facilidad de lavado. La combinación más completa es PPF en las zonas de impacto y Ceramic Coating en el resto, y podemos presupuestar ambos juntos.",
    "You may also be interested in": "También te puede interesar",
    "Car Wrap — car color change in Boca Raton": "Car Wrap — cambio de color de coche en Boca Raton",
    "Ceramic Coating — paint correction and ceramic sealing in Boca Raton": "Ceramic Coating — corrección y sellado cerámico en Boca Raton",
    "Car detailing in Boca Raton": "Detailing de coche en Boca Raton",
    "Before you book.": "Antes de reservar.",
    "What people ask before a detail — prices, timings and how we work in Boca Raton.": "Lo que nos preguntan antes de un detailing — precios, tiempos y cómo trabajamos en Boca Raton.",
    "How much does a full detail cost?": "¿Cuánto cuesta un detailing completo?",
    "We work with three fixed tiers, VAT included: Refresh from €35, Deep Clean with steam interior cleaning from €150 and Showroom Reset — the full inside-and-out reset — from €490. The exact price depends on the size of the vehicle and its condition; we confirm it before starting, with no surprises at pick-up.": "Trabajamos con tres niveles cerrados, IVA incluido: Refresh desde 35 €, Deep Clean con limpieza interior a vapor desde 150 € y Showroom Reset — el reinicio completo por dentro y por fuera — desde 490 €. El precio exacto depende del tamaño del vehículo y su estado; lo confirmamos antes de empezar, sin sorpresas al recoger.",
    "How long does the service take?": "¿Cuánto tiempo tarda el servicio?",
    "A Refresh takes 1–2 hours and a Deep Clean with steam and upholstery extraction usually takes half a day. The Showroom Reset needs a full day, because every panel, seam and surface is finished by hand. We give you the delivery time when we confirm the appointment and we stick to it.": "Un Refresh se resuelve en 1–2 horas y un Deep Clean con vapor y extracción de tapicería suele ocupar media jornada. El Showroom Reset requiere una jornada completa, porque cada panel, costura y superficie se trata a mano. Te damos la hora de entrega al confirmar la cita y la cumplimos.",
    "What does the steam interior cleaning include?": "¿Qué incluye la limpieza interior a vapor?",
    "We steam-treat every panel, vent and seam of the cabin, extract carpets and upholstery, and clean and condition the leather with UV protection. Steam disinfects without harsh chemicals and removes odours at the source instead of masking them. It is included from the Deep Clean tier (from €150).": "Tratamos a vapor cada panel, rejilla y costura del habitáculo, extraemos alfombras y tapicería y limpiamos y acondicionamos el cuero con protección UV. El vapor desinfecta sin químicos agresivos y elimina olores en origen, no los enmascara. Está incluido desde el nivel Deep Clean (desde 150 €).",
    "Do you remove stains from upholstery and leather?": "¿Elimináis manchas de tapicería y cuero?",
    "Yes, it is a core part of the Deep Clean: fabric extraction and dedicated leather cleaning with conditioning afterwards. We remove the vast majority of everyday stains — coffee, seat marks, ground-in dirt — and we tell you honestly if an old stain has damaged the fiber and will not come out 100%.": "Sí, es parte central del Deep Clean: extracción en tejidos y limpieza específica de cuero con acondicionado posterior. Eliminamos la gran mayoría de manchas de uso — café, marcas de asiento, suciedad incrustada — y te decimos con honestidad si alguna mancha antigua ha dañado la fibra y no saldrá al 100%.",
    "Is the result guaranteed? How do you check it?": "¿El resultado está garantizado? ¿Cómo lo controláis?",
    "We don't work by eye alone: we review the finish panel by panel under controlled hexagonal lighting, at our Sant Cugat del Vallès workshop. If anything falls short of our standard, it is redone before delivery. Nothing leaves the studio until it meets that standard.": "No trabajamos a ojo: revisamos el acabado panel a panel bajo iluminación hexagonal controlada, en nuestro taller de Sant Cugat del Vallès. Si algo no cumple nuestro estándar, se repite antes de la entrega. Nada sale del taller hasta que cumple ese estándar.",
    "How do I book and where are you located?": "¿Cómo reservo cita y dónde estáis?",
    "We work by appointment only, Monday to Saturday, at Av. Can Fatjó dels Aurons 15, Sant Cugat del Vallès (Barcelona). Message us on WhatsApp or call +34 649 66 33 80 with your car's model and condition and we confirm a fixed price and date, usually the same day.": "Trabajamos solo con cita previa, de lunes a sábado, en Av. Can Fatjó dels Aurons 15, Sant Cugat del Vallès (Barcelona). Escríbenos por WhatsApp o llama al +34 649 66 33 80 con el modelo y el estado del coche y te confirmamos precio cerrado y fecha, normalmente el mismo día.",
    "Pair it with:": "Combínalo con:",
    "PPF paint protection": "Protección de pintura PPF",
    "Ceramic coating for cars in Boca Raton": "Tratamiento cerámico para coche en Boca Raton",
    "Straight answers on price, timelines and durability of the ceramic treatment.": "Respuestas directas sobre precio, plazos y durabilidad del tratamiento cerámico.",
    "How much does a ceramic coating cost at SERRES?": "¿Cuánto cuesta un tratamiento cerámico en SERRES?",
    "We work with three fixed packs, VAT included: Essential from €340, Signature from €590 and Concours from €890. The final price depends on the size of the vehicle and the condition of the paint, which we assess in a free prior inspection.": "Trabajamos con tres packs cerrados, IVA incluido: Essential desde 340 €, Signature desde 590 € y Concours desde 890 €. El precio final depende del tamaño del vehículo y del estado de la pintura, que valoramos en una inspección previa gratuita.",
    "What does each ceramic pack include?": "¿Qué incluye cada pack cerámico?",
    "Every pack includes decontamination, machine paint correction and a SiO₂ Ceramic Coating. Essential applies a single-stage polish and one layer; Signature adds a two-stage correction, a double layer and a rain-repellent glass treatment; Concours is the full correction with additional layers and interior protection.": "Todos los packs incluyen descontaminación, corrección de pintura a máquina y Ceramic Coating SiO₂. Essential aplica un pulido de una etapa y una capa; Signature añade corrección de dos etapas, doble capa y tratamiento antilluvia en cristales; Concours es la corrección completa con capas adicionales y protección interior.",
    "How long does the treatment last on the car?": "¿Cuánto dura el tratamiento en el coche?",
    "Up to 5 years of protection depending on the pack and the maintenance: 2 years on Essential, 3 on Signature and 5 on Concours. Before delivery we inspect the car panel by panel under controlled hexagonal lighting, and we give you a wash routine to preserve the hydrophobic effect.": "Hasta 5 años de protección según el pack y el mantenimiento: 2 años en Essential, 3 en Signature y 5 en Concours. Antes de la entrega revisamos el coche panel a panel bajo iluminación hexagonal controlada, y te damos una pauta de lavado para conservar el efecto hidrófobo.",
    "How many days does the car need in the workshop?": "¿Cuántos días necesita el coche en el taller?",
    "Between 1 and 4 working days depending on the pack: the paint correction sets the pace and the coating needs a controlled 24-hour cure in a dust-free bay. We confirm the exact timeline when you book.": "Entre 1 y 4 días laborables según el pack: la corrección de pintura marca el ritmo y el recubrimiento necesita un curado controlado de 24 horas en box sin polvo. Te confirmamos el plazo exacto al reservar.",
    "Does the ceramic remove existing scratches?": "¿El cerámico elimina los arañazos existentes?",
    "Micro-scratches and holograms are removed in the paint-correction stage, included in every pack. The coating then seals that corrected base; that is why we never apply ceramic over unprepared paint.": "Los micro-arañazos y hologramas se eliminan en la fase de corrección de pintura, incluida en todos los packs. El recubrimiento después sella esa base corregida; por eso nunca aplicamos cerámica sobre pintura sin preparar.",
    "How do I book an appointment?": "¿Cómo reservo cita?",
    "By prior appointment from Monday to Saturday at our workshop in Sant Cugat del Vallès (Av. Can Fatjó dels Aurons 15). Message us on WhatsApp or call +34 649 66 33 80 and we will give you a closed quote the same day.": "Con cita previa de lunes a sábado en nuestro taller de Sant Cugat del Vallès (Av. Can Fatjó dels Aurons 15). Escríbenos por WhatsApp o llama al +34 649 66 33 80 y te damos presupuesto cerrado en el día.",
    "Related services": "Servicios relacionados",
    "Paint correction & polishing": "Pulido y corrección de pintura",
    "How much does PPF cost": "Cuánto cuesta el PPF",
    "Work gallery — PPF, Car Wrap & Detailing": "Galería de trabajos — PPF, Car Wrap y Detailing",
    "PPF protection in Boca Raton": "Protección PPF en Boca Raton",
    "Car Wrap and car vinyl wrapping": "Car Wrap y vinilado de coches",
    "Body kit fitting in Boca Raton": "Montaje de body kits en Boca Raton",
    "Related:": "Relacionado:",
    "Car Wrap and color change in Boca Raton": "Car Wrap y cambio de color en Boca Raton",
    "Before fitting": "Antes de montar",
    "your body kit.": "tu body kit.",
    "What we get asked every week at the Boca Raton workshop. If your question isn't here, message us on WhatsApp.": "Lo que nos preguntan cada semana en el taller de Boca Raton. Si tu duda no está aquí, escríbenos por WhatsApp.",
    "How much does it cost to fit a body kit?": "¿Cuánto cuesta montar un body kit?",
    "Aero add-ons —splitter, diffuser or spoiler— start at €450. A complete kit with fitting and paint starts at €1,490, and a full widebody transformation from €3,490, VAT included. Once we've seen the car and the kit, we lock in a fixed written quote before starting.": "Los complementos aerodinámicos —splitter, difusor o spoiler— parten de 450 €. Un kit completo con ajuste y pintura empieza en 1.490 €, y una transformación integral tipo widebody desde 3.490 €, IVA incluido. Tras ver el coche y el kit, cerramos un presupuesto fijo por escrito antes de empezar.",
    "How long does the installation take?": "¿Cuánto tarda la instalación?",
    "A lip or diffuser is fitted the same day. A complete kit with prep and paint takes 3 to 5 working days, and a widebody project 1 to 3 weeks depending on the bodywork. We give you a firm delivery date when you confirm the job.": "Un lip o difusor se monta en el mismo día. Un kit completo con preparación y pintura requiere entre 3 y 5 días laborables, y un proyecto widebody entre 1 y 3 semanas según el trabajo de carrocería. Te damos fecha de entrega concreta al confirmar el encargo.",
    "Is the fitting guaranteed?": "¿El montaje tiene garantía?",
    "Yes. We guarantee the mounting, the panel-gap fitment and the paint finish of the installed kit. All the work is done at our own Boca Raton workshop, so we answer directly for every part we fit. The exact terms depend on the kit's material and are detailed in the quote.": "Sí. Garantizamos la fijación, el ajuste de holguras y el acabado de pintura del kit instalado. Todo el trabajo se hace en nuestro propio taller de Boca Raton, por lo que respondemos directamente de cada pieza montada. Las condiciones exactas dependen del material del kit y se detallan en el presupuesto.",
    "What does the fitting process look like?": "¿Cómo es el proceso de montaje?",
    "First we do a dry test fit and correct panel gaps piece by piece until we reach OEM-level tolerances. Then we prep, prime and paint the kit to match the vehicle's color, and secure it with structural anchors and adhesives. Before delivery we check the fit and finish panel by panel under controlled hexagon lighting; if anything falls short of our standard, it gets redone.": "Primero hacemos una prueba de ajuste en seco y corregimos holguras pieza a pieza hasta lograr tolerancias de nivel OEM. Después preparamos, imprimamos y pintamos el kit igualando el color con el vehículo, y lo fijamos con anclajes y adhesivos estructurales. Antes de la entrega revisamos el ajuste y el acabado panel a panel bajo iluminación hexagonal controlada; si algo no cumple nuestro estándar, se repite.",
    "Can I bring my own kit, or do you order it?": "¿Puedo traer mi propio kit o lo pedís vosotros?",
    "Both. We can work with a kit you already have or source proven manufacturers in fibreglass, ABS or polyurethane for your model. If you bring your own, we inspect it before quoting to catch warping or molding defects.": "Ambas opciones. Podemos trabajar con un kit que ya tengas o buscarte fabricantes contrastados en fibra, ABS o poliuretano para tu modelo. Si lo traes tú, lo inspeccionamos antes de presupuestar para detectar deformaciones o defectos de molde.",
    "How do I book, and where are you?": "¿Cómo pido cita y dónde estáis?",
    "We work by appointment Monday to Saturday at Av. Can Fatjó dels Aurons 15, Sant Cugat del Vallès, 20 minutes from Barcelona. Message us on WhatsApp or call +34 649 66 33 80 with your model and the kit you have in mind, and we'll give you a quote and a date the same day.": "Trabajamos con cita previa de lunes a sábado en Av. Can Fatjó dels Aurons 15, Sant Cugat del Vallès, a 20 minutos de Barcelona. Escríbenos por WhatsApp o llama al +34 649 66 33 80 con el modelo y el kit que tienes en mente, y te damos valoración y fecha en el día.",
    "Guides & advice": "Guías y consejos",
    "Prices, comparisons and maintenance — written by the workshop team, no sales fluff.": "Precios, comparativas y mantenimiento — escrito por el equipo del taller, sin humo comercial.",
    "PPF, Car Wrap, Ceramic Coating & Detailing prices in Boca Raton": "Precios de PPF, Car Wrap, Ceramic Coating y Detailing en Boca Raton",
    "Car Wrap & vinyl wrapping": "Car Wrap y vinilado",
    "Car detailing": "Detailing de coches",
    "Car polishing": "Pulido de coche",
    "Car polishing in Boca Raton — paint correction": "Pulido de coche en Boca Raton — corrección de pintura",
    "Before booking": "Antes de reservar",
    "your correction": "tu corrección",
    "Straight answers on price, timing, warranty and process. If your case is different, message us on WhatsApp.": "Respuestas directas sobre precio, plazos, garantía y proceso. Si tu caso es distinto, escríbenos por WhatsApp.",
    "How much does car polishing cost in Boca Raton?": "¿Cuánto cuesta un pulido de coche en Boca Raton?",
    "At SERRES Wrap Center polishing with a SiO₂ Ceramic Coating starts at 340 € (Essential, VAT included). The Signature level, with multi-stage correction, costs 590 €, and the Concours, with a show-grade finish, 890 €. The exact price depends on the condition of the paint: we confirm it during the initial panel-by-panel inspection, before starting.": "En SERRES Wrap Center el pulido con Ceramic Coating SiO₂ parte de 340 € (Essential, IVA incluido). El nivel Signature, con corrección multietapa, cuesta 590 €, y el Concours, con acabado de concurso, 890 €. El precio exacto depende del estado de la pintura: lo confirmamos en la inspección inicial, panel a panel, antes de empezar.",
    "How long does paint correction take?": "¿Cuánto tiempo tarda la corrección de pintura?",
    "An Essential is completed in one or two days; a Signature or Concours multi-stage correction takes 2 to 4 days depending on the size of the car and the hardness of the clear coat. We work by appointment Monday to Saturday and give you a firm delivery date before starting.": "Un Essential se completa en una o dos jornadas; una corrección multietapa Signature o Concours requiere de 2 a 4 días según el tamaño del coche y la dureza del barniz. Trabajamos con cita previa de lunes a sábado y te damos fecha de entrega cerrada antes de empezar.",
    "Does polishing remove all scratches?": "¿El pulido elimina todos los arañazos?",
    "We completely remove swirls, holograms and surface scratches that don't go through the clear coat; deeper ones are reduced until they are nearly invisible. Before polishing we assess the condition of the clear coat panel by panel so we only remove the material that's strictly necessary and never compromise it.": "Eliminamos por completo remolinos, hologramas y arañazos superficiales que no atraviesan el barniz; los más profundos se atenúan hasta hacerlos casi invisibles. Antes de pulir evaluamos el estado del barniz panel a panel para retirar solo el material necesario y no comprometerlo.",
    "What is the process like and how do I know the result is real?": "¿Cómo es el proceso y cómo sé que el resultado es real?",
    "We work in three stages: cutting to remove the defects, refining and final finishing. We review the car panel by panel under controlled hexagonal lighting and, if anything falls short of our standard, it is redone before delivery. Everything is done at our own workshop in Boca Raton.": "Trabajamos en tres etapas: corte para eliminar los defectos, refinado y acabado final. Revisamos el coche panel a panel bajo iluminación hexagonal controlada y, si algo no cumple nuestro estándar, se repite antes de la entrega. Todo se hace en nuestro propio taller de Boca Raton.",
    "Is the result guaranteed? How long does it last?": "¿El resultado tiene garantía? ¿Cuánto dura?",
    "The SiO₂ Ceramic Coating protects the corrected paint for up to 5 years depending on the chosen pack and maintenance. If you want to shield the result against new scratches, self-healing PPF (from 890 € for the front end) includes a 3-year film warranty.": "El Ceramic Coating SiO₂ protege la pintura corregida hasta 5 años según el pack elegido y el mantenimiento. Si quieres blindar el resultado frente a nuevos arañazos, el PPF autorregenerable (desde 890 € el frontal) incluye 3 años de garantía del film.",
    "How do I book an appointment, and do I need to leave the car all day?": "¿Cómo reservo cita y necesito dejar el coche todo el día?",
    "Message us on WhatsApp at +34 649 66 33 80 or call us and we'll book you in Monday to Saturday. We are at Av. Can Fatjó dels Aurons 15, Sant Cugat del Vallès, 20 minutes from Barcelona. For corrections taking more than one day we can coordinate pick-up and delivery with you.": "Escríbenos por WhatsApp al +34 649 66 33 80 o llámanos y te damos cita de lunes a sábado. Estamos en Av. Can Fatjó dels Aurons 15, Sant Cugat del Vallès, a 20 minutos de Barcelona. Para correcciones de más de un día podemos coordinar la recogida y entrega contigo.",
    "Ceramic Coating to seal the gloss": "Ceramic Coating para sellar el brillo",
    "PPF to protect the corrected paint": "PPF para proteger la pintura corregida",
    "Car wrapping in Boca Raton — wrap your car": "Car Wrapping en Boca Raton — vinilar tu coche",
    "Pair it with": "Combínalo con",
    "Ceramic Coating treatment": "Tratamiento Ceramic Coating",
    "Before wrapping": "Antes de vinilar",
    "your car": "tu coche",
    "How much does it cost to wrap a full car?": "¿Cuánto cuesta vinilar un coche completo?",
    "A full color change with 3M, Avery Dennison or Inozetek films starts at €1,490 VAT included; accents (roof, mirrors, pillars) from €250 and the Signature finish with extended disassembly from €1,990. The final price depends on the size of the vehicle, the film you choose and the level of disassembly. After a 20-minute inspection we give you a fixed quote.": "El cambio de color completo con films 3M, Avery Dennison e Inozetek parte de 1.490 € IVA incluido; los acentos (techo, retrovisores, pilares) desde 250 € y el acabado Signature con desmontaje ampliado desde 1.990 €. El precio final depende del tamaño del vehículo, el film elegido y el nivel de desmontaje. Tras una inspección de 20 minutos te damos un presupuesto cerrado.",
    "How many days does a full color change take?": "¿Cuántos días tarda un cambio de color completo?",
    "A full-body color change takes between 5 and 7 working days: parts removal, decontamination, panel-by-panel application and edge heat-sealing. Partial jobs (roof, accents) are delivered in 1 or 2 days. We confirm the delivery date before we start.": "Un cambio de color de carrocería completa requiere entre 5 y 7 días laborables: desmontaje de piezas, descontaminación, aplicación panel a panel y termosellado de bordes. Los trabajos parciales (techo, acentos) se entregan en 1 o 2 días. Te confirmamos la fecha de entrega antes de empezar.",
    "How long does the wrap last and what warranty does it carry?": "¿Cuánto dura el vinilo y qué garantía tiene?",
    "The 3M, Avery Dennison and Inozetek films we install last between 5 and 7 years outdoors with normal care, and the manufacturer backs them with its official warranty. We also guarantee our installation in writing: edges, seams and no lifting. All the work is done at our own workshop in Boca Raton.": "Los films 3M, Avery Dennison e Inozetek que instalamos duran entre 5 y 7 años en exterior con un mantenimiento normal, y el fabricante los respalda con su garantía oficial. Además garantizamos por escrito nuestra instalación: bordes, uniones y ausencia de levantamientos. Todo el trabajo se hace en nuestro taller propio de Boca Raton.",
    "Does the vinyl damage the original paint?": "¿El vinilo daña la pintura original?",
    "No. On factory paint in good condition, the vinyl protects it from UV rays, light scuffs and wear, and comes off without leaving residue. The process is fully reversible: when the film is removed, the original paint is intact and preserved.": "No. Sobre una pintura de fábrica en buen estado, el vinilo la protege de rayos UV, roces leves y desgaste, y se retira sin dejar residuos. El proceso es totalmente reversible: al quitar el film, la pintura original queda intacta y conservada.",
    "What does the process look like, from quote to delivery?": "¿Cómo es el proceso, desde el presupuesto hasta la entrega?",
    "First you choose a color and finish from more than 150 colors in our palette; then we inspect the vehicle and lock in the quote and date. In the workshop: wash and decontamination, parts removal, panel-by-panel film application and heat-sealing. At delivery we go over every edge together and explain the care routine for the first 15 days.": "Primero eliges color y acabado entre más de 150 colores de nuestra paleta; después inspeccionamos el vehículo y cerramos presupuesto y fecha. En taller: lavado y descontaminación, desmontaje de piezas, aplicación del film panel a panel y termosellado. En la entrega revisamos juntos cada borde y te explicamos el cuidado de los primeros 15 días.",
    "We work by appointment from Monday to Saturday at Av. Can Fatjó dels Aurons 15, Sant Cugat del Vallès (Barcelona), 20 minutes from central Barcelona. Message us on WhatsApp or call +34 649 66 33 80 and we'll confirm the day and an approximate quote in the same conversation.": "Trabajamos con cita previa de lunes a sábado en Av. Can Fatjó dels Aurons 15, Sant Cugat del Vallès (Barcelona), a 20 minutos del centro de Barcelona. Escríbenos por WhatsApp o llama al +34 649 66 33 80 y te confirmamos día y presupuesto orientativo en la misma conversación.",
    "Breadcrumb": "Migas de pan",
  
    /* ---------- Miami port — alt text (EN key -> ES) ---------- */
    "RWB Porsche 993, front three-quarter view under the studio's hexagon lights": "RWB Porsche 993 en tres cuartos delantero bajo las luces hexagonales del estudio",
    "RWB Porsche 993 from above, hexagon lights reflected in the paint": "RWB Porsche 993 desde arriba con las luces hexagonales reflejadas en la pintura",
    "RWB Porsche 993 head-on with both doors open under hexagon lights": "RWB Porsche 993 de frente con ambas puertas abiertas bajo luces hexagonales",
    "Side profile of the widebody RWB Porsche 993 with its doors open": "Perfil lateral del RWB Porsche 993 widebody con las puertas abiertas",
    "Side profile of the RWB Porsche 993 under hexagon lights": "Perfil lateral del RWB Porsche 993 bajo luces hexagonales",
    "RWB Porsche 993 covered in snow on a concrete ramp": "RWB Porsche 993 cubierto de nieve sobre una rampa de hormigón",
    "Frozen-gray BMW M2 in a rooftop parking lot": "BMW M2 en gris frozen en un parking de azotea",
    "Front of the BMW M2 with a communications tower behind it": "Frontal del BMW M2 con una torre de telecomunicaciones detrás",
    "Rear of the BMW M2, communications tower in the background": "Zaga del BMW M2 con una torre de telecomunicaciones al fondo",
    "White Toyota GR Supra parked beside an old stone farmhouse": "Toyota GR Supra blanco aparcado junto a una antigua casa de campo de piedra",
    "Rear quarter of the white Toyota GR Supra on a tree-lined mountain road": "Cuarto trasero del Toyota GR Supra blanco en una carretera de montaña arbolada",
    "White Toyota GR Supra, rear three-quarter view, parked under trees on a stone driveway": "Toyota GR Supra blanco en tres cuartos trasero aparcado bajo los árboles en una entrada de piedra",
    "Black BMW 335i E92 in a rolling shot on the highway": "BMW 335i E92 negro en toma rodando por la autopista",
    "Black BMW 335i E92 parked on a coastal road lined with cypresses": "BMW 335i E92 negro aparcado en una carretera de costa con cipreses",
    "Matte-black BMW XM, front three-quarter view on a tree-lined back road": "BMW XM negro mate en tres cuartos delantero en una carretera arbolada",
    "Front of the BMW XM with its illuminated kidney grille, seen head-on": "Frontal del BMW XM con la parrilla iluminada, visto de frente",
    "Rear of the matte-black BMW XM with its stacked quad exhaust": "Trasera del BMW XM negro mate con escape cuádruple apilado",
    "Alcantara starlight headliner of the BMW XM with blue ambient lighting": "Cielo estrellado de Alcantara del BMW XM con iluminación ambiental azul",
    "BMW XM cockpit and M steering wheel, forest in the background": "Habitáculo y volante M del BMW XM con bosque al fondo",
    "Range Rover Sport in a satin black Car Wrap, front three-quarter view under the studio's hexagon lights": "Range Rover Sport con Car Wrap negro satinado, tres cuartos delantero bajo las luces hexagonales del estudio",
    "Range Rover Sport in a satin black Car Wrap, head-on view under the studio's hexagon lights": "Range Rover Sport con Car Wrap negro satinado, vista frontal bajo las luces hexagonales del estudio",
    "Ligier microcar in a matte black Car Wrap, rear three-quarter view in the studio": "Microcoche Ligier con Car Wrap negro mate, tres cuartos trasero en el estudio",
    "Ligier microcar in a matte black Car Wrap, front three-quarter view under hexagon lights": "Microcoche Ligier con Car Wrap negro mate, tres cuartos delantero bajo luces hexagonales",
    "BMW 1 Series in a satin gray Car Wrap, front three-quarter view under the studio's hexagon lights": "BMW Serie 1 con Car Wrap gris satinado, tres cuartos delantero bajo las luces hexagonales del estudio",
    "Porsche Cayenne in a satin black Car Wrap, head-on view under the studio's hexagon lights": "Porsche Cayenne con Car Wrap negro satinado, vista frontal bajo las luces hexagonales del estudio",
    "Porsche Cayenne in a satin black Car Wrap, front three-quarter view with acid-green brake calipers": "Porsche Cayenne con Car Wrap negro satinado, tres cuartos delantero con pinzas de freno verde ácido",
    "Gold Porsche crest on the satin black hood of the Cayenne": "Escudo Porsche dorado sobre el capó negro satinado del Cayenne",
    "Porsche 911 Carrera GTS in a satin sand Car Wrap, front three-quarter view under the studio's hexagon lights": "Porsche 911 Carrera GTS con Car Wrap arena satinado, tres cuartos delantero bajo las luces hexagonales del estudio",
    "Porsche 911 Carrera GTS in a satin sand Car Wrap, head-on with the hexagon lights reflected in the windshield": "Porsche 911 Carrera GTS con Car Wrap arena satinado, vista frontal con las luces hexagonales reflejadas en el parabrisas",
    "Porsche 911 Carrera GTS in a satin sand Car Wrap, rear three-quarter view beside the studio's green wall": "Porsche 911 Carrera GTS con Car Wrap arena satinado, tres cuartos trasero junto a la pared verde del estudio",
    "Close-up of the rear light bar and the 911 Carrera GTS badge": "Detalle de la barra de luz trasera y el emblema 911 Carrera GTS",
    "RWB Porsche 993 in the SERRES studio under hexagon lights": "RWB Porsche 993 en el estudio SERRES bajo luces hexagonales",
    "Carbon fiber body kit components laid out under the hexagon studio lighting": "Componentes de body kit de fibra de carbono dispuestos bajo iluminación hexagonal",
    "Golf GTI after — full body kit, diffuser, spoiler and black exhaust tips": "Golf GTI después — body kit completo, difusor, alerón y colas de escape en negro",
    "Golf GTI before — factory rear end": "Golf GTI antes — trasera de serie",
    "After — SERRES Ceramic Coating, water beading on gloss black paint": "Después — recubrimiento cerámico SERRES, gotas de agua sobre negro brillo",
    "Before — water sheeting flat across untreated paint": "Antes — agua extendida y plana sobre pintura sin tratar",
    "Audi SQ7 interior before — dust and grime in the footwell area": "Interior de un Audi SQ7 antes — polvo y suciedad en la zona de los pies",
    "Audi SQ7 interior after — the cabin steam-cleaned and fully conditioned": "Interior de un Audi SQ7 después — habitáculo limpiado a vapor y acondicionado",
    "Audi SQ7 exterior before — dusty, dull and faded paint": "Exterior de un Audi SQ7 antes — pintura polvorienta y apagada",
    "Audi SQ7 exterior after — a deep, mirror-like gloss": "Exterior de un Audi SQ7 después — brillo profundo y reflectante",
    "BMW after — SERRES paint correction, mirror gloss": "BMW después — corrección de pintura SERRES, brillo espejo",
    "BMW before — hazy paint with micro-scratches": "BMW antes — pintura turbia con micro-arañazos",
    "BMW M2 after — SERRES satin PPF": "BMW M2 después — PPF satinado SERRES",
    "BMW M2 before — factory gloss": "BMW M2 antes — brillo de fábrica",
    "BMW XM after — SERRES satin black Car Wrap": "BMW XM después — Car Wrap negro satinado SERRES",
    "BMW XM before — factory gloss black": "BMW XM antes — negro brillo de fábrica",
    "BMW M2 in frozen gray, front three-quarter view, parked on a quiet asphalt road with cypress trees behind it": "BMW M2 en gris frozen, tres cuartos delantero, aparcado en una carretera asfaltada tranquila con cipreses detrás",
    "BMW XM in a satin black Car Wrap, rear three-quarter view, parked on a tree-lined back road": "BMW XM con Car Wrap negro satinado, tres cuartos trasero, aparcado en una carretera secundaria arbolada",
    "BMW XM in a satin black Car Wrap parked on a tree-lined back road": "BMW XM con Car Wrap negro satinado aparcado en una carretera arbolada",
    "Hexagon ceiling lights reflected on the roof of a car in the studio": "Luces hexagonales del estudio reflejadas en el techo de un coche",
    "BMW M2 in frozen gray parked on a road lined with cypress trees": "BMW M2 en gris frozen aparcado en una carretera con cipreses",
    "Close-up of the Audi SQ7 dashboard and steering wheel through the open door": "Detalle del salpicadero y el volante de un Audi SQ7 por la puerta abierta",
    "Interior of an Audi SQ7 seen through the open door: gray dashboard, digital instrument cluster and steering wheel": "Interior de un Audi SQ7 visto desde la puerta abierta: salpicadero gris, cuadro de instrumentos digital y volante",
    "Hexagon ceiling lights in the SERRES studio, their reflection on the roof of a car below": "Luces hexagonales del estudio SERRES en lo alto, con su reflejo sobre el techo de un coche debajo",
  
    /* ---------- Miami port — why-serres hero stats ---------- */
    "Standard": "Estándar",
  };

  /* resolve a DOM text core to its dictionary key — the HTML is authored in
     English, so the core IS the key (no inverted index needed) */
  function enKeyOf(core) {
    return DICT.hasOwnProperty(core) ? core : null;
  }

  /* ===================================================================
     ENGINE
     =================================================================== */
  function getLang() {
    var l;
    try { l = localStorage.getItem(STORE); } catch (e) {}
    return LANGS.indexOf(l) >= 0 ? l : "en";
  }
  var current = getLang();

  function tr(core) {
    if (current === "en") return core;
    var v = DICT[core];
    return v == null ? core : v;
  }

  /* split a raw text value into leading/trailing whitespace (+ wrapping
     quotes) and a translatable core, so we restore surroundings exactly */
  function affix(raw) {
    var lead = "", trail = "", core = raw, m;
    if ((m = core.match(/^\s+/))) { lead = m[0]; core = core.slice(m[0].length); }
    if ((m = core.match(/\s+$/))) { trail = m[0]; core = core.slice(0, core.length - m[0].length); }
    if (core.length > 1) {
      var f = core.charAt(0), l = core.charAt(core.length - 1);
      if ((f === "\u201C" || f === '"') && (l === "\u201D" || l === '"')) {
        lead += f; trail = l + trail; core = core.slice(1, core.length - 1);
      }
    }
    return { lead: lead, core: core, trail: trail };
  }

  var textBindings = [];   // {node, lead, core, trail}
  var attrBindings = [];   // {el, attr, lead, core, trail}
  var keyBindings = [];    // {el, lead, core, trail} — explicit [data-en] elements
  var seenText = (typeof WeakSet !== "undefined") ? new WeakSet() : null;
  var ATTRS = ["aria-label", "title", "alt"];

  function inSkip(node) {
    var el = node.nodeType === 1 ? node : node.parentNode;
    return !!(el && el.closest && el.closest("[data-i18n-skip]"));
  }

  function bindText(tn) {
    if (seenText && seenText.has(tn)) return;
    var raw = tn.nodeValue;
    if (!raw || !raw.trim()) return;
    var p = tn.parentNode;
    if (!p) return;
    var tag = p.nodeName;
    if (tag === "SCRIPT" || tag === "STYLE" || tag === "TEXTAREA") return;
    if (inSkip(tn)) return;
    if (p.nodeType === 1 && p.hasAttribute && p.hasAttribute("data-en")) return;
    var a = affix(raw);
    var key = enKeyOf(a.core);
    if (key == null) return;
    if (seenText) seenText.add(tn);
    var b = { node: tn, lead: a.lead, core: key, trail: a.trail };
    textBindings.push(b);
    applyText(b);
  }

  function applyText(b) {
    var val = b.lead + tr(b.core) + b.trail;
    if (b.node.nodeValue !== val) b.node.nodeValue = val;
  }

  function bindAttrs(el) {
    if (!el.getAttribute || inSkip(el)) return;
    for (var i = 0; i < ATTRS.length; i++) {
      var attr = ATTRS[i];
      if (!el.hasAttribute(attr)) continue;
      var raw = el.getAttribute(attr);
      if (!raw || !raw.trim()) continue;
      var a = affix(raw);
      var enKey = enKeyOf(a.core);
      if (enKey == null) continue;
      var key = "__i18n_" + attr;
      if (el[key]) continue;            // already bound
      el[key] = true;
      var b = { el: el, attr: attr, lead: a.lead, core: enKey, trail: a.trail };
      attrBindings.push(b);
      applyAttr(b);
    }
  }

  function applyAttr(b) {
    b.el.setAttribute(b.attr, b.lead + tr(b.core) + b.trail);
  }

  /* explicit keyed elements — forward-mode hatch for context-dependent words:
     <span data-en="The (blog)">The</span> keeps its own text in EN and renders
     DICT["The (blog)"] in ES (the key never has to equal the visible text) */
  function bindKeyed(el) {
    if (!el.getAttribute || inSkip(el)) return;
    if (el.__i18n_keyed) return;
    var raw = el.getAttribute("data-en");
    if (!raw) return;
    var a = affix(raw);
    if (!DICT.hasOwnProperty(a.core)) return;
    el.__i18n_keyed = true;
    var b = { el: el, lead: a.lead, core: a.core, trail: a.trail, en: el.textContent };
    keyBindings.push(b);
    applyKeyed(b);
  }

  function applyKeyed(b) {
    if (current === "en") { if (b.el.textContent !== b.en) b.el.textContent = b.en; return; }
    var v = tr(b.core);
    var out = v ? b.lead + v + b.trail : "";
    if (b.el.textContent !== out) b.el.textContent = out;
  }

  function walk(root) {
    if (!root) return;
    if (root.nodeType === 3) { bindText(root); return; }
    if (root.nodeType !== 1) return;
    if (inSkip(root)) return;
    // text nodes
    var tw = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null, false);
    var n, batch = [];
    while ((n = tw.nextNode())) batch.push(n);
    batch.forEach(bindText);
    // attributes (self + descendants)
    bindAttrs(root);
    var els = root.querySelectorAll("[aria-label],[title],[alt]");
    for (var i = 0; i < els.length; i++) bindAttrs(els[i]);
    // explicit keyed fragments (self + descendants)
    bindKeyed(root);
    var kd = root.querySelectorAll("[data-en]");
    for (var k = 0; k < kd.length; k++) bindKeyed(kd[k]);
  }

  /* meta: <title> + description */
  var titleBind = null, descBind = null;
  function bindMeta() {
    var t = enKeyOf((document.title || "").trim());
    if (t != null) titleBind = t;
    var md = document.querySelector('meta[name="description"]');
    if (md) {
      var c = enKeyOf((md.getAttribute("content") || "").trim());
      if (c != null) descBind = { el: md, core: c };
    }
  }
  function applyMeta() {
    if (titleBind) document.title = tr(titleBind);
    if (descBind) descBind.el.setAttribute("content", tr(descBind.core));
  }

  function applyAll() {
    document.documentElement.setAttribute("lang", current);
    for (var i = 0; i < textBindings.length; i++) applyText(textBindings[i]);
    for (var j = 0; j < attrBindings.length; j++) applyAttr(attrBindings[j]);
    for (var k = 0; k < keyBindings.length; k++) applyKeyed(keyBindings[k]);
    applyMeta();
  }

  function setLang(l) {
    if (LANGS.indexOf(l) < 0 || l === current) {
      if (l === current) syncSwitchers();
      return;
    }
    current = l;
    try { localStorage.setItem(STORE, l); } catch (e) {}
    applyAll();
    syncSwitchers();
    try {
      window.dispatchEvent(new CustomEvent("serres:langchange", { detail: l }));
    } catch (e2) {
      var ev = document.createEvent("CustomEvent");
      ev.initCustomEvent("serres:langchange", false, false, l);
      window.dispatchEvent(ev);
    }
  }

  /* ===================================================================
     SWITCHER UI
     =================================================================== */
  var switchers = [];

  function injectStyle() {
    if (document.getElementById("srs-i18n-style")) return;
    var css =
      ".srs-lang{display:inline-flex;align-items:center;flex:none;border:1px solid var(--line-strong,rgba(255,255,255,.16));" +
        "border-radius:999px;overflow:hidden;background:rgba(255,255,255,.02)}" +
      ".srs-lang button{font-family:'Barlow Condensed','Bahnschrift','Arial Narrow',sans-serif;font-weight:600;text-transform:uppercase;" +
        "letter-spacing:.12em;font-size:12.5px;line-height:1;color:var(--muted,#9a9aa3);background:transparent;" +
        "border:0;cursor:pointer;padding:8px 10px;transition:color .25s var(--ease,ease),background .25s var(--ease,ease)}" +
      ".srs-lang button+button{border-left:1px solid var(--line,rgba(255,255,255,.09))}" +
      ".srs-lang button:hover{color:var(--text,#f3f3f5)}" +
      ".srs-lang button.on{background:var(--chrome,#e7e7ec);color:#0a0a0b}" +
      ".srs-lang button.on:hover{color:#0a0a0b}" +
      /* mobile-menu variant — bigger tap targets */
      ".srs-lang.srs-lang-menu{border-radius:12px}" +
      ".srs-lang.srs-lang-menu button{font-size:15px;letter-spacing:.16em;padding:12px 16px}" +
      "@media(max-width:760px){.srs-lang.srs-lang-nav button{padding:7px 9px;font-size:12px}}";
    var st = document.createElement("style");
    st.id = "srs-i18n-style";
    st.textContent = css;
    document.head.appendChild(st);
  }

  function makeSwitcher(variant) {
    var box = document.createElement("div");
    box.className = "srs-lang " + variant;
    box.setAttribute("data-i18n-skip", "");
    box.setAttribute("role", "group");
    box.setAttribute("aria-label", "Language / Idioma");
    LANGS.forEach(function (l) {
      var b = document.createElement("button");
      b.type = "button";
      b.textContent = LABELS[l];
      b.setAttribute("data-lang", l);
      b.setAttribute("aria-label", LABELS[l]);
      b.addEventListener("click", function () { setLang(l); });
      box.appendChild(b);
    });
    switchers.push(box);
    syncSwitchers();
    return box;
  }

  function syncSwitchers() {
    switchers.forEach(function (box) {
      var bs = box.querySelectorAll("button");
      for (var i = 0; i < bs.length; i++) {
        var on = bs[i].getAttribute("data-lang") === current;
        bs[i].classList.toggle("on", on);
        bs[i].setAttribute("aria-pressed", on ? "true" : "false");
      }
    });
  }

  function mountSwitchers() {
    /* desktop: into .nav-right, before the quote button */
    var navRight = document.querySelector("header .nav-right");
    if (navRight && !navRight.querySelector(".srs-lang")) {
      navRight.insertBefore(makeSwitcher("srs-lang-nav"), navRight.firstChild);
    }
    /* mobile overlay menu foot (built by serres-enhance.js) */
    var foot = document.querySelector(".srs-menu-foot");
    if (foot && !foot.querySelector(".srs-lang")) {
      foot.insertBefore(makeSwitcher("srs-lang-menu"), foot.firstChild);
    }
  }

  /* ===================================================================
     OBSERVER — translate dynamically-added static content
     =================================================================== */
  function observe() {
    if (typeof MutationObserver === "undefined") return;
    var mo = new MutationObserver(function (muts) {
      for (var i = 0; i < muts.length; i++) {
        var added = muts[i].addedNodes;
        for (var j = 0; j < added.length; j++) {
          var node = added[j];
          if (node.nodeType === 1 || node.nodeType === 3) walk(node);
        }
      }
      // a new mobile menu may have appeared
      mountSwitchers();
    });
    mo.observe(document.body, { childList: true, subtree: true });
  }

  /* ===================================================================
     INIT
     =================================================================== */
  function init() {
    injectStyle();
    bindMeta();
    walk(document.body);
    mountSwitchers();
    applyAll();
    observe();
    // expose a tiny API
    window.SERRES_I18N = {
      get: function () { return current; },
      set: setLang,
      t: tr
    };
    // Let data-driven sections (price tiers, testimonials, finish filters)
    // render themselves in the stored language on first load.
    try {
      window.dispatchEvent(new CustomEvent("serres:langchange", { detail: current }));
    } catch (e3) {
      var ev2 = document.createEvent("CustomEvent");
      ev2.initCustomEvent("serres:langchange", false, false, current);
      window.dispatchEvent(ev2);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
