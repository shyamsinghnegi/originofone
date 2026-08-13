import { LegalPage } from '@/components/layout/LegalPage'

const SIZES = [
  { size: 'XS', chest: '32–34"', waist: '25–27"' },
  { size: 'S',  chest: '35–37"', waist: '28–30"' },
  { size: 'M',  chest: '38–40"', waist: '31–33"' },
  { size: 'L',  chest: '41–43"', waist: '34–36"' },
  { size: 'XL', chest: '44–46"', waist: '37–39"' },
]

export default function SizingGuidePage() {
  return (
    <LegalPage title="Sizing Guide" updated="[DATE — fill in before publishing]">
      <section>
        <p>
          Our garments are designed with a relaxed, true-to-size fit unless noted otherwise on the product
          page. Use the chart below alongside your own measurements to find your best fit. If you&rsquo;re
          between sizes, we generally recommend sizing up for outerwear and true-to-size for knitwear and layering.
        </p>
      </section>

      <section>
        <h2>Size chart (inches)</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-neutral-200">
                <th className="py-2 pr-4 text-[11px] tracking-widest uppercase text-neutral-400">Size</th>
                <th className="py-2 pr-4 text-[11px] tracking-widest uppercase text-neutral-400">Chest</th>
                <th className="py-2 text-[11px] tracking-widest uppercase text-neutral-400">Waist</th>
              </tr>
            </thead>
            <tbody>
              {SIZES.map(row => (
                <tr key={row.size} className="border-b border-neutral-100">
                  <td className="py-2 pr-4 font-medium text-black">{row.size}</td>
                  <td className="py-2 pr-4">{row.chest}</td>
                  <td className="py-2">{row.waist}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2>Accessories</h2>
        <p>
          Gloves and beanies are sized One Size or S/M &middot; L/XL — check the specific product page for
          fit notes.
        </p>
      </section>

      <section>
        <h2>How to measure</h2>
        <ul>
          <li><strong>Chest</strong> — measure around the fullest part of your chest, under your arms</li>
          <li><strong>Waist</strong> — measure around your natural waistline</li>
        </ul>
      </section>

      <section>
        <p>
          Still unsure? Email <a href="mailto:support@originofone.ca">support@originofone.ca</a> with your
          measurements and we&rsquo;ll help you find the right fit.
        </p>
      </section>

      <section>
        <p className="text-[12px] text-neutral-400 border-t border-neutral-200 pt-6">
          Placeholder measurements — replace with your actual product measurements before publishing.
        </p>
      </section>
    </LegalPage>
  )
}
