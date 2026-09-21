import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { setSessionCookie } from '@/lib/session';

export async function GET(request: Request) {
  try {
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

    if (!demoOrg || demoOrg.members.length === 0) {
      return NextResponse.redirect(new URL('/login?error=demo_unavailable', request.url));
    }

    const primary = demoOrg.members[0];

    await setSessionCookie({
      userId: primary.user.id,
      email: primary.user.email,
      name: primary.user.name,
      organizationId: demoOrg.id,
      orgSlug: demoOrg.slug,
      role: primary.role,
    });

    // Redirect to dashboard root
    return NextResponse.redirect(new URL('/', request.url));
  } catch (error) {
    console.error('Error logging into demo:', error);
    return NextResponse.redirect(new URL('/login', request.url));
  }
}
