---
name: theme-var
description: Find the right CSS variable for a color need, or add a new variable across all 7 themes. Use when working with colors or theming.
user-invocable: true
disable-model-invocation: false
argument-hint: [color-need or variable-name]
---

# Theme Variable Helper

Help with theming for: `$ARGUMENTS`

## Step 1: Check if an existing variable covers the need

BirdFeed has 140+ CSS custom properties per theme block. Before creating new ones, check existing variables in `src/app/globals.css`.

### Common variable mappings

| Need | Use this | NOT this |
|------|----------|----------|
| Page background | `--background` | `bg-white` |
| Card background | `--card-bg` | `bg-white` |
| Subtle background | `--mist-50` | `bg-gray-50`, `--bg-secondary` |
| Primary text | `--text-primary` | `text-gray-900` |
| Secondary text | `--text-secondary` | `text-gray-500` |
| Border | `--border` | `border-gray-200` |
| Light border | `--border-light` | `border-gray-100` |
| Error text | `--error-text` | `text-red-500` |
| Error background | `--error-bg` | `bg-red-50` |
| Success text | `--success-text` | `text-green-500` |
| Danger gradient | `--danger-from`, `--danger-to` | `bg-red-*` |
| Warm accent | `--amber-*` | `--orange-*` (doesn't exist) |
| Favorite indicator | `--favorite-color` | hardcoded yellow/gold |
| Always-dark bg | `--header-from`, `--header-to` | `--forest-950` in dark mode |
| Text on dark bg | `text-white/80`, `text-white/60` | `--text-primary` |

### Variables that DON'T exist
- `--orange-*`, `--red-*`, `--yellow-*` — use `--amber-*` or `--danger-*`
- `--bg-secondary` — use `--mist-50`

## Step 2: If a new variable is needed

New variables must be added to ALL 14 CSS blocks (7 themes x 2 modes) in `globals.css`:

### Theme blocks to update
1. `:root` (default light)
2. `[data-mode="dark"]` (default dark)
3. `[data-skin="bold"]` (bold light)
4. `[data-skin="bold"][data-mode="dark"]` (bold dark)
5. `[data-skin="journal"]` (journal light)
6. `[data-skin="journal"][data-mode="dark"]` (journal dark)
7. `[data-skin="coastal"]` (coastal light)
8. `[data-skin="coastal"][data-mode="dark"]` (coastal dark)
9. `[data-skin="meadow"]` (meadow light)
10. `[data-skin="meadow"][data-mode="dark"]` (meadow dark)
11. `[data-skin="highcontrast"]` (highcontrast light)
12. `[data-skin="highcontrast"][data-mode="dark"]` (highcontrast dark)
13. `[data-skin="retro"]` (retro light)
14. `[data-skin="retro"][data-mode="dark"]` (retro dark)

### Color design principles per theme
- **Default:** PNW green/teal, organic feel
- **Bold:** Purple/electric blue, high-energy
- **Journal:** Cream/sage, warm serif aesthetic
- **Coastal:** Ocean blue/sand/seafoam, color-blind accessible
- **Meadow:** Soft sage/cream/muted rose, comfortable reading
- **High Contrast:** Maximum contrast, WCAG AAA level
- **Retro:** GeoCities navy/teal/yellow, nostalgic

### Dark mode rules
- `--forest-*`, `--moss-*`, `--sky-*`, `--amber-*` palettes INVERT in dark mode (light values swap with dark values)
- Always-dark elements (`--header-from/to`) do NOT invert — they stay dark in both modes
- For components in always-dark containers, use `text-white/80`, `border-white/20`

## Reference Files

- All theme blocks: `src/app/globals.css`
- Skin context: `src/contexts/SkinContext.tsx`
- Component patterns: `src/components/CLAUDE.md` (Dark Mode section)
