import type { MeaningSet } from './types'

/**
 * English built-in readings.
 * Rule: never state anything about the person as certain; use "may", "can", "might", "tend to".
 * Definitions of planets, signs and houses report what the tradition associates with them.
 */
export const en: MeaningSet = {
  planets: {
    sun: { keywords: 'identity, will, vitality', what: 'You may express your identity, will and vitality', subject: 'Your identity and vitality', about: 'The Sun traditionally symbolises the core self, will, vitality and where you want to shine.' },
    moon: { keywords: 'emotions, security, habits', what: 'You may experience your emotions, need for security and instinctive reactions', subject: 'Your emotional needs and search for security', about: 'The Moon symbolises emotions, the inner world, habits, the mother and how you find a sense of safety.' },
    mercury: { keywords: 'thinking, communication, learning', what: 'You may think, learn and communicate', subject: 'Your mind and way of communicating', about: 'Mercury is associated with the mind, speech, writing, learning, trade and your close surroundings.' },
    venus: { keywords: 'love, harmony, pleasure, values', what: 'You may love, enjoy and relate to others', subject: 'Your search for love, harmony and pleasure', about: 'Venus is associated with love, attraction, beauty, relationships, money and what you value.' },
    mars: { keywords: 'desire, courage, drive', what: 'You may pursue your desires and use your courage and drive', subject: 'Your energy and fighting spirit', about: 'Mars is associated with desire, the drive to act, competition, anger and sexuality.' },
    jupiter: { keywords: 'growth, faith, luck', what: 'You may seek growth, meaning and opportunity', subject: 'Your luck and potential for growth', about: 'Jupiter is associated with expansion, optimism, belief, higher learning, travel and abundance.' },
    saturn: { keywords: 'responsibility, limits, maturity', what: 'You may handle responsibility, limits and discipline', subject: 'Your responsibilities and path to maturity', about: 'Saturn is associated with structure, discipline, time, tests, fears and success earned through effort.' },
    uranus: { keywords: 'freedom, innovation, change', what: 'You may express your need for freedom and to be different', subject: 'Your search for freedom and inventive side', about: 'Uranus is associated with sudden change, freedom, individuality, technology and breaking patterns.' },
    neptune: { keywords: 'dreams, intuition, transcendence', what: 'You may live out your dreams, intuitions and ideals', subject: 'Your imagination and spiritual search', about: 'Neptune is associated with imagination, intuition, compassion, art, spirituality and illusion.' },
    pluto: { keywords: 'transformation, power, depth', what: 'You may use your transformative power and deep passions', subject: 'Your transformative power and deep passions', about: 'Pluto is associated with crisis, rebirth, power, control and the depths of the unconscious.' },
    node: { keywords: 'direction of growth, purpose', what: 'You may pursue your direction of growth in this life', subject: 'Your direction of growth and sense of purpose', about: 'The North Node symbolises the direction that is said to help you grow; the South Node the familiar comfort zone.' },
    snode: { keywords: 'habit, past, comfort zone', what: 'You may rely on familiar talents and your comfort zone', subject: 'Your innate talents and habits', about: 'The South Node symbolises old patterns and ready-made talents you may fall back on easily.' },
    chiron: { keywords: 'wound, healing, wisdom', what: 'You may face your wounds and use your power to heal', subject: 'Your wounds and gift for healing', about: 'Chiron symbolises a deep sensitivity and the potential to help others heal by making peace with it.' },
    lilith: { keywords: 'suppressed desire, rebellion', what: 'You may express suppressed desires and your untamed side', subject: 'Your suppressed desires and rebellious side', about: 'Lilith (Black Moon) symbolises instincts that are suppressed or rejected yet powerful.' },
    fortune: { keywords: 'luck, physical and material wellbeing', what: 'You may find luck and ways of feeling well', subject: 'Your luck and sources of wellbeing', about: 'The Part of Fortune is calculated from the Sun, Moon and Ascendant; it symbolises where wellbeing may flow easily.' },
    asc: { keywords: 'personality, body, first impression', what: 'You may present yourself to the world', subject: 'Your appearance and first impression', about: 'The Ascendant is the sign rising in the east at birth; it is associated with personality, the body and first impressions.' },
    mc: { keywords: 'career, public role, goals', what: 'You may pursue your career goals and public standing', subject: 'Your career and public role', about: 'The Midheaven (MC) is the highest point of the chart; it is associated with career, reputation and life goals.' }
  },
  signs: [
    { keywords: 'bold, enterprising, impatient', how: 'boldly, directly and with initiative; taking the first step may come easily', about: 'Aries is the cardinal fire sign: associated with starting, courage and competition.' },
    { keywords: 'steady, patient, sensual', how: 'calmly, patiently and in a lasting way; you may look for security and tangible results', about: 'Taurus is the fixed earth sign: associated with stability, the senses and resources.' },
    { keywords: 'curious, quick, communicative', how: 'with curiosity, agility and plenty of conversation; variety and exchange of ideas may feed you', about: 'Gemini is the mutable air sign: associated with curiosity, communication and versatility.' },
    { keywords: 'emotional, protective, intuitive', how: 'emotionally, protectively and intuitively; belonging and closeness may matter a great deal', about: 'Cancer is the cardinal water sign: associated with home, family, feeling and care.' },
    { keywords: 'proud, creative, generous', how: 'warmly, creatively and with flair; you may want to be seen and appreciated', about: 'Leo is the fixed fire sign: associated with creativity, the heart, play and the stage.' },
    { keywords: 'precise, analytical, helpful', how: 'carefully, analytically and with attention to detail; usefulness and order may bring you ease', about: 'Virgo is the mutable earth sign: associated with analysis, service, health and skill.' },
    { keywords: 'harmonious, diplomatic, aesthetic', how: 'gracefully, diplomatically and with balance; you may look for fairness and cooperation', about: 'Libra is the cardinal air sign: associated with relationships, balance, beauty and justice.' },
    { keywords: 'intense, passionate, deep', how: 'intensely, passionately and in depth; the superficial may not satisfy you', about: 'Scorpio is the fixed water sign: associated with passion, transformation, secrets and shared resources.' },
    { keywords: 'optimistic, free, philosophical', how: 'optimistically, enthusiastically and freely; you may seek meaning and wider horizons', about: 'Sagittarius is the mutable fire sign: associated with belief, philosophy, travel and learning.' },
    { keywords: 'disciplined, ambitious, serious', how: 'seriously, with discipline and a clear goal; over time you may build something solid', about: 'Capricorn is the cardinal earth sign: associated with goals, responsibility, structure and status.' },
    { keywords: 'independent, original, idealistic', how: 'originally, independently and inventively; community and ideas about the future may excite you', about: 'Aquarius is the fixed air sign: associated with freedom, community, innovation and ideals.' },
    { keywords: 'sensitive, dreamy, compassionate', how: 'sensitively, intuitively and with compassion; your imagination may be strong and boundaries may blur at times', about: 'Pisces is the mutable water sign: associated with intuition, compassion, imagination and surrender.' }
  ],
  houses: [
    { keywords: 'self, body, beginnings', where: 'may show up most in your personality, body and approach to life', about: '1st house: self, appearance, body and first impressions.' },
    { keywords: 'money, possessions, self-worth', where: 'may show up most in money, possessions and self-worth', about: '2nd house: income, possessions, talents and self-worth.' },
    { keywords: 'communication, siblings, neighbourhood', where: 'may show up most through communication, learning, siblings and your close surroundings', about: '3rd house: communication, siblings, neighbours, short trips and early education.' },
    { keywords: 'home, family, roots', where: 'may show up most in home, family, roots and your inner world', about: '4th house: home, family, roots and a parent.' },
    { keywords: 'creativity, romance, children', where: 'may show up most in creativity, romance, fun and children', about: '5th house: creativity, love affairs, play, hobbies and children.' },
    { keywords: 'work, health, daily routine', where: 'may show up most in daily work, routines and health habits', about: '6th house: daily work, service, health, routines and pets.' },
    { keywords: 'partnership, marriage, open rivals', where: 'may show up most in marriage, partnerships and one-to-one relationships', about: '7th house: marriage, partnerships, contracts and open rivals.' },
    { keywords: 'transformation, shared resources, crises', where: 'may show up most in transformation, intimacy and shared resources', about: '8th house: shared money, inheritance, debts, intimacy, crisis and transformation.' },
    { keywords: 'belief, travel, higher learning', where: 'may show up most in higher learning, travel, beliefs and your philosophy of life', about: '9th house: higher learning, long journeys, belief, law and publishing.' },
    { keywords: 'career, status, goals', where: 'may show up most in your career, public standing and goals', about: '10th house: career, reputation, public role and authority.' },
    { keywords: 'friends, community, hopes', where: 'may show up most in friendships, groups and hopes for the future', about: '11th house: friends, groups, networks, hopes and wishes.' },
    { keywords: 'unconscious, retreat, the hidden', where: 'may show up most in your inner world, the unconscious and behind the scenes', about: '12th house: the unconscious, retreat, hidden matters and spiritual search.' }
  ],
  aspects: {
    conjunction: 'The two principles may merge and work together; the effect can be strong and may feel easy or challenging depending on the planets.',
    opposition: 'The two principles may pull in opposite directions; a need for balance may arise, often experienced through relationships.',
    trine: 'The two principles may flow easily and naturally; this can feel like an innate talent or ease.',
    square: 'The two principles may push against each other; this can create tension and friction but may also spur action and growth.',
    sextile: 'The two principles may support each other; opportunities can open up when some effort is made.',
    quincunx: 'The two principles may have little in common; ongoing adjustment may be needed.',
    semisextile: 'A light link; small adjustments and quiet opportunities may exist between the two principles.',
    semisquare: 'A mild tension; it may bring inner restlessness and small frictions.',
    sesquiquadrate: 'A mild but persistent tension; it may bring unexpected strain now and then.',
    quintile: 'A creative link; it may point to a distinctive talent.',
    biquintile: 'A creative link; it may point to an original talent that emerges with maturity.'
  },
  sunSign: [
    'An Aries Sun may point to a pioneering, courageous spirit. Starting things, competing and forging your own path may energise you; balancing impatience can be an area of growth.',
    'A Taurus Sun may point to a calm, steady and dependable nature. You may want to build tangible, lasting things and enjoy life; resistance to change can be a challenge.',
    'A Gemini Sun may point to a curious, versatile nature. Learning, talking and linking ideas may keep you lively; scattered focus can be something to watch.',
    'A Cancer Sun may point to an emotional, protective and loyal nature. Family, home and close bonds may sit at the heart of your identity; vulnerability can be challenging at times.',
    'A Leo Sun may point to a warm, creative and generous nature. You may want to express what comes from the heart and be appreciated; balancing the need for approval can matter.',
    'A Virgo Sun may point to a careful, hard-working and helpful nature. Seeing the details and being useful may give you meaning; over-criticism and worry can be areas of growth.',
    'A Libra Sun may point to a graceful, fair and harmony-seeking nature. Relationships, cooperation and beauty may be central; difficulty deciding can call for attention.',
    'A Scorpio Sun may point to an intense, passionate and deep nature. Getting to the truth and emerging stronger from crises may feel natural; a need for control can be challenging.',
    'A Sagittarius Sun may point to an optimistic, free-spirited and adventurous nature. Seeking meaning, travelling and learning may bring you alive; balancing excess can matter.',
    'A Capricorn Sun may point to a serious, ambitious and responsible nature. Setting long-term goals and advancing step by step can be a strength; rigidity and overwork can be areas of growth.',
    'An Aquarius Sun may point to an independent, original and forward-looking nature. Being different and generating new ideas may define you; emotional distance can call for attention.',
    'A Pisces Sun may point to a sensitive, intuitive and compassionate nature. Imagination, art and helping others may nourish you; setting boundaries can be hard at times.'
  ],
  moonSign: [
    'An Aries Moon may point to feelings that are lived quickly and directly. Anger can flare and fade fast; taking action may bring emotional relief.',
    'A Taurus Moon may point to emotional calm and steadiness. Security, comfort and physical closeness may soothe you; sudden changes can be unsettling.',
    'A Gemini Moon may point to processing feelings by talking and thinking. Conversation and variety may do you good; there can be a tendency to analyse feelings from a distance.',
    'A Cancer Moon (in its own sign) may point to deep emotional sensitivity. Home and caring may be core needs; moods can fluctuate easily.',
    'A Leo Moon may point to a need for love and attention. Being appreciated and creative expression may make you happy; being ignored can hurt.',
    'A Virgo Moon may point to balancing feelings through order and useful work. Putting things right may calm you; there can be a tendency to worry or self-criticise.',
    'A Libra Moon may point to a search for harmony and peace. Balanced relationships and kindness may do you good; you may hold back feelings to avoid conflict.',
    'A Scorpio Moon may point to feelings that run intense and deep. Trust and loyalty may be vital; hurts can stay with you for a long time.',
    'A Sagittarius Moon may point to emotional optimism and a need for freedom. Movement and adventure may relax you; feeling restricted can be stifling.',
    'A Capricorn Moon may point to feelings that are controlled and measured. Taking responsibility may make you feel secure; showing feelings can be hard.',
    'An Aquarius Moon may point to a detached, rational approach to feelings. Friendship and being yourself may matter a lot; intense emotional demands can push you away.',
    'A Pisces Moon may point to strong empathy and intuition. You may easily sense what others feel; solitude, music and art may do you good.'
  ],
  ascSign: [
    'An Aries Ascendant may give an energetic, direct and assertive first impression. You may approach life with courage and speed.',
    'A Taurus Ascendant may give a calm, reassuring first impression. You may approach life cautiously and steadily, without rushing.',
    'A Gemini Ascendant may give a lively, talkative and curious first impression. You may approach life mentally and adapt quickly.',
    'A Cancer Ascendant may give a warm, protective and sensitive first impression. You may approach life through feeling and open up once you trust.',
    'A Leo Ascendant may give a bright, confident and charismatic first impression. You may approach life creatively and be easily noticed.',
    'A Virgo Ascendant may give a tidy, measured and attentive first impression. You may approach life analytically and practically.',
    'A Libra Ascendant may give a graceful, polite and agreeable first impression. You may approach life through relationships and balance.',
    'A Scorpio Ascendant may give an intense, mysterious and striking first impression. You may approach life with depth and caution.',
    'A Sagittarius Ascendant may give a cheerful, frank and adventurous first impression. You may approach life with optimism and curiosity.',
    'A Capricorn Ascendant may give a serious, mature and reliable first impression. You may approach life through responsibility and goals.',
    'An Aquarius Ascendant may give an original, friendly but somewhat detached first impression. You may approach life independently and inventively.',
    'A Pisces Ascendant may give a gentle, dreamy and compassionate first impression. You may approach life intuitively and pick up the mood around you.'
  ],
  elements: {
    fire: ['Fire emphasis may point to an enthusiastic, eager and action-oriented nature.', 'Little fire: consciously nurturing motivation and confidence may help.'],
    earth: ['Earth emphasis may point to a practical, patient and results-oriented nature.', 'Little earth: making time for routine, the body and practical matters may help.'],
    air: ['Air emphasis may point to a mental, social and communicative nature.', 'Little air: putting feelings into words and stepping back to reflect may feel harder.'],
    water: ['Water emphasis may point to an emotional, intuitive and empathic nature.', 'Little water: setting time aside to notice and express feelings may help.']
  },
  retro: 'Retrograde: this planet’s themes may be lived in a more inward, reflective and individual way.',
  glossary: [
    ['Planet', 'Planets describe the “what”: basic principles such as feelings, will, love and drive.'],
    ['Sign', 'The sign describes the “how”: the style in which a planet’s energy may be expressed.'],
    ['House', 'The house describes the “where”: the area of life (work, family, relationships…) where that energy may come to the fore.'],
    ['Aspect', 'The angular distance between two planets; it describes their relationship (harmony, tension, fusion).'],
    ['Orb', 'How far an aspect is from exact; the smaller the orb, the stronger the aspect is considered.'],
    ['Ascendant', 'The sign rising in the east at birth. It needs an accurate birth time; read it with care if the time is uncertain.'],
    ['Transit', 'How the planets’ current (or chosen) positions relate to the birth chart.'],
    ['Retrograde', 'When a planet appears to move backwards as seen from Earth; traditionally a time of review.']
  ],
  disclaimer:
    'These texts describe general tendencies from the astrological tradition. They are for personal exploration and entertainment, not certainty or prediction, and are not a substitute for medical, legal, psychological or financial advice.'
}
