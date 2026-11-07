
export default function PoliciesPage() {
  return (
<main className="flex-1 px-6 py-8">
        <div className="mx-auto max-w-3xl">
        <h1 className="mb-4 text-center text-4xl font-bold">
          Booking Policies
        </h1>

        <p className="mb-12 text-center">
          Please review our policies before requesting an appointment
          with SetsByEsther.
        </p>

        <div className="space-y-8">
          <section>
            <h2 className="mb-2 text-xl font-semibold">
              Cancellations
            </h2>
            <p>
              Please provide at least 24 hours' notice if you need
              to cancel your appointment.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-xl font-semibold">
              Rescheduling
            </h2>
            <p>
              If you need to reschedule, please reach out at least
              24 hours before your scheduled appointment.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-xl font-semibold">
              Late Arrivals
            </h2>
            <p>
              A 15-minute grace period is provided. Arrivals beyond
              this period may require rescheduling.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-xl font-semibold">
              Deposits
            </h2>
            <p>
              Deposits are not currently required to request or
              confirm an appointment.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-xl font-semibold">
              Appointment Confirmation
            </h2>
            <p>
              All appointment requests are subject to manual approval.
              Your appointment is not confirmed until you receive
              an approval notification.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
