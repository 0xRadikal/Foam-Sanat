import type { ComponentType, ReactNode } from 'react';

export type CTAAction = {
  label: string;
  href: string;
  icon?: ComponentType<{ className?: string }>;
  iconPosition?: 'left' | 'right';
  variant?: 'primary' | 'secondary';
  className?: string;
};

type CallToActionProps = {
  title: string;
  subtitle?: string;
  actions: CTAAction[];
  icon?: ReactNode;
  variant?: 'gradient-card' | 'solid-card';
  layout?: 'centered' | 'split';
  sectionClassName?: string;
  cardClassName?: string;
  overlayClassName?: string;
  contentClassName?: string;
  descriptionClassName?: string;
  titleClassName?: string;
};

const primaryButtonClass =
  'inline-flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-purple-600 text-white px-8 py-3 rounded-2xl font-bold hover:scale-105 transition-all shadow-xl text-sm md:text-base';

const secondaryButtonClass =
  'inline-flex items-center justify-center gap-2 border-2 border-orange-500 text-orange-500 px-8 py-3 rounded-2xl font-bold hover:scale-105 transition-all shadow-xl text-sm md:text-base';

export default function CallToAction({
  title,
  subtitle,
  actions,
  icon,
  variant = 'gradient-card',
  layout = 'centered',
  sectionClassName = '',
  cardClassName = '',
  overlayClassName,
  contentClassName = '',
  descriptionClassName = '',
  titleClassName = ''
}: CallToActionProps) {
  const sectionClasses = `py-16 px-4 ${sectionClassName}`.trim();
  const containerClasses = [
    'container mx-auto max-w-4xl rounded-3xl shadow-2xl relative overflow-hidden',
    cardClassName
  ]
    .filter(Boolean)
    .join(' ');

  const contentClasses = [
    'relative z-10 flex flex-col gap-6',
    layout === 'centered' ? 'items-center text-center' : 'items-start text-left',
    contentClassName
  ]
    .filter(Boolean)
    .join(' ');

  const descriptionClasses = [
    'text-lg md:text-xl text-gray-700 dark:text-gray-300',
    descriptionClassName
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <section className={sectionClasses}>
      <div className={containerClasses}>
        {variant === 'gradient-card' ? (
          <div
            className={
              overlayClassName ?? 'absolute inset-0 bg-gradient-to-br from-orange-500/10 to-purple-600/10'
            }
          />
        ) : null}
        <div className={contentClasses}>
          {icon}
          <h2 className={['text-3xl md:text-4xl font-black', titleClassName].filter(Boolean).join(' ')}>{title}</h2>
          {subtitle ? <p className={descriptionClasses}>{subtitle}</p> : null}
          {actions.length ? (
            <div
              className={`flex flex-col sm:flex-row gap-4 ${layout === 'centered' ? 'justify-center' : 'justify-start'}`}
            >
              {actions.map(({ label, href, icon: ActionIcon, iconPosition = 'left', variant: actionVariant, className }) => {
                const isSecondary = actionVariant === 'secondary';
                const buttonClasses = className ?? (isSecondary ? secondaryButtonClass : primaryButtonClass);

                return (
                  <a key={label} href={href} className={buttonClasses}>
                    {ActionIcon && iconPosition === 'left' ? <ActionIcon className="w-5 h-5" /> : null}
                    <span>{label}</span>
                    {ActionIcon && iconPosition === 'right' ? <ActionIcon className="w-5 h-5" /> : null}
                  </a>
                );
              })}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
