import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Users, Search } from "lucide-react";
import { api } from "../api";
import { Spinner, ErrorMessage, EmptyState, Card, Button, Modal } from "../components/UI";
import { useToast } from "../components/Toast";

const emptyForm = { name: "", email: "", phone: "", company: "", billing_address: "", notes: "" };

export default function ClientsPage() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();
  const toast = useToast();

  const load = () => {
    setLoading(true);
    setError(null);
    api.getClients()
      .then(setClients)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.createClient(form);
      setShowModal(false);
      setForm(emptyForm);
      load();
      toast.success("Client added successfully");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3 flex-1">
          <div className="relative flex-1 max-w-xs">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search clients..."
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none" />
          </div>
          <p className="text-sm text-gray-500 hidden sm:block">{clients.length} client{clients.length !== 1 ? "s" : ""}</p>
        </div>
        <Button onClick={() => setShowModal(true)}><Plus size={16} /> Add Client</Button>
      </div>

      <Card>
        {loading ? <Spinner /> : error ? <ErrorMessage message={error} onRetry={load} /> : clients.length === 0 ? (
          <EmptyState icon={Users} title="No clients yet" description="Add your first client to get started" action={<Button onClick={() => setShowModal(true)}><Plus size={16} /> Add Client</Button>} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm whitespace-nowrap">
              <thead className="text-left text-slate-500 bg-slate-50/50">
                <tr>
                  <th className="px-5 py-3 font-medium">Name</th>
                  <th className="px-5 py-3 font-medium hidden sm:table-cell">Email</th>
                  <th className="px-5 py-3 font-medium hidden md:table-cell">Company</th>
                  <th className="px-5 py-3 font-medium">Missions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {clients.filter((c) => !search || c.name.toLowerCase().includes(search.toLowerCase()) || (c.email||'').toLowerCase().includes(search.toLowerCase()) || (c.company||'').toLowerCase().includes(search.toLowerCase())).map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/80 transition-colors cursor-pointer" onClick={() => navigate(`/clients/${c.id}`)}>
                    <td className="px-5 py-3.5 font-medium text-slate-800">{c.name}</td>
                    <td className="px-5 py-3.5 text-slate-500 hidden sm:table-cell">{c.email || "—"}</td>
                    <td className="px-5 py-3.5 text-slate-500 hidden md:table-cell">{c.company || "—"}</td>
                    <td className="px-5 py-3.5 text-slate-500">{c.mission_count ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Add Client">
        <form onSubmit={handleSubmit} className="space-y-4">
          {[
            { key: "name", label: "Name *", required: true },
            { key: "email", label: "Email", type: "email" },
            { key: "phone", label: "Phone" },
            { key: "company", label: "Company" },
          ].map(({ key, label, type, required }) => (
            <div key={key}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
              <input type={type || "text"} required={required} value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none" />
            </div>
          ))}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Billing Address</label>
            <textarea value={form.billing_address} onChange={(e) => setForm({ ...form, billing_address: e.target.value })} rows={2}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none" />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" type="button" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button type="submit" disabled={saving}>{saving ? "Saving..." : "Add Client"}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
