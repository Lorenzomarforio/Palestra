# Log delle modifiche

Questo file registra tutte le modifiche effettuate durante la sessione.

---

## 2026-09-12 - Fix modalità dark/light

**Problema**: Il toggle per cambiare da light a dark mode non funzionava visivamente.

**Causa**: `src/app/globals.css` (importato in `layout.tsx`) aveva colori hardcoded (`color: #111; background: #fafafa;`) e **non importava i design tokens** che definiscono le variabili CSS `--color-bg-primary`, `--color-text-primary`, ecc. per light/dark mode.

**Soluzione**: Sostituito il contenuto di `src/app/globals.css` con un import del file `src/design/globals.css` che:
1. Importa `tokens.css` con tutte le variabili CSS per light/dark mode (classi `:root.light` e `:root.dark`)
2. Usa le variabili CSS per `body` (`color: var(--color-text-primary); background-color: var(--color-bg-secondary);`)
3. Include transizioni fluide per il cambio tema

Il `ThemeProvider` in `src/lib/theme.tsx` già aggiungeva/rimuoveva correttamente le classi `.light`/`.dark` all'elemento `<html>`, ma senza i tokens CSS non c'era nessun effetto visivo.