import type { MeaningSet } from './types'

/**
 * Leituras integradas em português (Brasil).
 * Regra: nada sobre a pessoa é afirmado como certo; usa-se "pode", "poderia", "tende a".
 */
export const pt: MeaningSet = {
  planets: {
    sun: { keywords: 'identidade, vontade, vitalidade', what: 'Você pode expressar sua identidade, sua vontade e sua vitalidade', subject: 'Sua identidade e sua vitalidade', about: 'Tradicionalmente o Sol simboliza o núcleo do ser, a vontade, a vitalidade e onde se deseja brilhar.' },
    moon: { keywords: 'emoções, segurança, hábitos', what: 'Você pode viver suas emoções, sua necessidade de segurança e suas reações instintivas', subject: 'Suas necessidades emocionais e sua busca por segurança', about: 'A Lua simboliza as emoções, o mundo interior, os hábitos, a mãe e o modo de se sentir seguro.' },
    mercury: { keywords: 'pensamento, comunicação, aprendizado', what: 'Você pode pensar, aprender e se comunicar', subject: 'Sua mente e seu jeito de se comunicar', about: 'Mercúrio é associado à mente, à fala, à escrita, ao aprendizado, ao comércio e ao ambiente próximo.' },
    venus: { keywords: 'amor, harmonia, prazer, valores', what: 'Você pode amar, aproveitar a vida e se relacionar', subject: 'Seu jeito de amar e sua busca por harmonia e prazer', about: 'Vênus é associada ao amor, à atração, à beleza, aos relacionamentos, ao dinheiro e ao que se valoriza.' },
    mars: { keywords: 'desejo, coragem, impulso', what: 'Você pode ir atrás dos seus desejos e usar sua coragem e seu impulso', subject: 'Sua energia e seu espírito de luta', about: 'Marte é associado ao desejo, ao impulso de agir, à competição, à raiva e à sexualidade.' },
    jupiter: { keywords: 'crescimento, fé, sorte', what: 'Você pode buscar crescimento, sentido e oportunidades', subject: 'Sua sorte e seu potencial de crescimento', about: 'Júpiter é associado à expansão, ao otimismo, às crenças, aos estudos superiores, às viagens e à abundância.' },
    saturn: { keywords: 'responsabilidade, limites, maturidade', what: 'Você pode lidar com responsabilidades, limites e disciplina', subject: 'Suas responsabilidades e seu caminho de amadurecimento', about: 'Saturno é associado à estrutura, à disciplina, ao tempo, às provas, aos medos e ao sucesso conquistado com esforço.' },
    uranus: { keywords: 'liberdade, inovação, mudança', what: 'Você pode expressar sua necessidade de liberdade e de ser diferente', subject: 'Sua busca por liberdade e seu lado inovador', about: 'Urano é associado à mudança repentina, à liberdade, à individualidade, à tecnologia e à quebra de padrões.' },
    neptune: { keywords: 'sonhos, intuição, transcendência', what: 'Você pode viver seus sonhos, intuições e ideais', subject: 'Sua imaginação e sua busca espiritual', about: 'Netuno é associado à imaginação, à intuição, à compaixão, à arte, à espiritualidade e à ilusão.' },
    pluto: { keywords: 'transformação, poder, profundidade', what: 'Você pode usar seu poder de transformação e suas paixões profundas', subject: 'Seu poder de transformação e suas paixões profundas', about: 'Plutão é associado à crise, ao renascimento, ao poder, ao controle e às profundezas do inconsciente.' },
    node: { keywords: 'direção de crescimento, propósito', what: 'Você pode seguir sua direção de crescimento nesta vida', subject: 'Sua direção de crescimento e seu senso de propósito', about: 'O Nodo Norte simboliza a direção que, segundo a tradição, ajuda a crescer; o Nodo Sul, a zona de conforto conhecida.' },
    snode: { keywords: 'hábito, passado, zona de conforto', what: 'Você pode se apoiar em talentos conhecidos e na sua zona de conforto', subject: 'Seus talentos inatos e seus hábitos', about: 'O Nodo Sul simboliza padrões antigos e talentos prontos aos quais se recorre com facilidade.' },
    chiron: { keywords: 'ferida, cura, sabedoria', what: 'Você pode encarar suas feridas e usar sua capacidade de curar', subject: 'Suas feridas e seu dom de cura', about: 'Quíron simboliza uma sensibilidade profunda e o potencial de ajudar outros a se curar ao fazer as pazes com ela.' },
    lilith: { keywords: 'desejo reprimido, rebeldia', what: 'Você pode expressar seus desejos reprimidos e seu lado indomável', subject: 'Seus desejos reprimidos e seu lado rebelde', about: 'Lilith (Lua Negra) simboliza instintos reprimidos ou rejeitados, mas poderosos.' },
    fortune: { keywords: 'sorte, bem-estar físico e material', what: 'Você pode encontrar a sorte e formas de se sentir bem', subject: 'Sua sorte e suas fontes de bem-estar', about: 'A Parte da Fortuna é calculada com o Sol, a Lua e o Ascendente; simboliza onde o bem-estar pode fluir com facilidade.' },
    asc: { keywords: 'personalidade, corpo, primeira impressão', what: 'Você pode se apresentar ao mundo', subject: 'Sua aparência e sua primeira impressão', about: 'O Ascendente é o signo que sobe no leste no nascimento; é associado à personalidade, ao corpo e à primeira impressão.' },
    mc: { keywords: 'carreira, papel público, metas', what: 'Você pode buscar suas metas profissionais e sua posição pública', subject: 'Sua carreira e seu papel público', about: 'O Meio do Céu (MC) é o ponto mais alto do mapa; é associado à carreira, à reputação e às metas de vida.' }
  },
  signs: [
    { keywords: 'ousado, empreendedor, impaciente', how: 'com coragem, de forma direta e com iniciativa; dar o primeiro passo pode ser fácil para você', about: 'Áries é o signo cardinal de fogo: associado ao começo, à coragem e à competição.' },
    { keywords: 'estável, paciente, sensual', how: 'com calma, paciência e de forma duradoura; você pode buscar segurança e resultados concretos', about: 'Touro é o signo fixo de terra: associado à estabilidade, aos sentidos e aos recursos.' },
    { keywords: 'curioso, ágil, comunicativo', how: 'com curiosidade, agilidade e muita conversa; a variedade e a troca de ideias podem nutrir você', about: 'Gêmeos é o signo mutável de ar: associado à curiosidade, à comunicação e à versatilidade.' },
    { keywords: 'emotivo, protetor, intuitivo', how: 'de forma emotiva, protetora e intuitiva; pertencimento e proximidade podem importar muito', about: 'Câncer é o signo cardinal de água: associado ao lar, à família, ao sentimento e ao cuidado.' },
    { keywords: 'orgulhoso, criativo, generoso', how: 'com calor, criatividade e estilo; você pode desejar ser visto e apreciado', about: 'Leão é o signo fixo de fogo: associado à criatividade, ao coração, ao jogo e ao palco.' },
    { keywords: 'preciso, analítico, prestativo', how: 'com cuidado, análise e atenção aos detalhes; utilidade e ordem podem trazer tranquilidade', about: 'Virgem é o signo mutável de terra: associado à análise, ao serviço, à saúde e à habilidade.' },
    { keywords: 'harmonioso, diplomático, estético', how: 'com elegância, diplomacia e equilíbrio; você pode buscar justiça e cooperação', about: 'Libra é o signo cardinal de ar: associado aos relacionamentos, ao equilíbrio, à beleza e à justiça.' },
    { keywords: 'intenso, apaixonado, profundo', how: 'com intensidade, paixão e profundidade; o superficial pode não satisfazer você', about: 'Escorpião é o signo fixo de água: associado à paixão, à transformação, aos segredos e aos recursos compartilhados.' },
    { keywords: 'otimista, livre, filosófico', how: 'com otimismo, entusiasmo e liberdade; você pode buscar sentido e horizontes mais amplos', about: 'Sagitário é o signo mutável de fogo: associado às crenças, à filosofia, às viagens e ao aprendizado.' },
    { keywords: 'disciplinado, ambicioso, sério', how: 'com seriedade, disciplina e uma meta clara; com o tempo você pode construir algo sólido', about: 'Capricórnio é o signo cardinal de terra: associado às metas, à responsabilidade, à estrutura e ao status.' },
    { keywords: 'independente, original, idealista', how: 'de forma original, independente e inovadora; comunidade e ideias de futuro podem entusiasmar você', about: 'Aquário é o signo fixo de ar: associado à liberdade, à comunidade, à inovação e aos ideais.' },
    { keywords: 'sensível, sonhador, compassivo', how: 'com sensibilidade, intuição e compaixão; sua imaginação pode ser forte e os limites podem ficar difusos às vezes', about: 'Peixes é o signo mutável de água: associado à intuição, à compaixão, à imaginação e à entrega.' }
  ],
  houses: [
    { keywords: 'eu, corpo, começos', where: 'podem se manifestar sobretudo na sua personalidade, no seu corpo e no seu jeito de encarar a vida', about: 'Casa 1: o eu, a aparência, o corpo e a primeira impressão.' },
    { keywords: 'dinheiro, bens, autoestima', where: 'podem se manifestar sobretudo no dinheiro, nos bens e na autoestima', about: 'Casa 2: renda, bens, talentos e autoestima.' },
    { keywords: 'comunicação, irmãos, ambiente próximo', where: 'podem se manifestar sobretudo na comunicação, no aprendizado, nos irmãos e no seu ambiente próximo', about: 'Casa 3: comunicação, irmãos, vizinhos, viagens curtas e educação básica.' },
    { keywords: 'lar, família, raízes', where: 'podem se manifestar sobretudo no lar, na família, nas raízes e no seu mundo interior', about: 'Casa 4: lar, família, raízes e um dos pais.' },
    { keywords: 'criatividade, romance, filhos', where: 'podem se manifestar sobretudo na criatividade, no romance, na diversão e nos filhos', about: 'Casa 5: criatividade, romances, lazer, hobbies e filhos.' },
    { keywords: 'trabalho, saúde, rotina', where: 'podem se manifestar sobretudo no trabalho diário, nas rotinas e nos hábitos de saúde', about: 'Casa 6: trabalho diário, serviço, saúde, rotinas e animais de estimação.' },
    { keywords: 'parceria, casamento, rivais declarados', where: 'podem se manifestar sobretudo no casamento, nas parcerias e nas relações um a um', about: 'Casa 7: casamento, parcerias, contratos e rivais declarados.' },
    { keywords: 'transformação, recursos compartilhados, crises', where: 'podem se manifestar sobretudo na transformação, na intimidade e nos recursos compartilhados', about: 'Casa 8: dinheiro compartilhado, herança, dívidas, intimidade, crise e transformação.' },
    { keywords: 'crenças, viagens, estudos superiores', where: 'podem se manifestar sobretudo nos estudos superiores, nas viagens, nas crenças e na sua filosofia de vida', about: 'Casa 9: estudos superiores, viagens longas, crenças, leis e publicações.' },
    { keywords: 'carreira, status, metas', where: 'podem se manifestar sobretudo na sua carreira, na sua posição pública e nas suas metas', about: 'Casa 10: carreira, reputação, papel público e autoridade.' },
    { keywords: 'amigos, comunidade, esperanças', where: 'podem se manifestar sobretudo nas amizades, nos grupos e nas esperanças para o futuro', about: 'Casa 11: amigos, grupos, redes, esperanças e desejos.' },
    { keywords: 'inconsciente, recolhimento, o oculto', where: 'podem se manifestar sobretudo no seu mundo interior, no inconsciente e nos bastidores', about: 'Casa 12: o inconsciente, o recolhimento, assuntos ocultos e a busca espiritual.' }
  ],
  aspects: {
    conjunction: 'Os dois princípios podem se fundir e trabalhar juntos; o efeito pode ser forte e parecer fácil ou desafiador conforme os planetas.',
    opposition: 'Os dois princípios podem puxar para lados opostos; pode surgir uma necessidade de equilíbrio, muitas vezes vivida nos relacionamentos.',
    trine: 'Os dois princípios podem fluir com facilidade e naturalidade; isso pode parecer um talento inato ou uma facilidade.',
    square: 'Os dois princípios podem se chocar; isso pode criar tensão e atrito, mas também estimular a ação e o crescimento.',
    sextile: 'Os dois princípios podem se apoiar; oportunidades podem surgir com algum esforço.',
    quincunx: 'Os dois princípios podem ter pouco em comum; pode ser preciso ajustar continuamente.',
    semisextile: 'Um vínculo leve; pode haver pequenos ajustes e oportunidades discretas entre os dois princípios.',
    semisquare: 'Uma tensão leve; pode trazer inquietação interior e pequenos atritos.',
    sesquiquadrate: 'Uma tensão leve mas persistente; pode trazer tensões inesperadas de vez em quando.',
    quintile: 'Um vínculo criativo; pode indicar um talento singular.',
    biquintile: 'Um vínculo criativo; pode indicar um talento original que surge com a maturidade.'
  },
  sunSign: [
    'Um Sol em Áries pode indicar um espírito pioneiro e corajoso. Começar coisas, competir e abrir o próprio caminho pode dar energia a você; equilibrar a impaciência pode ser uma área de crescimento.',
    'Um Sol em Touro pode indicar uma natureza calma, firme e confiável. Você pode querer construir coisas concretas e duradouras e aproveitar a vida; a resistência à mudança pode ser um desafio.',
    'Um Sol em Gêmeos pode indicar uma natureza curiosa e versátil. Aprender, conversar e ligar ideias pode manter você vivo; a dispersão pode ser algo a observar.',
    'Um Sol em Câncer pode indicar uma natureza emotiva, protetora e leal. A família, o lar e os laços próximos podem estar no centro da sua identidade; a vulnerabilidade pode pesar às vezes.',
    'Um Sol em Leão pode indicar uma natureza calorosa, criativa e generosa. Você pode querer expressar o que vem do coração e ser apreciado; equilibrar a necessidade de aprovação pode ser importante.',
    'Um Sol em Virgem pode indicar uma natureza cuidadosa, trabalhadora e prestativa. Ver os detalhes e ser útil pode dar sentido; autocrítica e preocupação em excesso podem ser áreas de crescimento.',
    'Um Sol em Libra pode indicar uma natureza elegante, justa e em busca de harmonia. Relacionamentos, cooperação e beleza podem ser centrais; a dificuldade de decidir pode pedir atenção.',
    'Um Sol em Escorpião pode indicar uma natureza intensa, apaixonada e profunda. Chegar à verdade e sair das crises mais forte pode ser natural; a necessidade de controle pode ser um desafio.',
    'Um Sol em Sagitário pode indicar uma natureza otimista, livre e aventureira. Buscar sentido, viajar e aprender pode trazer vida; equilibrar os excessos pode ser importante.',
    'Um Sol em Capricórnio pode indicar uma natureza séria, ambiciosa e responsável. Definir metas de longo prazo e avançar passo a passo pode ser uma força; rigidez e excesso de trabalho podem ser áreas de crescimento.',
    'Um Sol em Aquário pode indicar uma natureza independente, original e voltada ao futuro. Ser diferente e gerar novas ideias pode definir você; a distância emocional pode pedir atenção.',
    'Um Sol em Peixes pode indicar uma natureza sensível, intuitiva e compassiva. Imaginação, arte e ajudar os outros podem nutrir você; impor limites pode ser difícil às vezes.'
  ],
  moonSign: [
    'Uma Lua em Áries pode indicar emoções vividas de forma rápida e direta. A raiva pode surgir e passar depressa; agir pode trazer alívio emocional.',
    'Uma Lua em Touro pode indicar calma e estabilidade emocional. Segurança, conforto e proximidade física podem tranquilizar você; mudanças repentinas podem inquietar.',
    'Uma Lua em Gêmeos pode indicar que você processa as emoções falando e pensando. Conversa e variedade podem fazer bem; pode haver tendência a analisar os sentimentos de longe.',
    'Uma Lua em Câncer (no próprio signo) pode indicar grande sensibilidade emocional. Lar e cuidado podem ser necessidades básicas; o humor pode oscilar com facilidade.',
    'Uma Lua em Leão pode indicar necessidade de amor e atenção. Ser apreciado e a expressão criativa podem deixar você feliz; ser ignorado pode doer.',
    'Uma Lua em Virgem pode indicar que você equilibra as emoções com ordem e trabalho útil. Arrumar as coisas pode acalmar; pode haver tendência a se preocupar ou se criticar.',
    'Uma Lua em Libra pode indicar busca por harmonia e paz. Relações equilibradas e gentileza podem fazer bem; você pode guardar sentimentos para evitar conflitos.',
    'Uma Lua em Escorpião pode indicar emoções intensas e profundas. Confiança e lealdade podem ser vitais; mágoas podem ficar com você por muito tempo.',
    'Uma Lua em Sagitário pode indicar otimismo emocional e necessidade de liberdade. Movimento e aventura podem relaxar você; sentir-se limitado pode sufocar.',
    'Uma Lua em Capricórnio pode indicar emoções controladas e comedidas. Assumir responsabilidades pode trazer segurança; mostrar sentimentos pode ser difícil.',
    'Uma Lua em Aquário pode indicar uma abordagem distante e racional das emoções. Amizade e poder ser você mesmo podem importar muito; demandas emocionais intensas podem afastar você.',
    'Uma Lua em Peixes pode indicar forte empatia e intuição. Você pode perceber com facilidade o que os outros sentem; solidão, música e arte podem fazer bem.'
  ],
  ascSign: [
    'Um Ascendente em Áries pode passar uma primeira impressão enérgica, direta e decidida. Você pode encarar a vida com coragem e rapidez.',
    'Um Ascendente em Touro pode passar uma primeira impressão calma e tranquilizadora. Você pode encarar a vida com cautela e constância, sem pressa.',
    'Um Ascendente em Gêmeos pode passar uma primeira impressão viva, falante e curiosa. Você pode encarar a vida de forma mental e se adaptar rápido.',
    'Um Ascendente em Câncer pode passar uma primeira impressão calorosa, protetora e sensível. Você pode encarar a vida pelo sentimento e se abrir quando confia.',
    'Um Ascendente em Leão pode passar uma primeira impressão brilhante, confiante e carismática. Você pode encarar a vida com criatividade e ser notado com facilidade.',
    'Um Ascendente em Virgem pode passar uma primeira impressão organizada, comedida e atenta. Você pode encarar a vida de forma analítica e prática.',
    'Um Ascendente em Libra pode passar uma primeira impressão elegante, educada e agradável. Você pode encarar a vida pelos relacionamentos e pelo equilíbrio.',
    'Um Ascendente em Escorpião pode passar uma primeira impressão intensa, misteriosa e marcante. Você pode encarar a vida com profundidade e cautela.',
    'Um Ascendente em Sagitário pode passar uma primeira impressão alegre, franca e aventureira. Você pode encarar a vida com otimismo e curiosidade.',
    'Um Ascendente em Capricórnio pode passar uma primeira impressão séria, madura e confiável. Você pode encarar a vida pela responsabilidade e pelas metas.',
    'Um Ascendente em Aquário pode passar uma primeira impressão original, amigável mas um tanto distante. Você pode encarar a vida de forma independente e inovadora.',
    'Um Ascendente em Peixes pode passar uma primeira impressão suave, sonhadora e compassiva. Você pode encarar a vida com intuição e captar o clima ao redor.'
  ],
  elements: {
    fire: ['A ênfase em fogo pode indicar uma natureza entusiasmada, ávida e voltada para a ação.', 'Pouco fogo: cultivar conscientemente a motivação e a confiança pode ajudar.'],
    earth: ['A ênfase em terra pode indicar uma natureza prática, paciente e focada em resultados.', 'Pouca terra: reservar tempo para a rotina, o corpo e os assuntos práticos pode ajudar.'],
    air: ['A ênfase em ar pode indicar uma natureza mental, sociável e comunicativa.', 'Pouco ar: pôr os sentimentos em palavras e se afastar para refletir pode ser mais difícil.'],
    water: ['A ênfase em água pode indicar uma natureza emotiva, intuitiva e empática.', 'Pouca água: reservar tempo para perceber e expressar os sentimentos pode ajudar.']
  },
  retro: 'Retrógrado: os temas deste planeta podem ser vividos de forma mais interior, reflexiva e pessoal.',
  glossary: [
    ['Planeta', 'Os planetas descrevem o “quê”: princípios básicos como sentimentos, vontade, amor e impulso.'],
    ['Signo', 'O signo descreve o “como”: o estilo com que a energia de um planeta pode se expressar.'],
    ['Casa', 'A casa descreve o “onde”: a área da vida (trabalho, família, relacionamentos…) em que essa energia pode se destacar.'],
    ['Aspecto', 'A distância angular entre dois planetas; descreve a relação entre eles (harmonia, tensão, fusão).'],
    ['Orbe', 'Quanto um aspecto se afasta do valor exato; quanto menor o orbe, mais forte o aspecto é considerado.'],
    ['Ascendente', 'O signo que sobe no leste no nascimento. Precisa de uma hora de nascimento exata; leia com cuidado se a hora for incerta.'],
    ['Trânsito', 'Como as posições atuais (ou escolhidas) dos planetas se relacionam com o mapa natal.'],
    ['Retrógrado', 'Quando um planeta parece andar para trás visto da Terra; tradicionalmente, um tempo de revisão.']
  ],
  disclaimer:
    'Estes textos descrevem tendências gerais da tradição astrológica. São para autoconhecimento e entretenimento, não certezas nem previsões, e não substituem aconselhamento médico, jurídico, psicológico ou financeiro.'
}
