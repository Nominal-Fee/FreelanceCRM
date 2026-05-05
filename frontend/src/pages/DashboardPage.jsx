import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Users, Briefcase, DollarSign, AlertTriangle } from "lucide-react";
import { api } from "../api";
import { Spinner, ErrorMessage, EmptyState, StatusBadge, Card } from "../components/UI";

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = () => {
    setLoading(true);
    setError(null);
    api.getDashboard()
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  if (loading) return <Spinner />;
  if (error) return <ErrorMessage message={error} onRetry={load} />;

  const cards = [
    { label: "Total Clients", value: data.total_clients, icon: Users, color: "text-blue-600 bg-blue-50" },
    { label: "Active Missions", value: data.active_missions, icon: Briefcase, color: "text-indigo-600 bg-indigo-50" },
    { label: "Revenue Earned", value: `$${data.total_revenue.toLocaleString()}`, icon: DollarSign, color: "text-green-600 bg-green-50" },
    { label: "Overdue Invoices", value: data.overdue_invoices, icon: AlertTriangle, color: `${data.overdue_invoices > 0 ? "text-red-600 bg-red-50" : "text-gray-500 bg-gray-50"}` },
  ];

  const recentInvoices = data.recent_activity.filter((a) => a.type === "invoice").slice(0, 5);
  const recentMissions = data.recent_activity.filter((a) => a.type === "mission").slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c) => (
          <Card key={c.label} className="p-5">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-lg ${c.color}`}>
                <c.icon size={22} />
              </div>
              <div>
                <p className="text-sm text-gray-500">{c.label}</p>
                <p className="text-2xl font-bold text-gray-800">{c.value}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent invoices */}
        <Card>
          <div className="p-5 border-b border-gray-100">
            <h3 className="font-semibold text-gray-800">Recent Invoices</h3>
          </div>
          {recentInvoices.length === 0 ? (
            <EmptyState title="No invoices yet" />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm whitespace-nowrap">
                <thead className="text-left text-slate-500 bg-slate-50/50">
                  <tr>
                    <th className="px-5 py-3 font-medium">Invoice</th>
                    <th className="px-5 py-3 font-medium">Amount</th>
                    <th className="px-5 py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentInvoices.map((inv, i) => (
                    <tr key={i} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-5 py-3.5 text-slate-700">{inv.description}</td>
                      <td className="px-5 py-3.5 text-slate-700 font-medium">${inv.amount?.toLocaleString()}</td>
                      <td className="px-5 py-3.5"><StatusBadge status={inv.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* Active missions */}
        <Card>
          <div className="p-5 border-b border-gray-100">
            <h3 className="font-semibold text-gray-800">Active Missions</h3>
          </div>
          {recentMissions.length === 0 ? (
            <EmptyState title="No missions yet" />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm whitespace-nowrap">
                <thead className="text-left text-slate-500 bg-slate-50/50">
                  <tr>
                    <th className="px-5 py-3 font-medium">Mission</th>
                    <th className="px-5 py-3 font-medium">Amount</th>
                    <th className="px-5 py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentMissions.map((m, i) => (
                    <tr key={i} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-5 py-3.5 text-slate-700">{m.description}</td>
                      <td className="px-5 py-3.5 text-slate-700 font-medium">${m.amount?.toLocaleString()}</td>
                      <td className="px-5 py-3.5"><StatusBadge status={m.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
