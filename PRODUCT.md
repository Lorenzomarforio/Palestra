# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

Nota: distribuita come app mobile tramite Tauri (webview) su Android/iOS. Wrapper nativo attorno a UI web: il linguaggio di design resta web mobile-first curato, non componenti OS nativi (SF Symbols, Material). Decisione confermata con l'utente dopo aver segnalato il vincolo architetturale.

## Users

Atleti che si allenano in palestra e vogliono tracciare i propri progressi (pesi, ripetizioni, serie) nel tempo. Utente singolo, non un personal trainer che gestisce più clienti.

## Product Purpose

App mobile per registrare allenamenti e visualizzare l'andamento dei progressi nel tempo. Successo = l'utente riesce a loggare un allenamento in pochi secondi e vedere chiaramente se sta migliorando.

## Positioning

Dati locali, offline-first via SQLite (già integrato tramite `@tauri-apps/plugin-sql`): nessun account, nessun cloud, nessuna dipendenza da servizi esterni. Un concorrente come Strong o Hevy non potrebbe copiare questa promessa senza rinunciare al proprio modello cloud/account.

## Operating Context

Uso principale in palestra, spesso con connessione assente o instabile: l'app deve funzionare interamente offline. Costruita con Tauri 2 (Rust) + Next.js/React 19, targeting Android e iOS nativi tramite lo stesso codebase.

## Capabilities and Constraints

- Storage: SQLite locale via `@tauri-apps/plugin-sql`, nessun backend remoto.
- Piattaforma: web mobile-first, distribuita via Tauri webview su Android/iOS (nessun componente OS nativo).
- Nessun sistema di account/login previsto.

## Brand Commitments

Standing visual direction (confermata con l'utente, redesign completo): nessuna identità visiva concettuale distintiva. Linguaggio "canone" da fitness-tracker curato, eseguito a piena fedeltà, con Strong e Hevy come riferimento di craft (dark UI pulita, tipografia netta, grafici semplici e leggibili). Accento cromatico verde mantenuto dall'implementazione esistente (coerente con la metafora di progresso/crescita).

## Evidence on Hand

Nessuna evidenza (testimonial, dati d'uso, screenshot) ancora raccolta: da non inventare in lavori futuri.

## Product Principles

- Offline-first: ogni funzionalità core deve funzionare senza rete.
- Privacy by design: nessun dato lascia il device.
- Velocità di log: registrare un allenamento deve richiedere il minor numero di tocchi possibile.
- Chiarezza sui progressi: il valore del prodotto è nella leggibilità dell'andamento nel tempo, non nella quantità di feature.
