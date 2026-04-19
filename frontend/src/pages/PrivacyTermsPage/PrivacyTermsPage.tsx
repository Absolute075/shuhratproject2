import NavBar from '../../components/Layout/NavBar';

export default function PrivacyTermsPage() {
  return (
    <>
      <div className="header-inner">
        <NavBar />
        <div className="container">
          <div className="header-inner-content">
            <div className="inner-category">
              <a href="#" className="h3 cc-header">
                Legal
              </a>
              <div className="cta-line cc-header"></div>
            </div>
            <h1 className="h1">Privacy Policy, Terms &amp; Conditions, Refund Policy</h1>
            <p className="paragraph">Everything you need to know about using PermitPulse.</p>
          </div>
        </div>
      </div>

      <div className="container" style={{ paddingTop: 60, paddingBottom: 80 }}>
        <div className="pp-legal">
          <div className="pp-legal-nav">
            <a href="#terms">
              Terms &amp; Conditions
            </a>
            <a href="#privacy">
              Privacy Policy
            </a>
            <a href="#refund">
              Refund Policy
            </a>
          </div>

          <h2 id="terms" className="h2">
            Terms &amp; Conditions
          </h2>
          <p className="paragraph cc-gray">Last Updated: [28/11/2025]</p>
          <p className="paragraph">
            Welcome to PermitPulse (“we”, “our”, “us”). By subscribing to our permit delivery service, accessing our
            website, or using any of our offerings, you agree to the following Terms &amp; Conditions. Please read them
            carefully.
          </p>

          <h3 className="h3">Overview</h3>
          <p className="paragraph">
            PermitPulse provides daily construction-related permit updates and information via email to subscribers. Our
            service is designed for contractors and businesses seeking simplified access to daily permit insights. We do
            NOT file permits, guarantee approvals, or act as a governmental authority.
          </p>

          <h3 className="h3">Subscription &amp; Payments</h3>
          <p className="paragraph">● Subscriptions renew automatically unless canceled.</p>
          <p className="paragraph">● Prices, plan features, and billing cycles are displayed on our website.</p>
          <p className="paragraph">● By subscribing, you authorize us to charge your selected payment method.</p>
          <p className="paragraph">● All fees are non-refundable unless stated in our Refund Policy.</p>

          <h3 className="h3">Service Delivery</h3>
          <p className="paragraph">● Deliveries are made via email to the address provided during checkout.</p>
          <p className="paragraph">● Emails are sent daily on business days unless otherwise specified.</p>
          <p className="paragraph">
            ● We are not liable for missed emails due to incorrect addresses, spam filtering, or user-side technical
            issues.
          </p>

          <h3 className="h3">User Responsibilities</h3>
          <p className="paragraph">
            ● You agree not to resell, redistribute, or publicly share any permit information you receive through your
            subscription.
          </p>
          <p className="paragraph">● You confirm all information provided to us is accurate and up to date.</p>
          <p className="paragraph">● Unauthorized sharing of content may result in termination of your subscription.</p>

          <h3 className="h3">Limitations</h3>
          <p className="paragraph">
            ● PermitPulse does NOT guarantee that the information provided will cover every municipality or government
            department.
          </p>
          <p className="paragraph">● We do NOT act as lawyers, government agents, or certified advisors.</p>
          <p className="paragraph">● We provide informational content only.</p>

          <h3 className="h3">Intellectual Property</h3>
          <p className="paragraph">● All email content, website material, templates, and insights belong to PermitPulse.</p>
          <p className="paragraph">● Reproduction or commercial use of any content without permission is prohibited.</p>

          <h3 className="h3">Termination</h3>
          <p className="paragraph">
            We may suspend or terminate accounts that violate these Terms, abuse the service, or engage in fraudulent
            behavior.
          </p>

          <h3 className="h3">Changes to Terms</h3>
          <p className="paragraph">
            We reserve the right to update these Terms at any time. Users will be notified of major changes.
          </p>

          <h3 className="h3">Contact</h3>
          <p className="paragraph">
            For questions: <a href="mailto:permitpulse.contact@gmail.com">permitpulse.contact@gmail.com</a>
          </p>

          <div style={{ height: 30 }}></div>

          <h2 id="privacy" className="h2">
            Privacy Policy
          </h2>
          <p className="paragraph cc-gray">Last Updated: [28/11/2025]</p>
          <p className="paragraph">
            PermitPulse (“we”, “our”, “us”) is committed to protecting your privacy. This Privacy Policy explains how we
            collect, use, and safeguard your information when you use our website or subscribe to our services.
          </p>

          <h3 className="h3">Information We Collect</h3>
          <p className="paragraph">We may collect the following information:</p>
          <p className="paragraph">● Personal Information: name, email address, billing details.</p>
          <p className="paragraph">
            ● Payment Information: processed securely by third-party payment providers (e.g., Paddle). We never store full
            card details.
          </p>
          <p className="paragraph">● Usage Data: website interactions, device information, cookies.</p>

          <h3 className="h3">How We Use Your Information</h3>
          <p className="paragraph">We use your information to:</p>
          <p className="paragraph">● Deliver daily permit updates via email</p>
          <p className="paragraph">● Manage subscription billing and renewals</p>
          <p className="paragraph">● Provide customer support</p>
          <p className="paragraph">● Improve website functionality and service quality</p>
          <p className="paragraph">● Send important service notifications</p>

          <h3 className="h3">How We Store &amp; Protect Data</h3>
          <p className="paragraph">● We use industry-standard encryption and security measures.</p>
          <p className="paragraph">● Payment data is handled by certified third-party processors.</p>
          <p className="paragraph">● We do not sell, trade, or rent your personal information.</p>

          <h3 className="h3">Sharing of Information</h3>
          <p className="paragraph">We may share your information only with:</p>
          <p className="paragraph">● Trusted service providers (payment processors, hosting platforms)</p>
          <p className="paragraph">● Legal authorities when required by law</p>
          <p className="paragraph">We do NOT share or sell subscriber lists to other businesses.</p>

          <h3 className="h3">Cookies</h3>
          <p className="paragraph">
            Our website may use cookies to improve user experience. You can disable cookies through your browser
            settings.
          </p>

          <h3 className="h3">Your Rights</h3>
          <p className="paragraph">You may request to:</p>
          <p className="paragraph">● Access or update your personal information</p>
          <p className="paragraph">● Cancel your subscription</p>
          <p className="paragraph">● Delete your account and stored data (unless required by law to retain)</p>

          <h3 className="h3">Email Communications</h3>
          <p className="paragraph">
            By subscribing, you agree to receive daily emails related to permit updates. You may unsubscribe from
            promotional emails, but core service emails cannot be disabled while subscribed.
          </p>

          <h3 className="h3">Data Retention</h3>
          <p className="paragraph">We retain your data only as long as needed for:</p>
          <p className="paragraph">● Active subscriptions</p>
          <p className="paragraph">● Legal compliance</p>
          <p className="paragraph">● Service-related operations</p>

          <h3 className="h3">Changes to This Policy</h3>
          <p className="paragraph">We may update this Privacy Policy at any time. Continued use signifies acceptance of changes.</p>

          <h3 className="h3">Contact</h3>
          <p className="paragraph">
            For privacy-related questions: <a href="mailto:permitpulse.contact@gmail.com">permitpulse.contact@gmail.com</a>
          </p>

          <div style={{ height: 30 }}></div>

          <h2 id="refund" className="h2">
            Refund Policy
          </h2>
          <p className="paragraph cc-gray">Last Updated: [28/11/2025]</p>
          <p className="paragraph">
            At PermitPulse (“we”, “our”, “us”), customer satisfaction is important to us. This Refund Policy outlines
            when refunds may be issued for our subscription-based permit update service.
          </p>

          <h3 className="h3">General Policy</h3>
          <p className="paragraph">
            PermitPulse provides a digital information service delivered immediately upon subscription. Because our
            updates are sent daily and access is provided instantly, all sales are generally considered final.
          </p>

          <h3 className="h3">Eligibility for Refunds</h3>
          <p className="paragraph">We may offer refunds under the following circumstances:</p>
          <p className="paragraph">● You were charged after canceling your subscription before the renewal date.</p>
          <p className="paragraph">
            ● You experienced a technical issue that prevented you from receiving the service and we were unable to
            resolve it.
          </p>
          <p className="paragraph">● Duplicate or accidental payments caused by a system error.</p>

          <h3 className="h3">Requests that do NOT qualify</h3>
          <p className="paragraph">Requests that do NOT qualify for refunds:</p>
          <p className="paragraph">● “Change of mind” after the subscription has started</p>
          <p className="paragraph">● Forgetting to cancel before renewal</p>
          <p className="paragraph">● Failure to check or read emails we send</p>
          <p className="paragraph">● Expecting features that are not listed on our website</p>

          <h3 className="h3">How to Request a Refund</h3>
          <p className="paragraph">
            All requests must be submitted within <strong>7 days</strong> of the charge.
          </p>
          <p className="paragraph">
            Email: <a href="mailto:permitpulse.contact@gmail.com">permitpulse.contact@gmail.com</a>
          </p>

          <p className="paragraph">Please include:</p>
          <p className="paragraph">● Your name</p>
          <p className="paragraph">● Email used for purchase</p>
          <p className="paragraph">● Date and amount of the charge</p>
          <p className="paragraph">● Reason for the refund request</p>

          <h3 className="h3">Processing</h3>
          <p className="paragraph">
            If approved, refunds are processed via our payment provider (Paddle). Refunds typically take{' '}
            <strong>3–10 business days</strong> depending on your bank.
          </p>

          <h3 className="h3">Subscription Cancellation</h3>
          <p className="paragraph">
            You may cancel your subscription at any time. After cancellation, you will still receive the service until
            the end of the billing period. No partial or prorated refunds are provided.
          </p>

          <h3 className="h3">Contact</h3>
          <p className="paragraph">
            For billing or payment-related questions, contact: <a href="mailto:permitpulse.contact@gmail.com">permitpulse.contact@gmail.com</a>
          </p>
        </div>
      </div>
    </>
  );
}
