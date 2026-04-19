import { useState } from 'react';
import NavBar from '../../components/Layout/NavBar';

type SubmitStatus = 'idle' | 'submitting' | 'success' | 'error';

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [website, setWebsite] = useState('');
  const [status, setStatus] = useState<SubmitStatus>('idle');
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === 'submitting') return;

    setStatus('submitting');
    setError(null);

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message, website })
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `HTTP ${res.status}`);
      }

      setStatus('success');
      setName('');
      setEmail('');
      setMessage('');
      setWebsite('');
    } catch (err) {
      setStatus('error');
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  return (
    <>
      <div className="header-inner">
        <NavBar />
        <div className="container">
          <div className="header-inner-content">
            <div className="inner-category">
              <a href="#" className="h3 cc-header">
                Contact
              </a>
              <div className="cta-line cc-header"></div>
            </div>
            <h1 className="h1">Have a question for us? Go for it.</h1>
            <p className="paragraph">
              <strong>We’re here to help you grow your contracting business — reach out anytime.</strong>
            </p>
          </div>
        </div>
      </div>

      <div className="contact-intro">
        <div className="container">
          <div className="h2-container">
            <h2 className="h2">
              <strong>
                Send Us a Message
                <br />
              </strong>
              Have a question, need support, or want to learn more?
              <br />
              Fill out the form and our team will get back to you within one business day.
            </h2>
          </div>
        </div>

        <div className="container cc-contact">
          <div className="contact-info">
            <div className="contact-info-row">
              <div className="contact-info-text">Email:</div>
              <div className="contact-info-text cc-text-black">permitpulse.contact@gmail.com</div>
            </div>
          </div>

          <div className="form-input">
            <div className="w-form">
              <form id="email-form" name="email-form" onSubmit={onSubmit}>
                <input
                  className="text-field w-input"
                  maxLength={256}
                  name="name"
                  placeholder="Name"
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={status === 'submitting'}
                />
                <input
                  className="text-field w-input"
                  maxLength={256}
                  name="email"
                  placeholder="Email"
                  type="email"
                  id="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={status === 'submitting'}
                />
                <input
                  className="text-field w-input"
                  maxLength={2048}
                  name="message"
                  placeholder="Tell us all about it"
                  type="text"
                  id="message"
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  disabled={status === 'submitting'}
                />
                <input
                  tabIndex={-1}
                  autoComplete="off"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  style={{ position: 'absolute', left: -10000, top: 'auto', width: 1, height: 1, overflow: 'hidden' }}
                  aria-hidden="true"
                />
                <input
                  type="submit"
                  className="button w-button"
                  value={status === 'submitting' ? 'Please wait...' : 'Submit'}
                />
              </form>

              {status === 'success' ? (
                <div className="w-form-done" style={{ display: 'block' }}>
                  <div>Thank you! Your submission has been received!</div>
                </div>
              ) : null}

              {status === 'error' ? (
                <div className="w-form-fail" style={{ display: 'block' }}>
                  <div>Oops! Something went wrong while submitting the form.{error ? ` ${error}` : ''}</div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
