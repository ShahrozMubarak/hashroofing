import { BarChart3, ClipboardList, FolderKanban, Shield, Wrench } from 'lucide-react';
import { useEffect, useState } from 'react';
import { apiFetch, getAuthToken, setAuthToken } from '../api/client';
import { LavenderStagePanel } from '../components/layout/Primitives';
import { useToast } from '../components/toast/ToastViewport';

const TABS = [
  ['overview', 'Overview & Analytics', BarChart3],
  ['crm', 'Leads & Quotes', ClipboardList],
  ['projects', 'Projects & Dispatch', FolderKanban],
  ['claims', 'Storm, Hubs & Reviews', Wrench],
  ['audit', 'Audit Log', Shield],
];

const KPI_TOP_COLORS = ['#D9FF00', '#CBB9FF', '#A790F2', '#D9FF00', '#CBB9FF', '#F59E0B', '#38BDF8'];

export default function AdminPage() {
  const { notify } = useToast();
  const [user, setUser] = useState(null);
  const [login, setLogin] = useState({ identifier: '', password: '' });
  const [loginErr, setLoginErr] = useState('');
  const [tab, setTab] = useState('overview');

  const [overview, setOverview] = useState(null);
  const [leads, setLeads] = useState([]);
  const [estimates, setEstimates] = useState([]);
  const [projects, setProjects] = useState([]);
  const [inspections, setInspections] = useState([]);
  const [claims, setClaims] = useState([]);
  const [hubs, setHubs] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [audit, setAudit] = useState([]);
  const [noteMsg, setNoteMsg] = useState('');

  const refreshAll = async () => {
    const [ov, ld, est, prj, ins, clm, hb, rev, aud] = await Promise.all([
      apiFetch('/admin/overview'),
      apiFetch('/admin/leads'),
      apiFetch('/admin/estimates'),
      apiFetch('/admin/projects'),
      apiFetch('/admin/inspections'),
      apiFetch('/admin/storm-claims'),
      apiFetch('/admin/coverage'),
      apiFetch('/admin/reviews'),
      apiFetch('/admin/audit'),
    ]);
    setOverview(ov);
    setLeads(ld);
    setEstimates(est);
    setProjects(prj);
    setInspections(ins);
    setClaims(clm);
    setHubs(hb);
    setReviews(rev);
    setAudit(aud);
  };

  useEffect(() => {
    if (getAuthToken()) {
      apiFetch('/auth/me')
        .then((u) => {
          setUser(u);
          return refreshAll();
        })
        .catch(() => setAuthToken(null));
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginErr('');
    try {
      const res = await apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify(login),
      });
      setAuthToken(res.accessToken);
      setUser(res.user);
      await refreshAll();
      notify('Signed in to Operations Command', res.user.email, 'success');
    } catch (error) {
      setLoginErr(error.message);
      notify(error.message, 'error');
    }
  };

  const runAdminMutation = async (fn, onSuccessMsg) => {
    try {
      await fn();
      if (onSuccessMsg) {
        const msg = typeof onSuccessMsg === 'function' ? onSuccessMsg() : onSuccessMsg;
        setNoteMsg(msg);
        notify(msg, 'success');
      }
      await refreshAll();
    } catch (err) {
      const msg = err?.message || 'Operations request failed.';
      setNoteMsg(msg);
      notify(msg, 'error');
    }
  };

  const handleStageAdvance = async (project) => {
    const order = [
      'ASSESSMENT',
      'PROPOSAL_APPROVED',
      'PERMIT_FILED',
      'MATERIALS_ORDERED',
      'TEAR_OFF',
      'INSTALLATION',
      'FINAL_WALKTHROUGH',
      'WARRANTY_ACTIVE',
    ];
    const idx = order.indexOf(project.stage);
    const nextStage = order[Math.min(order.length - 1, idx + 1)];
    await runAdminMutation(
      () =>
        apiFetch(`/admin/projects/${project._id}/stage`, {
          method: 'PATCH',
          body: JSON.stringify({
            stage: nextStage,
            note: `Operations console advanced phase to ${nextStage}.`,
            weatherNote: 'Clear',
          }),
        }),
      `Project ${project.projectRef} → ${nextStage}`,
    );
  };

  const handleConvertEstimate = async (est) => {
    let createdRef = est.quoteNumber;
    await runAdminMutation(async () => {
      const prj = await apiFetch(`/admin/estimates/${est._id}/convert`, {
        method: 'POST',
        body: JSON.stringify({ propertyAddress: `Property ZIP ${est.zip}`, crewLead: 'Elena Cho — Senior Crew Lead' }),
      });
      createdRef = prj.projectRef;
    }, () => `Created project ${createdRef} from ${est.quoteNumber}.`);
  };

  if (!user) {
    return (
      <section className="ar-section">
        <div className="ar-container">
          <LavenderStagePanel
            maxWidth={560}
            icon={<Shield size={20} />}
            title="Auren Operations Control"
            subtitle="Sign in with a Managing Partner, Estimator, or Project Manager account."
          >
            <form onSubmit={handleLogin} className="ar-form-box">
              <div>
                <label className="ar-label" htmlFor="adm-id">Email or Username</label>
                <input id="adm-id" className="ar-input" required value={login.identifier} onChange={(e) => setLogin((l) => ({ ...l, identifier: e.target.value }))} />
              </div>
              <div>
                <label className="ar-label" htmlFor="adm-pw">Password</label>
                <input id="adm-pw" type="password" className="ar-input" required value={login.password} onChange={(e) => setLogin((l) => ({ ...l, password: e.target.value }))} />
              </div>
              {loginErr && <span className="ar-field-error">{loginErr}</span>}
              <button type="submit" className="btn-primary" style={{ width: '100%' }}>
                Sign In to Operations Console
              </button>
            </form>
          </LavenderStagePanel>
        </div>
      </section>
    );
  }

  return (
    <section className="ar-section" style={{ paddingTop: '2rem', paddingBottom: '4.5rem' }}>
      <div className="ar-container" style={{ display: 'grid', gap: '1.75rem' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
            alignItems: 'center',
            padding: '1.25rem 1.5rem',
            borderRadius: '22px',
            background: 'var(--surface-nocturne-glass)',
            border: '1px solid var(--border-navy)',
            boxShadow: 'var(--shadow-navy)',
          }}
        >
          <div>
            <strong style={{ fontSize: '1.3rem', fontWeight: 800 }}>
              Auren <span className="ar-kw-volt">Control</span>
            </strong>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              {user.name} · <strong style={{ color: 'var(--lavender-base)' }}>{user.role}</strong> · {user.assignedHub}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.55rem', flexWrap: 'wrap' }}>
            {TABS.map(([id, label, Icon]) => (
              <button
                key={id}
                type="button"
                className={tab === id ? 'btn-primary' : 'btn-lavender'}
                style={{ minHeight: 38, padding: '0.45rem 1rem', fontSize: '0.875rem' }}
                onClick={() => setTab(id)}
              >
                <Icon size={15} /> {label}
              </button>
            ))}
            <button
              type="button"
              className="btn-secondary"
              style={{ minHeight: 38, padding: '0.45rem 1rem', fontSize: '0.875rem' }}
              onClick={async () => {
                await apiFetch('/auth/logout', { method: 'POST' }).catch(() => {});
                setAuthToken(null);
                setUser(null);
              }}
            >
              Sign Out
            </button>
          </div>
        </div>

        {noteMsg && (
          <div style={{ padding: '0.85rem 1.15rem', borderRadius: '14px', background: 'var(--volt)', color: '#0B1021', fontWeight: 800 }}>
            {noteMsg}
          </div>
        )}

        {tab === 'overview' && overview && (
          <div style={{ display: 'grid', gap: '1.5rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '1rem' }}>
              {[
                ['Contract Volume', `$${overview.kpis.contractVolumeUsd.toLocaleString()}`],
                ['Quote Pipeline', `$${overview.kpis.quotePipelineUsd.toLocaleString()}`],
                ['Active Projects', overview.kpis.activeProjects],
                ['New Leads', `${overview.kpis.newLeads} / ${overview.kpis.totalLeads}`],
                ['Scheduled Inspections', overview.kpis.scheduledInspections],
                ['Open Storm Claims', overview.kpis.openEmergencyClaims],
                ['Active Warranties', overview.kpis.activeWarranties],
              ].map(([k, v], i) => (
                <div
                  key={k}
                  style={{
                    padding: '1.35rem',
                    borderRadius: '20px',
                    background: 'var(--surface-nocturne-glass)',
                    borderTop: `3px solid ${KPI_TOP_COLORS[i % KPI_TOP_COLORS.length]}`,
                    borderLeft: '1px solid var(--border-navy)',
                    borderRight: '1px solid var(--border-navy)',
                    borderBottom: '1px solid var(--border-navy)',
                    boxShadow: 'var(--shadow-navy)',
                  }}
                >
                  <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-muted)' }}>{k}</div>
                  <div style={{ fontSize: '1.85rem', fontWeight: 800, marginTop: '0.35rem', color: i % 2 === 0 ? 'var(--volt)' : 'var(--lavender-soft)' }}>{v}</div>
                </div>
              ))}
            </div>

            <div style={{ padding: '1.65rem', borderRadius: '22px', background: 'var(--surface-lavender-haze)', color: '#0B1021', display: 'grid', gap: '1rem' }}>
              <strong style={{ fontSize: '1.1rem' }}>Hub Activity &amp; Volume Distribution</strong>
              <div style={{ display: 'grid', gap: '0.8rem' }}>
                {overview.hubBreakdown.map((h) => {
                  const maxVol = Math.max(1, ...overview.hubBreakdown.map((x) => x.volumeUsd));
                  const pct = Math.max(6, Math.round((h.volumeUsd / maxVol) * 100));
                  return (
                    <div key={h.hub} style={{ display: 'grid', gridTemplateColumns: '140px 1fr 150px', gap: '0.85rem', alignItems: 'center' }}>
                      <span style={{ fontWeight: 800 }}>{h.hub}</span>
                      <div style={{ height: 12, borderRadius: 999, background: 'rgba(11,16,33,0.14)', overflow: 'hidden' }}>
                        <div style={{ width: `${pct}%`, height: '100%', background: 'linear-gradient(90deg, #0B1021 0%, #6B56B8 65%, #D9FF00 100%)' }} />
                      </div>
                      <span style={{ fontSize: '0.9rem', fontWeight: 700, textAlign: 'right' }}>
                        {h.jobs} jobs · ${h.volumeUsd.toLocaleString()}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {tab === 'crm' && (
          <div style={{ display: 'grid', gap: '1.5rem' }}>
            <div style={{ padding: '1.65rem', borderRadius: '22px', background: 'var(--surface-nocturne-glass)', border: '1px solid var(--border-navy)', display: 'grid', gap: '0.9rem', maxHeight: 460, overflowY: 'auto' }}>
              <strong style={{ fontSize: '1.1rem', color: 'var(--volt)' }}>Leads Pipeline ({leads.length})</strong>
              {leads.map((l) => (
                <div key={l._id} style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.8rem', padding: '0.95rem', borderRadius: '14px', border: '1px solid var(--border-navy)', background: 'rgba(11,16,33,0.5)' }}>
                  <div>
                    <strong>{l.name}</strong> · <span style={{ color: 'var(--volt)', fontWeight: 700 }}>{l.leadRef}</span> · Score {l.priorityScore}
                    <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{l.service} · {l.zip} ({l.hubName}) · {l.email} · {l.phone}</div>
                  </div>
                  <select
                    className="ar-input"
                    style={{ width: 'auto', minHeight: 38 }}
                    value={l.stage}
                    onChange={(e) => {
                      const stage = e.target.value;
                      void runAdminMutation(
                        () => apiFetch(`/admin/leads/${l._id}`, { method: 'PATCH', body: JSON.stringify({ stage }) }),
                        `Lead ${l.leadRef} → ${stage}`,
                      );
                    }}
                  >
                    {['NEW', 'CONTACTED', 'INSPECTION_BOOKED', 'QUOTED', 'WON', 'ARCHIVED'].map((st) => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>

            <div style={{ padding: '1.65rem', borderRadius: '22px', background: 'var(--surface-nocturne-glass)', border: '1px solid var(--border-navy)', display: 'grid', gap: '0.9rem', maxHeight: 460, overflowY: 'auto' }}>
              <strong style={{ fontSize: '1.1rem', color: 'var(--lavender-base)' }}>Generated Architectural Estimates ({estimates.length})</strong>
              {estimates.map((e) => (
                <div key={e._id} style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.8rem', padding: '0.95rem', borderRadius: '14px', border: '1px solid var(--border-navy)', background: 'rgba(11,16,33,0.5)' }}>
                  <div>
                    <strong>{e.quoteNumber}</strong> · {e.homeownerName} ({e.hubName})
                    <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                      {e.materialName} · {e.roofSqFt} sq ft · ${e.totalLowUsd.toLocaleString()}–${e.totalHighUsd.toLocaleString()} · {e.status}
                    </div>
                  </div>
                  {e.status !== 'CONVERTED' && (
                    <button type="button" className="btn-primary" onClick={() => void handleConvertEstimate(e)}>
                      Convert to Active Project
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'projects' && (
          <div style={{ display: 'grid', gap: '1.5rem' }}>
            <div style={{ padding: '1.65rem', borderRadius: '22px', background: 'var(--surface-nocturne-glass)', border: '1px solid var(--border-navy)', display: 'grid', gap: '0.9rem', maxHeight: 460, overflowY: 'auto' }}>
              <strong style={{ fontSize: '1.1rem', color: 'var(--volt)' }}>Active Roofing Projects ({projects.length})</strong>
              {projects.map((p) => (
                <div key={p._id} style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.8rem', padding: '1rem', borderRadius: '14px', border: '1px solid var(--border-navy)', background: 'rgba(11,16,33,0.5)' }}>
                  <div>
                    <strong>{p.projectRef} · {p.title}</strong>
                    <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                      Stage: <strong style={{ color: 'var(--volt)' }}>{p.stage}</strong> · ${p.contractTotalUsd.toLocaleString()} · {p.crewLead}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {p.stage !== 'WARRANTY_ACTIVE' && (
                      <button type="button" className="btn-primary" onClick={() => void handleStageAdvance(p)}>
                        Advance Next Stage
                      </button>
                    )}
                    <button
                      type="button"
                      className="btn-lavender"
                      onClick={() =>
                        void runAdminMutation(
                          () => apiFetch('/warranties/issue', { method: 'POST', body: JSON.stringify({ projectRef: p.projectRef }) }),
                          `Warranty certificate issued for ${p.projectRef}`,
                        )
                      }
                    >
                      Issue Warranty Cert
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ padding: '1.65rem', borderRadius: '22px', background: 'var(--surface-nocturne-glass)', border: '1px solid var(--border-navy)', display: 'grid', gap: '0.9rem', maxHeight: 460, overflowY: 'auto' }}>
              <strong style={{ fontSize: '1.1rem', color: 'var(--lavender-base)' }}>Scheduled Assessments ({inspections.length})</strong>
              {inspections.map((i) => (
                <div key={i._id} style={{ padding: '0.95rem', borderRadius: '14px', border: '1px solid var(--border-navy)', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.7rem', background: 'rgba(11,16,33,0.5)' }}>
                  <div>
                    <strong>{i.inspectionRef}</strong> · {i.homeownerName} · {i.scheduledDate} ({i.timeSlot})
                    <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                      {i.propertyAddress} · Status: {i.status} {i.report ? `· Health ${i.report.overallHealthIndex}/100` : ''}
                    </div>
                  </div>
                  {i.status !== 'COMPLETED' && (
                    <button
                      type="button"
                      className="btn-lavender"
                      onClick={() =>
                        void runAdminMutation(
                          () =>
                            apiFetch(`/inspections/${i._id}/report`, {
                              method: 'POST',
                              body: JSON.stringify({
                                deckingScore: 88,
                                flashingScore: 76,
                                ventilationScore: 82,
                                surfaceScore: 80,
                                drainageScore: 86,
                                summary: 'Assessed by field dispatch; decking dry with chimney flashing upgrade recommended.',
                                recommendedAction: 'Schedule full estimate review with homeowner.',
                              }),
                            }),
                          `Recorded Roof Health Scorecard for ${i.inspectionRef}.`,
                        )
                      }
                    >
                      Record Field Scorecard
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'claims' && (
          <div style={{ display: 'grid', gap: '1.5rem' }}>
            <div style={{ padding: '1.65rem', borderRadius: '22px', background: 'var(--surface-nocturne-glass)', border: '1px solid var(--border-navy)', display: 'grid', gap: '0.85rem' }}>
              <strong style={{ fontSize: '1.1rem', color: 'var(--volt)' }}>Emergency Storm Claims ({claims.length})</strong>
              {claims.map((c) => (
                <div key={c._id} style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', padding: '0.95rem', borderRadius: '14px', border: '1px solid var(--border-navy)' }}>
                  <div>
                    <strong>{c.claimRef} · {c.severity}</strong> (SLA {c.dispatchTargetHours}h)
                    <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{c.homeownerName} · {c.propertyAddress}</div>
                  </div>
                  <select
                    className="ar-input"
                    style={{ width: 'auto', minHeight: 38 }}
                    value={c.status}
                    onChange={(e) => {
                      const status = e.target.value;
                      void runAdminMutation(
                        () => apiFetch(`/admin/storm-claims/${c._id}`, { method: 'PATCH', body: JSON.stringify({ status }) }),
                        `Storm claim ${c.claimRef} → ${status}`,
                      );
                    }}
                  >
                    {['TRIAGED', 'TARP_DISPATCHED', 'ADJUSTER_MEETING', 'CONVERTED', 'CLOSED'].map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>

            <div style={{ padding: '1.65rem', borderRadius: '22px', background: 'var(--surface-nocturne-glass)', border: '1px solid var(--border-navy)', display: 'grid', gap: '0.85rem' }}>
              <strong style={{ fontSize: '1.1rem', color: 'var(--lavender-base)' }}>Territory Hubs ({hubs.length}) &amp; Review Moderation ({reviews.length})</strong>
              {hubs.map((h) => (
                <div key={h._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.85rem', borderRadius: '12px', border: '1px solid var(--border-navy)' }}>
                  <span><strong>{h.hubName}</strong> · {h.windRatingMph} mph · {h.inspectionLeadDays}d lead</span>
                  <button
                    type="button"
                    className={h.active ? 'btn-primary' : 'btn-lavender'}
                    onClick={() =>
                      void runAdminMutation(
                        () => apiFetch(`/admin/coverage/${h._id}`, { method: 'PATCH', body: JSON.stringify({ active: !h.active }) }),
                        `${h.hubName} ${!h.active ? 'activated' : 'paused'}`,
                      )
                    }
                  >
                    {h.active ? 'Active Hub' : 'Paused'}
                  </button>
                </div>
              ))}
              {reviews.map((r) => (
                <div key={r._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', padding: '0.85rem', borderRadius: '12px', border: '1px solid var(--border-navy)' }}>
                  <span><strong>{r.homeownerName}</strong> ({r.city}): {r.comment}</span>
                  <button
                    type="button"
                    className="btn-lavender"
                    onClick={() =>
                      void runAdminMutation(
                        () => apiFetch(`/admin/reviews/${r._id}`, { method: 'PATCH', body: JSON.stringify({ approved: !r.approved }) }),
                        `Review moderation updated for ${r.homeownerName}`,
                      )
                    }
                  >
                    {r.approved ? 'Approved' : 'Approve'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'audit' && (
          <div style={{ padding: '1.65rem', borderRadius: '22px', background: 'var(--surface-nocturne-glass)', border: '1px solid var(--border-navy)', display: 'grid', gap: '0.65rem', maxHeight: 540, overflowY: 'auto' }}>
            <strong style={{ fontSize: '1.1rem', color: 'var(--volt)' }}>Immutable Security Audit Log ({audit.length})</strong>
            {audit.map((a) => (
              <div key={a._id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.7rem 0.9rem', borderRadius: '10px', border: '1px solid var(--border-navy)', fontSize: '0.9rem' }}>
                <span><strong>{a.action}</strong> · {a.actorEmail} ({a.actorRole})</span>
                <span style={{ color: 'var(--text-muted)' }}>{new Date(a.createdAt).toLocaleString()}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
