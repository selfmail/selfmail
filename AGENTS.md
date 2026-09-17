# Project guidelines

- Use Bun for dependencies and scripts; use `bunx` instead of `npx`.
- Keep changes scoped to the request and follow existing project conventions.
- Prefer TypeScript interfaces for object shapes; use types for unions and other constructs interfaces cannot express. Keep code type-safe.
- Verify code changes with scoped Biome/Ultracite checks and relevant TypeScript checks. Do not run a build after routine edits.
- Avoid repository-wide formatting for a scoped change; the root check script writes changes.
- Add comments only for non-obvious logic. Do not create feature READMEs.

## UI changes

- Reuse existing components, accessible primitives, theme tokens, and Tailwind defaults. Use `cn` for conditional classes.
- Preserve keyboard and focus behavior; label icon-only buttons and use AlertDialog for destructive actions.
- Show errors beside the action and give empty states one clear next action. Never block paste.
- Use `h-dvh` instead of `h-screen` and respect safe-area insets for fixed elements.
- Do not add animations or gradients unless requested. For requested JavaScript animation, use `motion/react`, prefer transform/opacity, and respect reduced motion.
- Prefer render logic over unnecessary effects.
