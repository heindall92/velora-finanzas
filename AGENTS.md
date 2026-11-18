# Velora Finanzas — Agent Instructions

## Skills obligatorias (siempre)

Antes de implementar o revisar UI web en este repo, consulta y aplica:

1. **[modern-web-guidance](https://github.com/GoogleChrome/modern-web-guidance)**  
   Ejecutar `npx -y modern-web-guidance@latest search "<query>"` y `retrieve` en formularios, dialogs, layout responsive, a11y, CSS moderno. Preferir APIs nativas del platform sobre JS ad-hoc.

2. **[elephant-goldfish-model (EGM)](https://github.com/google/elephant-goldfish-model)**  
   Para cambios no triviales: pensar como Elephant (contexto/plan) y Goldfish (revisión cero-contexto). Skills locales en `.agents/skills/egm-*`. Usar `/egm-lite` para iteraciones pequeñas; brainstorm/draft/review para features grandes.

3. **apple-design / emil-design-eng / mobile-native** (Emil Kowalski)  
   Press feedback, springs interruptibles, materiales translúcidos, tipografía óptica, fixes nativos móviles.

4. **dashboard-design** (abdiraimov-otabek) en `.agents/skills/dashboard-design/`  
   Inicio, Extrato y Análisis: números honestos (comparar el mismo tramo del periodo, nada de % inventados), tokens claro/oscuro, listas con barra de 3 px, sin tarjetas medio vacías. Ignorar su sección "Sign-off".

Las skills viven en `.agents/skills/`. Léelas antes de inventar patrones legacy.

## Producto

- App de finanzas personales PWA: React + TypeScript + Vite + Tailwind.
- Datos solo locales (IndexedDB / localforage). Sin backend ni telemetría.
- Usuario final en Brasil y en **iPhone**: UI en **portugués (pt-BR) por defecto**, español como segunda lengua. Toda cadena pasa por `src/lib/i18n.ts` (el tipo obliga a traducir ambas). Monedas: BRL (default), USD, EUR. Importes siempre con `formatMoney`/`parseAmount` (`src/lib/money.ts`), nunca `parseFloat`.
- Onboarding: nombre, apellidos, moneda, presupuesto (opcional) y banco principal + saldo (opcional). Sin datos bancarios reales ni dirección. El presupuesto es un límite de gasto, **no** un saldo.
- Modelo: cuentas (`Account`: corriente, tarjeta de crédito, ahorro, efectivo). Saldo de cuenta = apertura + movimientos. Una tarjeta con factura tiene saldo **negativo** (pasivo). Pagar la factura o mover dinero es una **transferencia** (`type: 'transfer'`), que nunca cuenta como gasto ni ingreso. Patrimônio = activos − pasivos. Límites mensuales por categoría en `profile.categoryLimits`.
- Navegación móvil (como las apps brasileñas que conoce el usuario): Início · Extrato · + · Gastos · Contas. Metas se abre desde Contas e Início.
- Seguridad: PIN opcional con cifrado en reposo (`src/lib/vault.ts`), CSP estricta, sin scripts de terceros. Ver `SECURITY.md`. No añadir dependencias de red ni analítica.
- Exportar / importar JSON siempre disponible.
- Responsive: móvil y escritorio.
- Accent de UI: azul eléctrico `#0066FF`. Iconos Lucide (sin emojis). Colores solo vía tokens de `src/index.css` (claro y oscuro).
- Tarjeta de saldo personalizable: azul, negro, rojo, verde, naranja, malva. Sin datos demo ni números inventados.
- Base path GitHub Pages: `/velora-finanzas/`; Vercel en `/`.
- Antes de dar algo por terminado: `npm run check` y `npm run e2e` (mira las capturas, no solo el código).

## Browser support

Allow Baseline Newly Available features when a lightweight CSS/HTML fallback ≤ ~20 lines works; avoid new polyfill dependencies.
