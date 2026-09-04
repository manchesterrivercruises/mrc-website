# Offboarding Checklist

Run this **the day someone stops working on Manchester River Cruises** — contractor, agency,
freelancer or staff. One page, tick every box.

Access is not just accounts. Several of these systems keep a live token or session that
**survives removing the person**, so revocation has to be explicit.

> **Do it in the order below.** GitHub and Netlify first: those two together are enough to ship
> code to production, so they are the ones that matter most in the first hour.

---

## 1. GitHub

- [ ] **Remove the collaborator** from `manchesterrivercruises/mrc-website`
      (Settings → Collaborators and teams → Remove).
- [ ] **Revoke their authorisation of the Keystatic GitHub App**
      (Settings → Applications → Authorized GitHub Apps → the Keystatic app → Revoke).

  ⚠ **This is the one people miss, and removing the collaborator does NOT do it.** The CMS
  signs a user in through a GitHub App. That produces:

  | Token | Lifetime |
  |---|---|
  | Access token | **8 hours** |
  | Refresh token | **6 months** |

  So a session that was live when they left can keep working for up to 8 hours, and the refresh
  token can mint new ones for **up to six months** unless the authorisation is revoked. Since
  Keystatic commits straight to `main` and `main` auto-deploys, that is a path to production.
  Revoke it, then confirm no unexpected commits appear on `main`.

- [ ] **Check for personal access tokens / SSH keys / deploy keys** they added to the repo
      (Settings → Deploy keys; and ask them to revoke any PAT they created).
- [ ] **Rotate any secret they could have read** — see §7.

---

## 2. Netlify

- [ ] **Remove their team seat** (Team → Members → Remove).
- [ ] **Revoke personal access tokens** they created (User settings → Applications → Personal
      access tokens). A PAT keeps working after the seat is removed if it was issued to a token,
      not a session.
- [ ] **Check for a linked Git account / build hooks** they created (Site configuration → Build
      & deploy → Build hooks). A build hook URL is an unauthenticated deploy trigger — delete
      any they own.
- [ ] Confirm they are not the **owner** of the site or team; transfer first if so.

---

## 3. Ventrata

- [ ] **Remove their dashboard user** (Ventrata dashboard → Settings → Users).
- [ ] Confirm they hold no separate **supplier/reseller login**.
- [ ] If they had API access, **rotate the OCTO connection key** (§7) — it is a single shared
      credential, so removing the user does not invalidate it.

---

## 4. Analytics & marketing

- [ ] **Google Tag Manager** — remove from the container (Admin → User Management). Check both
      *account* and *container* level; removing one does not remove the other.
- [ ] **Google Analytics 4** — remove from the property and the account (Admin → Access
      Management, again at both levels).
- [ ] **Klaviyo** — remove the user (Settings → Users). Also check for **API keys** they
      created (Settings → API keys) and revoke those.

---

## 5. Google Cloud

- [ ] **Remove their IAM principal** from the project (IAM & Admin → IAM).
- [ ] Check **service accounts** they created, and whether any key they hold is still active
      (IAM → Service accounts → Keys). A downloaded service-account key keeps working until it
      is deleted — removing the person does nothing to it.
- [ ] If they had access to the **Places API key**, rotate it (§7).

---

## 6. Everything else they touched

- [ ] Domain registrar / DNS account.
- [ ] Email or shared inbox access.
- [ ] Password manager: remove from any shared vault, and confirm which items they could see.
- [ ] Any shared drive / Notion / Figma holding credentials or customer data.

---

## 7. Secret rotation — what to rotate, and when

Rotate anything the person could have read. Removing their access does **not** invalidate a
credential they already copied.

| Secret | Where it lives | Rotate if they… |
|---|---|---|
| `VENTRATA_OCTO_KEY` | Netlify env | had Netlify or Ventrata access |
| `VENTRATA_CHECKOUT_API_KEY` | Netlify env (public in DOM) | — low value, but rotate with the above |
| `KEYSTATIC_SECRET` | Netlify env | had Netlify access — this signs CMS sessions |
| Keystatic GitHub App client secret | Netlify env | had Netlify access |
| `GOOGLE_PLACES_API_KEY` | Netlify env | had Netlify or Google Cloud access |
| Netlify build hooks | Netlify site config | had Netlify access |

- [ ] Rotate each applicable secret, redeploy, and confirm the site still builds and the
      checkout, date finder and reviews all still work.

**Rotating `KEYSTATIC_SECRET` invalidates every live CMS session**, including Simon's — expect
to sign in again. That is the intended effect.

---

## 8. Confirm

- [ ] Watch `main` for **48 hours** for unexpected commits (Keystatic writes to `main` directly,
      so a lingering CMS session shows up there).
- [ ] Check the Netlify **deploy log** for deploys not triggered by a known person.
- [ ] Record the date and who ran this checklist, below.

| Date | Person offboarded | Run by | Notes |
|---|---|---|---|
|  |  |  |  |
