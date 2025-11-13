import type { ComponentType, ReactNode } from 'react';
import { Mail, MapPin, Phone } from 'lucide-react';
import type { Locale } from '@/app/lib/i18n';
import { contactConfig, getContactAddress, getContactEmails, getContactPhones } from '@/app/config/contact';

type ContactInfoLabels = {
  phone: string;
  email: string;
  address: string;
  viewMap?: string;
};

type ContactInfoVariant = 'cards' | 'list';
type ContactInfoLayout = 'grid' | 'stack';

type ContactInfoProps = {
  locale: Locale;
  labels: ContactInfoLabels;
  variant?: ContactInfoVariant;
  layout?: ContactInfoLayout;
  className?: string;
  itemClassName?: string;
  iconClassName?: string;
  labelClassName?: string;
  valueClassName?: string;
  linkClassName?: string;
  mapLinkClassName?: string;
  align?: 'start' | 'center';
  showMapLink?: boolean;
  iconRenderer?: Partial<Record<'phone' | 'email' | 'address', ComponentType<{ className?: string }>>>;
  renderAddress?: (content: ReactNode) => ReactNode;
  mapLinkContent?: ReactNode;
  useDefaultLinkColor?: boolean;
  phoneLimit?: number;
  emailLimit?: number;
};

const defaultIconRenderer: Required<ContactInfoProps>['iconRenderer'] = {
  phone: Phone,
  email: Mail,
  address: MapPin
};

export default function ContactInfo({
  locale,
  labels,
  variant = 'cards',
  layout = 'grid',
  className = '',
  itemClassName = '',
  iconClassName,
  labelClassName,
  valueClassName,
  linkClassName,
  mapLinkClassName,
  align = 'center',
  showMapLink = true,
  iconRenderer = defaultIconRenderer,
  renderAddress,
  mapLinkContent,
  useDefaultLinkColor = true,
  phoneLimit,
  emailLimit
}: ContactInfoProps) {
  const phoneEntries = getContactPhones(locale);
  const emailEntries = getContactEmails();
  const phones = typeof phoneLimit === 'number' ? phoneEntries.slice(0, phoneLimit) : phoneEntries;
  const emails = typeof emailLimit === 'number' ? emailEntries.slice(0, emailLimit) : emailEntries;
  const address = getContactAddress(locale);

  const containerClasses = [
    variant === 'cards'
      ? layout === 'grid'
        ? 'grid gap-6 md:grid-cols-3'
        : 'space-y-6'
      : 'space-y-6'
  ];

  if (className) {
    containerClasses.push(className);
  }

  const alignmentClass = align === 'center' ? 'text-center items-center' : 'text-left items-start';

  const baseItemClass =
    variant === 'cards'
      ? `rounded-2xl shadow-xl p-6 border border-orange-500/20 ${alignmentClass}`
      : 'flex items-start gap-4';

  const baseIconClass =
    variant === 'cards'
      ? 'w-10 h-10 text-orange-500 mx-auto mb-3'
      : 'w-6 h-6 text-orange-500 flex-shrink-0 mt-1';

  const baseLabelClass = variant === 'cards' ? 'text-lg font-bold mb-2' : 'font-semibold mb-1';

  const baseValueClass =
    variant === 'cards'
      ? 'text-sm md:text-base text-gray-700 dark:text-gray-300'
      : 'leading-relaxed text-gray-600 dark:text-gray-300';

  const baseLinkClass = 'transition-colors';
  const defaultLinkColor = 'text-orange-500 hover:text-orange-600';

  const cardClassName = `${baseItemClass} ${itemClassName}`.trim();
  const iconClass = `${baseIconClass}${iconClassName ? ` ${iconClassName}` : ''}`;
  const labelClass = `${baseLabelClass}${labelClassName ? ` ${labelClassName}` : ''}`;
  const valueClass = `${baseValueClass}${valueClassName ? ` ${valueClassName}` : ''}`;
  const linkClass = [baseLinkClass, useDefaultLinkColor ? defaultLinkColor : '', linkClassName]
    .filter(Boolean)
    .join(' ')
    .trim();
  const mapClass = [
    baseLinkClass,
    useDefaultLinkColor ? defaultLinkColor : '',
    mapLinkClassName ?? linkClassName
  ]
    .filter(Boolean)
    .join(' ')
    .trim();

  const IconPhone = iconRenderer.phone ?? defaultIconRenderer.phone;
  const IconEmail = iconRenderer.email ?? defaultIconRenderer.email;
  const IconAddress = iconRenderer.address ?? defaultIconRenderer.address;

  return (
    <div className={containerClasses.join(' ')}>
      <div className={cardClassName}>
        <IconPhone className={iconClass} />
        <h3 className={labelClass}>{labels.phone}</h3>
        <div className={variant === 'cards' ? 'space-y-2' : ''}>
          {phones.map((phone) => (
            <a key={phone.value} href={`tel:${phone.value}`} className={linkClass} dir={locale === 'fa' ? 'rtl' : 'ltr'}>
              {phone.label}
            </a>
          ))}
        </div>
      </div>

      <div className={cardClassName}>
        <IconEmail className={iconClass} />
        <h3 className={labelClass}>{labels.email}</h3>
        <div className={variant === 'cards' ? 'space-y-2 break-all' : 'space-y-2'}>
          {emails.map((email) => (
            <a key={email.value} href={`mailto:${email.value}`} className={linkClass}>
              {email.value}
            </a>
          ))}
        </div>
      </div>

      <div className={cardClassName}>
        <IconAddress className={iconClass} />
        <h3 className={labelClass}>{labels.address}</h3>
        <div className={valueClass}>
          {renderAddress ? renderAddress(address) : address}
        </div>
        {showMapLink ? (
          <a
            href={contactConfig.mapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={mapClass}
          >
            {mapLinkContent ?? labels.viewMap}
          </a>
        ) : null}
      </div>
    </div>
  );
}
