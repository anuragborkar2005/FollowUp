import prisma from './prisma';
import { getSessionCookie } from './session';

export interface TenantSession {
  user: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
  };
  organization: {
    id: string;
    name: string;
    slug: string;
    category: string;
    phone: string;
    city: string | null;
  };
  role: 'OWNER' | 'ADMIN' | 'STAFF';
}

/**
 * Retrieves the current authenticated tenant session.
 * 1. Inspects JWT session cookie (followup_session)
 * 2. Falls back to seeded demo organization (rahul-salon-nagpur) if no active session
 */
export async function getTenantSession(): Promise<TenantSession | null> {
  const sessionToken = await getSessionCookie();

  if (sessionToken) {
    const member = await prisma.organizationMember.findUnique({
      where: {
        organizationId_userId: {
          organizationId: sessionToken.organizationId,
          userId: sessionToken.userId,
        },
      },
      include: {
        organization: true,
        user: true,
      },
    });

    if (member) {
      return {
        user: {
          id: member.user.id,
          name: member.user.name,
          email: member.user.email,
          phone: member.user.phone,
        },
        organization: {
          id: member.organization.id,
          name: member.organization.name,
          slug: member.organization.slug,
          category: member.organization.category,
          phone: member.organization.phone,
          city: member.organization.city,
        },
        role: member.role,
      };
    }
  }

  // Fallback to Demo Salon in development
  const demoOrg = await prisma.organization.findUnique({
    where: { slug: 'rahul-salon-nagpur' },
    include: {
      members: {
        include: {
          user: true,
        },
      },
    },
  });

  if (demoOrg && demoOrg.members.length > 0) {
    const primary = demoOrg.members[0];
    return {
      user: {
        id: primary.user.id,
        name: primary.user.name,
        email: primary.user.email,
        phone: primary.user.phone,
      },
      organization: {
        id: demoOrg.id,
        name: demoOrg.name,
        slug: demoOrg.slug,
        category: demoOrg.category,
        phone: demoOrg.phone,
        city: demoOrg.city,
      },
      role: primary.role,
    };
  }

  return null;
}

/**
 * Retrieves the session strictly from the cookie without demo fallback.
 * Used for root page routing (landing vs dashboard) and auth guards.
 */
export async function getStrictTenantSession(): Promise<TenantSession | null> {
  const sessionToken = await getSessionCookie();
  if (!sessionToken) return null;

  const member = await prisma.organizationMember.findUnique({
    where: {
      organizationId_userId: {
        organizationId: sessionToken.organizationId,
        userId: sessionToken.userId,
      },
    },
    include: {
      organization: true,
      user: true,
    },
  });

  if (!member) return null;

  return {
    user: {
      id: member.user.id,
      name: member.user.name,
      email: member.user.email,
      phone: member.user.phone,
    },
    organization: {
      id: member.organization.id,
      name: member.organization.name,
      slug: member.organization.slug,
      category: member.organization.category,
      phone: member.organization.phone,
      city: member.organization.city,
    },
    role: member.role,
  };
}

