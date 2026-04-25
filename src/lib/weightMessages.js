// Banque de messages d'encouragement pour la saisie de poids
// FR par défaut, PL pour les comptes dont l'email contient "klaudia"

export const isPolish = (email) => {
  if (!email) return false
  return email.toLowerCase().includes('klaudia')
}

const fr = {
  loss: [
    "Bravo ! Chaque gramme perdu, c'est une victoire 💪",
    "Excellent — la régularité paye, on le voit là 🌿",
    "La balance descend, c'est exactement ce qu'on voulait !",
    "Le travail commence à se voir. Continue comme ça !",
    "Tu fais du bon boulot, vraiment. Garde le rythme.",
    "Bien joué ! Le corps suit quand on lui parle bien.",
    "C'est beau à voir, cette descente. On signe pour la même la semaine prochaine ?",
    "Voilà, on avance. Pas après pas, kilo après kilo.",
    "Tes efforts portent leurs fruits, c'est concret là, dans le chiffre.",
    "Top ! Tu peux être fier(e) de toi sur ce coup.",
  ],
  gain: [
    "Petite remontée — ça arrive, c'est pas la guerre. On reste focus.",
    "Une fluctuation, rien de plus. On reprend le rythme dès le prochain repas.",
    "On en a vu d'autres ! Hydrate-toi, repose-toi, et on repart.",
    "C'est pas un drame, c'est un signal. On ajuste et on y retourne !",
    "Allez, on remet ça d'aplomb. T'es plus fort(e) qu'une montée passagère.",
    "La balance est capricieuse, ton plan reste solide. Continue !",
    "Stop l'auto-flagellation, on regarde devant et on bosse.",
    "OK, on a vu. Maintenant on agit. Prochain objectif : faire mieux demain.",
    "Petit reset mental et on repart. Tu sais ce que tu veux.",
    "Une journée à la fois. Demain on serre les boulons.",
  ],
  same: [
    "Stable ! Le corps réfléchit, c'est normal. On garde le cap.",
    "Pareil qu'avant — la persévérance paye toujours, tiens bon.",
    "On stagne ? Pas grave, on continue, ça va bouger.",
    "Patience : la balance bougera, fais-toi confiance.",
  ],
  first: [
    "Premier poids enregistré ! C'est parti, on suit ça ensemble 🌿",
    "Bienvenue sur le suivi ! Le plus dur, c'était de commencer — c'est fait.",
    "Première pesée : on a un point de départ. En route !",
  ],
  remaining: [
    "Plus que {n} kg à dégommer. On lâche rien !",
    "{n} kg avant l'objectif. Allez allez allez, on serre les fesses !",
    "{n} kg à faire tomber. T'as ce qu'il faut dans les jambes.",
    "Reste {n} kg. C'est jouable, c'est même attrapable bientôt.",
    "{n} kg sur la ligne d'arrivée. Bouge, t'es presque dedans !",
    "Encore {n} kg. Pas le moment de ralentir, on accélère !",
    "{n} kg à virer. On fait pas demi-tour si près du but.",
    "{n} kg restants. La discipline maintenant, la fierté plus tard.",
    "Plus que {n} kg. On signe pour le double d'efforts cette semaine ?",
    "{n} kg avant le bonheur de la balance. On force !",
  ],
  reached: [
    "🎯 OBJECTIF ATTEINT — t'es arrivé(e) ! Profite du moment.",
    "🎯 C'est fait ! Tu as touché ton objectif. Respect total.",
    "🎯 Cible atteinte ! Maintenant on stabilise — mais d'abord on savoure.",
  ],
  belowTarget: [
    "Tu es même passé(e) sous l'objectif ! Maintenant on consolide.",
    "Sous la cible — joli ! On stabilise sans relâcher complètement.",
    "Mission accomplie, et même au-delà. Bravo !",
  ],
  ui: {
    title_loss: 'Bravo !',
    title_gain: 'Petite remontée',
    title_same: 'Stable',
    title_first: "C'est parti !",
    title_done: 'OBJECTIF !',
    close: 'OK, on continue !',
  },
}

const pl = {
  loss: [
    "Brawo! Każdy stracony gram to zwycięstwo 💪",
    "Świetnie — regularność popłaca, widać to 🌿",
    "Waga spada, dokładnie o to chodziło!",
    "Praca zaczyna być widoczna. Tak trzymaj!",
    "Robisz świetną robotę, naprawdę. Utrzymaj tempo.",
    "Brawo! Ciało słucha, gdy mówisz do niego z głową.",
    "Pięknie patrzeć na ten spadek. W przyszłym tygodniu to samo?",
    "Idziemy do przodu, krok po kroku, kilogram po kilogramie.",
    "Twoje wysiłki przynoszą efekty — to konkret, widać na wadze.",
    "Super! Możesz być z siebie dumna na tej wadze.",
  ],
  gain: [
    "Mały wzrost — zdarza się, to nie wojna. Skupiamy się dalej.",
    "Wahanie, nic więcej. Wracamy do rytmu od następnego posiłku.",
    "Bywało gorzej! Nawodnij się, odpocznij i ruszamy.",
    "To nie tragedia, to sygnał. Korygujemy i działamy dalej!",
    "No dawaj, podnosimy się. Jesteś silniejsza niż chwilowy wzrost.",
    "Waga jest kapryśna, twój plan jest solidny. Dalej!",
    "Stop biczowaniu się — patrzymy do przodu i pracujemy.",
    "OK, widzimy. Teraz działamy. Cel: jutro zrobić lepiej.",
    "Mały mentalny reset i ruszamy. Wiesz, czego chcesz.",
    "Dzień po dniu. Jutro przykręcamy śrubę.",
  ],
  same: [
    "Stabilnie! Ciało myśli, to normalne. Trzymamy kurs.",
    "Tak samo jak wcześniej — wytrwałość zawsze popłaca.",
    "Stoimy w miejscu? Nic strasznego, dalej, ruszy się.",
    "Cierpliwości — waga się ruszy, zaufaj sobie.",
  ],
  first: [
    "Pierwszy zapis wagi! Ruszamy, śledzimy to razem 🌿",
    "Witamy w monitoringu! Najtrudniejsze za nami — początek.",
    "Pierwsze ważenie: mamy punkt startu. W drogę!",
  ],
  remaining: [
    "Jeszcze {n} kg do zrzucenia. Nie odpuszczamy!",
    "{n} kg do celu. Dawaj, dawaj, zaciskamy zęby!",
    "{n} kg do zrzucenia. Masz to w nogach.",
    "Zostało {n} kg. Da się, już prawie!",
    "{n} kg na linii mety. Ruszaj, jesteś prawie tam!",
    "Jeszcze {n} kg. Nie czas zwalniać — przyspieszamy!",
    "{n} kg do skreślenia. Nie zawracamy tak blisko celu.",
    "Zostało {n} kg. Teraz dyscyplina, potem duma.",
    "Jeszcze {n} kg. Podwójny wysiłek w tym tygodniu?",
    "{n} kg przed radością z wagi. Dociskamy!",
  ],
  reached: [
    "🎯 CEL OSIĄGNIĘTY — udało się! Ciesz się tą chwilą.",
    "🎯 Zrobione! Osiągnęłaś cel. Pełen szacunek.",
    "🎯 Cel zdobyty! Teraz stabilizujemy — ale najpierw świętujemy.",
  ],
  belowTarget: [
    "Jesteś nawet poniżej celu! Teraz konsolidujemy.",
    "Poniżej celu — pięknie! Stabilizujemy bez całkowitego luzowania.",
    "Misja wykonana, a nawet więcej. Brawo!",
  ],
  ui: {
    title_loss: 'Brawo!',
    title_gain: 'Mały wzrost',
    title_same: 'Stabilnie',
    title_first: 'Ruszamy!',
    title_done: 'CEL!',
    close: 'OK, dalej!',
  },
}

const pickRandom = (arr) => arr[Math.floor(Math.random() * arr.length)]

const formatKg = (n) => {
  // 1 décimale, virgule pour FR, virgule aussi pour PL (les deux utilisent la virgule décimale)
  return n.toFixed(1).replace('.', ',')
}

/**
 * Construit le message à afficher après une saisie de poids.
 *
 * @param {object} args
 * @param {object} args.user - user Supabase (pour détecter la langue via email)
 * @param {number|null} args.previousWeight - poids le plus récent strictement avant la nouvelle saisie (null si premier)
 * @param {number} args.newWeight - poids qui vient d'être saisi (en kg)
 * @param {number|null} args.targetWeight - poids cible défini dans les goals (null si pas défini)
 * @returns {{title: string, body: string, mood: 'good'|'warning'|'neutral', closeLabel: string}}
 */
export function buildWeightMessage({ user, previousWeight, newWeight, targetWeight }) {
  const lang = isPolish(user?.email) ? pl : fr
  const ui = lang.ui
  const target = targetWeight ? Number(targetWeight) : null

  // Helper pour ajouter le rappel "kg restants" si pertinent
  const appendRemaining = (body) => {
    if (target && newWeight > target + 0.05) {
      const diff = formatKg(newWeight - target)
      return body + '\n\n' + pickRandom(lang.remaining).replace('{n}', diff)
    }
    return body
  }

  // Cas 1 : objectif atteint (poids ≤ cible)
  if (target && newWeight <= target + 0.05) {
    if (newWeight < target - 0.05) {
      return { title: ui.title_done, body: pickRandom(lang.belowTarget), mood: 'good', closeLabel: ui.close }
    }
    return { title: ui.title_done, body: pickRandom(lang.reached), mood: 'good', closeLabel: ui.close }
  }

  // Cas 2 : premier poids
  if (previousWeight == null) {
    return {
      title: ui.title_first,
      body: appendRemaining(pickRandom(lang.first)),
      mood: 'neutral',
      closeLabel: ui.close,
    }
  }

  const delta = +(newWeight - previousWeight).toFixed(2)

  // Cas 3 : perte
  if (delta < -0.05) {
    return {
      title: ui.title_loss,
      body: appendRemaining(pickRandom(lang.loss)),
      mood: 'good',
      closeLabel: ui.close,
    }
  }

  // Cas 4 : prise
  if (delta > 0.05) {
    return {
      title: ui.title_gain,
      body: appendRemaining(pickRandom(lang.gain)),
      mood: 'warning',
      closeLabel: ui.close,
    }
  }

  // Cas 5 : stable
  return {
    title: ui.title_same,
    body: appendRemaining(pickRandom(lang.same)),
    mood: 'neutral',
    closeLabel: ui.close,
  }
}
