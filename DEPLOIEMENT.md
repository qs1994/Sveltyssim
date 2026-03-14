# 🚀 Guide de déploiement — Sveltyssim

## ÉTAPE 1 — Configurer Supabase (10 min)

### 1.1 Créer le projet
1. Va sur **https://supabase.com** et connecte-toi
2. Clique **"New project"**
3. Choisis un nom : `sveltyssim`
4. Choisis une région : **West EU (Ireland)** (le plus proche de la France)
5. Crée un mot de passe fort → note-le dans Bitwarden !
6. Clique **"Create new project"** → attends ~2 minutes

### 1.2 Créer les tables (le schéma de la base de données)
1. Dans le menu gauche, clique **"SQL Editor"**
2. Clique **"New query"**
3. Copie-colle tout le contenu du fichier `supabase_schema.sql`
4. Clique **"Run"** (▶️)
5. Tu dois voir : `Success. No rows returned` ✅

### 1.3 Récupérer tes clés API
1. Dans le menu gauche, clique **"Project Settings"** (icône ⚙️)
2. Clique **"API"**
3. Note ces deux valeurs (tu en auras besoin dans l'Étape 3) :
   - **Project URL** → ressemble à `https://xxxx.supabase.co`
   - **anon public** → une longue clé commençant par `eyJ...`

---

## ÉTAPE 2 — Mettre le code sur GitHub (10 min)

### 2.1 Créer le dépôt GitHub
1. Va sur **https://github.com** et connecte-toi
2. Clique le **"+"** en haut à droite → **"New repository"**
3. Nom du dépôt : `sveltyssim`
4. Laisse tout par défaut, clique **"Create repository"**

### 2.2 Installer Git et envoyer le code
Ouvre le terminal de ton ordi (Terminal sur Mac, ou PowerShell sur Windows) :

```bash
# Va dans le dossier du projet
cd chemin/vers/sveltyssim

# Initialise Git
git init
git add .
git commit -m "🌿 Premier commit Sveltyssim"

# Connecte au dépôt GitHub (remplace TONPSEUDO par ton pseudo GitHub)
git remote add origin https://github.com/TONPSEUDO/sveltyssim.git
git branch -M main
git push -u origin main
```

> 💡 Si c'est ta première fois avec Git, GitHub te demandera de te connecter dans le navigateur.

---

## ÉTAPE 3 — Déployer sur Vercel (5 min)

1. Va sur **https://vercel.com** et connecte-toi avec GitHub
2. Clique **"Add New Project"**
3. Tu vois ton dépôt `sveltyssim` → clique **"Import"**
4. Avant de cliquer "Deploy", clique sur **"Environment Variables"** et ajoute :

   | Nom | Valeur |
   |-----|--------|
   | `VITE_SUPABASE_URL` | `https://xxxx.supabase.co` (ta Project URL) |
   | `VITE_SUPABASE_ANON_KEY` | `eyJ...` (ta clé anon public) |

5. Clique **"Deploy"** 🚀
6. Vercel déploie en ~1 minute
7. Tu reçois une URL du type `sveltyssim-xxxx.vercel.app` → **c'est l'URL de ton appli !**

> 💡 Tu peux personnaliser l'URL dans les Settings de Vercel (domaine custom possible même en gratuit)

---

## ÉTAPE 4 — Installer sur iPhone (2 min × 2 iPhones)

**À faire sur chaque iPhone, dans Safari (pas Chrome !) :**

1. Ouvre **Safari**
2. Va sur ton URL Vercel (ex: `sveltyssim.vercel.app`)
3. Appuie sur le bouton **Partager** (carré avec flèche ↑ en bas de l'écran)
4. Fais défiler et appuie sur **"Sur l'écran d'accueil"**
5. Nomme l'appli `Sveltyssim` → **"Ajouter"**
6. L'icône apparaît sur votre écran d'accueil 🎉

**Créez chacun votre propre compte** dans l'appli (email + mot de passe différents)

---

## ÉTAPE 5 — Mises à jour futures

Quand tu veux modifier l'appli :
```bash
# Après avoir modifié le code
git add .
git commit -m "Ma modification"
git push
```
→ Vercel redéploie automatiquement en moins d'une minute ! ⚡

---

## 🆘 En cas de problème

| Problème | Solution |
|----------|----------|
| "Invalid API key" | Vérifie tes variables d'environnement dans Vercel → Settings → Environment Variables |
| Appli blanche sur iPhone | Vide le cache Safari et recharge |
| "Row not found" sur les objectifs | C'est normal au premier lancement, va dans Profil et sauvegarde tes objectifs |
| Mot de passe oublié | Utilise "Mot de passe oublié" sur l'écran de connexion |
