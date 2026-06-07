# Gavezzotti — Site officiel

> Bar à pâtes italien · 209 Rue de Bourgogne, 45000 Orléans · [gavezzotti.fr](https://gavezzotti.fr)

Site vitrine statique du restaurant Gavezzotti, conçu et développé par **Florent Desmarets**.

---

## Stack

- HTML5 / CSS3 / JavaScript vanilla — aucun framework
- Hébergé sur **GitHub Pages**
- Nom de domaine : **OVHcloud** (`gavezzotti.fr`)
- Polices : [Playfair Display](https://fonts.google.com/specimen/Playfair+Display) + [Lato](https://fonts.google.com/specimen/Lato)

---

## Structure

```
├── index.html            # Page principale (one-page)
├── allergenes.html       # Liste complète des allergènes
├── mentions-legales.html # Mentions légales
├── 404.html              # Page d'erreur personnalisée
├── css/
│   └── style.css         # Styles globaux + responsive
├── js/
│   └── main.js           # Interactions (carousel, slider, galerie…)
├── images/               # Photos plats, salle, hero, logo…
└── data/                 # Données JSON (carte, horaires…)
```

---

## Fonctionnalités

- **Hero slideshow** — défilement automatique avec points de navigation
- **Statut ouvert / fermé** — calculé en temps réel selon les horaires (timezone Europe/Paris)
- **Carrousel infini** — navigation tactile et souris, boucle fluide
- **Slider avant/après** — transformation du local (travaux), drag sur desktop et mobile
- **Galerie** — grille dense, expansion au clic sur desktop avec animation spring
- **Avis Google** — dates calculées automatiquement depuis la date de publication
- **Allergènes** — tableau desktop + cartes mobile, audit sécurité complet (14 allergènes)
- **Animations au scroll** — IntersectionObserver, révélations gauche/droite/scale
- **Schema.org Restaurant** — JSON-LD pour les rich results Google
- **Responsive** — mobile first, breakpoints 768px et 1024px

---

## Palette

| Variable | Valeur | Usage |
|---|---|---|
| `--beige` | `#f5e9cc` | Fond principal |
| `--brown` | `#3b2a1a` | Texte, navbar dark |
| `--green-it` | `#009246` | Vert drapeau italien |
| `--red-it` | `#ce2b37` | Rouge drapeau italien |
| `--beige-light` | `#fdf6e3` | Fond alterné |
| `--beige-dark` | `#e8d5a3` | Séparateurs |

---

## Horaires

| Jour | Midi | Soir |
|---|---|---|
| Mardi | 12h – 14h | — |
| Mercredi – Samedi | 12h – 14h | 19h – 22h |
| Dimanche – Lundi | Fermé | Fermé |

---

## Déploiement

Le site se déploie automatiquement à chaque push sur `main` via GitHub Pages.

```bash
git add .
git commit -m "Description de la modification"
git push origin main
```

> Le site est en ligne ~1 minute après le push.

---

## Contact

**Gavezzotti** · 209 Rue de Bourgogne, 45000 Orléans  
📞 [02 38 54 68 52](tel:+33238546852)  
📸 [@gavezzotti_orleans](https://www.instagram.com/gavezzotti_orleans)
