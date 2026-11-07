
"use client";
import { supabase } from "@/lib/supabase";
import Image from "next/image";
import { useEffect, useState, type ChangeEvent } from "react";


const lengths = ["Short", "Medium", "Long", "XL"] as const;

const styles = [
  {
    id: "full-color",
    name: "Full Color",
    description: "A solid color or simple finish.",
  },
  {
    id: "custom-design",
    name: "Custom Design",
    description: "Nail art, patterns, French tips, charms, and more.",
  },
] as const;
type Service = {
  id: string;
  name: string;
  price: number;
  duration_minutes: number;
};

// Individual photo preview
function PhotoPreview({
  photo,
  onRemove,
}: {
  photo: File;
  onRemove: () => void;
}) {
  const [previewUrl, setPreviewUrl] = useState("");

  useEffect(() => {
    const url = URL.createObjectURL(photo);
    setPreviewUrl(url);

    return () => URL.revokeObjectURL(url);
  }, [photo]);

  return (
    <div className="flex items-center gap-4 rounded-xl border border-white/10 bg-white/5 p-3">
      {previewUrl && (
        <Image
          src={previewUrl}
          alt={`Inspiration photo: ${photo.name}`}
          width={80}
          height={80}
          unoptimized
          className="h-20 w-20 rounded-lg object-cover"
        />
      )}

      <span className="min-w-0 flex-1 truncate text-sm">
        {photo.name}
      </span>

      <button
        type="button"
        onClick={onRemove}
        className="text-sm text-red-400 transition hover:text-red-300"
      >
        Remove
      </button>
    </div>
  );
}
function formatSlotTime(time: string) {
  const [hours, minutes] = time.split(":");
  const hour = Number(hours);
  const period = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;

  return `${displayHour}:${minutes} ${period}`;
}

export default function BookingPage() {
  const [appointmentDate, setAppointmentDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [slotLoading, setSlotLoading] = useState(false);
  const [slotError, setSlotError] = useState("");

  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  
  const [services, setServices] = useState<Service[]>([]);
  const [serviceLoading, setServiceLoading] = useState(true);
  const [serviceError, setServiceError] = useState("");
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState("");
  const [requestSubmitted, setRequestSubmitted] = useState(false);

  useEffect(() => {
    async function loadServices() {
      const { data, error } = await supabase
        .from("services")
        .select("id, name, price, duration_minutes")
        .eq("active", true)
        .order("name");

      if (error) {
        setServiceError(error.message);
      } else {
        setServices(data ?? []);
      }

      setServiceLoading(false);
    }

    loadServices();
  }, []);
  
  const [service, setService] = useState("");
  const [length, setLength] = useState("");
  const [style, setStyle] = useState("");
  const [photos, setPhotos] = useState<File[]>([]);
  const [comments, setComments] = useState("");
  useEffect(() => {
    if (!service || !appointmentDate) {
      setAvailableSlots([]);
      setSelectedTime("");
      return;
    }

    let cancelled = false;

    async function loadAvailableSlots() {
      setSlotLoading(true);
      setSlotError("");
      setSelectedTime("");

      const { data, error } = await supabase.rpc(
        "get_available_appointment_slots",
        {
          p_service_id: service,
          p_appointment_date: appointmentDate,
        }
      );

      if (cancelled) return;

      if (error) {
        setSlotError(error.message);
        setAvailableSlots([]);
      } else {
        setAvailableSlots(
          (data ?? []).map((slot: { slot_start: string }) => slot.slot_start)
        );
      }

      setSlotLoading(false);
    }

    loadAvailableSlots();

    return () => {
      cancelled = true;
    };
  }, [service, appointmentDate]);

  const [photoError, setPhotoError] = useState("");
  const [validationMessage, setValidationMessage] = useState("");

  function handlePhotoUpload(event: ChangeEvent<HTMLInputElement>) {
    const selectedFiles = Array.from(event.target.files ?? []);
    const validFiles = selectedFiles.filter((file) =>
      ["image/png", "image/jpeg", "image/webp"].includes(file.type)
    );

    const remainingSlots = 5 - photos.length;
    const filesToAdd = validFiles.slice(0, remainingSlots);

    setPhotos((current) => [...current, ...filesToAdd]);

    if (validFiles.length !== selectedFiles.length) {
      setPhotoError("Only PNG, JPG, and WEBP images are allowed.");
    } else if (validFiles.length > remainingSlots) {
      setPhotoError("You can upload a maximum of 5 photos.");
    } else {
      setPhotoError("");
    }

    event.target.value = "";
  }

  async function handleContinue() {
    const missingFields = [];

    if (!service) missingFields.push("service");
    if (!length) missingFields.push("length");
    if (!style) missingFields.push("style");
    if (!appointmentDate) missingFields.push("appointment date");
    if (!selectedTime) missingFields.push("appointment time");
    if (!customerName.trim()) missingFields.push("name");
    if (!customerEmail.trim()) missingFields.push("email");

    if (missingFields.length > 0) {
      setValidationMessage(
        `Please complete the following: ${missingFields.join(", ")}.`
      );
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail.trim())) {
      setValidationMessage("Please enter a valid email address.");
      return;
    }

    if (photos.some((photo) => photo.size > 5 * 1024 * 1024)) {
      setValidationMessage("Each inspiration photo must be 5 MB or smaller.");
      return;
    }

    setIsSubmitting(true);
    setSubmissionError("");
    setValidationMessage("");

    try {
      const uploadedPaths: string[] = [];

      // Upload inspiration photos.
      for (const photo of photos) {
        const safeFileName = photo.name.replace(/[^a-zA-Z0-9._-]/g, "_");
        const filePath = `${Date.now()}-${Math.random().toString(36).slice(2)}-${safeFileName}`;
        const { error: uploadError } = await supabase.storage
          .from("appointment-inspiration")
          .upload(filePath, photo, {
            contentType: photo.type,
            upsert: false,
          });

        if (uploadError) {
          throw new Error(`Photo upload failed: ${uploadError.message}`);
        }

        uploadedPaths.push(filePath);
      }

      // Submit the appointment request.
      const { data, error } = await supabase.rpc(
        "create_appointment_request_with_photos",
        {
          p_customer_name: customerName.trim(),
          p_customer_email: customerEmail.trim(),
          p_customer_phone: customerPhone.trim() || null,
          p_service_id: service,
          p_nail_length: length,
          p_nail_style: style,
          p_comments: comments.trim() || null,
          p_appointment_date: appointmentDate,
          p_start_time: selectedTime,
          p_inspiration_photos: uploadedPaths,
        }
      );

      if (error) {
        throw new Error(error.message);
      }

      if (!data) {
        throw new Error("The appointment request could not be confirmed.");
      }

      setRequestSubmitted(true);
      setValidationMessage("");
    } catch (error) {
      setSubmissionError(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  const selectedService = services.find((item) => item.id === service);

  return (
    <main className="min-h-screen bg-[#09090b] px-5 py-16 text-white">
      <div className="mx-auto max-w-3xl">
        <header className="mb-12 text-center">
          <p className="mb-3 text-sm uppercase tracking-[0.3em] text-[#edbcf0]">
            SetsByEsther
          </p>
          <h1 className="text-4xl font-semibold md:text-5xl">
            Book an Appointment
          </h1>
          <p className="mt-4 text-gray-400">
            Tell me a little about the set you have in mind.
          </p>
        </header>

        <div className="space-y-10">
          {/* Service selection */}
          
          <section>
            <h2 className="mb-5 text-2xl font-semibold">
              01. Choose Your Service
            </h2>
            {serviceLoading && (
              <p className="mb-4 text-sm text-gray-400">
                Loading services...
              </p>
            )}

            {serviceError && (
              <p className="mb-4 text-sm text-red-400">
                Could not load services: {serviceError}
              </p>
            )}

            <div className="grid gap-4 sm:grid-cols-3">
              {services.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setService(item.id);
                    setValidationMessage("");
                  }}
                  className={`rounded-2xl border p-5 text-left transition ${
                    service === item.id
                      ? "border-[#edbcf0] bg-[#edbcf0]/10"
                      : "border-white/15 bg-white/5 hover:border-[#edbcf0]/60"
                  }`}
                >
                  <h3 className="font-semibold">{item.name}</h3>
                  <p className="mt-3 text-xl text-[#edbcf0]">
                    ${item.price}
                  </p>
                  <p className="mt-1 text-xs text-gray-400">
                    {item.duration_minutes} minutes
                  </p>
                  {service === item.id && (
                    <p className="mt-2 text-xs text-[#edbcf0]">
                      Selected ✓
                    </p>
                  )}
                </button>
              ))}
            </div>
          </section>

          {/* Length selection */}
          <section>
            <h2 className="mb-2 text-2xl font-semibold">
              02. Choose Your Length
            </h2>
            <p className="mb-5 text-sm text-gray-400">
              Select the length you'd like for your set.
            </p>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {lengths.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => {
                    setLength(item);
                    setValidationMessage("");
                  }}
                  className={`rounded-xl border px-4 py-4 transition ${
                    length === item
                      ? "border-[#64d2f1] bg-[#64d2f1]/10 text-[#64d2f1]"
                      : "border-white/15 bg-white/5 hover:border-[#64d2f1]/60"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </section>

          {/* Style selection */}
          <section>
            <h2 className="mb-2 text-2xl font-semibold">
              03. Choose Your Style
            </h2>
            <p className="mb-5 text-sm text-gray-400">
              What kind of look are you going for?
            </p>

            <div className="grid gap-4 sm:grid-cols-2">
              {styles.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setStyle(item.id);
                    setValidationMessage("");
                  }}
                  className={`rounded-2xl border p-5 text-left transition ${
                    style === item.id
                      ? "border-[#edbcf0] bg-[#edbcf0]/10"
                      : "border-white/15 bg-white/5 hover:border-[#edbcf0]/60"
                  }`}
                >
                  <h3 className="font-semibold">{item.name}</h3>
                  <p className="mt-2 text-sm text-gray-400">
                    {item.description}
                  </p>
                </button>
              ))}
            </div>
          </section>

          {/* Inspiration photos */}
          <section>
            <h2 className="mb-2 text-2xl font-semibold">
              04. Inspiration & Details
            </h2>
            <p className="mb-5 text-sm text-gray-400">
              Have a design in mind? Upload up to 5 inspiration photos.
            </p>

            <label
              className={`flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#edbcf0]/50 bg-white/5 px-6 py-10 text-center transition hover:bg-white/10 ${
                photos.length >= 5
                  ? "cursor-not-allowed opacity-50"
                  : "cursor-pointer"
              }`}
            >
              <span className="mb-2 text-3xl">＋</span>
              <span className="font-medium">
                {photos.length >= 5
                  ? "Maximum photos uploaded"
                  : "Upload inspiration photos"}
              </span>
              <span className="mt-2 text-xs text-gray-400">
                PNG, JPG, or WEBP · {photos.length}/5 uploaded
              </span>
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                multiple
                disabled={photos.length >= 5}
                onChange={handlePhotoUpload}
                className="hidden"
              />
            </label>

            {photoError && (
              <p className="mt-3 text-sm text-red-400">{photoError}</p>
            )}

            {photos.length > 0 && (
              <div className="mt-4 space-y-3">
                {photos.map((photo, index) => (
                  <PhotoPreview
                    key={`${photo.name}-${photo.lastModified}-${index}`}
                    photo={photo}
                    onRemove={() => {
                      setPhotos((current) =>
                        current.filter((_, i) => i !== index)
                      );
                      setPhotoError("");
                    }}
                  />
                ))}
              </div>
            )}

            <div className="mt-6">
              <label
                htmlFor="comments"
                className="mb-2 block font-medium"
              >
                Additional comments
                <span className="ml-2 text-sm font-normal text-gray-400">
                  (Optional)
                </span>
              </label>
              <textarea
                id="comments"
                value={comments}
                onChange={(event) => setComments(event.target.value)}
                placeholder="Tell me about your design, preferred colors, nail shape, or anything else I should know..."
                rows={5}
                className="w-full rounded-xl border border-white/15 bg-white/5 p-4 text-white outline-none transition placeholder:text-gray-500 focus:border-[#edbcf0]"
              />
            </div>
          </section>

          
          {/* Appointment date and time */}
          <section>
            <h2 className="mb-2 text-2xl font-semibold">
              05. Choose Your Appointment Date & Time
            </h2>

            <p className="mb-5 text-sm text-gray-400">
              Select a date to see the available appointment times.
            </p>

            <div className="mb-6">
              <label htmlFor="appointmentDate" className="mb-2 block font-medium">
                Appointment Date
              </label>

              <input
                id="appointmentDate"
                type="date"
                min={new Date(
                  Date.now() - new Date().getTimezoneOffset() * 60000
                ).toISOString().split("T")[0]}
                value={appointmentDate}
                onChange={(event) => {
                  setAppointmentDate(event.target.value);
                  setSelectedTime("");
                }}
                className="w-full rounded-xl border border-white/15 bg-white/5 p-4 text-white outline-none transition focus:border-[#edbcf0]"
              />
            </div>

            <div>
              <h3 className="mb-3 font-medium">Available Times</h3>

              {!service && (
                <p className="text-sm text-gray-400">
                  Please select a service first.
                </p>
              )}

              {service && !appointmentDate && (
                <p className="text-sm text-gray-400">
                  Please choose an appointment date first.
                </p>
              )}

              {slotLoading && (
                <p className="text-sm text-gray-400">
                  Checking available times...
                </p>
              )}

              {slotError && (
                <p className="text-sm text-red-400">
                  Could not load available times: {slotError}
                </p>
              )}

              {service && appointmentDate && !slotLoading && !slotError && (
                <>
                  {availableSlots.length > 0 ? (
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                      {availableSlots.map((time) => (
                        <button
                          key={time}
                          type="button"
                          onClick={() => setSelectedTime(time)}
                          className={`rounded-xl border px-4 py-3 transition ${
                            selectedTime === time
                              ? "border-[#64d2f1] bg-[#64d2f1]/10 text-[#64d2f1]"
                              : "border-white/15 bg-white/5 hover:border-[#64d2f1]/60"
                          }`}
                        >
                          {formatSlotTime(time)}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400">
                      No available appointments on this date. Please choose another date.
                    </p>
                  )}
                </>
              )}
            </div>
          </section>

          
          {/* Customer information */}
          <section>
            <h2 className="mb-2 text-2xl font-semibold">
              05. Your Contact Information
            </h2>

            <p className="mb-5 text-sm text-gray-400">
              Enter your information so I can contact you about your appointment.
            </p>

            <div className="space-y-5">
              <div>
                <label className="mb-2 block font-medium">
                  Full Name
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(event) => setCustomerName(event.target.value)}
                  required
                  placeholder="Your full name"
                  className="w-full rounded-xl border border-white/15 bg-white/5 p-4 text-white outline-none transition placeholder:text-gray-500 focus:border-[#edbcf0]"
                />
              </div>

              <div>
                <label className="mb-2 block font-medium">
                  Email Address
                </label>
                <input
                  type="email"
                  value={customerEmail}
                  onChange={(event) => setCustomerEmail(event.target.value)}
                  required
                  placeholder="you@example.com"
                  className="w-full rounded-xl border border-white/15 bg-white/5 p-4 text-white outline-none transition placeholder:text-gray-500 focus:border-[#edbcf0]"
                />
              </div>

              <div>
                <label className="mb-2 block font-medium">
                  Phone Number
                  <span className="ml-2 text-sm font-normal text-gray-400">
                    (Optional)
                  </span>
                </label>
                <input
                  type="tel"
                  value={customerPhone}
                  onChange={(event) => setCustomerPhone(event.target.value)}
                  placeholder="Your phone number"
                  className="w-full rounded-xl border border-white/15 bg-white/5 p-4 text-white outline-none transition placeholder:text-gray-500 focus:border-[#edbcf0]"
                />
              </div>
            </div>
          </section>


          {/* Current selection summary */}
          <section className="rounded-2xl border border-[#edbcf0]/30 bg-white/5 p-6">
            <h2 className="mb-4 text-xl font-semibold">
              Your Selection
            </h2>

            <div className="space-y-2 text-sm text-gray-300">
              <p>Customer: {customerName || "Not entered"}</p>
              <p>Service: {selectedService?.name ?? "Not selected"}</p>
              <p>
                Price: {selectedService ? `$${selectedService.price}` : "—"}
              </p>
              <p>Length: {length || "Not selected"}</p>
              <p>
                Style:{" "}
                {styles.find((item) => item.id === style)?.name ??
                  "Not selected"}
              </p>
              <p>Inspiration photos: {photos.length}/5</p>
            </div>
          </section>

          {/* Validation and continue */}
          <section className="text-center">
            <p className="mb-5 text-sm text-gray-400">
              By submitting a request, you acknowledge our{" "}
              <a
                href="/policies"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#edbcf0] underline underline-offset-4 transition hover:text-[#64d2f1]"
              >
                Booking Policies
              </a>
              .
            </p>
            {validationMessage && (
              <p
                aria-live="polite"
                className={`mb-4 text-sm ${
                  validationMessage.startsWith("Please")
                    ? "text-red-400"
                    : "text-[#edbcf0]"
                }`}
              >
                {validationMessage}
              </p>
            )}
            {submissionError && (
              <p className="mb-4 text-sm text-red-400" role="alert">
                {submissionError}
              </p>
            )}

            {requestSubmitted && (
              <div className="mb-6 rounded-2xl border border-[#64d2f1]/40 bg-[#64d2f1]/10 p-6">
                <h3 className="text-xl font-semibold text-[#64d2f1]">
                  Appointment Request Received!
                </h3>
                <p className="mt-3 text-sm text-gray-300">
                  Thank you for booking with SetsByEsther! Your appointment
                  request has been submitted and is awaiting approval.
                  You will be contacted once your appointment has been reviewed.
                </p>
              </div>
            )}
           <button
              type="button"
              onClick={handleContinue}
              disabled={isSubmitting || requestSubmitted}
              className="w-full rounded-xl border border-[#edbcf0] bg-[#edbcf0]/10 px-6 py-4 font-semibold text-white transition hover:bg-[#edbcf0]/20 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:min-w-64"
            >
              {isSubmitting
                ? "Submitting Request..."
                : requestSubmitted
                  ? "Request Submitted ✓"
                  : "Submit Appointment Request"}
            </button>
          </section>
        </div>
      </div>
    </main>
  );
}
