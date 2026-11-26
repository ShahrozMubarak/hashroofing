import argon2 from 'argon2';
import { ROLES } from '../config/constants.js';
import { env } from '../config/env.js';
import { AuditLogModel, CaseStudyModel, LeadModel, ReviewModel, StormClaimModel } from '../models/crm.model.js';
import { CoverageZoneModel, MaterialSystemModel } from '../models/catalog.model.js';
import { EstimateModel } from '../models/estimate.model.js';
import { InspectionModel } from '../models/inspection.model.js';
import { ProjectModel, WarrantyModel } from '../models/project.model.js';
import { UserModel } from '../models/user.model.js';

let seedPromise: Promise<void> | null = null;

export async function runSeed(): Promise<void> {
  const existingOwner = await UserModel.findOne({ email: env.SEED_OWNER_EMAIL.toLowerCase() });
  if (!existingOwner) {
    await UserModel.create({
      name: env.SEED_OWNER_NAME,
      email: env.SEED_OWNER_EMAIL.toLowerCase(),
      phone: env.SEED_OWNER_PHONE,
      username: 'owner',
      passwordHash: await argon2.hash(env.SEED_OWNER_PASSWORD, { type: argon2.argon2id }),
      role: ROLES.OWNER,
      title: 'Managing Partner',
      assignedHub: 'Seattle Hub',
    });
  }

  const staffSeeds = [
    {
      name: 'Marcus Vance',
      email: 'estimator@aurenroofing.co',
      phone: '2065550192',
      username: 'estimator',
      passwordHash: await argon2.hash('AurenEstimator2026!', { type: argon2.argon2id }),
      role: ROLES.ESTIMATOR,
      title: 'Senior Architectural Assessor',
      assignedHub: 'Bellevue / Eastside Hub',
    },
    {
      name: 'Maya Lin',
      email: 'maya@example.com',
      phone: '2065554410',
      username: 'mayalin',
      passwordHash: await argon2.hash('Homeowner2026!', { type: argon2.argon2id }),
      role: ROLES.HOMEOWNER,
      title: 'Homeowner',
      assignedHub: 'Seattle Hub',
    },
  ];
  for (const s of staffSeeds) {
    const exists = await UserModel.findOne({ email: s.email });
    if (!exists) await UserModel.create(s);
  }

  if ((await CoverageZoneModel.countDocuments()) === 0) {
    await CoverageZoneModel.insertMany([
      {
        hubName: 'Seattle Hub',
        city: 'Seattle',
        state: 'WA',
        zipPrefixes: ['981'],
        featuredZips: ['98101', '98103', '98109', '98115', '98199'],
        climateZone: 'Marine West Coast · Heavy Rain',
        windRatingMph: 120,
        snowLoadPsf: 25,
        inspectionLeadDays: 2,
        regionalMultiplier: 1.04,
        active: true,
        notes: 'High-moisture marine detailing; ice & water shield along all eaves and valleys.',
      },
      {
        hubName: 'Bellevue / Eastside Hub',
        city: 'Bellevue',
        state: 'WA',
        zipPrefixes: ['980'],
        featuredZips: ['98004', '98005', '98033', '98040'],
        climateZone: 'Foothill Moisture & Canopy',
        windRatingMph: 125,
        snowLoadPsf: 30,
        inspectionLeadDays: 2,
        regionalMultiplier: 1.08,
        active: true,
        notes: 'Zinc strips and hidden-fastener flashing standard under dense evergreens.',
      },
      {
        hubName: 'Tacoma / South Sound',
        city: 'Tacoma',
        state: 'WA',
        zipPrefixes: ['983', '984'],
        featuredZips: ['98402', '98406', '98407', '98335'],
        climateZone: 'Puget Gust Corridor',
        windRatingMph: 130,
        snowLoadPsf: 25,
        inspectionLeadDays: 3,
        regionalMultiplier: 0.98,
        active: true,
        notes: '6-nail high-wind starter pattern included on coastal bluffs.',
      },
      {
        hubName: 'Spokane / Inland NW',
        city: 'Spokane',
        state: 'WA',
        zipPrefixes: ['992'],
        featuredZips: ['99201', '99203', '99205'],
        climateZone: 'Four-Season Thermal & Snow',
        windRatingMph: 115,
        snowLoadPsf: 45,
        inspectionLeadDays: 3,
        regionalMultiplier: 0.95,
        active: true,
        notes: 'Full eave ice-dam barrier (6 ft minimum) for freeze-thaw cycles.',
      },
      {
        hubName: 'Portland Metro Hub',
        city: 'Portland',
        state: 'OR',
        zipPrefixes: ['972', '970'],
        featuredZips: ['97209', '97210', '97219', '97034'],
        climateZone: 'Willamette Valley Rain & Wind',
        windRatingMph: 120,
        snowLoadPsf: 25,
        inspectionLeadDays: 2,
        regionalMultiplier: 1.0,
        active: true,
        notes: 'Architectural gutter apron & Class-A moss-resistant assemblies.',
      },
    ]);
  }

  if ((await MaterialSystemModel.countDocuments()) === 0) {
    await MaterialSystemModel.insertMany([
      {
        slug: 'standing-seam-steel',
        name: '24-Gauge Standing Seam Metal',
        category: 'Metal',
        summary: 'Concealed-fastener architectural metal panels engineered for clean linear sightlines and 50+ year weatherproofing.',
        pricePerSqFtLow: 11.5,
        pricePerSqFtHigh: 15.25,
        warrantyYears: 50,
        fireClass: 'Class A',
        windRatingMph: 140,
        minPitchRatio: 2,
        solarReady: true,
        lifespanLabel: '50–70 yrs',
        swatches: [
          { name: 'Obsidian Matte', hex: '#1E2326' },
          { name: 'Charcoal Slate', hex: '#384047' },
          { name: 'Evergreen Ash', hex: '#244B3D' },
        ],
        sortOrder: 1,
      },
      {
        slug: 'architectural-class4-shingle',
        name: 'Class-4 Architectural Composite Shingle',
        category: 'Asphalt',
        summary: 'Heavyweight multi-layer dimensional shingles with SBS hail resistance and copper-infused algae protection.',
        pricePerSqFtLow: 6.25,
        pricePerSqFtHigh: 8.4,
        warrantyYears: 30,
        fireClass: 'Class A',
        windRatingMph: 130,
        minPitchRatio: 2,
        solarReady: true,
        lifespanLabel: '30–35 yrs',
        swatches: [
          { name: 'Charcoal', hex: '#2B3034' },
          { name: 'Weathered Slate', hex: '#545B61' },
          { name: 'Warm Cedar', hex: '#634A3C' },
        ],
        sortOrder: 2,
      },
      {
        slug: 'composite-architectural-slate',
        name: 'Composite Architectural Slate',
        category: 'Slate',
        summary: 'Recycled mineral-polymer slate tiles replicating cleft stone depth without excessive structural load.',
        pricePerSqFtLow: 13.0,
        pricePerSqFtHigh: 17.5,
        warrantyYears: 50,
        fireClass: 'Class A',
        windRatingMph: 135,
        minPitchRatio: 4,
        solarReady: true,
        lifespanLabel: '50+ yrs',
        swatches: [
          { name: 'Cleft Basalt', hex: '#2B3135' },
          { name: 'Mist Stone', hex: '#677074' },
        ],
        sortOrder: 3,
      },
      {
        slug: 'western-red-cedar',
        name: 'Certigrade Western Red Cedar Shake',
        category: 'Cedar',
        summary: 'Quarter-sawn old-growth-profile cedar tapers paired with breather matrix ventilation.',
        pricePerSqFtLow: 12.25,
        pricePerSqFtHigh: 16.0,
        warrantyYears: 35,
        fireClass: 'Class B (Treated A)',
        windRatingMph: 115,
        minPitchRatio: 4,
        solarReady: false,
        lifespanLabel: '30–40 yrs',
        swatches: [
          { name: 'Natural Cedar', hex: '#8A5D3B' },
          { name: 'Weathered Silver', hex: '#8B8982' },
        ],
        sortOrder: 4,
      },
      {
        slug: 'solar-integrated-seam',
        name: 'Solar-Ready Standing Seam + Flush Array Prep',
        category: 'Solar',
        summary: 'Pre-flashed concealed clamp mounting rails integrated into high-reflectance architectural metal.',
        pricePerSqFtLow: 14.5,
        pricePerSqFtHigh: 19.0,
        warrantyYears: 50,
        fireClass: 'Class A',
        windRatingMph: 140,
        minPitchRatio: 2,
        solarReady: true,
        lifespanLabel: '50+ yrs',
        swatches: [
          { name: 'Midnight Seam', hex: '#14191D' },
          { name: 'Pacific Pewter', hex: '#4F5961' },
        ],
        sortOrder: 5,
      },
    ]);
  }

  if ((await CaseStudyModel.countDocuments()) === 0) {
    await CaseStudyModel.insertMany([
      {
        slug: 'madison-park-standing-seam',
        title: 'Madison Park Residence — Charcoal Standing Seam',
        city: 'Seattle',
        state: 'WA',
        service: 'Roof replacement',
        materialName: '24-Gauge Standing Seam Metal',
        roofSqFt: 2850,
        durationDays: 5,
        completedYear: 2026,
        summary: 'Replaced an aging cedar shake roofline with matte charcoal standing seam, concealed box gutters, and copper chimney crickets.',
        beforeImage: '/images/house-roof-before.jpg',
        afterImage: '/images/house-roof-after.jpg',
        highlights: ['140 mph coastal uplift spec', 'Zero exposed fasteners', 'Full ice-and-water membrane'],
      },
      {
        slug: 'mercer-island-solar-seam',
        title: 'Mercer Island Pavilion — Solar-Ready Metal Envelope',
        city: 'Bellevue',
        state: 'WA',
        service: 'Roof installation',
        materialName: 'Solar-Ready Standing Seam + Flush Array Prep',
        roofSqFt: 3400,
        durationDays: 6,
        completedYear: 2026,
        summary: 'Engineered low-profile seam clamps enabling flush photovoltaic integration with zero roof penetrations.',
        beforeImage: '/images/solar-house-before.jpg',
        afterImage: '/images/solar-house-after.jpg',
        highlights: ['Non-penetrating S-5 clamp geometry', 'R-38 vented nailbase insulation', '50-year finish warranty'],
      },
      {
        slug: 'queen-anne-composite-slate',
        title: 'Queen Anne Craftsman — Composite Slate Restoration',
        city: 'Seattle',
        state: 'WA',
        service: 'Roof replacement',
        materialName: 'Composite Architectural Slate',
        roofSqFt: 2400,
        durationDays: 4,
        completedYear: 2026,
        summary: 'Rebuilt dormer valleys and restored heritage proportions using Class-4 impact-rated composite slate.',
        beforeImage: '/images/roof-detail.webp',
        afterImage: '/images/hero-home.webp',
        highlights: ['Custom-bent valley pans', 'Continuous ridge ventilation', 'Class A fire rating'],
      },
      {
        slug: 'laurelhurst-diagnostic-rebuild',
        title: 'Laurelhurst Estate — Multi-Dormer Flashing & Shingle System',
        city: 'Seattle',
        state: 'WA',
        service: 'Roof repair',
        materialName: 'Class-4 Architectural Composite Shingle',
        roofSqFt: 2150,
        durationDays: 3,
        completedYear: 2026,
        summary: 'Corrected chronic valley flashing failures found during thermal inspection and installed high-definition architectural shingles.',
        beforeImage: '/images/roof-inspection.webp',
        afterImage: '/images/about-home.webp',
        highlights: ['Thermal moisture clear', '24-hour perimeter magnet sweep', '15-year workmanship warranty'],
      },
    ]);
  }

  if ((await ReviewModel.countDocuments()) === 0) {
    await ReviewModel.insertMany([
      {
        homeownerName: 'Maya Tran',
        city: 'Seattle, WA',
        service: 'Roof replacement',
        rating: 5,
        comment: 'The team walked us through every option and the new roof looks like it has always belonged to the house.',
        approved: true,
      },
      {
        homeownerName: 'Derek Lowell',
        city: 'Bellevue, WA',
        service: 'Roof installation',
        rating: 5,
        comment: 'Fast, clean and honest. No pressure, just a clear estimate and excellent craftsmanship.',
        approved: true,
      },
      {
        homeownerName: 'Lena & Omar',
        city: 'Tacoma, WA',
        service: 'Roof repair',
        rating: 5,
        comment: 'They repaired storm damage in a day and left the property spotless. Highly recommended.',
        approved: true,
      },
    ]);
  }

  if ((await EstimateModel.countDocuments()) === 0) {
    await EstimateModel.create({
      quoteNumber: 'AUR-QT-2026-1001',
      accessSecret: 'auren-demo-1001',
      homeownerName: 'Maya Lin',
      email: 'maya@example.com',
      phone: '2065554410',
      phoneLast4: '4410',
      zip: '98103',
      hubName: 'Seattle Hub',
      service: 'Roof replacement',
      materialSlug: 'standing-seam-steel',
      materialName: '24-Gauge Standing Seam Metal',
      roofSqFt: 2400,
      pitchTier: 'STANDARD',
      stories: 2,
      tearOffLayers: 1,
      skylightCount: 2,
      chimneyCount: 1,
      deckingAllowancePct: 5,
      wasteFactorPct: 12,
      totalLowUsd: 33480,
      totalHighUsd: 42150,
      estimatedDays: 4,
      warrantyYears: 50,
      lineItems: [
        { code: 'TEAROFF', label: '1-Layer Tear-Off, Felt Removal & Hauling', category: 'Prep', lowUsd: 3360, highUsd: 4080 },
        { code: 'UNDERLAY', label: 'Ice & Water Eave Shield + Synthetic Membrane', category: 'Envelope', lowUsd: 2640, highUsd: 3120 },
        { code: 'SYSTEM', label: '24-Gauge Standing Seam Metal System (incl. 12% waste)', category: 'Primary', lowUsd: 25180, highUsd: 32050 },
        { code: 'FLASHING', label: '2 Skylight Curb Kits + 1 Chimney Cricket Fabrication', category: 'Detail', lowUsd: 1650, highUsd: 2100 },
        { code: 'PERMIT', label: 'City Permit, Ridge Ventilation & Magnet Sweep', category: 'Compliance', lowUsd: 650, highUsd: 800 },
      ],
      status: 'APPROVED',
      notes: 'Prepared for 98103 marine wind exposure.',
    });
  }

  if ((await InspectionModel.countDocuments()) === 0) {
    await InspectionModel.create({
      inspectionRef: 'AUR-INS-2026-2001',
      homeownerName: 'Maya Lin',
      email: 'maya@example.com',
      phone: '2065554410',
      phoneLast4: '4410',
      propertyAddress: '4412 Wallingford Ave N, Seattle, WA',
      zip: '98103',
      hubName: 'Seattle Hub',
      service: 'Roof replacement',
      mode: 'ON_SITE',
      scheduledDate: new Date().toISOString().slice(0, 10),
      timeSlot: '10:00 AM – 11:30 AM',
      inspectorName: 'Marcus Vance, Lead Assessor',
      status: 'COMPLETED',
      concerns: 'Minor moss buildup along north dormer flashing.',
      report: {
        deckingScore: 91,
        flashingScore: 68,
        ventilationScore: 76,
        surfaceScore: 72,
        drainageScore: 84,
        overallHealthIndex: 78,
        summary: 'OSB sheathing dry with localized chimney counter-flashing fatigue; ideal candidate for standing seam retrofit.',
        recommendedAction: 'Replace north chimney cricket and upgrade intake soffit baffling during installation.',
        completedAt: new Date(),
      },
    });
  }

  if ((await ProjectModel.countDocuments()) === 0) {
    await ProjectModel.create({
      projectRef: 'AUR-PRJ-2026-3001',
      title: 'Wallingford Residence — Standing Seam Upgrade',
      homeownerName: 'Maya Lin',
      email: 'maya@example.com',
      phone: '2065554410',
      phoneLast4: '4410',
      propertyAddress: '4412 Wallingford Ave N, Seattle, WA',
      zip: '98103',
      hubName: 'Seattle Hub',
      service: 'Roof replacement',
      materialName: '24-Gauge Standing Seam Metal',
      stage: 'INSTALLATION',
      crewLead: 'Elena Cho — Senior Crew Lead',
      permitNumber: 'SEA-ROOF-26-8841',
      contractTotalUsd: 37800,
      targetCompletionDate: new Date(Date.now() + 4 * 86400000).toISOString().slice(0, 10),
      weatherHold: false,
      estimateRef: 'AUR-QT-2026-1001',
      inspectionRef: 'AUR-INS-2026-2001',
      fieldLogs: [
        {
          id: 'log-1',
          stage: 'TEAR_OFF',
          authorName: 'Elena Cho',
          note: 'Complete 1-layer shingle strip finished. Two damp plywood panels along north eave flagged for replacement.',
          weatherNote: 'Clear · 56°F',
          createdAt: new Date(Date.now() - 2 * 86400000),
        },
        {
          id: 'log-2',
          stage: 'INSTALLATION',
          authorName: 'Elena Cho',
          note: 'High-temp synthetic underlayment & standing seam west elevation locked down cleanly.',
          weatherNote: 'Partly cloudy · Dry',
          createdAt: new Date(Date.now() - 86400000),
        },
      ],
      changeOrders: [
        {
          id: 'co-1',
          title: 'Replace 2 sheets of marine-grade CDX plywood at north valley',
          reason: 'Localized pre-existing moisture discoloration revealed during tear-off.',
          amountDeltaUsd: 340,
          status: 'PENDING',
          createdAt: new Date(Date.now() - 12 * 3600000),
          decidedAt: null,
        },
      ],
    });
  }

  if ((await WarrantyModel.countDocuments()) === 0) {
    await WarrantyModel.create({
      certificateCode: 'AUR-WRN-2026-4001',
      projectRef: 'AUR-PRJ-2026-3001',
      homeownerName: 'Maya Lin',
      propertyAddress: '4412 Wallingford Ave N, Seattle, WA',
      zip: '98103',
      materialName: '24-Gauge Standing Seam Metal',
      workmanshipYears: 15,
      manufacturerYears: 50,
      issuedAt: new Date(),
      expiresAt: new Date(Date.now() + 15 * 365 * 86400000),
      transferable: true,
      status: 'ACTIVE',
      claims: [],
    });
  }

  if ((await LeadModel.countDocuments()) === 0) {
    await LeadModel.insertMany([
      {
        leadRef: 'AUR-LD-2026-5001',
        name: 'Clara Hendrick',
        email: 'clara.hendrick@example.com',
        phone: '4255550148',
        zip: '98004',
        hubName: 'Bellevue / Eastside Hub',
        covered: true,
        service: 'Roof replacement',
        message: '1988 two-story cedar home needing low-profile standing seam quote before autumn rains.',
        stage: 'QUOTED',
        priorityScore: 92,
        assignedTo: 'Marcus Vance',
        emailDelivered: true,
        emailStatus: 'stored',
      },
      {
        leadRef: 'AUR-LD-2026-5002',
        name: 'Devon Mercer',
        email: 'devon.m@example.com',
        phone: '5035550199',
        zip: '97210',
        hubName: 'Portland Metro Hub',
        covered: true,
        service: 'Roof inspections',
        message: 'Pre-listing roof & flashing certification needed within two weeks.',
        stage: 'NEW',
        priorityScore: 78,
        assignedTo: '',
        emailDelivered: false,
        emailStatus: 'stored',
      },
    ]);
  }

  if ((await StormClaimModel.countDocuments()) === 0) {
    await StormClaimModel.create({
      claimRef: 'AUR-STM-2026-6001',
      homeownerName: 'Nolan Brooks',
      email: 'nolan.b@example.com',
      phone: '2535550173',
      phoneLast4: '0173',
      propertyAddress: '718 N Proctor St, Tacoma, WA',
      zip: '98406',
      severity: 'WIND_SHINGLE_LOSS',
      hasInteriorLeak: false,
      needsEmergencyTarp: true,
      insuranceCarrier: 'PEMCO Insurance',
      notes: 'Ridge cap lifted along southwest gable during overnight gusts.',
      dispatchTargetHours: 6,
      status: 'TARP_DISPATCHED',
    });
  }

  if ((await AuditLogModel.countDocuments()) === 0) {
    await AuditLogModel.create({
      actorId: 'system',
      actorEmail: env.SEED_OWNER_EMAIL,
      actorRole: ROLES.OWNER,
      action: 'SYSTEM_SEED_INITIALIZED',
      entityType: 'system',
      entityId: 'auren-v2',
      metadata: { hubs: 5, materials: 5, caseStudies: 4 },
    });
  }
}

export async function ensureSeeded(): Promise<void> {
  if (seedPromise) return seedPromise;
  seedPromise = runSeed().catch((err) => {
    seedPromise = null;
    throw err;
  });
  return seedPromise;
}

