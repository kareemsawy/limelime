export const dynamic = "force-dynamic";

import { db } from "@/lib/db";
import EditSettingsForm from "./EditSettingsForm";

export default async function AdminSettingsPage() {
  const settings = await db.siteSettings.findFirst({ where: { key: "default" } });

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="font-serif text-3xl text-stone-900">Settings</h1>
        <p className="text-stone-500 text-sm mt-1">Store configuration</p>
      </div>

      <div className="bg-white border border-stone-200 p-6">
        <p className="text-xs uppercase tracking-widest text-stone-400 mb-5">Store Settings</p>
        <EditSettingsForm settings={settings} />
      </div>
    </div>
  );
}
