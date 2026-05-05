export const API_URL = "/api";

async function request(path, options = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { "Content-Type": "application/json", ...options.headers },
    ...options,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}

export const api = {
  // Dashboard
  getDashboard: () => request("/dashboard"),

  // Clients
  getClients: () => request("/clients"),
  getClient: (id) => request(`/clients/${id}`),
  createClient: (data) => request("/clients", { method: "POST", body: JSON.stringify(data) }),
  updateClient: (id, data) => request(`/clients/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteClient: (id) => request(`/clients/${id}`, { method: "DELETE" }),

  // Missions
  getMissions: () => request("/missions"),
  getMission: (id) => request(`/missions/${id}`),
  createMission: (data) => request("/missions", { method: "POST", body: JSON.stringify(data) }),
  updateMission: (id, data) => request(`/missions/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteMission: (id) => request(`/missions/${id}`, { method: "DELETE" }),

  // Invoices
  getInvoices: () => request("/invoices"),
  getInvoice: (id) => request(`/invoices/${id}`),
  createInvoice: (data) => request("/invoices", { method: "POST", body: JSON.stringify(data) }),
  updateInvoice: (id, data) => request(`/invoices/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteInvoice: (id) => request(`/invoices/${id}`, { method: "DELETE" }),

  // Follow-ups
  getFollowUps: (invoiceId) => request(`/invoices/${invoiceId}/followups`),
  createFollowUp: (invoiceId, data) => request(`/invoices/${invoiceId}/followups`, { method: "POST", body: JSON.stringify(data) }),

  // AI
  aiSummarizeClient: (clientId) => request("/ai/summarize-client", { method: "POST", body: JSON.stringify({ client_id: clientId }) }),
  aiParseMission: (text) => request("/ai/parse-mission", { method: "POST", body: JSON.stringify({ text }) }),
  aiGenerateInvoiceMessage: (data) => request("/ai/generate-invoice-message", { method: "POST", body: JSON.stringify(data) }),
  aiGenerateFollowup: (invoiceId, tone) => request("/ai/generate-followup", { method: "POST", body: JSON.stringify({ invoice_id: invoiceId, tone }) }),
  aiChat: (question) => request("/ai/chat", { method: "POST", body: JSON.stringify({ question }) }),
};
