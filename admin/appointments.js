const API_URL = "https://mainstreet-api-w47w.onrender.com/v1";

const accessForm = document.getElementById("access-form");
const adminKeyInput = document.getElementById("admin-key");
const accessMessage = document.getElementById("access-message");
const dashboard = document.getElementById("dashboard");
const accessPanel = document.getElementById("access-panel");
const appointmentsBody = document.getElementById("appointments-body");
const searchInput = document.getElementById("search-input");
const statusFilter = document.getElementById("status-filter");
const dateFilter = document.getElementById("date-filter");
const refreshButton = document.getElementById("refresh-btn");
const logoutButton = document.getElementById("logout-btn");
const connectButton = document.getElementById("connect-btn");
const loadingState = document.getElementById("table-loading");
const emptyState = document.getElementById("empty-state");
const tableWrapper = document.getElementById("table-wrapper");
const pageMessage = document.getElementById("page-message");
const resultsCount = document.getElementById("results-count");
const connectionLabel = document.getElementById("connection-label");

const modalElement = document.getElementById("appointment-modal");
const appointmentModal = new bootstrap.Modal(modalElement);
const appointmentDetails = document.getElementById("appointment-details");

let adminKey = "";
let appointments = [];
let services = [];

function idOf(item) {
  if (!item) return "";
  return typeof item === "object" ? String(item.id || item._id || "") : String(item);
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[char]);
}

async function apiRequest(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      ...(options.headers || {}),
      "x-admin-key": adminKey,
    },
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("Access denied. Check your administrator key.");
    }

    if (response.status === 503) {
      throw new Error("Admin access has not been configured on the server.");
    }

    const result = await response.json().catch(() => ({}));
    throw new Error(result.message || `Request failed (${response.status}).`);
  }

  if (response.status === 204) return null;

  return response.json();
}

function showPageMessage(message, type = "danger") {
  pageMessage.className = `alert alert-${type}`;
  pageMessage.textContent = message;
}

function clearPageMessage() {
  pageMessage.className = "alert d-none";
  pageMessage.textContent = "";
}

function getService(appointment) {
  const serviceId = idOf(appointment.serviceType);

  if (!serviceId) return null;

  return services.find(
    (service) => idOf(service) === serviceId
  ) || null;
}

function formatDateTime(value) {
  if (!value) return "Not specified";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Invalid date";

  return new Intl.DateTimeFormat("en-NG", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function localDate(value) {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function statusClass(status) {
  if (status === "Upcoming") return "status-upcoming";
  if (status === "Past") return "status-past";
  if (status === "Cancelled") return "status-cancelled";

  return "";
}

function updateSummary() {
  document.getElementById("total-count").textContent = appointments.length;

  document.getElementById("upcoming-count").textContent =
    appointments.filter((item) => item.status === "Upcoming").length;

  document.getElementById("past-count").textContent =
    appointments.filter((item) => item.status === "Past").length;

  document.getElementById("cancelled-count").textContent =
    appointments.filter((item) => item.status === "Cancelled").length;
}

function getFilteredAppointments() {
  const query = searchInput.value.trim().toLowerCase();
  const status = statusFilter.value;
  const selectedDate = dateFilter.value;

  return appointments.filter((appointment) => {
    const service = getService(appointment);

    const searchableText = [
      appointment.firstName,
      appointment.lastName,
      appointment.email,
      appointment.contactNumber,
      service?.title,
      appointment.additionalNotes,
    ].join(" ").toLowerCase();

    const matchesQuery = !query || searchableText.includes(query);
    const matchesStatus = !status || appointment.status === status;
    const matchesDate =
      !selectedDate ||
      localDate(appointment.appointmentDateTime) === selectedDate;

    return matchesQuery && matchesStatus && matchesDate;
  });
}

function renderAppointments() {
  const filtered = getFilteredAppointments();

  appointmentsBody.replaceChildren();

  filtered.forEach((appointment) => {
    const service = getService(appointment);
    const serviceTitle = service?.title || "Service unavailable";
    const price = service
      ? `₦${Number(service.price).toLocaleString("en-NG")}`
      : "";

    const customerName =
      `${appointment.firstName || ""} ${appointment.lastName || ""}`.trim()
      || "Unnamed customer";

    const row = document.createElement("tr");

    row.innerHTML = `
      <td>
        <div class="customer-name">${escapeHtml(customerName)}</div>
        <div class="customer-email">${escapeHtml(appointment.email)}</div>
      </td>

      <td>
        <div class="customer-name">${escapeHtml(serviceTitle)}</div>
        <div class="secondary-text">${escapeHtml(price)}</div>
      </td>

      <td>${escapeHtml(formatDateTime(appointment.appointmentDateTime))}</td>

      <td>${escapeHtml(appointment.contactNumber)}</td>

      <td>
        <span class="status-badge ${statusClass(appointment.status)}">
          ${escapeHtml(appointment.status)}
        </span>
      </td>

      <td>
        <button type="button" class="btn btn-sm btn-outline-dark"
          data-action="view" data-id="${escapeHtml(idOf(appointment))}">
          View
        </button>

        <button type="button" class="btn btn-sm btn-outline-secondary mt-1"
          data-action="edit" data-id="${escapeHtml(idOf(appointment))}">
          Update
        </button>
      </td>
    `;

    appointmentsBody.appendChild(row);
  });

  tableWrapper.hidden = filtered.length === 0;
  emptyState.hidden = filtered.length !== 0;
  resultsCount.textContent =
    `${filtered.length} appointment${filtered.length === 1 ? "" : "s"}`;
}

async function loadAppointments() {
  loadingState.hidden = false;
  emptyState.hidden = true;
  tableWrapper.hidden = true;
  refreshButton.disabled = true;
  clearPageMessage();

  try {
    const [appointmentData, serviceData] = await Promise.all([
      apiRequest("/appointments?limit=100&page=1"),
      fetch(`${API_URL}/services`).then(async (response) => {
        if (!response.ok) throw new Error("Unable to load services.");
        return response.json();
      }),
    ]);

    appointments = appointmentData.results || [];
    services = serviceData.results || [];

    console.log("Appointments:", appointments);
    console.log("Services:", services);

    console.log(
      "First appointment serviceType:",
      appointments[0]?.serviceType
    );

    console.log(
      "Available service IDs:",
      services.map((service) => ({
        id: service.id,
        _id: service._id,
        title: service.title,
      }))
    );

    updateSummary();
    renderAppointments();

    dashboard.hidden = false;
    accessPanel.hidden = true;
    connectionLabel.textContent = "Connected";
    document.querySelector(".admin-indicator").classList.add("connected");
  } catch (error) {
    showPageMessage(error.message || "Unable to load appointments.");

    if (/access denied|admin access/i.test(error.message)) {
      adminKey = "";
      dashboard.hidden = true;
      accessPanel.hidden = false;
      connectionLabel.textContent = "Not connected";
      document.querySelector(".admin-indicator").classList.remove("connected");
    }
  } finally {
    loadingState.hidden = true;
    refreshButton.disabled = false;
  }
}

function findAppointment(id) {
  return appointments.find((item) => idOf(item) === id);
}

function showAppointmentDetails(appointment) {
  const service = getService(appointment);

  appointmentDetails.innerHTML = `
    <dl class="row mb-0">
      <dt class="col-5 mb-2">Customer</dt>
      <dd class="col-7">${escapeHtml(
        `${appointment.firstName || ""} ${appointment.lastName || ""}`.trim()
      )}</dd>

      <dt class="col-5 mb-2">Email</dt>
      <dd class="col-7">${escapeHtml(appointment.email)}</dd>

      <dt class="col-5 mb-2">Phone</dt>
      <dd class="col-7">${escapeHtml(appointment.contactNumber)}</dd>

      <dt class="col-5 mb-2">Service</dt>
      <dd class="col-7">${escapeHtml(service?.title || "Service unavailable")}</dd>

      <dt class="col-5 mb-2">Price</dt>
      <dd class="col-7">${service
        ? escapeHtml(`₦${Number(service.price).toLocaleString("en-NG")}`)
        : "Unavailable"}</dd>

      <dt class="col-5 mb-2">Date and time</dt>
      <dd class="col-7">${escapeHtml(formatDateTime(appointment.appointmentDateTime))}</dd>

      <dt class="col-5 mb-2">Status</dt>
      <dd class="col-7">${escapeHtml(appointment.status)}</dd>

      <dt class="col-5 mb-2">Notes</dt>
      <dd class="col-7">${escapeHtml(appointment.additionalNotes || "No additional notes")}</dd>

      <dt class="col-5 mb-2">Appointment ID</dt>
      <dd class="col-7 text-break">${escapeHtml(idOf(appointment))}</dd>
    </dl>
  `;

  appointmentModal.show();
}

async function updateAppointmentStatus(appointment) {
  const currentStatus = appointment.status || "Upcoming";

  const requestedStatus = window.prompt(
    `Current status: ${currentStatus}\nEnter one of: Upcoming, Past, Cancelled`,
    currentStatus
  );

  if (requestedStatus === null) return;

  const newStatus = requestedStatus.trim();

  if (!["Upcoming", "Past", "Cancelled"].includes(newStatus)) {
    showPageMessage("Choose Upcoming, Past, or Cancelled.", "warning");
    return;
  }

  try {
    await apiRequest(`/appointments/${encodeURIComponent(idOf(appointment))}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });

    showPageMessage("Appointment status updated.", "success");
    await loadAppointments();
  } catch (error) {
    showPageMessage(error.message || "Unable to update appointment.");
  }
}

accessForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  adminKey = adminKeyInput.value.trim();

  if (!adminKey) return;

  connectButton.disabled = true;
  connectButton.textContent = "Connecting...";
  accessMessage.textContent = "";

  await loadAppointments();

  if (dashboard.hidden) {
    accessMessage.textContent =
      "Could not connect. Check the key and server configuration.";
  } else {
    adminKeyInput.value = "";
  }

  connectButton.disabled = false;
  connectButton.textContent = "Connect";
});

appointmentsBody.addEventListener("click", async (event) => {
  const button = event.target.closest("button[data-action]");
  if (!button) return;

  const appointment = findAppointment(button.dataset.id);
  if (!appointment) return;

  if (button.dataset.action === "view") {
    showAppointmentDetails(appointment);
  }

  if (button.dataset.action === "edit") {
    await updateAppointmentStatus(appointment);
  }
});

searchInput.addEventListener("input", renderAppointments);
statusFilter.addEventListener("change", renderAppointments);
dateFilter.addEventListener("change", renderAppointments);

document.getElementById("clear-filters").addEventListener("click", () => {
  searchInput.value = "";
  statusFilter.value = "";
  dateFilter.value = "";
  renderAppointments();
});

refreshButton.addEventListener("click", loadAppointments);

logoutButton.addEventListener("click", () => {
  adminKey = "";
  appointments = [];
  services = [];

  dashboard.hidden = true;
  accessPanel.hidden = false;
  appointmentsBody.replaceChildren();

  connectionLabel.textContent = "Not connected";
  document.querySelector(".admin-indicator").classList.remove("connected");

  clearPageMessage();
  accessMessage.textContent = "Disconnected.";
  adminKeyInput.focus();
});
