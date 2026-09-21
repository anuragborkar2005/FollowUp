import { getTenantSession } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { AppShell } from '@/components/layout/AppShell';
import { TemplatesClient } from '@/components/templates/TemplatesClient';

export const dynamic = 'force-dynamic';

export default async function TemplatesPage() {
  const session = await getTenantSession();

  if (!session) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>Tenant not initialized.</p>
      </div>
    );
  }

  const templatesRaw = await prisma.messageTemplate.findMany({
    where: { organizationId: session.organization.id },
    orderBy: { isDefault: 'desc' },
  });

  const formattedTemplates = templatesRaw.map((t: any) => ({
    id: t.id,
    title: t.title,
    category: t.category,
    body: t.body,
    isDefault: t.isDefault,
  }));

  return (
    <AppShell>
      <TemplatesClient
        templates={formattedTemplates}
        businessName={session.organization.name}
      />
    </AppShell>
  );
}
