import PDFDocument from 'pdfkit';
import type { IEstimate } from '../models/estimate.model.js';
import type { IProject, IWarranty } from '../models/project.model.js';

export function buildEstimatePdfBuffer(est: IEstimate): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 48, size: 'LETTER' });
    const chunks: Buffer[] = [];
    doc.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    doc.fontSize(20).fillColor('#10271F').text('AUREN ROOFING CO.');
    doc.fontSize(10).fillColor('#0779B3').text(`ARCHITECTURAL ESTIMATE SPECIFICATION · ${est.quoteNumber}`);
    doc.moveDown(1);

    doc.fontSize(11).fillColor('#17252B').text(`Prepared for: ${est.homeownerName}`);
    doc.text(`Property ZIP / Hub: ${est.zip} (${est.hubName})`);
    doc.text(`Service & System: ${est.service} — ${est.materialName}`);
    doc.text(
      `Footprint: ${est.roofSqFt.toLocaleString()} sq ft · Pitch: ${est.pitchTier} · Stories: ${est.stories} · Waste Factor: ${est.wasteFactorPct}%`,
    );
    doc.moveDown(1);

    doc.fontSize(12).fillColor('#10271F').text('Itemized Scope Breakdown');
    doc.moveDown(0.4);
    for (const item of est.lineItems) {
      doc
        .fontSize(10)
        .fillColor('#17252B')
        .text(
          `${item.label} (${item.category}): $${item.lowUsd.toLocaleString()} – $${item.highUsd.toLocaleString()}`,
        );
    }

    doc.moveDown(1);
    doc
      .fontSize(14)
      .fillColor('#0779B3')
      .text(
        `Estimated Range: $${est.totalLowUsd.toLocaleString()} – $${est.totalHighUsd.toLocaleString()}`,
      );
    doc
      .fontSize(10)
      .fillColor('#3d5248')
      .text(
        `Estimated Installation Window: ${est.estimatedDays} working day(s) · Coverage Term: ${est.warrantyYears} years`,
      );

    doc.end();
  });
}

export function buildWarrantyPdfBuffer(
  warranty: IWarranty,
  project?: IProject | null,
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 48, size: 'LETTER' });
    const chunks: Buffer[] = [];
    doc.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    doc.fontSize(20).fillColor('#10271F').text('AUREN ROOFING CO.');
    doc.fontSize(11).fillColor('#0779B3').text(`CERTIFICATE OF WORKMANSHIP & SYSTEM WARRANTY · ${warranty.certificateCode}`);
    doc.moveDown(1);

    doc.fontSize(11).fillColor('#17252B').text(`Homeowner: ${warranty.homeownerName}`);
    doc.text(`Property: ${warranty.propertyAddress} (${warranty.zip})`);
    doc.text(`Project Reference: ${warranty.projectRef}`);
    doc.text(`Installed System: ${warranty.materialName}`);
    if (project?.crewLead) doc.text(`Crew Lead: ${project.crewLead}`);
    doc.moveDown(0.8);

    doc.text(`Workmanship Coverage: ${warranty.workmanshipYears} Years`);
    doc.text(`Manufacturer System Coverage: ${warranty.manufacturerYears} Years`);
    doc.text(`Issued: ${new Date(warranty.issuedAt).toISOString().slice(0, 10)}`);
    doc.text(`Expires: ${new Date(warranty.expiresAt).toISOString().slice(0, 10)}`);
    doc.text(`Transferable to Next Owner: ${warranty.transferable ? 'Yes' : 'No'}`);
    doc.text(`Certificate Status: ${warranty.status}`);

    doc.end();
  });
}

