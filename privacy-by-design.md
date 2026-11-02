# Privacy by Design — StudyVerse

**Status:** Draft for engineering and product review
**Version:** 0.1 — 2 November 2026
**Scope:** Phase 0 of the StudyVerse MVP (Phases 0–6)

> **This is not legal advice and it does not assert legal compliance.**
> StudyVerse is intended to operate in Morocco and to align with Law No. 09-08 on the protection of individuals with regard to the processing of personal data (promulgated by Dahir No. 1-09-15 of 18 February 2009) and with the guidance of the CNDP (Commission Nationale de contrôle de la protection des Données à caractère Personnel). All statements below describe intended product behaviour. Every item marked **[LEGAL REVIEW]** must be validated by a qualified Moroccan legal professional before launch. No filing, declaration or authorisation with the CNDP has been made, and no registration number exists.

---

## 1. Roles and scope

StudyVerse processes account and learning data for students, parents/guardians, teachers/moderators and administrators. The legal qualification of StudyVerse (data controller or processor), the role of schools or tutors if they use the product, and the contractual framework with hosting and AI providers are **[LEGAL REVIEW]** items.

This document covers:

- data already processed in Phase 0;
- data planned for Phases 1–6, documented now so that schema and access rules are designed before collection;
- technical and organisational safeguards, with an honest implementation status.

Nothing in this document authorises collecting more data than the product needs.

## 2. Data minimisation principles

1. **Collect only what a feature needs.** Phase 0 stores an email address, a display name, a server-controlled role, a preferred language and an onboarding timestamp.
2. **Birth year, not date of birth.** Phase 1 asks for birth year only, to apply age-appropriate consent rules without collecting an exact identifier.
3. **No sensitive data by design.** No health data, religious beliefs, ethnicity, precise location, national ID or payment data is planned. If a future feature would touch these categories, it stops for **[LEGAL REVIEW]** first.
4. **No advertising profiles.** StudyVerse does not plan behavioural advertising, ad networks or sale of personal data.
5. **Demo content only is labelled.** Curriculum content will be original and marked **DEMO DATA** until verified sources and licences are recorded. No data is scraped into the product.

## 3. Data inventory

### 3.1 Processed in Phase 0

| Data               | Purpose                                                 | Location                                                | Retention (current)                      | Notes                                                         |
| ------------------ | ------------------------------------------------------- | ------------------------------------------------------- | ---------------------------------------- | ------------------------------------------------------------- |
| Email address      | Account identity, authentication, confirmation          | Supabase `auth.users`                                   | Until account deletion                   | Required by Supabase Auth                                     |
| Password           | Authentication                                          | Supabase `auth.users` (hashed, not readable by the app) | Until changed/deleted                    | Never logged or sent to client code                           |
| Display name       | Greeting and profile display                            | `public.profiles.display_name`                          | Until account deletion                   | 2–60 characters; client cannot change role                    |
| Role               | Authorisation (`student`, `parent`, `teacher`, `admin`) | `public.profiles.role`                                  | Until account deletion                   | Defaults to `student`; not grantable to authenticated clients |
| Preferred language | UI language (`fr`, `ar`, `dar`)                         | `public.profiles.preferred_language`                    | Until account deletion                   | Also mirrored in browser `localStorage`                       |
| Onboarding status  | Route/feature gating                                    | `public.profiles.onboarded_at`                          | Until account deletion                   | Not yet set by any UI in Phase 0                              |
| Session tokens     | Keep the user signed in                                 | Browser `localStorage` key `studyverse.auth`            | Until sign-out or expiry/refresh failure | Supabase PKCE session; cleared on sign-out                    |
| Theme preference   | Light/dark UI                                           | Browser `localStorage` key `studyverse.theme`           | Until browser storage is cleared         | Device-local, not sent to the server                          |

### 3.2 Planned for later phases (not yet implemented)

| Data                                            | Phase | Purpose                                       | Proposed retention                                                |
| ----------------------------------------------- | ----- | --------------------------------------------- | ----------------------------------------------------------------- |
| Level, grade, lycée stream, subjects            | 1     | Personalise content                           | Account lifetime                                                  |
| Birth year                                      | 1     | Age-appropriate consent and safeguards        | Account lifetime                                                  |
| Guardian consent record                         | 1     | Demonstrate consent and scope                 | Account lifetime plus an accountability period **[LEGAL REVIEW]** |
| Parent–child link                               | 1     | Parental oversight limited to linked children | Until unlink or account deletion                                  |
| AI prompts, conversations and generated answers | 3     | Tutoring history                              | Configurable, default short (30 days proposed) **[LEGAL REVIEW]** |
| Uploaded images (homework)                      | 3     | Explain or answer a question                  | Short-lived; deleted after processing (proposal)                  |
| Quiz responses and scores                       | 4     | Feedback and progress                         | Account lifetime                                                  |
| Planner entries                                 | 5     | Revision planning                             | Account lifetime                                                  |
| Gamification events                             | 6     | Streaks and badges                            | Account lifetime                                                  |
| Moderation reports and decisions                | 3     | Safety and abuse handling                     | 12 months proposed **[LEGAL REVIEW]**                             |
| Security/audit logs                             | 1+    | Abuse detection and accountability            | 90 days proposed **[LEGAL REVIEW]**                               |

Any new field must be added to this inventory before it ships.

## 4. Access control and RLS matrix

RLS is enabled on every table. The current policies implement the student row below; the other roles are placeholders for later phases and must not be shipped as permissive defaults.

| Actor             | Current access                                       | Target access (Phases 1+)                                                                  |
| ----------------- | ---------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| Anonymous         | Marketing pages, `/privacy`, auth endpoints          | Same                                                                                       |
| Student           | Read/update own profile (except `role`); own session | Own learning data, own quizzes, own planner, own AI conversations                          |
| Parent/guardian   | None yet                                             | Read-only oversight of **linked children only**; no access to unrelated students           |
| Teacher/moderator | None yet                                             | **Reported content only**, scoped to the report; no browsing of student records            |
| Admin             | None yet                                             | Operational actions through audited server paths; least privilege; no silent impersonation |
| Service role      | Server-only secret; never in the browser             | Same                                                                                       |

Implemented hardening:

- `public.profiles` policies use `auth.uid() = id` for select and update.
- `revoke all` followed by `grant select` and column-level `grant update (display_name, preferred_language, onboarded_at)` blocks role escalation even if a policy is later misconfigured.
- The profile-creation trigger is `security definer` with `search_path = ''`.
- Every failure is surfaced as an error state; there is no "pretend success" path.

## 5. Law 09-08 considerations

The following are planning notes, not conclusions.

1. **Prior formalities.** Processing personal data in Morocco generally triggers prior declaration or, for certain processing, authorisation from the CNDP. Which formalities apply to an education platform for minors, and the filing pack, are **[LEGAL REVIEW]**. No filing has been made.
2. **Legal basis.** Consent, contract performance and legitimate interest may each apply to different purposes. Guardian consent is a product requirement for minors; how consent is captured, evidenced and withdrawn must be validated. **[LEGAL REVIEW]**
3. **Minors.** The age below which guardian consent is mandatory, what happens between that age and majority, and how consent is verified without collecting unnecessary identity documents are **[LEGAL REVIEW]**. Product rule from Phase 1: a student account that requires guardian consent stays limited until consent is recorded.
4. **Data subject rights.** Access, rectification, erasure and objection must be operable. Proposed workflow: identity verification, in-product request, export in a portable format, deletion of account and learning data, and a documented response timeline. Statutory timelines and exceptions are **[LEGAL REVIEW]**.
5. **Cross-border transfers.** Supabase and AI providers may process data outside Morocco. Transfers require an adequacy analysis and, where applicable, CNDP authorisation. Hosting region, provider choice and transfer mechanism are **[LEGAL REVIEW]**.
6. **Security and confidentiality.** The law requires appropriate technical and organisational measures. Section 8 lists what exists and what is planned.
7. **Accountability.** Consent evidence, processing records and moderation decisions should be retained only as long as needed for accountability. Durations are **[LEGAL REVIEW]**.
8. **Point of contact.** A privacy contact and, if required, a designated data protection correspondent must be appointed before launch. Names and contact details are not yet designated. **[LEGAL REVIEW]**

## 6. Children and guardian oversight

- Only birth year is collected. Exact dates of birth and identity documents are not requested by default.
- Guardian consent is recorded as its own event (Phase 1), with the scope shown to the guardian in plain language in French, Arabic or Darija.
- Parent access is limited by RLS to children they are linked to. Linking requires consent from both sides where applicable and can be revoked.
- AI features for minors must not use conversations for model training, and must apply stricter safety and rate limits. Provider configuration must be verified contractually, not assumed.
- Deletion requests from a guardian for a linked child are treated as account deletion requests, subject to any legal retention obligations.

## 7. Storage, uploads and AI (planned controls)

These controls are **not yet implemented**; they are the contract for Phase 3.

### Uploads

- Private Supabase Storage buckets only; no public buckets.
- Server-issued signed URLs with **short expiry**; the client never receives a storage credential.
- Allowlisted MIME types (images only for homework capture), size limits, and server-side validation of type and dimensions.
- Files are scoped to the owning student and deleted according to the retention rule.
- Metadata stripping and malware scanning are desirable; their inclusion is **[LEGAL REVIEW / SECURITY REVIEW]**.

### AI

- AI provider keys exist **only** as Supabase Edge Function secrets. The frontend never sees them and never calls a provider directly.
- The Edge Function authenticates the user, enforces quotas, applies moderation and streams the answer.
- Prompts are minimised: no email, display name or guardian data is sent to the model unless a feature demonstrably needs it.
- Provider retention and training settings must be configured and verified. Data processing agreements and transfer analysis are **[LEGAL REVIEW]**.
- Safety: age-appropriate refusal policies, reporting, rate limits and moderation of both input and output.

## 8. Security measures

**Implemented in Phase 0**

- TLS in transit (hosting provider); no secrets in the repository; `.env.example` contains public values only.
- Supabase anon key only in the browser; RLS on the profiles table; column-level grants prevent role escalation.
- Zod validation at environment and form boundaries; typed Supabase client; no `any`.
- Session cleared on sign-out; protected routes redirect when unauthenticated.
- CSP in `vercel.json` limited to self and the Supabase project; dependency and secret hygiene documented.
- Error boundary and explicit loading/empty/error states; no silent failures.

**Planned**

- Short-lived signed URLs, private buckets, MIME allowlists, upload limits.
- Server-side rate limits and moderation for AI and quiz endpoints.
- Audit logging for moderator and admin actions.
- Regular dependency scanning and secret scanning in CI.
- Documented backup encryption and restore testing.

## 9. Retention (proposal)

| Record                                     | Proposed rule                                          |
| ------------------------------------------ | ------------------------------------------------------ |
| Account and profile                        | Until deletion request, then removed                   |
| Learning data (quizzes, planner, progress) | Deleted with the account                               |
| AI conversations                           | Short default retention, user-clearable                |
| Uploaded images                            | Deleted after processing                               |
| Consent evidence                           | Retained for the accountability period required by law |
| Moderation records                         | 12 months after resolution                             |
| Security logs                              | 90 days                                                |

All durations are proposals pending **[LEGAL REVIEW]**. Deletion must also cover backups within the documented backup rotation window.

## 10. Logging, analytics and telemetry

Phase 0 includes **no third-party analytics, advertising SDKs or error-reporting trackers**. Server and hosting logs may contain IP addresses and request metadata as an inherent part of operating the service; their retention and access are **[LEGAL REVIEW]**. Any future analytics must be documented here, minimised, and gated behind consent where required before it is enabled.

## 11. Breach response (proposal)

1. Detect and contain; revoke exposed credentials.
2. Assess scope, affected users (including minors) and risk.
3. Notify the CNDP and affected individuals where required, within the timeline set by law.
4. Record the incident and remediation; update this document.

Notification thresholds, timelines and wording are **[LEGAL REVIEW]**.

## 12. Open items requiring legal review

- [ ] Qualification of StudyVerse as controller/processor and the school/tutor relationship.
- [ ] CNDP declaration/authorisation requirements and filing pack.
- [ ] Age threshold and consent-evidence method for minors and guardians.
- [ ] Lawful basis per purpose, including AI tutoring and moderation.
- [ ] Cross-border transfer mechanism for Supabase and AI providers.
- [ ] Provider data processing agreements and no-training commitments.
- [ ] Retention schedule and deletion/backup windows.
- [ ] Data subject request workflow, identity verification and statutory timelines.
- [ ] Privacy contact / data protection correspondent designation.
- [ ] Breach notification procedure.
- [ ] Content licensing and curriculum source verification (separate legal review).

## 13. References

- Law No. 09-08 on the protection of individuals with regard to the processing of personal data, promulgated by Dahir No. 1-09-15 of 18 February 2009 (Morocco).
- CNDP guidance and formalities (Commission Nationale de contrôle de la protection des Données à caractère Personnel).
- In-app draft notice: `/privacy` (French, Arabic, Darija).

---

_This document must be reviewed and approved by qualified Moroccan counsel before any public launch, and re-reviewed whenever a new data category, provider or cross-border flow is introduced._
