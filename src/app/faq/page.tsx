import { LegalPage } from '@/components/layout/LegalPage'

const FAQS = [
  {
    q: 'Where do you ship?',
    a: 'Currently we ship within Canada only. Standard shipping is free and takes 5–7 business days; Express (2–3 days) and Overnight options are available at checkout.',
  },
  {
    q: 'What is your return policy?',
    a: 'We accept returns within 30 days of delivery on unworn items with tags attached. See our Shipping & Returns page for full details.',
  },
  {
    q: 'How do I track my order?',
    a: "Once your order ships, you'll get an email with tracking information. You can also view order status anytime from your account page.",
  },
  {
    q: 'What payment methods do you accept?',
    a: 'We accept all major credit and debit cards through our secure checkout, powered by Stripe.',
  },
  {
    q: 'How do I know what size to order?',
    a: 'Check our Sizing Guide for detailed measurements. If you’re between sizes, we generally recommend sizing up for outerwear.',
  },
  {
    q: 'Can I change or cancel my order after placing it?',
    a: 'Contact us as soon as possible at support@originofone.ca — we can usually make changes before an order ships, but can’t guarantee it once processing has started.',
  },
  {
    q: 'Do you offer exchanges?',
    a: 'The fastest way to get a different size or colour is to return your original item and place a new order, which guarantees availability.',
  },
]

export default function FaqPage() {
  return (
    <LegalPage title="Frequently Asked Questions" updated="[DATE — fill in before publishing]">
      <section className="space-y-8">
        {FAQS.map(({ q, a }) => (
          <div key={q} className="border-b border-neutral-200 pb-6 last:border-b-0">
            <h2 className="font-serif text-xl text-black mb-2">{q}</h2>
            <p>{a}</p>
          </div>
        ))}
      </section>
      <section>
        <p>
          Didn&rsquo;t find your answer? Email us at{' '}
          <a href="mailto:support@originofone.ca">support@originofone.ca</a>.
        </p>
      </section>
    </LegalPage>
  )
}
