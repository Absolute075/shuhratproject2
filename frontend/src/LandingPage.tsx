import { Link } from 'react-router-dom'

type FundingOption = {
  title: string
  priceText?: string
  image: {
    src: string
    srcSet: string
  }
  items: string[]
  ctaTextClassName?: string
}

const LOGO_URL =
  'https://cdn.prod.website-files.com/697f81cd3f55ea918917cb63/69807d10a34ab5e6e79411e9_image-removebg-preview%20(1).png'

const FUNDING_OPTIONS: FundingOption[] = [
  {
    title: 'Fully Funded',
    image: {
      src: 'https://cdn.prod.website-files.com/697f81cd3f55ea918917cb63/698d7eafea7e60a5d86fda85_Nomsiz%20dizayn%20(98).png',
      srcSet:
        'https://cdn.prod.website-files.com/697f81cd3f55ea918917cb63/698d7eafea7e60a5d86fda85_Nomsiz%20dizayn%20(98)-p-500.png 500w, https://cdn.prod.website-files.com/697f81cd3f55ea918917cb63/698d7eafea7e60a5d86fda85_Nomsiz%20dizayn%20(98).png 600w',
    },
    items: [
      'Accomodation (3-4 star hotel)',
      'Meals (3x)',
      'Conference materials',
      'Certificate of Participation',
      'City Travel',
    ],
    ctaTextClassName: 'text-block',
  },
  {
    title: 'Partial Funded',
    priceText: '$199 ',
    image: {
      src: 'https://cdn.prod.website-files.com/697f81cd3f55ea918917cb63/698d7e4d2d809b173b329000_Nomsiz%20dizayn%20(97).png',
      srcSet:
        'https://cdn.prod.website-files.com/697f81cd3f55ea918917cb63/698d7e4d2d809b173b329000_Nomsiz%20dizayn%20(97)-p-500.png 500w, https://cdn.prod.website-files.com/697f81cd3f55ea918917cb63/698d7e4d2d809b173b329000_Nomsiz%20dizayn%20(97).png 600w',
    },
    items: [
      'Accomodation (3-4 star hotel)',
      'Meals (3x)',
      'Conference materials',
      'Certificate of Participation',
      'City Travel',
    ],
    ctaTextClassName: 'text-block-2',
  },
  {
    title: 'Self Funded',
    priceText: '$399 ',
    image: {
      src: 'https://cdn.prod.website-files.com/697f81cd3f55ea918917cb63/69808861cc81c146274616e6_52619293272_ea66690fed_k.jpg',
      srcSet:
        'https://cdn.prod.website-files.com/697f81cd3f55ea918917cb63/69808861cc81c146274616e6_52619293272_ea66690fed_k-p-500.jpg 500w, https://cdn.prod.website-files.com/697f81cd3f55ea918917cb63/69808861cc81c146274616e6_52619293272_ea66690fed_k.jpg 600w',
    },
    items: [
      'Accomodation (3-4 star hotel)',
      'Meals (3x)',
      'Conference materials',
      'Certificate of Participation',
      'City Travel',
    ],
    ctaTextClassName: undefined,
  },
]

function ArrowIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M11.72 15L16.3472 10.357C16.7732 9.92932 16.7732 9.23603 16.3472 8.80962L11.72 4.16667L10.1776 5.71508L12.9425 8.4889H4.16669V10.6774H12.9425L10.1776 13.4522L11.72 15Z"
        fill="currentColor"
      />
    </svg>
  )
}

function ApplyNowArrowLink({ textClassName }: { textClassName?: string }) {
  return (
    <Link to="/apply" className="text-link-arrow w-inline-block">
      {textClassName ? (
        <div className={textClassName}>
          <strong>Apply now</strong>
        </div>
      ) : (
        <div>
          <strong className="bold-text-3">Apply now</strong>
        </div>
      )}
      <div className="arrow-embed w-embed">
        <ArrowIcon />
      </div>
    </Link>
  )
}

function FundingSlide({ option }: { option: FundingOption }) {
  return (
    <div className="team-slide-wrapper w-slide">
      <div className="team-block">
        <img
          src={option.image.src}
          loading="lazy"
          sizes="(max-width: 600px) 100vw, 600px"
          srcSet={option.image.srcSet}
          alt=""
          className="team-member-image-two"
        />
        <div className="team-block-info">
          <h3 className="team-member-name-two">{option.title}</h3>
          <p className="team-member-text">
            {option.priceText ? (
              <>
                <strong>{option.priceText}</strong>
                <br />
              </>
            ) : (
              <br />
            )}
            {option.items.map((item) => (
              <span key={item}>
                - {item}
                <br />
              </span>
            ))}
          </p>
          <ApplyNowArrowLink textClassName={option.ctaTextClassName} />
        </div>
      </div>
    </div>
  )
}

export default function LandingPage() {
  return (
    <div>
      <header
        data-animation="default"
        data-collapse="medium"
        data-duration="400"
        data-easing="ease"
        data-easing2="ease"
        role="banner"
        className="navbar w-nav"
      >
        <div className="container-5 w-container">
          <nav role="navigation" className="w-nav-menu">
            <Link to="/apply" className="primary-button w-button">
              Apply now
            </Link>
          </nav>
          <div className="w-nav-button">
            <div className="w-icon-nav-menu" />
          </div>
          <img src={LOGO_URL} loading="lazy" width="85" alt="" />
        </div>
      </header>

      <main className="section cc-store-home-wrap">
        <section className="intro-header">
          <div className="intro-content">
            <div className="intro-text">
              <div className="heading-jumbo">
                EIMUN 2026
                <br />
              </div>
              <div className="paragraph-bigger cc-bigger-light">
                <strong className="bold-text">Global challenges &amp; Sustainable Development</strong>
                <br />
              </div>
              <div className="paragraph-bigger cc-bigger-light">
                <strong>📍 Tashkent, Uzbekistan - 🗓 May 2026</strong>
                <br />
              </div>
            </div>
            <Link to="/apply" className="secondary-button w-inline-block">
              <div>Apply now</div>
            </Link>
          </div>
        </section>

        <section className="container">
          <div className="main-heading-wrap">
            <h1 className="heading">Conference Overview</h1>
            <div className="divider" />
            <p
              id="w-node-_56f2b96e-ae6e-7af1-6a3b-a2d7387904db-8917cbc5"
              className="paragraph-light"
            >
              <strong>• Conference:</strong> Eurasian International Model United Nations (EIMUN)
              <br />
              <strong>• Date:</strong> May 2026
              <br />
              <strong>• Location:</strong> Tashkent, Uzbekistan
              <br />
              <strong>• Theme:</strong> Global Challenges &amp; Sustainable Development
              <br />
              <strong>• Participants:</strong> International students and youth delegates
            </p>

            <h1 className="heading">What you get with EIMUN</h1>
            <div className="divider" />
            <div className="divider" />
            <p className="paragraph-light">
              • International exposure
              <br />
              • Academic &amp; professional certificates
              <br />
              • Global network of youth leaders
              <br />
              • Diplomacy, leadership &amp; negotiation skills
              <br />
              • Funded participation opportunities
            </p>
          </div>
        </section>

        <section className="container">
          <div className="products-heading">
            <div
              id="w-node-_2a24a47e-bcf5-d5d7-0359-e9656b835fdf-8917cbc5"
              className="w-layout-layout wf-layout-layout"
            >
              <div className="w-layout-cell" />
            </div>
            <div className="paragraph-bigger cc-bigger-light">Tashkent, Uzbekistan - May, 2026</div>
          </div>

          <section className="team-slider">
            <div className="container-2">
              <h2 className="centered-heading">FUNDING OPTIONS</h2>
              <div
                data-delay="4000"
                data-animation="slide"
                className="team-slider-wrapper w-slider"
                data-autoplay="false"
                data-easing="ease"
                data-hide-arrows="false"
                data-disable-swipe="false"
                data-autoplay-limit="0"
                data-nav-spacing="12"
                data-duration="500"
                data-infinite="true"
              >
                <div className="w-slider-mask">
                  {FUNDING_OPTIONS.map((option) => (
                    <FundingSlide key={option.title} option={option} />
                  ))}
                </div>

                <div className="team-slider-arrow w-slider-arrow-left">
                  <div className="w-icon-slider-left" />
                </div>
                <div className="team-slider-arrow w-slider-arrow-right">
                  <div className="w-icon-slider-right" />
                </div>
                <div className="team-slider-nav w-slider-nav w-slider-nav-invert w-round" />
              </div>
            </div>
          </section>
        </section>

        <div className="divider" />
        <img
          src="https://cdn.prod.website-files.com/697f81cd3f55ea918917cb63/69807936720ea849f553de4e_international-student-flags.jpg"
          loading="lazy"
          sizes="(max-width: 1200px) 100vw, 1200px"
          srcSet="https://cdn.prod.website-files.com/697f81cd3f55ea918917cb63/69807936720ea849f553de4e_international-student-flags-p-500.jpg 500w, https://cdn.prod.website-files.com/697f81cd3f55ea918917cb63/69807936720ea849f553de4e_international-student-flags-p-800.jpg 800w, https://cdn.prod.website-files.com/697f81cd3f55ea918917cb63/69807936720ea849f553de4e_international-student-flags-p-1080.jpg 1080w, https://cdn.prod.website-files.com/697f81cd3f55ea918917cb63/69807936720ea849f553de4e_international-student-flags.jpg 1200w"
          alt=""
        />

        <h1 className="heading">About</h1>
        <div className="divider" />
        <p className="paragraph-light">
          EIMUN 2026 is an international Model United Nations conference taking place in May 2026 in
          Tashkent, Uzbekistan. The conference focuses on Global Challenges and Sustainable
          Development, providing a platform for youth to engage in diplomacy, debate, and
          collaborative problem-solving. Through structured committee sessions and discussions,
          participants will explore international issues, represent diverse perspectives, and develop
          key skills in leadership, negotiation, and public speaking. EIMUN aims to create an academic
          yet inclusive environment that encourages dialogue, cooperation, and global awareness among
          young leaders.
          <br />
          Available spots:
          <br />
          -20 Fully Funded
          <br />
          -30 Partial Funded
          <br />
          -50 Self Funded
        </p>

        <h1 className="heading">Eligibility &amp; Requirements</h1>
        <div className="divider" />
        <p className="paragraph-light">
          <strong>Who Can Apply?</strong>
          <br />
          EIMUN 2026 welcomes motivated and responsible young individuals who are interested in
          international relations, diplomacy, and global development. To be eligible, applicants must
          meet the following requirements:
          <br />
          <strong>1. Age Requirement</strong>
          <br />
          Applicants must be between 16 and 30 years old at the time of the conference.
          <br />
          <strong>2. Language Proficiency</strong>
          <br />
          Participants must have basic to intermediate proficiency in English, as all sessions and
          committee discussions will be conducted in English.
          <br />
          <strong>3. Academic or Professional Background</strong>
          <br />
          Applicants can be:
          <br />
          • High school students
          <br />
          • University students
          <br />
          • Recent graduates
          <br />
          • Young professionals interested in global affairs
          <br />
          Previous MUN experience is not required, but is considered an advantage.
          <br />
          <strong>4. Commitment &amp; Professional Conduct</strong>
          <br />
          Participants must:
          <br />
          • Attend all scheduled sessions
          <br />
          • Respect other delegates and organizers
          <br />
          • Follow conference rules and local laws
          <br />
          • Maintain professional behavior throughout the event
          <br />
          <strong>5. Application &amp; Fee</strong>
          <br />
          All applicants must:
          <br />
          • Complete the official online application form
          <br />
          • Pay the $20 non-refundable application fee
          <br />
          <strong>6. Travel &amp; Documentation</strong>
          <br />
          International participants are responsible for:
          <br />
          • Valid passport
          <br />
          • Visa requirements (if applicable)
          <br />
          • Travel arrangements
          <br />
          Official invitation letters will be provided to accepted participants upon request.
        </p>

        <Link to="/apply" className="primary-button w-button">
          Apply now
        </Link>
      </main>

      <section className="section cc-subscribe-form">
        <div className="container cc-subscription-form">
          <div className="heading-jumbo-small"> Newsletter</div>
          <div className="paragraph-light cc-subscribe-paragraph">Sign up to receive updates.</div>
          <div className="form-block w-form">
            <form
              id="wf-form-Monthly-Newsletter-Form"
              name="wf-form-Monthly-Newsletter-Form"
              data-name="Monthly Newsletter Form"
              method="get"
              className="subscribe-form"
              data-wf-page-id="697f81cf3f55ea918917cbc5"
              data-wf-element-id="2df3695a-ff87-37fa-7ac7-63d4f4891940"
            >
              <input
                className="text-field cc-subscribe-text-field w-input"
                maxLength={256}
                name="Newsletter-Email"
                data-name="Newsletter Email"
                placeholder="Enter your email"
                type="email"
                id="Newsletter-Email"
                required
              />
              <input
                type="submit"
                data-wait="Please wait..."
                className="primary-button w-button"
                value="Submit"
              />
            </form>
            <div className="status-message w-form-done">
              <div>Thank you! Your submission has been received!</div>
            </div>
            <div className="status-message w-form-fail">
              <div>Oops! Something went wrong while submitting the form.</div>
            </div>
          </div>
        </div>
      </section>

      <p className="paragraph-2">
        Note*: Application fee is non-refundable and it does not guarantee acceptance or any level of
        funding. Applications without completed payment will not be reviewed.
      </p>

      <footer className="footer-dark">
        <div className="container-3">
          <div className="footer-wrapper">
            <Link to="/" className="footer-brand w-inline-block">
              <img src={LOGO_URL} width="87" alt="" className="logo-footer" />
            </Link>
            <div className="footer-content">
              <div
                id="w-node-b75d5587-f12b-1894-5c78-850ba3c1b1d4-8917cbc5"
                className="footer-block"
              >
                <Link to="/terms-conditions" className="footer-link-2">
                  Terms &amp; Conditions
                </Link>
                <Link to="/privacy-policy" className="footer-link-2">
                  Privacy policy
                </Link>
              </div>
            </div>
          </div>
        </div>
        <div className="footer-divider" />
        <div className="footer-copyright-center">Copyright © 2025 EIMUN</div>
      </footer>
    </div>
  )
}
