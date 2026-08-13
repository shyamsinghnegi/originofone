import { LegalPage } from '@/components/layout/LegalPage'

export default function ShippingReturnsPage() {
  return (
    <LegalPage title="Shipping & Returns" updated="[DATE — fill in before publishing]">
      <section>
        <h2>Shipping</h2>
        <p>We currently ship within Canada. Available options at checkout:</p>
        <ul>
          <li><strong>Standard</strong> — 5–7 business days, free</li>
          <li><strong>Express</strong> — 2–3 business days, $14.99 CAD</li>
          <li><strong>Overnight</strong> — next business day, $29.99 CAD</li>
        </ul>
        <p>
          Orders are processed within 1–2 business days. You&rsquo;ll receive a confirmation email once
          your order ships, with tracking information as it becomes available.
        </p>
      </section>

      <section>
        <h2>Returns</h2>
        <p>
          We accept returns within <strong>30 days</strong> of delivery. To be eligible, items must be:
        </p>
        <ul>
          <li>Unworn, unwashed, and in their original condition</li>
          <li>With all original tags attached</li>
          <li>In the original packaging where possible</li>
        </ul>
        <p>
          To start a return, email <a href="mailto:support@originofone.ca">support@originofone.ca</a> with
          your order number. We&rsquo;ll send you return instructions and a shipping label.
        </p>
      </section>

      <section>
        <h2>Return shipping</h2>
        <p>
          Return shipping is free for defective or incorrect items. For all other returns, a return
          shipping fee will be deducted from your refund unless otherwise noted.
        </p>
      </section>

      <section>
        <h2>Refunds</h2>
        <p>
          Once we receive and inspect your return, we&rsquo;ll process your refund to the original
          payment method within 5–10 business days. You&rsquo;ll receive an email once it&rsquo;s issued.
        </p>
      </section>

      <section>
        <h2>Exchanges</h2>
        <p>
          Need a different size or colour? The fastest way is to return your original item and place a
          new order — this guarantees the item you want is in stock.
        </p>
      </section>

      <section>
        <h2>Final sale items</h2>
        <p>Items marked &ldquo;Final Sale&rdquo; at checkout are not eligible for return or exchange.</p>
      </section>

      <section>
        <h2>Contact us</h2>
        <p>Questions about an order? Email <a href="mailto:support@originofone.ca">support@originofone.ca</a>.</p>
      </section>

      <section>
        <p className="text-[12px] text-neutral-400 border-t border-neutral-200 pt-6">
          This page is a starting draft. Confirm the shipping rates, timelines, and return window reflect
          your actual carrier agreements before publishing.
        </p>
      </section>
    </LegalPage>
  )
}
