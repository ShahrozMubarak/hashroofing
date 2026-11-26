import { AlertTriangle, Calendar, Check, Clock } from 'lucide-react';
import { useEffect, useState } from 'react';
import { apiFetch } from '../api/client';
import { ArchitecturalBentoCard, LavenderStagePanel } from '../components/layout/Primitives';
import { useToast } from '../components/toast/ToastViewport';
import { SERVICES } from '../config/siteConfig';

export default function InspectionsPage({ onNavigate }) {
  const { notify } = useToast();
  const [tab, setTab] = useState('inspection');
  const [zip, setZip] = useState('98103');
  const [date, setDate] = useState(() => new Date(Date.now() + 2 * 86400000).toISOString().slice(0, 10));
  const [slotInfo, setSlotInfo] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState('');

  const [form, setForm] = useState({
    homeownerName: '',
    email: '',
    phone: '',
    propertyAddress: '',
    service: 'Roof inspections',
    mode: 'ON_SITE',
    concerns: '',
  });
  const [booked, setBooked] = useState(null);
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  const [storm, setStorm] = useState({
    homeownerName: '',
    email: '',
    phone: '',
    propertyAddress: '',
    zip: '98109',
    severity: 'ACTIVE_LEAK',
    hasInteriorLeak: true,
    needsEmergencyTarp: true,
    notes: '',
  });
  const [stormCreated, setStormCreated] = useState(null);

  useEffect(() => {
    if (!/^\d{5}$/.test(zip.trim()) || !date) return;
    apiFetch(`/inspections/slots?zip=${zip.trim()}&date=${date}`)
      .then((res) => {
        setSlotInfo(res);
        const firstOpen = res.slots.find((s) => s.available);
        setSelectedSlot(firstOpen ? firstOpen.slot : '');
      })
      .catch(() => {});
  }, [zip, date]);

  const submitInspection = async (e) => {
    e.preventDefault();
    setErr('');
    setBusy(true);
    try {
      const res = await apiFetch('/inspections', {
        method: 'POST',
        body: JSON.stringify({ ...form, zip, scheduledDate: date, timeSlot: selectedSlot }),
      });
      setBooked(res);
      notify(`Inspection ${res.inspectionRef} confirmed`, `${res.hubName} · ${res.scheduledDate}`, 'success');
    } catch (error) {
      setErr(error.message);
      notify(error.message, 'error');
    } finally {
      setBusy(false);
    }
  };

  const submitStorm = async (e) => {
    e.preventDefault();
    setErr('');
    setBusy(true);
    try {
      const res = await apiFetch('/storm-claims', {
        method: 'POST',
        body: JSON.stringify(storm),
      });
      setStormCreated(res);
      notify(`Storm Dispatch ${res.claimRef} Logged`, `${res.dispatchTargetHours}-hour priority SLA`, 'success');
    } catch (error) {
      setErr(error.message);
      notify(error.message, 'error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ paddingBottom: '4.5rem' }}>
      {/* Compact 4-col Volt Urgent Dispatch Tile + 8-col Nocturne Diagnostics Hero */}
      <section className="ar-section">
        <div className="ar-container ar-bento-12">
          <ArchitecturalBentoCard
            className="ar-col-4"
            tone="volt"
            variant="compact"
            tag="24/7 Urgent Dispatch"
            headline="Active storm leak?"
            body="Ceiling drips and fallen branches escalate immediately to a 4-hour stabilization response target."
            cta={
              <button type="button" className="btn-secondary" onClick={() => setTab('storm')}>
                Switch to Storm Triage
              </button>
            }
          />

          <ArchitecturalBentoCard
            className="ar-col-8"
            tone="nocturne"
            variant="horizontal"
            tag="Thermal & Drone Diagnostics"
            headline={
              <>
                100-Point <span className="ar-kw-lavender">Roof Health Index.</span>
              </>
            }
            body="Conflict-free slot booking tied live to each regional assessor hub across Seattle, Bellevue, Tacoma, Spokane, and Portland."
            imageSrc="/images/roof-inspection.webp"
            imageAlt="Auren field assessor inspecting roof slope"
          />
        </div>
      </section>

      <section className="ar-section" style={{ paddingTop: 0 }}>
        <div className="ar-container">
          <LavenderStagePanel
            maxWidth={960}
            icon={tab === 'inspection' ? <Calendar size={20} /> : <AlertTriangle size={20} />}
            title={tab === 'inspection' ? 'Reserve Hub Assessor Slot' : 'Emergency Storm & Leak Triage'}
            subtitle={
              tab === 'inspection'
                ? 'Select a territory ZIP and date to see live unbooked inspection windows.'
                : 'Urgent moisture intrusion & tree strikes receive rapid crew dispatch.'
            }
          >
            <div className="ar-seg-control" role="tablist">
              <button
                type="button"
                role="tab"
                aria-selected={tab === 'inspection'}
                className={`ar-seg-btn ${tab === 'inspection' ? 'ar-seg-btn-active' : ''}`}
                onClick={() => { setTab('inspection'); setErr(''); }}
              >
                Inspection Slot Booking
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={tab === 'storm'}
                className={`ar-seg-btn ${tab === 'storm' ? 'ar-seg-btn-active' : ''}`}
                onClick={() => { setTab('storm'); setErr(''); }}
              >
                Emergency Storm Triage
              </button>
            </div>

            {tab === 'inspection' ? (
              <form onSubmit={submitInspection} className="ar-form-box">
                <div className="ar-form-row">
                  <div>
                    <label className="ar-label" htmlFor="ins-zip">Property ZIP *</label>
                    <input id="ins-zip" className="ar-input" maxLength={5} value={zip} onChange={(e) => setZip(e.target.value)} />
                  </div>
                  <div>
                    <label className="ar-label" htmlFor="ins-date">Preferred Date *</label>
                    <input id="ins-date" type="date" className="ar-input" value={date} onChange={(e) => setDate(e.target.value)} />
                  </div>
                </div>

                <div className="ar-form-row">
                  <div>
                    <label className="ar-label" htmlFor="ins-mode">Assessment Mode</label>
                    <select id="ins-mode" className="ar-input" value={form.mode} onChange={(e) => setForm((f) => ({ ...f, mode: e.target.value }))}>
                      <option value="ON_SITE">On-Site Ladder + Attic Thermal</option>
                      <option value="DRONE_AERIAL">High-Res Drone Aerial Scan</option>
                    </select>
                  </div>
                  <div>
                    <label className="ar-label" htmlFor="ins-srv">Focus Service</label>
                    <select id="ins-srv" className="ar-input" value={form.service} onChange={(e) => setForm((f) => ({ ...f, service: e.target.value }))}>
                      {SERVICES.map((s) => <option key={s.id} value={s.title}>{s.title}</option>)}
                    </select>
                  </div>
                </div>

                {slotInfo && (
                  <div style={{ display: 'grid', gap: '0.55rem' }}>
                    <span className="ar-label">
                      <Clock size={14} style={{ display: 'inline', verticalAlign: '-2px', marginRight: 6 }} />
                      Available Windows — {slotInfo.hubName} ({slotInfo.date})
                    </span>
                    <div className="ar-form-row">
                      {slotInfo.slots.map((s) => {
                        const selected = selectedSlot === s.slot;
                        return (
                          <button
                            key={s.slot}
                            type="button"
                            disabled={!s.available}
                            onClick={() => setSelectedSlot(s.slot)}
                            style={{
                              minHeight: 44,
                              padding: '0.6rem 0.9rem',
                              borderRadius: '12px',
                              border: selected ? '2px solid #0B1021' : '1px solid rgba(11,16,33,0.18)',
                              background: !s.available ? 'rgba(11,16,33,0.08)' : selected ? '#0B1021' : '#FFFFFF',
                              color: selected ? '#D9FF00' : '#0B1021',
                              fontWeight: 700,
                              opacity: s.available ? 1 : 0.45,
                            }}
                          >
                            {s.slot} {!s.available ? '· Booked' : ''}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="ar-form-row">
                  <div>
                    <label className="ar-label" htmlFor="ins-name">Your Name *</label>
                    <input id="ins-name" className="ar-input" required value={form.homeownerName} onChange={(e) => setForm((f) => ({ ...f, homeownerName: e.target.value }))} />
                  </div>
                  <div>
                    <label className="ar-label" htmlFor="ins-email">Email *</label>
                    <input id="ins-email" type="email" className="ar-input" required value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
                  </div>
                </div>

                <div className="ar-form-row">
                  <div>
                    <label className="ar-label" htmlFor="ins-phone">Phone *</label>
                    <input id="ins-phone" className="ar-input" required value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
                  </div>
                  <div>
                    <label className="ar-label" htmlFor="ins-addr">Street Address *</label>
                    <input id="ins-addr" className="ar-input" required value={form.propertyAddress} onChange={(e) => setForm((f) => ({ ...f, propertyAddress: e.target.value }))} />
                  </div>
                </div>

                <div>
                  <label className="ar-label" htmlFor="ins-notes">Observed Concerns</label>
                  <textarea id="ins-notes" rows={3} className="ar-input" style={{ minHeight: 88 }} value={form.concerns} onChange={(e) => setForm((f) => ({ ...f, concerns: e.target.value }))} />
                </div>

                {err && <span className="ar-field-error">{err}</span>}
                <button type="submit" className="btn-primary" style={{ width: '100%' }} disabled={busy || !selectedSlot}>
                  {busy ? 'Reserving Window…' : 'Confirm Inspection Window'}
                </button>

                {booked && (
                  <div style={{ padding: '1rem', borderRadius: '14px', background: '#0B1021', color: '#F8FAFC', display: 'grid', gap: '0.6rem' }}>
                    <strong style={{ color: 'var(--volt)' }}><Check size={16} style={{ display: 'inline' }} /> Inspection Confirmed: {booked.inspectionRef}</strong>
                    <span>{booked.hubName} · {booked.scheduledDate} at {booked.timeSlot}</span>
                    <button type="button" className="btn-lavender" style={{ justifySelf: 'start' }} onClick={() => onNavigate('portal')}>
                      Open Client Portal
                    </button>
                  </div>
                )}
              </form>
            ) : (
              <form onSubmit={submitStorm} className="ar-form-box">
                <div className="ar-form-row">
                  <div>
                    <label className="ar-label" htmlFor="stm-name">Homeowner Name *</label>
                    <input id="stm-name" className="ar-input" required value={storm.homeownerName} onChange={(e) => setStorm((s) => ({ ...s, homeownerName: e.target.value }))} />
                  </div>
                  <div>
                    <label className="ar-label" htmlFor="stm-email">Email *</label>
                    <input id="stm-email" type="email" className="ar-input" required value={storm.email} onChange={(e) => setStorm((s) => ({ ...s, email: e.target.value }))} />
                  </div>
                </div>
                <div className="ar-form-row">
                  <div>
                    <label className="ar-label" htmlFor="stm-phone">Phone *</label>
                    <input id="stm-phone" className="ar-input" required value={storm.phone} onChange={(e) => setStorm((s) => ({ ...s, phone: e.target.value }))} />
                  </div>
                  <div>
                    <label className="ar-label" htmlFor="stm-zip">ZIP Code *</label>
                    <input id="stm-zip" className="ar-input" maxLength={5} required value={storm.zip} onChange={(e) => setStorm((s) => ({ ...s, zip: e.target.value }))} />
                  </div>
                </div>
                <div className="ar-form-row">
                  <div>
                    <label className="ar-label" htmlFor="stm-addr">Property Address *</label>
                    <input id="stm-addr" className="ar-input" required value={storm.propertyAddress} onChange={(e) => setStorm((s) => ({ ...s, propertyAddress: e.target.value }))} />
                  </div>
                  <div>
                    <label className="ar-label" htmlFor="stm-sev">Damage Severity</label>
                    <select id="stm-sev" className="ar-input" value={storm.severity} onChange={(e) => setStorm((s) => ({ ...s, severity: e.target.value }))}>
                      <option value="ACTIVE_LEAK">Active Interior Ceiling Leak</option>
                      <option value="WIND_SHINGLE_LOSS">Wind Shingle / Flashing Lift</option>
                      <option value="TREE_IMPACT">Branch / Tree Impact</option>
                      <option value="HAIL_BRUISING">Hail Granule Bruising</option>
                    </select>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '0.9375rem' }}>
                    <input type="checkbox" checked={storm.hasInteriorLeak} onChange={(e) => setStorm((s) => ({ ...s, hasInteriorLeak: e.target.checked }))} />
                    Active interior moisture intrusion
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '0.9375rem' }}>
                    <input type="checkbox" checked={storm.needsEmergencyTarp} onChange={(e) => setStorm((s) => ({ ...s, needsEmergencyTarp: e.target.checked }))} />
                    Needs emergency tarp stabilization
                  </label>
                </div>
                <div>
                  <label className="ar-label" htmlFor="stm-notes">Damage Notes</label>
                  <textarea id="stm-notes" rows={3} className="ar-input" style={{ minHeight: 88 }} value={storm.notes} onChange={(e) => setStorm((s) => ({ ...s, notes: e.target.value }))} />
                </div>
                {err && <span className="ar-field-error">{err}</span>}
                <button type="submit" className="btn-primary" style={{ width: '100%' }} disabled={busy}>
                  {busy ? 'Logging Urgent Triage…' : 'Submit Emergency Triage Ticket'}
                </button>
                {stormCreated && (
                  <div style={{ padding: '1rem', borderRadius: '14px', background: '#0B1021', color: '#F8FAFC' }}>
                    <strong style={{ color: 'var(--volt)' }}>Dispatch Logged: {stormCreated.claimRef}</strong>
                    <p style={{ marginTop: 4 }}>Target SLA: within {stormCreated.dispatchTargetHours} hours ({stormCreated.status}).</p>
                  </div>
                )}
              </form>
            )}
          </LavenderStagePanel>
        </div>
      </section>
    </div>
  );
}
