import type { MeaningSet } from './types'

/**
 * Eingebaute Deutungen auf Deutsch.
 * Regel: Nichts über die Person wird als sicher behauptet; es heißt „kann“, „könnte“, „neigt dazu“.
 */
export const de: MeaningSet = {
  planets: {
    sun: { keywords: 'Identität, Wille, Lebenskraft', what: 'Sie können Ihre Identität, Ihren Willen und Ihre Lebenskraft', subject: 'Ihre Identität und Ihre Lebenskraft', about: 'Die Sonne steht traditionell für den Wesenskern, den Willen, die Lebenskraft und das, worin man strahlen möchte.' },
    moon: { keywords: 'Gefühle, Geborgenheit, Gewohnheiten', what: 'Sie können Ihre Gefühle, Ihr Bedürfnis nach Geborgenheit und Ihre instinktiven Reaktionen', subject: 'Ihre emotionalen Bedürfnisse und Ihre Suche nach Geborgenheit', about: 'Der Mond steht für Gefühle, die Innenwelt, Gewohnheiten, die Mutter und das Empfinden von Sicherheit.' },
    mercury: { keywords: 'Denken, Kommunikation, Lernen', what: 'Sie können Ihr Denken, Lernen und Kommunizieren', subject: 'Ihr Verstand und Ihre Art zu kommunizieren', about: 'Merkur wird mit dem Verstand, dem Sprechen, Schreiben, Lernen, Handel und dem nahen Umfeld verbunden.' },
    venus: { keywords: 'Liebe, Harmonie, Genuss, Werte', what: 'Sie können Ihre Art zu lieben, zu genießen und Beziehungen zu führen', subject: 'Ihre Art zu lieben und Ihre Suche nach Harmonie und Genuss', about: 'Venus wird mit Liebe, Anziehung, Schönheit, Beziehungen, Geld und dem, was man schätzt, verbunden.' },
    mars: { keywords: 'Wunsch, Mut, Antrieb', what: 'Sie können Ihre Wünsche, Ihren Mut und Ihren Antrieb', subject: 'Ihre Energie und Ihr Kampfgeist', about: 'Mars wird mit Begehren, Tatkraft, Wettbewerb, Ärger und Sexualität verbunden.' },
    jupiter: { keywords: 'Wachstum, Glaube, Glück', what: 'Sie können Ihre Suche nach Wachstum, Sinn und Gelegenheiten', subject: 'Ihr Glück und Ihr Wachstumspotenzial', about: 'Jupiter wird mit Ausdehnung, Optimismus, Glauben, höherer Bildung, Reisen und Fülle verbunden.' },
    saturn: { keywords: 'Verantwortung, Grenzen, Reife', what: 'Sie können Ihren Umgang mit Verantwortung, Grenzen und Disziplin', subject: 'Ihre Verantwortung und Ihr Weg zur Reife', about: 'Saturn wird mit Struktur, Disziplin, Zeit, Prüfungen, Ängsten und hart erarbeitetem Erfolg verbunden.' },
    uranus: { keywords: 'Freiheit, Erneuerung, Wandel', what: 'Sie können Ihr Bedürfnis nach Freiheit und Andersartigkeit', subject: 'Ihre Suche nach Freiheit und Ihre erfinderische Seite', about: 'Uranus wird mit plötzlichem Wandel, Freiheit, Individualität, Technik und dem Durchbrechen von Mustern verbunden.' },
    neptune: { keywords: 'Träume, Intuition, Transzendenz', what: 'Sie können Ihre Träume, Ihre Intuition und Ihre Ideale', subject: 'Ihre Fantasie und Ihre spirituelle Suche', about: 'Neptun wird mit Fantasie, Intuition, Mitgefühl, Kunst, Spiritualität und Illusion verbunden.' },
    pluto: { keywords: 'Wandlung, Macht, Tiefe', what: 'Sie können Ihre Wandlungskraft und Ihre tiefen Leidenschaften', subject: 'Ihre Wandlungskraft und Ihre tiefen Leidenschaften', about: 'Pluto wird mit Krise, Wiedergeburt, Macht, Kontrolle und den Tiefen des Unbewussten verbunden.' },
    node: { keywords: 'Wachstumsrichtung, Bestimmung', what: 'Sie können Ihre Wachstumsrichtung in diesem Leben', subject: 'Ihre Wachstumsrichtung und Ihr Sinn für Bestimmung', about: 'Der Nordknoten steht für die Richtung, die der Tradition nach wachsen lässt; der Südknoten für die vertraute Komfortzone.' },
    snode: { keywords: 'Gewohnheit, Vergangenheit, Komfortzone', what: 'Sie können vertraute Talente und Ihre Komfortzone', subject: 'Ihre angeborenen Talente und Gewohnheiten', about: 'Der Südknoten steht für alte Muster und fertige Talente, auf die man leicht zurückgreift.' },
    chiron: { keywords: 'Wunde, Heilung, Weisheit', what: 'Sie können Ihre Wunden und Ihre Heilkraft', subject: 'Ihre Wunden und Ihre Gabe zu heilen', about: 'Chiron steht für eine tiefe Verletzlichkeit und das Potenzial, anderen zu helfen, wenn man mit ihr Frieden schließt.' },
    lilith: { keywords: 'unterdrücktes Begehren, Aufbegehren', what: 'Sie können Ihre unterdrückten Wünsche und Ihre unbezähmbare Seite', subject: 'Ihre unterdrückten Wünsche und Ihre rebellische Seite', about: 'Lilith (Schwarzer Mond) steht für unterdrückte oder abgelehnte, aber kraftvolle Instinkte.' },
    fortune: { keywords: 'Glück, körperliches und materielles Wohl', what: 'Sie können Ihr Glück und Wege, sich wohlzufühlen', subject: 'Ihr Glück und Ihre Quellen des Wohlbefindens', about: 'Der Glückspunkt wird aus Sonne, Mond und Aszendent berechnet; er steht dafür, wo Wohlbefinden leicht fließen kann.' },
    asc: { keywords: 'Persönlichkeit, Körper, erster Eindruck', what: 'Sie können Ihr Auftreten in der Welt', subject: 'Ihr Auftreten und Ihr erster Eindruck', about: 'Der Aszendent ist das Zeichen, das bei der Geburt im Osten aufsteigt; er wird mit Persönlichkeit, Körper und erstem Eindruck verbunden.' },
    mc: { keywords: 'Beruf, öffentliche Rolle, Ziele', what: 'Sie können Ihre beruflichen Ziele und Ihre öffentliche Stellung', subject: 'Ihr Beruf und Ihre öffentliche Rolle', about: 'Das Medium Coeli (MC) ist der höchste Punkt des Horoskops; es wird mit Beruf, Ansehen und Lebenszielen verbunden.' }
  },
  signs: [
    { keywords: 'mutig, unternehmungslustig, ungeduldig', how: 'mutig, direkt und voller Initiative leben; der erste Schritt kann Ihnen leichtfallen', about: 'Der Widder ist das kardinale Feuerzeichen: verbunden mit Anfangen, Mut und Wettbewerb.' },
    { keywords: 'beständig, geduldig, genussvoll', how: 'ruhig, geduldig und dauerhaft leben; Sie suchen vielleicht Sicherheit und greifbare Ergebnisse', about: 'Der Stier ist das fixe Erdzeichen: verbunden mit Beständigkeit, den Sinnen und Ressourcen.' },
    { keywords: 'neugierig, wendig, kommunikativ', how: 'neugierig, wendig und gesprächig leben; Abwechslung und Gedankenaustausch können Sie nähren', about: 'Die Zwillinge sind das veränderliche Luftzeichen: verbunden mit Neugier, Kommunikation und Vielseitigkeit.' },
    { keywords: 'gefühlvoll, beschützend, intuitiv', how: 'gefühlvoll, beschützend und intuitiv leben; Zugehörigkeit und Nähe können Ihnen viel bedeuten', about: 'Der Krebs ist das kardinale Wasserzeichen: verbunden mit Zuhause, Familie, Gefühl und Fürsorge.' },
    { keywords: 'stolz, kreativ, großzügig', how: 'herzlich, kreativ und mit Ausstrahlung leben; Sie möchten vielleicht gesehen und geschätzt werden', about: 'Der Löwe ist das fixe Feuerzeichen: verbunden mit Kreativität, dem Herzen, Spiel und Bühne.' },
    { keywords: 'genau, analytisch, hilfsbereit', how: 'sorgfältig, analytisch und mit Liebe zum Detail leben; Nützlichkeit und Ordnung können Ihnen Ruhe geben', about: 'Die Jungfrau ist das veränderliche Erdzeichen: verbunden mit Analyse, Dienst, Gesundheit und Können.' },
    { keywords: 'harmonisch, diplomatisch, ästhetisch', how: 'anmutig, diplomatisch und ausgewogen leben; Sie suchen vielleicht Gerechtigkeit und Zusammenarbeit', about: 'Die Waage ist das kardinale Luftzeichen: verbunden mit Beziehungen, Ausgleich, Schönheit und Gerechtigkeit.' },
    { keywords: 'intensiv, leidenschaftlich, tief', how: 'intensiv, leidenschaftlich und in die Tiefe gehend leben; Oberflächliches genügt Ihnen vielleicht nicht', about: 'Der Skorpion ist das fixe Wasserzeichen: verbunden mit Leidenschaft, Wandlung, Geheimnissen und gemeinsamen Ressourcen.' },
    { keywords: 'optimistisch, frei, philosophisch', how: 'optimistisch, begeistert und frei leben; Sie suchen vielleicht Sinn und weitere Horizonte', about: 'Der Schütze ist das veränderliche Feuerzeichen: verbunden mit Glauben, Philosophie, Reisen und Lernen.' },
    { keywords: 'diszipliniert, ehrgeizig, ernst', how: 'ernsthaft, diszipliniert und zielstrebig leben; mit der Zeit können Sie etwas Solides aufbauen', about: 'Der Steinbock ist das kardinale Erdzeichen: verbunden mit Zielen, Verantwortung, Struktur und Status.' },
    { keywords: 'unabhängig, originell, idealistisch', how: 'originell, unabhängig und erfinderisch leben; Gemeinschaft und Zukunftsideen können Sie begeistern', about: 'Der Wassermann ist das fixe Luftzeichen: verbunden mit Freiheit, Gemeinschaft, Erneuerung und Idealen.' },
    { keywords: 'feinfühlig, verträumt, mitfühlend', how: 'feinfühlig, intuitiv und mitfühlend leben; Ihre Fantasie kann stark sein, und Grenzen können manchmal verschwimmen', about: 'Die Fische sind das veränderliche Wasserzeichen: verbunden mit Intuition, Mitgefühl, Fantasie und Hingabe.' }
  ],
  houses: [
    { keywords: 'Selbst, Körper, Anfänge', where: 'können sich vor allem in Ihrer Persönlichkeit, Ihrem Körper und Ihrer Lebenshaltung zeigen', about: '1. Haus: das Selbst, Erscheinung, Körper und erster Eindruck.' },
    { keywords: 'Geld, Besitz, Selbstwert', where: 'können sich vor allem bei Geld, Besitz und Selbstwert zeigen', about: '2. Haus: Einkommen, Besitz, Talente und Selbstwert.' },
    { keywords: 'Kommunikation, Geschwister, Umfeld', where: 'können sich vor allem in Kommunikation, Lernen, bei Geschwistern und im nahen Umfeld zeigen', about: '3. Haus: Kommunikation, Geschwister, Nachbarn, kurze Reisen und Grundbildung.' },
    { keywords: 'Zuhause, Familie, Wurzeln', where: 'können sich vor allem im Zuhause, in der Familie, den Wurzeln und Ihrer Innenwelt zeigen', about: '4. Haus: Zuhause, Familie, Wurzeln und ein Elternteil.' },
    { keywords: 'Kreativität, Romantik, Kinder', where: 'können sich vor allem in Kreativität, Romantik, Vergnügen und bei Kindern zeigen', about: '5. Haus: Kreativität, Liebschaften, Spiel, Hobbys und Kinder.' },
    { keywords: 'Arbeit, Gesundheit, Alltag', where: 'können sich vor allem in der täglichen Arbeit, den Routinen und den Gesundheitsgewohnheiten zeigen', about: '6. Haus: tägliche Arbeit, Dienst, Gesundheit, Routinen und Haustiere.' },
    { keywords: 'Partnerschaft, Ehe, offene Gegner', where: 'können sich vor allem in Ehe, Partnerschaften und Zweierbeziehungen zeigen', about: '7. Haus: Ehe, Partnerschaften, Verträge und offene Gegner.' },
    { keywords: 'Wandlung, gemeinsame Ressourcen, Krisen', where: 'können sich vor allem in Wandlung, Intimität und gemeinsamen Ressourcen zeigen', about: '8. Haus: gemeinsames Geld, Erbe, Schulden, Intimität, Krise und Wandlung.' },
    { keywords: 'Glaube, Reisen, höhere Bildung', where: 'können sich vor allem in höherer Bildung, Reisen, Überzeugungen und Ihrer Lebensphilosophie zeigen', about: '9. Haus: höhere Bildung, weite Reisen, Glaube, Recht und Veröffentlichungen.' },
    { keywords: 'Beruf, Status, Ziele', where: 'können sich vor allem in Beruf, öffentlicher Stellung und Ihren Zielen zeigen', about: '10. Haus: Beruf, Ansehen, öffentliche Rolle und Autorität.' },
    { keywords: 'Freunde, Gemeinschaft, Hoffnungen', where: 'können sich vor allem in Freundschaften, Gruppen und Zukunftshoffnungen zeigen', about: '11. Haus: Freunde, Gruppen, Netzwerke, Hoffnungen und Wünsche.' },
    { keywords: 'Unbewusstes, Rückzug, Verborgenes', where: 'können sich vor allem in Ihrer Innenwelt, im Unbewussten und hinter den Kulissen zeigen', about: '12. Haus: das Unbewusste, Rückzug, Verborgenes und spirituelle Suche.' }
  ],
  aspects: {
    conjunction: 'Die beiden Prinzipien können verschmelzen und zusammenwirken; die Wirkung kann stark sein und je nach Planeten leicht oder fordernd erscheinen.',
    opposition: 'Die beiden Prinzipien können in entgegengesetzte Richtungen ziehen; ein Bedürfnis nach Ausgleich kann entstehen, oft über Beziehungen erlebt.',
    trine: 'Die beiden Prinzipien können leicht und natürlich fließen; das kann sich wie ein angeborenes Talent anfühlen.',
    square: 'Die beiden Prinzipien können aneinander reiben; das kann Spannung erzeugen, aber auch zu Handlung und Wachstum antreiben.',
    sextile: 'Die beiden Prinzipien können sich gegenseitig stützen; mit etwas Einsatz können sich Gelegenheiten öffnen.',
    quincunx: 'Die beiden Prinzipien haben vielleicht wenig gemeinsam; es kann ständige Anpassung nötig sein.',
    semisextile: 'Eine leichte Verbindung; es kann kleine Anpassungen und stille Gelegenheiten zwischen beiden Prinzipien geben.',
    semisquare: 'Eine leichte Spannung; sie kann innere Unruhe und kleine Reibungen bringen.',
    sesquiquadrate: 'Eine leichte, aber anhaltende Spannung; sie kann ab und zu unerwartete Belastungen bringen.',
    quintile: 'Eine kreative Verbindung; sie kann auf ein besonderes Talent hinweisen.',
    biquintile: 'Eine kreative Verbindung; sie kann auf ein eigenes Talent hinweisen, das mit der Reife wächst.'
  },
  sunSign: [
    'Eine Widder-Sonne kann auf einen bahnbrechenden, mutigen Geist hinweisen. Dinge anzufangen, sich zu messen und eigene Wege zu gehen, kann Sie beleben; Ungeduld auszugleichen kann ein Wachstumsfeld sein.',
    'Eine Stier-Sonne kann auf ein ruhiges, beständiges und verlässliches Wesen hinweisen. Sie möchten vielleicht Greifbares und Dauerhaftes schaffen und das Leben genießen; Widerstand gegen Veränderung kann eine Herausforderung sein.',
    'Eine Zwillinge-Sonne kann auf ein neugieriges, vielseitiges Wesen hinweisen. Lernen, Reden und Ideen verknüpfen kann Sie lebendig halten; Zerstreutheit kann ein Punkt zum Beobachten sein.',
    'Eine Krebs-Sonne kann auf ein gefühlvolles, beschützendes und treues Wesen hinweisen. Familie, Zuhause und enge Bindungen können im Zentrum Ihrer Identität stehen; Verletzlichkeit kann manchmal schwer wiegen.',
    'Eine Löwe-Sonne kann auf ein herzliches, kreatives und großzügiges Wesen hinweisen. Sie möchten vielleicht zeigen, was von Herzen kommt, und Anerkennung finden; das Bedürfnis nach Bestätigung auszugleichen kann wichtig sein.',
    'Eine Jungfrau-Sonne kann auf ein sorgfältiges, fleißiges und hilfsbereites Wesen hinweisen. Details zu sehen und nützlich zu sein, kann Sinn geben; zu viel Selbstkritik und Sorge können Wachstumsfelder sein.',
    'Eine Waage-Sonne kann auf ein anmutiges, gerechtes und harmoniesuchendes Wesen hinweisen. Beziehungen, Zusammenarbeit und Schönheit können zentral sein; Entscheidungsschwierigkeiten können Aufmerksamkeit verlangen.',
    'Eine Skorpion-Sonne kann auf ein intensives, leidenschaftliches und tiefes Wesen hinweisen. Der Wahrheit auf den Grund zu gehen und gestärkt aus Krisen zu kommen, kann natürlich wirken; ein Kontrollbedürfnis kann herausfordern.',
    'Eine Schütze-Sonne kann auf ein optimistisches, freiheitsliebendes und abenteuerlustiges Wesen hinweisen. Sinnsuche, Reisen und Lernen können Sie beleben; Übermaß auszugleichen kann wichtig sein.',
    'Eine Steinbock-Sonne kann auf ein ernstes, ehrgeiziges und verantwortungsbewusstes Wesen hinweisen. Langfristige Ziele zu setzen und Schritt für Schritt voranzugehen, kann eine Stärke sein; Starrheit und Überarbeitung können Wachstumsfelder sein.',
    'Eine Wassermann-Sonne kann auf ein unabhängiges, originelles und zukunftsorientiertes Wesen hinweisen. Anders zu sein und neue Ideen zu entwickeln, kann Sie ausmachen; emotionale Distanz kann Aufmerksamkeit verlangen.',
    'Eine Fische-Sonne kann auf ein feinfühliges, intuitives und mitfühlendes Wesen hinweisen. Fantasie, Kunst und Hilfe für andere können Sie nähren; Grenzen zu setzen kann manchmal schwerfallen.'
  ],
  moonSign: [
    'Ein Widder-Mond kann auf Gefühle hinweisen, die schnell und direkt erlebt werden. Ärger kann rasch aufflammen und vergehen; ins Handeln zu kommen, kann emotional entlasten.',
    'Ein Stier-Mond kann auf emotionale Ruhe und Beständigkeit hinweisen. Sicherheit, Behaglichkeit und körperliche Nähe können Sie beruhigen; plötzliche Veränderungen können verunsichern.',
    'Ein Zwillinge-Mond kann darauf hinweisen, dass Sie Gefühle durch Reden und Denken verarbeiten. Gespräche und Abwechslung können guttun; es kann eine Neigung geben, Gefühle aus der Distanz zu analysieren.',
    'Ein Krebs-Mond (im eigenen Zeichen) kann auf große emotionale Feinfühligkeit hinweisen. Zuhause und Fürsorge können Grundbedürfnisse sein; Stimmungen können leicht schwanken.',
    'Ein Löwe-Mond kann auf ein Bedürfnis nach Liebe und Aufmerksamkeit hinweisen. Anerkennung und kreativer Ausdruck können Sie glücklich machen; übersehen zu werden, kann verletzen.',
    'Ein Jungfrau-Mond kann darauf hinweisen, dass Sie Gefühle durch Ordnung und nützliche Arbeit ausgleichen. Dinge in Ordnung zu bringen, kann beruhigen; es kann eine Neigung zu Sorge oder Selbstkritik geben.',
    'Ein Waage-Mond kann auf die Suche nach Harmonie und Frieden hinweisen. Ausgewogene Beziehungen und Freundlichkeit können guttun; um Konflikte zu meiden, halten Sie Gefühle vielleicht zurück.',
    'Ein Skorpion-Mond kann auf intensive und tiefe Gefühle hinweisen. Vertrauen und Treue können lebenswichtig sein; Kränkungen können lange nachwirken.',
    'Ein Schütze-Mond kann auf emotionalen Optimismus und ein Freiheitsbedürfnis hinweisen. Bewegung und Abenteuer können entspannen; sich eingeengt zu fühlen, kann belasten.',
    'Ein Steinbock-Mond kann auf kontrollierte und maßvolle Gefühle hinweisen. Verantwortung zu übernehmen, kann Sicherheit geben; Gefühle zu zeigen, kann schwerfallen.',
    'Ein Wassermann-Mond kann auf einen distanzierten, rationalen Umgang mit Gefühlen hinweisen. Freundschaft und Selbstsein können viel bedeuten; starke emotionale Ansprüche können Sie auf Abstand gehen lassen.',
    'Ein Fische-Mond kann auf starke Empathie und Intuition hinweisen. Sie spüren vielleicht leicht, was andere fühlen; Alleinsein, Musik und Kunst können guttun.'
  ],
  ascSign: [
    'Ein Widder-Aszendent kann einen energischen, direkten und entschlossenen ersten Eindruck machen. Sie gehen das Leben vielleicht mit Mut und Tempo an.',
    'Ein Stier-Aszendent kann einen ruhigen, vertrauenerweckenden ersten Eindruck machen. Sie gehen das Leben vielleicht vorsichtig und beständig an, ohne Eile.',
    'Ein Zwillinge-Aszendent kann einen lebhaften, gesprächigen und neugierigen ersten Eindruck machen. Sie gehen das Leben vielleicht gedanklich an und passen sich schnell an.',
    'Ein Krebs-Aszendent kann einen warmen, beschützenden und feinfühligen ersten Eindruck machen. Sie gehen das Leben vielleicht über das Gefühl an und öffnen sich, wenn Sie vertrauen.',
    'Ein Löwe-Aszendent kann einen strahlenden, selbstbewussten und charismatischen ersten Eindruck machen. Sie gehen das Leben vielleicht kreativ an und fallen leicht auf.',
    'Ein Jungfrau-Aszendent kann einen ordentlichen, maßvollen und aufmerksamen ersten Eindruck machen. Sie gehen das Leben vielleicht analytisch und praktisch an.',
    'Ein Waage-Aszendent kann einen anmutigen, höflichen und angenehmen ersten Eindruck machen. Sie gehen das Leben vielleicht über Beziehungen und Ausgleich an.',
    'Ein Skorpion-Aszendent kann einen intensiven, geheimnisvollen und eindrucksvollen ersten Eindruck machen. Sie gehen das Leben vielleicht mit Tiefe und Vorsicht an.',
    'Ein Schütze-Aszendent kann einen fröhlichen, offenen und abenteuerlustigen ersten Eindruck machen. Sie gehen das Leben vielleicht mit Optimismus und Neugier an.',
    'Ein Steinbock-Aszendent kann einen ernsten, reifen und verlässlichen ersten Eindruck machen. Sie gehen das Leben vielleicht über Verantwortung und Ziele an.',
    'Ein Wassermann-Aszendent kann einen originellen, freundlichen, aber etwas distanzierten ersten Eindruck machen. Sie gehen das Leben vielleicht unabhängig und erfinderisch an.',
    'Ein Fische-Aszendent kann einen sanften, verträumten und mitfühlenden ersten Eindruck machen. Sie gehen das Leben vielleicht intuitiv an und nehmen die Stimmung um sich auf.'
  ],
  elements: {
    fire: ['Eine Betonung des Feuers kann auf ein begeistertes, eifriges und tatkräftiges Wesen hinweisen.', 'Wenig Feuer: Motivation und Selbstvertrauen bewusst zu pflegen, kann helfen.'],
    earth: ['Eine Betonung der Erde kann auf ein praktisches, geduldiges und ergebnisorientiertes Wesen hinweisen.', 'Wenig Erde: Zeit für Routinen, den Körper und praktische Dinge einzuplanen, kann helfen.'],
    air: ['Eine Betonung der Luft kann auf ein geistiges, geselliges und kommunikatives Wesen hinweisen.', 'Wenig Luft: Gefühle in Worte zu fassen und mit Abstand nachzudenken, kann schwerer fallen.'],
    water: ['Eine Betonung des Wassers kann auf ein gefühlvolles, intuitives und einfühlsames Wesen hinweisen.', 'Wenig Wasser: sich Zeit zu nehmen, Gefühle wahrzunehmen und auszudrücken, kann helfen.']
  },
  retro: 'Rückläufig: Die Themen dieses Planeten können nach innen gewandter, nachdenklicher und eigenständiger erlebt werden.',
  glossary: [
    ['Planet', 'Planeten beschreiben das „Was“: Grundprinzipien wie Gefühle, Wille, Liebe und Antrieb.'],
    ['Zeichen', 'Das Zeichen beschreibt das „Wie“: den Stil, in dem sich die Energie eines Planeten ausdrücken kann.'],
    ['Haus', 'Das Haus beschreibt das „Wo“: den Lebensbereich (Arbeit, Familie, Beziehungen…), in dem diese Energie hervortreten kann.'],
    ['Aspekt', 'Der Winkelabstand zwischen zwei Planeten; er beschreibt ihre Beziehung (Harmonie, Spannung, Verschmelzung).'],
    ['Orbis', 'Wie weit ein Aspekt vom exakten Wert abweicht; je kleiner der Orbis, desto stärker gilt der Aspekt.'],
    ['Aszendent', 'Das Zeichen, das bei der Geburt im Osten aufsteigt. Er braucht eine genaue Geburtszeit; bei unsicherer Zeit mit Vorsicht lesen.'],
    ['Transit', 'Wie die aktuellen (oder gewählten) Planetenpositionen zum Geburtshoroskop stehen.'],
    ['Rückläufig', 'Wenn ein Planet von der Erde aus rückwärts zu laufen scheint; traditionell eine Zeit des Überprüfens.']
  ],
  disclaimer:
    'Diese Texte geben allgemeine Tendenzen aus der astrologischen Tradition wieder. Sie dienen der persönlichen Erkundung und Unterhaltung, nicht als Gewissheit oder Vorhersage, und ersetzen keine medizinische, rechtliche, psychologische oder finanzielle Beratung.'
}
