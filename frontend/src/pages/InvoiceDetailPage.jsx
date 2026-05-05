import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Send, CheckCircle, Trash2, Sparkles, Loader2, Clock, Mail, Download } from "lucide-react";
import { api } from "../api";
import { Spinner, ErrorMessage, StatusBadge, Card, Button } from "../components/UI";
import { useToast } from "../components/Toast";
import { generateInvoicePDF } from "../utils/pdf";

function suggestTone(daysOverdue) {
  if (daysOverdue <= 5) return "friendly";
  if (daysOverdue <= 14) return "firm";
  return "final";
}

export default function InvoiceDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Follow-up generator state
  const [fuTone, setFuTone] = useState("friendly");
  const [fuDraft, setFuDraft] = useState("");
  const [fuLoading, setFuLoading] = useState(false);
  const [fuError, setFuError] = useState(null);
  const [fuGenerated, setFuGenerated] = useState(false);
  const [fuSaving, setFuSaving] = useState(false);

  const load = () => {
    setLoading(true);
    setError(null);
    api.getInvoice(id)
      .then(setInvoice)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, [id]);

  // Auto-suggest tone based on days overdue once invoice loads
  useEffect(() => {
    if (invoice?.due_date && (invoice.status === "sent" || invoice.status === "overdue")) {
      const days = Math.max(0, Math.floor((Date.now() - new Date(invoice.due_date)) / 86400000));
      setFuTone(suggestTone(days));
    }
  }, [invoice]);

  const generateFollowup = async () => {
    setFuLoading(true);
    setFuError(null);
    try {
      const data = await api.aiGenerateFollowup(parseInt(id), fuTone);
      setFuDraft(data.message);
      setFuGenerated(true);
    } catch (err) {
      setFuError(err.message);
    } finally {
      setFuLoading(false);
    }
  };

  const saveFollowup = async (markSent = false) => {
    if (!fuDraft.trim()) return;
    setFuSaving(true);
    try {
      await api.createFollowUp(id, {
        message: fuDraft,
        tone: fuTone,
        sent: markSent,
        follow_up_date: new Date().toISOString().split("T")[0],
      });
      setFuDraft("");
      setFuGenerated(false);
      load();
      toast.success(markSent ? "Follow-up saved & marked as sent" : "Follow-up saved as draft");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setFuSaving(false);
    }
  };

  const updateStatus = async (status) => {
    try {
      const updated = await api.updateInvoice(id, { status });
      setInvoice({ ...invoice, ...updated });
      toast.success(`Invoice marked as ${status}`);
    } catch (err) { toast.error(err.message); }
  };

  const handleDelete = async () => {
    if (!confirm("Delete this invoice?")) return;
    try {
      await api.deleteInvoice(id);
      navigate("/invoices");
      toast.success("Invoice deleted");
    } catch (err) { toast.error(err.message); }
  };

  if (loading) return <Spinner />;
  if (error) return <ErrorMessage message={error} onRetry={load} />;

  return (
    <div className="space-y-6">
      <button onClick={() => navigate("/invoices")} className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-indigo-600">
        <ArrowLeft size={16} /> Back to Invoices
      </button>

      <Card className="p-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">{invoice.invoice_number}</h2>
            <p className="text-gray-500">{invoice.client_name} — {invoice.mission_title}</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            {invoice.status === "draft" && (
              <Button variant="primary" onClick={() => updateStatus("sent")}><Send size={14} /> Mark as Sent</Button>
            )}
            {(invoice.status === "sent" || invoice.status === "overdue") && (
              <Button variant="success" onClick={() => updateStatus("paid")}><CheckCircle size={14} /> Mark as Paid</Button>
            )}
            <Button variant="danger" onClick={handleDelete}><Trash2 size={14} /> Delete</Button>
            <Button variant="secondary" onClick={() => generateInvoicePDF(invoice)}><Download size={14} /> Download PDF</Button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-6">
          <div><span className="text-gray-400">Status</span><div className="mt-1"><StatusBadge status={invoice.status} /></div></div>
          <div><span className="text-gray-400">Issue Date</span><p className="text-gray-700 mt-0.5">{invoice.issue_date || "—"}</p></div>
          <div><span className="text-gray-400">Due Date</span><p className="text-gray-700 mt-0.5">{invoice.due_date || "—"}</p></div>
          <div><span className="text-gray-400">Total</span><p className="text-xl font-bold text-gray-800 mt-0.5">${invoice.total?.toLocaleString()}</p></div>
        </div>

        {/* Line items */}
        {invoice.line_items?.length > 0 && (
          <div className="border rounded-lg overflow-hidden mb-4">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500">
                <tr>
                  <th className="px-4 py-2.5 text-left font-medium">Description</th>
                  <th className="px-4 py-2.5 text-right font-medium">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {invoice.line_items.map((li, i) => (
                  <tr key={i}>
                    <td className="px-4 py-2.5 text-gray-700">{li.description}</td>
                    <td className="px-4 py-2.5 text-right text-gray-700">${li.amount?.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50 text-sm">
                <tr><td className="px-4 py-2 text-right text-gray-500">Subtotal</td><td className="px-4 py-2 text-right text-gray-700">${invoice.subtotal?.toLocaleString()}</td></tr>
                <tr><td className="px-4 py-2 text-right text-gray-500">Tax ({invoice.tax_rate}%)</td><td className="px-4 py-2 text-right text-gray-700">${((invoice.total || 0) - (invoice.subtotal || 0)).toLocaleString()}</td></tr>
                <tr className="font-semibold"><td className="px-4 py-2 text-right text-gray-800">Total</td><td className="px-4 py-2 text-right text-gray-800">${invoice.total?.toLocaleString()}</td></tr>
              </tfoot>
            </table>
          </div>
        )}

        {/* Cover message */}
        {invoice.cover_message && (
          <div className="bg-indigo-50 rounded-lg p-4 text-sm">
            <p className="text-xs font-medium text-indigo-600 mb-1">Cover Message</p>
            <p className="text-gray-700 whitespace-pre-wrap">{invoice.cover_message}</p>
          </div>
        )}
      </Card>

      {/* Follow-up Generator — show on sent/overdue invoices */}
      {(invoice.status === "sent" || invoice.status === "overdue") && (
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles size={18} className="text-indigo-500" />
            <h3 className="font-semibold text-gray-800">Generate Follow-up</h3>
          </div>

          <div className="flex items-center gap-3 mb-3">
            <label className="text-sm text-gray-600">Tone:</label>
            <select value={fuTone} onChange={(e) => setFuTone(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none">
              <option value="friendly">Friendly</option>
              <option value="firm">Firm</option>
              <option value="final">Final Notice</option>
            </select>
            <Button variant="secondary" onClick={generateFollowup} disabled={fuLoading}>
              {fuLoading ? <><Loader2 size={14} className="animate-spin" /> Generating...</> : <><Sparkles size={14} /> Generate Follow-up</>}
            </Button>
          </div>

          {fuError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-600 mb-3">{fuError}</div>
          )}

          {(fuDraft || fuGenerated) && (
            <div className="space-y-3">
              <textarea value={fuDraft} onChange={(e) => { setFuDraft(e.target.value); setFuGenerated(false); }} rows={5}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none" />
              {fuGenerated && <p className="text-xs text-indigo-400 italic">Generated by AI — review before sending</p>}
              <div className="flex gap-2">
                <Button variant="secondary" onClick={() => saveFollowup(false)} disabled={fuSaving}>
                  {fuSaving ? "Saving..." : "Save Draft"}
                </Button>
                <Button variant="primary" onClick={() => saveFollowup(true)} disabled={fuSaving}>
                  <Send size={14} /> Save & Mark as Sent
                </Button>
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Follow-up History Timeline */}
      <Card>
        <div className="p-5 border-b border-gray-100 flex items-center gap-2">
          <Clock size={18} className="text-gray-400" />
          <h3 className="font-semibold text-gray-800">Follow-up History ({invoice.follow_ups?.length || 0})</h3>
        </div>
        {invoice.follow_ups?.length > 0 ? (
          <div className="p-5">
            <div className="relative border-l-2 border-indigo-200 ml-3 space-y-6">
              {invoice.follow_ups.map((f) => (
                <div key={f.id} className="relative pl-6">
                  <div className={`absolute -left-2.5 top-1 w-4 h-4 rounded-full border-2 ${f.sent ? "bg-green-500 border-green-500" : "bg-white border-indigo-400"}`} />
                  <div className="flex items-center gap-2 mb-1">
                    <StatusBadge status={f.tone} />
                    <span className="text-xs text-gray-400">{f.follow_up_date || f.created_at?.split("T")[0]}</span>
                    {f.sent ? (
                      <span className="inline-flex items-center gap-1 text-xs text-green-600 font-medium"><Mail size={11} /> Sent</span>
                    ) : (
                      <span className="text-xs text-gray-400 italic">Draft</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap bg-gray-50 rounded-lg p-3">{f.message}</p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-400 p-5">No follow-ups yet</p>
        )}
      </Card>
    </div>
  );
}
