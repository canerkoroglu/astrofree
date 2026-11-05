import type { MeaningSet } from './types'

/**
 * Lectures intégrées en français.
 * Règle : rien n'est affirmé comme certain sur la personne ; on emploie « peut », « pourrait », « tend à ».
 */
export const fr: MeaningSet = {
  planets: {
    sun: { keywords: 'identité, volonté, vitalité', what: 'Vous pouvez exprimer votre identité, votre volonté et votre vitalité', subject: 'Votre identité et votre vitalité', about: 'Le Soleil symbolise traditionnellement le cœur de l’être, la volonté, la vitalité et ce en quoi l’on souhaite briller.' },
    moon: { keywords: 'émotions, sécurité, habitudes', what: 'Vous pouvez vivre vos émotions, votre besoin de sécurité et vos réactions instinctives', subject: 'Vos besoins émotionnels et votre quête de sécurité', about: 'La Lune symbolise les émotions, le monde intérieur, les habitudes, la mère et la façon de se sentir en sécurité.' },
    mercury: { keywords: 'pensée, communication, apprentissage', what: 'Vous pouvez penser, apprendre et communiquer', subject: 'Votre esprit et votre façon de communiquer', about: 'Mercure est associé à l’esprit, à la parole, à l’écriture, à l’apprentissage, au commerce et à l’entourage proche.' },
    venus: { keywords: 'amour, harmonie, plaisir, valeurs', what: 'Vous pouvez aimer, savourer la vie et entrer en relation', subject: 'Votre façon d’aimer et votre quête d’harmonie et de plaisir', about: 'Vénus est associée à l’amour, à l’attirance, à la beauté, aux relations, à l’argent et à ce que l’on valorise.' },
    mars: { keywords: 'désir, courage, élan', what: 'Vous pouvez poursuivre vos désirs et mobiliser votre courage et votre élan', subject: 'Votre énergie et votre combativité', about: 'Mars est associé au désir, à l’élan d’agir, à la compétition, à la colère et à la sexualité.' },
    jupiter: { keywords: 'croissance, foi, chance', what: 'Vous pouvez rechercher la croissance, le sens et les occasions', subject: 'Votre chance et votre potentiel de croissance', about: 'Jupiter est associé à l’expansion, à l’optimisme, aux croyances, aux études supérieures, aux voyages et à l’abondance.' },
    saturn: { keywords: 'responsabilité, limites, maturité', what: 'Vous pouvez assumer les responsabilités, les limites et la discipline', subject: 'Vos responsabilités et votre chemin vers la maturité', about: 'Saturne est associé à la structure, à la discipline, au temps, aux épreuves, aux peurs et à la réussite gagnée par l’effort.' },
    uranus: { keywords: 'liberté, innovation, changement', what: 'Vous pouvez exprimer votre besoin de liberté et de différence', subject: 'Votre quête de liberté et votre côté inventif', about: 'Uranus est associé au changement soudain, à la liberté, à l’individualité, à la technologie et à la rupture des schémas.' },
    neptune: { keywords: 'rêves, intuition, transcendance', what: 'Vous pouvez vivre vos rêves, vos intuitions et vos idéaux', subject: 'Votre imagination et votre quête spirituelle', about: 'Neptune est associé à l’imagination, à l’intuition, à la compassion, à l’art, à la spiritualité et à l’illusion.' },
    pluto: { keywords: 'transformation, pouvoir, profondeur', what: 'Vous pouvez utiliser votre force de transformation et vos passions profondes', subject: 'Votre force de transformation et vos passions profondes', about: 'Pluton est associé à la crise, à la renaissance, au pouvoir, au contrôle et aux profondeurs de l’inconscient.' },
    node: { keywords: 'direction d’évolution, but', what: 'Vous pouvez suivre votre direction d’évolution dans cette vie', subject: 'Votre direction d’évolution et votre sens du but', about: 'Le Nœud Nord symbolise la direction qui, selon la tradition, fait grandir ; le Nœud Sud, la zone de confort familière.' },
    snode: { keywords: 'habitude, passé, zone de confort', what: 'Vous pouvez vous appuyer sur des talents familiers et votre zone de confort', subject: 'Vos talents innés et vos habitudes', about: 'Le Nœud Sud symbolise les anciens schémas et les talents tout prêts vers lesquels on revient facilement.' },
    chiron: { keywords: 'blessure, guérison, sagesse', what: 'Vous pouvez affronter vos blessures et utiliser votre capacité de guérison', subject: 'Vos blessures et votre don de guérison', about: 'Chiron symbolise une sensibilité profonde et le potentiel d’aider les autres à guérir en faisant la paix avec elle.' },
    lilith: { keywords: 'désir refoulé, rébellion', what: 'Vous pouvez exprimer vos désirs refoulés et votre part indomptée', subject: 'Vos désirs refoulés et votre côté rebelle', about: 'Lilith (Lune noire) symbolise des instincts refoulés ou rejetés, mais puissants.' },
    fortune: { keywords: 'chance, bien-être physique et matériel', what: 'Vous pouvez trouver la chance et des façons de vous sentir bien', subject: 'Votre chance et vos sources de bien-être', about: 'La Part de Fortune se calcule à partir du Soleil, de la Lune et de l’Ascendant ; elle symbolise où le bien-être peut couler facilement.' },
    asc: { keywords: 'personnalité, corps, première impression', what: 'Vous pouvez vous présenter au monde', subject: 'Votre apparence et votre première impression', about: 'L’Ascendant est le signe qui se lève à l’est à la naissance ; il est associé à la personnalité, au corps et à la première impression.' },
    mc: { keywords: 'carrière, rôle public, objectifs', what: 'Vous pouvez poursuivre vos objectifs professionnels et votre position publique', subject: 'Votre carrière et votre rôle public', about: 'Le Milieu du Ciel (MC) est le point le plus haut du thème ; il est associé à la carrière, à la réputation et aux buts de vie.' }
  },
  signs: [
    { keywords: 'audacieux, entreprenant, impatient', how: 'avec courage, franchise et esprit d’initiative ; faire le premier pas peut vous venir facilement', about: 'Le Bélier est le signe cardinal de feu : associé au commencement, au courage et à la compétition.' },
    { keywords: 'stable, patient, sensuel', how: 'avec calme, patience et constance ; vous pouvez rechercher la sécurité et des résultats concrets', about: 'Le Taureau est le signe fixe de terre : associé à la stabilité, aux sens et aux ressources.' },
    { keywords: 'curieux, vif, communicatif', how: 'avec curiosité, vivacité et beaucoup d’échanges ; la variété et le partage d’idées peuvent vous nourrir', about: 'Les Gémeaux sont le signe mutable d’air : associés à la curiosité, à la communication et à la polyvalence.' },
    { keywords: 'sensible, protecteur, intuitif', how: 'de façon sensible, protectrice et intuitive ; l’appartenance et la proximité peuvent compter beaucoup', about: 'Le Cancer est le signe cardinal d’eau : associé au foyer, à la famille, au sentiment et au soin.' },
    { keywords: 'fier, créatif, généreux', how: 'avec chaleur, créativité et éclat ; vous pouvez souhaiter être vu et apprécié', about: 'Le Lion est le signe fixe de feu : associé à la créativité, au cœur, au jeu et à la scène.' },
    { keywords: 'précis, analytique, serviable', how: 'avec soin, analyse et souci du détail ; l’utilité et l’ordre peuvent vous apaiser', about: 'La Vierge est le signe mutable de terre : associée à l’analyse, au service, à la santé et au savoir-faire.' },
    { keywords: 'harmonieux, diplomate, esthète', how: 'avec grâce, diplomatie et équilibre ; vous pouvez rechercher la justice et la coopération', about: 'La Balance est le signe cardinal d’air : associée aux relations, à l’équilibre, à la beauté et à la justice.' },
    { keywords: 'intense, passionné, profond', how: 'avec intensité, passion et profondeur ; le superficiel peut ne pas vous suffire', about: 'Le Scorpion est le signe fixe d’eau : associé à la passion, à la transformation, aux secrets et aux ressources partagées.' },
    { keywords: 'optimiste, libre, philosophe', how: 'avec optimisme, enthousiasme et liberté ; vous pouvez chercher du sens et des horizons plus larges', about: 'Le Sagittaire est le signe mutable de feu : associé aux croyances, à la philosophie, aux voyages et à l’apprentissage.' },
    { keywords: 'discipliné, ambitieux, sérieux', how: 'avec sérieux, discipline et un but clair ; avec le temps, vous pouvez bâtir quelque chose de solide', about: 'Le Capricorne est le signe cardinal de terre : associé aux objectifs, à la responsabilité, à la structure et au statut.' },
    { keywords: 'indépendant, original, idéaliste', how: 'de façon originale, indépendante et inventive ; la communauté et les idées d’avenir peuvent vous enthousiasmer', about: 'Le Verseau est le signe fixe d’air : associé à la liberté, à la communauté, à l’innovation et aux idéaux.' },
    { keywords: 'sensible, rêveur, compatissant', how: 'avec sensibilité, intuition et compassion ; votre imagination peut être forte et les limites peuvent parfois se brouiller', about: 'Les Poissons sont le signe mutable d’eau : associés à l’intuition, à la compassion, à l’imagination et au lâcher-prise.' }
  ],
  houses: [
    { keywords: 'soi, corps, débuts', where: 'peuvent se manifester surtout dans votre personnalité, votre corps et votre manière d’aborder la vie', about: 'Maison 1 : le soi, l’apparence, le corps et la première impression.' },
    { keywords: 'argent, biens, estime de soi', where: 'peuvent se manifester surtout dans l’argent, les biens et l’estime de soi', about: 'Maison 2 : revenus, biens, talents et estime de soi.' },
    { keywords: 'communication, fratrie, entourage', where: 'peuvent se manifester surtout dans la communication, l’apprentissage, la fratrie et votre entourage proche', about: 'Maison 3 : communication, frères et sœurs, voisins, petits voyages et instruction de base.' },
    { keywords: 'foyer, famille, racines', where: 'peuvent se manifester surtout dans le foyer, la famille, les racines et votre monde intérieur', about: 'Maison 4 : foyer, famille, racines et un parent.' },
    { keywords: 'créativité, amour, enfants', where: 'peuvent se manifester surtout dans la créativité, les amours, les loisirs et les enfants', about: 'Maison 5 : créativité, amours, jeu, loisirs et enfants.' },
    { keywords: 'travail, santé, quotidien', where: 'peuvent se manifester surtout dans le travail quotidien, les routines et les habitudes de santé', about: 'Maison 6 : travail quotidien, service, santé, routines et animaux domestiques.' },
    { keywords: 'partenariat, mariage, adversaires déclarés', where: 'peuvent se manifester surtout dans le mariage, les associations et les relations en tête-à-tête', about: 'Maison 7 : mariage, associations, contrats et adversaires déclarés.' },
    { keywords: 'transformation, ressources partagées, crises', where: 'peuvent se manifester surtout dans la transformation, l’intimité et les ressources partagées', about: 'Maison 8 : argent partagé, héritage, dettes, intimité, crise et transformation.' },
    { keywords: 'croyances, voyages, études supérieures', where: 'peuvent se manifester surtout dans les études supérieures, les voyages, les croyances et votre philosophie de vie', about: 'Maison 9 : études supérieures, longs voyages, croyances, droit et publications.' },
    { keywords: 'carrière, statut, objectifs', where: 'peuvent se manifester surtout dans votre carrière, votre position publique et vos objectifs', about: 'Maison 10 : carrière, réputation, rôle public et autorité.' },
    { keywords: 'amis, communauté, espoirs', where: 'peuvent se manifester surtout dans les amitiés, les groupes et les espoirs d’avenir', about: 'Maison 11 : amis, groupes, réseaux, espoirs et souhaits.' },
    { keywords: 'inconscient, retraite, le caché', where: 'peuvent se manifester surtout dans votre monde intérieur, l’inconscient et en coulisses', about: 'Maison 12 : l’inconscient, la retraite, les choses cachées et la quête spirituelle.' }
  ],
  aspects: {
    conjunction: 'Les deux principes peuvent fusionner et agir ensemble ; l’effet peut être fort et sembler facile ou exigeant selon les planètes.',
    opposition: 'Les deux principes peuvent tirer dans des directions opposées ; un besoin d’équilibre peut naître, souvent vécu à travers les relations.',
    trine: 'Les deux principes peuvent circuler avec aisance et naturel ; cela peut ressembler à un talent inné.',
    square: 'Les deux principes peuvent se heurter ; cela peut créer tension et friction, mais aussi pousser à l’action et à la croissance.',
    sextile: 'Les deux principes peuvent se soutenir ; des occasions peuvent s’ouvrir avec un peu d’effort.',
    quincunx: 'Les deux principes peuvent avoir peu en commun ; un ajustement constant peut être nécessaire.',
    semisextile: 'Un lien léger ; de petits ajustements et des occasions discrètes peuvent exister entre les deux principes.',
    semisquare: 'Une tension légère ; elle peut apporter une agitation intérieure et de petites frictions.',
    sesquiquadrate: 'Une tension légère mais persistante ; elle peut apporter de temps à autre des tensions inattendues.',
    quintile: 'Un lien créatif ; il peut signaler un talent singulier.',
    biquintile: 'Un lien créatif ; il peut signaler un talent original qui s’affirme avec la maturité.'
  },
  sunSign: [
    'Un Soleil en Bélier peut indiquer un esprit pionnier et courageux. Lancer des projets, rivaliser et tracer votre propre voie peut vous donner de l’énergie ; tempérer l’impatience peut être un axe de croissance.',
    'Un Soleil en Taureau peut indiquer une nature calme, stable et fiable. Vous pouvez vouloir bâtir du concret et du durable et profiter de la vie ; la résistance au changement peut être un défi.',
    'Un Soleil en Gémeaux peut indiquer une nature curieuse et polyvalente. Apprendre, échanger et relier les idées peut vous garder vivant ; la dispersion peut être un point à surveiller.',
    'Un Soleil en Cancer peut indiquer une nature sensible, protectrice et fidèle. La famille, le foyer et les liens proches peuvent être au cœur de votre identité ; la vulnérabilité peut parfois peser.',
    'Un Soleil en Lion peut indiquer une nature chaleureuse, créative et généreuse. Vous pouvez vouloir exprimer ce qui vient du cœur et être apprécié ; équilibrer le besoin de reconnaissance peut compter.',
    'Un Soleil en Vierge peut indiquer une nature soigneuse, travailleuse et serviable. Voir les détails et être utile peut donner du sens ; l’autocritique et l’inquiétude excessives peuvent être des axes de croissance.',
    'Un Soleil en Balance peut indiquer une nature gracieuse, juste et en quête d’harmonie. Les relations, la coopération et la beauté peuvent être centrales ; la difficulté à décider peut demander de l’attention.',
    'Un Soleil en Scorpion peut indiquer une nature intense, passionnée et profonde. Aller au fond des choses et sortir plus fort des crises peut sembler naturel ; le besoin de contrôle peut être un défi.',
    'Un Soleil en Sagittaire peut indiquer une nature optimiste, libre et aventureuse. Chercher du sens, voyager et apprendre peut vous animer ; tempérer les excès peut compter.',
    'Un Soleil en Capricorne peut indiquer une nature sérieuse, ambitieuse et responsable. Fixer des objectifs à long terme et avancer pas à pas peut être une force ; la rigidité et le surmenage peuvent être des axes de croissance.',
    'Un Soleil en Verseau peut indiquer une nature indépendante, originale et tournée vers l’avenir. Être différent et proposer des idées neuves peut vous définir ; la distance émotionnelle peut demander de l’attention.',
    'Un Soleil en Poissons peut indiquer une nature sensible, intuitive et compatissante. L’imagination, l’art et l’aide aux autres peuvent vous nourrir ; poser des limites peut parfois être difficile.'
  ],
  moonSign: [
    'Une Lune en Bélier peut indiquer des émotions vécues vite et directement. La colère peut s’enflammer et retomber rapidement ; passer à l’action peut soulager émotionnellement.',
    'Une Lune en Taureau peut indiquer un calme et une stabilité émotionnels. La sécurité, le confort et la proximité physique peuvent vous apaiser ; les changements soudains peuvent inquiéter.',
    'Une Lune en Gémeaux peut indiquer que vous traitez vos émotions en parlant et en réfléchissant. La conversation et la variété peuvent faire du bien ; il peut y avoir une tendance à analyser les sentiments à distance.',
    'Une Lune en Cancer (dans son propre signe) peut indiquer une grande sensibilité émotionnelle. Le foyer et le soin peuvent être des besoins essentiels ; l’humeur peut fluctuer facilement.',
    'Une Lune en Lion peut indiquer un besoin d’amour et d’attention. Être apprécié et s’exprimer de façon créative peut vous rendre heureux ; être ignoré peut blesser.',
    'Une Lune en Vierge peut indiquer que vous équilibrez vos émotions par l’ordre et un travail utile. Remettre les choses en place peut apaiser ; il peut y avoir une tendance à s’inquiéter ou à s’autocritiquer.',
    'Une Lune en Balance peut indiquer une quête d’harmonie et de paix. Des relations équilibrées et la gentillesse peuvent faire du bien ; vous pouvez retenir vos sentiments pour éviter les conflits.',
    'Une Lune en Scorpion peut indiquer des émotions intenses et profondes. La confiance et la loyauté peuvent être vitales ; les blessures peuvent vous accompagner longtemps.',
    'Une Lune en Sagittaire peut indiquer un optimisme émotionnel et un besoin de liberté. Le mouvement et l’aventure peuvent vous détendre ; se sentir limité peut étouffer.',
    'Une Lune en Capricorne peut indiquer des émotions maîtrisées et mesurées. Prendre des responsabilités peut rassurer ; montrer ses sentiments peut être difficile.',
    'Une Lune en Verseau peut indiquer une approche détachée et rationnelle des émotions. L’amitié et le fait d’être soi peuvent beaucoup compter ; des exigences émotionnelles fortes peuvent vous éloigner.',
    'Une Lune en Poissons peut indiquer une forte empathie et une grande intuition. Vous pouvez ressentir facilement ce que vivent les autres ; la solitude, la musique et l’art peuvent faire du bien.'
  ],
  ascSign: [
    'Un Ascendant Bélier peut donner une première impression énergique, directe et affirmée. Vous pouvez aborder la vie avec courage et rapidité.',
    'Un Ascendant Taureau peut donner une première impression calme et rassurante. Vous pouvez aborder la vie avec prudence et constance, sans hâte.',
    'Un Ascendant Gémeaux peut donner une première impression vive, bavarde et curieuse. Vous pouvez aborder la vie de façon intellectuelle et vous adapter vite.',
    'Un Ascendant Cancer peut donner une première impression chaleureuse, protectrice et sensible. Vous pouvez aborder la vie par le sentiment et vous ouvrir une fois en confiance.',
    'Un Ascendant Lion peut donner une première impression rayonnante, assurée et charismatique. Vous pouvez aborder la vie avec créativité et vous faire remarquer facilement.',
    'Un Ascendant Vierge peut donner une première impression ordonnée, mesurée et attentive. Vous pouvez aborder la vie de façon analytique et pratique.',
    'Un Ascendant Balance peut donner une première impression gracieuse, polie et agréable. Vous pouvez aborder la vie à travers les relations et l’équilibre.',
    'Un Ascendant Scorpion peut donner une première impression intense, mystérieuse et marquante. Vous pouvez aborder la vie avec profondeur et prudence.',
    'Un Ascendant Sagittaire peut donner une première impression joyeuse, franche et aventureuse. Vous pouvez aborder la vie avec optimisme et curiosité.',
    'Un Ascendant Capricorne peut donner une première impression sérieuse, mûre et fiable. Vous pouvez aborder la vie par la responsabilité et les objectifs.',
    'Un Ascendant Verseau peut donner une première impression originale, amicale mais un peu distante. Vous pouvez aborder la vie de façon indépendante et inventive.',
    'Un Ascendant Poissons peut donner une première impression douce, rêveuse et compatissante. Vous pouvez aborder la vie avec intuition et capter l’ambiance autour de vous.'
  ],
  elements: {
    fire: ['Une dominante de feu peut indiquer une nature enthousiaste, ardente et tournée vers l’action.', 'Peu de feu : entretenir consciemment la motivation et la confiance peut aider.'],
    earth: ['Une dominante de terre peut indiquer une nature pratique, patiente et axée sur les résultats.', 'Peu de terre : prendre du temps pour la routine, le corps et les questions pratiques peut aider.'],
    air: ['Une dominante d’air peut indiquer une nature intellectuelle, sociable et communicative.', 'Peu d’air : mettre ses sentiments en mots et prendre du recul pour réfléchir peut être plus difficile.'],
    water: ['Une dominante d’eau peut indiquer une nature émotive, intuitive et empathique.', 'Peu d’eau : réserver du temps pour percevoir et exprimer ses sentiments peut aider.']
  },
  retro: 'Rétrograde : les thèmes de cette planète peuvent se vivre de façon plus intérieure, réfléchie et personnelle.',
  glossary: [
    ['Planète', 'Les planètes décrivent le « quoi » : des principes de base comme les sentiments, la volonté, l’amour et l’élan.'],
    ['Signe', 'Le signe décrit le « comment » : le style dans lequel l’énergie d’une planète peut s’exprimer.'],
    ['Maison', 'La maison décrit le « où » : le domaine de vie (travail, famille, relations…) où cette énergie peut ressortir.'],
    ['Aspect', 'La distance angulaire entre deux planètes ; elle décrit leur relation (harmonie, tension, fusion).'],
    ['Orbe', 'L’écart d’un aspect par rapport à sa valeur exacte ; plus l’orbe est petit, plus l’aspect est considéré comme fort.'],
    ['Ascendant', 'Le signe qui se lève à l’est à la naissance. Il exige une heure de naissance exacte ; lisez-le avec prudence si l’heure est incertaine.'],
    ['Transit', 'La relation entre les positions actuelles (ou choisies) des planètes et le thème natal.'],
    ['Rétrograde', 'Quand une planète semble reculer vue de la Terre ; traditionnellement, un temps de révision.']
  ],
  disclaimer:
    'Ces textes décrivent des tendances générales de la tradition astrologique. Ils servent à l’exploration personnelle et au divertissement, non à la certitude ou à la prédiction, et ne remplacent pas un conseil médical, juridique, psychologique ou financier.'
}
