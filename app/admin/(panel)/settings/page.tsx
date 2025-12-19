import { getSiteSettings } from '@/app/lib/settings';
import { SettingsForm } from '@/app/admin/components/SettingsForm';

export default async function SettingsPage() {
  const settings = await getSiteSettings();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Settings</h1>
        <p className="text-sm text-slate-600">Manage storefront configuration.</p>
      </div>
      <SettingsForm commentsEnabled={settings.commentsEnabled} />
    </div>
  );
}
