# `public/.well-known/`

Files here are copied by Astro to the site root under `/.well-known/` at build.

## Apple Pay domain association (pre-launch blocker)

`apple-developer-merchantid-domain-association.placeholder` is a **placeholder only**.

Apple Pay in the Ventrata checkout needs the real domain association file served,
byte-for-byte, at `/.well-known/apple-developer-merchantid-domain-association`
(**no file extension**).

**Before launch**, obtain the real file from Ventrata / the payment provider and add
it to this folder as `apple-developer-merchantid-domain-association` (exact name, no
extension) — replacing the placeholder. Then verify after DNS cutover:

```
curl -i https://manchesterrivercruises.com/.well-known/apple-developer-merchantid-domain-association
```

It must return `HTTP 200` with the raw file contents. If it is missing or wrong,
Apple Pay silently will not offer at checkout.

See `docs/ventrata-integration.md` → "Apple Pay domain association file" and
`docs/launch-checklist.md`.
