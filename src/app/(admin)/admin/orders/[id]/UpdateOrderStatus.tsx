"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function UpdateOrderStatus({ orderId, currentStatus }: { orderId: string; currentStatus: string }) {
  const [status, setStatus] = useState(currentStatus);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleUpdate() {
    setLoading(true);
    await fetch(`/api/admin/orders/${orderId}`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
      headers: { "Content-Type": "application/json" },
    });
    setLoading(false);
    router.refresh();
  }

  const statusColors: Record<string, string> = {
    PENDING: "bg-yellow-100 text-yellow-700",
    PAID: "bg-green-100 text-green-700",
    FULFILLED: "bg-blue-100 text-blue-700",
    REFUNDED: "bg-purple-100 text-purple-700",
    CANCELLED: "bg-red-100 text-red-700",
  };

  return (
    <div className="flex items-center gap-3">
      <span className={`text-xs px-3 py-1.5 rounded ${statusColors[currentStatus] ?? "bg-stone-100 text-stone-600"}`}>{currentStatus}</span>
      <select value={status} onChange={(e) => setStatus(e.target.value)}
        className="border border-stone-300 text-sm px-3 py-1.5 bg-white focus:outline-none focus:border-stone-500">
        {["PENDING", "PAID", "FULFILLED", "REFUNDED", "CANCELLED"].map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>
      <button onClick={handleUpdate} disabled={loading || status === currentStatus}
        className="bg-stone-900 text-white px-4 py-1.5 text-xs uppercase tracking-widest hover:bg-stone-700 transition-colors disabled:opacity-50">
        {loading ? "Saving..." : "Update"}
      </button>
    </div>
  );
}
