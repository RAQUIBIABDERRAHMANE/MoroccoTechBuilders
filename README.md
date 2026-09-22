# Morocco Tech Builders — Événement Présence en Ligne 🎟️🇲🇦

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue?style=flat-square&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![n8n](https://img.shields.io/badge/Automation-n8n-FF6D5A?style=flat-square&logo=n8n)](https://n8n.io/)
[![License](https://img.shields.io/badge/License-Private-green?style=flat-square)](#)

Plateforme web événementielle complète développée pour l'atelier technique **« Construire sa Présence en Ligne »** organisé par **Morocco Tech Builders** à destination des stagiaires en **Développement Digital** de l'**OFPPT Marrakech**.

Le projet combine une page d'atterrissage moderne, un système d'inscription avec émission de pass numérique avec code QR, un workflow d'automatisation n8n pour les emails transactionnels, et une application de contrôle d'accès avec scanner QR pour le jour de l'événement.

---

## 📑 Table des Matières

- [Aperçu & Fonctionnalités](#-aperçu--fonctionnalités)
  - [1. Landing Page & Inscription](#1-landing-page--inscription)
  - [2. Pass Numérique d'Accès](#2-pass-numérique-daccès)
  - [3. Scanner d'Entrée & Contrôle d'Accès (`/scan`)](#3-scanner-dentrée--contrôle-daccès-scan)
  - [4. Automatisation n8n & Emails](#4-automatisation-n8n--emails)
- [Architecture & Technologies](#-architecture--technologies)
- [Structure du Projet](#-structure-du-projet)
- [Installation & Démarrage](#-installation--démarrage)
- [Configuration des Variables d'Environnement](#-configuration-des-variables-denvironnement)
- [Intégration du Workflow n8n](#-intégration-du-workflow-n8n)
- [Application Scanner d'Accès (`/scan`)](#-application-scanner-daccès-scan)
- [Points d'API (Routes Next.js)](#-points-dapi-routes-nextjs)
- [Scripts Disponibles](#-scripts-disponibles)
- [Auteur & Contact](#-auteur--contact)

---

## 🚀 Aperçu & Fonctionnalités

### 1. Landing Page & Inscription
- **Hero & Compte à Rebours** : Présentation dynamique de la session avec décompte interactif en temps réel jusqu'au jour J.
- **Statistiques Clés** : Rubrique synthétique mettant en valeur les chiffres clés de la session (durée, ateliers, places).
- **Programme & Agenda** : Déroulement complet étape par étape (GitHub, Portfolios modernes, LinkedIn tech).
- **Objectifs Pédagogiques** : Grille claire des compétences et livrables acquis par les stagiaires.
- **Profil Intervenant** : Présentation d'Abderrahmane Raquibi avec badges techniques et liens vers ses profils professionnels.
- **Formulaire d'Inscription Réactif** : Validation côté client et serveur des informations stagiaire (Nom, Email, Téléphone, Classe, Année de formation).
- **Célébration Visuelle** : Animation confettis (`canvas-confetti`) dès confirmation de l'inscription.
- **Section FAQ Interactive** : Accordéon fluide répondant aux questions fréquentes des stagiaires.

### 2. Pass Numérique d'Accès
- **Génération Instantanée** : Pass d'accès dynamique généré immédiatement à l'écran après inscription.
- **Code QR Unique** : Format standardisé `Nom-Classe` encodé et prêt pour le scan.
- **Format Billet Imprimable** : Design style « carte d'embarquement / Apple Wallet » optimisé pour les captures d'écran mobiles et l'impression (`window.print()`).

### 3. Scanner d'Entrée & Contrôle d'Accès (`/scan`)
- **Protection par Code PIN** : Accès réservé aux organisateurs via code PIN (par défaut `2126` ou configurable via `NEXT_PUBLIC_SCAN_PIN`).
- **Scanner Caméra Intégré** : Lecture optique en direct avec `html5-qrcode`, incluant le basculement caméra avant/arrière et la mise en pause.
- **Saisie Manuelle & Douchette Barcode** : Mode alternatif permettant la saisie au clavier ou l'utilisation d'un lecteur code-barres USB/Bluetooth.
- **Contrôle d'Anti-Passback** : Détection des doubles entrées (`already_attended`), autorisations d'accès (`approve`) et rejets (`decline`).
- **Retour Audio & Haptique** : Effets sonores synthétisés via l'API Web Audio pour confirmer immédiatement le statut aux contrôleurs à l'entrée.
- **Historique & Statistiques** : Compteurs d'entrées en direct (Total scannés, Autorisés, Déjà entrés, Rejetés) avec historique horodaté et possibilité de réinitialisation.

### 4. Automatisation n8n & Emails
- **Fichier de Workflow Inclus** : Le projet inclut le workflow complet exporté [`Event QR Email.json`](./Event%20QR%20Email.json).
- **Envoi d'Email Transactionnel** : Réception automatique du pass officiel et du code QR par email à chaque stagiaire inscrit.
- **Mise à Jour de Présence** : Déclenchement de la confirmation de présence lors du scan physique à l'entrée de la salle.

---

## 🛠 Architecture & Technologies

| Domaine | Technologie |
|---|---|
| **Framework** | [Next.js 15+](https://nextjs.org/) (App Router) |
| **Bibliothèque UI** | [React 19](https://react.dev/) |
| **Typage** | [TypeScript 5](https://www.typescriptlang.org/) |
| **Styles** | CSS Modules + Vanilla CSS moderne (`globals.css`) |
| **Scanner QR** | [html5-qrcode](https://github.com/mebjas/html5-qrcode) |
| **Animations** | [canvas-confetti](https://github.com/catdad/canvas-confetti) |
| **Icônes** | [Lucide React](https://lucide.dev/) + SVG personnalisés |
| **Automatisation Backend** | [n8n](https://n8n.io/) via Webhooks HTTP |
| **Typographie** | Police Google Fonts Inter |

---

## 📁 Structure du Projet

```text
Events/
├── app/
│   ├── api/
│   │   ├── register/
│   │   │   └── route.ts         # Endpoint d'inscription & relais n8n
│   │   └── scan/
│   │       └── route.ts         # Endpoint de validation QR & contrôle d'accès
│   ├── scan/
│   │   ├── page.tsx             # Application scanner pour les organisateurs
│   │   └── scan.module.css      # Styles dédiés du scanner (Dark Mode Kiosk)
│   ├── globals.css              # Variables de design system, reset & utilitaires
│   ├── layout.tsx               # Layout racine Next.js, polices & métadonnées SEO/OG
│   ├── page.tsx                 # Page d'accueil (Landing Page complète)
│   └── icon.svg                 # Favicon vectoriel
├── components/
│   ├── Countdown.tsx            # Compte à rebours avant l'événement
│   ├── DigitalPassModal.tsx     # Modale du pass numérique imprimable
│   ├── Faq.tsx                  # Accordéon questions / réponses
│   ├── Footer.tsx               # Pied de page & mentions
│   ├── Hero.tsx                 # Section principale avec visuel & CTA
│   ├── Navbar.tsx               # Navigation fixe avec statut et liens d'ancrage
│   ├── Objectives.tsx           # Objectifs pédagogiques de la session
│   ├── ProgramAgenda.tsx        # Déroulé chronologique du programme
│   ├── RegistrationForm.tsx     # Formulaire d'inscription interactif
│   ├── Speaker.tsx              # Carte de présentation de l'animateur
│   ├── StatsStrip.tsx           # Bandeau de statistiques clés
│   └── *.module.css             # Modules CSS pour chaque composant
├── public/
│   ├── hero-visual.jpg          # Visuel 3D principal
│   ├── logo.svg                 # Logo officiel vectoriel MTB
│   ├── logo-white.svg           # Logo officiel fond sombre
│   └── icon.svg                 # Favicon officiel MTB
├── Event QR Email.json          # Workflow complet n8n (Webhooks, QR, Emails, Scan)
├── .env.example                 # Modèle des variables d'environnement
├── next.config.mjs              # Configuration Next.js (optimisation images)
├── package.json                 # Dépendances & scripts npm
└── tsconfig.json                # Configuration TypeScript
```

---

## ⚙️ Installation & Démarrage

### Prérequis
- [Node.js](https://nodejs.org/) (version 18.18+ ou 20+ recommandée)
- Gestionnaire de paquets `npm`, `pnpm` ou `yarn`

### 1. Cloner ou ouvrir le projet
```bash
cd d:/Events
```

### 2. Installer les dépendances
```bash
npm install
```

### 3. Configurer l'environnement
Copiez le fichier `.env.example` en `.env` :
```bash
cp .env.example .env
```
*(Sur Windows PowerShell : `Copy-Item .env.example .env`)*

Ajustez les valeurs selon votre configuration (voir section suivante).

### 4. Lancer le serveur de développement
```bash
npm run dev
```
L'application sera accessible sur [http://localhost:3000](http://localhost:3000).

---

## 🔐 Configuration des Variables d'Environnement

Fichier `.env` :

```ini
# ==============================================================================
# Morocco Tech Builders - Variables d'Environnement
# ==============================================================================

# Webhook d'inscription (relais vers n8n ou service tiers)
EVENT_WEBHOOK_URL=http://localhost:5678/webhook/event-qr
N8N_WEBHOOK_URL=http://localhost:5678/webhook/event-qr

# Webhook de contrôle d'accès lors du scan d'entrée
EVENT_SCAN_WEBHOOK_URL=http://localhost:5678/webhook/event-qr-scan
N8N_SCAN_WEBHOOK_URL=http://localhost:5678/webhook/event-qr-scan

# Code PIN pour déverrouiller l'accès au scanner (/scan)
NEXT_PUBLIC_SCAN_PIN=2126

# URL publique de l'application (utilisée pour les métadonnées OpenGraph)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## ⚡ Intégration du Workflow n8n

Le fichier [`Event QR Email.json`](./Event%20QR%20Email.json) contient la définition complète du workflow n8n.

### Étapes d'importation :
1. Ouvrez votre instance **n8n** (locale ou cloud).
2. Cliquez sur **Workflows** > **Import from File...** et sélectionnez `Event QR Email.json`.
3. Configurez vos identifiants pour :
   - Le nœud d'envoi d'email SMTP / Gmail.
   - La base de données ou Google Sheets pour le stockage des participants.
4. Activez le workflow (*Production*) et copiez les URLs de Webhooks obtenues dans vos variables d'environnement (`EVENT_WEBHOOK_URL` et `EVENT_SCAN_WEBHOOK_URL`).

---

## 📱 Application Scanner d'Accès (`/scan`)

Pour les organisateurs et agents d'accueil le jour de l'événement :

1. Accédez à l'URL : **`http://localhost:3000/scan`** (ou l'URL déployée).
2. Saisissez le **Code PIN** de sécurité configuré (`2126` par défaut).
3. Choisissez le mode d'entrée :
   - **Mode Caméra** : Autorisez l'accès caméra pour scanner les QR codes présentés sur les téléphones ou billets imprimés.
   - **Mode Manuel** : Utilisez un lecteur code-barres USB ou saisissez manuellement l'identifiant du participant sous la forme `Nom-Classe`.
4. Le système effectue une vérification en direct :
   - 🟢 **Accès Autorisé** (`approve`) : Premier passage validé.
   - 🟡 **Déjà Présent** (`already_attended`) : QR code déjà scanné précédemment (anti-fraude).
   - 🔴 **Refusé** (`decline`) : Participant non trouvé ou code invalide.

---

## 📡 Points d'API (Routes Next.js)

### 1. `POST /api/register`
Reçoit les demandes d'inscription, vérifie les champs obligatoires, génère le billet et transmet les données au webhook n8n.

- **Payload JSON :**
  ```json
  {
    "fullName": "Karim Idrissi",
    "email": "karim.idrissi@example.com",
    "phone": "0612345678",
    "classe": "DEV101",
    "year": "1ère Année"
  }
  ```
- **Réponse Succès (200) :**
  ```json
  {
    "success": true,
    "message": "Inscription confirmée avec succès !...",
    "synced": true,
    "pass": {
      "ticketId": "OFPPT-DD-123456",
      "fullName": "Karim Idrissi",
      "email": "karim.idrissi@example.com",
      "classe": "DEV101",
      "qrCodeUrl": "https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=...",
      "eventName": "Morocco Tech Builders — Présence en Ligne",
      "speaker": "Abderrahmane Raquibi"
    }
  }
  ```

### 2. `POST /api/scan`
Valide un code QR scanné auprès du service d'accès.

- **Payload JSON :**
  ```json
  {
    "data": "Karim Idrissi-DEV101"
  }
  ```
- **Réponse Succès (200) :**
  ```json
  {
    "success": true,
    "status": "approve",
    "message": "Accès autorisé ! Statut mis à jour.",
    "participant": {
      "fullName": "Karim Idrissi",
      "classe": "DEV101",
      "scannedAt": "14:32:10"
    }
  }
  ```

---

## 📜 Scripts Disponibles

Dans le dossier du projet, vous pouvez exécuter les commandes suivantes :

```bash
# Lancer le serveur de développement
npm run dev

# Compiler l'application pour la production
npm run build

# Démarrer le serveur en mode production
npm run start
```

---

## 👨‍💻 Auteur & Organisation

- **Organisation** : **Morocco Tech Builders**
- **Intervenant & Développeur** : **Abderrahmane Raquibi**
  - GitHub : [@RAQUIBIABDERRAHMANE](https://github.com/RAQUIBIABDERRAHMANE)
  - LinkedIn : [Abderrahmane Raquibi](https://linkedin.com/in/raquibi)
- **Institution Partenaire** : OFPPT Marrakech — Filière Développement Digital
