import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const resendApiKey = Deno.env.get("RESEND_API_KEY")!;
const fromEmail = Deno.env.get("REMINDER_FROM_EMAIL") || "MIST Dallas <reminders@example.com>";
const siteUrl = Deno.env.get("SITE_URL") || "https://salwadin.github.io/mistdallas2027handbook/";
const cronSecret = Deno.env.get("CRON_SECRET");

const supabase = createClient(supabaseUrl, serviceRoleKey);

Deno.serve(async (request) => {
  if (cronSecret) {
    const providedSecret = request.headers.get("x-cron-secret");
    if (providedSecret !== cronSecret) {
      return json({ ok: false, error: "Unauthorized" }, 401);
    }
  }

  if (!resendApiKey) {
    return json({ ok: false, error: "Missing RESEND_API_KEY secret" }, 500);
  }

  const today = new Date();
  const todayIso = toDateOnly(today);

  const { data: recipients, error } = await supabase
    .from("reminder_preferences")
    .select("user_id,email_enabled,days_before")
    .eq("email_enabled", true);

  if (error) return json({ ok: false, error: error.message }, 500);

  const results: unknown[] = [];

  for (const recipient of recipients || []) {
    const daysBefore = Number(recipient.days_before || 7);
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() + daysBefore);
    const targetIso = toDateOnly(targetDate);

    const { data: deadlines, error: deadlineError } = await supabase
      .from("deadline_events")
      .select("*")
      .eq("send_reminders", true)
      .eq("due_date", targetIso);

    if (deadlineError) {
      results.push({ user_id: recipient.user_id, error: deadlineError.message });
      continue;
    }

    for (const deadline of deadlines || []) {
      const { data: existing } = await supabase
        .from("reminder_deliveries")
        .select("id")
        .eq("user_id", recipient.user_id)
        .eq("deadline_id", deadline.id)
        .eq("reminder_date", todayIso)
        .maybeSingle();

      if (existing) {
        results.push({ user_id: recipient.user_id, deadline_id: deadline.id, skipped: "already_sent" });
        continue;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name,email,role_id,team")
        .eq("id", recipient.user_id)
        .maybeSingle();

      if (!profile?.email) {
        results.push({ user_id: recipient.user_id, deadline_id: deadline.id, skipped: "missing_email" });
        continue;
      }

      const emailResponse = await sendEmail(profile.email, deadline, daysBefore, profile.full_name);
      if (!emailResponse.ok) {
        results.push({ user_id: recipient.user_id, deadline_id: deadline.id, error: await emailResponse.text() });
        continue;
      }

      await supabase.from("reminder_deliveries").insert({
        user_id: recipient.user_id,
        deadline_id: deadline.id,
        reminder_date: todayIso
      });

      results.push({ user_id: recipient.user_id, deadline_id: deadline.id, sent: true });
    }
  }

  return json({ ok: true, results });
});

async function sendEmail(to: string, deadline: Record<string, string>, daysBefore: number, fullName?: string) {
  const subject = `MIST Dallas deadline in ${daysBefore} day${daysBefore === 1 ? "" : "s"}: ${deadline.title}`;
  const html = `
    <div style="font-family:Inter,Arial,sans-serif;line-height:1.5;color:#0f172a">
      <h2>${escapeHtml(deadline.title)}</h2>
      <p>Hi ${escapeHtml(fullName || "there")},</p>
      <p>This is your MIST Dallas reminder that the following deadline is coming up in ${daysBefore} day${daysBefore === 1 ? "" : "s"}.</p>
      <p><strong>Due:</strong> ${escapeHtml(deadline.date_label || deadline.due_date)}</p>
      <p>${escapeHtml(deadline.detail || "")}</p>
      <p><a href="${siteUrl}">Open the MIST Dallas Portal</a></p>
    </div>
  `;

  return fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from: fromEmail,
      to,
      subject,
      html
    })
  });
}

function toDateOnly(date: Date) {
  return date.toISOString().slice(0, 10);
}

function escapeHtml(value: string) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" }
  });
}
