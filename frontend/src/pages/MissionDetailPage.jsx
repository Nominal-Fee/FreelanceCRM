import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle, FileText, Trash2 } from "lucide-react";
import { api } from "../api";
import { Spinner, ErrorMessage, StatusBadge, Card, Button } from "../components/UI";
import { useToast } from "../components/Toast";

export default function MissionDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [mission, setMission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = () => {
    setLoading(true);
    setError(null);
    api.getMission(id)
      .then(setMission)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, [id]);

  const markCompleted = async () => {
    try {
      const updated = await api.updateMission(id, { status: "completed" });
      setMission({ ...mission, ...updated });
      toast.success("Mission marked as completed");
    } catch (err) { toast.error(err.message); }
  };

  const handleDelete = async () => {
    if (!confirm("Delete this mission?")) return;
    try {
      await api.deleteMission(id);
      navigate("/missions");
      toast.success("Mission deleted");
    } catch (err) { toast.error(err.message); }
  };

  const createInvoice = () => {
    navigate(`/invoices/new?mission_id=${mission.id}&client_id=${mission.client_id}`);
  };

  if (loading) return <Spinner />;
  if (error) return <ErrorMessage message={error} onRetry={load} />;

  return (
    <div className="space-y-6">
      <button onClick={() => navigate("/missions")} className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-indigo-600">
        <ArrowLeft size={16} /> Back to Missions
      </button>

      <Card className="p-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">{mission.title}</h2>
            <p className="text-gray-500">Client: {mission.client_name}</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            {mission.status === "active" && (
              <Button variant="success" onClick={markCompleted}><CheckCircle size={14} /> Mark Completed</Button>
            )}
            {mission.status === "completed" && (
              <Button onClick={createInvoice}><FileText size={14} /> Create Invoice</Button>
            )}
            <Button variant="danger" onClick={handleDelete}><Trash2 size={14} /> Delete</Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div><span className="text-gray-400">Status</span><div className="mt-1"><StatusBadge status={mission.status} /></div></div>
          <div><span className="text-gray-400">Amount</span><p className="text-gray-700 mt-0.5">${mission.amount?.toLocaleString()} {mission.currency}</p></div>
          <div><span className="text-gray-400">Dates</span><p className="text-gray-700 mt-0.5">{mission.start_date || "—"} → {mission.end_date || "—"}</p></div>
        </div>
        {mission.description && (
          <div className="mt-4 text-sm">
            <span className="text-gray-400">Description</span>
            <p className="text-gray-700 mt-0.5">{mission.description}</p>
          </div>
        )}
      </Card>

      {/* Invoices for this mission */}
      <Card>
        <div className="p-5 border-b border-gray-100">
          <h3 className="font-semibold text-gray-800">Invoices ({mission.invoices?.length || 0})</h3>
        </div>
        {mission.invoices?.length > 0 ? (
          <table className="w-full text-sm">
            <thead className="text-left text-gray-500 bg-gray-50">
              <tr>
                <th className="px-5 py-2.5 font-medium">Number</th>
                <th className="px-5 py-2.5 font-medium">Total</th>
                <th className="px-5 py-2.5 font-medium">Due Date</th>
                <th className="px-5 py-2.5 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {mission.invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => navigate(`/invoices/${inv.id}`)}>
                  <td className="px-5 py-3 text-gray-700">{inv.invoice_number}</td>
                  <td className="px-5 py-3 text-gray-700">${inv.total?.toLocaleString()}</td>
                  <td className="px-5 py-3 text-gray-400">{inv.due_date || "—"}</td>
                  <td className="px-5 py-3"><StatusBadge status={inv.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-sm text-gray-400 p-5">No invoices yet</p>
        )}
      </Card>
    </div>
  );
}
