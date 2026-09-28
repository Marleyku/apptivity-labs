# Prompt: keep a live `dist/` immune to the rebuild race

Use this whenever a site serves a production build from `dist/` (Vite preview, Wrangler, systemd, or a local `serve` script) and anything rebuilds that directory while it is being served.

## Symptom

The check that “dist matches the working tree” exits 0, but the browser still shows the previous UI. Or the app 404s for several seconds during a rebuild. Refresh does not help until a later build happens to win.

## Cause

1. A watcher runs `vite build` on an interval. Vite’s default `emptyOutDir` **deletes `dist/` at the start** of the build.
2. Killing only the processes bound to the preview and API ports does **not** kill that watcher. The shell is reparented to init (PPID 1) and keeps looping.
3. The next serve starts a **second** watcher. Two builds empty `dist/` at the same time.
4. If the “this build matches these sources” stamp is stored **inside `dist/`**, the wipe deletes it. A later process writes a stamp for the **current** source tree onto a bundle compiled from an **older** tree. The check goes green. The UI is stale.
5. A long-lived `node server/index.js` (no `--watch`) keeps the old server in memory, so API edits look unsynced even when the client bundle is fresh.

## Required guard

Do not rebuild a live `dist/` in place. Implement all of the following:

1. **One watcher.** Take `flock` on a lock **outside** `dist/` (`.serve/watch.lock`) for the life of the watcher. A second watcher must exit immediately. Starting serve must terminate leftover watcher processes, not only port PIDs.
2. **One build.** Take `flock` on `.serve/build.lock` for the build. Under the lock, re-check the stamp; if another build already published this tree, skip.
3. **Stage, then swap.** Build to `dist.staging` (`vite build --outDir dist.staging --emptyOutDir`). Validate `version.json` there. Only then move the live `dist/` aside and move staging into place. Delete the previous tree after the swap. The running preview keeps the last good `dist/` for the whole compile.
4. **Stamp outside `dist/`.** Write `.serve/source-stamp` with the content fingerprint of the tree that was **compiled**, captured **before** `vite build` (HEAD sha plus hashes of client, server, `index.html`, Vite config, `public`, and package manifests). If files change during the build, the next poll must rebuild. Never stamp the post-build tree — that makes the check pass while the bundle is stale.
5. **SHA equality is not freshness.** `dist/version.json` containing the current git SHA does not prove the working tree is in the bundle. Uncommitted edits share that SHA.
6. **Restart the API** on server file changes (`node --watch` or equivalent). A client rebuild is not an API reload.
7. **Do not start a second serve** beside one that is already up.

Ignore generated trees (`public/ocr` or similar prebuild copies) in the fingerprint so the poll does not flap or hash huge binaries.

Add `.serve/`, `dist.staging/`, and `dist.previous/` to `.gitignore`.

## Do not

- Store the source stamp inside `dist/`
- `vite build` straight into a `dist/` a running preview is serving
- Treat “I killed the port” as “the watcher is dead”
- Tell the user the UI is live only because a stamp check exited 0, unless this guard produced that `dist/`

## Reference

Teaching: `scripts/ensure-serve-fresh.sh`, `scripts/watch-serve-dist.sh`, `.cursor/rules/serve-dist-sync.mdc`.
