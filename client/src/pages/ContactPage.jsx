import { Check, MessageSquare, ShieldCheck } from 'lucide-react';
import { useEffect, useState } from 'react';
import { ArchitecturalBentoCard, LavenderStagePanel } from '../components/layout/Primitives';
import { useToast } from '../components/toast/ToastViewport';
import { SERVICES, SITE_CONFIG } from '../config/siteConfig';

export default function ContactPage({ initialService, onNavigate }) {
  const { notify } = useToast();
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    zip: '',
    service: initialService || 'Roof replacement',
    message: '',
    website: '',
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    if (initialService) setForm((c) => ({ ...c, service: initialService }));
  }, [initialService]);

  const submitForm = async (e) => {
    e.preventDefault();
    setErrors({});
    setResult(null);
    setSubmitting(true);
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await response.json().catch(() => ({}));
      if (data.status === 'integration_pending') {
        setResult({
          type: 'pending',
          message: `Lead saved in CRM (${data.leadRef || 'queued'}). Email delivery activates once Resend sender domain is verified.`,
        });
        notify('Inquiry saved in CRM queue', 'info');
      } else if (!response.ok) {
        if (data.errors) setErrors(data.errors);
        setResult({ type: 'error', message: data.error || 'Please review the highlighted fields.' });
      } else {
        setResult({ type: 'success', message: `Thank you — request ${data.leadRef || ''} has been delivered.` });
        notify('Message delivered', 'Our assessor will follow up shortly.', 'success');
        setForm({ name: '', email: '', phone: '', zip: '', service: 'Roof replacement', message: '', website: '' });
      }
    } catch {
      setResult({ type: 'error', message: 'Contact service unavailable right now.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ paddingBottom: '4rem' }}>
      {/* Asymmetric Staggered Top Section (Policies Stack Left + Wide Card Right) BEFORE Form */}
      <section className="ar-section">
        <div className="ar-container ar-bento-12">
          <div className="ar-col-4" style={{ display: 'grid', gap: '1rem', alignContent: 'start' }}>
            <h1>
              Talk <span className="ar-kw-volt">scope.</span>
            </h1>
            {[
              ['Territory ZIP Routing', 'Matches regional wind uplift & crew lead time automatically.'],
              ['Direct Dispatch', `${SITE_CONFIG.phone} · ${SITE_CONFIG.email}`],
              ['Transferable Coverage', 'Workmanship certificates recorded in your Client Portal.'],
            ].map(([title, copy]) => (
              <div
                key={title}
                style={{
                  background: 'var(--surface-nocturne-glass)',
                  border: '1px solid var(--border-navy)',
                  borderRadius: 'var(--radius-tile)',
                  padding: '1.15rem',
                }}
              >
                <strong style={{ color: 'var(--lavender-base)' }}>{title}</strong>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: 4 }}>{copy}</p>
              </div>
            ))}
          </div>

          <ArchitecturalBentoCard
            className="ar-col-8"
            tone="lavender"
            variant="horizontal"
            tag="Direct Estimating Desk"
            headline="Prefer live numbers before speaking?"
            body="Use our interactive calculator to test square footage, pitch tiers, and standing seam vs slate costs right now."
            imageSrc="/images/roof-detail.webp"
            imageAlt="Close architectural shingle and eave edge"
            cta={
              <button type="button" className="btn-secondary" onClick={() => onNavigate('estimate')}>
                Open Scope Estimator
              </button>
            }
          />
        </div>
      </section>

      {/* Lower Lavender Haze Form Panel */}
      <section className="ar-section" style={{ paddingTop: '0.5rem' }}>
        <div className="ar-container">
          <LavenderStagePanel
            maxWidth={920}
            icon={<MessageSquare size={20} />}
            title="Send project inquiry"
            subtitle="Persisted directly into our Operations CRM with automated hub priority scoring."
            footerNote={`${SITE_CONFIG.phone} · ${SITE_CONFIG.officeAddress}`}
          >
            <form onSubmit={submitForm} className="ar-form-box" noValidate>
              <div className="ar-form-row">
                <div>
                  <label className="ar-label" htmlFor="c-name">Your name *</label>
                  <input id="c-name" className="ar-input" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
                  {errors.name && <span className="ar-field-error">{errors.name}</span>}
                </div>
                <div>
                  <label className="ar-label" htmlFor="c-email">Email address *</label>
                  <input id="c-email" type="email" className="ar-input" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
                  {errors.email && <span className="ar-field-error">{errors.email}</span>}
                </div>
              </div>

              <div className="ar-form-row">
                <div>
                  <label className="ar-label" htmlFor="c-phone">Phone number *</label>
                  <input id="c-phone" type="tel" className="ar-input" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
                  {errors.phone && <span className="ar-field-error">{errors.phone}</span>}
                </div>
                <div>
                  <label className="ar-label" htmlFor="c-zip">Property ZIP *</label>
                  <input id="c-zip" maxLength={10} className="ar-input" value={form.zip} onChange={(e) => setForm((f) => ({ ...f, zip: e.target.value }))} />
                  {errors.zip && <span className="ar-field-error">{errors.zip}</span>}
                </div>
              </div>

              <div>
                <label className="ar-label" htmlFor="c-service">Roofing Service *</label>
                <select id="c-service" className="ar-input" value={form.service} onChange={(e) => setForm((f) => ({ ...f, service: e.target.value }))}>
                  {SERVICES.map((s) => <option key={s.id} value={s.title}>{s.title}</option>)}
                </select>
              </div>

              <div>
                <label className="ar-label" htmlFor="c-message">Project notes</label>
                <textarea id="c-message" rows={3} className="ar-input" style={{ minHeight: 96 }} value={form.message} onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))} />
              </div>

              <div style={{ display: 'none' }} aria-hidden="true">
                <input tabIndex={-1} autoComplete="off" value={form.website} onChange={(e) => setForm((f) => ({ ...f, website: e.target.value }))} />
              </div>

              <button type="submit" className="btn-secondary" style={{ width: '100%' }} disabled={submitting}>
                {submitting ? 'Sending Request…' : 'Send Project Details'}
              </button>

              {result && (
                <div
                  role="status"
                  style={{
                    padding: '0.85rem 1rem',
                    borderRadius: '14px',
                    background: '#FFFFFF',
                    border: '1px solid #0B1021',
                    fontSize: '0.9375rem',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                  }}
                >
                  {result.type === 'success' ? <Check size={16} /> : <ShieldCheck size={16} />}
                  <span>{result.message}</span>
                </div>
              )}
            </form>
          </LavenderStagePanel>
        </div>
      </section>
    </div>
  );
}
