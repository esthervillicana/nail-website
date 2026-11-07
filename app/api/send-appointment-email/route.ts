
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import nodemailer from "nodemailer";

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };

    return entities[character];
  });
}

export async function POST(request: Request) {
  try {
    // Verify admin authentication.
    const authorization = request.headers.get("Authorization");
    const token = authorization?.startsWith("Bearer ")
      ? authorization.slice(7)
      : "";

    if (!token) {
      return NextResponse.json(
        { error: "Authentication required." },
        { status: 401 }
      );
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
        global: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      }
    );

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json(
        { error: "Invalid authentication." },
        { status: 401 }
      );
    }

    const { data: admin, error: adminError } = await supabase
      .from("admin_users")
      .select("user_id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (adminError || !admin) {
      return NextResponse.json(
        { error: "Administrator access required." },
        { status: 403 }
      );
    }

    const { appointmentId } = await request.json();

    if (!appointmentId || typeof appointmentId !== "string") {
      return NextResponse.json(
        { error: "Invalid appointment ID." },
        { status: 400 }
      );
    }

    // Get the appointment directly from Supabase.
    const { data: appointment, error: appointmentError } =
      await supabase
        .from("appointments")
        .select(`
          id,
          customer_name,
          customer_email,
          appointment_date,
          start_time,
          status,
          services ( name )
        `)
        .eq("id", appointmentId)
        .maybeSingle();

    if (appointmentError || !appointment) {
      return NextResponse.json(
        { error: "Appointment not found." },
        { status: 404 }
      );
    }

    if (!["approved", "declined", "cancelled"].includes(appointment.status)) {      return NextResponse.json(
        { error: "This appointment has not been approved or declined." },
        { status: 400 }
      );
    }

    if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
      return NextResponse.json(
        { error: "Gmail is not configured." },
        { status: 500 }
      );
    }

    // Configure Gmail SMTP.
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    const approved = appointment.status === "approved";
    const cancelled = appointment.status === "cancelled";
    
    const formattedDate = new Date(
      `${appointment.appointment_date}T12:00:00`
    ).toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });

    const [hours, minutes] = appointment.start_time.split(":");
    const hour = Number(hours);

    const formattedTime = `${hour % 12 || 12}:${minutes} ${
      hour >= 12 ? "PM" : "AM"
    }`;

    const customerName = escapeHtml(appointment.customer_name);
    const serviceName = escapeHtml(
      appointment.services?.[0]?.name ?? "Nail Appointment"
    );

    // Send the notification.
    const info = await transporter.sendMail({
      from: `"SetsByEsther" <${process.env.GMAIL_USER}>`,
      to: appointment.customer_email,
      subject: approved
        ? "Your SetsByEsther Appointment Is Confirmed!"
        : cancelled
            ? "Your SetsByEsther Appointment Has Been Cancelled"
            : "Update on Your SetsByEsther Appointment Request",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 30px; color: #222;">
          <h1 style="color: #b8860b;">SetsByEsther</h1>
          <h2>${approved ? "Appointment Confirmed!" : "Appointment Request Update"}</h2>

          <p>Hi ${customerName},</p>

          <p>
           ${
            approved
                ? "Your appointment has been approved! I look forward to seeing you."
                : cancelled
                ? "Your appointment has been cancelled. If you have any questions or would like to schedule another appointment, please feel free to reach out."
                : "Unfortunately, your requested appointment could not be accommodated. Please feel free to submit another request."
            }
          </p>

          <div style="background: #f7f4f8; padding: 20px; border-radius: 12px;">
            <p><strong>Service:</strong> ${serviceName}</p>
            <p><strong>Date:</strong> ${formattedDate}</p>
            <p><strong>Time:</strong> ${formattedTime}</p>
            <p><strong>Status:</strong> ${appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}</p>          </div>

          <p style="margin-top: 25px;">
            Thank you for choosing SetsByEsther!
          </p>
        </div>
      `,
    });

    return NextResponse.json({
      success: true,
      messageId: info.messageId,
    });
  } catch (error) {
    console.error("Gmail email error:", error);

    return NextResponse.json(
      { error: "Could not send appointment email." },
      { status: 500 }
    );
  }
}
