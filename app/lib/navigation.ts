export type NavigationItem = {
  key: string;
  label: string;
  href: string;
  variant?: 'link' | 'button';
};

export type NavigationItemOverride = Partial<Omit<NavigationItem, 'key'>>;

export type NavigationOptions = {
  hrefResolver?: (key: string, label: string) => string;
  overrides?: Record<string, NavigationItemOverride | undefined>;
};

const defaultHrefResolver = (key: string) => (key === 'home' ? '/' : `/${key}`);

export function createNavigationItems(
  labels: Record<string, string>,
  options: NavigationOptions = {}
): NavigationItem[] {
  const { hrefResolver = defaultHrefResolver, overrides = {} } = options;

  return Object.entries(labels).map(([key, label]) => {
    const baseItem: NavigationItem = {
      key,
      label,
      href: hrefResolver(key, label)
    };
    const override = overrides[key];

    return override ? { ...baseItem, ...override, key: baseItem.key } : baseItem;
  });
}
