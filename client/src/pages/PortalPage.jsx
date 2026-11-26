import { Check, Download, ShieldCheck, Wrench } from 'lucide-react';
import { useState } from 'react';
import { apiFetch, API_V1 } from '../api/client';
import { LavenderStagePanel } from '../components/layout/Primitives';
import { useToast } from '../components/toast/ToastViewport';

export default function PortalPage() {
  const { notify } = useToast();
  const [refCode, setRefCode] = useState('AUR-PRJ-2026-3001');
  const [last4, setLast4] = useState('4410');
  const [portalData, setPortalData] = useState(null);
  const [inspection, setInspection] = useState(null);
  const [warrantyCode, setWarrantyCode] = useState('AUR-WRN-2026-4001');
  const [warranty, setWarranty] = useState(null);
  const [claimForm, setClaimForm] = useState({ issueTitle: '', description: '', severity: 'ROUTINE' });
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  const loadProject = async (customRef = refCode, customLast4 = last4) => {
    setErr('');
    setMsg('');
    try {
      const data = await apiFetch(
        `/projects/track?ref=${encodeURIComponent(customRef.trim())}&last4=${encodeURIComponent(customLast4.trim())}`,
      );
      setPortalData(data);
      if (data.warranty) setWarranty(data.warranty);
      if (data.project?.inspectionRef) {
        const ins = await apiFetch(
          `/inspections/lookup?ref=${encodeURIComponent(data.project.inspectionRef)}&last4=${encodeURIComponent(customLast4.trim())}`,
        ).catch(() => null);
        setInspection(ins);
      }
      notify(`Loaded ${data.project.projectRef}`, 'page');
    } catch (error) {
      setErr(error.message);
      notify(error.message, 'error');
    }
  };

  const handleCoDecision = async (changeOrderId, decision) => {
    if (!portalData?.project) return;
    setErr('');
    try {
      const updated = await apiFetch(
        `/projects/${portalData.project.projectRef}/change-orders/${changeOrderId}`,
        { method: 'PATCH', body: JSON.stringify({ phoneLast4: last4, decision }) },
      );
      setPortalData((p) => ({ ...p, project: updated }));
      setMsg(`Change order marked ${decision}.`);
      notify(`Change order ${decision.toLowerCase()}`, 'Contract updated.', 'success');
    } catch (error) {
      setErr(error.message);
    }
  };

  const verifyWarranty = async (e) => {
    e.preventDefault();
    setErr('');
    try {
      const res = await apiFetch(`/warranties/verify?code=${encodeURIComponent(warrantyCode.trim())}`);
      setWarranty(res);
      notify(`Certificate ${res.certificateCode} verified`, 'success');
    } catch (error) {
      setErr(error.message);
    }
  };

  const submitWarrantyClaim = async (e) => {
    e.preventDefault();
    if (!warranty) return;
    setErr('');
    try {
      const updated = await apiFetch(`/warranties/${warranty.certificateCode}/claims`, {
        method: 'POST',
        body: JSON.stringify(claimForm),
      });
      setWarranty(updated);
      setClaimForm({ issueTitle: '', description: '', severity: 'ROUTINE' });
      setMsg('Warranty service request submitted to dispatch.');
      notify('Service ticket filed', 'Dispatch will confirm visit.', 'success');
    } catch (error) {
      setErr(error.message);
    }
  };

  return (
    <div style={{ paddingBottom: '4.5rem' }}>
      {/* Side-by-Side 4:8 Portal Header + Lookup Drawer */}
      <section className="ar-section">
        <div className="ar-container ar-bento-12" style={{ alignItems: 'start' }}>
          {/* Left 4-col Compact Lookup Drawer */}
          <div className="ar-col-4" style={{ display: 'grid', gap: '1.15rem' }}>
            <h1>
              Client <span className="ar-kw-volt">vault.</span>
            </h1>
            <p style={{ color: 'var(--text-muted)' }}>
              Access live construction telemetry, approve structural change orders, and verify warranties.
            </p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                void loadProject();
              }}
              className="ar-form-box"
            >
              <div>
                <label className="ar-label" htmlFor="portal-ref">Project Reference *</label>
                <input id="portal-ref" className="ar-input" value={refCode} onChange={(e) => setRefCode(e.target.value)} />
              </div>
              <div>
                <label className="ar-label" htmlFor="portal-last4">Phone Last 4 *</label>
                <input id="portal-last4" maxLength={4} className="ar-input" value={last4} onChange={(e) => setLast4(e.target.value)} />
              </div>
              {err && <span className="ar-field-error">{err}</span>}
              <button type="submit" className="btn-primary" style={{ width: '100%' }}>
                Open Project Portal
              </button>
              <button
                type="button"
                className="btn-secondary"
                style={{ width: '100%' }}
                onClick={() => {
                  setRefCode('AUR-PRJ-2026-3001');
                  setLast4('4410');
                  void loadProject('AUR-PRJ-2026-3001', '4410');
                }}
              >
                Load Sample Active Project
              </button>
            </form>
          </div>

          {/* Right 8-col Active Project Stage Board */}
          <div className="ar-col-8" style={{ display: 'grid', gap: '1.5rem' }}>
            {msg && (
              <div style={{ padding: '0.9rem 1.2rem', borderRadius: '14px', background: 'var(--volt)', color: '#0B1021', fontWeight: 800 }}>
                <Check size={16} style={{ display: 'inline', marginRight: 6 }} /> {msg}
              </div>
            )}

            {portalData?.project ? (
              <div
                style={{
                  borderRadius: 'var(--radius-card)',
                  background: 'var(--surface-nocturne-glass)',
                  border: '1px solid var(--border-navy)',
                  boxShadow: 'var(--shadow-navy)',
                  padding: 'clamp(1.65rem, 3vw, 2.35rem)',
                  display: 'grid',
                  gap: '1.35rem',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                  <div>
                    <span style={{ color: 'var(--volt)', fontWeight: 800 }}>
                      {portalData.project.projectRef} · {portalData.project.hubName}
                    </span>
                    <h2 style={{ fontSize: 'clamp(1.5rem, 2.8vw, 2rem)', marginTop: 4 }}>{portalData.project.title}</h2>
                    <p style={{ color: 'var(--text-muted)', marginTop: 4 }}>
                      {portalData.project.propertyAddress} · Permit #{portalData.project.permitNumber} · {portalData.project.crewLead}
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--volt)' }}>
                      ${portalData.project.contractTotalUsd.toLocaleString()}
                    </div>
                    <span style={{ color: 'var(--lavender-soft)' }}>Finish Target: {portalData.project.targetCompletionDate}</span>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '0.55rem' }}>
                  {portalData.stages.map((st, idx) => {
                    const activeIdx = portalData.stages.indexOf(portalData.project.stage);
                    const reached = idx <= activeIdx;
                    return (
                      <div
                        key={st}
                        style={{
                          padding: '0.6rem 0.7rem',
                          borderRadius: '12px',
                          border: reached ? '1px solid var(--volt)' : '1px solid var(--border-navy)',
                          background: reached ? 'rgba(217, 255, 0, 0.14)' : 'rgba(11,16,33,0.5)',
                          color: reached ? '#FFFFFF' : 'var(--text-muted)',
                          fontSize: '0.84rem',
                          fontWeight: reached ? 700 : 500,
                        }}
                      >
                        {idx + 1}. {st.replace(/_/g, ' ')}
                      </div>
                    );
                  })}
                </div>

                {portalData.project.changeOrders?.length > 0 && (
                  <div style={{ display: 'grid', gap: '0.75rem', borderTop: '1px solid var(--border-navy)', paddingTop: '1rem' }}>
                    <strong style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: 'var(--lavender-base)' }}>
                      <Wrench size={16} /> Structural Change Orders
                    </strong>
                    {portalData.project.changeOrders.map((co) => (
                      <div key={co.id} style={{ padding: '1rem', borderRadius: '14px', background: 'rgba(11,16,33,0.65)', border: '1px solid var(--border-navy)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
                        <div>
                          <strong>{co.title} (+${co.amountDeltaUsd.toLocaleString()})</strong>
                          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: 2 }}>{co.reason}</p>
                        </div>
                        {co.status === 'PENDING' ? (
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button type="button" className="btn-primary" onClick={() => void handleCoDecision(co.id, 'APPROVED')}>
                              Approve
                            </button>
                            <button type="button" className="btn-lavender" onClick={() => void handleCoDecision(co.id, 'DECLINED')}>
                              Decline
                            </button>
                          </div>
                        ) : (
                          <strong style={{ color: 'var(--volt)' }}>{co.status}</strong>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                <div style={{ display: 'grid', gap: '0.6rem' }}>
                  <strong style={{ color: 'var(--lavender-base)' }}>Daily Field Logs</strong>
                  {portalData.project.fieldLogs?.map((log) => (
                    <div key={log.id} style={{ padding: '0.85rem 1rem', borderRadius: '12px', background: 'rgba(11,16,33,0.55)', border: '1px solid var(--border-navy)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 700, color: 'var(--lavender-base)' }}>
                        <span>{log.stage} · {log.authorName}</span>
                        <span>{log.weatherNote} · {new Date(log.createdAt).toLocaleDateString()}</span>
                      </div>
                      <p style={{ marginTop: 4 }}>{log.note}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div
                style={{
                  borderRadius: 'var(--radius-card)',
                  background: 'var(--surface-nocturne-glass)',
                  border: '1px solid var(--border-navy)',
                  padding: 'clamp(2rem, 4vw, 3.25rem)',
                  display: 'grid',
                  gap: '1rem',
                }}
              >
                <span style={{ color: 'var(--lavender-base)', fontWeight: 700 }}>Auren Job Telemetry Ready</span>
                <h2>Enter a project reference or click &ldquo;Load Sample Active Project&rdquo; to inspect live progress.</h2>
                <p style={{ color: 'var(--text-muted)', maxWidth: '52ch' }}>
                  Demo job AUR-PRJ-2026-3001 includes live field logs, an active standing seam installation stage, one pending change order (+$340), and certificate AUR-WRN-2026-4001.
                </p>
              </div>
            )}

            {inspection?.report && (
              <div style={{ borderRadius: 'var(--radius-card)', background: 'var(--surface-lavender-haze)', color: '#0B1021', padding: '1.65rem', display: 'grid', gap: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center' }}>
                  <strong style={{ fontSize: '1.1rem' }}>Roof Health Scorecard ({inspection.inspectionRef})</strong>
                  <strong style={{ background: '#0B1021', color: 'var(--volt)', padding: '0.3rem 0.75rem', borderRadius: '999px' }}>
                    {inspection.report.overallHealthIndex} / 100 Health Index
                  </strong>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '0.7rem' }}>
                  {[
                    ['Decking', inspection.report.deckingScore],
                    ['Flashing', inspection.report.flashingScore],
                    ['Surface', inspection.report.surfaceScore],
                    ['Ventilation', inspection.report.ventilationScore],
                    ['Drainage', inspection.report.drainageScore],
                  ].map(([k, v]) => (
                    <div key={k} style={{ padding: '0.75rem', borderRadius: '12px', background: '#FFFFFF' }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{k}</div>
                      <strong style={{ fontSize: '1.2rem' }}>{v}%</strong>
                    </div>
                  ))}
                </div>
                <p>{inspection.report.summary}</p>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="ar-section" style={{ paddingTop: 0 }}>
        <div className="ar-container">
          <LavenderStagePanel
            maxWidth={960}
            icon={<ShieldCheck size={20} />}
            title="Warranty Verification & Service Tickets"
            subtitle="Verify certificate authenticity, download PDF documentation, or file a service request."
          >
            <div className="ar-form-box">
              <form onSubmit={verifyWarranty} style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <input aria-label="Warranty Certificate Code" className="ar-input" style={{ flex: '1 1 240px' }} value={warrantyCode} onChange={(e) => setWarrantyCode(e.target.value)} />
                <button type="submit" className="btn-secondary">Verify Certificate</button>
              </form>

              {warranty && (
                <div style={{ display: 'grid', gap: '1rem', borderTop: '1px solid rgba(11,16,33,0.14)', paddingTop: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.8rem', alignItems: 'center' }}>
                    <div>
                      <strong>{warranty.certificateCode} · {warranty.status}</strong>
                      <p style={{ fontSize: '0.9375rem', marginTop: 2 }}>
                        {warranty.homeownerName} — {warranty.propertyAddress} · {warranty.workmanshipYears}-yr Workmanship / {warranty.manufacturerYears}-yr System
                      </p>
                    </div>
                    <a href={`${API_V1}/warranties/${warranty.certificateCode}/pdf`} target="_blank" rel="noreferrer" className="btn-secondary">
                      <Download size={15} /> Download Warranty PDF
                    </a>
                  </div>

                  <form onSubmit={submitWarrantyClaim} style={{ display: 'grid', gap: '0.75rem' }}>
                    <div className="ar-form-row">
                      <div>
                        <label className="ar-label" htmlFor="clm-title">Service Request Subject *</label>
                        <input id="clm-title" className="ar-input" required value={claimForm.issueTitle} onChange={(e) => setClaimForm((c) => ({ ...c, issueTitle: e.target.value }))} />
                      </div>
                      <div>
                        <label className="ar-label" htmlFor="clm-sev">Urgency</label>
                        <select id="clm-sev" className="ar-input" value={claimForm.severity} onChange={(e) => setClaimForm((c) => ({ ...c, severity: e.target.value }))}>
                          <option value="ROUTINE">Routine Service</option>
                          <option value="URGENT">Urgent Leak Check</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="ar-label" htmlFor="clm-desc">Location &amp; Details *</label>
                      <textarea id="clm-desc" rows={2} required className="ar-input" style={{ minHeight: 80 }} value={claimForm.description} onChange={(e) => setClaimForm((c) => ({ ...c, description: e.target.value }))} />
                    </div>
                    <button type="submit" className="btn-primary" style={{ justifySelf: 'start' }}>
                      File Warranty Service Ticket
                    </button>
                  </form>
                </div>
              )}
            </div>
          </LavenderStagePanel>
        </div>
      </section>
    </div>
  );
}
