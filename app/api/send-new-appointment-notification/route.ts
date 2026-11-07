
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import nodemailer from "nodemailer";

export const runtime = "nodejs";

type Appointment = {
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  appointment_date: string;
  start_time: string;
  nail_length: string | null;
  nail_style: string | null;
  comments: string | null;
  inspiration_photos: string[] | null;
  status: string;
  services: { name: string } | { name: string }[] | null;
};

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export async function POST(request: Request) {
  try {
    const { appointmentId } = await request.json();

    if (
      typeof appointmentId !== "string" ||
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        appointmentId
      )
    ) {
      return NextResponse.json(
        { error: "Invalid appointment ID." },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const gmailUser = process.env.GMAIL_USER;
    const gmailPassword = process.env.GMAIL_APP_PASSWORD;

    if (!supabaseUrl || !serviceRoleKey || !gmailUser || !gmailPassword) {
      console.error("Missing notification environment variables.");

      return NextResponse.json(
        { error: "Notification service is not configured." },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const { data, error: appointmentError } = await supabase
      .from("appointments")
      .select(`
        customer_name,
        customer_email,
        customer_phone,
        appointment_date,
        start_time,
        nail_length,
        nail_style,
        comments,
        inspiration_photos,
        status,
        services ( name )
      `)
      .eq("id", appointmentId)
      .single();

    if (appointmentError || !data) {
      console.error("Could not retrieve appointment:", appointmentError);

      return NextResponse.json(
        { error: "Appointment not found." },
        { status: 404 }
      );
    }

    const appointment = data as unknown as Appointment;

    const service = Array.isArray(appointment.services)
      ? appointment.services[0]?.name
      : appointment.services?.name;

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: gmailUser,
        pass: gmailPassword,
      },
    });

    // Prepare inspiration photos as inline email attachments.
    const attachments: Array<{
      filename: string;
      content: Buffer;
      contentType: string;
      cid: string;
      contentDisposition: "inline";
    }> = [];

    for (const [index, path] of (
      appointment.inspiration_photos || []
    ).entries()) {
      try {
        const { data: signedPhoto, error: photoError } =
          await supabase.storage
            .from("appointment-inspiration")
            .createSignedUrl(path, 600);

        if (photoError || !signedPhoto?.signedUrl) {
          console.error("Could not create photo URL:", photoError);
          continue;
        }

        const response = await fetch(signedPhoto.signedUrl);

        if (!response.ok) {
          console.error("Could not download inspiration photo:", path);
          continue;
        }

        const contentType =
          response.headers.get("content-type") || "image/jpeg";

        const extension = contentType.includes("png")
          ? "png"
          : contentType.includes("webp")
            ? "webp"
            : contentType.includes("gif")
              ? "gif"
              : "jpg";

        attachments.push({
          filename: `inspiration-${index + 1}.${extension}`,
          content: Buffer.from(await response.arrayBuffer()),
          contentType,
          cid: `inspiration-${index}@setsbyesther`,
          contentDisposition: "inline",
        });
      } catch (photoError) {
        console.error("Error processing inspiration photo:", photoError);
      }
    }

    const photoHtml = attachments.length
      ? attachments
          .map(
            (photo) => `
              <div style="margin: 12px 0;">
                <img
                  src="cid:${photo.cid}"
                  alt="Inspiration photo"
                  style="width: 200px; max-width: 100%; border-radius: 10px; display: block;"
                />
              </div>
            `
          )
          .join("")
      : "<p>No inspiration photos uploaded.</p>";

    const photoText = attachments.length
      ? `${attachments.length} inspiration photo(s) attached.`
      : "No inspiration photos uploaded.";

    const name = escapeHtml(appointment.customer_name);
    const email = escapeHtml(appointment.customer_email);
    const phone = escapeHtml(appointment.customer_phone || "Not provided");
    const serviceName = escapeHtml(service || "Not available");
    const date = escapeHtml(appointment.appointment_date);
    const time = escapeHtml(appointment.start_time);
    const length = escapeHtml(appointment.nail_length || "Not provided");
    const style = escapeHtml(appointment.nail_style || "Not provided");
    const comments = escapeHtml(appointment.comments || "None");

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
    if (!siteUrl) {
        throw new Error("Missing NEXT_PUBLIC_SITE_URL environment variable.");
    }

    const dashboardUrl = `${siteUrl.replace(/\/$/, "")}/admin/appointments`;

    // OWNER NOTIFICATION
    const ownerHtml = `
      <div style="font-family: Arial, sans-serif; color: #333; max-width: 650px;">
        <h2 style="color: #a8872a;">New Appointment Request!</h2>

        <p>A new appointment request has been submitted through SetsByEsther.</p>

        <h3>Customer Information</h3>
        <p>
          <strong>Name:</strong> ${name}<br/>
          <strong>Email:</strong> ${email}<br/>
          <strong>Phone:</strong> ${phone}
        </p>

        <h3>Appointment Details</h3>
        <p>
          <strong>Service:</strong> ${serviceName}<br/>
          <strong>Date:</strong> ${date}<br/>
          <strong>Time:</strong> ${time}<br/>
          <strong>Status:</strong> ${escapeHtml(appointment.status)}
        </p>

        <h3>Nail Preferences</h3>
        <p>
          <strong>Length:</strong> ${length}<br/>
          <strong>Style:</strong> ${style}
        </p>

        <h3>Additional Comments</h3>
        <p>${comments}</p>

        <h3>Inspiration Photos</h3>
        ${photoHtml}

        <p style="margin-top: 30px;">
          <a href="${escapeHtml(dashboardUrl)}"
             style="background-color: #a8872a; color: white; padding: 12px 22px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Open Appointment Dashboard
          </a>
        </p>
      </div>
    `;

    const ownerText = `
A new appointment request has been submitted!

CUSTOMER
Name: ${appointment.customer_name}
Email: ${appointment.customer_email}
Phone: ${appointment.customer_phone || "Not provided"}

APPOINTMENT
Service: ${service || "Not available"}
Date: ${appointment.appointment_date}
Time: ${appointment.start_time}
Status: ${appointment.status}

NAIL PREFERENCES
Length: ${appointment.nail_length || "Not provided"}
Style: ${appointment.nail_style || "Not provided"}

COMMENTS
${appointment.comments || "None"}

${photoText}

Open your dashboard:
${dashboardUrl}
    `.trim();

    // CUSTOMER CONFIRMATION
    const customerHtml = `
      <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px;">
        <h2 style="color: #a8872a;">We've Received Your Request!</h2>

        <p>Hi ${name},</p>

        <p>
          Thank you for booking with SetsByEsther!
          Your appointment request has been successfully received.
        </p>

        <div style="background-color: #f8f5ed; padding: 18px; border-radius: 10px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Your Request Details</h3>
          <p>
            <strong>Service:</strong> ${serviceName}<br/>
            <strong>Date:</strong> ${date}<br/>
            <strong>Time:</strong> ${time}<br/>
            <strong>Nail Length:</strong> ${length}<br/>
            <strong>Nail Style:</strong> ${style}
          </p>
        </div>

        <h3>Inspiration Photos</h3>
        ${photoHtml}

        <p>
          Your request is currently <strong>pending approval</strong>.
          You will receive another email once your appointment has been reviewed.
        </p>

        <p>
          Please remember that your appointment is not confirmed until
          you receive an approval email.
        </p>

        <p>Thank you for choosing SetsByEsther!</p>
      </div>
    `;

    const customerText = `
Hi ${appointment.customer_name},

Thank you for booking with SetsByEsther!

We've successfully received your appointment request.

YOUR REQUEST
Service: ${service || "Not available"}
Date: ${appointment.appointment_date}
Time: ${appointment.start_time}
Nail Length: ${appointment.nail_length || "Not provided"}
Nail Style: ${appointment.nail_style || "Not provided"}

${photoText}

Your request is currently pending approval.
You will receive another email once your appointment has been reviewed.

Your appointment is not confirmed until you receive an approval email.

Thank you for choosing SetsByEsther!
    `.trim();

    // Send both emails.
    const results = await Promise.allSettled([
      transporter.sendMail({
        from: gmailUser,
        to: gmailUser,
        subject: `New Appointment Request - ${appointment.customer_name}`,
        text: ownerText,
        html: ownerHtml,
        attachments,
      }),

      transporter.sendMail({
        from: gmailUser,
        to: appointment.customer_email,
        subject: "We Received Your Appointment Request - SetsByEsther",
        text: customerText,
        html: customerHtml,
        attachments,
      }),
    ]);

    results.forEach((result, index) => {
      if (result.status === "rejected") {
        console.error(
          index === 0
            ? "Owner notification email failed:"
            : "Customer confirmation email failed:",
          result.reason
        );
      }
    });

    if (results.some((result) => result.status === "rejected")) {
      return NextResponse.json(
        { error: "One or more notification emails could not be sent." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      ownerEmailSent: true,
      customerEmailSent: true,
    });
  } catch (error) {
    console.error("New appointment notification error:", error);

    return NextResponse.json(
      { error: "Could not send appointment notifications." },
      { status: 500 }
    );
  }
}
