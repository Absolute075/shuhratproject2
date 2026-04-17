import { NavLink } from 'react-router-dom';

export default function AboutPage() {
  return (
    <>
      <div className="header-inner cc-header-extra">
        <div className="container">
          <div className="header-inner-content">
            <div className="inner-category">
              <a href="#" className="h3 cc-header">
                About
              </a>
              <div className="cta-line cc-header"></div>
            </div>
            <h1 className="h1">
              Built for Contractors. <br />Powered by Data. Driven by Results
            </h1>
            <p className="paragraph">
              At PermitPulse, we simplify permit hunting so you can focus on what matters — winning jobs, serving clients,
              and growing your business.
            </p>
          </div>
        </div>
      </div>

      <div className="header-banner">
        <div className="premium-image-banner">
          <img
            src="https://cdn.prod.website-files.com/6924575d25f2c55da5fad02c/69245e1fbcb4cc429cd7b8db_building-permit.jpg"
            alt=""
            sizes="(max-width: 2268px) 100vw, 2268px"
            srcSet="https://cdn.prod.website-files.com/6924575d25f2c55da5fad02c/69245e1fbcb4cc429cd7b8db_building-permit-p-500.jpg 500w, https://cdn.prod.website-files.com/6924575d25f2c55da5fad02c/69245e1fbcb4cc429cd7b8db_building-permit-p-800.jpg 800w, https://cdn.prod.website-files.com/6924575d25f2c55da5fad02c/69245e1fbcb4cc429cd7b8db_building-permit-p-1080.jpg 1080w, https://cdn.prod.website-files.com/6924575d25f2c55da5fad02c/69245e1fbcb4cc429cd7b8db_building-permit-p-1600.jpg 1600w, https://cdn.prod.website-files.com/6924575d25f2c55da5fad02c/69245e1fbcb4cc429cd7b8db_building-permit-p-2000.jpg 2000w, https://cdn.prod.website-files.com/6924575d25f2c55da5fad02c/69245e1fbcb4cc429cd7b8db_building-permit.jpg 2268w"
          />
        </div>
      </div>

      <div className="about-intro">
        <div className="container cc-center">
          <div className="h2-container cc-center">
            <h2 className="h2 cc-center">
              <strong>Our mission is simple:</strong> give contractors a fast, reliable way to access every new permit
              filed in their service area — without wasting hours searching city portals. We use automated tools,
              verified data sources, and human review to deliver fresh, accurate leads directly to your inbox every
              single day. No more missed opportunities. No more manual searching. Just clean, actionable data that helps
              you stay ahead of your competition.
            </h2>
          </div>
        </div>
      </div>

      <div className="separator">
        <div className="container">
          <div className="line-color"></div>
        </div>
      </div>

      <div className="our-goals">
        <div className="container">
          <div className="h2-container">
            <h2 className="h2">
              <em>
                Contractors don’t lose because of poor work — they lose because they never saw the opportunity. We make
                sure you never miss one again.
              </em>
            </h2>
          </div>

          <div className="goals-container">
            <div className="goals-container-inner">
              <div className="h3">01</div>
              <h2 className="h2 text-span">
                <strong>Accuracy First</strong>
              </h2>
              <p className="paragraph cc-gray">We verify every permit before sending it. You get clean, trustworthy data — not noise.</p>
            </div>

            <div className="goals-container-inner">
              <div className="h3">02</div>
              <h2 className="h2 text-span">
                <strong>Speed Matters</strong>
              </h2>
              <p className="paragraph cc-gray">We track new permits in real-time so you can be the first contractor to reach the homeowner.</p>
            </div>

            <div className="goals-container-inner">
              <div className="h3">03</div>
              <h2 className="h2 text-span">
                <strong>Built for Growth</strong>
              </h2>
              <p className="paragraph cc-gray">Our entire system is designed to help you close more jobs, scale faster, and expand your reach.</p>
            </div>
          </div>
        </div>
      </div>

      <blockquote className="block-quote-2">
        At PermitPulse, we believe contractors shouldn’t lose time searching for permit updates, tracking rules, or
        refreshing government portals. Your focus should stay on building, installing, fixing, and running your projects
        — not on paperwork.That’s why we created a simple, reliable system that delivers the permits you need straight
        to your inbox every single morning. No apps to download. No dashboards to manage. Just consistent daily updates
        you can trust.Our mission is to strip away the frustration and bring clarity into an industry where information
        is often slow, scattered, or difficult to track. We work behind the scenes so you never miss a permit change
        again.
      </blockquote>

      <div className="separator">
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
            <NavLink to="/pricing" className="button cc-cta w-button">
              Get Started
            </NavLink>
          </div>
        </div>
      </div>
    </>
  );
}
