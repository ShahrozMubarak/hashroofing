import { Check, Home, Layers, ShieldCheck, Wind } from 'lucide-react';
import { useEffect, useState } from 'react';
import { apiFetch } from '../api/client';
import { SERVICES } from '../config/siteConfig';
import { RevealSection } from '../design/motion';
import ArchitecturalHero from '../components/home/ArchitecturalHero';
import PinnedRoofSpotlight from '../components/home/PinnedRoofSpotlight';
import {
  ArchFramedCard,
  ArchitecturalBentoCard,
  CrystalSpecCard,
  FloatingTelemetryStripCard,
  LavenderStagePanel,
} from '../components/layout/Primitives';
import { useToast } from '../components/toast/ToastViewport';

export default function HomePage({ onNavigate, onSelectService }) {
  const { notify } = useToast();
  const [reviews, setReviews] = useState([]);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    zip: '',
    service: 'Roof replacement',
    message: '',
    website: '',
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    apiFetch('/reviews').then(setReviews).catch(() => {});
  }, []);

  const scrollToSection = (sectionId) => {
    const el = document.getElementById(sectionId);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleInquiry = async (e) => {
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
          message: `Lead logged (${data.leadRef || 'saved'}). Email integration pending inbox configuration.`,
        });
        notify('Inquiry saved to CRM queue', 'info');
      } else if (!response.ok) {
        if (data.errors) setErrors(data.errors);
        setResult({ type: 'error', message: data.error || 'Please check highlighted fields.' });
      } else {
        setResult({ type: 'success', message: `Inquiry ${data.leadRef || ''} sent successfully.` });
        notify('Project request sent', 'Our estimator team will follow up shortly.', 'success');
        setForm({ name: '', email: '', phone: '', zip: '', service: 'Roof replacement', message: '', website: '' });
      }
    } catch {
      setResult({ type: 'error', message: 'Contact service temporarily unavailable.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      {/* 1. Spacious Whole-Viewport Hero with Broken-to-Finished Roof Wipe Filter */}
      <ArchitecturalHero onNavigate={onNavigate} onAnchor={scrollToSection} />

      {/* 2. Floating Liquid Crystal Telemetry Strip */}
      <section className="ar-section" style={{ paddingBottom: 'clamp(1.25rem, 2.5vw, 2rem)' }}>
        <div className="ar-container">
          <FloatingTelemetryStripCard
            eyebrow="PACIFIC NORTHWEST TERRITORY HUBS"
            title="Engineered proposals, drone slot booking & verified warranties."
            stats={[
              ['140 mph', 'Wind Uplift Spec'],
              ['0–100', 'Roof Health Index'],
              ['4 hrs', 'Storm Tarp SLA'],
              ['8 Stages', 'Client Live Portal'],
            ]}
            actions={
              <>
                <button type="button" className="btn-lavender" onClick={() => onNavigate('estimate')}>
                  Estimate Scope
                </button>
                <button type="button" className="btn-crystal" onClick={() => onNavigate('inspections')}>
                  Book Hub Slot
                </button>
              </>
            }
          />
        </div>
      </section>

      {/* 3. Multi-Style Liquid Crystal Bento + Cathedral Arch Cards */}
      <section id="disciplines" className="ar-section">
        <div className="ar-container" style={{ display: 'grid', gap: 'clamp(2rem, 3.5vw, 3rem)' }}>
          <RevealSection style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.25rem', alignItems: 'end' }}>
            <h2>
              Four core <span className="ar-kw-lavender">disciplines.</span>
            </h2>
            <p style={{ color: 'var(--text-muted)', maxWidth: '46ch' }}>
              Liquid-crystal architectural panels matched to regional framing geometry and coastal exposure.
            </p>
          </RevealSection>

          <div className="ar-bento-12">
            <ArchitecturalBentoCard
              className="ar-col-7"
              tone="nocturne"
              variant="tall"
              tag="01 · Complete Envelope Renewal"
              headline={
                <>
                  Architectural <span className="ar-kw-volt">roof replacement.</span>
                </>
              }
              body="Full tear-off down to structural sheathing, CDX plywood swaps, ice-and-water membranes, and lifetime standing seam or Class-4 composite installation."
              videoSrc="/images/house-roof-loop.mp4"
              posterSrc="/images/hero-home.webp"
              cta={
                <button type="button" className="btn-lavender" onClick={() => onSelectService('Roof replacement')}>
                  Scope Replacement
                </button>
              }
            />

            <ArchFramedCard
              className="ar-col-5"
              tone="lavender"
              badge="Solar-Ready Seam"
              tag="02 · New Roof Installation"
              headline="Concealed fastener steel & solar rails."
              body="Custom striated metal panels engineered with non-penetrating S-5 solar mounting clamps from day one."
              imageSrc="/images/solar-house-after.jpg"
              imageAlt="Modern home with solar-ready concealed seam roof"
              metrics={['Class A Fire', 'Zero Exposed Screws', '50-Yr Finish']}
              cta={
                <button type="button" className="btn-secondary" onClick={() => onSelectService('Roof installation')}>
                  Explore Systems
                </button>
              }
            />

            <ArchitecturalBentoCard
              className="ar-col-4"
              tone="lavender"
              variant="compact"
              tag="03 · Urgent Remediation"
              headline="Precision roof repair & leak triage."
              body="Skylight curbs, chimney copper crickets, and 4-hour emergency tarp dispatch across storm corridors."
              imageSrc="/images/roof-detail.webp"
              imageAlt="Architectural eave and flashing detail"
              cta={
                <button type="button" className="btn-secondary" onClick={() => onNavigate('inspections')}>
                  Log Triage Ticket
                </button>
              }
              delay={0.08}
            />

            <ArchitecturalBentoCard
              className="ar-col-8"
              tone="nocturne"
              variant="horizontal"
              tag="04 · Quantified Roof Health Index"
              headline={
                <>
                  Certified thermal &amp; <span className="ar-kw-lavender">drone inspections.</span>
                </>
              }
              body="Book non-conflicting regional assessor slots and view itemized 0–100 scores across decking, flashing, ventilation, surface wear, and drainage."
              imageSrc="/images/roof-inspection.webp"
              imageAlt="Auren assessor evaluating roof condition"
              cta={
                <button type="button" className="btn-crystal" onClick={() => onNavigate('inspections')}>
                  Reserve Time Slot
                </button>
              }
              delay={0.12}
            />
          </div>
        </div>
      </section>

      {/* 4. Sticky Telemetry Spotlight */}
      <PinnedRoofSpotlight onNavigate={onNavigate} />

      {/* 5. NEW Liquid Crystal Engineering Cards Section */}
      <section className="ar-section">
        <div className="ar-container" style={{ display: 'grid', gap: 'clamp(2rem, 3.5vw, 3rem)' }}>
          <RevealSection style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.25rem', alignItems: 'end' }}>
            <h2>
              Assembly <span className="ar-kw-lavender">layers &amp; protection.</span>
            </h2>
            <p style={{ color: 'var(--text-muted)', maxWidth: '46ch' }}>
              Every square foot is documented from bare sheathing inspection through transferable certificate issuance.
            </p>
          </RevealSection>

          <div className="ar-bento-12">
            <div className="ar-col-4">
              <CrystalSpecCard
                tone="nocturne"
                icon={<Layers size={20} />}
                code="SPEC · DECK-CDX"
                title="Structural Sheathing & Moisture Shield"
                summary="High-temp self-adhering ice & water valleys paired with breathable synthetic underlayment."
                specs={[
                  ['Valley Membrane', 'High-Temp Butyl'],
                  ['Sheathing Audit', '100% Moisture Meter'],
                  ['Fastener Pattern', '6-Nail Coastal'],
                ]}
                action={
                  <button type="button" className="btn-crystal" style={{ width: '100%' }} onClick={() => onNavigate('estimate')}>
                    Configure Scope
                  </button>
                }
              />
            </div>

            <div className="ar-col-4">
              <CrystalSpecCard
                tone="lavender"
                icon={<Wind size={20} />}
                code="SPEC · SEAM-140"
                title="Standing Seam & Ridge Airflow"
                summary="24-gauge PVDF matte panels engineered to shed marine rain while balancing attic intake/exhaust."
                specs={[
                  ['Wind Uplift', '140 mph Rated'],
                  ['Panel Finish', 'Kynar 500 PVDF'],
                  ['Attic Exchange', 'Balanced Net Free Area'],
                ]}
                action={
                  <button type="button" className="btn-secondary" style={{ width: '100%' }} onClick={() => onNavigate('projects')}>
                    Compare Systems
                  </button>
                }
                delay={0.08}
              />
            </div>

            <div className="ar-col-4">
              <CrystalSpecCard
                tone="nocturne"
                icon={<ShieldCheck size={20} />}
                code="SPEC · VAULT-25"
                title="Storm Triage & Transferable Vault"
                summary="Real-time crew stage progress, homeowner change orders, and verified warranty PDFs."
                specs={[
                  ['Workmanship Term', '25 Years Covered'],
                  ['Transferability', 'One-Time Home Sale'],
                  ['Emergency Dispatch', '4–6 hr Corridor SLA'],
                ]}
                action={
                  <button type="button" className="btn-crystal" style={{ width: '100%' }} onClick={() => onNavigate('portal')}>
                    Verify Portal &amp; Warranty
                  </button>
                }
                delay={0.14}
              />
            </div>
          </div>
        </div>
      </section>

      {/* 6. Asymmetric 8:4 Material Lab + Chamfered Crystal Vault Card */}
      <section className="ar-section">
        <div className="ar-container ar-bento-12">
          <ArchitecturalBentoCard
            className="ar-col-8"
            tone="lavender"
            variant="panoramic"
            tag="Material Systems Lab"
            headline="Standing seam, composite slate & western red cedar."
            body="Compare fire ratings, uplift tolerances, and live regional cost ranges per square foot across 5 Pacific Northwest zones."
            imageSrc="/images/material-palette.webp"
            imageAlt="Curated roofing shingle and metal color swatches"
            cta={
              <div style={{ display: 'flex', gap: '0.85rem', flexWrap: 'wrap' }}>
                <button type="button" className="btn-secondary" onClick={() => onNavigate('estimate')}>
                  Compare Systems
                </button>
                <button type="button" className="btn-crystal" onClick={() => onNavigate('projects')} style={{ background: 'rgba(11,16,33,0.08)', color: '#0B1021', borderColor: 'rgba(11,16,33,0.2)' }}>
                  Before &amp; After Gallery
                </button>
              </div>
            }
          />

          <div className="ar-col-4 ar-hover-card ar-chamfer-card ar-crystal-card" style={{ color: 'var(--text-on-nocturne)' }}>
            <div style={{ display: 'grid', gap: '0.95rem' }}>
              <span style={{ color: 'var(--tag-on-nocturne)', fontWeight: 800, fontSize: '0.9rem' }}>
                Homeowner Vault
              </span>
              <h3>Live 8-stage project portal &amp; PDF warranties.</h3>
              <p style={{ color: 'var(--muted-on-nocturne)' }}>
                Track tear-off logs, approve change orders online, and verify transferable certificates anytime.
              </p>
              <div style={{ display: 'grid', gap: '0.5rem', marginTop: '0.25rem' }}>
                {['Live weather & sheathing notes', 'Downloadable engineered quotes', 'SHA-verified warranty IDs'].map((item) => (
                  <span key={item} style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-on-nocturne)', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Check size={14} color="currentColor" /> {item}
                  </span>
                ))}
              </div>
            </div>
            <button type="button" className="btn-lavender" onClick={() => onNavigate('portal')}>
              Open Client Portal
            </button>
          </div>
        </div>
      </section>

      {/* 7. Homeowner Reviews Spacious Crystal Cards */}
      {reviews.length > 0 && (
        <section className="ar-section">
          <div className="ar-container" style={{ display: 'grid', gap: 'clamp(2rem, 3.5vw, 2.75rem)' }}>
            <h2>
              Homeowners on <span className="ar-kw-lavender">Auren.</span>
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', gap: 'clamp(1.5rem, 2.8vw, 2.25rem)' }}>
              {reviews.slice(0, 3).map((r, idx) => (
                <div
                  key={r._id}
                  className={idx === 1 ? 'ar-review-card-lifted ar-crystal-light' : 'ar-review-card-navy ar-crystal-card'}
                >
                  <strong style={{ color: idx === 1 ? '#0B1021' : 'var(--tag-on-nocturne)' }}>{'★'.repeat(r.rating)}</strong>
                  <p style={{ lineHeight: 1.65 }}>{r.comment}</p>
                  <strong style={{ fontSize: '0.95rem' }}>{r.homeownerName} · {r.city}</strong>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 8. Spacious Lavender Crystal Consultation Panel */}
      <section className="ar-section" style={{ paddingBottom: 'clamp(4.5rem, 8vw, 7rem)' }}>
        <div className="ar-container">
          <LavenderStagePanel
            maxWidth={920}
            icon={<Home size={20} />}
            title="Start your project briefing"
            subtitle="Scored against ZIP territory wind zones and routed straight to our regional estimator queue."
            footerNote="Licensed, bonded & insured · Instant CRM logging"
          >
            <form onSubmit={handleInquiry} className="ar-form-box" noValidate>
              <div className="ar-form-row">
                <div>
                  <label className="ar-label" htmlFor="home-name">Your name *</label>
                  <input id="home-name" className="ar-input" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
                  {errors.name && <span className="ar-field-error">{errors.name}</span>}
                </div>
                <div>
                  <label className="ar-label" htmlFor="home-email">Email address *</label>
                  <input id="home-email" type="email" className="ar-input" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
                  {errors.email && <span className="ar-field-error">{errors.email}</span>}
                </div>
              </div>

              <div className="ar-form-row">
                <div>
                  <label className="ar-label" htmlFor="home-phone">Phone number *</label>
                  <input id="home-phone" type="tel" className="ar-input" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
                  {errors.phone && <span className="ar-field-error">{errors.phone}</span>}
                </div>
                <div>
                  <label className="ar-label" htmlFor="home-zip">Property ZIP *</label>
                  <input id="home-zip" maxLength={10} className="ar-input" value={form.zip} onChange={(e) => setForm((f) => ({ ...f, zip: e.target.value }))} />
                  {errors.zip && <span className="ar-field-error">{errors.zip}</span>}
                </div>
              </div>

              <div className="ar-form-row">
                <div>
                  <label className="ar-label" htmlFor="home-service">Scope needed *</label>
                  <select id="home-service" className="ar-input" value={form.service} onChange={(e) => setForm((f) => ({ ...f, service: e.target.value }))}>
                    {SERVICES.map((s) => <option key={s.id} value={s.title}>{s.title}</option>)}
                  </select>
                </div>
                <div>
                  <label className="ar-label" htmlFor="home-msg">Project notes</label>
                  <input id="home-msg" className="ar-input" value={form.message} onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))} />
                </div>
              </div>

              <div style={{ display: 'none' }} aria-hidden="true">
                <input tabIndex={-1} autoComplete="off" value={form.website} onChange={(e) => setForm((f) => ({ ...f, website: e.target.value }))} />
              </div>

              <button type="submit" className="btn-secondary" style={{ width: '100%' }} disabled={submitting}>
                {submitting ? 'Routing Request…' : 'Send Project Inquiry'}
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
