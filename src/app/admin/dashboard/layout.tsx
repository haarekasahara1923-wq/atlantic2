import AdminSidebar from "@/components/AdminSidebar";
import { db } from "@/db";
import { siteSettings } from "@/db/schema";
import { eq } from "drizzle-orm";

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let logoUrl = "";
  try {
    const settingRows = await db
      .select()
      .from(siteSettings)
      .where(eq(siteSettings.key, "school_logo_url"));
    if (settingRows.length > 0 && settingRows[0].value) {
      logoUrl = settingRows[0].value;
    }
  } catch {
    // ignore
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <AdminSidebar logoUrl={logoUrl} />
      <main style={{ flex: 1, padding: '30px', overflowY: 'auto' }}>
        {children}
      </main>
    </div>
  );
}
