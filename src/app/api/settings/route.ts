import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const [settings, transportCompanies] = await Promise.all([
      db.setting.findMany(),
      db.transportCompany.findMany({
        where: { isActive: true },
        orderBy: { name: 'asc' },
      }),
    ]);

    // Convert settings array to object for easier access
    const settingsMap: Record<string, Record<string, string>> = {};
    for (const setting of settings) {
      if (!settingsMap[setting.group]) {
        settingsMap[setting.group] = {};
      }
      settingsMap[setting.group][setting.key] = setting.value;
    }

    return NextResponse.json({
      settings: settingsMap,
      transportCompanies: transportCompanies.map((company) => ({
        id: company.id,
        name: company.name,
        nameBn: company.nameBn,
        type: company.type,
        logo: company.logo,
      })),
    });
  } catch (error) {
    console.error('Get settings error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
