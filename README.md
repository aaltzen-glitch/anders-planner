# Anders 2026 Planner (PWA)
Mörk “SaaS-känsla” webbapp som synkar via Supabase.

## Kör lokalt
1) Installera Node.js (LTS)  
2) I mappen:
- `npm install`
- `npm run dev`
Öppna: http://localhost:5173

## Publicera (för att synka på alla enheter)
Bygg: `npm run build` → då skapas `dist/` som kan hostas som statiska filer.

## Supabase (redan inlagt)
URL: https://vdrpfrbarutwnomajrdv.supabase.co
Anon key: (inbyggd i koden, kan också läggas i .env)

Tips: Du kan lägga in env i `.env`:
- VITE_SUPABASE_URL=...
- VITE_SUPABASE_ANON_KEY=...
