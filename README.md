# Frontend Mentor - Kanban task management web app solution

This is a solution to the [Kanban task management web app challenge on Frontend Mentor](https://www.frontendmentor.io/challenges/kanban-task-management-web-app-wgQLt-HlbB). Frontend Mentor challenges help you improve your coding skills by building realistic projects.

## Table of contents

- [Overview](#overview)
  - [The challenge](#the-challenge)
  - [Screenshot](#screenshot)
  - [Links](#links)
- [My process](#my-process)
  - [Built with](#built-with)
  - [What I learned](#what-i-learned)
  - [Continued development](#continued-development)
  - [Useful resources](#useful-resources)
  - [AI Collaboration](#ai-collaboration)
- [Author](#author)

## Overview

### The challenge

Users are able to:

- View the optimal layout for the app depending on their device's screen size
- See hover states for all interactive elements on the page
- Create, read, update, and delete boards and tasks
- Receive form validations when trying to create/edit boards and tasks
- Mark subtasks as complete and move tasks between columns
- Hide/show the board sidebar
- Toggle the theme between light/dark modes
- **Bonus**: Drag and drop tasks to change their status and reorder them within a column
- **Bonus**: All changes persist across browser refreshes via `localStorage`
- **Bonus**: Pixel-accurate implementation matched closely to the Figma design
- **Bonus**: Built with a component-based JavaScript framework

### Links

- Solution URL: [Github](https://github.com/Clonephaze/KanbanTaskManager)
- Live Site URL: [Github pages](https://clonephaze.github.io/KanbanTaskManager/)

## My process

### Built with

- Semantic HTML5 markup
- SCSS with CSS custom properties for theming
- Flexbox & CSS Grid
- Mobile-first responsive design
- [Nuxt 3](https://nuxt.com/) (SSR + Composition API)
- [TypeScript](https://www.typescriptlang.org/) (strict mode throughout)
- [Pinia](https://pinia.vuejs.org/) for state management
- [VueUse](https://vueuse.org/) for utility composables
- [vue-draggable-plus](https://github.com/Alfred-Skyblue/vue-draggable-plus) for drag and drop
- `localStorage` for full data persistence

### What I learned

Working through this challenge deepened my understanding of several patterns I want to carry forward.

**Theming with CSS custom properties**: keeping all color tokens in a single `_tokens.scss` partial and switching the entire theme by toggling a `data-theme` attribute on `<html>` is clean and performant. No JavaScript needed at render time; the browser does all the work.

**Pinia store design**: splitting state into a `useBoardStore` (all CRUD + persistence) and a `useUiStore` (theme, sidebar, active modal) kept each store focused. Driving every modal from a single `activeModal` object in `useUiStore` removed a whole class of "is this modal open?" bugs.

**vue-draggable-plus and reactivity**: the library mutates the bound array directly, so keeping a local reactive `tasks` ref per column (synced via a deep `watch`) and writing back to the store only on `@end` was the right separation. Nesting a `TransitionGroup` inside `VueDraggable` caused the entire group to be treated as one drag target: learned to keep cards as direct children.

**Dynamic CSS custom properties**: passing a board's accent colour down as a scoped `--board-accent` CSS variable on an element (rather than binding inline `background` styles) kept the SCSS clean and let the cascade handle active/hover states naturally.

### Continued development

- **Backend persistence**: replacing `localStorage` with a real API and database to support multiple devices and users.
- **Accessibility audit**: full keyboard navigation, ARIA live regions for drag-and-drop announcements, and proper focus management between modals.
- **Testing**: adding Vitest unit tests for store actions and Playwright end-to-end tests for the core CRUD flows.
- **Animation polish**: exploring the View Transitions API for smoother cross-column card moves.

### Useful resources

- [Nuxt 3 docs](https://nuxt.com/docs): invaluable for understanding the `app/` srcDir layout and auto-import behaviour.
- [Pinia docs](https://pinia.vuejs.org/core-concepts/): the composable store pattern clicked immediately and made the store code feel natural alongside `<script setup>`.
- [vue-draggable-plus](https://vue-draggable-plus.pages.dev/): concise docs that made the group-based cross-column drag setup straightforward.
- [VueUse - onClickOutside](https://vueuse.org/core/onClickOutside/): a one-liner that replaced what would otherwise be a fiddly manual event listener setup for every dropdown.

### AI Collaboration

I used **GitHub Copilot (Claude Sonnet)** during the planning phase of this project.

Before writing any code I used it to think through the architecture; how to structure the component tree, where to draw the line between `useBoardStore` and `useUiStore`, how to model the data types, and what the SCSS partial strategy should look like. Having those decisions written down in an `AGENTS.md` file at the start of the project meant I had a clear, consistent reference to work from rather than making ad-hoc choices mid-build.

What worked well was using it as a sounding board for tradeoffs (e.g. a single `activeModal` object vs. per-modal boolean flags) before any code existed to constrain the decision. The planning output - component responsibilities, naming conventions, store shapes, styling rules - translated directly into the codebase with very little rework.

## Author

- Frontend Mentor - [@clonephaze](https://www.frontendmentor.io/profile/clonephaze)
