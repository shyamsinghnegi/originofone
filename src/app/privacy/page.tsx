import { LegalPage } from '@/components/layout/LegalPage'

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy" updated="[DATE — fill in before publishing]">
      <section>
        <p>
          Origin of One (&ldquo;we&rdquo;, &ldquo;us&rdquo;, &ldquo;our&rdquo;) operates originofone.ca (the &ldquo;Site&rdquo;).
          This policy explains what personal information we collect, why, and how it&rsquo;s handled. We are
          based in Ontario, Canada, and comply with the Personal Information Protection and Electronic
          Documents Act (PIPEDA).
        </p>
      </section>

      <section>
        <h2>Information we collect</h2>
        <p>When you create an account, browse, or place an order, we collect:</p>
        <ul>
          <li>Name, email address, and phone number</li>
          <li>Shipping and billing addresses</li>
          <li>Order history and cart contents</li>
          <li>Payment information — processed directly by Stripe; we never see or store your full card number</li>
          <li>Account credentials — managed by our authentication provider, Clerk</li>
        </ul>
      </section>

      <section>
        <h2>How we use your information</h2>
        <ul>
          <li>To process and fulfill your orders, including payment, shipping, and customer support</li>
          <li>To send order confirmations, shipping updates, and — if you don&rsquo;t complete a purchase — a reminder about your cart or an incomplete payment</li>
          <li>To maintain your account and order history</li>
          <li>To improve the Site and prevent fraud</li>
        </ul>
        <p>We do not sell your personal information to third parties.</p>
      </section>

      <section>
        <h2>Who we share information with</h2>
        <p>We share the minimum necessary data with service providers who help us run the Site:</p>
        <ul>
          <li><strong>Stripe</strong> — payment processing</li>
          <li><strong>Clerk</strong> — account authentication</li>
          <li><strong>Convex</strong> — application database and hosting</li>
          <li><strong>Resend</strong> — transactional email delivery</li>
          <li><strong>Cloudflare</strong> — image and file storage</li>
        </ul>
        <p>Each of these providers processes data under their own privacy policy and only for the purpose of providing their service to us.</p>
      </section>

      <section>
        <h2>Cookies</h2>
        <p>
          We use cookies and similar technologies necessary for the Site to function — keeping you signed
          in, remembering your cart, and securing checkout. We do not use third-party advertising cookies.
        </p>
      </section>

      <section>
        <h2>Data retention</h2>
        <p>
          We keep account and order information for as long as your account is active, and as required
          to meet tax, accounting, and legal obligations after that.
        </p>
      </section>

      <section>
        <h2>Your rights</h2>
        <p>
          You can access, correct, or request deletion of your personal information at any time by
          contacting us at <a href="mailto:privacy@originofone.ca">privacy@originofone.ca</a>. You can also
          view and update your details directly from your account page.
        </p>
      </section>

      <section>
        <h2>Contact us</h2>
        <p>
          Questions about this policy? Email <a href="mailto:privacy@originofone.ca">privacy@originofone.ca</a>.
        </p>
      </section>

      <section>
        <p className="text-[12px] text-neutral-400 border-t border-neutral-200 pt-6">
          This page is a starting draft and has not been reviewed by a lawyer. Please have it reviewed
          before this site goes live and starts processing real customer data.
        </p>
      </section>
    </LegalPage>
  )
}
