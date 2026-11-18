# Velora Finanzas — Agent Instructions

## Skills obligatorias (siempre)

Antes de implementar o revisar UI web en este repo, consulta y aplica:

1. **[modern-web-guidance](https://github.com/GoogleChrome/modern-web-guidance)**  
   Ejecutar `npx -y modern-web-guidance@latest search "<query>"` y `retrieve` en formularios, dialogs, layout responsive, a11y, CSS moderno. Preferir APIs nativas del platform sobre JS ad-hoc.

2. **[elephant-goldfish-model (EGM)](https://github.com/google/elephant-goldfish-model)**  
   Para cambios no triviales: pensar como Elephant (contexto/plan) y Goldfish (revisión cero-contexto). Skills locales en `.agents/skills/egm-*`. Usar `/egm-lite` para iteraciones pequeñas; brainstorm/draft/review para features grandes.

3. **apple-design / emil-design-eng / mobile-native** (Emil Kowalski)  
   Press feedback, springs interruptibles, materiales translúcidos, tipografía óptica, fixes nativos móviles.

Las skills viven en `.agents/skills/`. Léelas antes de inventar patrones legacy.

## Producto

- App de finanzas personales PWA: React + TypeScript + Vite + Tailwind.
- Datos solo locales (IndexedDB / localforage). Sin backend ni telemetría.
- UI en español. Monedas: BRL (default), USD, EUR.
- Onboarding inicial: **solo nombre, apellidos y presupuesto** (sin datos bancarios ni dirección).
- Exportar / importar JSON siempre disponible.
- Responsive: móvil y escritorio.
- Accent de UI: azul eléctrico `#0066FF`. Iconos Lucide (sin emojis).
- Tarjeta personalizable: azul, negro, rojo, verde, naranja, malva (sin datos demo; cuenta limpia).
- Base path GitHub Pages: `/velora-finanzas/`.

## Browser support

Allow Baseline Newly Available features when a lightweight CSS/HTML fallback ≤ ~20 lines works; avoid new polyfill dependencies.
