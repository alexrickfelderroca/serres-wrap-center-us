/* =====================================================================
   SERRES — site-wide language switcher (EN / ES / CA)
   ---------------------------------------------------------------------
   • The static HTML ships in SPANISH (SEO base language). This script
     reversibly translates static DOM text nodes + a few attributes
     against a curated EN→{es,ca} dictionary, matched in reverse via an
     inverted ES→EN index (INV). Anything not in the dictionary is left
     untouched (graceful — car names, 3M film names, codes, place
     names, PPF/SiO₂/3M, units, etc. stay as-is).
   • Elements with data-en="English key" render tr(key) as their text —
     used for fragments whose Spanish rendition is empty ("").
   • Injects a segmented EN/ES/CA switcher into the desktop nav and the
     mobile overlay menu, styled to match the chrome / dark aesthetic.
   • Persists the choice in localStorage and re-applies on every page.
   • Data-driven sections (price tiers, testimonials, finish filters)
     manage their own copy and just listen for `serres:langchange`.
   Auto-loaded by assets/serres-enhance.js on every page.
   ===================================================================== */
(function () {
  "use strict";

  var STORE = "serres-lang";
  var LANGS = ["en", "es", "ca"];
  var LABELS = { en: "EN", es: "ES", ca: "CA" };

  /* ===================================================================
     DICTIONARY  —  "English source" : ["español", "català"]
     A value of "" means: render nothing in that language (used for
     inline-split headings whose words reflow into other fragments).
     =================================================================== */
  var DICT = {
    /* ---------- NAV / shared actions ---------- */
    "Services": ["Servicios", "Serveis"],
    "Gallery": ["Galería", "Galeria"],
    "Projects": ["Proyectos", "Projectes"],
    "Prices": ["Precios", "Preus"],
    "Why SERRES": ["Por qué SERRES", "Per què SERRES"],
    "Contact": ["Contacto", "Contacte"],
    "Get a Quote": ["Pedir presupuesto", "Demana pressupost"],
    "Explore Services": ["Ver servicios", "Explora els serveis"],
    "Back to site": ["Volver al sitio", "Torna al lloc"],
    "All services": ["Todos los servicios", "Tots els serveis"],
    "Call the Studio": ["Llamar al taller", "Truca al taller"],
    "Talk to the Studio": ["Hablar con el taller", "Parla amb el taller"],
    "See the Gallery": ["Ver la galería", "Mira la galeria"],
    "See the Work": ["Ver el trabajo", "Mira la feina"],
    "See Projects": ["Ver proyectos", "Mira els projectes"],
    "Request Your Build": ["Solicita tu proyecto", "Sol·licita el teu projecte"],
    "What's Included": ["Qué incluye", "Què inclou"],
    "About the Exclusive": ["Sobre el Exclusivo", "Sobre l'Exclusiu"],
    "Scroll": ["Desliza", "Desplaça"],
    "Chat on WhatsApp": ["Escríbenos por WhatsApp", "Escriu-nos per WhatsApp"],
    "Open menu": ["Abrir menú", "Obre el menú"],
    "Close menu": ["Cerrar menú", "Tanca el menú"],

    /* ---------- HOME ---------- */
    "PPF, Car Wrap & Detailing in Barcelona | SERRES":
      ["PPF, Car Wrap y Detailing en Barcelona | SERRES", "PPF, Car Wrap i Detailing a Barcelona | SERRES"],
    "Premium Detailing & Customization":
      ["Detailing y personalización premium", "Detailing i personalització premium"],
    "Elevate": ["Eleva", "Eleva"],
    "your dream": ["tu sueño", "el teu somni"],
    "PPF, custom Car Wrap and concours-level detailing in Barcelona (Sant Cugat del Vallès) — engineered for the cars you build your life around. One workshop. Obsessive standards.":
      ["PPF, Car Wrap a medida y detailing de nivel concours en Barcelona (Sant Cugat del Vallès), pensados para los coches alrededor de los que construyes tu vida. Un taller. Estándares obsesivos.",
       "PPF, Car Wrap a mida i detailing de nivell concours a Barcelona (Sant Cugat del Vallès), pensats per als cotxes al voltant dels quals construeixes la teva vida. Un taller. Estàndards obsessius."],
    "The SERRES Build": ["La transformación SERRES", "La transformació SERRES"],
    "Our services": ["Nuestros servicios", "Els nostres serveis"],
    "Choose where to begin.": ["Elige por dónde empezar.", "Tria per on començar."],
    "Six specialities, one standard. Tap a service to see the process, materials and pricing.":
      ["Seis especialidades, un mismo estándar. Toca un servicio para ver el proceso, los materiales y los precios.",
       "Sis especialitats, un mateix estàndard. Toca un servei per veure el procés, els materials i els preus."],
    "Invisible protection": ["Protección invisible", "Protecció invisible"],
    "Colour change": ["Cambio de color", "Canvi de color"],
    "Seal & gloss": ["Sellado y brillo", "Segellat i brillantor"],
    "Inside & outside": ["Interior y exterior", "Interior i exterior"],
    "Aero & stance": ["Aero y stance", "Aero i stance"],
    "We make your": ["Hacemos realidad tu", "Fem realitat el teu"],
    "dream car": ["coche soñado", "cotxe somiat"],
    "a reality": ["", ""],
    "CAR WRAP": ["CAR WRAP", "CAR WRAP"],
    "Ceramic": ["Cerámica", "Ceràmica"],
    "Paint Correction": ["Corrección de pintura", "Correcció de pintura"],
    "Body Kits": ["Body Kits", "Body Kits"],
    "Scroll to transform": ["Desliza para transformar", "Desplaça per transformar"],
    "Book your build": ["Reserva tu proyecto", "Reserva el teu projecte"],
    "Bring us the car.": ["Tráenos el coche.", "Porta'ns el cotxe."],
    "We'll redefine it.": ["Lo redefiniremos.", "El redefinirem."],
    "Studio": ["Taller", "Taller"],
    "Hours": ["Horario", "Horari"],
    "Phone": ["Teléfono", "Telèfon"],
    "Mon–Sat · By appointment": ["Lun–Sáb · Con cita previa", "Dl–Ds · Amb cita prèvia"],
    "Follow & chat": ["Síguenos y escríbenos", "Segueix-nos i escriu-nos"],
    "Premium paint protection, custom wraps, and concours-level detailing.":
      ["Protección de pintura, Car Wrap a medida y detailing de nivel concours.",
       "Protecció de pintura, Car Wrap a mida i detailing de nivell concours."],
    "Paint Protection Film": ["Paint Protection Film", "Paint Protection Film"],
    "Barcelona, Spain": ["Barcelona, España", "Barcelona, Espanya"],
    "Follow": ["Síguenos", "Segueix-nos"],
    "© 2026 SERRES. All rights reserved.":
      ["© 2026 SERRES. Todos los derechos reservados.", "© 2026 SERRES. Tots els drets reservats."],
    "PPF · Car Wrap · Detailing · Paint Correction · Body Kits":
      ["PPF · Car Wrap · Detailing · Corrección de pintura · Body Kits",
       "PPF · Car Wrap · Detailing · Correcció de pintura · Body Kits"],
    "Call SERRES": ["Llamar a SERRES", "Truca a SERRES"],

    /* ---------- GALLERY ---------- */
    "Projects & Work Gallery — PPF, Car Wrap & Detailing | SERRES": ["Proyectos y Galería de Trabajos — PPF, Car Wrap y Detailing | SERRES", "Projectes i Galeria de Treballs — PPF, Car Wrap i Detailing | SERRES"],
    "Our": ["Nuestros", "Els nostres"],
    "The Showroom": ["El showroom", "El showroom"],
    "The": ["La", "La"],
    "Every car gets its own room in this gallery of work. Shot in and around Barcelona — no stock photos, no rented cars. Pick a build below, or scroll the floor.":
      ["Cada coche tiene su propia sala en esta galería de trabajos. Fotografiado en Barcelona y alrededores — sin fotos de stock ni coches de alquiler. Elige un proyecto abajo o recorre la planta.",
       "Cada cotxe té la seva pròpia sala en aquesta galeria de treballs. Fotografiat a Barcelona i rodalies — sense fotos d'estoc ni cotxes de lloguer. Tria un projecte a sota o recorre la planta."],
    "RAUH-Welt Begriff": ["RAUH-Welt Begriff", "RAUH-Welt Begriff"],
    "A widebody RAUH-Welt 993 — riveted arches, race wing and a mirror-silver finish.":
      ["Un RAUH-Welt 993 widebody — pasos de rueda remachados, alerón de competición y un acabado plata espejo.",
       "Un RAUH-Welt 993 widebody — passos de roda reblats, aleró de competició i un acabat plata mirall."],
    "Detailing": ["Detailing", "Detailing"],
    "Frames": ["Tomas", "Preses"],
    "G87 · Frozen Grey Wrap": ["G87 · Car Wrap gris frozen", "G87 · Car Wrap gris frozen"],
    "A new G87 M2 wrapped in a deep frozen grey, photographed on a Barcelona rooftop with the Collserola tower behind it. Matte body, gloss-black detailing, carbon accents.":
      ["Un M2 G87 nuevo con Car Wrap en un gris frozen profundo, fotografiado en una azotea de Barcelona con la torre de Collserola detrás. Carrocería mate, detalles en negro brillo, acentos de carbono.",
       "Un M2 G87 nou amb Car Wrap en un gris frozen profund, fotografiat en un terrat de Barcelona amb la torre de Collserola al darrere. Carrosseria mat, detalls en negre brillant, accents de carboni."],
    "A90 · Pearl White": ["A90 · Blanco perla", "A90 · Blanc perla"],
    "A pearl-white GR Supra protected and sealed, then taken out into the Catalan countryside.":
      ["Un GR Supra blanco perla protegido y sellado, llevado después al campo catalán.",
       "Un GR Supra blanc perla protegit i segellat, portat després al camp català."],
    "E92 · Gloss Black": ["E92 · Negro brillo", "E92 · Negre brillant"],
    "A lowered E92 335i in deep gloss black — caught rolling at speed on the motorway and parked up on a cypress-lined coast road. Paint correction and a slick protective finish.":
      ["Un E92 335i rebajado en negro brillo profundo — captado rodando a velocidad en la autopista y aparcado en una carretera de costa bordeada de cipreses. Corrección de pintura y un acabado protector deslizante.",
       "Un E92 335i abaixat en negre brillant profund — captat rodant a velocitat a l'autopista i aparcat en una carretera de costa vorejada de xiprers. Correcció de pintura i un acabat protector lliscant."],
    "G09 · Matte Black": ["G09 · Negro mate", "G09 · Negre mat"],
    "A matte-black XM wrapped in full PPF and finished inside and out — illuminated kidney grille, Alcantara starlight headliner and quad exhaust, shot on a sun-broken Catalan back road.":
      ["Un XM negro mate cubierto con PPF completo y rematado por dentro y por fuera — parrilla iluminada, cielo estrellado de Alcantara y escape cuádruple, fotografiado en una carretera secundaria catalana con el sol entre las nubes.",
       "Un XM negre mat cobert amb PPF complet i rematat per dins i per fora — graella il·luminada, cel estrellat d'Alcantara i escapament quàdruple, fotografiat en una carretera secundària catalana amb el sol entre els núvols."],
    "Your car next": ["El próximo, tu coche", "El proper, el teu cotxe"],
    "Earn your": ["Gánate tu", "Guanya't la teva"],
    "own room.": ["propia sala.", "pròpia sala."],
    "© 2026 SERRES. All rights reserved. \u00A0·\u00A0 Shot on real client cars":
      ["© 2026 SERRES. Todos los derechos reservados. \u00A0·\u00A0 Sobre coches reales de clientes",
       "© 2026 SERRES. Tots els drets reservats. \u00A0·\u00A0 Sobre cotxes reals de clients"],
    /* gallery shot captions (visible on hover + in lightbox) */
    "In the studio": ["En el estudio", "A l'estudi"],
    "Mirror finish": ["Acabado espejo", "Acabat mirall"],
    "Doors open": ["Puertas abiertas", "Portes obertes"],
    "Widebody profile": ["Perfil widebody", "Perfil widebody"],
    "Detail bay": ["Box de detailing", "Box de detailing"],
    "Snow-dusted": ["Con nieve", "Amb neu"],
    "Winter": ["Invierno", "Hivern"],
    "Rooftop": ["Azotea", "Terrat"],
    "Collserola": ["Collserola", "Collserola"],
    "Rear detail": ["Detalle trasero", "Detall posterior"],
    "Wrap": ["Wrap", "Wrap"],
    "Masia driveway": ["Entrada de la masía", "Entrada de la masia"],
    "Mountain road": ["Carretera de montaña", "Carretera de muntanya"],
    "Gloss": ["Brillo", "Brillant"],
    "Dappled light": ["Luz tamizada", "Llum tamisada"],
    "Rolling shot": ["Toma rodando", "Presa rodant"],
    "On the road": ["En la carretera", "A la carretera"],
    "Coast road": ["Carretera de costa", "Carretera de costa"],
    "Gloss black": ["Negro brillo", "Negre brillant"],
    "Back road": ["Carretera secundaria", "Carretera secundària"],
    "Lit grille": ["Parrilla iluminada", "Graella il·luminada"],
    "Detail": ["Detalle", "Detall"],
    "Quad exhaust": ["Escape cuádruple", "Escapament quàdruple"],
    "Starlight headliner": ["Cielo estrellado", "Cel estrellat"],
    "Interior": ["Interior", "Interior"],
    "Cockpit": ["Habitáculo", "Habitacle"],
    /* gallery lightbox data-note strings */
    "Front three-quarter · In the studio": ["Tres cuartos delantero · En el estudio", "Tres quarts davanter · A l'estudi"],
    "From above · Mirror finish": ["Desde arriba · Acabado espejo", "Des de dalt · Acabat mirall"],
    "Doors open · Front": ["Puertas abiertas · Frontal", "Portes obertes · Frontal"],
    "Side profile · Detail bay": ["Perfil lateral · Box de detailing", "Perfil lateral · Box de detailing"],
    "Snow-dusted · The ramp": ["Con nieve · La rampa", "Amb neu · La rampa"],
    "Frozen grey · Rooftop": ["Gris frozen · Azotea", "Gris frozen · Terrat"],
    "Front end · Collserola": ["Frontal · Collserola", "Frontal · Collserola"],
    "Rear deck detail": ["Detalle trasero", "Detall posterior"],
    "Pearl white · Masia driveway": ["Blanco perla · Entrada de la masía", "Blanc perla · Entrada de la masia"],
    "Rear quarter · Mountain road": ["Cuarto trasero · Carretera de montaña", "Quart posterior · Carretera de muntanya"],
    "Rear three-quarter · Dappled light": ["Tres cuartos trasero · Luz tamizada", "Tres quarts posterior · Llum tamisada"],
    "Gloss black · Rolling shot": ["Negro brillo · Toma rodando", "Negre brillant · Presa rodant"],
    "Gloss black · Coast road": ["Negro brillo · Carretera de costa", "Negre brillant · Carretera de costa"],
    "Front three-quarter · Back road": ["Tres cuartos delantero · Carretera secundaria", "Tres quarts davanter · Carretera secundària"],
    "Illuminated kidney grille": ["Parrilla iluminada", "Graella il·luminada"],
    "Rear · Quad exhaust": ["Trasera · Escape cuádruple", "Posterior · Escapament quàdruple"],
    "Alcantara starlight headliner": ["Cielo estrellado de Alcantara", "Cel estrellat d'Alcantara"],
    "Cockpit · M steering wheel": ["Habitáculo · Volante M", "Habitacle · Volant M"],
    "Jump to a car": ["Ir a un coche", "Ves a un cotxe"],
    "Ligier · Matte Black Car Wrap": ["Ligier · Car Wrap negro mate", "Ligier · Car Wrap negre mat"],
    "A Ligier microcar transformed with a matte black Car Wrap — red grille accents, black wheels with red details and smoked lights. The same standard of finish, in a small footprint.":
      ["Un microcoche Ligier transformado con Car Wrap negro mate — acentos rojos en la parrilla, llantas en negro con detalles rojos y ópticas ahumadas. El mismo estándar de acabado, en formato pequeño.",
       "Un microcotxe Ligier transformat amb Car Wrap negre mat — accents vermells a la graella, llandes en negre amb detalls vermells i òptiques fumades. El mateix estàndard d'acabat, en format petit."],
    "Matte Black": ["Negro mate", "Negre mat"],
    "Hex lighting": ["Luz hexagonal", "Llum hexagonal"],
    "Rear three-quarter · In the studio": ["Tres cuartos trasero · En el estudio", "Tres quarts posterior · A l'estudi"],
    "Front three-quarter · Hex lighting": ["Tres cuartos delantero · Luz hexagonal", "Tres quarts davanter · Llum hexagonal"],
    "F40 · Satin Grey Car Wrap": ["F40 · Car Wrap gris satinado", "F40 · Car Wrap gris setinat"],
    "1 Series": ["Serie 1", "Sèrie 1"],
    "A 1 Series taken from its factory colour to a satin grey Car Wrap — gloss black grille and contrasting roof, shot under the studio hex lights.":
      ["Un Serie 1 llevado del color de fábrica a un Car Wrap gris satinado — parrilla en negro brillo y techo en contraste, fotografiado bajo las luces hexagonales del estudio.",
       "Un Sèrie 1 portat del color de fàbrica a un Car Wrap gris setinat — graella en negre brillant i sostre en contrast, fotografiat sota les llums hexagonals de l'estudi."],
    /* gallery — Porsche Cayenne (09) */
    "E-Hybrid · Satin Black Wrap": ["E-Hybrid · Car Wrap negro satinado", "E-Hybrid · Car Wrap negre setinat"],
    "A new-generation Cayenne E-Hybrid transformed with a satin black Car Wrap — blacked-out trim, gloss-black wheels and the acid-green calipers left as the only flash of colour.":
      ["Un Cayenne E-Hybrid de nueva generación transformado con Car Wrap negro satinado — molduras en negro, llantas negro brillo y las pinzas verde ácido como único toque de color.",
       "Un Cayenne E-Hybrid de nova generació transformat amb Car Wrap negre setinat — motllures en negre, llandes negre brillant i les pinces verd àcid com a únic toc de color."],
    "Head-on · Studio lights": ["De frente · Luces del estudio", "De front · Llums de l'estudi"],
    "Front quarter · Acid-green calipers": ["Cuarto delantero · Pinzas verde ácido", "Quart davanter · Pinces verd àcid"],
    "Acid-green calipers": ["Pinzas verde ácido", "Pinces verd àcid"],
    "Porsche crest · Satin black bonnet": ["Escudo Porsche · Capó negro satinado", "Escut Porsche · Capó negre setinat"],
    "The crest": ["El escudo", "L'escut"],
    /* gallery — Porsche 911 Carrera GTS (10) */
    "992 · Satin Sand Wrap": ["992 · Car Wrap arena satinado", "992 · Car Wrap sorra setinat"],
    "A 992 Carrera GTS in a full colour change to a satin sand Car Wrap — gloss-black roof, black wheels, red calipers and the PORSCHE side script kept in black.":
      ["Un 992 Carrera GTS con cambio de color completo a Car Wrap arena satinado — techo negro brillo, llantas negras, pinzas rojas y el lateral PORSCHE en negro.",
       "Un 992 Carrera GTS amb canvi de color complet a Car Wrap sorra setinat — sostre negre brillant, llandes negres, pinces vermelles i el lateral PORSCHE en negre."],
    "Satin Sand": ["Arena satinada", "Sorra setinada"],
    "Head-on · Satin sand finish": ["De frente · Acabado arena satinada", "De front · Acabat sorra setinada"],
    "Rear three-quarter · The green wall": ["Tres cuartos trasero · La pared verde", "Tres quarts posterior · La paret verda"],
    "The green wall": ["La pared verde", "La paret verda"],
    "Light bar · GTS badge": ["Barra de luz · Emblema GTS", "Barra de llum · Emblema GTS"],
    "Light bar": ["Barra de luz", "Barra de llum"],

    /* ---------- PRICES (static chrome only; tiers handled in-page) ---------- */
    "SERRES — Prices": ["Precios — PPF, Car Wrap, Ceramic Coating y Detailing | SERRES", "Preus — PPF, Car Wrap, Ceramic Coating i Detailing | SERRES"],
    "Transparent Pricing": ["Precios transparentes", "Preus transparents"],
    "Pick your": ["Elige tu", "Tria el teu"],
    "level.": ["nivel.", "nivell."],
    "PPF (from €890), Car Wrap (from €250), Ceramic Coating (from €340) and detailing (from €35), VAT included. Three levels per service; every car is confirmed with an exact quote in person.":
      ["Precios de PPF (desde 890 €), Car Wrap (desde 250 €), Ceramic Coating (desde 340 €) y detailing (desde 35 €), IVA incluido. Tres niveles por servicio; cada coche se confirma con un presupuesto exacto en persona.",
       "Preus de PPF (des de 890 €), Car Wrap (des de 250 €), Ceramic Coating (des de 340 €) i detailing (des de 35 €), IVA inclòs. Tres nivells per servei; cada cotxe es confirma amb un pressupost exacte en persona."],
    "Guide prices · final quote depends on vehicle size, condition & film choice · no maintenance kit included":
      ["Precios orientativos · el presupuesto final depende del tamaño del vehículo, su estado y la elección de film · no incluyen kit de mantenimiento",
       "Preus orientatius · el pressupost final depèn de la mida del vehicle, el seu estat i l'elecció de film · no inclouen kit de manteniment"],
    "Compare": ["Compara", "Compara"],
    "levels": ["niveles", "nivells"],
    "Want everything?": ["¿Lo quieres todo?", "Ho vols tot?"],
    "The full build is a": ["El proyecto completo es un", "El projecte complet és un"],
    "Exclusive.": ["Exclusivo.", "Exclusiu."],
    "PPF, wrap, correction, ceramic, interior and body work — one car, one vision, priced as a single project. We take on a limited number each year.":
      ["PPF, Car Wrap, corrección, Ceramic Coating, interior y carrocería — un coche, una visión, presupuestado como un único proyecto. Aceptamos un número limitado cada año.",
       "PPF, Car Wrap, correcció, Ceramic Coating, interior i carrosseria — un cotxe, una visió, pressupostat com un únic projecte. N'acceptem un nombre limitat cada any."],
    "© 2026 SERRES. All rights reserved. \u00A0·\u00A0 Guide prices in EUR, VAT included":
      ["© 2026 SERRES. Todos los derechos reservados. \u00A0·\u00A0 Precios orientativos en EUR, IVA incluido",
       "© 2026 SERRES. Tots els drets reservats. \u00A0·\u00A0 Preus orientatius en EUR, IVA inclòs"],

    /* ---------- PROJECTS / EXCLUSIVO ---------- */
    "Exclusive — Car Transformation Projects in Barcelona | SERRES": ["Exclusivo — Proyectos de Transformación en Barcelona | SERRES", "Exclusiu — Projectes de Transformació a Barcelona | SERRES"],
    "Exclusive": ["Exclusivo", "Exclusiu"],
    "One car.": ["Un coche.", "Un cotxe."],
    "Everything.": ["Todo.", "Tot."],
    "Builds a year": ["Exclusivos al año", "Exclusius l'any"],
    "Car at a time": ["Coche a la vez", "Cotxe alhora"],
    "Bespoke": ["A medida", "A mida"],
    "The Exclusive is our complete car transformation project in Barcelona: paint correction, colour change, PPF, Ceramic Coating, body work and interior — every discipline we have, applied to one car as a single project.":
      ["Exclusivo es nuestro proyecto de transformación completa de coches en Barcelona: corrección de pintura, cambio de color, PPF, Ceramic Coating, carrocería e interior — cada disciplina que tenemos, aplicada a un coche como un único proyecto.",
       "L'Exclusiu és el nostre projecte de transformació completa de cotxes a Barcelona: correcció de pintura, canvi de color, PPF, Ceramic Coating, carrosseria i interior — cada disciplina que tenim, aplicada a un cotxe com un únic projecte."],
    "The Scope": ["El alcance", "L'abast"],
    "Every discipline.": ["Cada disciplina.", "Cada disciplina."],
    "One vision.": ["Una visión.", "Una visió."],
    "An Exclusive isn't a bundle of services — it's one design, executed across every surface of the car.":
      ["Un Exclusivo no es un paquete de servicios — es un único diseño, ejecutado en cada superficie del coche.",
       "Un Exclusiu no és un paquet de serveis — és un únic disseny, executat a cada superfície del cotxe."],
    "The foundation. Multi-stage machine polishing until the paint reads flawless under hex lighting.":
      ["La base. Pulido a máquina multietapa hasta que la pintura se ve impecable bajo la luz hexagonal.",
       "La base. Polit a màquina multietapa fins que la pintura es veu impecable sota la llum hexagonal."],
    "The identity. A full colour change or signature film chosen in a one-to-one design consultation.":
      ["La identidad. Un cambio de color completo o un film signature elegido en una consulta de diseño personalizada.",
       "La identitat. Un canvi de color complet o un film signature triat en una consulta de disseny personalitzada."],
    "The insurance. Self-healing film over the finished surfaces, edges tucked, invisible.":
      ["El seguro. Film autorreparable sobre las superficies acabadas, bordes ocultos, invisible.",
       "L'assegurança. Film autoreparable sobre les superfícies acabades, vores amagades, invisible."],
    "Ceramic Coating": ["Ceramic Coating", "Ceramic Coating"],
    "The seal. Multi-layer SiO₂ over paint, film and glass for years of slick protection.":
      ["El sellado. SiO₂ multicapa sobre pintura, film y cristales para años de protección deslizante.",
       "El segellat. SiO₂ multicapa sobre pintura, film i vidres per a anys de protecció lliscant."],
    "Body & Stance": ["Carrocería y stance", "Carrosseria i stance"],
    "The silhouette. Aero, arches, wheels and fitment resolved as part of the same design.":
      ["La silueta. Aero, pasos de rueda, llantas y encaje resueltos como parte del mismo diseño.",
       "La silueta. Aero, passos de roda, llandes i encaix resolts com a part del mateix disseny."],
    "Interior Revival": ["Renovación de interior", "Renovació d'interior"],
    "The cockpit. Steam-cleaned, conditioned and protected until it matches the outside.":
      ["El habitáculo. Limpiado a vapor, acondicionado y protegido hasta igualar el exterior.",
       "L'habitacle. Netejat a vapor, condicionat i protegit fins a igualar l'exterior."],
    "Explore": ["Ver más", "Mira-ho"],
    "How it works": ["Cómo funciona", "Com funciona"],
    "Three steps to": ["Tres pasos hacia", "Tres passos cap a"],
    "a different car.": ["un coche distinto.", "un cotxe diferent."],
    "The Consultation": ["La consulta", "La consulta"],
    "Bring the car, or just the idea. We talk colours, films, stance and budget — and tell you honestly what's worth doing on your car.":
      ["Trae el coche, o solo la idea. Hablamos de colores, films, stance y presupuesto — y te decimos con honestidad qué merece la pena hacer en tu coche.",
       "Porta el cotxe, o només la idea. Parlem de colors, films, stance i pressupost — i et diem amb honestedat què val la pena fer al teu cotxe."],
    "The Blueprint": ["El plano", "El plànol"],
    "You receive a single document: the full design, the exact scope, the timeline and a fixed price estimation. No surprises later.":
      ["Recibes un único documento: el diseño completo, el alcance exacto, los plazos y una estimación de precio cerrada. Sin sorpresas después.",
       "Reps un únic document: el disseny complet, l'abast exacte, els terminis i una estimació de preu tancada. Sense sorpreses després."],
    "The Build": ["El proyecto", "El projecte"],
    "Your car gets the studio to itself. One team, start to finish — with photo updates at every milestone until handover day.":
      ["Tu coche tiene el taller para él solo. Un equipo, de principio a fin — con fotos en cada hito hasta el día de la entrega.",
       "El teu cotxe té el taller per a ell sol. Un equip, de principi a fi — amb fotos a cada fita fins al dia del lliurament."],
    "Limited by design": ["Limitado por diseño", "Limitat per disseny"],
    "Six Exclusives.": ["Seis Exclusivos.", "Sis Exclusius."],
    "Per year. That's it.": ["Al año. Nada más.", "L'any. Res més."],
    "A full build takes over the studio for weeks, so we only accept a handful each year. Tell us about your car — if the vision fits, we'll reserve your slot and prepare your estimation.":
      ["Un proyecto completo ocupa el taller durante semanas, así que solo aceptamos unos pocos al año. Cuéntanos tu coche — si la visión encaja, reservamos tu plaza y preparamos tu estimación.",
       "Un projecte complet ocupa el taller durant setmanes, així que només n'acceptem uns quants l'any. Explica'ns el teu cotxe — si la visió encaixa, reservem la teva plaça i preparem la teva estimació."],
    "© 2026 SERRES. All rights reserved. \u00A0·\u00A0 Exclusivo — limited full builds":
      ["© 2026 SERRES. Todos los derechos reservados. \u00A0·\u00A0 Exclusivo — proyectos completos limitados",
       "© 2026 SERRES. Tots els drets reservats. \u00A0·\u00A0 Exclusiu — projectes complets limitats"],

    /* ---------- WHY SERRES (static; testimonials in-page) ---------- */
    "Detailing Studio in Sant Cugat — Why SERRES": ["Estudio de Detailing en Sant Cugat — Por Qué SERRES", "Estudi de Detailing a Sant Cugat — Per Què SERRES"],
    "Why": ["Por qué", "Per què"],
    "Cars Transformed": ["Coches transformados", "Cotxes transformats"],
    "Average Rating": ["Valoración media", "Valoració mitjana"],
    "Workshop": ["Taller", "Taller"],
    "We are a detailing studio in Sant Cugat del Vallès with one obsession: doing it properly. No shortcuts, no “good enough” — meticulous prep, premium materials and the same standards applied to a daily driver and a hypercar alike.":
      ["Somos un estudio de detailing en Sant Cugat del Vallès con una obsesión: hacerlo bien. Sin atajos, sin “ya vale” — solo preparación meticulosa, materiales premium y los mismos estándares aplicados a un coche diario y a un hiperdeportivo por igual.",
       "Som un estudi de detailing a Sant Cugat del Vallès amb una obsessió: fer-ho bé. Sense dreceres, sense “ja n'hi ha prou” — només preparació meticulosa, materials premium i els mateixos estàndards aplicats a un cotxe diari i a un hiperesportiu per igual."],
    "The Difference": ["La diferencia", "La diferència"],
    "Standards you": ["Estándares que", "Estàndards que"],
    "can measure.": ["puedes medir.", "pots mesurar."],
    "Four principles that decide whether a car leaves the studio — or stays until it's right.":
      ["Cuatro principios que deciden si un coche sale del taller — o se queda hasta que está perfecto.",
       "Quatre principis que decideixen si un cotxe surt del taller — o es queda fins que està perfecte."],
    "Obsessive": ["Preparación", "Preparació"],
    "prep": ["obsesiva", "obsessiva"],
    "Most of the work happens before the result shows. Decontamination, measurement and correction come first — every time.":
      ["La mayor parte del trabajo ocurre antes de que se vea el resultado. Descontaminación, inspección y corrección van primero — siempre.",
       "La major part de la feina passa abans que es vegi el resultat. Descontaminació, inspecció i correcció van primer — sempre."],
    "Results": ["Resultados", "Resultats"],
    "on display": ["a la vista", "a la vista"],
    "Controlled hex lighting and panel-by-panel inspection. We show you the finish under the light, not just in photos.":
      ["Iluminación hexagonal controlada y revisión panel a panel. Te enseñamos el acabado bajo la luz, no solo en fotos.",
       "Il·luminació hexagonal controlada i revisió panell a panell. T'ensenyem l'acabat sota la llum, no només en fotos."],
    "Premium": ["Materiales", "Materials"],
    "materials": ["premium", "premium"],
    "Only certified films, coatings and compounds — backed by real manufacturer warranties, never grey-market stock.":
      ["Solo films, recubrimientos y compuestos certificados — respaldados por garantías reales de fabricante, nunca stock de mercado gris.",
       "Només films, recobriments i compostos certificats — avalats per garanties reals de fabricant, mai estoc de mercat gris."],
    "One": ["Un solo", "Un sol"],
    "workshop": ["taller", "taller"],
    "One point of contact from start to finish: the same team that quotes your car is the team that hands it back.":
      ["Un único interlocutor de principio a fin: el mismo equipo que presupuesta tu coche es el que te lo entrega.",
       "Un únic interlocutor de principi a fi: el mateix equip que pressuposta el teu cotxe és el que te l'entrega."],
    "What clients say": ["Lo que dicen los clientes", "El que diuen els clients"],
    "Trusted with": ["La confianza de", "La confiança de"],
    "the cars they": ["los coches que", "els cotxes que"],
    "love most.": ["más quieren.", "més estimen."],
    "From a first wrap to a full PPF and correction build — these are the people who handed us the keys, and what they said when they got them back.":
      ["Desde un primer Car Wrap hasta un proyecto completo de PPF y corrección — estas son las personas que nos dieron las llaves, y lo que dijeron al recuperarlas.",
       "Des d'un primer Car Wrap fins a un projecte complet de PPF i correcció — aquestes són les persones que ens van donar les claus, i el que van dir en recuperar-les."],
    "Avg Rating": ["Valoración media", "Valoració mitjana"],
    "Cars": ["Coches", "Cotxes"],
    "Referrals": ["Recomendaciones", "Recomanacions"],
    "Bring us the car": ["Tráenos el coche", "Porta'ns el cotxe"],
    "Hold us to the": ["Exígenos el", "Exigeix-nos l'"],
    "standard.": ["estándar.", "estàndard."],
    "© 2026 SERRES. All rights reserved. \u00A0·\u00A0 Premium Detailing & Customization":
      ["© 2026 SERRES. Todos los derechos reservados. \u00A0·\u00A0 Detailing y personalización premium",
       "© 2026 SERRES. Tots els drets reservats. \u00A0·\u00A0 Detailing i personalització premium"],

    /* ---------- SERVICE: shared ---------- */
    "The Transformation": ["La transformación", "La transformació"],
    "The Process": ["El proceso", "El procés"],
    "Drag to reveal": ["Desliza para revelar", "Llisca per revelar"],
    "Drag to compare before and after": ["Desliza para comparar antes y después", "Llisca per comparar abans i després"],
    "Before": ["Antes", "Abans"],
    "After": ["Después", "Després"],
    "Vehicle": ["Vehículo", "Vehicle"],
    "Coverage": ["Cobertura", "Cobertura"],
    "Warranty": ["Garantía", "Garantia"],
    "Finish": ["Acabado", "Acabat"],
    "Film": ["Film", "Film"],
    "Process": ["Proceso", "Procés"],
    "Effect": ["Efecto", "Efecte"],
    "Coating": ["Recubrimiento", "Recobriment"],
    "Lifespan": ["Durabilidad", "Durabilitat"],
    "Defects": ["Defectos", "Defectes"],
    "Turnaround": ["Plazo", "Termini"],
    "Kit": ["Kit", "Kit"],
    "Fitment": ["Encaje", "Encaix"],

    /* ---------- SERVICE: PPF ---------- */
    "SERRES — Paint Protection Film (PPF)": ["PPF en Barcelona — Protección de Pintura | SERRES", "PPF a Barcelona — Protecció de Pintura | SERRES"],
    "Service 03 · Paint Protection Film": ["Servicio 03 · Paint Protection Film", "Servei 03 · Paint Protection Film"],
    "Paint": ["Paint", "Paint"],
    "Armour": ["Armour", "Armour"],
    "We install PPF in Barcelona, at our workshop in Sant Cugat del Vallès: an invisible urethane skin over your factory paint that absorbs stone chips, swirls and bug acid. Self-healing film with a 3-year warranty, from 890 €. Available clear, gloss, satin and full colour-shift.":
      ["Instalamos PPF en Barcelona, en nuestro taller de Sant Cugat del Vallès: una piel de uretano invisible sobre tu pintura de fábrica que absorbe impactos de piedra, micro-arañazos y ácido de insectos. Film autorregenerable con 3 años de garantía, desde 890 €. Disponible en transparente, brillo, satinado y colour-shift completo.",
       "Instal·lem PPF a Barcelona, al nostre taller de Sant Cugat del Vallès: una pell d'uretà invisible sobre la teva pintura de fàbrica que absorbeix impactes de pedra, micro-ratllades i àcid d'insectes. Film autoregenerable amb 3 anys de garantia, des de 890 €. Disponible en transparent, brillant, setinat i colour-shift complet."],
    "Self-Healing": ["Autorreparable", "Autoreparable"],
    "Film Colours": ["Colores de film", "Colors de film"],
    "Gloss in.": ["Entra en brillo.", "Entra en brillant."],
    "Satin out.": ["Sale en satinado.", "Surt en setinat."],
    "This BMW M2 came in on factory gloss. We wrapped it in a full satin protection film — drag to reveal the new finish.":
      ["Este BMW M2 llegó en brillo de fábrica. Lo cubrimos con un film de protección satinado completo — desliza para revelar el nuevo acabado.",
       "Aquest BMW M2 va arribar en brillant de fàbrica. El vam cobrir amb un film de protecció setinat complet — llisca per revelar el nou acabat."],
    "Every panel was decontaminated, paint-corrected and measured before a single piece of film was laid. The satin PPF then went on edge-to-edge — bumper, arches, mirrors, door shuts — wrapping the factory gloss in a deep, stealth matte skin.":
      ["Cada panel fue descontaminado, corregido y medido antes de colocar una sola pieza de film. El PPF satinado se aplicó de borde a borde — paragolpes, pasos de rueda, espejos, marcos de puerta — envolviendo el brillo de fábrica en una piel mate sigilosa y profunda.",
       "Cada panell va ser descontaminat, corregit i mesurat abans de col·locar una sola peça de film. El PPF setinat es va aplicar de vora a vora — para-xocs, passos de roda, miralls, marcs de porta — embolcallant el brillant de fàbrica en una pell mat sigil·losa i profunda."],
    "The result is a colour-and-texture change and a protective layer in one: stone-chip resistance, self-healing topcoat and a finish that's fully reversible.":
      ["El resultado es un cambio de color y textura y una capa protectora en uno: resistencia a impactos de piedra, capa superior autorreparable y un acabado totalmente reversible.",
       "El resultat és un canvi de color i textura i una capa protectora alhora: resistència a impactes de pedra, capa superior autoreparable i un acabat totalment reversible."],
    "Satin Self-Healing PPF": ["PPF satinado autorreparable", "PPF setinat autoreparable"],
    "Full body wrap": ["Cobertura de carrocería completa", "Cobertura de carrosseria completa"],
    "Why PPF": ["Por qué PPF", "Per què PPF"],
    "Protection you": ["Protección que", "Protecció que"],
    "never see.": ["no se ve.", "no es veu."],
    "A premium film engineered to take the damage so your paint never does.":
      ["Un film premium diseñado para llevarse el daño y que tu pintura nunca lo sufra.",
       "Un film premium dissenyat per endur-se el dany perquè la teva pintura no el pateixi mai."],
    "Stone-chip": ["Defensa contra", "Defensa contra"],
    "defence": ["impactos", "impactes"],
    "Absorbs the impact of gravel, debris and road grit across the highest-risk panels.":
      ["Absorbe el impacto de gravilla, restos y suciedad de la carretera en los paneles de mayor riesgo.",
       "Absorbeix l'impacte de grava, restes i brutícia de la carretera als panells de més risc."],
    "Self-healing": ["Capa superior", "Capa superior"],
    "topcoat": ["autorreparable", "autoreparable"],
    "Light swirls and scratches vanish with heat from the sun or warm water.":
      ["Los micro-arañazos y rayas leves desaparecen con el calor del sol o agua caliente.",
       "Les micro-ratllades i ratlles lleus desapareixen amb la calor del sol o aigua calenta."],
    "Stain &": ["Resistente a", "Resistent a"],
    "UV resistant": ["manchas y UV", "taques i UV"],
    "Repels bug acid, sap, salt and fuel, and blocks the UV that fades paint over time.":
      ["Repele ácido de insectos, savia, sal y combustible, y bloquea los UV que decoloran la pintura con el tiempo.",
       "Repel·leix àcid d'insectes, saba, sal i combustible, i bloqueja els UV que descoloreixen la pintura amb el temps."],
    "Fully": ["Totalmente", "Totalment"],
    "removable": ["reversible", "reversible"],
    "Lifts cleanly years later with no residue — protecting resale and original finish.":
      ["Se retira limpio años después sin residuos — protegiendo el valor de reventa y el acabado original.",
       "Es retira net anys després sense residus — protegint el valor de revenda i l'acabat original."],
    "Three layers,": ["Tres capas,", "Tres capes,"],
    "one invisible skin.": ["una piel invisible.", "una pell invisible."],
    "Each PPF panel is a precision-engineered stack — a sacrificial self-healing topcoat, a shock-absorbing urethane core and a clear, conformable adhesive that disappears over your paint.":
      ["Cada panel de PPF es una estructura de precisión — una capa superior autorreparable de sacrificio, un núcleo de uretano que absorbe impactos y un adhesivo transparente y adaptable que desaparece sobre tu pintura.",
       "Cada panell de PPF és una estructura de precisió — una capa superior autoreparable de sacrifici, un nucli d'uretà que absorbeix impactes i un adhesiu transparent i adaptable que desapareix sobre la teva pintura."],
    "Self-healing topcoat": ["Capa superior autorreparable", "Capa superior autoreparable"],
    "Elastomeric · heals with heat": ["Elastomérica · cura con calor", "Elastomèrica · cura amb calor"],
    "Urethane core": ["Núcleo de uretano", "Nucli d'uretà"],
    "Impact & abrasion barrier": ["Barrera de impacto y abrasión", "Barrera d'impacte i abrasió"],
    "Clear adhesive": ["Adhesivo transparente", "Adhesiu transparent"],
    "Conformable · residue-free": ["Adaptable · sin residuos", "Adaptable · sense residus"],
    "Colour PPF": ["PPF de color", "PPF de color"],
    "Protect it.": ["Protégelo.", "Protegeix-lo."],
    "Express it.": ["Exprésalo.", "Expressa't."],
    "PPF isn't only clear. 50+ colours from several professional brands — gloss, satin, matte and colour-shift — a finish change and a shield in a single film.":
      ["El PPF no es solo transparente. Más de 50 colores de varias marcas profesionales — brillo, satinado, mate y colour-shift — un cambio de acabado y un escudo en un solo film.",
       "El PPF no és només transparent. Més de 50 colors de diverses marques professionals — brillant, setinat, mat i colour-shift — un canvi d'acabat i un escut en un sol film."],
    "Previous colour": ["Color anterior", "Color anterior"],
    "Next colour": ["Color siguiente", "Color següent"],
    "Finishes shown are representative of the protection film ranges we install. Final swatches confirmed in-studio under our lighting before application.":
      ["Los acabados mostrados son representativos de las gamas de film de protección con las que trabajamos. Las muestras finales se confirman en el taller bajo nuestra iluminación antes de aplicar.",
       "Els acabats mostrats són representatius de les gammes de film de protecció amb què treballem. Les mostres finals es confirmen al taller sota la nostra il·luminació abans d'aplicar."],
    "Shield your car": ["Blinda tu coche", "Blinda el teu cotxe"],
    "Protect what you": ["Protege lo que", "Protegeix el que"],
    "drive.": ["conduces.", "condueixes."],
    "© 2026 SERRES. All rights reserved. \u00A0·\u00A0 Paint Protection Film · Inozetek · 3M":
      ["© 2026 SERRES. Todos los derechos reservados. \u00A0·\u00A0 Paint Protection Film · Inozetek · 3M",
       "© 2026 SERRES. Tots els drets reservats. \u00A0·\u00A0 Paint Protection Film · Inozetek · 3M"],

    /* ---------- SERVICE: CERAMIC ---------- */
    "SERRES — Ceramic Coating": ["Tratamiento Cerámico para Coche en Barcelona | SERRES", "Tractament Ceràmic per a Cotxe a Barcelona | SERRES"],
    "Service 02 · Ceramic Coating": ["Servicio 02 · Ceramic Coating", "Servei 02 · Ceramic Coating"],
    "Liquid": ["Cristal", "Vidre"],
    "Glass": ["líquido", "líquid"],
    "Surface Hardness": ["Dureza superficial", "Duresa superficial"],
    "Protection": ["Protección", "Protecció"],
    "Water Contact": ["Contacto del agua", "Contacte de l'aigua"],
    "The SERRES ceramic coating for cars in Barcelona: a SiO₂ coating that chemically bonds to the paint — sealing the gloss with a slick, hydrophobic layer that repels water, grime and UV for years.":
      ["El tratamiento cerámico para coche en Barcelona de SERRES: un recubrimiento SiO₂ que se adhiere químicamente a la pintura — sella el brillo con una capa hidrófoba y deslizante que repele agua, suciedad y UV durante años.",
       "El tractament ceràmic per a cotxe a Barcelona de SERRES: un recobriment SiO₂ que s'adhereix químicament a la pintura — segella la brillantor amb una capa hidròfoba i lliscant que repel·leix aigua, brutícia i UV durant anys."],
    "Water just": ["El agua", "L'aigua"],
    "lets go.": ["se suelta.", "es deixa anar."],
    "Same hood, same hex light. Drag the slider to watch flat, clinging water snap into tight beads that roll straight off.":
      ["Mismo capó, misma luz hexagonal. Desliza el control para ver cómo el agua plana y pegada se convierte en gotas apretadas que ruedan al instante.",
       "Mateix capó, mateixa llum hexagonal. Llisca el control per veure com l'aigua plana i enganxada es converteix en gotes atapeïdes que rodolen a l'instant."],
    "Before coating, water lies flat across the panel and clings — dragging dust, minerals and road film into the surface as it slowly dries into spots.":
      ["Antes del recubrimiento, el agua queda plana sobre el panel y se adhiere — arrastrando polvo, minerales y película de carretera a la superficie mientras se seca en manchas.",
       "Abans del recobriment, l'aigua queda plana sobre el panell i s'hi adhereix — arrossegant pols, minerals i pel·lícula de carretera a la superfície mentre s'asseca en taques."],
    "Once our ceramic layer cures, the surface energy drops dramatically. Water can't wet the paint, so it pulls into beads and sheets away — taking dirt with it and leaving the gloss untouched.":
      ["Una vez cura nuestra capa cerámica, la energía superficial cae drásticamente. El agua no puede mojar la pintura, así que forma gotas y resbala — llevándose la suciedad y dejando el brillo intacto.",
       "Un cop cura la nostra capa ceràmica, l'energia superficial cau dràsticament. L'aigua no pot mullar la pintura, així que forma gotes i llisca — emportant-se la brutícia i deixant la brillantor intacta."],
    "Sedan · Gloss Black": ["Sedán · Negro brillo", "Sedan · Negre brillant"],
    "SiO₂ ceramic · 2 layers": ["Cerámica SiO₂ · 2 capas", "Ceràmica SiO₂ · 2 capes"],
    "Hydrophobic · self-cleaning": ["Hidrófobo · autolimpiante", "Hidròfob · autonetejant"],
    "Up to 5 years": ["Hasta 5 años", "Fins a 5 anys"],
    "Prep. Coat.": ["Prepara. Aplica.", "Prepara. Aplica."],
    "Cure.": ["Cura.", "Cura."],
    "Ceramic is only as good as the surface beneath it. We correct and decontaminate first, then bond the coating and cure it in.":
      ["La cerámica solo es tan buena como la superficie de debajo. Primero corregimos y descontaminamos, luego adherimos el recubrimiento y lo curamos.",
       "La ceràmica només és tan bona com la superfície de sota. Primer corregim i descontaminem, després adherim el recobriment i el curem."],
    "Prep & Decon": ["Preparación y descontaminación", "Preparació i descontaminació"],
    "Wash · clay · paint correction": ["Lavado · clay · corrección de pintura", "Rentat · clay · correcció de pintura"],
    "Every defect is locked in forever once coated — so we decontaminate, clay and machine-correct the paint to a clean, swirl-free base first.":
      ["Cada defecto queda sellado para siempre una vez recubierto — por eso primero descontaminamos, pasamos clay y corregimos a máquina hasta una base limpia y sin micro-arañazos.",
       "Cada defecte queda segellat per sempre un cop recobert — per això primer descontaminem, passem clay i corregim a màquina fins a una base neta i sense micro-ratllades."],
    "Application": ["Aplicación", "Aplicació"],
    "SiO₂ ceramic · hand-levelled": ["Cerámica SiO₂ · nivelada a mano", "Ceràmica SiO₂ · anivellada a mà"],
    "The liquid coating is laid down panel by panel and levelled by hand in tight sections, bonding chemically with the clear coat as it flashes.":
      ["El recubrimiento líquido se aplica panel a panel y se nivela a mano en secciones pequeñas, adhiriéndose químicamente al barniz a medida que evapora.",
       "El recobriment líquid s'aplica panell a panell i s'anivella a mà en seccions petites, adherint-se químicament al vernís a mesura que s'evapora."],
    "Cure": ["Curado", "Curat"],
    "Controlled cure · 24h dwell": ["Curado controlado · 24h de reposo", "Curat controlat · 24h de repòs"],
    "The coating is left to cross-link and harden in a dust-free, climate-controlled bay — setting into the slick, glass-hard shell.":
      ["El recubrimiento se deja reticular y endurecer en un box sin polvo y con clima controlado — fraguando en una capa deslizante y dura como el cristal.",
       "El recobriment es deixa reticular i endurir en un box sense pols i amb clima controlat — fraguant en una capa lliscant i dura com el vidre."],
    "Water tells": ["El agua cuenta", "L'aigua explica"],
    "the whole story.": ["toda la historia.", "tota la història."],
    "Hydrophobic performance is measured by water contact angle — the higher the angle, the tighter water beads and the faster it sheets away. Bare paint barely holds a bead.":
      ["El rendimiento hidrófobo se mide por el ángulo de contacto del agua — cuanto mayor el ángulo, más apretadas las gotas y más rápido resbalan. La pintura desnuda apenas forma gota.",
       "El rendiment hidròfob es mesura per l'angle de contacte de l'aigua — com més gran l'angle, més atapeïdes les gotes i més ràpid llisquen. La pintura nua amb prou feines forma gota."],
    "Bare paint": ["Pintura desnuda", "Pintura nua"],
    "Ceramic coated": ["Con cerámica", "Amb ceràmica"],
    "Seal in the shine": ["Sella el brillo", "Segella la brillantor"],
    "Lock in the": ["Fija el", "Fixa la"],
    "gloss.": ["brillo.", "brillantor."],
    "© 2026 SERRES. All rights reserved. \u00A0·\u00A0 SiO₂ Ceramic Coating":
      ["© 2026 SERRES. Todos los derechos reservados. \u00A0·\u00A0 Ceramic Coating SiO₂",
       "© 2026 SERRES. Tots els drets reservats. \u00A0·\u00A0 Ceramic Coating SiO₂"],

    /* ---------- SERVICE: DETAILING ---------- */
    "SERRES — Detailing": ["Detailing y Limpieza Interior de Coche en Barcelona | SERRES", "Detailing i Neteja Interior de Cotxe a Barcelona | SERRES"],
    "Service 05 · Detailing": ["Servicio 05 · Detailing", "Servei 05 · Detailing"],
    "Showroom": ["Como recién", "Com acabat"],
    "Fresh": ["entregado", "de lliurar"],
    "In & Out": ["Dentro y fuera", "Dins i fora"],
    "Hand Finished": ["Acabado a mano", "Acabat a mà"],
    "Cut Corners": ["Atajos", "Dreceres"],
    "Car detailing in Barcelona: steam cleaning, decontamination and hand finishing, inside and out, at our Sant Cugat del Vallès studio. Deep Clean from €150.":
      ["Detailing de coche en Barcelona: limpieza a vapor, descontaminación y acabado a mano, por dentro y por fuera, en nuestro estudio de Sant Cugat del Vallès. Deep Clean desde 150 €.",
       "Detailing de cotxe a Barcelona: neteja al vapor, descontaminació i acabat a mà, per dins i per fora, al nostre estudi de Sant Cugat del Vallès. Deep Clean des de 150 €."],
    "Interior Detailing": ["Detailing de interior", "Detailing d'interior"],
    "Lived-in": ["De usado", "De fet servir"],
    "to like-new.": ["a como nuevo.", "a com nou."],
    "Ground-in dust, dull plastics and tired leather — steam-cleaned, conditioned and reset until the cabin feels factory again.":
      ["Polvo incrustado, plásticos apagados y cuero cansado — limpiados a vapor, acondicionados y reiniciados hasta que el habitáculo se siente de fábrica otra vez.",
       "Pols incrustada, plàstics apagats i cuir cansat — netejats a vapor, condicionats i reiniciats fins que l'habitacle se sent de fàbrica un altre cop."],
    "Dust & Grime": ["Polvo y suciedad", "Pols i brutícia"],
    "Steam-Cleaned": ["Limpio a vapor", "Net a vapor"],
    "Exterior Detailing": ["Detailing de exterior", "Detailing d'exterior"],
    "Dust-caked": ["De lleno de polvo", "De ple de pols"],
    "to deep gloss.": ["a brillo profundo.", "a brillantor profunda."],
    "A full decontamination wash lifts road film and fallout, then we dry and dress every panel until the paint reads wet under the lights.":
      ["Un lavado de descontaminación completo retira la película de carretera y la contaminación férrica, luego secamos y tratamos cada panel hasta que la pintura se ve húmeda bajo las luces.",
       "Un rentat de descontaminació complet retira la pel·lícula de carretera i la contaminació fèrrica, després assequem i tractem cada panell fins que la pintura es veu humida sota els llums."],
    "Dusty & Dull": ["Sucio y apagado", "Brut i apagat"],
    "Deep Gloss": ["Brillo profundo", "Brillantor profunda"],
    "Strip. Clean.": ["Retira. Limpia.", "Retira. Neteja."],
    "Protect.": ["Protege.", "Protegeix."],
    "A full inside-and-out reset — we remove what's built up, clean down to the surface, then dress and protect every finish.":
      ["Un reinicio completo por dentro y por fuera — quitamos lo acumulado, limpiamos hasta la superficie, luego tratamos y protegemos cada acabado.",
       "Un reinici complet per dins i per fora — traiem l'acumulat, netegem fins a la superfície, després tractem i protegim cada acabat."],
    "Decontaminate": ["Descontaminar", "Descontaminar"],
    "Foam wash · clay · fallout": ["Lavado con espuma · clay · descontaminación", "Rentat amb escuma · clay · descontaminació"],
    "A pH-neutral foam bath lifts loose grime, then clay and iron remover pull out the bonded road film and brake fallout a wash leaves behind.":
      ["Un baño de espuma de pH neutro retira la suciedad suelta, luego el clay y el descontaminante férrico sacan la película de carretera y la contaminación de freno que deja un lavado.",
       "Un bany d'escuma de pH neutre retira la brutícia solta, després el clay i el descontaminant fèrric treuen la pel·lícula de carretera i la contaminació de fre que deixa un rentat."],
    "Deep Clean": ["Limpieza profunda", "Neteja profunda"],
    "Steam · extraction · brushes": ["Vapor · extracción · cepillos", "Vapor · extracció · raspalls"],
    "Inside, every panel, vent and seam is steamed and agitated; carpets and leather are extracted and wiped down until the cabin is truly clean.":
      ["Dentro, cada panel, rejilla y costura se trata a vapor y se cepilla; alfombras y cuero se extraen y se limpian hasta que el habitáculo está realmente limpio.",
       "Dins, cada panell, reixeta i costura es tracta a vapor i es raspalla; catifes i cuir s'extreuen i es netegen fins que l'habitacle està realment net."],
    "Dress & Protect": ["Tratar y proteger", "Tractar i protegir"],
    "Sealant · conditioner · UV": ["Sellador · acondicionador · UV", "Segellador · condicionador · UV"],
    "Paint is sealed for gloss and beading, trim and leather are conditioned and UV-protected, and the glass gets a rain-repellent treatment and is left streak-free.":
      ["La pintura se sella para brillo y repelencia, los plásticos y el cuero se acondicionan y protegen de los UV, y los cristales reciben un tratamiento antilluvia y quedan sin marcas.",
       "La pintura es segella per brillantor i repel·lència, els plàstics i el cuir es condicionen i es protegeixen dels UV, i els vidres reben un tractament antipluja i queden sense marques."],
    "Inside & out": ["Por dentro y por fuera", "Per dins i per fora"],
    "Make it feel": ["Haz que se sienta", "Fes que se senti"],
    "new again.": ["nuevo otra vez.", "nou un altre cop."],
    "© 2026 SERRES. All rights reserved. \u00A0·\u00A0 Interior & Exterior Detailing":
      ["© 2026 SERRES. Todos los derechos reservados. \u00A0·\u00A0 Detailing de interior y exterior",
       "© 2026 SERRES. Tots els drets reservats. \u00A0·\u00A0 Detailing d'interior i exterior"],

    /* ---------- SERVICE: PAINT CORRECTION ---------- */
    "SERRES — Paint Correction": ["Pulido y Corrección de Pintura de Coche en Barcelona | SERRES", "Polit i Correcció de Pintura de Cotxe a Barcelona | SERRES"],
    "Service 04 · Paint Correction": ["Servicio 04 · Corrección de pintura", "Servei 04 · Correcció de pintura"],
    "Staged": ["Pulido", "Polit"],
    "polishing": ["por etapas", "per etapes"],
    "Stage Polish": ["Pulido por etapas", "Polit per etapes"],
    "Defect Removal": ["Eliminación de defectos", "Eliminació de defectes"],
    "Holograms": ["Hologramas", "Hologrames"],
    "SERRES car polishing in Barcelona is a multi-stage machine paint correction that removes micro-scratches, holograms and oxidation, restoring the true gloss and depth of your paint. We work in Sant Cugat del Vallès, 20 minutes from Barcelona.":
      ["El pulido de coche en Barcelona de SERRES es una corrección multietapa a máquina que elimina micro-arañazos, hologramas y oxidación, devolviendo el brillo y la profundidad reales a tu pintura. Trabajamos en Sant Cugat del Vallès, a 20 minutos de Barcelona.",
       "El polit de cotxe a Barcelona de SERRES és una correcció multietapa a màquina que elimina micro-ratllades, hologrames i oxidació, tornant la brillantor i la profunditat reals a la teva pintura. Treballem a Sant Cugat del Vallès, a 20 minuts de Barcelona."],
    "From hazy": ["De turbio", "De tèrbol"],
    "to mirror.": ["a espejo.", "a mirall."],
    "Same panel, same light. Drag the slider to see swirls and dullness give way to a flawless, reflective finish.":
      ["Mismo panel, misma luz. Desliza el control para ver cómo los micro-arañazos y la opacidad dan paso a un acabado impecable y reflectante.",
       "Mateix panell, mateixa llum. Llisca el control per veure com les micro-ratllades i l'opacitat donen pas a un acabat impecable i reflectant."],
    "This BMW arrived with years of wash-induced swirls and micro-marring dulling its gloss black — light scattering in every direction instead of reflecting cleanly.":
      ["Este BMW llegó con años de micro-arañazos de lavado y micro-marcas apagando su negro brillo — la luz dispersándose en todas direcciones en vez de reflejarse limpia.",
       "Aquest BMW va arribar amb anys de micro-ratllades de rentat i micro-marques apagant el seu negre brillant — la llum dispersant-se en totes direccions en lloc de reflectir-se neta."],
    "We assessed the clear coat, then cut, refined and finished the paint by machine until the defects were gone. The hex lighting now mirrors back razor-sharp, with deep, wet-looking reflections restored.":
      ["Evaluamos el estado del barniz, luego cortamos, refinamos y acabamos la pintura a máquina hasta eliminar los defectos. La luz hexagonal ahora se refleja nítida, con reflejos profundos y de aspecto húmedo restaurados.",
       "Vam avaluar l'estat del vernís, després vam tallar, refinar i acabar la pintura a màquina fins a eliminar els defectes. La llum hexagonal ara es reflecteix nítida, amb reflexos profunds i d'aspecte humit restaurats."],
    "BMW Coupé · Gloss Black": ["BMW Coupé · Negro brillo", "BMW Coupé · Negre brillant"],
    "Stage polishing · Stage 3": ["Pulido por etapas · Etapa 3", "Polit per etapes · Etapa 3"],
    "Swirls · holograms · oxidation": ["Micro-arañazos · hologramas · oxidación", "Micro-ratllades · hologrames · oxidació"],
    "Sealed & protected": ["Sellado y protegido", "Segellat i protegit"],
    "Stage 1. Stage 2.": ["Etapa 1. Etapa 2.", "Etapa 1. Etapa 2."],
    "Stage 3.": ["Etapa 3.", "Etapa 3."],
    "No two paints are alike: the polish adapts to the condition of your paint and the level of correction needed — from a one-stage enhancement to a full three-stage correction.":
      ["No hay dos pinturas iguales: el pulido se adapta al estado de tu pintura y al nivel de corrección necesario — desde un realce de una etapa hasta una corrección completa de tres.",
       "No hi ha dues pintures iguals: el polit s'adapta a l'estat de la teva pintura i al nivell de correcció necessari — des d'un realç d'una etapa fins a una correcció completa de tres."],
    "A measured, three-stage system — never a one-hit polish. We remove only what's needed and finish to true clarity.":
      ["Un sistema medido de tres etapas — nunca un pulido de una sola pasada. Eliminamos solo lo necesario y acabamos hasta una claridad real.",
       "Un sistema mesurat de tres etapes — mai un polit d'una sola passada. Eliminem només el necessari i acabem fins a una claredat real."],
    "Stage 1 · Cut": ["Etapa 1 · Corte", "Etapa 1 · Tall"],
    "Cutting pad · heavy compound": ["Boina de corte · compound agresivo", "Boina de tall · compound agressiu"],
    "The aggressive stage — levelling deeper scratches, swirls and oxidation by removing a precise micron-thin layer of clear coat.":
      ["La etapa agresiva — eliminando arañazos más profundos, micro-arañazos y oxidación al retirar una capa de barniz de micras precisa.",
       "L'etapa agressiva — eliminant ratllades més profundes, micro-ratllades i oxidació en retirar una capa de vernís de micres precisa."],
    "Stage 2 · Refine": ["Etapa 2 · Refinado", "Etapa 2 · Refinat"],
    "Polishing pad · medium polish": ["Boina de pulido · pulido medio", "Boina de polit · polit mitjà"],
    "The haze and micro-marring left by cutting are refined away, building back clarity and lifting gloss across the panel.":
      ["La turbidez y las micro-marcas que deja el corte se refinan, recuperando claridad y elevando el brillo en todo el panel.",
       "La tèrbolesa i les micro-marques que deixa el tall es refinen, recuperant claredat i elevant la brillantor a tot el panell."],
    "Stage 3 · Finish": ["Etapa 3 · Acabado", "Etapa 3 · Acabat"],
    "Finishing pad · fine polish": ["Boina de acabado · pulido fino", "Boina d'acabat · polit fi"],
    "The final mirror-finish (jewelling) pass eliminates holograms and brings the paint to a true, defect-free gloss before it's sealed in.":
      ["La pasada final de acabado espejo (jewelling) elimina hologramas y lleva la pintura a un brillo real y sin defectos antes de sellarla.",
       "La passada final d'acabat mirall (jewelling) elimina hologrames i porta la pintura a una brillantor real i sense defectes abans de segellar-la."],
    "The numbers,": ["Los números,", "Els números,"],
    "not just the shine.": ["no solo el brillo.", "no només la brillantor."],
    "Gloss is expressed in GU (gloss units): the higher the number, the deeper and sharper the reflection. Typical results on neglected paint:":
      ["El brillo se expresa en GU (unidades de brillo): cuanto más alto, más profundo y nítido el reflejo. Resultados típicos en pintura descuidada:",
       "La brillantor s'expressa en GU (unitats de brillantor): com més alt, més profund i nítid el reflex. Resultats típics en pintura descuidada:"],
    "On arrival": ["A la llegada", "A l'arribada"],
    "After correction": ["Tras la corrección", "Després de la correcció"],
    "Restore the depth": ["Recupera la profundidad", "Recupera la profunditat"],
    "Bring back the": ["Devuelve el", "Torna la"],
    "© 2026 SERRES. All rights reserved. \u00A0·\u00A0 Multi-Stage Machine Polishing":
      ["© 2026 SERRES. Todos los derechos reservados. \u00A0·\u00A0 Pulido por etapas a máquina",
       "© 2026 SERRES. Tots els drets reservats. \u00A0·\u00A0 Polit per etapes a màquina"],

    /* ---------- SERVICE: VINYL ---------- */
    "SERRES — Car Wrap / Vinyl": ["Car Wrap en Barcelona — Cambio de Color | SERRES", "Car Wrap a Barcelona — Canvi de Color | SERRES"],
    "Service 01 · Car Wrap": ["Servicio 01 · Car Wrap", "Servei 01 · Car Wrap"],
    "Car": ["Car", "Car"],
    "Film Colours ": ["Colores de film ", "Colors de film "],
    "Finish Families": ["Familias de acabado", "Famílies d'acabat"],
    "Pro film brands": ["Marcas profesionales", "Marques professionals"],
    "Reversible": ["Reversible", "Reversible"],
    "Film layers": ["Capas de film", "Capes de film"],
    "Layers": ["Capas", "Capes"],
    "Car wrapping in Barcelona: we wrap your car with a full or partial colour change using 3M, Avery Dennison and Inozetek films — over 150 colours in matte, satin, gloss, metallic and colour-flip. Full car from €1,490, fully reversible, at our workshop in Sant Cugat del Vallès.":
      ["Car wrapping en Barcelona: vinilamos tu coche con cambio de color total o parcial usando films 3M, Avery Dennison e Inozetek — más de 150 colores en mate, satinado, brillo, metalizado y colour-flip. Coche completo desde 1.490 €, totalmente reversible, en nuestro taller de Sant Cugat del Vallès.",
       "Car wrapping a Barcelona: vinilem el teu cotxe amb canvi de color total o parcial amb films 3M, Avery Dennison i Inozetek — més de 150 colors en mat, setinat, brillant, metal·litzat i colour-flip. Cotxe complet des de 1.490 €, totalment reversible, al nostre taller de Sant Cugat del Vallès."],
    "The Palette": ["La paleta", "La paleta"],
    "Every colour to": ["Todos los colores para", "Tots els colors per a"],
    "wrap your car": ["vinilar tu coche", "vinilar el teu cotxe"],
    "We work with several professional brands. Pick the brand, filter by colour family and drag to explore.":
      ["Trabajamos con varias marcas profesionales. Elige la marca, filtra por familia de color y desliza para explorar.",
       "Treballem amb diverses marques professionals. Tria la marca, filtra per família de color i llisca per explorar."],
    "Scroll left": ["Desplazar a la izquierda", "Desplaça a l'esquerra"],
    "Scroll right": ["Desplazar a la derecha", "Desplaça a la dreta"],
    "One panel at": ["Un panel a", "Un panell a"],
    "a time.": ["la vez.", "la vegada."],
    "This BMW XM arrived in factory gloss black. We stripped it back, decontaminated every surface and re-skinned it in a deep satin-black film — bumper to roofline, mirror caps to door shuts.":
      ["Este BMW XM llegó en negro brillo de fábrica. Lo desnudamos, descontaminamos cada superficie y lo revestimos con un film negro satinado profundo — del paragolpes al techo, de los retrovisores a los marcos de puerta.",
       "Aquest BMW XM va arribar en negre brillant de fàbrica. El vam desnudar, descontaminar cada superfície i revestir amb un film negre setinat profund — del para-xocs al sostre, dels retrovisors als marcs de porta."],
    "Drag the slider to see the change. No paint touched, fully reversible, and protecting the original finish underneath.":
      ["Desliza el control para ver el cambio. Sin tocar la pintura, totalmente reversible y protegiendo el acabado original de debajo.",
       "Llisca el control per veure el canvi. Sense tocar la pintura, totalment reversible i protegint l'acabat original de sota."],
    "3M\u2122 2080 Satin Black": ["3M\u2122 2080 Satin Black", "3M\u2122 2080 Satin Black"],
    "Full body colour change": ["Cambio de color de carrocería completa", "Canvi de color de carrosseria completa"],
    "5–7 days": ["5–7 días", "5–7 dies"],
    "Book your wrap": ["Reserva tu Car Wrap", "Reserva el teu Car Wrap"],
    "Found your": ["¿Has encontrado tu", "Has trobat el teu"],
    "colour?": ["color?", "color?"],
    "© 2026 SERRES. All rights reserved. \u00A0·\u00A0 Car Wrap · 3M · Avery Dennison · Inozetek":
      ["© 2026 SERRES. Todos los derechos reservados. \u00A0·\u00A0 Car Wrap · 3M · Avery Dennison · Inozetek",
       "© 2026 SERRES. Tots els drets reservats. \u00A0·\u00A0 Car Wrap · 3M · Avery Dennison · Inozetek"],

    /* ---------- SERVICE: BODY KITS ---------- */
    "SERRES — Body Kits": ["Montaje de Body Kits en Barcelona | SERRES", "Muntatge de Body Kits a Barcelona | SERRES"],
    "Service 06 · Body Kits": ["Servicio 06 · Body Kits", "Servei 06 · Body Kits"],
    "Built for": ["Hecho para", "Fet per a"],
    "Presence": ["impactar", "impactar"],
    "Kit Types": ["Tipos de kit", "Tipus de kit"],
    "Transformation": ["Transformación", "Transformació"],
    "We fit body kits in Barcelona (workshop in Sant Cugat del Vallès): installation, painting and OEM-level fitment of lips, diffusers, spoilers and widebody conversions, from €450. Custom rims and exhaust tips too, to completely transform your car.":
      ["Realizamos el montaje de body kits en Barcelona (taller en Sant Cugat del Vallès): instalación, pintura y ajuste a nivel OEM de labios, difusores, alerones y conversiones widebody, desde 450 €. También llantas a medida y colas de escape para transformar por completo tu coche.",
       "Fem el muntatge de body kits a Barcelona (taller a Sant Cugat del Vallès): instal·lació, pintura i ajust a nivell OEM de llavis, difusors, alerons i conversions widebody, des de 450 €. També llandes a mida i sortides d'escapament per transformar del tot el teu cotxe."],
    "Stock to": ["De serie a", "De sèrie a"],
    "street weapon.": ["arma de calle.", "arma de carrer."],
    "Same Golf GTI, same spot. Drag the slider to watch a factory rear turn into full aero — diffuser, spoiler, splitters and blacked-out tips.":
      ["Mismo Golf GTI, mismo sitio. Desliza el control para ver cómo una trasera de serie se convierte en aero completo — difusor, alerón, splitters y colas en negro.",
       "Mateix Golf GTI, mateix lloc. Llisca el control per veure com una part posterior de sèrie es converteix en aero complet — difusor, aleró, splitters i sortides en negre."],
    "This Mk7 GTI came in on its standard rear end — clean, but conservative. The owner wanted real road presence without touching the paint.":
      ["Este GTI Mk7 llegó con su trasera estándar — limpia, pero conservadora. El propietario quería presencia real en carretera sin tocar la pintura.",
       "Aquest GTI Mk7 va arribar amb la seva part posterior estàndard — neta, però conservadora. El propietari volia presència real a la carretera sense tocar la pintura."],
    "We fitted a full rear aero package: an aggressive diffuser, extended roof spoiler, side and rear splitters and gloss-black exhaust tips — all colour-matched and mounted to factory standards.":
      ["Montamos un paquete aero trasero completo: un difusor agresivo, alerón de techo extendido, splitters laterales y traseros y colas de escape en negro brillo — todo igualado en color y montado a estándares de fábrica.",
       "Vam muntar un paquet aero posterior complet: un difusor agressiu, aleró de sostre estès, splitters laterals i posteriors i sortides d'escapament en negre brillant — tot igualat en color i muntat a estàndards de fàbrica."],
    "VW Golf GTI Mk7 · Tornado Red": ["VW Golf GTI Mk7 · Tornado Red", "VW Golf GTI Mk7 · Tornado Red"],
    "Rear diffuser · spoiler · splitters": ["Difusor trasero · alerón · splitters", "Difusor posterior · aleró · splitters"],
    "Gloss-black exhaust tips": ["Colas de escape en negro brillo", "Sortides d'escapament en negre brillant"],
    "Bolt-on · OEM-grade": ["Atornillado · nivel OEM", "Cargolat · nivell OEM"],
    "What We Fit": ["Qué montamos", "Què muntem"],
    "Kits, rims": ["Kits, llantas", "Kits, llandes"],
    "& tips.": ["y colas.", "i sortides."],
    "We install all types of body kits, plus the details that finish the look — custom rims and exhaust tips, sourced and fitted with precision.":
      ["Instalamos todo tipo de body kits, además de los detalles que rematan el look — llantas a medida y colas de escape, suministradas y montadas con precisión.",
       "Instal·lem tot tipus de body kits, a més dels detalls que rematen el look — llandes a mida i sortides d'escapament, subministrades i muntades amb precisió."],
    "All types · OEM & aftermarket": ["Todos los tipos · OEM y aftermarket", "Tots els tipus · OEM i aftermarket"],
    "Front lips, splitters, side skirts, rear diffusers, spoilers and full widebody conversions — dry-fitted, colour-matched and mounted to factory standards.":
      ["Labios delanteros, splitters, faldones laterales, difusores traseros, alerones y conversiones widebody completas — montados en seco, igualados en color y fijados a estándares de fábrica.",
       "Llavis davanters, splitters, faldons laterals, difusors posteriors, alerons i conversions widebody completes — muntats en sec, igualats en color i fixats a estàndards de fàbrica."],
    "Custom Rims": ["Llantas a medida", "Llandes a mida"],
    "Sizing · finishes · fitment": ["Medidas · acabados · encaje", "Mides · acabats · encaix"],
    "The right wheel changes everything. We spec diameter, ET (offset) and finish to fill the arches and lock in the stance — then fit and balance them properly.":
      ["La llanta correcta lo cambia todo. Definimos diámetro, ET (offset) y acabado para llenar los pasos de rueda y fijar el stance — luego las montamos y equilibramos como toca.",
       "La llanda correcta ho canvia tot. Definim diàmetre, ET (offset) i acabat per omplir els passos de roda i fixar el stance — després les muntem i equilibrem com cal."],
    "Exhaust Tips": ["Colas de escape", "Sortides d'escapament"],
    "Gloss black · chrome · carbon": ["Negro brillo · cromo · carbono", "Negre brillant · crom · carboni"],
    "The finishing detail at the rear — blacked-out, polished or carbon tips, sized and aligned to sit clean against the bumper and diffuser.":
      ["El detalle final en la trasera — colas en negro, pulidas o de carbono, dimensionadas y alineadas para quedar limpias contra el paragolpes y el difusor.",
       "El detall final a la part posterior — sortides en negre, polides o de carboni, dimensionades i alineades per quedar netes contra el para-xocs i el difusor."],
    "Change the stance": ["Cambia la postura", "Canvia la postura"],
    "Give it real": ["Dale presencia", "Dona-li presència"],
    "presence.": ["de verdad.", "de veritat."],
    "© 2026 SERRES. All rights reserved. \u00A0·\u00A0 Body Kits · Custom Rims · Exhaust Tips":
      ["© 2026 SERRES. Todos los derechos reservados. \u00A0·\u00A0 Body Kits · Llantas a medida · Colas de escape",
       "© 2026 SERRES. Tots els drets reservats. \u00A0·\u00A0 Body Kits · Llandes a mida · Sortides d'escapament"],

    /* ===================================================================
       DATA-DRIVEN SECTIONS — rendered from JS, translated in-page via
       window.SERRES_I18N.t() and re-rendered on `serres:langchange`.
       =================================================================== */

    /* ---------- PRICES: tab labels + UI words ---------- */
    "Car Wrap": ["Car Wrap", "Car Wrap"],
    "Correction + Ceramic": ["Pulido + Cerámica", "Poliment + Ceràmica"],
    "pricing": ["precios", "preus"],
    "Most chosen": ["Más elegido", "Més triat"],
    "From": ["Desde", "Des de"],
    "from": ["desde", "des de"],
    "Book via WhatsApp": ["Reserva por WhatsApp", "Reserva per WhatsApp"],
    "Request a quote": ["Pide presupuesto", "Demana pressupost"],
    "On request": ["A consultar", "A consultar"],
    "Message us to calculate your price": ["Escríbenos para calcular tu precio", "Escriu-nos per calcular el teu preu"],
    "Feature": ["Característica", "Característica"],
    "Guide price": ["Precio orientativo", "Preu orientatiu"],

    /* ---------- PRICES: service blurbs ---------- */
    "Colour change with films from several professional brands — from subtle accents to a full identity change.":
      ["Cambio de color con films de varias marcas profesionales — desde acentos sutiles hasta un cambio de identidad completo.",
       "Canvi de color amb films de diverses marques professionals — des d'accents subtils fins a un canvi d'identitat complet."],
    "Self-healing paint protection film — 50+ colours from several professional brands — over the areas the road attacks first, or the whole car.":
      ["Film de protección de pintura autorreparable — más de 50 colores de varias marcas profesionales — sobre las zonas que la carretera ataca primero, o el coche entero.",
       "Film de protecció de pintura autoreparable — més de 50 colors de diverses marques professionals — sobre les zones que la carretera ataca primer, o el cotxe sencer."],
    "Stage polishing to remove the swirls, then a Ceramic Coating to lock the gloss in — the two steps that belong together.":
      ["Pulido por etapas para eliminar los micro-arañazos y, a continuación, un tratamiento Ceramic Coating que sella el brillo — los dos pasos que van de la mano.",
       "Polit per etapes per eliminar les micro-ratllades i, tot seguit, un tractament Ceramic Coating que segella la brillantor — els dos passos que van de la mà."],
    "Machine polishing that removes swirls, holograms and oxidation — measured, not guessed.":
      ["Pulido a máquina que elimina micro-arañazos, hologramas y oxidación — medido, no improvisado.",
       "Polit a màquina que elimina micro-ratllades, hologrames i oxidació — mesurat, no improvisat."],
    "From a proper reset wash to a full showroom revival, inside and out.":
      ["Desde un lavado de reinicio en condiciones hasta una renovación de exposición completa, por dentro y por fuera.",
       "Des d'un rentat de reinici en condicions fins a una renovació d'exposició completa, per dins i per fora."],
    "Aero and body work sourced, fitted and finished like it left the factory that way.":
      ["Aero y carrocería suministrados, montados y rematados como si saliera así de fábrica.",
       "Aero i carrosseria subministrats, muntats i rematats com si sortís així de fàbrica."],

    /* ---------- PRICES: tier names ---------- */
    "Accents": ["Acentos", "Accents"],
    "Full Colour Change": ["Cambio de color completo", "Canvi de color complet"],
    "Signature Wrap": ["Car Wrap Signature", "Car Wrap Signature"],
    "Front Pack": ["Pack frontal", "Pack frontal"],
    "Pro": ["Pro", "Pro"],
    "Full Body": ["Carrocería completa", "Carrosseria completa"],
    "Essential": ["Esencial", "Essencial"],
    "Enhancement": ["Realce", "Realç"],
    "Two-Stage": ["Dos etapas", "Dues etapes"],
    "Showroom Reset": ["Reinicio de exposición", "Reinici d'exposició"],
    "Aero Parts": ["Piezas aero", "Peces aero"],
    "Full Kit Fitted": ["Kit completo montado", "Kit complet muntat"],
    "Stage 1 polish to revive the gloss, then one ceramic layer to seal it — real protection, entry price.":
      ["Pulido de Etapa 1 que revive el brillo y, después, una capa cerámica que lo sella — protección real, precio de entrada.",
       "Polit d'Etapa 1 que reviu la brillantor i, després, una capa ceràmica que el segella — protecció real, preu d'entrada."],
    "Stage 2 correction plus a two-layer ceramic coat and rain-repellent glass — our standard.":
      ["Corrección de Etapa 2 más un recubrimiento cerámico de dos capas y antilluvia en los cristales — nuestro estándar.",
       "Correcció d'Etapa 2 més un recobriment ceràmic de dues capes i antipluja als vidres — el nostre estàndard."],
    "Full Stage 3 correction under hex lighting, then a multi-layer ceramic stack and interior protection.":
      ["Corrección completa de Etapa 3 bajo luz hexagonal y, después, varias capas cerámicas y protección de interior.",
       "Correcció completa d'Etapa 3 sota llum hexagonal i, després, diverses capes ceràmiques i protecció d'interior."],

    /* ---------- PRICES: tier descriptions ---------- */
    "Roof, mirrors and detail pieces — change the attitude, not the whole car.":
      ["Techo, retrovisores y piezas de detalle — cambia la actitud, no el coche entero.",
       "Sostre, retrovisors i peces de detall — canvia l'actitud, no el cotxe sencer."],
    "Every exterior panel wrapped edge-to-edge in the colour you actually wanted.":
      ["Cada panel exterior vinilado de borde a borde en el color que de verdad querías.",
       "Cada panell exterior vinilat de vora a vora en el color que realment volies."],
    "Premium and colour-flip films, with the service tailored to the vehicle configuration.":
      ["Films premium y camaleón — servicio según configuración del vehículo.",
       "Films premium i camaleó — servei segons configuració del vehicle."],
    "Bumper, partial bonnet and mirrors — the high-impact essentials covered.":
      ["Paragolpes, capó parcial y retrovisores — lo esencial de alto impacto, cubierto.",
       "Para-xocs, capó parcial i retrovisors — l'essencial d'alt impacte, cobert."],
    "Full bonnet, wings, bumper, mirrors and headlights — seamless coverage, sealed with a Ceramic Coating over the film.":
      ["Capó completo, aletas, paragolpes, retrovisores y faros — cobertura sin costuras, sellada con Ceramic Coating sobre el film.",
       "Capó complet, aletes, para-xocs, retrovisors i fars — cobertura sense costures, segellada amb Ceramic Coating sobre el film."],
    "Every painted panel protected, edges tucked — invisible armour, total peace of mind.":
      ["Cada panel pintado protegido, bordes ocultos — blindaje invisible, tranquilidad total.",
       "Cada panell pintat protegit, vores amagades — blindatge invisible, tranquil·litat total."],
    "Decontamination and a single coating layer — real protection, entry price.":
      ["Descontaminación y una capa de recubrimiento — protección real, precio de entrada.",
       "Descontaminació i una capa de recobriment — protecció real, preu d'entrada."],
    "Light polish, two coating layers, plus wheels and glass — our standard.":
      ["Pulido ligero, dos capas de recubrimiento, más llantas y cristales — nuestro estándar.",
       "Polit lleuger, dues capes de recobriment, més llandes i vidres — el nostre estàndard."],
    "Full polish, multi-layer stack, wheels-off coating and interior protection.":
      ["Pulido completo, varias capas, recubrimiento con llantas desmontadas y protección de interior.",
       "Polit complet, diverses capes, recobriment amb llandes desmuntades i protecció d'interior."],
    "Single-stage polish that revives gloss and clears light wash marring.":
      ["Pulido de una etapa que revive el brillo y elimina el micro-marcado de lavado.",
       "Polit d'una etapa que reviu la brillantor i elimina el micro-marcatge de rentat."],
    "Cut and refine — the sweet spot for most daily-driven paint.":
      ["Corte y refinado — el punto justo para la mayoría de pinturas de uso diario.",
       "Tall i refinat — el punt just per a la majoria de pintures d'ús diari."],
    "Three-stage correction finished under hex lighting and gloss readings.":
      ["Corrección de tres etapas rematada bajo luz hexagonal y mediciones de brillo.",
       "Correcció de tres etapes rematada sota llum hexagonal i mesuraments de brillantor."],
    "Exterior decontamination wash plus interior vacuum and wipe-down.":
      ["Lavado de descontaminación exterior más aspirado y repaso del interior.",
       "Rentat de descontaminació exterior més aspirat i repàs de l'interior."],
    "Steam-cleaned interior, extracted carpets, decontaminated exterior, sealed paint.":
      ["Interior limpiado a vapor, alfombras extraídas, exterior descontaminado, pintura sellada.",
       "Interior netejat a vapor, catifes extretes, exterior descontaminat, pintura segellada."],
    "Everything — engine bay, trim restoration, leather conditioning, 12-month sealant.":
      ["Todo — vano motor, restauración de plásticos, acondicionado de cuero, sellante de 12 meses.",
       "Tot — compartiment del motor, restauració de plàstics, condicionat de cuir, segellant de 12 mesos."],
    "Splitters, spoilers and diffusers — supplied and fitted with OEM-level care.":
      ["Splitters, alerones y difusores — suministrados y montados con cuidado de nivel OEM.",
       "Splitters, alerons i difusors — subministrats i muntats amb cura de nivell OEM."],
    "A complete body kit installed and paint-matched to your car.":
      ["Un body kit completo instalado e igualado en color a tu coche.",
       "Un body kit complet instal·lat i igualat en color al teu cotxe."],
    "Kit, wheels, stance and arch work — a different car when it rolls out.":
      ["Kit, llantas, stance y trabajo de pasos de rueda — otro coche cuando sale.",
       "Kit, llandes, stance i treball de passos de roda — un altre cotxe quan surt."],

    /* ---------- PRICES: turnaround notes ---------- */
    "From 1 day in the studio": ["Desde 1 día en el taller", "Des d'1 dia al taller"],
    "From 3–4 days in the studio": ["Desde 3–4 días en el taller", "Des de 3–4 dies al taller"],
    "From 5–7 days in the studio": ["Desde 5–7 días en el taller", "Des de 5–7 dies al taller"],
    "From 2–3 days in the studio": ["Desde 2–3 días en el taller", "Des de 2–3 dies al taller"],
    "From 5–8 days in the studio": ["Desde 5–8 días en el taller", "Des de 5–8 dies al taller"],
    "1 day in the studio": ["1 día en el taller", "1 dia al taller"],
    "1–2 days in the studio": ["1–2 días en el taller", "1–2 dies al taller"],
    "2–3 days in the studio": ["2–3 días en el taller", "2–3 dies al taller"],
    "3–4 days in the studio": ["3–4 días en el taller", "3–4 dies al taller"],
    "Approx. 3 hours": ["Aprox. 3 horas", "Aprox. 3 hores"],
    "From 3–5 days in the studio": ["Desde 3–5 días en el taller", "Des de 3–5 dies al taller"],
    "2–4 weeks · by consultation": ["2–4 semanas · con consulta", "2–4 setmanes · amb consulta"],

    /* ---------- PRICES: comparison-row labels ---------- */
    "Films from professional brands": ["Films de marcas profesionales", "Films de marques professionals"],
    "Service per vehicle configuration": ["Servicio según configuración del vehículo", "Servei segons configuració del vehicle"],
    "Premium & colour-flip films": ["Films premium y camaleón", "Films premium i camaleó"],
    "Design consultation": ["Consulta de diseño", "Consulta de disseny"],
    "Maintenance kit": ["Kit de mantenimiento", "Kit de manteniment"],
    "Film warranty": ["Garantía del film", "Garantia del film"],
    "Headlight protection": ["Protección de faros", "Protecció de fars"],
    "Wrapped edges — no visible lines": ["Bordes cubiertos — sin líneas visibles", "Vores cobertes — sense línies visibles"],
    "Door cups & sill protection": ["Protección de manetas y faldones", "Protecció de manetes i faldons"],
    "Ceramic Coating over film": ["Ceramic Coating sobre el film", "Ceramic Coating sobre el film"],
    "Paint preparation": ["Preparación de pintura", "Preparació de pintura"],
    "Coating layers": ["Capas de recubrimiento", "Capes de recobriment"],
    "Rain-repellent glass treatment": ["Antilluvia para los cristales", "Antipluja per als vidres"],
    "Interior leather & fabric": ["Cuero y tela del interior", "Cuir i tela de l'interior"],
    "Maintenance plan": ["Plan de mantenimiento", "Pla de manteniment"],
    "Rated durability": ["Durabilidad estimada", "Durabilitat estimada"],
    "Polishing stages": ["Etapas de pulido", "Etapes de polit"],
    "Hologram-free finish": ["Acabado sin hologramas", "Acabat sense hologrames"],
    "Protective sealant": ["Sellante protector", "Segellant protector"],
    "Ceramic upgrade available": ["Mejora cerámica disponible", "Millora ceràmica disponible"],
    "Exterior decon wash": ["Lavado de descontaminación exterior", "Rentat de descontaminació exterior"],
    "Interior vacuum & wipe-down": ["Aspirado y repaso interior", "Aspirat i repàs interior"],
    "Steam clean & carpet extraction": ["Limpieza a vapor y extracción de alfombras", "Neteja a vapor i extracció de catifes"],
    "Leather cleaned & conditioned": ["Cuero limpiado y acondicionado", "Cuir netejat i condicionat"],
    "Engine bay detail": ["Detallado del vano motor", "Detallat del compartiment del motor"],
    "Trim & plastics restored": ["Plásticos restaurados", "Plàstics restaurats"],
    "Paint sealant": ["Sellante de pintura", "Segellant de pintura"],
    "Scope": ["Alcance", "Abast"],
    "Supply & professional fitting": ["Suministro y montaje profesional", "Subministrament i muntatge professional"],
    "Paint-matched finish": ["Acabado igualado en color", "Acabat igualat en color"],
    "Fitment & clearance check": ["Comprobación de encaje y holguras", "Comprovació d'encaix i folgances"],
    "Arch & clearance work": ["Trabajo de pasos de rueda y holguras", "Treball de passos de roda i folgances"],
    "Wrap / PPF integration": ["Integración con Car Wrap / PPF", "Integració amb Car Wrap / PPF"],
    "Sourcing consultation": ["Asesoramiento de compra", "Assessorament de compra"],

    /* ---------- PRICES: comparison-cell values ---------- */
    "Roof · mirrors · accents": ["Techo · retrovisores · acentos", "Sostre · retrovisors · accents"],
    "Full exterior": ["Exterior completo", "Exterior complet"],
    "Full exterior + door shuts": ["Exterior completo + marcos", "Exterior complet + marcs"],
    "Optional": ["Opcional", "Opcional"],
    "3 yr": ["3 años", "3 anys"],
    "5 yr": ["5 años", "5 anys"],
    "2 yr": ["2 años", "2 anys"],
    "Bumper + partial bonnet": ["Paragolpes + capó parcial", "Para-xocs + capó parcial"],
    "Full front end": ["Frontal completo", "Frontal complet"],
    "Every painted panel": ["Cada panel pintado", "Cada panell pintat"],
    "Decon wash": ["Lavado de descon.", "Rentat de descon."],
    "Decon + light polish": ["Descon. + pulido ligero", "Descon. + polit lleuger"],
    "Decon + full polish": ["Descon. + pulido completo", "Descon. + polit complet"],
    "Stage 1 — enhance": ["Etapa 1 — realce", "Etapa 1 — realç"],
    "Stage 2 — cut & refine": ["Etapa 2 — corte y refinado", "Etapa 2 — tall i refinat"],
    "Stage 3 — full correction": ["Etapa 3 — corrección completa", "Etapa 3 — correcció completa"],
    "6 months": ["6 meses", "6 mesos"],
    "12 months": ["12 meses", "12 mesos"],
    "Splitter · spoiler · diffuser": ["Splitter · alerón · difusor", "Splitter · aleró · difusor"],
    "Complete body kit": ["Body kit completo", "Body kit complet"],
    "Kit + wheels + stance": ["Kit + llantas + stance", "Kit + llandes + stance"],

    /* ---------- WHY SERRES: testimonial roles, services, quotes ---------- */
    "BMW M2 · Owner": ["BMW M2 · Propietario", "BMW M2 · Propietari"],
    "Golf GTI · Owner": ["Golf GTI · Propietario", "Golf GTI · Propietari"],
    "Porsche 911 · Owner": ["Porsche 911 · Propietario", "Porsche 911 · Propietari"],
    "Mercedes G-Class · Collector": ["Mercedes G-Class · Coleccionista", "Mercedes G-Class · Col·leccionista"],
    "Audi RS6 · Owner": ["Audi RS6 · Propietario", "Audi RS6 · Propietari"],
    "Range Rover · Owner": ["Range Rover · Propietario", "Range Rover · Propietari"],
    "Satin PPF": ["PPF satinado", "PPF setinat"],
    "Full Wrap": ["Car Wrap completo", "Car Wrap complet"],
    "PPF + Ceramic": ["PPF + Cerámica", "PPF + Ceràmica"],
    "Excellent service from start to finish. The treatment is genuinely exceptional — very professional, attentive to every detail and always ready to offer a personalised experience. I brought my Golf GTI in for a black wrap and the result was flawless, beyond my expectations. I'm delighted with both the finish and the whole process. Without a doubt, a place I thoroughly recommend.":
      ["Un servicio excelente de principio a fin. El trato es realmente excepcional: muy profesionales, atentos a cada detalle y siempre dispuestos a ofrecer una experiencia personalizada. Llevé mi Golf GTI para realizar un Car Wrap en negro y el resultado ha sido impecable, superando mis expectativas. Estoy muy contento tanto con el acabado como con todo el proceso en general. Sin duda, un lugar totalmente recomendable.",
       "Un servei excel·lent de principi a fi. El tracte és realment excepcional: molt professionals, atents a cada detall i sempre disposats a oferir una experiència personalitzada. Vaig portar el meu Golf GTI per fer un Car Wrap en negre i el resultat ha estat impecable, superant les meves expectatives. Estic molt content tant amb l'acabat com amb tot el procés en general. Sens dubte, un lloc totalment recomanable."],
    "Years of swirls just… gone. They walked me round the car panel by panel under the hex lights. You can see your reflection in the roof like a mirror.":
      ["Años de micro-arañazos simplemente… desaparecidos. Me enseñaron el coche panel a panel bajo la luz hexagonal. Te ves reflejado en el techo como en un espejo.",
       "Anys de micro-ratllades simplement… desapareguts. Em van ensenyar el cotxe panell a panell sota la llum hexagonal. Et veus reflectit al sostre com en un mirall."],
    "Colour change on the G-Class was flawless — every shut line and edge finished properly. This is a proper studio.":
      ["El cambio de color del clase G fue impecable — cada marco y borde rematado como toca. Esto es un taller de verdad.",
       "El canvi de color del classe G va ser impecable — cada marc i vora rematats com cal. Això és un taller de debò."],
    "Booked the full front PPF and a ceramic on top. Communication was perfect, timeline was exact, and the car came back cleaner than the showroom.":
      ["Reservé el PPF frontal completo y una cerámica encima. La comunicación fue perfecta, los plazos exactos, y el coche volvió más limpio que en el concesionario.",
       "Vaig reservar el PPF frontal complet i una ceràmica a sobre. La comunicació va ser perfecta, els terminis exactes, i el cotxe va tornar més net que al concessionari."],
    "The interior detail genuinely felt like a new car. They care about the parts nobody photographs.":
      ["El detallado de interior hizo que pareciera un coche nuevo de verdad. Se preocupan por las partes que nadie fotografía.",
       "El detallat d'interior va fer que semblés un cotxe nou de debò. Es preocupen per les parts que ningú fotografia."],

    /* ---------- VINYL / PPF: finish families (display only — data-finish
       attribute keeps its English value for CSS + filtering) ---------- */
    "All": ["Todos", "Tots"],
    "Satin": ["Satinado", "Setinat"],
    "Matte": ["Mate", "Mat"],
    "Color Flip": ["Camaleón", "Camaleó"],
    "Colour Shift": ["Camaleón", "Camaleó"],
    "Flip": ["Camaleón", "Camaleó"],
    "Gloss Metallic": ["Brillo metalizado", "Brillant metal·litzat"],
    "Satin Metallic": ["Satinado metalizado", "Setinat metal·litzat"],
    "Matte Metallic": ["Mate metalizado", "Mat metal·litzat"],
    "Metallic": ["Metalizado", "Metal·litzat"],
    "Frozen Matte": ["Frozen Matte", "Frozen Matte"],
    "Pearl": ["Perla", "Perla"],

    /* ---------- STRINGS BAKED IN SPANISH (added when the HTML source
       was converted to Spanish; EN key = original English text) ---------- */
    "PPF · Wraps · Paint Correction": ["PPF · Car Wrap · Corrección de pintura", "PPF · Car Wrap · Correcció de pintura"],
    "Detailing Studio": ["Estudio de detailing", "Estudi de detailing"],
    "SERRES Wrap Center on Google Maps": ["SERRES Wrap Center en Google Maps", "SERRES Wrap Center a Google Maps"],
    "Factory Gloss": ["Brillo de fábrica", "Brillant de fàbrica"],
    "SERRES Satin Wrap": ["Car Wrap satinado SERRES", "Car Wrap setinat SERRES"],
    "Water Sheets Flat": ["El agua queda plana", "L'aigua queda plana"],
    "Beads & Rolls Off": ["Forma gotas y resbala", "Forma gotes i llisca"],
    "yr": ["años", "anys"],
    "Swirled & Hazy": ["Micro-arañazos y turbidez", "Micro-ratllades i tèrbolesa"],
    "Corrected Gloss": ["Brillo corregido", "Brillantor corregida"],
    "Factory Rear": ["Trasera de serie", "Part posterior de sèrie"],
    "Full Aero Kit": ["Kit aero completo", "Kit aero complet"],
    "Choose a service": ["Elige un servicio", "Tria un servei"],
    "The Studio": ["El estudio", "L'estudi"],
    "Land Rover · Satin Black Wrap": ["Land Rover · Car Wrap negro satinado", "Land Rover · Car Wrap negre setinat"],
    "A Range Rover Sport taken from factory gloss to a deep satin-black vinyl wrap — every panel, mirror and pillar colour-matched, then shot under the hexagon lights so the new finish does the talking.":
      ["Un Range Rover Sport llevado del brillo de fábrica a un Car Wrap negro satinado profundo — cada panel, retrovisor y pilar igualado en color, fotografiado después bajo las luces hexagonales para que el nuevo acabado hable por sí solo.",
       "Un Range Rover Sport portat del brillant de fàbrica a un Car Wrap negre setinat profund — cada panell, retrovisor i pilar igualat en color, fotografiat després sota les llums hexagonals perquè el nou acabat parli per si sol."],
    "Satin Black": ["Negro satinado", "Negre setinat"],
    "Front three-quarter": ["Tres cuartos delantero", "Tres quarts davanter"],
    "Satin Wrap": ["Car Wrap satinado", "Car Wrap setinat"],
    "Head-on": ["De frente", "De front"],
    "Image viewer": ["Visor de imágenes", "Visor d'imatges"],
    "Close viewer": ["Cerrar visor", "Tanca el visor"],
    "Previous image": ["Imagen anterior", "Imatge anterior"],
    "Next image": ["Imagen siguiente", "Imatge següent"],
    "Satin black · Front three-quarter": ["Negro satinado · Tres cuartos delantero", "Negre setinat · Tres quarts davanter"],
    "Head-on · Satin black finish": ["De frente · Acabado negro satinado", "De front · Acabat negre setinat"],

    /* ---------- SEO META DESCRIPTIONS (baked in Spanish in the HTML;
       EN key = legacy English description shown when switching to EN) ---------- */
    "PPF, Car Wrap and detailing studio in Barcelona (Sant Cugat del Vallès): Ceramic Coating, multi-stage polishing and body kits. Get a quote on WhatsApp.":
      ["Estudio de PPF, Car Wrap y detailing en Barcelona (Sant Cugat del Vallès): Ceramic Coating, pulido por etapas y body kits. Pide presupuesto por WhatsApp.",
       "Estudi de PPF, Car Wrap i detailing a Barcelona (Sant Cugat del Vallès): Ceramic Coating, polit per etapes i body kits. Demana pressupost per WhatsApp."],
    "SERRES PPF — self-healing paint protection film that shields high-impact areas from stone chips, swirls and the road. Available clear, gloss, satin and colour-shift finishes.":
      ["Instalación de PPF autorreparable con más de 50 colores de varias marcas profesionales. Packs frontal y coche completo desde 890 €. Sant Cugat, Barcelona.",
       "Instal·lació de PPF autoreparable amb més de 50 colors de diverses marques professionals. Packs frontal i cotxe complet des de 890 €. Sant Cugat, Barcelona."],
    "SERRES Car Wrap — full and partial colour-change wraps with films from several professional brands. Matte, satin, gloss, metallic and colour-flip finishes, precision-fit to every panel.":
      ["Car Wrap: cambio de color con films 3M, Avery Dennison e Inozetek. Más de 150 colores. Coche completo desde 1.490 €. Sant Cugat del Vallès.",
       "Car Wrap: canvi de color amb films 3M, Avery Dennison i Inozetek. Més de 150 colors. Cotxe complet des de 1.490 €. Sant Cugat del Vallès."],
    "SERRES Ceramic Coating — a liquid-glass SiO₂ layer that bonds to your paint for years of hydrophobic, high-gloss, swirl-resistant protection.":
      ["Tratamiento Ceramic Coating SiO2 con hasta 5 años de protección. Preparación y pulido según pack. Desde 340 €. Sant Cugat, Barcelona.",
       "Tractament Ceramic Coating SiO2 amb fins a 5 anys de protecció. Preparació i polit segons pack. Des de 340 €. Sant Cugat, Barcelona."],
    "SERRES Paint Correction — multi-stage machine polishing that removes swirls, holograms and oxidation to restore true, mirror-clear depth to your paint.":
      ["Pulido por etapas a máquina: Etapa 1, 2 o 3 según el estado de tu pintura. Adiós a arañazos, remolinos y hologramas. Sant Cugat, Barcelona.",
       "Polit per etapes a màquina: Etapa 1, 2 o 3 segons l'estat de la teva pintura. Adéu a esgarrapades, remolins i hologrames. Sant Cugat, Barcelona."],
    "SERRES Detailing — deep interior steam-cleaning and exterior decontamination that takes your car from neglected to showroom-fresh, inside and out.":
      ["Limpieza integral: vapor, tapicería, cuero y motor. Deep Clean desde 150 €, Showroom Reset desde 490 €. Estudio premium en Sant Cugat.",
       "Neteja integral: vapor, tapisseria, cuir i motor. Deep Clean des de 150 €, Showroom Reset des de 490 €. Estudi premium a Sant Cugat."],
    "SERRES Body Kits — aggressive aero, custom rims and exhaust tips fitted to factory standards. We install all types of body kits to transform stance and presence.":
      ["Instalación y pintura de body kits, spoilers y widebody con ajuste OEM. Desde 450 €. Sant Cugat del Vallès.",
       "Instal·lació i pintura de body kits, spoilers i widebody amb ajust OEM. Des de 450 €. Sant Cugat del Vallès."],
    "PPF from €890, Car Wrap from €250, Ceramic Coating from €340 and detailing from €35, VAT included. Ask SERRES for your exact quote.":
      ["Precios de PPF desde 890 €, Car Wrap desde 250 €, Ceramic Coating desde 340 € y detailing desde 35 €, IVA incluido. Pide tu presupuesto exacto en SERRES.",
       "Preus de PPF des de 890 €, Car Wrap des de 250 €, Ceramic Coating des de 340 € i detailing des de 35 €, IVA inclòs. Demana el teu pressupost exacte a SERRES."],
    "Detailing studio in Sant Cugat del Vallès: PPF, Car Wrap and paint correction with certified materials and 98% of clients who recommend us.":
      ["Estudio de detailing en Sant Cugat del Vallès: PPF, Car Wrap y corrección de pintura con materiales certificados y un 98% de clientes que nos recomiendan.",
       "Estudi de detailing a Sant Cugat del Vallès: PPF, Car Wrap i correcció de pintura amb materials certificats i un 98% de clients que ens recomanen."],
    "SERRES projects in Barcelona: a gallery of real PPF, Car Wrap, Ceramic Coating and detailing work on Porsche, BMW, Toyota and Range Rover.":
      ["Proyectos de SERRES en Barcelona: galería de trabajos reales de PPF, Car Wrap, Ceramic Coating y detailing en Porsche, BMW, Toyota y Range Rover.",
       "Projectes de SERRES a Barcelona: galeria de treballs reals de PPF, Car Wrap, Ceramic Coating i detailing en Porsche, BMW, Toyota i Range Rover."],
    "SERRES Exclusive: complete car transformation projects in Barcelona. Correction, colour change, PPF, Ceramic Coating and interior. Only 6 a year.":
      ["Exclusivo SERRES: proyectos de transformación completa de coches en Barcelona. Corrección, cambio de color, PPF, Ceramic Coating e interior. Solo 6 al año.",
       "Exclusiu SERRES: projectes de transformació completa de cotxes a Barcelona. Correcció, canvi de color, PPF, Ceramic Coating i interior. Només 6 a l'any."],

    /* ---------- SEO package 2026-07-09: FAQ, keyword lines, blog ---------- */
    "Home": ["Inicio", "Inici"],
    "Complete transformation projects in Barcelona": ["Proyectos de transformación completa en Barcelona", "Projectes de transformació completa a Barcelona"],
    "All articles": ["Todos los artículos", "Tots els articles"],
    "How much does it cost to wrap a car": ["Cuánto cuesta vinilar un coche", "Quant costa vinilar un cotxe"],
    "Contents": ["Contenido", "Contingut"],
    "Keep reading": ["Sigue leyendo", "Continua llegint"],
    "Related articles": ["Artículos relacionados", "Articles relacionats"],
    "Detailing studio in Sant Cugat del Vallès": ["Estudio de detailing en Sant Cugat del Vallès", "Estudi de detailing a Sant Cugat del Vallès"],
    "Professional detailing in Sant Cugat": ["Detailing profesional en Sant Cugat", "Detailing professional a Sant Cugat"],
    "PPF protection for your paint": ["Protección PPF para tu pintura", "Protecció PPF per a la teva pintura"],
    "PPF, Car Wrap & Detailing in Barcelona": ["PPF, Car Wrap y Detailing en Barcelona", "PPF, Car Wrap i Detailing a Barcelona"],
    "Workshop in Barcelona": ["Taller en Barcelona", "Taller a Barcelona"],
    "PPF, Car Wrap and detailing in Barcelona": ["PPF, Car Wrap y detailing en Barcelona", "PPF, Car Wrap i detailing a Barcelona"],
    "SERRES is a PPF, Car Wrap and detailing workshop in Sant Cugat del Vallès, minutes from Barcelona. We work with films from several professional brands: PPF in more than 50 colours and 3M, Avery Dennison and Inozetek vinyls with more than 150 colours for colour changes.": ["SERRES es un taller de PPF, Car Wrap y detailing en Sant Cugat del Vallès, a pocos minutos de Barcelona. Trabajamos con films de varias marcas profesionales: PPF con más de 50 colores y vinilos 3M, Avery Dennison e Inozetek con más de 150 colores para el cambio de color.", "SERRES és un taller de PPF, Car Wrap i detailing a Sant Cugat del Vallès, a pocs minuts de Barcelona. Treballem amb films de diverses marques professionals: PPF amb més de 50 colors i vinils 3M, Avery Dennison i Inozetek amb més de 150 colors per al canvi de color."],
    "Every project is booked by appointment and inspected panel by panel under controlled hexagonal lighting; if anything falls short of our standard, it is redone before delivery. We complete the range with Ceramic Coating, multi-stage polishing, detailing and body kits, with published guide prices, VAT included.": ["Cada proyecto se trabaja con cita previa y se revisa panel a panel bajo iluminación hexagonal controlada; si algo no cumple nuestro estándar, se repite antes de la entrega. Completamos la gama con Ceramic Coating, pulido por etapas, detailing y body kits, con precios orientativos publicados e IVA incluido.", "Cada projecte es treballa amb cita prèvia i es revisa panell a panell sota il·luminació hexagonal controlada; si alguna cosa no compleix el nostre estàndard, es repeteix abans del lliurament. Completem la gamma amb Ceramic Coating, polit per etapes, detailing i body kits, amb preus orientatius publicats i IVA inclòs."],
    "How much does PPF installation cost in Barcelona?": ["¿Cuánto cuesta instalar PPF en Barcelona?", "Quant costa instal·lar PPF a Barcelona?"],
    "The front-end PPF pack starts at 890 € and the full car at 2,390 €, with a 3-year film warranty and VAT included. Message us on WhatsApp with your car's model and we'll send you an exact quote.": ["El pack frontal de PPF parte de 890 € y el coche completo de 2.390 €, con 3 años de garantía del film e IVA incluido. Escríbenos por WhatsApp con el modelo de tu coche y te pasamos un presupuesto exacto.", "El pack frontal de PPF parteix de 890 € i el cotxe complet de 2.390 €, amb 3 anys de garantia del film i IVA inclòs. Escriu-nos per WhatsApp amb el model del teu cotxe i et passem un pressupost exacte."],
    "How long does a full Car Wrap take?": ["¿Cuánto tarda un Car Wrap completo?", "Quant triga un Car Wrap complet?"],
    "A full colour change takes several days in the workshop: we remove trim, wrap panel by panel and check every edge before delivery. When you book your appointment we confirm the exact lead time for your car.": ["Un cambio de color completo requiere varios días de taller: desmontamos piezas, forramos panel a panel y revisamos cada borde antes de la entrega. Al reservar tu cita te confirmamos el plazo exacto para tu coche.", "Un canvi de color complet requereix diversos dies de taller: desmuntem peces, folrem panell a panell i revisem cada vora abans del lliurament. En reservar la teva cita et confirmem el termini exacte per al teu cotxe."],
    "Where is the SERRES workshop?": ["¿Dónde está el taller de SERRES?", "On és el taller de SERRES?"],
    "We are at Av. Can Fatjó dels Aurons, 15, 08174 Sant Cugat del Vallès (Barcelona). We work by appointment: Monday to Friday from 09:00 to 19:00 and Saturdays from 10:00 to 14:00.": ["Estamos en Av. Can Fatjó dels Aurons, 15, 08174 Sant Cugat del Vallès (Barcelona). Trabajamos con cita previa: de lunes a viernes de 09:00 a 19:00 y sábados de 10:00 a 14:00.", "Som a l'Av. Can Fatjó dels Aurons, 15, 08174 Sant Cugat del Vallès (Barcelona). Treballem amb cita prèvia: de dilluns a divendres de 09:00 a 19:00 i dissabtes de 10:00 a 14:00."],
    "PPF or ceramic": ["PPF o cerámico", "PPF o ceràmic"],
    "PPF in Barcelona — paint protection for your car": ["PPF en Barcelona — protección de pintura para tu coche", "PPF a Barcelona — protecció de pintura per al teu cotxe"],
    "Frequently asked questions": ["Preguntas frecuentes", "Preguntes freqüents"],
    "PPF, made": ["PPF, en", "PPF, en"],
    "clear.": ["claro.", "clar."],
    "What we get asked before protecting a car. If your case is different, message us on WhatsApp.": ["Lo que nos preguntan antes de proteger un coche. Si tu caso es distinto, escríbenos por WhatsApp.", "El que ens pregunten abans de protegir un cotxe. Si el teu cas és diferent, escriu-nos per WhatsApp."],
    "The front pack starts at 890 €, the full front at 1.190 € and the full body at 2.390 €, VAT included. The final price depends on the model and the condition of the paint, which is why we confirm a fixed quote after seeing the car or photos via WhatsApp.": ["El pack frontal parte de 890 €, el frontal completo de 1.190 € y la carrocería completa de 2.390 €, IVA incluido. El precio final depende del modelo y del estado de la pintura, por eso confirmamos presupuesto cerrado tras ver el coche o fotos por WhatsApp.", "El pack frontal parteix de 890 €, el frontal complet de 1.190 € i la carrosseria completa de 2.390 €, IVA inclòs. El preu final depèn del model i de l'estat de la pintura, per això confirmem pressupost tancat després de veure el cotxe o fotos per WhatsApp."],
    "How long does PPF last and what warranty does it have?": ["¿Cuánto dura el PPF y qué garantía tiene?", "Quant dura el PPF i quina garantia té?"],
    "We work with self-healing film from several professional brands with a 3-year manufacturer warranty against yellowing, cracking and delamination. With correct washing, the film keeps its clarity throughout its service life and is removed without damaging the original paint.": ["Trabajamos con film autorregenerable de varias marcas profesionales con 3 años de garantía del fabricante contra amarilleo, grietas y delaminación. Con lavados correctos, el film mantiene su transparencia durante toda su vida útil y se retira sin dañar la pintura original.", "Treballem amb film autoregenerable de diverses marques professionals amb 3 anys de garantia del fabricant contra esgrogueïment, esquerdes i delaminació. Amb rentats correctes, el film manté la seva transparència durant tota la seva vida útil i es retira sense danyar la pintura original."],
    "Does PPF really self-heal?": ["¿El PPF se autorregenera de verdad?", "El PPF s'autoregenera de veritat?"],
    "Yes. The film's top coat is self-healing: wash micro-scratches and light scuffs disappear with the heat of the sun or warm water. Gravel impacts are absorbed by the thickness of the film before they reach the paint.": ["Sí. La capa superior del film es autorregenerable: las micro-rayaduras de lavado y los roces leves desaparecen con el calor del sol o agua templada. Los impactos de gravilla quedan absorbidos por el espesor del film sin llegar a la pintura.", "Sí. La capa superior del film és autoregenerable: les micro-ratllades de rentat i els frecs lleus desapareixen amb la calor del sol o aigua tèbia. Els impactes de graveta queden absorbits pel gruix del film sense arribar a la pintura."],
    "What is the installation process like?": ["¿Cómo es el proceso de instalación?", "Com és el procés d'instal·lació?"],
    "Paint decontamination and correction, cutting the pattern specific to your model, application in a clean booth and a panel-by-panel review under controlled hexagonal lighting. The process takes place in our workshop in Sant Cugat del Vallès and, if anything falls short of our standard, it is redone before delivery.": ["Descontaminación y corrección de la pintura, corte del patrón específico de tu modelo, aplicación en cabina limpia y revisión panel a panel bajo iluminación hexagonal controlada. El proceso se realiza en nuestro taller de Sant Cugat del Vallès y, si algo no cumple nuestro estándar, se repite antes de la entrega.", "Descontaminació i correcció de la pintura, tall del patró específic del teu model, aplicació en cabina neta i revisió panell a panell sota il·luminació hexagonal controlada. El procés es realitza al nostre taller de Sant Cugat del Vallès i, si alguna cosa no compleix el nostre estàndard, es repeteix abans del lliurament."],
    "How many days does it take and how do I book?": ["¿Cuántos días tarda y cómo pido cita?", "Quants dies triga i com demano cita?"],
    "A front end is delivered in 1-2 working days; a full body, in 3-5 days. We work by appointment from Monday to Saturday: call or message us on WhatsApp at +34 649 66 33 80 and we confirm your date and quote the same day.": ["Un frontal se entrega en 1-2 días laborables; la carrocería completa, en 3-5 días. Trabajamos con cita previa de lunes a sábado: llama o escribe por WhatsApp al +34 649 66 33 80 y te confirmamos fecha y presupuesto en el mismo día.", "Un frontal es lliura en 1-2 dies laborables; la carrosseria completa, en 3-5 dies. Treballem amb cita prèvia de dilluns a dissabte: truca o escriu per WhatsApp al +34 649 66 33 80 i et confirmem data i pressupost el mateix dia."],
    "Which is better, PPF or a ceramic coating?": ["¿Qué es mejor, PPF o tratamiento cerámico?", "Què és millor, PPF o tractament ceràmic?"],
    "They are different things: PPF physically protects against stone chips and scratches; Ceramic Coating SiO₂ (from 340 €) adds gloss, hydrophobic behaviour and easier washing. The most complete combination is PPF on the impact zones and Ceramic Coating on the rest, and we can quote both together.": ["Son cosas distintas: el PPF protege físicamente contra impactos de piedras y arañazos; el Ceramic Coating SiO₂ (desde 340 €) aporta brillo, hidrofobia y facilidad de lavado. La combinación más completa es PPF en las zonas de impacto y Ceramic Coating en el resto, y podemos presupuestar ambos juntos.", "Són coses diferents: el PPF protegeix físicament contra impactes de pedres i ratllades; el Ceramic Coating SiO₂ (des de 340 €) aporta brillantor, hidrofòbia i facilitat de rentat. La combinació més completa és PPF a les zones d'impacte i Ceramic Coating a la resta, i podem pressupostar tots dos junts."],
    "You may also be interested in": ["También te puede interesar", "També et pot interessar"],
    "Car Wrap — car colour change in Barcelona": ["Car Wrap — cambio de color de coche en Barcelona", "Car Wrap — canvi de color de cotxe a Barcelona"],
    "Ceramic Coating — paint correction and ceramic sealing in Barcelona": ["Ceramic Coating — corrección y sellado cerámico en Barcelona", "Ceramic Coating — correcció i segellat ceràmic a Barcelona"],
    "Car detailing in Barcelona": ["Detailing de coche en Barcelona", "Detailing de cotxe a Barcelona"],
    "Before you book.": ["Antes de reservar.", "Abans de reservar."],
    "What people ask before a detail — prices, timings and how we work in Sant Cugat.": ["Lo que nos preguntan antes de un detailing — precios, tiempos y cómo trabajamos en Sant Cugat.", "El que ens pregunten abans d'un detailing — preus, temps i com treballem a Sant Cugat."],
    "How much does a full detail cost?": ["¿Cuánto cuesta un detailing completo?", "Quant costa un detailing complet?"],
    "We work with three fixed tiers, VAT included: Refresh from €35, Deep Clean with steam interior cleaning from €150 and Showroom Reset — the full inside-and-out reset — from €490. The exact price depends on the size of the vehicle and its condition; we confirm it before starting, with no surprises at pick-up.": ["Trabajamos con tres niveles cerrados, IVA incluido: Refresh desde 35 €, Deep Clean con limpieza interior a vapor desde 150 € y Showroom Reset — el reinicio completo por dentro y por fuera — desde 490 €. El precio exacto depende del tamaño del vehículo y su estado; lo confirmamos antes de empezar, sin sorpresas al recoger.", "Treballem amb tres nivells tancats, IVA inclòs: Refresh des de 35 €, Deep Clean amb neteja interior al vapor des de 150 € i Showroom Reset — el reinici complet per dins i per fora — des de 490 €. El preu exacte depèn de la mida del vehicle i del seu estat; el confirmem abans de començar, sense sorpreses en recollir-lo."],
    "How long does the service take?": ["¿Cuánto tiempo tarda el servicio?", "Quant de temps triga el servei?"],
    "A Refresh takes 1–2 hours and a Deep Clean with steam and upholstery extraction usually takes half a day. The Showroom Reset needs a full day, because every panel, seam and surface is finished by hand. We give you the delivery time when we confirm the appointment and we stick to it.": ["Un Refresh se resuelve en 1–2 horas y un Deep Clean con vapor y extracción de tapicería suele ocupar media jornada. El Showroom Reset requiere una jornada completa, porque cada panel, costura y superficie se trata a mano. Te damos la hora de entrega al confirmar la cita y la cumplimos.", "Un Refresh es resol en 1–2 hores i un Deep Clean amb vapor i extracció de tapisseria sol ocupar mitja jornada. El Showroom Reset requereix una jornada completa, perquè cada panell, costura i superfície es tracta a mà. Et donem l'hora de lliurament en confirmar la cita i la complim."],
    "What does the steam interior cleaning include?": ["¿Qué incluye la limpieza interior a vapor?", "Què inclou la neteja interior al vapor?"],
    "We steam-treat every panel, vent and seam of the cabin, extract carpets and upholstery, and clean and condition the leather with UV protection. Steam disinfects without harsh chemicals and removes odours at the source instead of masking them. It is included from the Deep Clean tier (from €150).": ["Tratamos a vapor cada panel, rejilla y costura del habitáculo, extraemos alfombras y tapicería y limpiamos y acondicionamos el cuero con protección UV. El vapor desinfecta sin químicos agresivos y elimina olores en origen, no los enmascara. Está incluido desde el nivel Deep Clean (desde 150 €).", "Tractem al vapor cada panell, reixeta i costura de l'habitacle, extraiem catifes i tapisseria i netegem i condicionem el cuir amb protecció UV. El vapor desinfecta sense químics agressius i elimina olors en origen, no els emmascara. Està inclòs des del nivell Deep Clean (des de 150 €)."],
    "Do you remove stains from upholstery and leather?": ["¿Elimináis manchas de tapicería y cuero?", "Elimineu taques de tapisseria i cuir?"],
    "Yes, it is a core part of the Deep Clean: fabric extraction and dedicated leather cleaning with conditioning afterwards. We remove the vast majority of everyday stains — coffee, seat marks, ground-in dirt — and we tell you honestly if an old stain has damaged the fibre and will not come out 100%.": ["Sí, es parte central del Deep Clean: extracción en tejidos y limpieza específica de cuero con acondicionado posterior. Eliminamos la gran mayoría de manchas de uso — café, marcas de asiento, suciedad incrustada — y te decimos con honestidad si alguna mancha antigua ha dañado la fibra y no saldrá al 100%.", "Sí, és part central del Deep Clean: extracció en teixits i neteja específica de cuir amb condicionament posterior. Eliminem la gran majoria de taques d'ús — cafè, marques de seient, brutícia incrustada — i et diem amb honestedat si alguna taca antiga ha danyat la fibra i no sortirà al 100%."],
    "Is the result guaranteed? How do you check it?": ["¿El resultado está garantizado? ¿Cómo lo controláis?", "El resultat està garantit? Com ho controleu?"],
    "We don't work by eye alone: we review the finish panel by panel under controlled hexagonal lighting, at our Sant Cugat del Vallès workshop. If anything falls short of our standard, it is redone before delivery. That is the reason behind our 4.9 rating and why 98% of clients recommend us.": ["No trabajamos a ojo: revisamos el acabado panel a panel bajo iluminación hexagonal controlada, en nuestro taller de Sant Cugat del Vallès. Si algo no cumple nuestro estándar, se repite antes de la entrega. Es la razón de nuestra valoración de 4,9 y de que el 98% de los clientes nos recomiende.", "No treballem a ull: revisem l'acabat panell a panell sota il·luminació hexagonal controlada, al nostre taller de Sant Cugat del Vallès. Si alguna cosa no compleix el nostre estàndard, es repeteix abans del lliurament. És la raó de la nostra valoració de 4,9 i que el 98% dels clients ens recomani."],
    "How do I book and where are you located?": ["¿Cómo reservo cita y dónde estáis?", "Com reservo cita i on sou?"],
    "We work by appointment only, Monday to Saturday, at Av. Can Fatjó dels Aurons 15, Sant Cugat del Vallès (Barcelona). Message us on WhatsApp or call +34 649 66 33 80 with your car's model and condition and we confirm a fixed price and date, usually the same day.": ["Trabajamos solo con cita previa, de lunes a sábado, en Av. Can Fatjó dels Aurons 15, Sant Cugat del Vallès (Barcelona). Escríbenos por WhatsApp o llama al +34 649 66 33 80 con el modelo y el estado del coche y te confirmamos precio cerrado y fecha, normalmente el mismo día.", "Treballem només amb cita prèvia, de dilluns a dissabte, a l'Av. Can Fatjó dels Aurons 15, Sant Cugat del Vallès (Barcelona). Escriu-nos per WhatsApp o truca al +34 649 66 33 80 amb el model i l'estat del cotxe i et confirmem preu tancat i data, normalment el mateix dia."],
    "Pair it with:": ["Combínalo con:", "Combina-ho amb:"],
    "PPF paint protection": ["Protección de pintura PPF", "Protecció de pintura PPF"],
    "Ceramic coating for cars in Barcelona": ["Tratamiento cerámico para coche en Barcelona", "Tractament ceràmic per a cotxe a Barcelona"],
    "Straight answers on price, timelines and durability of the ceramic treatment.": ["Respuestas directas sobre precio, plazos y durabilidad del tratamiento cerámico.", "Respostes directes sobre preu, terminis i durabilitat del tractament ceràmic."],
    "How much does a ceramic coating cost at SERRES?": ["¿Cuánto cuesta un tratamiento cerámico en SERRES?", "Quant costa un tractament ceràmic a SERRES?"],
    "We work with three fixed packs, VAT included: Essential from €340, Signature from €590 and Concours from €890. The final price depends on the size of the vehicle and the condition of the paint, which we assess in a free prior inspection.": ["Trabajamos con tres packs cerrados, IVA incluido: Essential desde 340 €, Signature desde 590 € y Concours desde 890 €. El precio final depende del tamaño del vehículo y del estado de la pintura, que valoramos en una inspección previa gratuita.", "Treballem amb tres packs tancats, IVA inclòs: Essential des de 340 €, Signature des de 590 € i Concours des de 890 €. El preu final depèn de la mida del vehicle i de l'estat de la pintura, que valorem en una inspecció prèvia gratuïta."],
    "What does each ceramic pack include?": ["¿Qué incluye cada pack cerámico?", "Què inclou cada pack ceràmic?"],
    "Every pack includes decontamination, machine paint correction and a SiO₂ Ceramic Coating. Essential applies a single-stage polish and one layer; Signature adds a two-stage correction, a double layer and a rain-repellent glass treatment; Concours is the full correction with additional layers and interior protection.": ["Todos los packs incluyen descontaminación, corrección de pintura a máquina y Ceramic Coating SiO₂. Essential aplica un pulido de una etapa y una capa; Signature añade corrección de dos etapas, doble capa y tratamiento antilluvia en cristales; Concours es la corrección completa con capas adicionales y protección interior.", "Tots els packs inclouen descontaminació, correcció de pintura a màquina i Ceramic Coating SiO₂. Essential aplica un polit d'una etapa i una capa; Signature afegeix correcció de dues etapes, doble capa i tractament antipluja als vidres; Concours és la correcció completa amb capes addicionals i protecció interior."],
    "How long does the treatment last on the car?": ["¿Cuánto dura el tratamiento en el coche?", "Quant dura el tractament al cotxe?"],
    "Up to 5 years of protection depending on the pack and the maintenance: 2 years on Essential, 3 on Signature and 5 on Concours. Before delivery we inspect the car panel by panel under controlled hexagonal lighting, and we give you a wash routine to preserve the hydrophobic effect.": ["Hasta 5 años de protección según el pack y el mantenimiento: 2 años en Essential, 3 en Signature y 5 en Concours. Antes de la entrega revisamos el coche panel a panel bajo iluminación hexagonal controlada, y te damos una pauta de lavado para conservar el efecto hidrófobo.", "Fins a 5 anys de protecció segons el pack i el manteniment: 2 anys a Essential, 3 a Signature i 5 a Concours. Abans del lliurament revisem el cotxe panell a panell sota il·luminació hexagonal controlada, i et donem una pauta de rentat per conservar l'efecte hidròfob."],
    "How many days does the car need in the workshop?": ["¿Cuántos días necesita el coche en el taller?", "Quants dies necessita el cotxe al taller?"],
    "Between 1 and 4 working days depending on the pack: the paint correction sets the pace and the coating needs a controlled 24-hour cure in a dust-free bay. We confirm the exact timeline when you book.": ["Entre 1 y 4 días laborables según el pack: la corrección de pintura marca el ritmo y el recubrimiento necesita un curado controlado de 24 horas en box sin polvo. Te confirmamos el plazo exacto al reservar.", "Entre 1 i 4 dies laborables segons el pack: la correcció de pintura marca el ritme i el recobriment necessita un curat controlat de 24 hores en un box sense pols. Et confirmem el termini exacte en reservar."],
    "Does the ceramic remove existing scratches?": ["¿El cerámico elimina los arañazos existentes?", "El ceràmic elimina les ratllades existents?"],
    "Micro-scratches and holograms are removed in the paint-correction stage, included in every pack. The coating then seals that corrected base; that is why we never apply ceramic over unprepared paint.": ["Los micro-arañazos y hologramas se eliminan en la fase de corrección de pintura, incluida en todos los packs. El recubrimiento después sella esa base corregida; por eso nunca aplicamos cerámica sobre pintura sin preparar.", "Les micro-ratllades i els hologrames s'eliminen a la fase de correcció de pintura, inclosa en tots els packs. Després, el recobriment segella aquesta base corregida; per això mai apliquem ceràmica sobre pintura sense preparar."],
    "How do I book an appointment?": ["¿Cómo reservo cita?", "Com reservo cita?"],
    "By prior appointment from Monday to Saturday at our workshop in Sant Cugat del Vallès (Av. Can Fatjó dels Aurons 15). Message us on WhatsApp or call +34 649 66 33 80 and we will give you a closed quote the same day.": ["Con cita previa de lunes a sábado en nuestro taller de Sant Cugat del Vallès (Av. Can Fatjó dels Aurons 15). Escríbenos por WhatsApp o llama al +34 649 66 33 80 y te damos presupuesto cerrado en el día.", "Amb cita prèvia de dilluns a dissabte al nostre taller de Sant Cugat del Vallès (Av. Can Fatjó dels Aurons 15). Escriu-nos per WhatsApp o truca al +34 649 66 33 80 i et donem pressupost tancat el mateix dia."],
    "Related services": ["Servicios relacionados", "Serveis relacionats"],
    "Paint correction & polishing": ["Pulido y corrección de pintura", "Polit i correcció de pintura"],
    "How much does PPF cost": ["Cuánto cuesta el PPF", "Quant costa el PPF"],
    "Work gallery — PPF, Car Wrap & Detailing in Barcelona": ["Galería de trabajos — PPF, Car Wrap y Detailing en Barcelona", "Galeria de treballs — PPF, Car Wrap i Detailing a Barcelona"],
    "PPF protection in Barcelona": ["Protección PPF en Barcelona", "Protecció PPF a Barcelona"],
    "Car Wrap and car vinyl wrapping": ["Car Wrap y vinilado de coches", "Car Wrap i vinilat de cotxes"],
    "Body kit fitting in Barcelona": ["Montaje de body kits en Barcelona", "Muntatge de body kits a Barcelona"],
    "Related:": ["Relacionado:", "Relacionat:"],
    "Car Wrap and colour change in Barcelona": ["Car Wrap y cambio de color en Barcelona", "Car Wrap i canvi de color a Barcelona"],
    "Before fitting": ["Antes de montar", "Abans de muntar"],
    "your body kit.": ["tu body kit.", "el teu body kit."],
    "What we get asked every week at the Sant Cugat workshop. If your question isn't here, message us on WhatsApp.": ["Lo que nos preguntan cada semana en el taller de Sant Cugat. Si tu duda no está aquí, escríbenos por WhatsApp.", "El que ens pregunten cada setmana al taller de Sant Cugat. Si el teu dubte no és aquí, escriu-nos per WhatsApp."],
    "How much does it cost to fit a body kit?": ["¿Cuánto cuesta montar un body kit?", "Quant costa muntar un body kit?"],
    "Aero add-ons —splitter, diffuser or spoiler— start at €450. A complete kit with fitting and paint starts at €1,490, and a full widebody transformation from €3,490, VAT included. Once we've seen the car and the kit, we lock in a fixed written quote before starting.": ["Los complementos aerodinámicos —splitter, difusor o spoiler— parten de 450 €. Un kit completo con ajuste y pintura empieza en 1.490 €, y una transformación integral tipo widebody desde 3.490 €, IVA incluido. Tras ver el coche y el kit, cerramos un presupuesto fijo por escrito antes de empezar.", "Els complements aerodinàmics —splitter, difusor o spoiler— parteixen de 450 €. Un kit complet amb ajust i pintura comença en 1.490 €, i una transformació integral tipus widebody des de 3.490 €, IVA inclòs. Després de veure el cotxe i el kit, tanquem un pressupost fix per escrit abans de començar."],
    "How long does the installation take?": ["¿Cuánto tarda la instalación?", "Quant triga la instal·lació?"],
    "A lip or diffuser is fitted the same day. A complete kit with prep and paint takes 3 to 5 working days, and a widebody project 1 to 3 weeks depending on the bodywork. We give you a firm delivery date when you confirm the job.": ["Un lip o difusor se monta en el mismo día. Un kit completo con preparación y pintura requiere entre 3 y 5 días laborables, y un proyecto widebody entre 1 y 3 semanas según el trabajo de carrocería. Te damos fecha de entrega concreta al confirmar el encargo.", "Un lip o difusor es munta el mateix dia. Un kit complet amb preparació i pintura requereix entre 3 i 5 dies laborables, i un projecte widebody entre 1 i 3 setmanes segons el treball de carrosseria. Et donem data d'entrega concreta en confirmar l'encàrrec."],
    "Is the fitting guaranteed?": ["¿El montaje tiene garantía?", "El muntatge té garantia?"],
    "Yes. We guarantee the mounting, the panel-gap fitment and the paint finish of the installed kit. All the work is done at our Sant Cugat del Vallès workshop, so we answer directly for every part we fit. The exact terms depend on the kit's material and are detailed in the quote.": ["Sí. Garantizamos la fijación, el ajuste de holguras y el acabado de pintura del kit instalado. Todo el trabajo se hace en nuestro taller de Sant Cugat del Vallès, por lo que respondemos directamente de cada pieza montada. Las condiciones exactas dependen del material del kit y se detallan en el presupuesto.", "Sí. Garantim la fixació, l'ajust de les folgances i l'acabat de pintura del kit instal·lat. Tota la feina es fa al nostre taller de Sant Cugat del Vallès, per la qual cosa responem directament de cada peça muntada. Les condicions exactes depenen del material del kit i es detallen al pressupost."],
    "What does the fitting process look like?": ["¿Cómo es el proceso de montaje?", "Com és el procés de muntatge?"],
    "First we do a dry test fit and correct panel gaps piece by piece until we reach OEM-level tolerances. Then we prep, prime and paint the kit to match the vehicle's colour, and secure it with structural anchors and adhesives. Before delivery we check the fit and finish panel by panel under controlled hexagon lighting; if anything falls short of our standard, it gets redone.": ["Primero hacemos una prueba de ajuste en seco y corregimos holguras pieza a pieza hasta lograr tolerancias de nivel OEM. Después preparamos, imprimamos y pintamos el kit igualando el color con el vehículo, y lo fijamos con anclajes y adhesivos estructurales. Antes de la entrega revisamos el ajuste y el acabado panel a panel bajo iluminación hexagonal controlada; si algo no cumple nuestro estándar, se repite.", "Primer fem una prova d'ajust en sec i corregim folgances peça a peça fins a aconseguir toleràncies de nivell OEM. Després preparem, emprimem i pintem el kit igualant el color amb el vehicle, i el fixem amb ancoratges i adhesius estructurals. Abans de l'entrega revisem l'ajust i l'acabat panell a panell sota il·luminació hexagonal controlada; si alguna cosa no compleix el nostre estàndard, es repeteix."],
    "Can I bring my own kit, or do you order it?": ["¿Puedo traer mi propio kit o lo pedís vosotros?", "Puc portar el meu propi kit o el demaneu vosaltres?"],
    "Both. We can work with a kit you already have or source proven manufacturers in fibreglass, ABS or polyurethane for your model. If you bring your own, we inspect it before quoting to catch warping or moulding defects.": ["Ambas opciones. Podemos trabajar con un kit que ya tengas o buscarte fabricantes contrastados en fibra, ABS o poliuretano para tu modelo. Si lo traes tú, lo inspeccionamos antes de presupuestar para detectar deformaciones o defectos de molde.", "Totes dues opcions. Podem treballar amb un kit que ja tinguis o buscar-te fabricants contrastats en fibra, ABS o poliuretà per al teu model. Si el portes tu, l'inspeccionem abans de pressupostar per detectar deformacions o defectes de motlle."],
    "How do I book, and where are you?": ["¿Cómo pido cita y dónde estáis?", "Com demano cita i on sou?"],
    "We work by appointment Monday to Saturday at Av. Can Fatjó dels Aurons 15, Sant Cugat del Vallès, 20 minutes from Barcelona. Message us on WhatsApp or call +34 649 66 33 80 with your model and the kit you have in mind, and we'll give you a quote and a date the same day.": ["Trabajamos con cita previa de lunes a sábado en Av. Can Fatjó dels Aurons 15, Sant Cugat del Vallès, a 20 minutos de Barcelona. Escríbenos por WhatsApp o llama al +34 649 66 33 80 con el modelo y el kit que tienes en mente, y te damos valoración y fecha en el día.", "Treballem amb cita prèvia de dilluns a dissabte a l'Av. Can Fatjó dels Aurons 15, Sant Cugat del Vallès, a 20 minuts de Barcelona. Escriu-nos per WhatsApp o truca al +34 649 66 33 80 amb el model i el kit que tens al cap, i et donem valoració i data el mateix dia."],
    "Guides & advice": ["Guías y consejos", "Guies i consells"],
    "Prices, comparisons and maintenance — written by the workshop team, no sales fluff.": ["Precios, comparativas y mantenimiento — escrito por el equipo del taller, sin humo comercial.", "Preus, comparatives i manteniment — escrit per l'equip del taller, sense fum comercial."],
    "PPF, Car Wrap, Ceramic Coating & Detailing prices in Barcelona": ["Precios de PPF, Car Wrap, Ceramic Coating y Detailing en Barcelona", "Preus de PPF, Car Wrap, Ceramic Coating i Detailing a Barcelona"],
    "Car Wrap & vinyl wrapping": ["Car Wrap y vinilado", "Car Wrap i vinilat"],
    "Car detailing": ["Detailing de coches", "Detailing de cotxes"],
    "Car polishing": ["Pulido de coche", "Polit de cotxe"],
    "Car polishing in Barcelona — paint correction": ["Pulido de coche en Barcelona — corrección de pintura", "Polit de cotxe a Barcelona — correcció de pintura"],
    "Before booking": ["Antes de reservar", "Abans de reservar"],
    "your correction": ["tu corrección", "la teva correcció"],
    "Straight answers on price, timing, warranty and process. If your case is different, message us on WhatsApp.": ["Respuestas directas sobre precio, plazos, garantía y proceso. Si tu caso es distinto, escríbenos por WhatsApp.", "Respostes directes sobre preu, terminis, garantia i procés. Si el teu cas és diferent, escriu-nos per WhatsApp."],
    "How much does car polishing cost in Barcelona?": ["¿Cuánto cuesta un pulido de coche en Barcelona?", "Quant costa un polit de cotxe a Barcelona?"],
    "At SERRES Wrap Center polishing with a SiO₂ Ceramic Coating starts at 340 € (Essential, VAT included). The Signature level, with multi-stage correction, costs 590 €, and the Concours, with a show-grade finish, 890 €. The exact price depends on the condition of the paint: we confirm it during the initial panel-by-panel inspection, before starting.": ["En SERRES Wrap Center el pulido con Ceramic Coating SiO₂ parte de 340 € (Essential, IVA incluido). El nivel Signature, con corrección multietapa, cuesta 590 €, y el Concours, con acabado de concurso, 890 €. El precio exacto depende del estado de la pintura: lo confirmamos en la inspección inicial, panel a panel, antes de empezar.", "A SERRES Wrap Center el polit amb Ceramic Coating SiO₂ parteix de 340 € (Essential, IVA inclòs). El nivell Signature, amb correcció multietapa, costa 590 €, i el Concours, amb acabat de concurs, 890 €. El preu exacte depèn de l'estat de la pintura: el confirmem a la inspecció inicial, panell a panell, abans de començar."],
    "How long does paint correction take?": ["¿Cuánto tiempo tarda la corrección de pintura?", "Quant de temps triga la correcció de pintura?"],
    "An Essential is completed in one or two days; a Signature or Concours multi-stage correction takes 2 to 4 days depending on the size of the car and the hardness of the clear coat. We work by appointment Monday to Saturday and give you a firm delivery date before starting.": ["Un Essential se completa en una o dos jornadas; una corrección multietapa Signature o Concours requiere de 2 a 4 días según el tamaño del coche y la dureza del barniz. Trabajamos con cita previa de lunes a sábado y te damos fecha de entrega cerrada antes de empezar.", "Un Essential es completa en una o dues jornades; una correcció multietapa Signature o Concours requereix de 2 a 4 dies segons la mida del cotxe i la duresa del vernís. Treballem amb cita prèvia de dilluns a dissabte i et donem data de lliurament tancada abans de començar."],
    "Does polishing remove all scratches?": ["¿El pulido elimina todos los arañazos?", "El polit elimina totes les ratllades?"],
    "We completely remove swirls, holograms and surface scratches that don't go through the clear coat; deeper ones are reduced until they are nearly invisible. Before polishing we assess the condition of the clear coat panel by panel so we only remove the material that's strictly necessary and never compromise it.": ["Eliminamos por completo remolinos, hologramas y arañazos superficiales que no atraviesan el barniz; los más profundos se atenúan hasta hacerlos casi invisibles. Antes de pulir evaluamos el estado del barniz panel a panel para retirar solo el material necesario y no comprometerlo.", "Eliminem del tot remolins, hologrames i ratllades superficials que no travessen el vernís; les més profundes s'atenuen fins a fer-les gairebé invisibles. Abans de polir avaluem l'estat del vernís panell a panell per retirar només el material necessari i no comprometre'l."],
    "What is the process like and how do I know the result is real?": ["¿Cómo es el proceso y cómo sé que el resultado es real?", "Com és el procés i com sé que el resultat és real?"],
    "We work in three stages: cutting to remove the defects, refining and final finishing. We review the car panel by panel under controlled hexagonal lighting and, if anything falls short of our standard, it is redone before delivery. Everything is done at our workshop in Sant Cugat del Vallès.": ["Trabajamos en tres etapas: corte para eliminar los defectos, refinado y acabado final. Revisamos el coche panel a panel bajo iluminación hexagonal controlada y, si algo no cumple nuestro estándar, se repite antes de la entrega. Todo se hace en nuestro taller de Sant Cugat del Vallès.", "Treballem en tres etapes: tall per eliminar els defectes, refinat i acabat final. Revisem el cotxe panell a panell sota il·luminació hexagonal controlada i, si alguna cosa no compleix el nostre estàndard, es repeteix abans del lliurament. Tot es fa al nostre taller de Sant Cugat del Vallès."],
    "Is the result guaranteed? How long does it last?": ["¿El resultado tiene garantía? ¿Cuánto dura?", "El resultat té garantia? Quant dura?"],
    "The SiO₂ Ceramic Coating protects the corrected paint for up to 5 years depending on the chosen pack and maintenance. If you want to shield the result against new scratches, self-healing PPF (from 890 € for the front end) includes a 3-year film warranty.": ["El Ceramic Coating SiO₂ protege la pintura corregida hasta 5 años según el pack elegido y el mantenimiento. Si quieres blindar el resultado frente a nuevos arañazos, el PPF autorregenerable (desde 890 € el frontal) incluye 3 años de garantía del film.", "El Ceramic Coating SiO₂ protegeix la pintura corregida fins a 5 anys segons el pack triat i el manteniment. Si vols blindar el resultat davant de noves ratllades, el PPF autoregenerable (des de 890 € el frontal) inclou 3 anys de garantia del film."],
    "How do I book an appointment, and do I need to leave the car all day?": ["¿Cómo reservo cita y necesito dejar el coche todo el día?", "Com reservo cita i necessito deixar el cotxe tot el dia?"],
    "Message us on WhatsApp at +34 649 66 33 80 or call us and we'll book you in Monday to Saturday. We are at Av. Can Fatjó dels Aurons 15, Sant Cugat del Vallès, 20 minutes from Barcelona. For corrections taking more than one day we can coordinate pick-up and delivery with you.": ["Escríbenos por WhatsApp al +34 649 66 33 80 o llámanos y te damos cita de lunes a sábado. Estamos en Av. Can Fatjó dels Aurons 15, Sant Cugat del Vallès, a 20 minutos de Barcelona. Para correcciones de más de un día podemos coordinar la recogida y entrega contigo.", "Escriu-nos per WhatsApp al +34 649 66 33 80 o truca'ns i et donem cita de dilluns a dissabte. Som a l'Av. Can Fatjó dels Aurons 15, Sant Cugat del Vallès, a 20 minuts de Barcelona. Per a correccions de més d'un dia podem coordinar la recollida i el lliurament amb tu."],
    "Ceramic Coating to seal the gloss": ["Ceramic Coating para sellar el brillo", "Ceramic Coating per segellar la brillantor"],
    "PPF to protect the corrected paint": ["PPF para proteger la pintura corregida", "PPF per protegir la pintura corregida"],
    "Car wrapping in Barcelona — wrap your car": ["Car Wrapping en Barcelona — vinilar tu coche", "Car wrapping a Barcelona — vinilar el teu cotxe"],
    "Pair it with": ["Combínalo con", "Combina-ho amb"],
    "Ceramic Coating treatment": ["Tratamiento Ceramic Coating", "Tractament Ceramic Coating"],
    "Before wrapping": ["Antes de vinilar", "Abans de vinilar"],
    "your car": ["tu coche", "el teu cotxe"],
    "How much does it cost to wrap a full car?": ["¿Cuánto cuesta vinilar un coche completo?", "Quant costa vinilar un cotxe complet?"],
    "A full colour change with 3M, Avery Dennison or Inozetek films starts at €1,490 VAT included; accents (roof, mirrors, pillars) from €250 and the Signature finish with extended disassembly from €1,990. The final price depends on the size of the vehicle, the film you choose and the level of disassembly. After a 20-minute inspection we give you a fixed quote.": ["El cambio de color completo con films 3M, Avery Dennison e Inozetek parte de 1.490 € IVA incluido; los acentos (techo, retrovisores, pilares) desde 250 € y el acabado Signature con desmontaje ampliado desde 1.990 €. El precio final depende del tamaño del vehículo, el film elegido y el nivel de desmontaje. Tras una inspección de 20 minutos te damos un presupuesto cerrado.", "El canvi de color complet amb films 3M, Avery Dennison i Inozetek parteix de 1.490 € IVA inclòs; els accents (sostre, retrovisors, pilars) des de 250 € i l'acabat Signature amb desmuntatge ampliat des de 1.990 €. El preu final depèn de la mida del vehicle, el film triat i el nivell de desmuntatge. Després d'una inspecció de 20 minuts et donem un pressupost tancat."],
    "How many days does a full colour change take?": ["¿Cuántos días tarda un cambio de color completo?", "Quants dies triga un canvi de color complet?"],
    "A full-body colour change takes between 5 and 7 working days: parts removal, decontamination, panel-by-panel application and edge heat-sealing. Partial jobs (roof, accents) are delivered in 1 or 2 days. We confirm the delivery date before we start.": ["Un cambio de color de carrocería completa requiere entre 5 y 7 días laborables: desmontaje de piezas, descontaminación, aplicación panel a panel y termosellado de bordes. Los trabajos parciales (techo, acentos) se entregan en 1 o 2 días. Te confirmamos la fecha de entrega antes de empezar.", "Un canvi de color de carrosseria completa requereix entre 5 i 7 dies laborables: desmuntatge de peces, descontaminació, aplicació panell a panell i termosegellat de vores. Les feines parcials (sostre, accents) es lliuren en 1 o 2 dies. Et confirmem la data de lliurament abans de començar."],
    "How long does the wrap last and what warranty does it carry?": ["¿Cuánto dura el vinilo y qué garantía tiene?", "Quant dura el vinil i quina garantia té?"],
    "The 3M, Avery Dennison and Inozetek films we install last between 5 and 7 years outdoors with normal care, and the manufacturer backs them with its official warranty. We also guarantee our installation in writing: edges, seams and no lifting. All the work is done at our own workshop in Sant Cugat del Vallès.": ["Los films 3M, Avery Dennison e Inozetek que instalamos duran entre 5 y 7 años en exterior con un mantenimiento normal, y el fabricante los respalda con su garantía oficial. Además garantizamos por escrito nuestra instalación: bordes, uniones y ausencia de levantamientos. Todo el trabajo se hace en nuestro taller propio de Sant Cugat del Vallès.", "Els films 3M, Avery Dennison i Inozetek que instal·lem duren entre 5 i 7 anys a l'exterior amb un manteniment normal, i el fabricant els avala amb la seva garantia oficial. A més, garantim per escrit la nostra instal·lació: vores, unions i absència d'aixecaments. Tota la feina es fa al nostre taller propi de Sant Cugat del Vallès."],
    "Does the vinyl damage the original paint?": ["¿El vinilo daña la pintura original?", "El vinil fa malbé la pintura original?"],
    "No. On factory paint in good condition, the vinyl protects it from UV rays, light scuffs and wear, and comes off without leaving residue. The process is fully reversible: when the film is removed, the original paint is intact and preserved.": ["No. Sobre una pintura de fábrica en buen estado, el vinilo la protege de rayos UV, roces leves y desgaste, y se retira sin dejar residuos. El proceso es totalmente reversible: al quitar el film, la pintura original queda intacta y conservada.", "No. Sobre una pintura de fàbrica en bon estat, el vinil la protegeix dels raigs UV, fregaments lleus i desgast, i es retira sense deixar residus. El procés és totalment reversible: en treure el film, la pintura original queda intacta i conservada."],
    "What does the process look like, from quote to delivery?": ["¿Cómo es el proceso, desde el presupuesto hasta la entrega?", "Com és el procés, des del pressupost fins al lliurament?"],
    "First you choose a colour and finish from more than 150 colours in our palette; then we inspect the vehicle and lock in the quote and date. In the workshop: wash and decontamination, parts removal, panel-by-panel film application and heat-sealing. At delivery we go over every edge together and explain the care routine for the first 15 days.": ["Primero eliges color y acabado entre más de 150 colores de nuestra paleta; después inspeccionamos el vehículo y cerramos presupuesto y fecha. En taller: lavado y descontaminación, desmontaje de piezas, aplicación del film panel a panel y termosellado. En la entrega revisamos juntos cada borde y te explicamos el cuidado de los primeros 15 días.", "Primer tries color i acabat entre més de 150 colors de la nostra paleta; després inspeccionem el vehicle i tanquem pressupost i data. Al taller: rentat i descontaminació, desmuntatge de peces, aplicació del film panell a panell i termosegellat. Al lliurament revisem junts cada vora i t'expliquem la cura dels primers 15 dies."],
    "We work by appointment from Monday to Saturday at Av. Can Fatjó dels Aurons 15, Sant Cugat del Vallès (Barcelona), 20 minutes from central Barcelona. Message us on WhatsApp or call +34 649 66 33 80 and we'll confirm the day and an approximate quote in the same conversation.": ["Trabajamos con cita previa de lunes a sábado en Av. Can Fatjó dels Aurons 15, Sant Cugat del Vallès (Barcelona), a 20 minutos del centro de Barcelona. Escríbenos por WhatsApp o llama al +34 649 66 33 80 y te confirmamos día y presupuesto orientativo en la misma conversación.", "Treballem amb cita prèvia de dilluns a dissabte a l'Av. Can Fatjó dels Aurons 15, Sant Cugat del Vallès (Barcelona), a 20 minuts del centre de Barcelona. Escriu-nos per WhatsApp o truca al +34 649 66 33 80 i et confirmem dia i pressupost orientatiu a la mateixa conversa."],
    "Breadcrumb": ["Migas de pan", "Ruta de navegació"],
  };

  /* ===================================================================
     INVERTED INDEX — Spanish rendition → English dictionary key.
     The HTML source is authored in Spanish, so bindings are discovered
     by looking the (trimmed) Spanish text up here; the stored binding
     key stays English so tr()/t() keep working unchanged.
     =================================================================== */
  var INV = {};
  (function () {
    for (var k in DICT) {
      if (!DICT.hasOwnProperty(k)) continue;
      var v = (DICT[k][0] || "").replace(/^\s+|\s+$/g, "");
      if (v && !INV.hasOwnProperty(v)) INV[v] = k;
    }
  })();

  /* resolve a DOM text core (EN or ES) to its English dictionary key */
  function enKeyOf(core) {
    if (DICT.hasOwnProperty(core)) return core;
    if (INV.hasOwnProperty(core)) return INV[core];
    return null;
  }

  /* ===================================================================
     ENGINE
     =================================================================== */
  function getLang() {
    var l;
    try { l = localStorage.getItem(STORE); } catch (e) {}
    return LANGS.indexOf(l) >= 0 ? l : "es";
  }
  var current = getLang();

  function tr(core) {
    if (current === "en") return core;
    var e = DICT[core];
    if (!e) return core;
    var v = current === "es" ? e[0] : e[1];
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
  var ATTRS = ["aria-label", "title"];

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

  /* explicit keyed elements: <span data-en="a reality"></span> */
  function bindKeyed(el) {
    if (!el.getAttribute || inSkip(el)) return;
    if (el.__i18n_keyed) return;
    var raw = el.getAttribute("data-en");
    if (!raw) return;
    var a = affix(raw);
    if (!DICT.hasOwnProperty(a.core)) return;
    el.__i18n_keyed = true;
    var b = { el: el, lead: a.lead, core: a.core, trail: a.trail };
    keyBindings.push(b);
    applyKeyed(b);
  }

  function applyKeyed(b) {
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
    var els = root.querySelectorAll("[aria-label],[title]");
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
