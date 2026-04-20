# Deadline Reminder Setup

The portal now has:

- `deadline_events` for editable calendar deadlines
- `reminder_preferences` for each user's email reminder settings
- `reminder_deliveries` to prevent duplicate sends
- `supabase/functions/send-deadline-reminders/index.ts` for email delivery
- `supabase/functions/send-application-decision/index.ts` for application approval/decline emails

## Supabase SQL

Run `supabase-setup.sql` in the Supabase SQL editor after uploading this version.

To make someone an admin for the deadline manager:

```sql
update public.profiles
set is_admin = true
where email = 'your-email@example.com';
```

## Edge Function Secrets

Set these secrets in Supabase before deploying the function. Do not commit real API keys to GitHub.

```bash
supabase secrets set RESEND_API_KEY=your_resend_api_key
supabase secrets set REMINDER_FROM_EMAIL="MIST Dallas <reminders@yourdomain.com>"
supabase secrets set SITE_URL="https://salwadin.github.io/mistdallas2027handbook/"
supabase secrets set CRON_SECRET=make-a-long-random-secret
```

Supabase provides `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` to Edge Functions automatically when deployed through the project.

Dashboard path:

1. Supabase project
2. Edge Functions
3. Secrets
4. Add `RESEND_API_KEY`
5. Add `REMINDER_FROM_EMAIL`
6. Add `SITE_URL`
7. Add `CRON_SECRET`

## Deploy Function

```bash
supabase functions deploy send-deadline-reminders
supabase functions deploy send-application-decision
```

Deploy with JWT verification disabled only if your scheduler cannot send a Supabase auth token. Keep `CRON_SECRET` set either way.

The application decision function is called from the portal by logged-in admins, so keep JWT verification enabled for that function.

## Schedule

Run the function daily from Supabase scheduled functions or another scheduler.

Recommended cadence:

```text
Every day at 9:00 AM America/Chicago
```

The function sends reminders only when:

- the user enabled email reminders
- a deadline is exactly `days_before` days away
- that user has not already received that reminder today

The scheduled request must include this header:

```text
x-cron-secret: your_CRON_SECRET_value
```
