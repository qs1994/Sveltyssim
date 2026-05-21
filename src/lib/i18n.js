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

    // Muscu
    workout_title: 'Go Muscu',
    workout_no_exos: "Aucun exercice dans ce groupe pour l'instant.",
    workout_setup: '⚙️ Gérer mes exercices',
    workout_prefill: '✨ Pré-remplir un set classique',
    workout_add_log: 'Enregistrer une perf',
    workout_weight: 'Poids',
    workout_reps: 'Reps',
    workout_unit_kg: 'kg',
    workout_last_perf: 'Dernière perf',
    workout_best: 'Meilleur',
    workout_logs_history: 'Historique',
    workout_progress: 'Progression (poids max par séance)',
    workout_log_saved: 'Perf enregistrée !',
    workout_no_logs: "Aucune perf enregistrée pour cet exercice.",
    workout_notes_placeholder: 'Notes (facultatif)',
    workout_delete_log: 'Supprimer cette perf ?',
    workout_global_indice: 'Indice muscu',
    workout_global_hint: 'Progression moyenne de tes charges max vs. ta toute première perf.',

    // Groupes musculaires
    mg_biceps: 'Biceps',
    mg_triceps: 'Triceps',
    mg_jambes: 'Jambes',
    mg_pecs: 'Pecs',
    mg_dos: 'Dos',
    mg_epaules: 'Épaules',

    // Catalogue d'exercices
    catalog_title: 'Catalogue d\'exercices',
    catalog_subtitle: 'Crée et gère ta liste d\'exos par groupe musculaire.',
    catalog_add: '+ Ajouter un exercice',
    catalog_empty: 'Aucun exercice dans le catalogue.',
    catalog_name_placeholder: 'Ex : Développé couché, Squat, Curl...',
    catalog_group_label: 'Groupe musculaire',
    catalog_confirm_delete: 'Supprimer cet exercice et tout son historique ?',

    // Liste classique d'exos (10-15 par groupe)
    classic_exercises: [
      // Biceps
      { name: 'Curl barre', muscle_group: 'biceps' },
      { name: 'Curl haltères', muscle_group: 'biceps' },
      { name: 'Curl marteau', muscle_group: 'biceps' },
      { name: 'Curl pupitre', muscle_group: 'biceps' },
      // Triceps
      { name: 'Dips', muscle_group: 'triceps' },
      { name: 'Extension poulie', muscle_group: 'triceps' },
      { name: 'Barre au front', muscle_group: 'triceps' },
      { name: 'Kickback', muscle_group: 'triceps' },
      // Jambes
      { name: 'Squat', muscle_group: 'jambes' },
      { name: 'Soulevé de terre', muscle_group: 'jambes' },
      { name: 'Presse à cuisses', muscle_group: 'jambes' },
      { name: 'Fentes', muscle_group: 'jambes' },
      { name: 'Mollets debout', muscle_group: 'jambes' },
      // Pecs
      { name: 'Développé couché', muscle_group: 'pecs' },
      { name: 'Développé incliné', muscle_group: 'pecs' },
      { name: 'Écarté haltères', muscle_group: 'pecs' },
      { name: 'Pompes', muscle_group: 'pecs' },
      // Dos
      { name: 'Tractions', muscle_group: 'dos' },
      { name: 'Rowing barre', muscle_group: 'dos' },
      { name: 'Tirage poulie', muscle_group: 'dos' },
      { name: 'Tirage horizontal', muscle_group: 'dos' },
      // Épaules
      { name: 'Développé militaire', muscle_group: 'epaules' },
      { name: 'Élévations latérales', muscle_group: 'epaules' },
      { name: 'Élévations frontales', muscle_group: 'epaules' },
      { name: 'Oiseau', muscle_group: 'epaules' },
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

    // Siłka
    workout_title: 'Siłka',
    workout_no_exos: 'Brak ćwiczeń w tej grupie.',
    workout_setup: '⚙️ Zarządzaj ćwiczeniami',
    workout_prefill: '✨ Wypełnij klasycznym zestawem',
    workout_add_log: 'Zapisz wynik',
    workout_weight: 'Ciężar',
    workout_reps: 'Powt.',
    workout_unit_kg: 'kg',
    workout_last_perf: 'Ostatni wynik',
    workout_best: 'Najlepszy',
    workout_logs_history: 'Historia',
    workout_progress: 'Postęp (maks. ciężar na sesję)',
    workout_log_saved: 'Wynik zapisany!',
    workout_no_logs: 'Brak zapisanych wyników dla tego ćwiczenia.',
    workout_notes_placeholder: 'Notatki (opcjonalnie)',
    workout_delete_log: 'Usunąć ten wynik?',
    workout_global_indice: 'Wskaźnik siłki',
    workout_global_hint: 'Średni postęp Twoich maksymalnych ciężarów vs. pierwszy wynik.',

    mg_biceps: 'Biceps',
    mg_triceps: 'Triceps',
    mg_jambes: 'Nogi',
    mg_pecs: 'Klatka',
    mg_dos: 'Plecy',
    mg_epaules: 'Barki',

    catalog_title: 'Katalog ćwiczeń',
    catalog_subtitle: 'Twórz i zarządzaj listą ćwiczeń wg grupy mięśniowej.',
    catalog_add: '+ Dodaj ćwiczenie',
    catalog_empty: 'Brak ćwiczeń w katalogu.',
    catalog_name_placeholder: 'Np. Wyciskanie, Przysiad, Uginanie...',
    catalog_group_label: 'Grupa mięśniowa',
    catalog_confirm_delete: 'Usunąć to ćwiczenie i całą jego historię?',

    classic_exercises: [
      { name: 'Uginanie ze sztangą', muscle_group: 'biceps' },
      { name: 'Uginanie z hantlami', muscle_group: 'biceps' },
      { name: 'Uginanie młotkowe', muscle_group: 'biceps' },
      { name: 'Uginanie na modlitewniku', muscle_group: 'biceps' },
      { name: 'Dipy', muscle_group: 'triceps' },
      { name: 'Prostowanie na wyciągu', muscle_group: 'triceps' },
      { name: 'Wyciskanie francuskie', muscle_group: 'triceps' },
      { name: 'Kickback', muscle_group: 'triceps' },
      { name: 'Przysiad', muscle_group: 'jambes' },
      { name: 'Martwy ciąg', muscle_group: 'jambes' },
      { name: 'Wyciskanie nogami', muscle_group: 'jambes' },
      { name: 'Wykroki', muscle_group: 'jambes' },
      { name: 'Łydki stojąc', muscle_group: 'jambes' },
      { name: 'Wyciskanie sztangi leżąc', muscle_group: 'pecs' },
      { name: 'Wyciskanie skos góra', muscle_group: 'pecs' },
      { name: 'Rozpiętki', muscle_group: 'pecs' },
      { name: 'Pompki', muscle_group: 'pecs' },
      { name: 'Podciąganie', muscle_group: 'dos' },
      { name: 'Wiosłowanie sztangą', muscle_group: 'dos' },
      { name: 'Ściąganie wyciągu', muscle_group: 'dos' },
      { name: 'Wiosłowanie poziome', muscle_group: 'dos' },
      { name: 'Wyciskanie żołnierskie', muscle_group: 'epaules' },
      { name: 'Wznosy boczne', muscle_group: 'epaules' },
      { name: 'Wznosy przodem', muscle_group: 'epaules' },
      { name: 'Odwrotne rozpiętki', muscle_group: 'epaules' },
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
