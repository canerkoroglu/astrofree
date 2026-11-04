import type { GlossaryGroup } from './glossary'

/** Astrology terms used in the app. Definitions describe the tradition, never verdicts about a person. */
export const glossaryEn: GlossaryGroup[] = [
  {
    title: 'Basics',
    terms: [
      ['Birth chart (natal chart)', 'A two-dimensional map of the sky at the moment and place of birth: the planets’ signs and houses and the aspects between them.'],
      ['Planet', 'Bodies that stand for basic principles; in astrology the Sun and Moon are called planets too. The planet describes the “what”.'],
      ['Sign', 'One of the twelve 30° sections of the ecliptic (the Sun’s yearly path). The sign describes “how” a planet’s energy may be expressed.'],
      ['House', 'The chart divided into twelve sections by the Earth’s daily rotation. Each house is associated with an area of life (work, family, relationships…): the “where”.'],
      ['Aspect', 'The angular distance between two planets or points (e.g. a 90° square, a 120° trine). Aspects describe how two principles may work together.'],
      ['Orb', 'How far an aspect is from exact. An 87° distance is a square with a 3° orb. The smaller the orb, the stronger the aspect is considered.'],
      ['Applying / separating', 'An aspect is applying while the faster planet moves towards exact and separating once it has passed. Applying aspects are traditionally considered stronger.'],
      ['Retrograde', 'When a planet appears to move backwards as seen from Earth. It is an effect of viewpoint; traditionally a time of review.'],
      ['Station', 'The moment a planet turns retrograde or direct; it appears almost motionless.'],
      ['Ecliptic', 'The Sun’s apparent yearly path across the sky. Signs and planetary longitudes are measured along it.'],
      ['Declination', 'How far north or south of the celestial equator a body is. Planets at the same declination are called “parallel”.'],
      ['Element', 'The signs in four groups: Fire (Aries, Leo, Sagittarius), Earth (Taurus, Virgo, Capricorn), Air (Gemini, Libra, Aquarius), Water (Cancer, Scorpio, Pisces).'],
      ['Modality (cardinal, fixed, mutable)', 'The signs in three groups: cardinal signs are associated with starting, fixed signs with sustaining, mutable signs with adapting.'],
      ['Chart ruler', 'The planet that rules the Ascendant sign; traditionally it carries the chart’s overall theme.']
    ]
  },
  {
    title: 'Angles and houses',
    terms: [
      ['Ascendant (ASC)', 'The degree rising on the eastern horizon at birth; the start of the 1st house. Associated with personality, body and first impressions. It needs an accurate birth time.'],
      ['Descendant (DSC)', 'The point opposite the Ascendant, the western horizon; the start of the 7th house. Associated with one-to-one relationships.'],
      ['Midheaven (MC)', 'Where the ecliptic crosses the meridian, the highest point; in most house systems the start of the 10th house. Associated with career and public role.'],
      ['Imum Coeli (IC)', 'The point opposite the MC; in most house systems the start of the 4th house. Associated with roots, family and home.'],
      ['Angular, succedent, cadent', 'Angular houses (1, 4, 7, 10) are considered strongest, succedent (2, 5, 8, 11) middling, cadent (3, 6, 9, 12) weaker.'],
      ['House system', 'The method used to divide the houses. Placidus, Koch, Alcabitius, Regiomontanus and Campanus divide time or space; Equal and Whole Sign use equal 30° sections.'],
      ['Whole sign houses', 'The whole Ascendant sign is the 1st house, the next sign the 2nd, and so on; the main house system of Hellenistic astrology.'],
      ['Polar circle problem', 'At very high latitudes systems such as Placidus and Koch are undefined; AstroFree then uses Porphyry houses and says so.']
    ]
  },
  {
    title: 'Aspects',
    terms: [
      ['Conjunction (0°)', 'Two planets at or near the same degree. The principles merge; this may feel easy or challenging depending on the planets.'],
      ['Opposition (180°)', 'Two planets facing each other. Associated with a need for balance and awareness, often experienced through relationships.'],
      ['Trine (120°)', 'A harmonious aspect between signs of the same element; associated with flow and ease.'],
      ['Square (90°)', 'A challenging but motivating aspect; associated with tension, effort and growth.'],
      ['Sextile (60°)', 'A supportive aspect; associated with opportunities that can open up with some effort.'],
      ['Quincunx (150°)', 'An aspect between signs with little in common; associated with adjustment.'],
      ['Minor aspects', 'Semi-sextile (30°), semi-square (45°), sesquiquadrate (135°), quintile (72°), biquintile (144°). Considered milder; drawn dashed on the wheel.'],
      ['Major / minor aspect', 'Conjunction, opposition, trine, square and sextile are the major (Ptolemaic) aspects; the rest are minor.']
    ]
  },
  {
    title: 'Points and minor bodies',
    terms: [
      ['Lunar nodes (North / South)', 'The two points where the Moon’s orbit crosses the ecliptic; eclipses happen near them. The North Node is associated with growth, the South Node with familiar patterns.'],
      ['Mean / true node', 'The mean node is a smoothly moving calculated point; the true node follows the Moon’s actual orbit and wobbles. Selectable in Settings.'],
      ['Chiron', 'A small body orbiting between Saturn and Uranus; associated with wounding and healing.'],
      ['Lilith (Black Moon)', 'The far point (apogee) of the Moon’s orbit. Associated with suppressed instincts and an untamed side; mean and osculating versions exist.'],
      ['Part of Fortune', 'Ascendant + Moon − Sun (by night Ascendant + Sun − Moon); associated with physical and material wellbeing.'],
      ['Vertex', 'Where the prime vertical crosses the ecliptic, near the western horizon; associated with “fated” encounters.'],
      ['Asteroids (Ceres, Pallas, Juno, Vesta)', 'Large bodies of the main asteroid belt; associated with nurture, wisdom, commitment and devotion respectively.'],
      ['Fixed stars', 'Bright stars that barely move compared with the planets (Regulus, Algol, Spica…). Conjunctions within 1° of a planet or angle are considered.']
    ]
  },
  {
    title: 'Forecasting and comparison',
    terms: [
      ['Transit', 'Aspects made by the planets’ current (or chosen) positions to the points of the birth chart.'],
      ['Secondary progression', 'Each day after birth stands for a year of life (“a day for a year”). AstroFree uses the Naibod method for the MC.'],
      ['Solar arc', 'Every point in the chart moved forward by the arc of the progressed Sun; about 1° a year.'],
      ['Synastry', 'Two birth charts laid over each other to study the aspects between them; used to explore relationship themes.'],
      ['Composite chart', 'A single chart made of the midpoints of two charts’ planets; said to represent the relationship itself.'],
      ['Davison chart', 'A real chart drawn for the midpoint in time and place of two births; another kind of relationship chart.'],
      ['Solar return', 'A chart for the moment the Sun returns to its birth degree each year; used for the themes of that year.'],
      ['Lunar return', 'A chart for the moment the Moon returns to its birth degree each month; used for the themes of that month.'],
      ['Harmonic chart', 'All positions multiplied by a number (H2–H16); it brings out particular families of aspects.'],
      ['Midpoint', 'The degree halfway between two planets. In the Ebertin tradition a point touching a midpoint (C = A/B) is read as a theme combining both.'],
      ['Astrocartography', 'Lines on the world map showing where each planet was rising, setting, culminating or at the IC at birth.'],
      ['Relocated chart', 'The same birth moment drawn for another city; the planets stay, the houses and angles change.'],
      ['Graphic ephemeris', 'A graph of the transiting planets over time, together with the birth points.'],
      ['Electional astrology', 'Searching for time windows that meet chosen conditions (the Moon’s state, retrogrades, aspects) for an undertaking.']
    ]
  },
  {
    title: 'Moon and time',
    terms: [
      ['Moon phases', 'Eight phases by the Sun–Moon angle: New, Crescent, First Quarter, Gibbous, Full, Disseminating, Last Quarter, Balsamic.'],
      ['Void-of-course Moon', 'The time after the Moon’s last major aspect in a sign until it leaves the sign; traditionally not favoured for starting things.'],
      ['Lunar mansions (manazil)', 'The Moon’s roughly 28-day circuit divided into 28 parts; used in Arabic and medieval electional astrology.'],
      ['Eclipse', 'A solar eclipse happens at a New Moon, a lunar eclipse at a Full Moon, when the Moon is near the nodes.'],
      ['Planetary day and hour', 'Each weekday and each “hour” from sunrise is given to a planet in Chaldean order; day and night hours have unequal length.'],
      ['Rectification', 'Correcting an uncertain birth time from known life events.'],
      ['Rodden rating', 'A reliability grade for birth data: AA (record), A (memory), B (biography), C (vague), DD (conflicting), X (time unknown).'],
      ['Local Mean Time (LMT)', 'Solar time by the place’s longitude, used before standard time zones.'],
      ['Julian calendar', 'The calendar in use before 1582; AstroFree switches to it for those dates.']
    ]
  },
  {
    title: 'Traditional astrology',
    terms: [
      ['Essential dignity', 'A planet’s strength in its sign: domicile, exaltation, triplicity, term and face are strengths; detriment and fall are weaknesses.'],
      ['Domicile (rulership)', 'The planet that “owns” a sign (e.g. Mars rules Aries). The modern system also uses Uranus, Neptune and Pluto as rulers.'],
      ['Exaltation and fall', 'Signs where a planet is considered especially strong (exaltation) or weak (fall); fall is opposite exaltation.'],
      ['Detriment', 'A planet in the sign opposite one it rules; traditionally considered a difficulty.'],
      ['Triplicity', 'Day, night and participating rulers for each element (Dorotheus system).'],
      ['Terms (bounds)', 'Each sign split into five unequal parts, each given to a planet (Egyptian terms).'],
      ['Faces (decans)', 'Three 10° parts of each sign, given to the planets in Chaldean order.'],
      ['Almuten', 'The planet with the most essential dignity points at a degree, scored the way Lilly did.'],
      ['Sect', 'Whether the chart is diurnal (Sun above the horizon) or nocturnal; it sets the planets’ “team”.'],
      ['Profection', 'The Ascendant moved on one sign per year; the ruler of that year’s sign is the “lord of the year”.'],
      ['Firdaria', 'A Persian timing method that divides life into periods ruled by the planets.'],
      ['Hermetic lots', 'The lots of Fortune, Spirit, Eros, Necessity, Courage, Victory and Nemesis, calculated from the Sun, Moon and planets.'],
      ['Chaldean order', 'The planets by apparent speed: Saturn, Jupiter, Mars, Sun, Venus, Mercury, Moon.']
    ]
  },
  {
    title: 'Aspect patterns',
    terms: [
      ['Stellium', 'Three or more planets in one sign or house; it may point to that area being in the foreground.'],
      ['Grand Trine', 'Three planets linked by trines, usually in the same element.'],
      ['T-Square', 'Two planets in opposition, a third square to both; a pattern of tension and drive.'],
      ['Grand Cross', 'Four planets linked by two oppositions and four squares.'],
      ['Yod', 'Two planets in sextile, a third quincunx to both; also called the “Finger of God”.'],
      ['Kite', 'A Grand Trine with a fourth planet opposite one of its corners.'],
      ['Mystic Rectangle', 'Four planets: two oppositions joined by sextiles and trines.']
    ]
  },
  {
    title: 'Zodiac and Vedic astrology',
    terms: [
      ['Tropical zodiac', 'The zodiac with 0° Aries fixed to the spring equinox; common in Western astrology.'],
      ['Sidereal zodiac', 'The zodiac fixed to the star constellations; used in Vedic astrology.'],
      ['Ayanamsa', 'The difference between the tropical and sidereal zodiacs (about 24° today). Lahiri, Fagan-Bradley, Raman and others calculate it differently.'],
      ['Rāśi (D1)', 'In Vedic astrology, the sidereal sign and the main birth chart.'],
      ['Nakshatra', 'One of 27 lunar mansions of 13°20′ each; each has a ruling planet.'],
      ['Pada', 'One of the four 3°20′ quarters of a nakshatra.'],
      ['Navamsa (D9)', 'The divisional chart made by splitting each sign into nine; traditionally studied for marriage and a planet’s inner strength.'],
      ['Vargottama', 'A planet in the same sign in D1 and D9; traditionally considered strong.'],
      ['Vimshottari dasha', 'A 120-year system of planetary periods starting from the Moon’s birth nakshatra; each major period (mahadasha) has sub-periods (antardasha).'],
      ['Rahu and Ketu', 'The North and South Lunar Nodes in Vedic astrology.']
    ]
  }
]
