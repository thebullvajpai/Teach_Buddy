# TeachBuddy - Interactive English Learning with AI Coach

[Live Application](https://teach-buddy.pages.dev/) | [GitHub Repository](https://github.com/vaajpaai/TeachBuddy)

TeachBuddy is a structured, web-based educational platform developed to help vernacular and beginner learners improve English grammar, expand practical vocabulary, and build conversational skills through progressive learning modules and an interactive AI Coach.

---

## Live Demo

- Production URL: https://teach-buddy.pages.dev/
- Hosting Provider: Cloudflare Pages

---

## Overview

Learning English as a second language presents distinct hurdles for non-native speakers, including fear of error correction, lack of consistent speaking practice, and overly theoretical instruction. TeachBuddy organizes practical English learning into three structured tiers:

1. Level 1 (Foundations): Topic-wise modular grammar notes coupled with instant-feedback quizzes.
2. Level 2 (Application): Multi-modal practical exercises including Hindi-to-English translation, sentence unscrambling, and grammatical error spotting.
3. Level 3 (Immersion): An interactive conversational AI coach available in full-screen or persistent floating-widget form for contextual conversation, syntax feedback, and vocabulary enhancement.

---

## Functional Features

### Level 1: Grammar Notes & Topic Practice
- 11 foundational topics covering Parts of Speech (Noun, Pronoun, Verb, Adverb, Adjective, Preposition, Conjunction) through to Tenses and Sentence Formation.
- Interactive multiple-choice quizzes for each topic offering real-time answer evaluation and explanatory notes.

### Level 2: Mixed Challenges
- Sentence Reordering: Interactive puzzle interface to reconstruct correct syntax and word order.
- Hindi-to-English Translation: Contextual phrase and sentence exercises designed specifically for native Hindi speakers.
- Error Identification: Diagnostic sentence challenges targeting common non-native grammatical misconstructions (verb agreement, prepositions, tense consistency).

### Level 3: Conversational AI Coach
- Natural dialog interface available globally across the website via floating toggle or full-screen view.
- Real-time sentence structure feedback, tense error correction, and vocabulary alternatives.

---

## Technology Stack

- Frontend: HTML5, CSS3 (Flexbox, CSS Grid, Responsive Design, CSS Custom Properties)
- Logic & Interaction: JavaScript (ES6+ for state tracking, DOM manipulation, quiz logic, and API calls)
- Deployment: Cloudflare Pages (Git integration and edge delivery)
- External Fonts: Google Fonts (Inter, Plus Jakarta Sans)

---

## Project Structure

```text
teach-buddy/
├── index.html                   # Main dashboard and navigation hub
├── assets/                      # Static assets and icons
├── css/
│   ├── main.css                 # Global styling and variables
│   └── components/              # Scoped styling for widgets and cards
├── js/
│   ├── app.js                   # Application state and quiz controller
│   └── ai-coach.js              # Conversational interface script
├── level1/
│   ├── notes.html               # Grammar notes library
│   └── practice.html            # Topic-wise practice interface
├── level2/
│   └── level2_dashboard.html    # Mixed practice challenges
├── level3/
│   └── communication.html       # Full-screen conversational coach
└── README.md
