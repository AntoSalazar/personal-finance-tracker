# Design System

This document outlines the design tokens and visual styles used in the Personal Finance Tracker application.

## Tech Stack
- **Tailwind CSS v4**: Utility-first CSS framework.
- **Shadcn/UI**: Component library base.
- **Fonts**: Geist Sans (sans-serif) & Geist Mono (monospace).

## Colors

The application uses the **OKLCH** color space for perceptible uniformity.

### Base Colors
| Token | Light Mode Value | Dark Mode Value | Usage |
| :--- | :--- | :--- | :--- |
| `--background` | `oklch(1 0 0)` (White) | `oklch(0.145 0 0)` (Dark Grey) | Page background |
| `--foreground` | `oklch(0.145 0 0)` | `oklch(0.985 0 0)` | Primary text |
| `--border` | `oklch(0.922 0 0)` | `oklch(1 0 0 / 10%)` | Borders |
| `--input` | `oklch(0.922 0 0)` | `oklch(1 0 0 / 15%)` | Input borders |
| `--ring` | `oklch(0.708 0 0)` | `oklch(0.556 0 0)` | Focus rings |

### Functional Colors
| Token | Light Mode Value | Dark Mode Value | Usage |
| :--- | :--- | :--- | :--- |
| `--primary` | `oklch(0.205 0 0)` | `oklch(0.922 0 0)` | Main actions/buttons |
| `--secondary` | `oklch(0.97 0 0)` | `oklch(0.269 0 0)` | Secondary actions |
| `--destructive`| `oklch(0.577 0.245 27.325)` | `oklch(0.704 0.191 22.216)` | Errors/Delete actions |
| `--muted` | `oklch(0.97 0 0)` | `oklch(0.269 0 0)` | Muted text backgrounds |
| `--accent` | `oklch(0.97 0 0)` | `oklch(0.269 0 0)` | Hover states, accents |

### Chart Colors
- `--chart-1`: `oklch(0.646 0.222 41.116)` (Light) / `oklch(0.488 0.243 264.376)` (Dark)
- `--chart-2`: `oklch(0.6 0.118 184.704)` (Light) / `oklch(0.696 0.17 162.48)` (Dark)
- `--chart-3`: `oklch(0.398 0.07 227.392)` (Light) / `oklch(0.769 0.188 70.08)` (Dark)
- `--chart-4`: `oklch(0.828 0.189 84.429)` (Light) / `oklch(0.627 0.265 303.9)` (Dark)
- `--chart-5`: `oklch(0.769 0.188 70.08)` (Light) / `oklch(0.645 0.246 16.439)` (Dark)

## Typography
- **Sans**: `var(--font-geist-sans)`
- **Mono**: `var(--font-geist-mono)`

## Radii
- `--radius`: `0.625rem` (Base)
- `--radius-sm`: `calc(var(--radius) - 4px)`
- `--radius-md`: `calc(var(--radius) - 2px)`
- `--radius-lg`: `var(--radius)`
- `--radius-xl`: `calc(var(--radius) + 4px)`

## Animations
- **Global Transition**: All elements have a base transition: `transition-colors duration-500 ease-in-out` (defined in `@layer base`).
- **Library**: `tw-animate-css` is imported, providing utility classes for animations.
