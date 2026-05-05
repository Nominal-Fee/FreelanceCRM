import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Briefcase, Sparkles, Loader2, Search } from "lucide-react";
import { api } from "../api";
import { Spinner, ErrorMessage, EmptyState, StatusBadge, Card, Button, Modal } from "../components/UI";
import { useToast } from "../components/Toast";

const tabs = ["all", "active", "completed", "on_hold", "cancelled"];
const emptyForm = { client_id: "", title: "", description: "", start_date: "", end_date: "", amount: "", currency: "USD" };

export default function MissionsPage() {
  const [missions, setMissions] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tab, setTab] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();
  const toast = useToast();

  // AI parse state
  const [nlText, setNlText] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState(null);
  const [aiParsed, setAiParsed] = useState(false);

  const load = () => {
    setLoading(true);
    setError(null);
    Promise.all([api.getMissions(), api.getClients()])
      .then(([m, c]) => { setMissions(m); setClients(c); })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const filtered = tab === "all" ? missions : missions.filter((m) => m.status === tab);
  const searched = filtered.filter((m) => !search || m.title.toLowerCase().includes(search.toLowerCase()) || (m.client_name||'').toLowerCase().includes(search.toLowerCase()));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.createMission({ ...form, amount: parseFloat(form.amount) || 0, client_id: parseInt(form.client_id) });
      setShowModal(false);
      setForm(emptyForm);
      setNlText("");
      setAiParsed(false);
      setAiError(null);
      load();
      toast.success("Mission created");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleAiParse = async () => {
    if (!nlText.trim()) return;
    setAiLoading(true);
    setAiError(null);
    try {
      const parsed = await api.aiParseMission(nlText);
      // Try to auto-match client by name
      let matchedClientId = "";
      if (parsed.client_name) {
        const match = clients.find((c) => c.name.toLowerCase() === parsed.client_name.toLowerCase());
        if (match) matchedClientId = String(match.id);
      }
      setForm({
        client_id: matchedClientId,
        title: parsed.title || "",
        description: parsed.description || "",
        start_date: parsed.start_date || "",
        end_date: parsed.end_date || "",
        amount: parsed.amount ? String(parsed.amount) : "",
        currency: parsed.currency || "USD",
      });
      setAiParsed(true);
    } catch (err) {
      setAiError(err.message);
    } finally {
      setAiLoading(false);
    }
  };

  const resetModal = () => {
    setShowModal(false);
    setForm(emptyForm);
    setNlText("");
    setAiParsed(false);
    setAiError(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center flex-wrap gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
            {tabs.map((t) => (
              <button key={t} onClick={() => setTab(t)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium capitalize transition-colors ${t === tab ? "bg-white text-indigo-700 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
                {t.replace("_", " ")}
              </button>
            ))}
          </div>
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search missions..."
              className="pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none w-48" />
          </div>
        </div>
        <Button onClick={() => setShowModal(true)}><Plus size={16} /> Add Mission</Button>
      </div>

      <Card>
        {loading ? <Spinner /> : error ? <ErrorMessage message={error} onRetry={load} /> : searched.length === 0 ? (
          <EmptyState icon={Briefcase} title="No missions found" description={tab !== "all" ? "Try a different filter" : "Add your first mission"} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm whitespace-nowrap">
              <thead className="text-left text-slate-500 bg-slate-50/50">
                <tr>
                  <th className="px-5 py-3 font-medium">Title</th>
                  <th className="px-5 py-3 font-medium hidden sm:table-cell">Client</th>
                  <th className="px-5 py-3 font-medium">Amount</th>
                  <th className="px-5 py-3 font-medium hidden md:table-cell">Dates</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {searched.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50/80 transition-colors cursor-pointer" onClick={() => navigate(`/missions/${m.id}`)}>
                    <td className="px-5 py-3.5 font-medium text-slate-800">{m.title}</td>
                    <td className="px-5 py-3.5 text-slate-500 hidden sm:table-cell">{m.client_name}</td>
                    <td className="px-5 py-3.5 text-slate-700 font-medium">${m.amount?.toLocaleString()}</td>
                    <td className="px-5 py-3.5 text-slate-400 text-xs hidden md:table-cell">{m.start_date || "—"} → {m.end_date || "—"}</td>
                    <td className="px-5 py-3.5"><StatusBadge status={m.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Modal open={showModal} onClose={resetModal} title="Add Mission">
        {/* AI Natural Language Input */}
        <div className="mb-5 bg-indigo-50 border border-indigo-100 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles size={16} className="text-indigo-500" />
            <label className="text-sm font-medium text-indigo-700">Describe your mission in plain English...</label>
          </div>
          <textarea value={nlText} onChange={(e) => setNlText(e.target.value)} rows={2}
            placeholder='e.g. "Build a React website for Acme Corp, $5000, starting next Monday for 2 weeks"'
            className="w-full border border-indigo-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white" />
          <div className="flex items-center gap-2 mt-2">
            <Button variant="secondary" onClick={handleAiParse} disabled={aiLoading || !nlText.trim()}>
              {aiLoading ? <><Loader2 size={14} className="animate-spin" /> Parsing...</> : <><Sparkles size={14} /> Parse with AI</>}
            </Button>
            {aiParsed && <span className="text-xs text-green-600 font-medium">✓ Parsed — review the form below</span>}
          </div>
          {aiError && <p className="text-xs text-red-600 mt-2">{aiError}</p>}
          {aiParsed && <p className="text-xs text-indigo-400 mt-1 italic">Generated by AI — review before sending</p>}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Client *</label>
            <select required value={form.client_id} onChange={(e) => setForm({ ...form, client_id: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none">
              <option value="">Select client...</option>
              {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
            <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input type="date" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
              <input type="number" step="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
              <select value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none">
                <option>USD</option><option>EUR</option><option>GBP</option><option>CAD</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" type="button" onClick={resetModal}>Cancel</Button>
            <Button type="submit" disabled={saving}>{saving ? "Saving..." : "Add Mission"}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
