import { db } from "@/lib/db";

export default async function AdminAuditPage() {
  const logs = await db.auditLog.findMany({
    include: { user: { select: { name: true, email: true } } },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl text-stone-900">Audit Log</h1>
        <p className="text-stone-500 text-sm mt-1">Last 200 actions</p>
      </div>

      <div className="bg-white border border-stone-200">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-stone-400 uppercase tracking-widest border-b border-stone-100 bg-stone-50">
              <th className="px-4 py-3">Time</th>
              <th className="px-4 py-3">User</th>
              <th className="px-4 py-3">Action</th>
              <th className="px-4 py-3">Entity</th>
              <th className="px-4 py-3">Details</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id} className="border-b border-stone-50 hover:bg-stone-50">
                <td className="px-4 py-3 text-xs text-stone-400 whitespace-nowrap">
                  {new Date(log.createdAt).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                </td>
                <td className="px-4 py-3">
                  <p className="text-stone-900">{log.user.name ?? log.user.email}</p>
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded font-medium ${
                    log.action.includes("DELETE") ? "bg-red-100 text-red-700" :
                    log.action.includes("CREATE") ? "bg-green-100 text-green-700" :
                    "bg-blue-100 text-blue-700"
                  }`}>
                    {log.action}
                  </span>
                </td>
                <td className="px-4 py-3 text-stone-600">
                  {log.entity}
                  {log.entityId && <span className="text-stone-400 font-mono text-xs ml-1">#{log.entityId.slice(-6)}</span>}
                </td>
                <td className="px-4 py-3 text-xs text-stone-400 font-mono max-w-xs truncate">
                  {log.meta ? JSON.stringify(log.meta) : "—"}
                </td>
              </tr>
            ))}
            {logs.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-12 text-center text-stone-400">No audit logs yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
