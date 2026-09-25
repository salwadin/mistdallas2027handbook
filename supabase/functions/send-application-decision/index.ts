import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const FROM_EMAIL = Deno.env.get("REMINDER_FROM_EMAIL") || "noreply@mistdallas.org";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { application_id, decision, role_title, applicant_email, applicant_name } = await req.json();

    if (!applicant_email) {
      return new Response(JSON.stringify({ error: "Missing applicant_email" }), { status: 400 });
    }

    const name = applicant_name || "Organizer";
    const isSubmitted = decision === "submitted";
    const isApproved = decision === "approved";

    if (isSubmitted) {
      const subject = `Application received — MIST Dallas 2027`;
      const html = `
        <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;background:#ffffff;">
          <h2 style="color:#1a1a1a;margin-bottom:8px;">Assalamu Alaikum ${name},</h2>
          <p style="color:#444;font-size:16px;line-height:1.6;">
            We received your application for <strong>${role_title}</strong> on the MIST Dallas 2027 organizing team.
          </p>
          <p style="color:#444;font-size:16px;line-height:1.6;">
            Leadership will review your application and reach out with a decision. In the meantime, you can check your status anytime at:
          </p>
          <div style="text-align:center;margin:28px 0;">
            <a href="https://organizers.mistdallas.org" style="display:inline-block;padding:12px 24px;background:#1f8a9b;color:#ffffff;text-decoration:none;border-radius:8px;font-weight:700;font-size:15px;">
              Check Application Status
            </a>
          </div>
          <hr style="border:none;border-top:1px solid #eee;margin:24px 0;" />
          <p style="color:#aaa;font-size:12px;">MIST Dallas 2027 Organizing Team</p>
        </div>
      `;
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { "Authorization": `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({ from: `MIST Dallas <${FROM_EMAIL}>`, to: [applicant_email], subject, html }),
      });
      const resData = await res.json();
      if (!res.ok) return new Response(JSON.stringify({ error: resData }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      return new Response(JSON.stringify({ success: true, id: resData.id }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    let inviteLink = "https://organizers.mistdallas.org";

    if (isApproved) {
      // Generate a Supabase invite link so they can set up their account in one click
      const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
        auth: { autoRefreshToken: false, persistSession: false },
      });

      const { data: linkData, error: linkError } = await adminClient.auth.admin.generateLink({
        type: "invite",
        email: applicant_email,
        options: { redirectTo: "https://organizers.mistdallas.org" },
      });

      if (linkError) {
        console.error("Failed to generate invite link:", linkError);
        // Fall back to plain site link if invite generation fails
      } else if (linkData?.properties?.action_link) {
        inviteLink = linkData.properties.action_link;
      }
    }

    const subject = isApproved
      ? `You're in — MIST Dallas 2027 ${role_title}`
      : `MIST Dallas 2027 Application Update`;

    const html = isApproved
      ? `
        <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;background:#ffffff;">
          <h2 style="color:#1a1a1a;margin-bottom:8px;">Assalamu Alaikum ${name},</h2>
          <p style="color:#444;font-size:16px;line-height:1.6;">
            We're excited to welcome you to the <strong>MIST Dallas 2027</strong> organizing team as <strong>${role_title}</strong>.
          </p>
          <p style="color:#444;font-size:16px;line-height:1.6;">
            Click the button below to set up your organizer account and access your role workbook, phase tasks, and team resources.
          </p>
          <div style="text-align:center;margin:32px 0;">
            <a href="${inviteLink}" style="display:inline-block;padding:14px 28px;background:#c9a84c;color:#ffffff;text-decoration:none;border-radius:8px;font-weight:700;font-size:16px;">
              Set Up My Account
            </a>
          </div>
          <p style="color:#888;font-size:13px;line-height:1.5;">
            This link will expire in 24 hours. If you have any issues, reply to this email or reach out to your AD.
          </p>
          <hr style="border:none;border-top:1px solid #eee;margin:24px 0;" />
          <p style="color:#aaa;font-size:12px;">MIST Dallas 2027 Organizing Team</p>
        </div>
      `
      : `
        <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;background:#ffffff;">
          <h2 style="color:#1a1a1a;margin-bottom:8px;">Assalamu Alaikum ${name},</h2>
          <p style="color:#444;font-size:16px;line-height:1.6;">
            Thank you for your interest in joining the <strong>MIST Dallas 2027</strong> organizing team.
          </p>
          <p style="color:#444;font-size:16px;line-height:1.6;">
            After careful review, we are not moving forward with your application for <strong>${role_title}</strong> at this time.
            We appreciate the time you took to apply and encourage you to stay connected with MIST Dallas.
          </p>
          <hr style="border:none;border-top:1px solid #eee;margin:24px 0;" />
          <p style="color:#aaa;font-size:12px;">MIST Dallas 2027 Organizing Team</p>
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

    const resData = await res.json();

    if (!res.ok) {
      return new Response(JSON.stringify({ error: resData }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true, id: resData.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
