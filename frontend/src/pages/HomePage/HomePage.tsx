import { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import HeroSlider from '../../components/HeroSlider/HeroSlider';

export default function HomePage() {
  const [heroVisible, setHeroVisible] = useState(false);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setHeroVisible(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <>
      <div className="header">
        <div className="header-content">
          <h1 className={`h1 pp-hero-anim${heroVisible ? ' is-visible' : ''}`}>
            Instant Building Permit Alerts for Contractors
          </h1>
          <p className={`paragraph pp-hero-anim pp-hero-anim--sub${heroVisible ? ' is-visible' : ''}`}>
            Get daily homeowner permit updates in your target ZIP codes
          </p>
          <NavLink to="/pricing" className="button w-button">
            Get Started
          </NavLink>
        </div>
      </div>

      <div className="features">
        <div className="container">
          <div className="h2-container">
            <h2 className="h2">
              <span>
                <strong>Why Contractors Choose PermitPulse?</strong>Designed to save you time, eliminate guesswork,
                and put the highest-value jobs directly in front of you—before your competitors ever see them
              </span>
              <br />
            </h2>
          </div>

          <div className="collection-list-wrapper w-dyn-list">
            <div role="list" className="collection-list w-dyn-items">
              <div role="listitem" className="collection-item w-dyn-item">
                <div className="feature-item-container">
                  <div className="feature-icon">
                    <img
                      width={103}
                      alt=""
                      src="https://cdn.prod.website-files.com/6924575e25f2c55da5fad09f/6924582ff97ac242473b8dd0_9926396.png"
                    />
                  </div>
                  <h3 className="h3">Daily Pre-Filtered Permits</h3>
                  <p className="paragraph cc-gray">
                    We scan new permits, filter out irrelevant or low-value work, and only deliver the ones that match
                    your trade.No time wasted — just fresh, profitable opportunities.
                  </p>
                </div>
              </div>

              <div role="listitem" className="collection-item w-dyn-item">
                <div className="feature-item-container">
                  <div className="feature-icon">
                    <img
                      width={103}
                      alt=""
                      src="https://cdn.prod.website-files.com/6924575e25f2c55da5fad09f/69245b18aab0656bb08433cd_photo_2025-11-24_18-18-00.jpg"
                    />
                  </div>
                  <h3 className="h3">Zero Competition Advantage</h3>
                  <p className="paragraph cc-gray">
                    Every zip code is exclusive.When you subscribe, you’re the only contractor receiving permits from
                    that area, meaning no bidding wars or stolen leads.
                  </p>
                </div>
              </div>

              <div role="listitem" className="collection-item w-dyn-item">
                <div className="feature-item-container">
                  <div className="feature-icon">
                    <img
                      width={103}
                      alt=""
                      src="https://cdn.prod.website-files.com/6924575e25f2c55da5fad09f/69245b49b26d0d339e005a0e_4226663.png"
                      sizes="103px"
                      srcSet="https://cdn.prod.website-files.com/6924575e25f2c55da5fad09f/69245b49b26d0d339e005a0e_4226663-p-500.png 500w, https://cdn.prod.website-files.com/6924575e25f2c55da5fad09f/69245b49b26d0d339e005a0e_4226663.png 512w"
                    />
                  </div>
                  <h3 className="h3">Instant Notifications</h3>
                  <p className="paragraph cc-gray">
                    As soon as a new permit is filed, you get the info immediately.No more manually checking city
                    portals — you’re always first to know.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <HeroSlider />

      <div className="about">
        <div className="container cc-center">
          <div className="h2-container cc-center">
            <h2 className="h2 cc-center">
              <strong>
                Contractors don’t need more noise — they need the right jobs, at the right time. That’s exactly what
                we deliver.
              </strong>
            </h2>
            <NavLink to="/about" className="link">
              More About Us
            </NavLink>
          </div>
        </div>
      </div>

      <div className="separator cc-background-grey">
        <div className="container">
          <div className="line-color"></div>
        </div>
      </div>

      <div className="premium">
        <div className="container">
          <div className="row">
            <div className="_2-row-image cc-row-spacing">
              <img
                src="https://cdn.prod.website-files.com/6924575d25f2c55da5fad02c/69245e1fbcb4cc429cd7b8db_building-permit.jpg"
                sizes="(max-width: 2268px) 100vw, 2268px"
                srcSet="https://cdn.prod.website-files.com/6924575d25f2c55da5fad02c/69245e1fbcb4cc429cd7b8db_building-permit-p-500.jpg 500w, https://cdn.prod.website-files.com/6924575d25f2c55da5fad02c/69245e1fbcb4cc429cd7b8db_building-permit-p-800.jpg 800w, https://cdn.prod.website-files.com/6924575d25f2c55da5fad02c/69245e1fbcb4cc429cd7b8db_building-permit-p-1080.jpg 1080w, https://cdn.prod.website-files.com/6924575d25f2c55da5fad02c/69245e1fbcb4cc429cd7b8db_building-permit-p-1600.jpg 1600w, https://cdn.prod.website-files.com/6924575d25f2c55da5fad02c/69245e1fbcb4cc429cd7b8db_building-permit-p-2000.jpg 2000w, https://cdn.prod.website-files.com/6924575d25f2c55da5fad02c/69245e1fbcb4cc429cd7b8db_building-permit.jpg 2268w"
                alt=""
              />
            </div>
            <div className="_2-row-text">
              <h2 className="h2 cc-2-rows">
                <strong>Built for Contractors. Powered by Data.</strong> We created PermitPulse with one goal — to give
                contractors an unfair advantage.
              </h2>
              <p className="paragraph cc-gray">
                Most contractors waste hours chasing cold leads, knocking doors, or hoping homeowners call back.We
                changed that.PermitPulse scans fresh city permit data daily, filters it, and delivers only the jobs
                that match your trade and ZIP.No guessing. No searching. Just real opportunities sent straight to you.
              </p>
            </div>
          </div>

          <div className="row cc-bottom">
            <div className="_2-row-image cc-bottom">
              <img
                src="https://cdn.prod.website-files.com/6924575d25f2c55da5fad02c/69245fb2e0c7ff5c076ab4a4_istockphoto-1345670580-612x612.jpg"
                sizes="(max-width: 612px) 100vw, 612px"
                srcSet="https://cdn.prod.website-files.com/6924575d25f2c55da5fad02c/69245fb2e0c7ff5c076ab4a4_istockphoto-1345670580-612x612-p-500.jpg 500w, https://cdn.prod.website-files.com/6924575d25f2c55da5fad02c/69245fb2e0c7ff5c076ab4a4_istockphoto-1345670580-612x612.jpg 612w"
                alt=""
              />
            </div>
            <div className="_2-row-text cc-bottom">
              <h2 className="h2 cc-2-rows">
                <strong>Why We Exist?</strong>
                <br />
                Because good contractors shouldn’t struggle to find work — the work should find them.
              </h2>
              <p className="paragraph cc-gray">
                Cities publish thousands of permits every month, but most contractors never see them.They don’t have
                time to dig through portals, update spreadsheets, or track who’s planning a project.So we built a
                system that does all of it for you automatically.Faster insights, faster contact, faster deals.That’s
                PermitPulse.
              </p>
            </div>
          </div>

          <div className="_2-row-action-text">
            <h3 className="h3">Wanna know more about the deal?</h3>
            <NavLink to="/pricing" className="link">
              See the full range of subscription
            </NavLink>
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
            <NavLink to="/pricing" className="button cc-cta w-button">
              Get Started
            </NavLink>
          </div>
        </div>
      </div>
    </>
  );
}
