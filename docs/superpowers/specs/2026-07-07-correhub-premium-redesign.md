# CorreHub Premium Redesign

## Overview
Complete UX/UI transformation of CorreHub — a running community platform — into a premium, modern, trustworthy product that rivals Strava, Nike Run Club, and Linear in visual quality.

## Design Principles
1. **Speed & Energy** — Visual language that communicates movement and athletic performance
2. **Trust & Professionalism** — Premium feel that impresses first-time visitors
3. **Mobile-First** — Native-app feel on mobile, polished on desktop
4. **Accessibility** — WCAG 2.2 AA compliance throughout
5. **Performance** — Core Web Vitals optimized

## Brand Identity
- **Name:** CorreHub (maintained)
- **Primary color:** Indigo/Violet (#6366f1 → #8b5cf6 gradient) — communicates technology, speed, trust
- **Accent:** Cyan (#22d3ee) — energy, movement, freshness
- **Green (#22c55e):** Reserved for health/success states
- **Background:** Warm neutrals with subtle radial gradients and glassmorphism

## Design Tokens
- Colors: primary, secondary, accent, surface, muted, border, success, warning, error
- Typography: Inter font, scale from xs to 6xl with defined line-heights
- Spacing: 4px base unit (0.25rem increments)
- Radius: sm (0.5rem), md (0.75rem), lg (1rem), xl (1.5rem), 2xl (2rem), full
- Shadows: sm, md, lg, xl, 2xl, glow (primary)

## Component Architecture
All components in `src/components/ui/` following shadcn/ui patterns:
- Button (variants: primary, secondary, outline, ghost, danger, link; sizes: sm, md, lg, xl)
- Card (variants: default, interactive, elevated, bordered, ghost)
- Input, Textarea, Select (with error/label/helper text)
- Badge (variants: default, secondary, outline, soft; colors)
- Avatar (sizes: sm, md, lg, xl; with fallback)
- Skeleton (shimmer animation, variants: text, card, avatar, circle)
- Dialog, Tabs, Separator (Radix-based)

## Layout
- **Mobile:** Bottom navigation bar (5 icons), compact header
- **Desktop:** Top navigation + optional sidebar for dashboard
- **AppShell:** Wraps header + main + footer with consistent padding
- **Page transitions:** Framer Motion fade + slide

## Animations (Framer Motion)
- Page transitions: fade + slide up (0.3s)
- Card hover: scale(1.02) + shadow elevation
- Stagger reveal: lists/grids fade in sequentially
- Button: scale(0.97) on press, smooth transitions
- Skeleton: shimmer wave animation
- Toast: slide-in from top

## Accessibility
- ARIA labels on all navigation elements
- Roles: banner, navigation, main, contentinfo, complementary
- Focus visible: ring-2 with offset-2
- Skip to content link
- Labels with htmlFor/aria-labelledby
- Color contrast WCAG AA (4.5:1 normal text, 3:1 large text)

## PT-BR Corrections
- All missing accents/cedilhas fixed
- Consistent terminology
- Professional Brazilian Portuguese tone
- No mixed PT/EN

## Pages to Update
1. Marketing Home (hero, features, testimonials, CTA)
2. Agenda/Events (with empty state, loading)
3. Grupos/Groups (listing + detail)
4. Ranking
5. Parceiros/Partners (listing + detail)
6. Comunidade/Community
7. Login
8. Cadastro/Register
9. Dashboard (runner, leader, admin)
10. Perfil/Profile
11. Check-in
12. Notificações
13. Buscar/Search
14. 404, Error, Loading states
