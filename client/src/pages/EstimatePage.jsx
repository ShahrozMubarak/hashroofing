import { Check, Compass, Download, ShieldCheck, Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';
import { apiFetch, API_V1 } from '../api/client';
import { ArchitecturalBentoCard, LavenderStagePanel } from '../components/layout/Primitives';
import { useToast } from '../components/toast/ToastViewport';
import { SERVICES } from '../config/siteConfig';

export default function EstimatePage({ onNavigate }) {
  const { notify } = useToast();
  const [materials, setMaterials] = useState([]);
  const [coverage, setCoverage] = useState(null);
  const [zipInput, setZipInput] = useState('98103');
  const [spec, setSpec] = useState({
    zip: '98103',
    service: 'Roof replacement',
    materialSlug: 'standing-seam-steel',
    roofSqFt: 2400,
    pitchTier: 'STANDARD',
    stories: 2,
    tearOffLayers: 1,
    skylightCount: 1,
    chimneyCount: 1,
    deckingAllowancePct: 5,
  });
  const [calc, setCalc] = useState(null);
  const [calcLoading, setCalcLoading] = useState(false);

  const [saveForm, setSaveForm] = useState({ homeownerName: '', email: '', phone: '', notes: '' });
  const [saving, setSaving] = useState(false);
  const [savedQuote, setSavedQuote] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    apiFetch('/materials').then(setMaterials).catch(() => {});
  }, []);

  useEffect(() => {
    if (!/^\d{5}$/.test(spec.zip.trim())) return;
    apiFetch(`/coverage/check?zip=${encodeURIComponent(spec.zip.trim())}`)
      .then(setCoverage)
      .catch(() => setCoverage(null));
  }, [spec.zip]);

  useEffect(() => {
    if (!/^\d{5}$/.test(spec.zip.trim())) return;
    setCalcLoading(true);
    apiFetch('/estimates/calculate', { method: 'POST', body: JSON.stringify(spec) })
      .then((res) => {
        setCalc(res);
        setErrorMsg('');
      })
      .catch((err) => setErrorMsg(err.message))
      .finally(() => setCalcLoading(false));
  }, [spec]);

  const handleZipApply = (e) => {
    e.preventDefault();
    setSpec((s) => ({ ...s, zip: zipInput.trim().slice(0, 5) }));
  };

  const handleSaveEstimate = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSaving(true);
    try {
      const created = await apiFetch('/estimates', {
        method: 'POST',
        body: JSON.stringify({ ...spec, ...saveForm }),
      });
      setSavedQuote(created);
      notify(`Quote ${created.quoteNumber} generated`, 'Download your engineered PDF below.', 'success');
    } catch (err) {
      setErrorMsg(err.message);
      notify(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ paddingBottom: '4.5rem' }}>
      {/* Asymmetric Intro Band: 8-col Nocturne Bento + 4-col Territory Widget */}
      <section className="ar-section">
        <div className="ar-container ar-bento-12">
          <ArchitecturalBentoCard
            className="ar-col-8"
            tone="nocturne"
            variant="horizontal"
            tag="Engineering Scope Engine"
            headline={
              <>
                Live regional math. <span className="ar-kw-volt">Zero fluff.</span>
              </>
            }
            body="Adjust pitch multiplier, sheathing reserves, skylights, and wind-zone assemblies for instant itemized estimates."
            imageSrc="/images/material-palette.webp"
            imageAlt="Architectural standing seam and composite roofing swatches"
          />

          <form
            onSubmit={handleZipApply}
            className="ar-col-4"
            style={{
              borderRadius: 'var(--radius-card)',
              background: 'var(--surface-lavender-haze)',
              color: '#0B1021',
              border: '1px solid rgba(255,255,255,0.78)',
              boxShadow: 'var(--shadow-haze)',
              padding: '1.65rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: '1rem',
            }}
          >
            <div style={{ display: 'grid', gap: '0.45rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800 }}>
                <Compass size={19} />
                <span>{coverage?.covered ? `${coverage.hubName} (${coverage.zip})` : 'Territory Check'}</span>
              </div>
              <p style={{ fontSize: '0.9375rem', color: '#0B1021' }}>
                {coverage?.covered
                  ? `${coverage.climateZone} · ${coverage.windRatingMph} mph wind · ${coverage.snowLoadPsf} psf snow`
                  : coverage?.message || 'Enter any 5-digit U.S. ZIP code.'}
              </p>
            </div>
            <div style={{ display: 'flex', gap: '0.55rem' }}>
              <input aria-label="Property ZIP" className="ar-input" maxLength={5} value={zipInput} onChange={(e) => setZipInput(e.target.value)} />
              <button type="submit" className="btn-secondary" style={{ whiteSpace: 'nowrap' }}>Apply</button>
            </div>
          </form>
        </div>
      </section>

      {/* Main Split: Sticky Left Cost HUD (5 col) + Configurator Matrix (7 col) */}
      <section className="ar-section" style={{ paddingTop: 0 }}>
        <div className="ar-container ar-bento-12" style={{ alignItems: 'start' }}>
          {/* Left Sticky HUD in Lavender Haze */}
          <div
            className="ar-col-5"
            style={{
              position: 'sticky',
              top: '5.25rem',
              borderRadius: 'var(--radius-card)',
              background: 'var(--surface-lavender-haze)',
              color: '#0B1021',
              border: '1px solid rgba(255,255,255,0.8)',
              boxShadow: 'var(--shadow-haze)',
              padding: 'clamp(1.5rem, 3vw, 2.25rem)',
              display: 'grid',
              gap: '1.15rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <strong style={{ fontSize: '0.95rem' }}>Engineered Cost HUD</strong>
              <span
                style={{
                  background: '#0B1021',
                  color: 'var(--volt)',
                  padding: '0.25rem 0.65rem',
                  borderRadius: '999px',
                  fontSize: '0.82rem',
                  fontWeight: 800,
                }}
              >
                {calcLoading ? 'Updating…' : `${calc?.wasteFactorPct ?? 12}% cut waste`}
              </span>
            </div>

            {calc && (
              <>
                <div>
                  <div style={{ fontSize: 'clamp(1.9rem, 3.2vw, 2.6rem)', fontWeight: 800, letterSpacing: '-0.03em' }}>
                    ${calc.totalLowUsd.toLocaleString()} – ${calc.totalHighUsd.toLocaleString()}
                  </div>
                  <p style={{ marginTop: 4, fontWeight: 600 }}>
                    {calc.estimatedDays} crew day(s) · {calc.warrantyYears}-yr warranty · {calc.hubName}
                  </p>
                </div>

                <div style={{ display: 'grid', gap: '0.55rem', borderTop: '1px solid rgba(11,16,33,0.14)', paddingTop: '0.85rem' }}>
                  {calc.lineItems.map((item) => (
                    <div key={item.code} style={{ display: 'flex', justifyContent: 'space-between', gap: '0.75rem', fontSize: '0.92rem' }}>
                      <span>{item.label}</span>
                      <strong style={{ whiteSpace: 'nowrap' }}>
                        ${item.lowUsd.toLocaleString()}–${item.highUsd.toLocaleString()}
                      </strong>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Right 7-col Nocturne Navy Configurator */}
          <div className="ar-col-7" style={{ display: 'grid', gap: '1.75rem' }}>
            <div className="ar-form-box-dark">
              <div>
                <label className="ar-label" htmlFor="est-service">Project Scope</label>
                <select id="est-service" className="ar-input" value={spec.service} onChange={(e) => setSpec((s) => ({ ...s, service: e.target.value }))}>
                  {SERVICES.map((sv) => <option key={sv.id} value={sv.title}>{sv.title}</option>)}
                </select>
              </div>

              <div>
                <span className="ar-label">Select Roofing System</span>
                <div style={{ display: 'grid', gap: '0.6rem' }}>
                  {materials.map((m) => {
                    const active = spec.materialSlug === m.slug;
                    return (
                      <button
                        key={m.slug}
                        type="button"
                        onClick={() => setSpec((s) => ({ ...s, materialSlug: m.slug }))}
                        style={{
                          textAlign: 'left',
                          padding: '0.95rem 1.05rem',
                          borderRadius: '14px',
                          border: active ? '2px solid var(--volt)' : '1px solid rgba(203, 185, 255, 0.22)',
                          background: active ? 'rgba(203, 185, 255, 0.14)' : 'rgba(11, 16, 33, 0.55)',
                          color: '#F8FAFC',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          gap: '0.75rem',
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '0.98rem' }}>{m.name}</div>
                          <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: 2 }}>
                            {m.fireClass} · {m.windRatingMph} mph · {m.warrantyYears}-yr warranty
                          </div>
                        </div>
                        <strong style={{ color: 'var(--volt)', whiteSpace: 'nowrap' }}>
                          ${m.pricePerSqFtLow}–${m.pricePerSqFtHigh}/sf
                        </strong>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="ar-label" htmlFor="est-sqft">
                  Roof Footprint: <span style={{ color: 'var(--volt)' }}>{spec.roofSqFt.toLocaleString()} sq ft</span>
                </label>
                <input
                  id="est-sqft"
                  type="range"
                  min={600}
                  max={6500}
                  step={50}
                  value={spec.roofSqFt}
                  onChange={(e) => setSpec((s) => ({ ...s, roofSqFt: Number(e.target.value) }))}
                  style={{ width: '100%' }}
                />
              </div>

              <div className="ar-form-row">
                <div>
                  <label className="ar-label" htmlFor="est-pitch">Roof Pitch</label>
                  <select id="est-pitch" className="ar-input" value={spec.pitchTier} onChange={(e) => setSpec((s) => ({ ...s, pitchTier: e.target.value }))}>
                    <option value="LOW">Low (2/12 – 4/12)</option>
                    <option value="STANDARD">Standard (5/12 – 7/12)</option>
                    <option value="STEEP">Steep (8/12 – 12/12)</option>
                  </select>
                </div>
                <div>
                  <label className="ar-label" htmlFor="est-stories">Stories</label>
                  <select id="est-stories" className="ar-input" value={spec.stories} onChange={(e) => setSpec((s) => ({ ...s, stories: Number(e.target.value) }))}>
                    <option value={1}>1 Story</option>
                    <option value={2}>2 Stories</option>
                    <option value={3}>3+ Stories</option>
                  </select>
                </div>
                <div>
                  <label className="ar-label" htmlFor="est-layers">Tear-Off Layers</label>
                  <select id="est-layers" className="ar-input" value={spec.tearOffLayers} onChange={(e) => setSpec((s) => ({ ...s, tearOffLayers: Number(e.target.value) }))}>
                    <option value={0}>0 Layers</option>
                    <option value={1}>1 Layer</option>
                    <option value={2}>2 Layers</option>
                  </select>
                </div>
                <div>
                  <label className="ar-label" htmlFor="est-deck">Decking Reserve</label>
                  <select id="est-deck" className="ar-input" value={spec.deckingAllowancePct} onChange={(e) => setSpec((s) => ({ ...s, deckingAllowancePct: Number(e.target.value) }))}>
                    <option value={0}>0% (Sound)</option>
                    <option value={5}>5% Standard</option>
                    <option value={10}>10% Moderate</option>
                    <option value={20}>20% Heavy Rebuild</option>
                  </select>
                </div>
                <div>
                  <label className="ar-label" htmlFor="est-sky">Skylights</label>
                  <input id="est-sky" type="number" min={0} max={12} className="ar-input" value={spec.skylightCount} onChange={(e) => setSpec((s) => ({ ...s, skylightCount: Number(e.target.value) }))} />
                </div>
                <div>
                  <label className="ar-label" htmlFor="est-chim">Chimneys</label>
                  <input id="est-chim" type="number" min={0} max={6} className="ar-input" value={spec.chimneyCount} onChange={(e) => setSpec((s) => ({ ...s, chimneyCount: Number(e.target.value) }))} />
                </div>
              </div>
            </div>

            <LavenderStagePanel
              icon={<ShieldCheck size={20} />}
              title="Lock Spec & Export PDF Quote"
              subtitle="Persists your calculation into our database with an itemized downloadable specification."
            >
              <form onSubmit={handleSaveEstimate} className="ar-form-box">
                <div className="ar-form-row">
                  <div>
                    <label className="ar-label" htmlFor="qt-name">Full Name *</label>
                    <input id="qt-name" className="ar-input" required value={saveForm.homeownerName} onChange={(e) => setSaveForm((f) => ({ ...f, homeownerName: e.target.value }))} />
                  </div>
                  <div>
                    <label className="ar-label" htmlFor="qt-phone">Phone *</label>
                    <input id="qt-phone" className="ar-input" required value={saveForm.phone} onChange={(e) => setSaveForm((f) => ({ ...f, phone: e.target.value }))} />
                  </div>
                </div>
                <div className="ar-form-row">
                  <div>
                    <label className="ar-label" htmlFor="qt-email">Email *</label>
                    <input id="qt-email" type="email" className="ar-input" required value={saveForm.email} onChange={(e) => setSaveForm((f) => ({ ...f, email: e.target.value }))} />
                  </div>
                  <div>
                    <label className="ar-label" htmlFor="qt-notes">Site Access / Structural Notes</label>
                    <input id="qt-notes" className="ar-input" value={saveForm.notes} onChange={(e) => setSaveForm((f) => ({ ...f, notes: e.target.value }))} />
                  </div>
                </div>
                {errorMsg && <span className="ar-field-error">{errorMsg}</span>}
                <button type="submit" className="btn-primary" style={{ width: '100%' }} disabled={saving}>
                  {saving ? 'Generating Specification…' : 'Save Official Quote'}
                </button>

                {savedQuote && (
                  <div style={{ padding: '1rem', borderRadius: '14px', background: '#FFFFFF', border: '1px solid #0B1021', display: 'grid', gap: '0.75rem' }}>
                    <strong style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Check size={17} /> Quote Saved: {savedQuote.quoteNumber}
                    </strong>
                    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                      <a href={`${API_V1}/estimates/${savedQuote.quoteNumber}/pdf?last4=${savedQuote.phoneLast4}`} target="_blank" rel="noreferrer" className="btn-secondary">
                        <Download size={15} /> Download Estimate PDF
                      </a>
                      <button type="button" className="btn-primary" onClick={() => onNavigate('inspections')}>
                        <Sparkles size={15} /> Book Hub Inspection
                      </button>
                    </div>
                  </div>
                )}
              </form>
            </LavenderStagePanel>
          </div>
        </div>
      </section>
    </div>
  );
}
