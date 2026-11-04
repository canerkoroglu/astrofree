import type { MeaningSet } from './types'

/**
 * Lecturas integradas en español.
 * Regla: nada sobre la persona se afirma como seguro; se usa "puede", "podría", "tiende a".
 */
export const es: MeaningSet = {
  planets: {
    sun: { keywords: 'identidad, voluntad, vitalidad', what: 'Puede expresar su identidad, su voluntad y su vitalidad', subject: 'Su identidad y su vitalidad', about: 'Tradicionalmente el Sol simboliza el núcleo del ser, la voluntad, la vitalidad y aquello en lo que se desea brillar.' },
    moon: { keywords: 'emociones, seguridad, hábitos', what: 'Puede vivir sus emociones, su necesidad de seguridad y sus reacciones instintivas', subject: 'Sus necesidades emocionales y su búsqueda de seguridad', about: 'La Luna simboliza las emociones, el mundo interior, los hábitos, la madre y la forma de sentirse a salvo.' },
    mercury: { keywords: 'pensamiento, comunicación, aprendizaje', what: 'Puede pensar, aprender y comunicarse', subject: 'Su mente y su forma de comunicarse', about: 'Mercurio se asocia con la mente, el habla, la escritura, el aprendizaje, el comercio y el entorno cercano.' },
    venus: { keywords: 'amor, armonía, placer, valores', what: 'Puede amar, disfrutar y relacionarse', subject: 'Su forma de amar y su búsqueda de armonía y placer', about: 'Venus se asocia con el amor, la atracción, la belleza, las relaciones, el dinero y lo que se valora.' },
    mars: { keywords: 'deseo, valor, empuje', what: 'Puede perseguir sus deseos y usar su valor y su empuje', subject: 'Su energía y su espíritu de lucha', about: 'Marte se asocia con el deseo, el impulso de actuar, la competencia, la ira y la sexualidad.' },
    jupiter: { keywords: 'crecimiento, fe, suerte', what: 'Puede buscar crecimiento, sentido y oportunidades', subject: 'Su suerte y su potencial de crecimiento', about: 'Júpiter se asocia con la expansión, el optimismo, las creencias, los estudios superiores, los viajes y la abundancia.' },
    saturn: { keywords: 'responsabilidad, límites, madurez', what: 'Puede asumir la responsabilidad, los límites y la disciplina', subject: 'Sus responsabilidades y su camino hacia la madurez', about: 'Saturno se asocia con la estructura, la disciplina, el tiempo, las pruebas, los miedos y el éxito logrado con esfuerzo.' },
    uranus: { keywords: 'libertad, innovación, cambio', what: 'Puede expresar su necesidad de libertad y de ser diferente', subject: 'Su búsqueda de libertad y su lado innovador', about: 'Urano se asocia con el cambio repentino, la libertad, la individualidad, la tecnología y la ruptura de patrones.' },
    neptune: { keywords: 'sueños, intuición, trascendencia', what: 'Puede vivir sus sueños, sus intuiciones y sus ideales', subject: 'Su imaginación y su búsqueda espiritual', about: 'Neptuno se asocia con la imaginación, la intuición, la compasión, el arte, la espiritualidad y la ilusión.' },
    pluto: { keywords: 'transformación, poder, profundidad', what: 'Puede usar su poder de transformación y sus pasiones profundas', subject: 'Su poder de transformación y sus pasiones profundas', about: 'Plutón se asocia con la crisis, el renacimiento, el poder, el control y las profundidades del inconsciente.' },
    node: { keywords: 'dirección de crecimiento, propósito', what: 'Puede seguir su dirección de crecimiento en esta vida', subject: 'Su dirección de crecimiento y su sentido de propósito', about: 'El Nodo Norte simboliza la dirección que, según la tradición, ayuda a crecer; el Nodo Sur, la zona de confort conocida.' },
    snode: { keywords: 'hábito, pasado, zona de confort', what: 'Puede apoyarse en talentos conocidos y en su zona de confort', subject: 'Sus talentos innatos y sus hábitos', about: 'El Nodo Sur simboliza los viejos patrones y los talentos ya disponibles a los que se puede recurrir con facilidad.' },
    chiron: { keywords: 'herida, sanación, sabiduría', what: 'Puede afrontar sus heridas y usar su capacidad de sanar', subject: 'Sus heridas y su don para sanar', about: 'Quirón simboliza una sensibilidad profunda y el potencial de ayudar a otros a sanar al hacer las paces con ella.' },
    lilith: { keywords: 'deseo reprimido, rebeldía', what: 'Puede expresar sus deseos reprimidos y su lado indómito', subject: 'Sus deseos reprimidos y su lado rebelde', about: 'Lilith (Luna Negra) simboliza instintos reprimidos o rechazados, pero poderosos.' },
    fortune: { keywords: 'suerte, bienestar físico y material', what: 'Puede encontrar la suerte y formas de sentirse bien', subject: 'Su suerte y sus fuentes de bienestar', about: 'La Parte de la Fortuna se calcula con el Sol, la Luna y el Ascendente; simboliza dónde el bienestar puede fluir con facilidad.' },
    asc: { keywords: 'personalidad, cuerpo, primera impresión', what: 'Puede presentarse ante el mundo', subject: 'Su apariencia y su primera impresión', about: 'El Ascendente es el signo que asciende por el este al nacer; se asocia con la personalidad, el cuerpo y la primera impresión.' },
    mc: { keywords: 'carrera, papel público, metas', what: 'Puede perseguir sus metas profesionales y su posición pública', subject: 'Su carrera y su papel público', about: 'El Medio Cielo (MC) es el punto más alto de la carta; se asocia con la carrera, la reputación y las metas vitales.' }
  },
  signs: [
    { keywords: 'audaz, emprendedor, impaciente', how: 'con valentía, de forma directa y con iniciativa; dar el primer paso puede resultarle fácil', about: 'Aries es el signo cardinal de fuego: se asocia con el inicio, el valor y la competencia.' },
    { keywords: 'estable, paciente, sensual', how: 'con calma, paciencia y de forma duradera; puede buscar seguridad y resultados tangibles', about: 'Tauro es el signo fijo de tierra: se asocia con la estabilidad, los sentidos y los recursos.' },
    { keywords: 'curioso, ágil, comunicativo', how: 'con curiosidad, agilidad y mucha conversación; la variedad y el intercambio de ideas pueden nutrirle', about: 'Géminis es el signo mutable de aire: se asocia con la curiosidad, la comunicación y la versatilidad.' },
    { keywords: 'emotivo, protector, intuitivo', how: 'de forma emotiva, protectora e intuitiva; la pertenencia y la cercanía pueden importarle mucho', about: 'Cáncer es el signo cardinal de agua: se asocia con el hogar, la familia, el sentimiento y el cuidado.' },
    { keywords: 'orgulloso, creativo, generoso', how: 'con calidez, creatividad y estilo; puede desear ser visto y apreciado', about: 'Leo es el signo fijo de fuego: se asocia con la creatividad, el corazón, el juego y el escenario.' },
    { keywords: 'preciso, analítico, servicial', how: 'con cuidado, análisis y atención al detalle; la utilidad y el orden pueden darle tranquilidad', about: 'Virgo es el signo mutable de tierra: se asocia con el análisis, el servicio, la salud y la habilidad.' },
    { keywords: 'armonioso, diplomático, estético', how: 'con elegancia, diplomacia y equilibrio; puede buscar la justicia y la cooperación', about: 'Libra es el signo cardinal de aire: se asocia con las relaciones, el equilibrio, la belleza y la justicia.' },
    { keywords: 'intenso, apasionado, profundo', how: 'con intensidad, pasión y profundidad; lo superficial puede no satisfacerle', about: 'Escorpio es el signo fijo de agua: se asocia con la pasión, la transformación, los secretos y los recursos compartidos.' },
    { keywords: 'optimista, libre, filosófico', how: 'con optimismo, entusiasmo y libertad; puede buscar sentido y horizontes más amplios', about: 'Sagitario es el signo mutable de fuego: se asocia con las creencias, la filosofía, los viajes y el aprendizaje.' },
    { keywords: 'disciplinado, ambicioso, serio', how: 'con seriedad, disciplina y una meta clara; con el tiempo puede construir algo sólido', about: 'Capricornio es el signo cardinal de tierra: se asocia con las metas, la responsabilidad, la estructura y el estatus.' },
    { keywords: 'independiente, original, idealista', how: 'de forma original, independiente e innovadora; la comunidad y las ideas de futuro pueden entusiasmarle', about: 'Acuario es el signo fijo de aire: se asocia con la libertad, la comunidad, la innovación y los ideales.' },
    { keywords: 'sensible, soñador, compasivo', how: 'con sensibilidad, intuición y compasión; su imaginación puede ser fuerte y los límites pueden difuminarse a veces', about: 'Piscis es el signo mutable de agua: se asocia con la intuición, la compasión, la imaginación y la entrega.' }
  ],
  houses: [
    { keywords: 'yo, cuerpo, comienzos', where: 'pueden manifestarse sobre todo en su personalidad, su cuerpo y su forma de afrontar la vida', about: 'Casa 1: el yo, la apariencia, el cuerpo y la primera impresión.' },
    { keywords: 'dinero, posesiones, autoestima', where: 'pueden manifestarse sobre todo en el dinero, las posesiones y la autoestima', about: 'Casa 2: ingresos, posesiones, talentos y autoestima.' },
    { keywords: 'comunicación, hermanos, entorno cercano', where: 'pueden manifestarse sobre todo en la comunicación, el aprendizaje, los hermanos y su entorno cercano', about: 'Casa 3: comunicación, hermanos, vecinos, viajes cortos y educación básica.' },
    { keywords: 'hogar, familia, raíces', where: 'pueden manifestarse sobre todo en el hogar, la familia, las raíces y su mundo interior', about: 'Casa 4: hogar, familia, raíces y un progenitor.' },
    { keywords: 'creatividad, romance, hijos', where: 'pueden manifestarse sobre todo en la creatividad, el romance, la diversión y los hijos', about: 'Casa 5: creatividad, amores, juego, aficiones e hijos.' },
    { keywords: 'trabajo, salud, rutina diaria', where: 'pueden manifestarse sobre todo en el trabajo diario, las rutinas y los hábitos de salud', about: 'Casa 6: trabajo diario, servicio, salud, rutinas y mascotas.' },
    { keywords: 'pareja, matrimonio, rivales declarados', where: 'pueden manifestarse sobre todo en el matrimonio, las asociaciones y las relaciones de tú a tú', about: 'Casa 7: matrimonio, asociaciones, contratos y rivales declarados.' },
    { keywords: 'transformación, recursos compartidos, crisis', where: 'pueden manifestarse sobre todo en la transformación, la intimidad y los recursos compartidos', about: 'Casa 8: dinero compartido, herencias, deudas, intimidad, crisis y transformación.' },
    { keywords: 'creencias, viajes, estudios superiores', where: 'pueden manifestarse sobre todo en los estudios superiores, los viajes, las creencias y su filosofía de vida', about: 'Casa 9: estudios superiores, viajes largos, creencias, leyes y publicaciones.' },
    { keywords: 'carrera, estatus, metas', where: 'pueden manifestarse sobre todo en su carrera, su posición pública y sus metas', about: 'Casa 10: carrera, reputación, papel público y autoridad.' },
    { keywords: 'amigos, comunidad, esperanzas', where: 'pueden manifestarse sobre todo en las amistades, los grupos y las esperanzas de futuro', about: 'Casa 11: amigos, grupos, redes, esperanzas y deseos.' },
    { keywords: 'inconsciente, retiro, lo oculto', where: 'pueden manifestarse sobre todo en su mundo interior, el inconsciente y entre bastidores', about: 'Casa 12: el inconsciente, el retiro, los asuntos ocultos y la búsqueda espiritual.' }
  ],
  aspects: {
    conjunction: 'Los dos principios pueden fundirse y trabajar juntos; el efecto puede ser fuerte y sentirse fácil o exigente según los planetas.',
    opposition: 'Los dos principios pueden tirar en direcciones opuestas; puede surgir una necesidad de equilibrio, a menudo vivida a través de las relaciones.',
    trine: 'Los dos principios pueden fluir con facilidad y naturalidad; puede sentirse como un talento innato o una facilidad.',
    square: 'Los dos principios pueden chocar entre sí; esto puede crear tensión y fricción, pero también impulsar la acción y el crecimiento.',
    sextile: 'Los dos principios pueden apoyarse mutuamente; pueden abrirse oportunidades con algo de esfuerzo.',
    quincunx: 'Los dos principios pueden tener poco en común; puede hacer falta un ajuste continuo.',
    semisextile: 'Un vínculo ligero; puede haber pequeños ajustes y oportunidades discretas entre los dos principios.',
    semisquare: 'Una tensión leve; puede traer inquietud interior y pequeñas fricciones.',
    sesquiquadrate: 'Una tensión leve pero persistente; puede traer tensiones inesperadas de vez en cuando.',
    quintile: 'Un vínculo creativo; puede señalar un talento singular.',
    biquintile: 'Un vínculo creativo; puede señalar un talento original que surge con la madurez.'
  },
  sunSign: [
    'Un Sol en Aries puede señalar un espíritu pionero y valiente. Iniciar cosas, competir y abrir su propio camino puede darle energía; equilibrar la impaciencia puede ser un área de crecimiento.',
    'Un Sol en Tauro puede señalar una naturaleza tranquila, firme y fiable. Puede desear construir cosas tangibles y duraderas y disfrutar de la vida; la resistencia al cambio puede ser un reto.',
    'Un Sol en Géminis puede señalar una naturaleza curiosa y versátil. Aprender, conversar y conectar ideas puede mantenerle vivo; la dispersión puede ser algo a vigilar.',
    'Un Sol en Cáncer puede señalar una naturaleza emotiva, protectora y leal. La familia, el hogar y los vínculos cercanos pueden estar en el centro de su identidad; la vulnerabilidad puede resultar difícil a veces.',
    'Un Sol en Leo puede señalar una naturaleza cálida, creativa y generosa. Puede desear expresar lo que sale del corazón y ser apreciado; equilibrar la necesidad de aprobación puede ser importante.',
    'Un Sol en Virgo puede señalar una naturaleza cuidadosa, trabajadora y servicial. Ver los detalles y ser útil puede darle sentido; la autocrítica excesiva y la preocupación pueden ser áreas de crecimiento.',
    'Un Sol en Libra puede señalar una naturaleza elegante, justa y que busca la armonía. Las relaciones, la cooperación y la belleza pueden ser centrales; la dificultad para decidir puede pedir atención.',
    'Un Sol en Escorpio puede señalar una naturaleza intensa, apasionada y profunda. Llegar a la verdad y salir fortalecido de las crisis puede resultarle natural; la necesidad de control puede ser un reto.',
    'Un Sol en Sagitario puede señalar una naturaleza optimista, libre y aventurera. Buscar sentido, viajar y aprender puede darle vida; equilibrar los excesos puede ser importante.',
    'Un Sol en Capricornio puede señalar una naturaleza seria, ambiciosa y responsable. Fijar metas a largo plazo y avanzar paso a paso puede ser una fortaleza; la rigidez y el exceso de trabajo pueden ser áreas de crecimiento.',
    'Un Sol en Acuario puede señalar una naturaleza independiente, original y con visión de futuro. Ser diferente y generar ideas nuevas puede definirle; la distancia emocional puede pedir atención.',
    'Un Sol en Piscis puede señalar una naturaleza sensible, intuitiva y compasiva. La imaginación, el arte y ayudar a otros pueden nutrirle; poner límites puede resultar difícil a veces.'
  ],
  moonSign: [
    'Una Luna en Aries puede señalar emociones vividas de forma rápida y directa. La ira puede encenderse y apagarse deprisa; pasar a la acción puede traerle alivio emocional.',
    'Una Luna en Tauro puede señalar calma y estabilidad emocional. La seguridad, la comodidad y la cercanía física pueden tranquilizarle; los cambios repentinos pueden inquietarle.',
    'Una Luna en Géminis puede señalar que procesa las emociones hablando y pensando. La conversación y la variedad pueden sentarle bien; puede haber tendencia a analizar los sentimientos desde lejos.',
    'Una Luna en Cáncer (en su propio signo) puede señalar una gran sensibilidad emocional. El hogar y el cuidado pueden ser necesidades básicas; el estado de ánimo puede cambiar con facilidad.',
    'Una Luna en Leo puede señalar una necesidad de amor y atención. Ser apreciado y la expresión creativa pueden hacerle feliz; ser ignorado puede doler.',
    'Una Luna en Virgo puede señalar que equilibra las emociones con orden y trabajo útil. Poner las cosas en su sitio puede calmarle; puede haber tendencia a preocuparse o autocriticarse.',
    'Una Luna en Libra puede señalar una búsqueda de armonía y paz. Las relaciones equilibradas y la amabilidad pueden sentarle bien; puede guardarse sus sentimientos para evitar conflictos.',
    'Una Luna en Escorpio puede señalar emociones intensas y profundas. La confianza y la lealtad pueden ser vitales; las heridas pueden acompañarle mucho tiempo.',
    'Una Luna en Sagitario puede señalar optimismo emocional y necesidad de libertad. El movimiento y la aventura pueden relajarle; sentirse limitado puede agobiarle.',
    'Una Luna en Capricornio puede señalar emociones controladas y mesuradas. Asumir responsabilidades puede darle seguridad; mostrar los sentimientos puede costarle.',
    'Una Luna en Acuario puede señalar un enfoque distante y racional de las emociones. La amistad y poder ser uno mismo pueden importar mucho; las demandas emocionales intensas pueden alejarle.',
    'Una Luna en Piscis puede señalar una fuerte empatía e intuición. Puede percibir con facilidad lo que sienten los demás; la soledad, la música y el arte pueden sentarle bien.'
  ],
  ascSign: [
    'Un Ascendente en Aries puede dar una primera impresión enérgica, directa y decidida. Puede afrontar la vida con valor y rapidez.',
    'Un Ascendente en Tauro puede dar una primera impresión tranquila y serena. Puede afrontar la vida con prudencia y constancia, sin prisas.',
    'Un Ascendente en Géminis puede dar una primera impresión viva, habladora y curiosa. Puede afrontar la vida de forma mental y adaptarse con rapidez.',
    'Un Ascendente en Cáncer puede dar una primera impresión cálida, protectora y sensible. Puede afrontar la vida desde el sentimiento y abrirse cuando confía.',
    'Un Ascendente en Leo puede dar una primera impresión brillante, segura y carismática. Puede afrontar la vida con creatividad y hacerse notar con facilidad.',
    'Un Ascendente en Virgo puede dar una primera impresión ordenada, mesurada y atenta. Puede afrontar la vida de forma analítica y práctica.',
    'Un Ascendente en Libra puede dar una primera impresión elegante, cortés y agradable. Puede afrontar la vida a través de las relaciones y el equilibrio.',
    'Un Ascendente en Escorpio puede dar una primera impresión intensa, misteriosa e impactante. Puede afrontar la vida con profundidad y cautela.',
    'Un Ascendente en Sagitario puede dar una primera impresión alegre, franca y aventurera. Puede afrontar la vida con optimismo y curiosidad.',
    'Un Ascendente en Capricornio puede dar una primera impresión seria, madura y fiable. Puede afrontar la vida desde la responsabilidad y las metas.',
    'Un Ascendente en Acuario puede dar una primera impresión original, amistosa pero algo distante. Puede afrontar la vida de forma independiente e innovadora.',
    'Un Ascendente en Piscis puede dar una primera impresión suave, soñadora y compasiva. Puede afrontar la vida con intuición y captar el ambiente que le rodea.'
  ],
  elements: {
    fire: ['El énfasis en fuego puede señalar una naturaleza entusiasta, ávida y orientada a la acción.', 'Poco fuego: cultivar de forma consciente la motivación y la confianza puede ayudar.'],
    earth: ['El énfasis en tierra puede señalar una naturaleza práctica, paciente y orientada a resultados.', 'Poca tierra: dedicar tiempo a la rutina, al cuerpo y a los asuntos prácticos puede ayudar.'],
    air: ['El énfasis en aire puede señalar una naturaleza mental, sociable y comunicativa.', 'Poco aire: poner los sentimientos en palabras y tomar distancia para reflexionar puede costar más.'],
    water: ['El énfasis en agua puede señalar una naturaleza emotiva, intuitiva y empática.', 'Poca agua: reservar tiempo para notar y expresar los sentimientos puede ayudar.']
  },
  retro: 'Retrógrado: los temas de este planeta pueden vivirse de forma más interior, reflexiva y personal.',
  glossary: [
    ['Planeta', 'Los planetas describen el “qué”: principios básicos como los sentimientos, la voluntad, el amor y el empuje.'],
    ['Signo', 'El signo describe el “cómo”: el estilo con que puede expresarse la energía de un planeta.'],
    ['Casa', 'La casa describe el “dónde”: el área de la vida (trabajo, familia, relaciones…) donde esa energía puede destacar.'],
    ['Aspecto', 'La distancia angular entre dos planetas; describe su relación (armonía, tensión, fusión).'],
    ['Orbe', 'Cuánto se aleja un aspecto del valor exacto; cuanto menor es el orbe, más fuerte se considera el aspecto.'],
    ['Ascendente', 'El signo que asciende por el este al nacer. Necesita una hora de nacimiento exacta; léalo con cuidado si la hora es dudosa.'],
    ['Tránsito', 'Cómo se relacionan las posiciones actuales (o elegidas) de los planetas con la carta natal.'],
    ['Retrógrado', 'Cuando un planeta parece moverse hacia atrás visto desde la Tierra; tradicionalmente, un tiempo de revisión.']
  ],
  disclaimer:
    'Estos textos describen tendencias generales de la tradición astrológica. Son para la exploración personal y el entretenimiento, no certezas ni predicciones, y no sustituyen el consejo médico, legal, psicológico o financiero.'
}
