import { useState } from 'react';

type PrepareResponse = {
  shop_transaction_id: string;
  octo_payment_UUID: string;
  status: string;
  octo_pay_url: string;
};

export default function PricingPage() {
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const startPayment = async (plan: { id: string; amount: number; name: string }) => {
    if (loadingPlan !== null) return;

    setLoadingPlan(plan.id);
    setError(null);

    const test = import.meta.env.VITE_OCTO_TEST
      ? String(import.meta.env.VITE_OCTO_TEST).toLowerCase() === 'true'
      : import.meta.env.DEV;

    try {
      const res = await fetch('/api/payments/octo/prepare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          total_sum: plan.amount,
          currency: 'USD',
          description: `PERMITPULSE_${plan.name.toUpperCase()}`,
          language: 'en',
          test
        })
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `HTTP ${res.status}`);
      }

      const data = (await res.json()) as PrepareResponse;

      localStorage.setItem('octo_shop_transaction_id', data.shop_transaction_id);
      localStorage.setItem('octo_plan', plan.name);
      window.location.assign(data.octo_pay_url);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error');
      setLoadingPlan(null);
    }
  };

  return (
    <>
      <div className="header-inner">
        <div className="container">
          <div className="header-inner-content">
            <div className="inner-category">
              <a href="#" className="h3 cc-header">
                Pricing
              </a>
              <div className="cta-line cc-header"></div>
            </div>
            <h1 className="h1">Pick the Plan That Brings You More Jobs</h1>
            <p className="paragraph">
              Pay monthly. <br />Cancel anytime. <br />Start getting fresh permit opportunities in your area today.
            </p>
          </div>
        </div>
      </div>

      <div className="premium-intro">
        <div className="container">
          <div className="h2-container">
            <h2 className="h2">
              <strong className="bold-text">Your Time Is Valuable — Our Plans Save It.</strong>
              <br />More ZIPs = More Jobs! <br />Select how many areas you want to dominate. We’ll feed you new permit
              leads daily so you can stay ahead of competitors.
            </h2>
          </div>

          <div className="container-pricing">
            <div className="pricing-block">
              <div className="pricing-info">
                <h3 className="h3 cc-pricing">Starter</h3>
                <div className="price-block">
                  <div className="price">249</div>
                  <div className="currency">
                    <strong>USD</strong>
                  </div>
                </div>
                <div className="small-text cc-light">Perfect for new contractors entering a neighborhood</div>
                <div className="pricing-block-separator"></div>
                <div className="small-text">
                  ✓ Daily permit alerts for <strong>2 ZIP</strong> codes<br />
                  <br />✓ Unlimited access to permit data<br />
                  <br />✓ Contact information when available<br />
                  <br />✓ Automatic email delivery<br />
                  <br />✓ Homeowner matching suggestions<br />
                  <br />✓ Cancel anytime
                </div>
              </div>
              <a
                href="#"
                className="button-pricing w-button"
                onClick={(e) => {
                  e.preventDefault();
                  void startPayment({ id: 'starter', amount: 249, name: 'Starter' });
                }}
                aria-disabled={loadingPlan !== null}
              >
                {loadingPlan === 'starter' ? 'Redirecting…' : 'Get Started'}
              </a>
            </div>

            <div className="pricing-block">
              <div className="pricing-info">
                <h3 className="h3 cc-pricing">Pro</h3>
                <div className="price-block">
                  <div className="price">499</div>
                  <div className="currency">
                    <strong>USD</strong>
                  </div>
                </div>
                <div className="small-text cc-light">Ideal for contractors who want steady, predictable job flow</div>
                <div className="pricing-block-separator"></div>
                <div className="small-text">
                  ✓ Daily permit alerts for <strong>5 ZIPs</strong>
                  <br />
                  <br />✓ Faster updates (3× per day)
                  <br />
                  <br />✓ Smart matching: Roofing, Solar, HVAC, Plumbing, etc.
                  <br />
                  <br />✓ Data export (CSV)
                  <br />
                  <br />✓ Priority support
                  <br />
                  <br />✓ 1 team member access
                </div>
              </div>
              <a
                href="#"
                className="button-pricing w-button"
                onClick={(e) => {
                  e.preventDefault();
                  void startPayment({ id: 'pro', amount: 499, name: 'Pro' });
                }}
                aria-disabled={loadingPlan !== null}
              >
                <strong>{loadingPlan === 'pro' ? 'Redirecting…' : 'Get Started'}</strong>
              </a>
            </div>

            <div className="pricing-block">
              <div className="pricing-info">
                <h3 className="h3 cc-pricing">Dominator</h3>
                <div className="price-block">
                  <div className="price">899</div>
                  <div className="currency">
                    <strong>USD</strong>
                  </div>
                </div>
                <div className="small-text cc-light">For companies that want to dominate multiple neighborhoods</div>
                <div className="pricing-block-separator"></div>
                <div className="small-text">
                  ✓ Daily permit alerts for <strong>10 ZIPs</strong>
                  <br />
                  <br />✓ Unlimited homeowner contact data
                  <br />
                  <br />✓ Advanced filters: project cost, category, homeowner type
                  <br />
                  <br />✓ Lead scoring (hot/warm/cold)
                  <br />
                  <br />✓ Multi-user access (up to 5)
                  <br />
                  <br />✓ Dedicated account manager
                </div>
              </div>
              <a
                href="#"
                className="button-pricing w-button"
                onClick={(e) => {
                  e.preventDefault();
                  void startPayment({ id: 'dominator', amount: 899, name: 'Dominator' });
                }}
                aria-disabled={loadingPlan !== null}
              >
                <strong>{loadingPlan === 'dominator' ? 'Redirecting…' : 'Get Started'}</strong>
              </a>
            </div>
          </div>

          {error ? <div style={{ marginTop: 12, color: 'crimson' }}>{error}</div> : null}

          <h2 className="h2">
            <strong>
              <br />Deliverables:
              <br />
            </strong>
            Daily permit notifications
            <br />Delivered by email
            <br />Customized ZIP monitoring
            <br />Priority support
            <br />Spam-free guaranteed
            <br />Cancel anytime
            <br />No hidden fees
          </h2>
        </div>
      </div>

      <div className="facts">
        <div className="container">
          <div className="container-facts">
            <div className="container-facts-inner">
              <div className="fact-block">
                <img
                  src="https://cdn.prod.website-files.com/6924575d25f2c55da5fad02c/6924575e25f2c55da5fad0c5_icon-fact.svg"
                  alt=""
                  className="image-2"
                />
                <div className="fact-text-block">
                  <h3 className="h3">
                    <strong>Daily Permit Notifications</strong>
                  </h3>
                  <p className="paragraph cc-gray">
                    Receive fresh permit leads straight to your email every single day—no searching, no wasted time.
                  </p>
                </div>
              </div>
            </div>

            <div className="container-facts-inner">
              <div className="fact-block">
                <img
                  src="https://cdn.prod.website-files.com/6924575d25f2c55da5fad02c/6924575e25f2c55da5fad0c5_icon-fact.svg"
                  alt=""
                  className="image-2"
                />
                <div className="fact-text-block">
                  <h3 className="h3">
                    <strong>Unlimited Access to All Data</strong>
                  </h3>
                  <p className="paragraph cc-gray">Full access to every permit included in your zip codes. No limits, no restrictions.</p>
                </div>
              </div>
            </div>

            <div className="container-facts-inner">
              <div className="fact-block">
                <img
                  src="https://cdn.prod.website-files.com/6924575d25f2c55da5fad02c/6924575e25f2c55da5fad0c5_icon-fact.svg"
                  alt=""
                  className="image-2"
                />
                <div className="fact-text-block">
                  <h3 className="h3">
                    <strong>Real-Time Updates</strong>
                  </h3>
                  <p className="paragraph cc-gray">We deliver updates the moment new permits are published, so you always stay ahead of competitors.</p>
                </div>
              </div>
            </div>

            <div className="container-facts-inner">
              <div className="fact-block">
                <img
                  src="https://cdn.prod.website-files.com/6924575d25f2c55da5fad02c/6924575e25f2c55da5fad0c5_icon-fact.svg"
                  alt=""
                  className="image-2"
                />
                <div className="fact-text-block">
                  <h3 className="h3">
                    <strong>Instant ZIP Code Activation</strong>
                  </h3>
                  <p className="paragraph cc-gray">Choose your ZIPs, activate instantly, and start receiving new permits the same day.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="facts-gray-background"></div>
      </div>

      <div className="faq">
        <div className="container">
          <div className="h2-container cc-questions">
            <h2 className="h2">
              <strong>Got a question about our pricing model?<br /></strong>
              We keep things simple: choose your ZIP package, activate instantly, and start receiving daily permit leads. No contracts, no hidden fees, cancel anytime.
            </h2>
          </div>
        </div>

        <div className="container">
          <div className="container-questions">
            <div className="question-block">
              <h3 className="h3">
                <strong>How does the subscription work?</strong>
              </h3>
              <p className="paragraph cc-gray">Once you select a plan and ZIP codes, your subscription activates instantly. You’ll start receiving daily permit leads directly to your email.</p>
            </div>
            <div className="question-block">
              <h3 className="h3">
                <strong>Can I change or swap ZIP codes later?</strong>
              </h3>
              <p className="paragraph cc-gray">Yes. You can update your ZIP codes anytime. Changes take effect immediately for the next daily update.</p>
            </div>
          </div>

          <div className="container-questions">
            <div className="question-block">
              <h3 className="h3">
                <strong>Do you guarantee permit volume?</strong>
              </h3>
              <p className="paragraph cc-gray">
                Permit volume varies by area, but we guarantee <strong>real data pulled from official sources</strong> every day for your selected ZIPs.
              </p>
            </div>
            <div className="question-block">
              <h3 className="h3">
                <strong>Can I cancel anytime?</strong>
              </h3>
              <p className="paragraph cc-gray">Absolutely. There are no long-term contracts. Cancel whenever you want from your account dashboard or send us an email.</p>
            </div>
          </div>

          <div className="container-questions">
            <div className="question-block">
              <h3 className="h3">
                <strong>How are the leads delivered?</strong>
              </h3>
              <p className="paragraph cc-gray">Straight to your email daily in an easy-to-read format with all available details for each permit.</p>
            </div>
            <div className="question-block">
              <h3 className="h3">
                <strong>Are payments secure?</strong>
              </h3>
              <p className="paragraph cc-gray">Yes. All payments are handled through our trusted payment partner, ensuring full security and compliance.</p>
            </div>
          </div>

          <div className="container-questions">
            <div className="question-block">
              <h3 className="h3">
                <strong>What if I need more ZIP codes than my plan allows?</strong>
              </h3>
              <p className="paragraph cc-gray">You can upgrade your plan anytime or request a custom package if you need coverage beyond 10 ZIP codes.</p>
            </div>
            <div className="question-block">
              <h3 className="h3">
                <strong>Do you offer multi-user or team accounts?</strong>
              </h3>
              <p className="paragraph cc-gray">At the moment, each subscription is linked to a single contractor or business. If you need multi-user access, team accounts will be available in future updates.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="separator cc-background-grey">
        <div className="container">
          <div className="line-color"></div>
        </div>
      </div>

      <div className="cta">
        <div className="container cc-cta">
          <div className="cta-column">
            <div className="cta-left-top">
              <div className="cta-line"></div>
            </div>
            <h2 className="h2">One click today can unlock your next 100 deals. Don’t let the opportunity pass.</h2>
          </div>
          <div className="cta-column">
            <a href="#" className="button cc-cta w-button" onClick={(e) => e.preventDefault()}>
              Get Started
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
