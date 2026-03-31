import { type MouseEvent, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ApplyFormInner } from './App'

type FundingOption = {
  title: string
  priceText?: string
  image: {
    src: string
    srcSet: string
  }
  items: string[]
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

function scrollToApplySection() {
  const section = document.getElementById('apply-section')
  if (!section) return

  const top = section.getBoundingClientRect().top + window.scrollY - 48
  window.scrollTo({ top: Math.max(top, 0), behavior: 'smooth' })
}

function ApplyNowArrowLink() {
  return (
    <a
      href="#apply-section"
      onClick={(event: MouseEvent<HTMLAnchorElement>) => {
        event.preventDefault()
        scrollToApplySection()
      }}
      className="inline-flex items-center gap-2 rounded-full bg-black px-6 py-3 text-sm font-semibold text-white transition-colors duration-200 hover:bg-slate-800"
    >
      <span>Apply now</span>
      <span className="flex h-5 w-5 items-center justify-center text-white">
        <ArrowIcon />
      </span>
    </a>
  )
}

function FundingSlide({ option }: { option: FundingOption }) {
  return (
    <article className="min-w-[280px] snap-center overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm md:min-w-0">
      <img
        src={option.image.src}
        loading="lazy"
        sizes="(max-width: 768px) 280px, (max-width: 1200px) 33vw, 360px"
        srcSet={option.image.srcSet}
        alt=""
        className="h-56 w-full object-cover"
      />
      <div className="flex min-h-[320px] flex-col p-6">
        <h3 className="text-2xl font-extrabold text-black">{option.title}</h3>
        <p className="mt-4 text-base leading-7 text-slate-700">
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
        <div className="mt-auto pt-6">
          <ApplyNowArrowLink />
        </div>
      </div>
    </article>
  )
}

export default function LandingPage() {
  const location = useLocation()

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const shouldScroll =
      location.pathname === '/apply' ||
      location.hash === '#apply-section' ||
      params.has('paymentId') ||
      params.has('status')

    if (!shouldScroll) return

    const t = window.setTimeout(() => {
      scrollToApplySection()
    }, 50)

    return () => window.clearTimeout(t)
  }, [location.hash, location.pathname, location.search])

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
          <nav role="navigation" className="w-nav-menu" />
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
              <div>
                <div className="inline-block rounded-2xl bg-black px-4 py-2 text-white">
                  <span className="font-semibold text-white no-underline">
                    Global challenges &amp; Sustainable Development
                  </span>
                </div>
              </div>
              <div className="mt-3">
                <div className="inline-block rounded-2xl bg-black px-4 py-2 text-white">
                  <span className="font-semibold text-white no-underline"> Tashkent, Uzbekistan - May 2026</span>
                </div>
              </div>
              <div className="mt-6">
                <ApplyNowArrowLink />
              </div>
            </div>
          </div>
        </section>

        <section className="container">
          <div className="main-heading-wrap">
            <h1 className="heading text-4xl font-extrabold">Conference Overview</h1>
            <div className="divider mt-4" />
            <p
              id="w-node-_56f2b96e-ae6e-7af1-6a3b-a2d7387904db-8917cbc5"
              className="paragraph-light mt-6"
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

            <h1 className="heading mt-14 text-4xl font-extrabold">What you get with EIMUN</h1>
            <div className="divider mt-4" />
            <p className="paragraph-light mt-6">
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
          <div className="text-center">
            <span className="inline-block rounded-full bg-black px-4 py-2 font-semibold text-white no-underline">
              Tashkent, Uzbekistan - May, 2026
            </span>
          </div>

          <section className="team-slider">
            <div className="container-2">
              <h2 className="centered-heading text-4xl font-extrabold">FUNDING OPTIONS</h2>
              <div className="mt-10 flex snap-x snap-mandatory gap-5 overflow-x-auto pb-4 md:grid md:grid-cols-3 md:gap-8 md:overflow-visible md:pb-0">
                {FUNDING_OPTIONS.map((option) => (
                  <FundingSlide key={option.title} option={option} />
                ))}
              </div>
            </div>
          </section>
        </section>

        <div className="divider" />
        <div className="flex justify-center px-6">
          <img
            className="mx-auto block w-full max-w-[1200px]"
            src="https://cdn.prod.website-files.com/697f81cd3f55ea918917cb63/69807936720ea849f553de4e_international-student-flags.jpg"
            loading="lazy"
            sizes="(max-width: 1200px) 100vw, 1200px"
            srcSet="https://cdn.prod.website-files.com/697f81cd3f55ea918917cb63/69807936720ea849f553de4e_international-student-flags-p-500.jpg 500w, https://cdn.prod.website-files.com/697f81cd3f55ea918917cb63/69807936720ea849f553de4e_international-student-flags-p-800.jpg 800w, https://cdn.prod.website-files.com/697f81cd3f55ea918917cb63/69807936720ea849f553de4e_international-student-flags-p-1080.jpg 1080w, https://cdn.prod.website-files.com/697f81cd3f55ea918917cb63/69807936720ea849f553de4e_international-student-flags.jpg 1200w"
            alt=""
          />
        </div>

        <section className="mx-auto max-w-4xl px-6 text-center">
          <h1 className="heading text-5xl font-extrabold text-center">About</h1>
          <div className="divider mt-4" />
          <p className="paragraph-light mt-6 text-left leading-7 md:text-center">
            EIMUN 2026 is an international Model United Nations conference taking place in May 2026
            in Tashkent, Uzbekistan. The conference focuses on Global Challenges and Sustainable
            Development, providing a platform for youth to engage in diplomacy, debate, and
            collaborative problem-solving. Through structured committee sessions and discussions,
            participants will explore international issues, represent diverse perspectives, and
            develop key skills in leadership, negotiation, and public speaking. EIMUN aims to create
            an academic yet inclusive environment that encourages dialogue, cooperation, and global
            awareness among young leaders.
            <br />
            Available spots:
            <br />
            -20 Fully Funded
            <br />
            -30 Partial Funded
            <br />
            -50 Self Funded
          </p>

          <h1 className="heading mt-14 text-5xl font-extrabold text-center">Eligibility &amp; Requirements</h1>
          <div className="divider mt-4" />
          <div className="paragraph-light mt-6 text-left leading-7 md:text-center">
            <div className="text-2xl font-extrabold text-left md:text-center">Who Can Apply?</div>
            <div className="mt-3">
              EIMUN 2026 welcomes motivated and responsible young individuals who are interested in
              international relations, diplomacy, and global development. To be eligible, applicants
              must meet the following requirements:
            </div>

            <div className="mt-8 text-2xl font-extrabold text-left md:text-center">1. Age Requirement</div>
            <div className="mt-3">Applicants must be between 16 and 30 years old at the time of the conference.</div>

            <div className="mt-8 text-2xl font-extrabold text-left md:text-center">2. Language Proficiency</div>
            <div className="mt-3">
              Participants must have basic to intermediate proficiency in English, as all sessions and
              committee discussions will be conducted in English.
            </div>

            <div className="mt-8 text-2xl font-extrabold text-left md:text-center">3. Academic or Professional Background</div>
            <div className="mt-3">
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
            </div>

            <div className="mt-8 text-2xl font-extrabold text-left md:text-center">4. Commitment &amp; Professional Conduct</div>
            <div className="mt-3">
              Participants must:
              <br />
              • Attend all scheduled sessions
              <br />
              • Respect other delegates and organizers
              <br />
              • Follow conference rules and local laws
              <br />
              • Maintain professional behavior throughout the event
            </div>

            <div className="mt-8 text-2xl font-extrabold text-left md:text-center">5. Application &amp; Fee</div>
            <div className="mt-3">
              All applicants must:
              <br />
              • Complete the official online application form
              <br />
              • Pay the $20 non-refundable application fee
            </div>

            <div className="mt-8 text-2xl font-extrabold text-left md:text-center">6. Travel &amp; Documentation</div>
            <div className="mt-3">
              International participants are responsible for:
              <br />
              • Valid passport
              <br />
              • Visa requirements (if applicable)
              <br />
              • Travel arrangements
              <br />
              Official invitation letters will be provided to accepted participants upon request.
            </div>
          </div>
        </section>

        <section className="section cc-subscribe-form">
          <div className="container cc-subscription-form">
            <div className="heading-jumbo-small">Newsletter</div>
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

        <p className="paragraph-2 text-center">
          Note*: Application fee is non-refundable and it does not guarantee acceptance or any level of
          funding. Applications without completed payment will not be reviewed.
        </p>

      </main>

      <section id="apply-section" style={{ padding: '40px 24px', scrollMarginTop: '48px' }}>
        <ApplyFormInner />
      </section>

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
