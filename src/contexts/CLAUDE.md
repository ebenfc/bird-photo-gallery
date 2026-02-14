# Theming System (`src/contexts/`)

## Skin Architecture

6 standard skins + 1 hidden (Retro, easter egg unlock):
- **Default** — PNW green/teal
- **Bold** — Purple/electric blue
- **Journal** — Warm naturalist's notebook (replaces old "Field Guide"; migration in `SkinContext.tsx`)
- **Coastal** — Sky, sea & shore
- **Meadow** — Soft & restful
- **High Contrast** — Maximum readability
- **Retro** — 90s web nostalgia (hidden until unlocked via easter egg)

## How It Works

All colors use CSS custom properties (`var(--forest-500)`, `var(--moss-300)`, etc.). Skin overrides in `globals.css` use `[data-skin="<name>"]` selectors to remap every variable. Components need zero changes — they inherit the active skin automatically.

## Easter Egg Infrastructure (Dormant)

Unlock system hooks (`useKonamiCode`, `useLogoTapUnlock`) fire in `Header.tsx` but callback is a no-op. To re-enable: add reward logic to `handleRetroUnlock` in `Header.tsx`.

## Landing Page Theme Showcase

Unauthenticated visitors can live-preview 6 skins on the landing page (`ThemeShowcase` component — excludes hidden Retro skin). Their choice persists to localStorage and carries over into sign-up. Includes a light/dark mode toggle.

## Color Rules for New Components

- Backgrounds: `var(--card-bg)`, `var(--background)` — never `bg-white`
- Text: `var(--text-primary)`, `var(--text-secondary)` — never hardcoded colors
- Borders: `var(--border)`, `var(--border-light)`
- Accents: `var(--moss-500)`, `var(--forest-600)` — these remap per skin
- Shadows: `var(--shadow-sm)`, `var(--shadow-moss)` — tinted per skin

## Key Theming Files

- `src/app/globals.css` — CSS variable definitions + skin overrides
- `src/contexts/SkinContext.tsx` — Skin state + localStorage persistence
- `src/components/settings/AppearanceSettings.tsx` — Skin picker UI (shows Retro only when unlocked)
- `src/components/landing/ThemeShowcase.tsx` — Public landing page skin preview (6 standard skins)
