import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const FROM_EMAIL = Deno.env.get("REMINDER_FROM_EMAIL") || "noreply@mistdallas.org";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
      },
    });
  }

  try {
    const { application_id, decision, role_title, applicant_email, applicant_name } = await req.json();

    if (!applicant_email) {
      return new Response(JSON.stringify({ error: "Missing applicant_email" }), { status: 400 });
    }

    const isApproved = decision === "approved";
    const name = applicant_name || "Organizer";

    const subject = isApproved
      ? `You're in — MIST Dallas 2027 ${role_title}`
      : `MIST Dallas 2027 Application Update`;

    const html = isApproved
      ? `
        <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;">
          <h2 style="color:#1a1a1a;">Assalamu Alaikum ${name},</h2>
          <p style="color:#444;font-size:16px;">
            We're excited to welcome you to the MIST Dallas 2027 organizing team as <strong>${role_title}</strong>.
          </p>
          <p style="color:#444;font-size:16px;">
            Log in to your organizer handbook to get started with your role workbook and phase tasks.
          </p>
          <a href="https://organizers.mistdallas.org" style="display:inline-block;margin-top:16px;padding:12px 24px;background:#c9a84c;color:#fff;text-decoration:none;border-radius:8px;font-weight:600;">
            Open Organizer Handbook
          </a>
          <p style="color:#888;font-size:14px;margin-top:32px;">MIST Dallas 2027 Organizing Team</p>
        </div>
      `
      : `
        <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;">
          <h2 style="color:#1a1a1a;">Assalamu Alaikum ${name},</h2>
          <p style="color:#444;font-size:16px;">
            Thank you for your interest in joining the MIST Dallas 2027 organizing team.
          </p>
          <p style="color:#444;font-size:16px;">
            After careful review, we are not moving forward with your application for <strong>${role_title}</strong> at this time.
            We appreciate the time you took to apply and encourage you to stay connected with MIST Dallas.
          </p>
          <p style="color:#888;font-size:14px;margin-top:32px;">MIST Dallas 2027 Organizing Team</p>
        </div>
      `;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: `MIST Dallas <${FROM_EMAIL}>`,
        to: [applicant_email],
        subject,
        html,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      return new Response(JSON.stringify({ error: data }), { status: 500 });
    }

    return new Response(JSON.stringify({ success: true, id: data.id }), {
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
});
