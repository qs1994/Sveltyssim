// Module simple de traduction FR / PL.
// PL est activé si l'email de l'utilisateur contient "klaudia" (insensible à la casse).
import { isPolish } from './weightMessages'

const dict = {
  fr: {
    // Nav
    nav_home: 'Accueil',
    nav_weight: 'Poids',
    nav_meas: 'Mesures',
    nav_workout: 'Muscu',
    nav_profile: 'Profil',
    nav_fasting: 'Jeûne',
    nav_food: 'Aliments',

    // Commun
    back: '←',
    save: 'Sauver',
    saved: '✅',
    saving: '⏳',
    cancel: 'Annuler',
    confirm: 'Valider',
    delete: 'Supprimer',
    edit: 'Modifier',
    add: 'Ajouter',
    name: 'Nom',
    today: "Aujourd'hui",

    // Mensurations
    meas_title: 'Mensurations',
    meas_add: '📏 Nouvelle prise de mesure',
    meas_no_zones: "Tu n'as pas encore de zones définies.",
    meas_setup_zones: '⚙️ Configurer mes zones',
    meas_prefill: '✨ Pré-remplir avec zones classiques',
    meas_input_hint: 'Laisse vide les zones que tu ne veux pas mesurer aujourd\'hui.',
    meas_save_all: 'Sauvegarder la séance',
    meas_no_data: 'Pas encore de données — ajoute une première prise pour démarrer.',
    meas_indices_title: 'Indices',
    meas_index_tronc: 'Tronc',
    meas_index_membres: 'Membres',
    meas_chart_title: 'Évolution (% vs. 1ère prise)',
    meas_chart_hint: 'Indices basés sur la variation moyenne par zone vs. la première mesure.',
    meas_history: 'Historique',
    meas_session_of: 'Prise du',
    meas_unit: 'cm',
    meas_session_saved: 'Mensurations enregistrées !',

    // Gestion des zones
    zones_title: 'Mes zones de mesure',
    zones_subtitle: 'Personnalise les parties du corps à suivre.',
    zones_add_new: '+ Ajouter une zone',
    zones_type_tronc: 'Tronc',
    zones_type_membres: 'Membres',
    zones_type_label: 'Type',
    zones_name_placeholder: 'Ex : Poitrine, Biceps, Cuisse...',
    zones_classic_set: 'Pré-remplir avec un set classique',
    zones_confirm_delete: 'Supprimer cette zone et toutes ses mesures ?',
    zones_empty: "Aucune zone définie pour l'instant.",

    // Pré-set classique (FR)
    classic_zones: [
      { name: 'Cou', zone_type: 'tronc' },
      { name: 'Épaules', zone_type: 'tronc' },
      { name: 'Poitrine', zone_type: 'tronc' },
      { name: 'Taille', zone_type: 'tronc' },
      { name: 'Hanches', zone_type: 'tronc' },
      { name: 'Bras', zone_type: 'membres' },
      { name: 'Biceps contracté', zone_type: 'membres' },
      { name: 'Avant-bras', zone_type: 'membres' },
      { name: 'Cuisse', zone_type: 'membres' },
      { name: 'Mollet', zone_type: 'membres' },
    ],
  },

  pl: {
    // Nav
    nav_home: 'Główna',
    nav_weight: 'Waga',
    nav_meas: 'Wymiary',
    nav_workout: 'Siłka',
    nav_profile: 'Profil',
    nav_fasting: 'Post',
    nav_food: 'Jedzenie',

    back: '←',
    save: 'Zapisz',
    saved: '✅',
    saving: '⏳',
    cancel: 'Anuluj',
    confirm: 'Zatwierdź',
    delete: 'Usuń',
    edit: 'Edytuj',
    add: 'Dodaj',
    name: 'Nazwa',
    today: 'Dziś',

    meas_title: 'Wymiary',
    meas_add: '📏 Nowy pomiar',
    meas_no_zones: 'Nie masz jeszcze zdefiniowanych stref.',
    meas_setup_zones: '⚙️ Skonfiguruj strefy',
    meas_prefill: '✨ Wypełnij klasycznymi strefami',
    meas_input_hint: 'Zostaw puste strefy, których dziś nie chcesz mierzyć.',
    meas_save_all: 'Zapisz sesję',
    meas_no_data: 'Brak danych — dodaj pierwszy pomiar, by zacząć.',
    meas_indices_title: 'Wskaźniki',
    meas_index_tronc: 'Tułów',
    meas_index_membres: 'Kończyny',
    meas_chart_title: 'Ewolucja (% vs. pierwszy pomiar)',
    meas_chart_hint: 'Wskaźniki oparte na średniej zmianie zon vs. pierwszy pomiar.',
    meas_history: 'Historia',
    meas_session_of: 'Pomiar z',
    meas_unit: 'cm',
    meas_session_saved: 'Pomiary zapisane!',

    zones_title: 'Moje strefy pomiaru',
    zones_subtitle: 'Dostosuj części ciała do śledzenia.',
    zones_add_new: '+ Dodaj strefę',
    zones_type_tronc: 'Tułów',
    zones_type_membres: 'Kończyny',
    zones_type_label: 'Typ',
    zones_name_placeholder: 'Np. Klatka, Biceps, Udo...',
    zones_classic_set: 'Wypełnij klasycznym zestawem',
    zones_confirm_delete: 'Usunąć tę strefę i wszystkie jej pomiary?',
    zones_empty: 'Brak zdefiniowanych stref.',

    classic_zones: [
      { name: 'Szyja', zone_type: 'tronc' },
      { name: 'Barki', zone_type: 'tronc' },
      { name: 'Klatka', zone_type: 'tronc' },
      { name: 'Talia', zone_type: 'tronc' },
      { name: 'Biodra', zone_type: 'tronc' },
      { name: 'Ramię', zone_type: 'membres' },
      { name: 'Biceps spięty', zone_type: 'membres' },
      { name: 'Przedramię', zone_type: 'membres' },
      { name: 'Udo', zone_type: 'membres' },
      { name: 'Łydka', zone_type: 'membres' },
    ],
  },
}

export function getLang(user) {
  return isPolish(user?.email) ? 'pl' : 'fr'
}

export function t(user, key) {
  const lang = getLang(user)
  return dict[lang]?.[key] ?? dict.fr[key] ?? key
}

// Locale tag pour Intl
export function locale(user) {
  return getLang(user) === 'pl' ? 'pl-PL' : 'fr-FR'
}
