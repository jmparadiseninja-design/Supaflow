import Link from 'next/link';

export default function LegalPage() {
  return (
    <main className="min-h-screen max-w-4xl mx-auto p-5 md:p-8">
      <header className="mb-8">
        <Link href="/" className="text-sky-300 hover:text-sky-200 underline underline-offset-4">
          Back to Supaflow AI Trading Lab
        </Link>
        <h1 className="text-3xl font-bold mt-5">Terms, Privacy &amp; License</h1>
        <p className="muted mt-2">Draft for review • Effective date: October 18, 2026</p>
        <p className="mt-4 rounded-xl border border-amber-800/50 bg-amber-950/20 p-4 text-sm text-amber-200">
          Before making this site public, replace the remaining bracketed fields and have a qualified
          lawyer review these terms for your location and deployment. This draft is not legal
          advice and cannot guarantee protection.
        </p>
      </header>

      <div className="space-y-8">
        <section className="panel p-5">
          <h2 className="text-xl font-semibold">Terms of Use</h2>
          <p className="muted text-sm mt-1">
            Operator: [OPERATOR NAME]. Contact: [CONTACT EMAIL OR FORM].
            Mailing address: [BUSINESS MAILING ADDRESS].
          </p>
          <div className="mt-4 space-y-3 text-sm leading-6">
            <p>
              By accessing Supaflow AI Trading Lab (the “Service”), you agree to these terms. If
              you do not agree, do not use the Service. The operator may update these terms by
              posting a revised version and effective date here.
            </p>
            <p>
              The operator grants you a limited, revocable, non-exclusive, non-transferable
              permission to use the Service for personal, non-commercial research and practice.
              You may not misuse the Service, disrupt its operation, attempt unauthorized access,
              or use its output as a substitute for independent professional advice.
            </p>
            <p>
              The Service and its original content, software, and design are owned by [OPERATOR
              NAME] or its licensors and are protected by applicable intellectual property laws.
              No rights are granted except the limited permission stated above. Third-party names,
              links, and data remain the property of their respective owners.
            </p>
            <p>
              The Service is provided “as is” and “as available,” without warranties to the
              fullest extent permitted by law. To the fullest extent permitted by law, the
              operator is not liable for indirect, incidental, special, consequential, or
              punitive loss arising from use of the Service. Nothing in these terms excludes
              liability that cannot legally be excluded.
            </p>
            <p>
              These terms are governed by the laws of Ontario, Canada, without regard to conflict
              of law rules, subject to any mandatory consumer protections that apply to you.
            </p>
          </div>
        </section>

        <section className="panel p-5">
          <h2 className="text-xl font-semibold">Privacy Notice</h2>
          <p className="muted text-sm mt-1">Last updated: October 18, 2026</p>
          <div className="mt-4 space-y-3 text-sm leading-6">
            <p>
              The current local demo profile asks only for a display name and stores it in this
              browser’s local storage. It is not a verified account, is not sent to the operator
              by the app, and is not synchronized between browsers or devices. Signing out removes
              that saved display name from this browser. Do not enter sensitive or identifying
              information.
            </p>
            <p>
              When you request a market summary, the selected market symbol is sent to this
              Service’s server route, which requests public quote data from Yahoo Finance. Market
              data is also linked to TradingView when you choose to open a chart. Those providers
              operate under their own terms and privacy notices.
            </p>
            <p>
              The app does not currently request a password, email address, or Facebook
              credentials and does not include an analytics tool. If deployed, the hosting
              provider, network infrastructure, and security logs may process technical data such
              as IP address, request time, and user agent. Review and disclose the actual
              providers, retention periods, and settings used by your deployment before public
              launch.
            </p>
            <p>
              For privacy questions or requests, contact [CONTACT EMAIL OR FORM]. Add any
              applicable data-controller identity, legal basis, retention
              details, user rights, and jurisdiction-specific disclosures here before launch.
            </p>
          </div>
        </section>

        <section className="panel p-5">
          <h2 className="text-xl font-semibold">Financial Risk Disclosure</h2>
          <div className="mt-4 space-y-3 text-sm leading-6">
            <p>
              Supaflow AI Trading Lab is an educational research and simulation tool only. It is
              not a broker, investment adviser, financial planner, or trading service, and it
              does not provide investment, tax, or legal advice or recommendations.
            </p>
            <p>
              Backtests use synthetic data in this version and may not represent actual market
              conditions. Historical or simulated performance does not predict future results.
              Market data may be delayed, incomplete, inaccurate, or unavailable. Strategies can
              lose money; you are solely responsible for any financial decisions you make.
            </p>
            <p>
              The Service does not connect to a brokerage or place trades. Do not rely on it to
              make a trade or manage risk. Consult an appropriately licensed professional before
              making financial decisions.
            </p>
          </div>
        </section>

        <section className="panel p-5">
          <h2 className="text-xl font-semibold">Source Code License</h2>
          <div className="mt-4 space-y-3 text-sm leading-6">
            <p>
              Unless a file says otherwise, the original source code in this project is
              proprietary to [COPYRIGHT OWNER]. All rights are reserved. Viewing or
              accessing the public demo does not grant permission to copy, modify, redistribute,
              sublicense, or commercially use the source code.
            </p>
            <p>
              This notice does not claim ownership over third-party libraries, services, market
              data, or other materials, which remain subject to their own licenses and terms. See
              the repository’s LICENSE file.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
