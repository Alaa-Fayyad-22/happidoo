export default function Privacy() {
  const lastUpdated = "May 15, 2025";
  const companyName = "Happidoo";
  const contactEmail = process.env.SMTP_USER!;

  return (
    <main className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Privacy Policy</h1>
        <p className="mt-1 text-sm text-slate-400">Last updated: {lastUpdated}</p>
      </div>
 
      {/* Intro */}
      <p className="mb-8 text-slate-800 leading-relaxed">
        You can browse our inflatables and packages without creating an account or sharing any
        personal information. We only collect information when you choose to submit a quote
        request.
      </p>
 
      <div className="space-y-8">
 
        {/* What we collect */}
        <section>
          <h2 className="mb-2 text-lg font-semibold text-slate-800">What we collect</h2>
          <p className="mb-3 text-slate-800 leading-relaxed">
            When you submit a quote request, we collect only what you voluntarily provide in
            the form:
          </p>
          <ul className="space-y-1.5 text-slate-800">
            {[
              "Full name",
              "Email address (optional if phone is provided)",
              "Phone number (optional if email is provided)",
              "City and delivery address",
              "Event dates and time window",
              "Any notes or special requests you choose to include",
            ].map((item) => (
              <li key={item} className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-white" />
                {item}
              </li>
            ))}
          </ul>
          <p className="mt-3 text-slate-800 leading-relaxed">
            We do not collect payment information through this form. No account is created and
            no passwords are stored.
          </p>
        </section>
 
        {/* How we use it */}
        <section>
          <h2 className="mb-2 text-lg font-semibold text-slate-800">How we use it</h2>
          <p className="text-slate-800 leading-relaxed">
            Your information is used solely to respond to your quote request — to confirm
            availability, discuss pricing, and arrange delivery details. We will not add you to
            any mailing list or contact you for any purpose unrelated to your inquiry.
          </p>
        </section>
 
        {/* Analytics */}
        <section>
          <h2 className="mb-2 text-lg font-semibold text-slate-800">Analytics</h2>
          <p className="text-slate-800 leading-relaxed">
            We use analytics tools to understand how visitors use our site — such as which pages
            are visited and how much traffic we receive. This data is aggregated and anonymous;
            it is never linked to your identity or used to contact you.
          </p>
        </section>
 
        {/* What we don't collect */}
        <section>
          <h2 className="mb-2 text-lg font-semibold text-slate-800">What we don't collect</h2>
          <ul className="space-y-1.5 text-slate-800">
            {[
              "Cookies for advertising or tracking across sites",
              "Payment or financial information",
              "Any data from minors",
            ].map((item) => (
              <li key={item} className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-white" />
                {item}
              </li>
            ))}
          </ul>
        </section>
 
        {/* Sharing */}
        <section>
          <h2 className="mb-2 text-lg font-semibold text-slate-800">Sharing your information</h2>
          <p className="text-slate-800 leading-relaxed">
            We do not sell, rent, or share your personal information with third parties for
            marketing purposes. Your details are only used internally to fulfill your quote
            request.
          </p>
        </section>
 
        {/* Your rights */}
        <section>
          <h2 className="mb-2 text-lg font-semibold text-slate-800">Your rights</h2>
          <p className="text-slate-800 leading-relaxed">
            You can ask us to correct or delete any information you've submitted at any time
            by contacting us directly. We'll confirm its removal promptly.
          </p>
        </section>
 
        {/* Contact */}
        <section>
          <h2 className="mb-2 text-lg font-semibold text-slate-800">Questions?</h2>
          <p className="text-slate-800 leading-relaxed">
            If you have any questions about this policy, reach out at{" "}
            <a
              href={`mailto:${contactEmail}`}
              className="font-medium text-blue-600 hover:underline"
            >
              {contactEmail}
            </a>
            .
          </p>
        </section>
      </div>
 
      {/* Footer */}
      <div className="mt-12 border-t border-slate-100 pt-6 text-xs text-slate-400">
        © {new Date().getFullYear()} {companyName}. All rights reserved.
      </div>
    </main>
  );
}