import React from 'react';
import { ArrowUpRight, Phone } from 'lucide-react';
import { SITE_CONFIG } from '../../config/siteConfig';

export default function MobileContactBar({ onNavigate }) {
  return (
    <div className="mobile-contact-bar">
      {SITE_CONFIG.phoneHref && <a className="mobile-call-action" href={SITE_CONFIG.phoneHref} aria-label={`Call ${SITE_CONFIG.phone}`}><Phone size={17} /><span>Call</span></a>}
      <button type="button" className="button button-blue mobile-estimate-action" onClick={() => onNavigate('contact')}><span>Start a project</span><ArrowUpRight size={17} /></button>
    </div>
  );
}
