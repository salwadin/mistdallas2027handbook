import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const resendApiKey = Deno.env.get("RESEND_API_KEY")!;
const fromEmail = Deno.env.get("REMINDER_FROM_EMAIL") || "MIST Dallas <onboarding@resend.dev>";
const siteUrl = Deno.env.get("SITE_URL") || "https://salwadin.github.io/mistdallas2027handbook/";

const supabase = createClient(supabaseUrl, serviceRoleKey);

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders() });
  }

  if (!resendApiKey) {
    return json({ ok: false, error: "Missing RESEND_API_KEY secret" }, 500);
  }

  const token = request.headers.get("Authorization")?.replace("Bearer ", "");
  if (!token) return json({ ok: false, error: "Missing auth token" }, 401);

  const { data: authData, error: authError } = await supabase.auth.getUser(token);
  if (authError || !authData.user) return json({ ok: false, error: "Unauthorized" }, 401);

  const { data: adminProfile } = await supabase
    .from("profiles")
    .select("id,is_admin,full_name,email")
    .eq("id", authData.user.id)
    .maybeSingle();

  if (!adminProfile?.is_admin) {
    return json({ ok: false, error: "Only admins can send application emails" }, 403);
  }

  const body = await request.json().catch(() => ({}));
  const applicationId = String(body.application_id || "");
  const decision = String(body.decision || "");
  const roleTitle = String(body.role_title || "the role");

  if (!applicationId || !["approved", "declined", "pending"].includes(decision)) {
    return json({ ok: false, error: "Missing application_id or valid decision" }, 400);
  }

  const { data: application, error: applicationError } = await supabase
    .from("role_applications")
    .select("*")
    .eq("id", applicationId)
    .maybeSingle();

  if (applicationError || !application) {
    return json({ ok: false, error: applicationError?.message || "Application not found" }, 404);
  }

  if (!application.email) {
    return json({ ok: false, error: "Application is missing an email" }, 400);
  }

  const response = await sendDecisionEmail({
    to: application.email,
    name: application.full_name,
    decision,
    roleTitle,
    reviewNotes: application.review_notes || "",
    adminName: adminProfile.full_name || adminProfile.email || "MIST Dallas"
  });

  if (!response.ok) {
    return json({ ok: false, error: await response.text() }, 500);
  }

  return json({ ok: true, sent: true });
});

async function sendDecisionEmail(input: {
  to: string;
  name: string;
  decision: string;
  roleTitle: string;
  reviewNotes: string;
  adminName: string;
}) {
  const decisionLabel = input.decision === "approved"
    ? "Application approved"
    : input.decision === "declined"
      ? "Application update"
      : "Application pending";

  const subject = `MIST Dallas ${decisionLabel}: ${input.roleTitle}`;
  const message = decisionMessage(input.decision, input.roleTitle);
  const html = `
    <div style="font-family:Inter,Arial,sans-serif;line-height:1.55;color:#0f172a">
      <h2>${escapeHtml(decisionLabel)}</h2>
      <p>Assalamu alaykum ${escapeHtml(input.name || "there")},</p>
      <p>${message}</p>
      ${input.reviewNotes ? `<p><strong>Notes from leadership:</strong><br>${escapeHtml(input.reviewNotes)}</p>` : ""}
      <p><a href="${siteUrl}">Open the MIST Dallas Portal</a></p>
      <p>Jazakum Allahu khair,<br>${escapeHtml(input.adminName)}</p>
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
      to: input.to,
      subject,
      html
    })
  });
}

function decisionMessage(decision: string, roleTitle: string) {
  if (decision === "approved") {
    return `Your application for ${escapeHtml(roleTitle)} has been approved. If you have already created your portal account with this same email, your role should now appear in the directory.`;
  }

  if (decision === "declined") {
    return `Thank you for applying for ${escapeHtml(roleTitle)}. Leadership reviewed your application and is not moving forward with this role assignment at this time. We still appreciate your willingness to serve MIST Dallas.`;
  }

  return `Your application for ${escapeHtml(roleTitle)} is still under review. Leadership may follow up with next steps.`;
}

function escapeHtml(value: string) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type"
  };
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders(), "Content-Type": "application/json" }
  });
}
