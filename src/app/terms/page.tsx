import { LegalPage } from '@/components/layout/LegalPage'

export default function TermsPage() {
  return (
    <LegalPage title="Terms of Service" updated="[DATE — fill in before publishing]">
      <section>
        <p>
          These Terms of Service (&ldquo;Terms&rdquo;) govern your use of originofone.ca (the &ldquo;Site&rdquo;)
          and any purchase made through it. By using the Site or placing an order, you agree to these Terms.
        </p>
      </section>

      <section>
        <h2>Orders and payment</h2>
        <p>
          All orders are subject to acceptance and availability. Prices are listed in Canadian dollars and
          do not include applicable taxes or shipping, which are calculated at checkout. Payment is
          processed securely through Stripe at the time of order.
        </p>
        <p>
          We reserve the right to refuse or cancel any order, including for pricing errors, suspected fraud,
          or unavailable inventory. If we cancel an order after payment, you will be refunded in full.
        </p>
      </section>

      <section>
        <h2>Shipping</h2>
        <p>
          See our <a href="/shipping-returns">Shipping &amp; Returns</a> page for delivery timelines,
          shipping costs, and return terms.
        </p>
      </section>

      <section>
        <h2>Account responsibilities</h2>
        <p>
          You&rsquo;re responsible for maintaining the confidentiality of your account credentials and for
          all activity under your account. Notify us immediately at{' '}
          <a href="mailto:support@originofone.ca">support@originofone.ca</a> if you suspect unauthorized use.
        </p>
      </section>

      <section>
        <h2>Product information</h2>
        <p>
          We try to display product details, pricing, and availability accurately, but errors can occur.
          We reserve the right to correct any errors and to update or discontinue products at any time
          without notice.
        </p>
      </section>

      <section>
        <h2>Intellectual property</h2>
        <p>
          All content on this Site — including text, graphics, logos, and images — is the property of
          Origin of One and may not be reproduced without permission.
        </p>
      </section>

      <section>
        <h2>Limitation of liability</h2>
        <p>
          Origin of One is not liable for indirect, incidental, or consequential damages arising from
          your use of the Site or products purchased through it, to the extent permitted by law.
        </p>
      </section>

      <section>
        <h2>Governing law</h2>
        <p>These Terms are governed by the laws of the Province of Ontario and the federal laws of Canada applicable therein.</p>
      </section>

      <section>
        <h2>Changes to these Terms</h2>
        <p>
          We may update these Terms from time to time. Continued use of the Site after changes are posted
          constitutes acceptance of the revised Terms.
        </p>
      </section>

      <section>
        <h2>Contact us</h2>
        <p>Questions? Email <a href="mailto:support@originofone.ca">support@originofone.ca</a>.</p>
      </section>

      <section>
        <p className="text-[12px] text-neutral-400 border-t border-neutral-200 pt-6">
          This page is a starting draft and has not been reviewed by a lawyer. Please have it reviewed
          before this site goes live and starts processing real orders.
        </p>
      </section>
    </LegalPage>
  )
}
