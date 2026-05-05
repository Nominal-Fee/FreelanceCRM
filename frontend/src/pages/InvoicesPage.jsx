import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Plus, FileText, Sparkles, Loader2, Search } from "lucide-react";
import { api } from "../api";
import { Spinner, ErrorMessage, EmptyState, StatusBadge, Card, Button, Modal } from "../components/UI";
import { useToast } from "../components/Toast";

const tabs = ["all", "draft", "sent", "paid", "overdue"];
const toneOptions = ["professional", "friendly", "brief"];

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState([]);
  const [missions, setMissions] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tab, setTab] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const toast = useToast();

  // AI cover message state
  const [aiTone, setAiTone] = useState("professional");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState(null);
  const [aiGenerated, setAiGenerated] = useState(false);

  const [form, setForm] = useState({
    mission_id: "", client_id: "", issue_date: "", due_date: "",
    line_items: [{ description: "", amount: "" }], tax_rate: "0", cover_message: "",
  });

  const load = () => {
    setLoading(true);
    setError(null);
    Promise.all([api.getInvoices(), api.getMissions(), api.getClients()])
      .then(([inv, mis, cli]) => { setInvoices(inv); setMissions(mis); setClients(cli); })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  // Auto-open new invoice modal if navigated from mission detail
  useEffect(() => {
    const missionId = searchParams.get("mission_id");
    const clientId = searchParams.get("client_id");
    if (missionId && clientId) {
      setForm((f) => ({ ...f, mission_id: missionId, client_id: clientId }));
      setShowModal(true);
    }
  }, [searchParams]);

  const filtered = tab === "all" ? invoices : invoices.filter((i) => i.status === tab);
  const searched = filtered.filter((i) => !search || (i.invoice_number||'').toLowerCase().includes(search.toLowerCase()) || (i.client_name||'').toLowerCase().includes(search.toLowerCase()));

  const addLineItem = () => setForm({ ...form, line_items: [...form.line_items, { description: "", amount: "" }] });
  const removeLineItem = (idx) => setForm({ ...form, line_items: form.line_items.filter((_, i) => i !== idx) });
  const updateLineItem = (idx, field, value) => {
    const items = [...form.line_items];
    items[idx] = { ...items[idx], [field]: value };
    setForm({ ...form, line_items: items });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const lineItems = form.line_items.map((li) => ({ description: li.description, amount: parseFloat(li.amount) || 0 }));
      await api.createInvoice({
        mission_id: parseInt(form.mission_id),
        client_id: parseInt(form.client_id),
        issue_date: form.issue_date || undefined,
        due_date: form.due_date || undefined,
        line_items: lineItems,
        tax_rate: parseFloat(form.tax_rate) || 0,
        cover_message: form.cover_message || undefined,
      });
      setShowModal(false);
      setForm({ mission_id: "", client_id: "", issue_date: "", due_date: "", line_items: [{ description: "", amount: "" }], tax_rate: "0", cover_message: "" });
      load();
      toast.success("Invoice created");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  // Auto-fill client when mission changes
  const onMissionChange = (missionId) => {
    const mission = missions.find((m) => m.id === parseInt(missionId));
    setForm({ ...form, mission_id: missionId, client_id: mission ? String(mission.client_id) : form.client_id });
  };

  const generateCoverMessage = async () => {
    const mission = missions.find((m) => m.id === parseInt(form.mission_id));
    const client = clients.find((c) => c.id === parseInt(form.client_id));
    if (!mission || !client) {
      setAiError("Select a mission and client first");
      return;
    }
    const subtotal = form.line_items.reduce((sum, li) => sum + (parseFloat(li.amount) || 0), 0);
    const total = subtotal * (1 + (parseFloat(form.tax_rate) || 0) / 100);
    setAiLoading(true);
    setAiError(null);
    try {
      const data = await api.aiGenerateInvoiceMessage({
        client_name: client.name,
        mission_title: mission.title,
        amount: total,
        tone: aiTone,
      });
      setForm({ ...form, cover_message: data.message });
      setAiGenerated(true);
    } catch (err) {
      setAiError(err.message);
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center flex-wrap gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
            {tabs.map((t) => (
              <button key={t} onClick={() => setTab(t)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium capitalize transition-colors ${t === tab ? "bg-white text-indigo-700 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
                {t}
              </button>
            ))}
          </div>
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search invoices..."
              className="pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none w-48" />
          </div>
        </div>
        <Button onClick={() => setShowModal(true)}><Plus size={16} /> New Invoice</Button>
      </div>

      <Card>
        {loading ? <Spinner /> : error ? <ErrorMessage message={error} onRetry={load} /> : searched.length === 0 ? (
          <EmptyState icon={FileText} title="No invoices found" description={tab !== "all" ? "Try a different filter" : "Create your first invoice"} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm whitespace-nowrap">
              <thead className="text-left text-slate-500 bg-slate-50/50">
                <tr>
                  <th className="px-5 py-3 font-medium">Number</th>
                  <th className="px-5 py-3 font-medium hidden sm:table-cell">Client</th>
                  <th className="px-5 py-3 font-medium">Total</th>
                  <th className="px-5 py-3 font-medium hidden md:table-cell">Due Date</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {searched.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50/80 transition-colors cursor-pointer" onClick={() => navigate(`/invoices/${inv.id}`)}>
                    <td className="px-5 py-3.5 font-medium text-slate-800">{inv.invoice_number}</td>
                    <td className="px-5 py-3.5 text-slate-500 hidden sm:table-cell">{inv.client_name}</td>
                    <td className="px-5 py-3.5 text-slate-700 font-medium">${inv.total?.toLocaleString()}</td>
                    <td className="px-5 py-3.5 text-slate-400 hidden md:table-cell">{inv.due_date || "—"}</td>
                    <td className="px-5 py-3.5"><StatusBadge status={inv.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Modal open={showModal} onClose={() => setShowModal(false)} title="New Invoice">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mission *</label>
              <select required value={form.mission_id} onChange={(e) => onMissionChange(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none">
                <option value="">Select mission...</option>
                {missions.map((m) => <option key={m.id} value={m.id}>{m.title} ({m.client_name})</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Client *</label>
              <select required value={form.client_id} onChange={(e) => setForm({ ...form, client_id: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none">
                <option value="">Select client...</option>
                {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Issue Date</label>
              <input type="date" value={form.issue_date} onChange={(e) => setForm({ ...form, issue_date: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
              <input type="date" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none" />
            </div>
          </div>

          {/* Line items */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Line Items</label>
            {form.line_items.map((li, idx) => (
              <div key={idx} className="flex gap-2 mb-2">
                <input placeholder="Description" value={li.description} onChange={(e) => updateLineItem(idx, "description", e.target.value)}
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none" />
                <input placeholder="Amount" type="number" step="0.01" value={li.amount} onChange={(e) => updateLineItem(idx, "amount", e.target.value)}
                  className="w-28 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none" />
                {form.line_items.length > 1 && (
                  <button type="button" onClick={() => removeLineItem(idx)} className="text-red-400 hover:text-red-600 px-2">&times;</button>
                )}
              </div>
            ))}
            <button type="button" onClick={addLineItem} className="text-sm text-indigo-600 hover:text-indigo-800">+ Add line item</button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tax Rate (%)</label>
              <input type="number" step="0.01" value={form.tax_rate} onChange={(e) => setForm({ ...form, tax_rate: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none" />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-medium text-gray-700">Cover Message</label>
              <div className="flex items-center gap-2">
                <select value={aiTone} onChange={(e) => setAiTone(e.target.value)}
                  className="border border-gray-300 rounded-lg px-2 py-1 text-xs focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none">
                  {toneOptions.map((t) => <option key={t} value={t} className="capitalize">{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                </select>
                <button type="button" onClick={generateCoverMessage} disabled={aiLoading}
                  className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 disabled:opacity-50">
                  {aiLoading ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                  {aiLoading ? "Generating..." : "Generate with AI"}
                </button>
              </div>
            </div>
            {aiError && <p className="text-xs text-red-600 mb-1">{aiError}</p>}
            <textarea value={form.cover_message} onChange={(e) => { setForm({ ...form, cover_message: e.target.value }); setAiGenerated(false); }} rows={3}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none" />
            {aiGenerated && <p className="text-xs text-indigo-400 mt-1 italic">Generated by AI — review before sending</p>}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" type="button" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button type="submit" disabled={saving}>{saving ? "Saving..." : "Create Invoice"}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
