import { prisma } from '@/app/lib/prisma';

export type SiteSettings = {
  id: string;
  commentsEnabled: boolean;
};

const GLOBAL_SETTINGS_ID = 'global';

export async function getSiteSettings(): Promise<SiteSettings> {
  const existing = await prisma.siteSetting.findUnique({ where: { id: GLOBAL_SETTINGS_ID } });
  if (existing) {
    return existing;
  }

  return prisma.siteSetting.create({
    data: { id: GLOBAL_SETTINGS_ID },
  });
}

export async function updateCommentsEnabled(enabled: boolean): Promise<SiteSettings> {
  return prisma.siteSetting.upsert({
    where: { id: GLOBAL_SETTINGS_ID },
    create: { id: GLOBAL_SETTINGS_ID, commentsEnabled: enabled },
    update: { commentsEnabled: enabled },
  });
}
