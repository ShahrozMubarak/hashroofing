import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createApp } from '../src/app.js';

const app = createApp();

describe('Auren Roofing Complete Backend Verification', () => {
  it('verifies auth registration, refresh token rotation, reuse detection & /me', async () => {
    const reg = await request(app).post('/api/v1/auth/register').send({
      name: 'Taylor Brooks',
      email: 'taylor@example.com',
      phone: '2065551199',
      password: 'StrongPassword1!',
    });
    expect(reg.status).toBe(201);
    const cookie1 = reg.headers['set-cookie']![0]!;
    const accessToken = reg.body.data.accessToken;

    const me = await request(app).get('/api/v1/auth/me').set('Authorization', `Bearer ${accessToken}`);
    expect(me.status).toBe(200);
    expect(me.body.data.email).toBe('taylor@example.com');

    const ref1 = await request(app).post('/api/v1/auth/refresh').set('Cookie', cookie1);
    expect(ref1.status).toBe(200);
    expect(ref1.headers['set-cookie']![0]).not.toBe(cookie1);

    // Reusing old cookie must trigger reuse revocation
    const reuse = await request(app).post('/api/v1/auth/refresh').set('Cookie', cookie1);
    expect(reuse.status).toBe(401);
    expect(reuse.body.error.code).toBe('AUTH_TOKEN_REUSED');
  });

  it('serves health, coverage hubs, material filters, showcase & review moderation', async () => {
    const health = await request(app).get('/api/health');
    expect(health.status).toBe(200);
    expect(health.body.database).toBe('connected');

    const seattle = await request(app).get('/api/v1/coverage/check?zip=98103');
    expect(seattle.status).toBe(200);
    expect(seattle.body.data.covered).toBe(true);
    expect(seattle.body.data.hubName).toBe('Seattle Hub');

    const outside = await request(app).get('/api/v1/coverage/check?zip=10001');
    expect(outside.status).toBe(200);
    expect(outside.body.data.covered).toBe(false);

    const metalOnly = await request(app).get('/api/v1/materials?category=Metal');
    expect(metalOnly.status).toBe(200);
    expect(metalOnly.body.data.every((m: { category: string }) => m.category === 'Metal')).toBe(true);

    const showcase = await request(app).get('/api/v1/showcase');
    expect(showcase.status).toBe(200);
    expect(showcase.body.data.length).toBeGreaterThanOrEqual(4);

    // Submit review -> unapproved until admin moderates
    const rev = await request(app).post('/api/v1/reviews').send({
      homeownerName: 'Sam Patel',
      city: 'Seattle, WA',
      service: 'Roof replacement',
      rating: 5,
      comment: 'Flawless ridge detail and spotless property cleanup.',
    });
    expect(rev.status).toBe(201);
    expect(rev.body.data.approved).toBe(false);
  });

  it('persists /api/contact into CRM leads even when email integration is pending + handles honeypot', async () => {
    const honey = await request(app).post('/api/contact').send({
      name: 'Bot',
      email: 'bot@example.com',
      phone: '2065550000',
      zip: '98101',
      service: 'Roof repair',
      website: 'https://spam.invalid',
    });
    expect(honey.status).toBe(200);
    expect(honey.body.delivered).toBe(false);

    const real = await request(app).post('/api/contact').send({
      name: 'Nora Diaz',
      email: 'nora@example.com',
      phone: '2065558811',
      zip: '98109',
      service: 'Roof replacement',
      message: 'Need architectural standing seam quote for 2,300 sq ft craftsman.',
    });
    // Honest 503 integration_pending because local Resend isn't configured, yet Lead IS stored!
    expect(real.status).toBe(503);
    expect(real.body.status).toBe('integration_pending');
    expect(real.body.leadRef).toMatch(/^AUR-LD-/);

    const ownerLogin = await request(app)
      .post('/api/v1/auth/login')
      .send({ identifier: 'admin@aurenroofing.co', password: 'AurenOwner2026!' });
    const leadsRes = await request(app)
      .get('/api/v1/admin/leads')
      .set('Authorization', `Bearer ${ownerLogin.body.data.accessToken}`);
    expect(leadsRes.status).toBe(200);
    expect(leadsRes.body.data.some((l: { leadRef: string }) => l.leadRef === real.body.leadRef)).toBe(true);
  });

  it('calculates architectural estimate line items, persists quote, generates PDF & converts to project', async () => {
    const created = await request(app).post('/api/v1/estimates').send({
      homeownerName: 'Liam Novak',
      email: 'liam@example.com',
      phone: '4255558899',
      zip: '98004',
      service: 'Roof replacement',
      materialSlug: 'standing-seam-steel',
      roofSqFt: 2600,
      pitchTier: 'STEEP',
      stories: 2,
      tearOffLayers: 1,
      skylightCount: 1,
      chimneyCount: 1,
      deckingAllowancePct: 10,
    });
    expect(created.status).toBe(201);
    const est = created.body.data;

    const pdfRes = await request(app).get(`/api/v1/estimates/${est.quoteNumber}/pdf?last4=8899`);
    expect(pdfRes.status).toBe(200);
    expect(pdfRes.headers['content-type']).toContain('application/pdf');

    const ownerLogin = await request(app)
      .post('/api/v1/auth/login')
      .send({ identifier: 'admin@aurenroofing.co', password: 'AurenOwner2026!' });
    const token = ownerLogin.body.data.accessToken;

    const convert = await request(app)
      .post(`/api/v1/admin/estimates/${est._id}/convert`)
      .set('Authorization', `Bearer ${token}`)
      .send({ propertyAddress: '1012 Bellevue Way NE, Bellevue, WA' });
    expect(convert.status).toBe(201);
    const prj = convert.body.data;
    expect(prj.projectRef).toMatch(/^AUR-PRJ-/);

    // Issue warranty on converted project & file claim
    const warranty = await request(app)
      .post('/api/v1/warranties/issue')
      .set('Authorization', `Bearer ${token}`)
      .send({ projectRef: prj.projectRef, workmanshipYears: 20, manufacturerYears: 50 });
    expect(warranty.status).toBe(201);

    const claim = await request(app)
      .post(`/api/v1/warranties/${warranty.body.data.certificateCode}/claims`)
      .send({
        issueTitle: 'Skylight perimeter flashing check',
        description: 'Minor condensation noticed near east skylight frame after heavy rain.',
        severity: 'URGENT',
      });
    expect(claim.status).toBe(201);
    expect(claim.body.data.claims.length).toBe(1);
  });

  it('prevents inspection double-booking per hub and records inspector scorecard', async () => {
    const targetDate = '2026-12-10';
    const bookPayload = {
      homeownerName: 'Hannah Park',
      email: 'hannah@example.com',
      phone: '2065553311',
      propertyAddress: '910 N 45th St, Seattle, WA',
      zip: '98103',
      service: 'Roof inspections',
      mode: 'DRONE_AERIAL',
      scheduledDate: targetDate,
      timeSlot: '08:00 AM – 09:30 AM',
      concerns: 'Checking ridge flashing before winter storms.',
    };

    const first = await request(app).post('/api/v1/inspections').send(bookPayload);
    expect(first.status).toBe(201);
    const conflict = await request(app).post('/api/v1/inspections').send(bookPayload);
    expect(conflict.status).toBe(409);

    const ownerLogin = await request(app)
      .post('/api/v1/auth/login')
      .send({ identifier: 'admin@aurenroofing.co', password: 'AurenOwner2026!' });
    const report = await request(app)
      .post(`/api/v1/inspections/${first.body.data._id}/report`)
      .set('Authorization', `Bearer ${ownerLogin.body.data.accessToken}`)
      .send({
        deckingScore: 90,
        flashingScore: 80,
        ventilationScore: 85,
        surfaceScore: 88,
        drainageScore: 90,
        summary: 'Clean assembly overall; reseal skylight perimeter curb.',
        recommendedAction: 'Minor flashing reseal before spring.',
      });
    expect(report.status).toBe(200);
    expect(report.body.data.report.overallHealthIndex).toBe(86);
  });

  it('tracks projects, approves change orders, enforces RBAC & handles storm claims', async () => {
    const approveCo = await request(app)
      .patch('/api/v1/projects/AUR-PRJ-2026-3001/change-orders/co-1')
      .send({ phoneLast4: '4410', decision: 'APPROVED' });
    expect(approveCo.status).toBe(200);
    expect(approveCo.body.data.contractTotalUsd).toBe(38140);

    const custLogin = await request(app)
      .post('/api/v1/auth/login')
      .send({ identifier: 'maya@example.com', password: 'Homeowner2026!' });
    const blocked = await request(app)
      .get('/api/v1/admin/overview')
      .set('Authorization', `Bearer ${custLogin.body.data.accessToken}`);
    expect(blocked.status).toBe(403);

    const mine = await request(app)
      .get('/api/v1/projects/mine')
      .set('Authorization', `Bearer ${custLogin.body.data.accessToken}`);
    expect(mine.status).toBe(200);
    expect(mine.body.data.length).toBeGreaterThanOrEqual(1);

    const storm = await request(app).post('/api/v1/storm-claims').send({
      homeownerName: 'Owen Hayes',
      email: 'owen@example.com',
      phone: '2065557788',
      propertyAddress: '215 Queen Anne Ave N, Seattle, WA',
      zip: '98109',
      severity: 'ACTIVE_LEAK',
      hasInteriorLeak: true,
      needsEmergencyTarp: true,
      notes: 'Water dripping near chimney breast.',
    });
    expect(storm.status).toBe(201);
    expect(storm.body.data.dispatchTargetHours).toBe(4);
  });

  it('handles malformed JSON payloads, 404 endpoints, and disallowed CORS origins cleanly', async () => {
    const badJson = await request(app)
      .post('/api/v1/estimates')
      .set('Content-Type', 'application/json')
      .send('{broken_json:');
    expect(badJson.status).toBe(400);
    expect(badJson.body.ok).toBe(false);
    expect(badJson.body.error.code).toBe('VALIDATION_FAILED');

    const missing = await request(app).get('/api/v1/nonexistent-endpoint');
    expect(missing.status).toBe(404);
    expect(missing.body.ok).toBe(false);
    expect(missing.body.error.code).toBe('NOT_FOUND');

    const badCors = await request(app).get('/api/v1/coverage').set('Origin', 'https://evil-untrusted-origin.example');
    expect(badCors.status).toBe(403);
    expect(badCors.body.ok).toBe(false);
    expect(badCors.body.error.code).toBe('AUTH_FORBIDDEN');
  });
});
