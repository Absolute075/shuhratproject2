import { type FormEvent, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { COUNTRIES } from './countries'

type ApplicationSubmitRequest = {
  fullName: string
  email: string
  phoneCountryDial: string
  phoneNumber: string
  countryOfResidence: string
  city: string
  age: string
  organizationName: string
  participatedBefore: string
  preferredParticipationType: string
  motivation: string
  ambassadorCode: string
  agreedToTermsAndPrivacyPolicy: boolean
}

type ApplicationSubmitResponse = {
  applicationId: string
  paymentId: string
  redirectUrl: string
  status: string
}

type ApplyFormInnerProps = {
  showPaymentReturn?: boolean
}

function digitsOnly(value: string) {
  return value.replace(/\D+/g, '')
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

function humanizeApiError(value: string) {
  switch (value) {
    case 'terms_not_accepted':
      return 'You must agree to the terms & conditions and privacy policy'
    case 'missing_required_fields':
      return 'Please fill in all required fields before continuing'
    case 'invalid json':
      return 'Invalid request. Please try again.'
    default:
      return value.replace(/_/g, ' ')
  }
}

function getPaymentReturnMeta(status: string | null) {
  switch ((status ?? '').toLowerCase()) {
    case 'succeeded':
      return {
        title: 'Payment successful',
        description: 'Your payment has been received and your application is now in review.',
        statusClass: 'ef-status ef-status-success',
      }
    case 'created':
      return {
        title: 'Payment created',
        description: 'Your payment session was created. If payment was not completed, you can submit the form again.',
        statusClass: 'ef-status ef-status-warning',
      }
    case 'canceled':
    case 'cancelled':
      return {
        title: 'Payment canceled',
        description: 'The payment was canceled. You can fill the form and try again when you are ready.',
        statusClass: 'ef-status ef-status-error',
      }
    default:
      return {
        title: 'Payment update',
        description: 'We received a payment status update from the payment page.',
        statusClass: 'ef-status ef-status-default',
      }
  }
}

async function submitApplication(payload: ApplicationSubmitRequest): Promise<ApplicationSubmitResponse> {
  const res = await fetch('/api/applications/submit', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    const contentType = res.headers.get('content-type') ?? ''
    if (contentType.includes('application/json')) {
      const data = (await res.json().catch(() => null)) as { error?: string } | null
      if (data?.error) {
        throw new Error(humanizeApiError(data.error))
      }
    }
    const text = await res.text()
    throw new Error(text || `HTTP ${res.status}`)
  }

  return res.json()
}

export function ApplyFormInner({ showPaymentReturn = true }: ApplyFormInnerProps) {
  const defaultDial = useMemo(() => {
    const uz = COUNTRIES.find((c) => c.code === 'UZ')
    return uz?.dial ?? '+998'
  }, [])

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phoneCountryDial, setPhoneCountryDial] = useState(defaultDial)
  const [phoneNumber, setPhoneNumber] = useState('')
  const [countryOfResidence, setCountryOfResidence] = useState('')
  const [city, setCity] = useState('')
  const [age, setAge] = useState('')
  const [organizationName, setOrganizationName] = useState('')
  const [participatedBefore, setParticipatedBefore] = useState('')
  const [preferredParticipationType, setPreferredParticipationType] = useState('')
  const [motivation, setMotivation] = useState('')
  const [ambassadorCode, setAmbassadorCode] = useState('')
  const [agreed, setAgreed] = useState(false)

  const params = new URLSearchParams(window.location.search)
  const returnedPaymentId = params.get('paymentId')
  const returnedStatus = params.get('status')
  const paymentReturnMeta = getPaymentReturnMeta(returnedStatus)

  const validate = () => {
    if (!fullName.trim()) return 'Full Name is required'
    if (!email.trim()) return 'Email address is required'
    if (!isValidEmail(email.trim())) return 'Please enter a valid email address'
    if (!phoneNumber.trim()) return 'Phone number is required'
    if (digitsOnly(phoneNumber).length < 7) return 'Please enter a valid phone number'
    if (!countryOfResidence.trim()) return 'Country of residence is required'
    if (!city.trim()) return 'City is required'
    if (!age.trim()) return 'Age is required'
    const numericAge = Number(age)
    if (Number.isNaN(numericAge) || numericAge < 16 || numericAge > 30) return 'Age must be between 16 and 30'
    if (!organizationName.trim()) return 'University / school / organization name is required'
    if (!participatedBefore.trim()) return 'Please answer: Have you participated in MUN conferences before?'
    if (!preferredParticipationType.trim()) return 'Preferred participation type is required'
    if (!motivation.trim()) return 'Why do you want to participate in EIMUN 2026? is required'
    if (motivation.trim().length < 30) return 'Please provide a more detailed motivation (at least 30 characters)'
    if (!agreed) return 'You must agree to the terms & conditions and privacy policy'
    return null
  }

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)

    const v = validate()
    if (v) {
      setError(v)
      return
    }

    setLoading(true)
    try {
      const resp = await submitApplication({
        fullName,
        email,
        phoneCountryDial,
        phoneNumber,
        countryOfResidence,
        city,
        age,
        organizationName,
        participatedBefore,
        preferredParticipationType,
        motivation,
        ambassadorCode,
        agreedToTermsAndPrivacyPolicy: agreed,
      })
      window.location.href = resp.redirectUrl
    } catch (e2) {
      setError(e2 instanceof Error ? e2.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="eimun-form">
      {/* ── Payment return status ── */}
      {showPaymentReturn && (returnedPaymentId || returnedStatus) && (
        <div className="ef-card">
          <div className={paymentReturnMeta.statusClass}>
            <strong>{paymentReturnMeta.title}</strong>
            <span>{paymentReturnMeta.description}</span>
            <div className="ef-status-meta">
              <span>Status: {returnedStatus ?? '-'}</span>
              <span>Payment ID: {returnedPaymentId ?? '-'}</span>
            </div>
          </div>
        </div>
      )}

      {/* ── Main form ── */}
      <form onSubmit={onSubmit} className="ef-card">
        {/* Personal information */}
        <div className="ef-section-title">Personal information</div>
        <div className="ef-section-desc">Please fill in your main contact and profile details.</div>

        <div className="ef-fields">
          <div className="ef-field">
            <span className="ef-label">Full Name</span>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Your full name"
            />
          </div>

          <div className="ef-field">
            <span className="ef-label">Email address</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
            />
          </div>

          <div className="ef-field">
            <span className="ef-label">Phone number</span>
            <div className="ef-phone-row">
              <select
                value={phoneCountryDial}
                onChange={(e) => setPhoneCountryDial(e.target.value)}
              >
                {COUNTRIES.map((c) => (
                  <option key={c.code} value={c.dial}>
                    {c.name} ({c.dial})
                  </option>
                ))}
              </select>
              <input
                type="text"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(digitsOnly(e.target.value))}
                placeholder="Digits only"
                inputMode="numeric"
              />
            </div>
          </div>

          <div className="ef-row">
            <div className="ef-field">
              <span className="ef-label">Country of residence</span>
              <select
                value={countryOfResidence}
                onChange={(e) => setCountryOfResidence(e.target.value)}
              >
                <option value="">Select a country</option>
                {COUNTRIES.map((c) => (
                  <option key={c.code} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="ef-field">
              <span className="ef-label">City</span>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Your city"
              />
            </div>
          </div>

          <div className="ef-row">
            <div className="ef-field">
              <span className="ef-label">Age</span>
              <input
                type="text"
                value={age}
                onChange={(e) => setAge(digitsOnly(e.target.value))}
                placeholder="16-30"
                inputMode="numeric"
              />
            </div>
            <div className="ef-field">
              <span className="ef-label">Ambassador code (if any)</span>
              <input
                type="text"
                value={ambassadorCode}
                onChange={(e) => setAmbassadorCode(e.target.value)}
                placeholder="Optional"
              />
            </div>
          </div>

          <div className="ef-field">
            <span className="ef-label">University / school / organization name</span>
            <input
              type="text"
              value={organizationName}
              onChange={(e) => setOrganizationName(e.target.value)}
              placeholder="Your organization"
            />
          </div>
        </div>

        {/* Application details */}
        <div className="ef-section-title" style={{ marginTop: 28 }}>Application details</div>
        <div className="ef-section-desc">Tell us about your participation and motivation.</div>

        <div className="ef-fields">
          <div className="ef-field">
            <span className="ef-label">Have you participated in MUN conferences before?</span>
            <select
              value={participatedBefore}
              onChange={(e) => setParticipatedBefore(e.target.value)}
            >
              <option value="">Select</option>
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
          </div>

          <div className="ef-field">
            <span className="ef-label">Preferred participation type</span>
            <select
              value={preferredParticipationType}
              onChange={(e) => setPreferredParticipationType(e.target.value)}
            >
              <option value="">Select</option>
              <option value="delegate">Delegate</option>
              <option value="chair">Chair / President</option>
              <option value="press">Press</option>
              <option value="observer">Observer</option>
            </select>
          </div>

          <div className="ef-field">
            <span className="ef-label">Why do you want to participate in EIMUN 2026?</span>
            <textarea
              value={motivation}
              onChange={(e) => setMotivation(e.target.value)}
              placeholder="Tell us why you want to join EIMUN 2026"
            />
          </div>
        </div>

        {/* Agreement */}
        <div className="ef-agreement" style={{ marginTop: 24 }}>
          <label className="ef-check-label">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
            />
            <span className="ef-check-text">
              I agree to the{' '}
              <Link to="/terms-conditions">Terms &amp; Conditions</Link>{' '}
              and{' '}
              <Link to="/privacy-policy">Privacy Policy</Link>.
            </span>
          </label>
          <div className="ef-agreement-note">
            Make sure all details are correct before continuing to the Octo payment page.
          </div>
        </div>

        {/* Error */}
        {error && <div className="ef-error" style={{ marginTop: 16 }}>{error}</div>}

        {/* Hint + submit */}
        <div className="ef-hint" style={{ marginTop: 20 }}>
          By clicking submit, you will be redirected to Octo to complete the application fee payment.
        </div>

        <button
          type="submit"
          disabled={loading}
          className="ef-submit"
          style={{ marginTop: 12 }}
        >
          {loading ? 'Creating payment session...' : 'Submit application and continue to payment'}
        </button>
      </form>
    </div>
  )
}

export default function App() {
  return (
    <div style={{ minHeight: '100vh', background: '#f1f5f9', padding: '40px 16px' }}>
      <ApplyFormInner />
    </div>
  )
}
