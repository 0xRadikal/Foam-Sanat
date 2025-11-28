'use client';

import { MapPin, Mail, Phone, Shield, Award, CheckCircle } from 'lucide-react';
import { contactConfig } from '@/app/config/contact';

export type FooterProps =
  | {
      variant?: 'simple';
      companyName: string;
      rights: string;
      phone?: string;
      email?: string;
      mapUrl?: string;
    }
  | {
      variant: 'detailed';
      companyName: string;
      about: string;
      contactLabel: string;
      phoneLabel: string;
      emailLabel: string;
      address: string;
      copyright: string;
      email: string;
    };

export default function Footer(props: FooterProps) {
  if (props.variant === 'detailed') {
    const { companyName, about, contactLabel, phoneLabel, emailLabel, address, copyright, email } = props;
    const primaryPhone = contactConfig.phones[0].value;

    return (
      <footer className="bg-gray-900 text-gray-400 py-16 px-4" role="contentinfo">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-900 to-blue-700 rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-lg">FS</span>
                </div>
                <h3 className="text-white font-bold text-xl">{companyName}</h3>
              </div>
              <p className="leading-relaxed max-w-md mb-6">{about}</p>
              <div className="flex gap-4">
                {[Shield, Award, CheckCircle].map((Icon, i) => (
                  <div
                    key={i}
                    className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700 transition-colors cursor-pointer"
                    role="img"
                    aria-label={i === 0 ? 'ISO Certified' : i === 1 ? 'CE Compliant' : 'Verified'}
                  >
                    <Icon className="w-5 h-5 text-orange-500" />
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">{contactLabel}</h4>
              <address className="not-italic space-y-3">
                <a
                  href={`tel:${primaryPhone}`}
                  className="flex items-center gap-2 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 rounded"
                >
                  <Phone className="w-4 h-4" />
                  <span dir="ltr">{phoneLabel}</span>
                </a>
                <a
                  href={`mailto:${email}`}
                  className="flex items-center gap-2 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 rounded"
                >
                  <Mail className="w-4 h-4" />
                  {emailLabel}
                </a>
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 mt-1 flex-shrink-0" />
                  <span>{address}</span>
                </div>
              </address>
            </div>
          </div>
          <div className="pt-8 border-t border-gray-800 text-center text-sm">{copyright}</div>
        </div>
      </footer>
    );
  }

  const primaryPhone = props.phone ?? contactConfig.phones[0].value;
  const primaryEmail = props.email ?? contactConfig.emails[0].value;
  const mapUrl = props.mapUrl ?? contactConfig.mapUrl;

  return (
    <footer className="bg-gradient-to-br from-gray-900 to-black text-gray-400 py-16 px-4">
      <div className="container mx-auto text-center">
        <div className="flex justify-center gap-6 mb-8">
          <a
            href={`tel:${primaryPhone}`}
            className="w-14 h-14 bg-orange-500/20 hover:bg-orange-500 rounded-full flex items-center justify-center transition-all hover:scale-110"
          >
            <Phone className="w-6 h-6" />
          </a>
          <a
            href={`mailto:${primaryEmail}`}
            className="w-14 h-14 bg-orange-500/20 hover:bg-orange-500 rounded-full flex items-center justify-center transition-all hover:scale-110"
          >
            <Mail className="w-6 h-6" />
          </a>
          <a
            href={mapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-14 h-14 bg-orange-500/20 hover:bg-orange-500 rounded-full flex items-center justify-center transition-all hover:scale-110"
          >
            <MapPin className="w-6 h-6" />
          </a>
        </div>
        <p className="text-lg font-bold text-white mb-2">{props.companyName}</p>
        <p className="text-sm">© 2024 {props.rights}</p>
      </div>
    </footer>
  );
}
