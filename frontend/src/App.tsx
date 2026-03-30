import { type FormEvent, useMemo, useState } from 'react'
import { COUNTRIES } from './countries'
import { PRIVACY_POLICY, TERMS_AND_CONDITIONS } from './legal'

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

async function submitApplication(payload: ApplicationSubmitRequest): Promise<ApplicationSubmitResponse> {
  const res = await fetch('/api/applications/submit', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
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

  const feeText = useMemo(() => '$20 USD', [])

  const params = new URLSearchParams(window.location.search)
  const returnedPaymentId = params.get('paymentId')
  const returnedStatus = params.get('status')

  const validate = () => {
    if (!fullName.trim()) return 'Full Name is required'
    if (!email.trim()) return 'Email address is required'
    if (!phoneNumber.trim()) return 'Phone number is required'
    if (!countryOfResidence.trim()) return 'Country of residence is required'
    if (!city.trim()) return 'City is required'
    if (!age.trim()) return 'Age is required'
    if (!organizationName.trim()) return 'University / school / organization name is required'
    if (!participatedBefore.trim()) return 'Please answer: Have you participated in MUN conferences before?'
    if (!preferredParticipationType.trim()) return 'Preferred participation type is required'
    if (!motivation.trim()) return 'Why do you want to participate in EIMUN 2026? is required'
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
    <>
      <header className="rounded-3xl border border-white/10 bg-white/5 p-7">
        <div className="text-sm font-semibold text-white/70">EIMUN 2026</div>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Application Form</h1>
        <p className="mt-3 text-sm leading-relaxed text-white/70">
          Application fee: <span className="font-semibold text-white">{feeText}</span>
        </p>
      </header>

      {showPaymentReturn && (returnedPaymentId || returnedStatus) && (
        <div className="mt-6 rounded-3xl border border-white/10 bg-white/5 p-6 text-sm text-white/80">
          <div className="font-semibold">Payment return</div>
          <div className="mt-2">
            Payment ID: <span className="font-mono">{returnedPaymentId ?? '-'}</span>
          </div>
          <div>
            Status: <span className="font-mono">{returnedStatus ?? '-'}</span>
          </div>
        </div>
      )}

      <form onSubmit={onSubmit} className="mt-6 rounded-3xl border border-white/10 bg-white/5 p-7">
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="grid gap-2 sm:col-span-2">
            <span className="text-sm font-semibold">Full Name</span>
            <input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none focus:border-white/25"
              placeholder="Your full name"
            />
          </label>

            <label className="grid gap-2 sm:col-span-2">
              <span className="text-sm font-semibold">Email address</span>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none focus:border-white/25"
                placeholder="name@example.com"
                type="email"
              />
            </label>

            <div className="grid gap-2 sm:col-span-2">
              <span className="text-sm font-semibold">Phone number</span>
              <div className="grid gap-3 sm:grid-cols-[220px_1fr]">
                <select
                  value={phoneCountryDial}
                  onChange={(e) => setPhoneCountryDial(e.target.value)}
                  className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none focus:border-white/25"
                >
                  {COUNTRIES.map((c) => (
                    <option key={c.code} value={c.dial} className="bg-slate-900">
                      {c.name} ({c.dial})
                    </option>
                  ))}
                </select>

                <input
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(digitsOnly(e.target.value))}
                  className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none focus:border-white/25"
                  placeholder="Digits only"
                  inputMode="numeric"
                />
              </div>
            </div>

            <label className="grid gap-2">
              <span className="text-sm font-semibold">Country of residence</span>
              <select
                value={countryOfResidence}
                onChange={(e) => setCountryOfResidence(e.target.value)}
                className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none focus:border-white/25"
              >
                <option value="" className="bg-slate-900">
                  Select a country
                </option>
                {COUNTRIES.map((c) => (
                  <option key={c.code} value={c.name} className="bg-slate-900">
                    {c.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-semibold">City</span>
              <input
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none focus:border-white/25"
                placeholder="Your city"
              />
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-semibold">Age</span>
              <input
                value={age}
                onChange={(e) => setAge(digitsOnly(e.target.value))}
                className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none focus:border-white/25"
                placeholder="Digits only"
                inputMode="numeric"
              />
            </label>

            <label className="grid gap-2 sm:col-span-2">
              <span className="text-sm font-semibold">University / school / organization name</span>
              <input
                value={organizationName}
                onChange={(e) => setOrganizationName(e.target.value)}
                className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none focus:border-white/25"
                placeholder="Your organization"
              />
            </label>

            <label className="grid gap-2 sm:col-span-2">
              <span className="text-sm font-semibold">Have you participated in MUN conferences before?</span>
              <select
                value={participatedBefore}
                onChange={(e) => setParticipatedBefore(e.target.value)}
                className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none focus:border-white/25"
              >
                <option value="" className="bg-slate-900">
                  Select
                </option>
                <option value="yes" className="bg-slate-900">
                  Yes
                </option>
                <option value="no" className="bg-slate-900">
                  No
                </option>
              </select>
            </label>

            <label className="grid gap-2 sm:col-span-2">
              <span className="text-sm font-semibold">Preferred participation type</span>
              <select
                value={preferredParticipationType}
                onChange={(e) => setPreferredParticipationType(e.target.value)}
                className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none focus:border-white/25"
              >
                <option value="" className="bg-slate-900">
                  Select
                </option>
                <option value="delegate" className="bg-slate-900">
                  Delegate
                </option>
                <option value="chair" className="bg-slate-900">
                  Chair / President
                </option>
                <option value="press" className="bg-slate-900">
                  Press
                </option>
                <option value="observer" className="bg-slate-900">
                  Observer
                </option>
              </select>
            </label>

            <label className="grid gap-2 sm:col-span-2">
              <span className="text-sm font-semibold">Why do you want to participate in EIMUN 2026?</span>
              <textarea
                value={motivation}
                onChange={(e) => setMotivation(e.target.value)}
                className="min-h-[120px] rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none focus:border-white/25"
                placeholder="Tell us your motivation"
              />
            </label>

            <label className="grid gap-2 sm:col-span-2">
              <span className="text-sm font-semibold">Ambassador code (if any)</span>
              <input
                value={ambassadorCode}
                onChange={(e) => setAmbassadorCode(e.target.value)}
                className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none focus:border-white/25"
                placeholder="Optional"
              />
            </label>
          </div>

          <div className="mt-7 rounded-2xl border border-white/10 bg-black/10 p-5">
            <label className="flex items-start gap-3">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-white/20 bg-transparent"
              />
              <span className="text-sm text-white/80">
                I agree to the terms &amp; conditions and privacy policy
              </span>
            </label>

            <div className="mt-4 grid gap-3">
              <details className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <summary className="cursor-pointer text-sm font-semibold">📄 TERMS &amp; CONDITIONS</summary>
                <div className="mt-3 whitespace-pre-wrap text-xs leading-relaxed text-white/70">
                  {TERMS_AND_CONDITIONS}
                </div>
              </details>
              <details className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <summary className="cursor-pointer text-sm font-semibold">🔐 PRIVACY POLICY</summary>
                <div className="mt-3 whitespace-pre-wrap text-xs leading-relaxed text-white/70">
                  {PRIVACY_POLICY}
                </div>
              </details>
            </div>
          </div>

          {error && (
            <div className="mt-5 rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {error}
            </div>
          )}

        <button
          type="submit"
          disabled={loading}
          className="mt-6 w-full rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-white/90 disabled:opacity-60"
        >
          {loading ? 'Submitting…' : 'Submit application and pay'}
        </button>
      </form>
    </>
  )
}

export default function App() {
  return (
    <div className="min-h-screen bg-[#0b1220] text-gray-200">
      <div className="mx-auto max-w-4xl px-6 py-10">
        <ApplyFormInner />

        <footer className="mt-10 text-center text-xs text-white/45">
          Frontend: http://localhost:5173 · Backend: http://localhost:8080
        </footer>
      </div>
    </div>
  )
}
