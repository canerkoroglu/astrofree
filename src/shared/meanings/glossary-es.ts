import type { GlossaryGroup } from './glossary'

/** Términos astrológicos que usa la aplicación. Las definiciones describen la tradición, nunca veredictos sobre una persona. */
export const glossaryEs: GlossaryGroup[] = [
  {
    title: 'Conceptos básicos',
    terms: [
      ['Carta natal', 'Un mapa bidimensional del cielo en el momento y el lugar del nacimiento: los signos y casas de los planetas y los aspectos entre ellos.'],
      ['Planeta', 'Cuerpos que representan principios básicos; en astrología el Sol y la Luna también se llaman planetas. El planeta describe el “qué”.'],
      ['Signo', 'Una de las doce secciones de 30° de la eclíptica (el camino anual del Sol). El signo describe “cómo” puede expresarse la energía de un planeta.'],
      ['Casa', 'La carta dividida en doce secciones según la rotación diaria de la Tierra. Cada casa se asocia con un área de la vida (trabajo, familia, relaciones…): el “dónde”.'],
      ['Aspecto', 'La distancia angular entre dos planetas o puntos (p. ej. una cuadratura de 90°, un trígono de 120°). Los aspectos describen cómo pueden trabajar juntos dos principios.'],
      ['Orbe', 'Cuánto se aleja un aspecto del valor exacto. Una distancia de 87° es una cuadratura con 3° de orbe. Cuanto menor el orbe, más fuerte se considera el aspecto.'],
      ['Aplicativo / separativo', 'Un aspecto es aplicativo mientras el planeta más rápido se acerca al valor exacto y separativo cuando ya lo ha pasado. Tradicionalmente los aplicativos se consideran más fuertes.'],
      ['Retrógrado', 'Cuando un planeta parece moverse hacia atrás visto desde la Tierra. Es un efecto de perspectiva; tradicionalmente un tiempo de revisión.'],
      ['Estación', 'El momento en que un planeta se vuelve retrógrado o directo; parece casi inmóvil.'],
      ['Eclíptica', 'El camino aparente del Sol por el cielo a lo largo del año. Los signos y las longitudes planetarias se miden sobre ella.'],
      ['Declinación', 'Cuánto se aleja un cuerpo al norte o al sur del ecuador celeste. Los planetas con la misma declinación se llaman “paralelos”.'],
      ['Elemento', 'Los signos en cuatro grupos: Fuego (Aries, Leo, Sagitario), Tierra (Tauro, Virgo, Capricornio), Aire (Géminis, Libra, Acuario), Agua (Cáncer, Escorpio, Piscis).'],
      ['Modalidad (cardinal, fija, mutable)', 'Los signos en tres grupos: los cardinales se asocian con iniciar, los fijos con sostener y los mutables con adaptarse.'],
      ['Regente de la carta', 'El planeta que rige el signo Ascendente; tradicionalmente lleva el tema general de la carta.']
    ]
  },
  {
    title: 'Ángulos y casas',
    terms: [
      ['Ascendente (ASC)', 'El grado que asciende por el horizonte este al nacer; el inicio de la casa 1. Se asocia con la personalidad, el cuerpo y la primera impresión. Necesita una hora de nacimiento exacta.'],
      ['Descendente (DSC)', 'El punto opuesto al Ascendente, el horizonte oeste; el inicio de la casa 7. Se asocia con las relaciones de tú a tú.'],
      ['Medio Cielo (MC)', 'Donde la eclíptica cruza el meridiano, el punto más alto; en la mayoría de los sistemas, el inicio de la casa 10. Se asocia con la carrera y el papel público.'],
      ['Fondo del Cielo (IC)', 'El punto opuesto al MC; en la mayoría de los sistemas, el inicio de la casa 4. Se asocia con las raíces, la familia y el hogar.'],
      ['Angulares, sucedentes, cadentes', 'Las casas angulares (1, 4, 7, 10) se consideran las más fuertes, las sucedentes (2, 5, 8, 11) intermedias y las cadentes (3, 6, 9, 12) más débiles.'],
      ['Sistema de casas', 'El método para dividir las casas. Placidus, Koch, Alcabitius, Regiomontanus y Campanus dividen el tiempo o el espacio; Iguales y Signos enteros usan secciones iguales de 30°.'],
      ['Casas de signos enteros', 'Todo el signo Ascendente es la casa 1, el siguiente la casa 2, y así sucesivamente; el principal sistema de casas de la astrología helenística.'],
      ['Problema del círculo polar', 'En latitudes muy altas sistemas como Placidus y Koch no están definidos; AstroFree usa entonces casas de Porphyry y lo indica.']
    ]
  },
  {
    title: 'Aspectos',
    terms: [
      ['Conjunción (0°)', 'Dos planetas en el mismo grado o muy cerca. Los principios se funden; puede sentirse fácil o exigente según los planetas.'],
      ['Oposición (180°)', 'Dos planetas frente a frente. Se asocia con una necesidad de equilibrio y conciencia, a menudo vivida a través de las relaciones.'],
      ['Trígono (120°)', 'Un aspecto armonioso entre signos del mismo elemento; se asocia con la fluidez y la facilidad.'],
      ['Cuadratura (90°)', 'Un aspecto exigente pero motivador; se asocia con la tensión, el esfuerzo y el crecimiento.'],
      ['Sextil (60°)', 'Un aspecto de apoyo; se asocia con oportunidades que pueden abrirse con algo de esfuerzo.'],
      ['Quincuncio (150°)', 'Un aspecto entre signos con poco en común; se asocia con el ajuste.'],
      ['Aspectos menores', 'Semisextil (30°), semicuadratura (45°), sesquicuadratura (135°), quintil (72°), biquintil (144°). Se consideran más suaves; en la rueda se dibujan discontinuos.'],
      ['Aspecto mayor / menor', 'Conjunción, oposición, trígono, cuadratura y sextil son los aspectos mayores (ptolemaicos); los demás son menores.']
    ]
  },
  {
    title: 'Puntos y cuerpos menores',
    terms: [
      ['Nodos lunares (Norte / Sur)', 'Los dos puntos donde la órbita de la Luna cruza la eclíptica; los eclipses ocurren cerca de ellos. El Nodo Norte se asocia con el crecimiento, el Sur con los patrones conocidos.'],
      ['Nodo medio / verdadero', 'El nodo medio es un punto calculado de movimiento uniforme; el verdadero sigue la órbita real de la Luna y oscila. Se elige en Ajustes.'],
      ['Quirón', 'Un pequeño cuerpo que orbita entre Saturno y Urano; se asocia con la herida y la sanación.'],
      ['Lilith (Luna Negra)', 'El punto más lejano (apogeo) de la órbita lunar. Se asocia con los instintos reprimidos y el lado indómito; existen versiones media y osculante.'],
      ['Parte de la Fortuna', 'Ascendente + Luna − Sol (de noche Ascendente + Sol − Luna); se asocia con el bienestar físico y material.'],
      ['Vértex', 'Donde el primer vertical cruza la eclíptica, cerca del horizonte oeste; se asocia con encuentros “del destino”.'],
      ['Asteroides (Ceres, Palas, Juno, Vesta)', 'Cuerpos grandes del cinturón principal de asteroides; se asocian respectivamente con el cuidado, la sabiduría, el compromiso y la devoción.'],
      ['Estrellas fijas', 'Estrellas brillantes que apenas se mueven en comparación con los planetas (Régulo, Algol, Espiga…). Se consideran las conjunciones a menos de 1° de un planeta o ángulo.']
    ]
  },
  {
    title: 'Predicción y comparación',
    terms: [
      ['Tránsito', 'Los aspectos que forman las posiciones actuales (o elegidas) de los planetas con los puntos de la carta natal.'],
      ['Progresión secundaria', 'Cada día después del nacimiento equivale a un año de vida (“un día por un año”). AstroFree usa el método Naibod para el MC.'],
      ['Arco solar', 'Todos los puntos de la carta avanzan el arco recorrido por el Sol progresado; aproximadamente 1° por año.'],
      ['Sinastría', 'Dos cartas natales superpuestas para estudiar los aspectos entre ellas; se usa para explorar los temas de una relación.'],
      ['Carta compuesta', 'Una carta formada por los puntos medios de los planetas de dos cartas; se dice que representa la relación en sí.'],
      ['Carta Davison', 'Una carta real trazada para el punto medio en tiempo y lugar de dos nacimientos; otro tipo de carta de relación.'],
      ['Revolución solar', 'Una carta para el momento en que el Sol vuelve cada año a su grado natal; se usa para los temas de ese año.'],
      ['Revolución lunar', 'Una carta para el momento en que la Luna vuelve cada mes a su grado natal; se usa para los temas de ese mes.'],
      ['Carta armónica', 'Todas las posiciones multiplicadas por un número (H2–H16); destaca determinadas familias de aspectos.'],
      ['Punto medio', 'El grado a mitad de camino entre dos planetas. En la tradición de Ebertin, un punto que toca un punto medio (C = A/B) se lee como un tema que combina ambos.'],
      ['Astrocartografía', 'Líneas en el mapa del mundo que muestran dónde cada planeta ascendía, se ponía, culminaba o estaba en el IC al nacer.'],
      ['Carta trasladada', 'El mismo momento de nacimiento trazado para otra ciudad; los planetas se mantienen, cambian las casas y los ángulos.'],
      ['Efemérides gráficas', 'Un gráfico del movimiento de los planetas en tránsito a lo largo del tiempo, junto con los puntos natales.'],
      ['Astrología electiva', 'La búsqueda de intervalos de tiempo que cumplen condiciones elegidas (estado de la Luna, retrogradaciones, aspectos) para emprender algo.']
    ]
  },
  {
    title: 'La Luna y el tiempo',
    terms: [
      ['Fases lunares', 'Ocho fases según el ángulo Sol–Luna: Nueva, Creciente, Cuarto creciente, Gibosa, Llena, Diseminante, Cuarto menguante, Balsámica.'],
      ['Luna vacía de curso', 'El tiempo desde el último aspecto mayor de la Luna en un signo hasta que sale de él; tradicionalmente no se considera propicio para empezar cosas.'],
      ['Mansiones lunares (manazil)', 'El recorrido de unos 28 días de la Luna dividido en 28 partes; se usa en la astrología electiva árabe y medieval.'],
      ['Eclipse', 'Un eclipse solar ocurre en Luna nueva y uno lunar en Luna llena, cuando la Luna está cerca de los nodos.'],
      ['Día y hora planetarios', 'Cada día de la semana y cada “hora” desde la salida del sol se asignan a un planeta en orden caldeo; las horas diurnas y nocturnas tienen distinta duración.'],
      ['Rectificación', 'Corregir una hora de nacimiento dudosa a partir de acontecimientos conocidos de la vida.'],
      ['Clasificación Rodden', 'Una nota de fiabilidad de los datos de nacimiento: AA (registro), A (memoria), B (biografía), C (vaga), DD (contradictoria), X (hora desconocida).'],
      ['Hora media local (LMT)', 'La hora solar según la longitud del lugar, usada antes de las zonas horarias estándar.'],
      ['Calendario juliano', 'El calendario vigente antes de 1582; AstroFree lo usa para esas fechas.']
    ]
  },
  {
    title: 'Astrología tradicional',
    terms: [
      ['Dignidad esencial', 'La fuerza de un planeta en su signo: domicilio, exaltación, triplicidad, término y faz son fortalezas; exilio y caída son debilidades.'],
      ['Domicilio (regencia)', 'El planeta “dueño” de un signo (p. ej. Marte rige Aries). El sistema moderno también usa Urano, Neptuno y Plutón como regentes.'],
      ['Exaltación y caída', 'Signos donde un planeta se considera especialmente fuerte (exaltación) o débil (caída); la caída es el signo opuesto a la exaltación.'],
      ['Exilio (detrimento)', 'Un planeta en el signo opuesto a uno que rige; tradicionalmente se considera una dificultad.'],
      ['Triplicidad', 'Regentes diurno, nocturno y participante de cada elemento (sistema de Doroteo).'],
      ['Términos (límites)', 'Cada signo dividido en cinco partes desiguales, cada una asignada a un planeta (términos egipcios).'],
      ['Faces (decanatos)', 'Tres partes de 10° de cada signo, asignadas a los planetas en orden caldeo.'],
      ['Almuten', 'El planeta con más puntos de dignidad esencial en un grado, puntuado como lo hacía Lilly.'],
      ['Secta', 'Si la carta es diurna (Sol sobre el horizonte) o nocturna; determina el “equipo” de los planetas.'],
      ['Profección', 'El Ascendente avanza un signo por año; el regente del signo de ese año es el “señor del año”.'],
      ['Firdaria', 'Un método persa de sincronización que divide la vida en periodos regidos por los planetas.'],
      ['Partes herméticas', 'Las partes de la Fortuna, el Espíritu, Eros, la Necesidad, el Valor, la Victoria y Némesis, calculadas con el Sol, la Luna y los planetas.'],
      ['Orden caldeo', 'Los planetas según su velocidad aparente: Saturno, Júpiter, Marte, Sol, Venus, Mercurio, Luna.']
    ]
  },
  {
    title: 'Configuraciones de aspectos',
    terms: [
      ['Stellium', 'Tres o más planetas en un mismo signo o casa; puede señalar que esa área ocupa el primer plano.'],
      ['Gran Trígono', 'Tres planetas unidos por trígonos, normalmente del mismo elemento.'],
      ['Cuadratura en T', 'Dos planetas en oposición y un tercero en cuadratura con ambos; una configuración de tensión e impulso.'],
      ['Gran Cruz', 'Cuatro planetas unidos por dos oposiciones y cuatro cuadraturas.'],
      ['Yod', 'Dos planetas en sextil y un tercero en quincuncio con ambos; también llamado “Dedo de Dios”.'],
      ['Cometa', 'Un Gran Trígono con un cuarto planeta opuesto a uno de sus vértices.'],
      ['Rectángulo Místico', 'Cuatro planetas: dos oposiciones unidas por sextiles y trígonos.']
    ]
  },
  {
    title: 'Zodíaco y astrología védica',
    terms: [
      ['Zodíaco tropical', 'El zodíaco con 0° Aries fijado al equinoccio de primavera; habitual en la astrología occidental.'],
      ['Zodíaco sideral', 'El zodíaco fijado a las constelaciones; se usa en la astrología védica.'],
      ['Ayanamsa', 'La diferencia entre los zodíacos tropical y sideral (unos 24° hoy). Lahiri, Fagan-Bradley, Raman y otros la calculan de forma distinta.'],
      ['Rāśi (D1)', 'En la astrología védica, el signo sideral y la carta natal principal.'],
      ['Nakshatra', 'Una de las 27 mansiones lunares de 13°20′; cada una tiene un planeta regente.'],
      ['Pada', 'Uno de los cuatro cuartos de 3°20′ de un nakshatra.'],
      ['Navamsa (D9)', 'La carta divisional que divide cada signo en nueve; tradicionalmente se estudia para el matrimonio y la fuerza interior de los planetas.'],
      ['Vargottama', 'Un planeta en el mismo signo en D1 y D9; tradicionalmente se considera fuerte.'],
      ['Vimshottari dasha', 'Un sistema de periodos planetarios de 120 años que empieza en el nakshatra natal de la Luna; cada periodo mayor (mahadasha) tiene subperiodos (antardasha).'],
      ['Rahu y Ketu', 'Los Nodos Norte y Sur de la Luna en la astrología védica.']
    ]
  }
]
