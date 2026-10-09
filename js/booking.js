
const API_URL = "https://mainstreet-api-w47w.onrender.com/v1";

const bookingForm = document.getElementById("booking-form");
const categorySelect = document.getElementById("serviceCategory");
const serviceSelect = document.getElementById("serviceType");
const dateInput = document.getElementById("appointmentDate");
const timeSelect = document.getElementById("appointmentTime");
const priceMessage = document.getElementById("selected-service-price");
const bookingMessage = document.getElementById("booking-message");
const submitButton = document.getElementById("booking-submit");

let categories = [];
let services = [];

function getId(item) {
  return item.id || item._id;
}

async function fetchJson(url) {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Request failed (${response.status})`);
  }

  return response.json();
}

function showMessage(message, type) {
  bookingMessage.className = `alert alert-${type}`;
  bookingMessage.textContent = message;
}

function clearMessage() {
  bookingMessage.className = "d-none";
  bookingMessage.textContent = "";
}

function setMinDate() {
  const now = new Date();
  const localDate = new Date(
    now.getTime() - now.getTimezoneOffset() * 60000
  )
    .toISOString()
    .split("T")[0];

  dateInput.min = localDate;
}

async function loadBookingOptions() {
  categorySelect.disabled = true;
  serviceSelect.disabled = true;

  try {
    const [categoryData, serviceData] = await Promise.all([
      fetchJson(`${API_URL}/service-categories`),
      fetchJson(`${API_URL}/services`),
    ]);

    console.log("Category response:", categoryData);
    console.log("Service response:", serviceData);

    categories = categoryData.results || [];
    services = serviceData.results || [];

    categorySelect.replaceChildren(
      new Option("Choose a category", "")
    );

    categories.forEach((category) => {
      categorySelect.add(
        new Option(category.name, getId(category))
      );
    });

    categorySelect.disabled = false;
    serviceSelect.replaceChildren(
      new Option("Choose a category first", "")
    );
  } catch (error) {
    console.error("Could not load booking options:", error);

    categorySelect.replaceChildren(
      new Option("Services temporarily unavailable", "")
    );

    showMessage(
      "We couldn't load our services. Please refresh the page or contact us to book.",
      "danger"
    );
  }
}

function loadCategoryServices() {
  const selectedCategoryId = categorySelect.value;

  serviceSelect.replaceChildren(
    new Option("Choose a service", "")
  );

  priceMessage.textContent = "";

  const matchingServices = services.filter((service) => {
    const categoryId =
      typeof service.category === "object"
        ? getId(service.category)
        : service.category;

    return categoryId === selectedCategoryId;
  });

  matchingServices.forEach((service) => {
    serviceSelect.add(
      new Option(
        `${service.title} — ₦${Number(service.price).toLocaleString("en-NG")}`,
        getId(service)
      )
    );
  });

  serviceSelect.disabled = matchingServices.length === 0;

  if (matchingServices.length === 0 && selectedCategoryId) {
    serviceSelect.replaceChildren(
      new Option("No services available in this category", "")
    );
  }
}

function updateSelectedService() {
  const service = services.find(
    (item) => getId(item) === serviceSelect.value
  );

  priceMessage.textContent = service
    ? `Selected service price: ₦${Number(service.price).toLocaleString("en-NG")}`
    : "";
}

categorySelect.addEventListener("change", () => {
  clearMessage();
  loadCategoryServices();
});

serviceSelect.addEventListener("change", updateSelectedService);

bookingForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  clearMessage();

  if (!bookingForm.reportValidity()) return;

  const selectedService = services.find(
    (service) => getId(service) === serviceSelect.value
  );

  if (!selectedService) {
    showMessage("Please select a valid service.", "danger");
    return;
  }

  const selectedCategoryId = categorySelect.value;
  const serviceCategoryId =
    typeof selectedService.category === "object"
      ? getId(selectedService.category)
      : selectedService.category;

  if (selectedCategoryId !== serviceCategoryId) {
    showMessage(
      "The selected service does not match the chosen category. Please select it again.",
      "danger"
    );
    return;
  }

  const selectedDate = dateInput.value;
  const selectedTime = timeSelect.value;

  const appointmentDateTime = new Date(
    `${selectedDate}T${selectedTime}:00`
  );

  if (Number.isNaN(appointmentDateTime.getTime())) {
    showMessage("Please select a valid appointment date and time.", "danger");
    return;
  }

  if (appointmentDateTime.getTime() <= Date.now()) {
    showMessage("Please choose a future appointment time.", "danger");
    return;
  }

  const payload = {
    firstName: bookingForm.firstName.value.trim(),
    lastName: bookingForm.lastName.value.trim(),
    contactNumber: bookingForm.contactNumber.value.trim(),
    email: bookingForm.email.value.trim(),
    serviceCategory: selectedCategoryId,
    serviceType: serviceSelect.value,
    appointmentDateTime: appointmentDateTime.toISOString(),
    additionalNotes: bookingForm.additionalNotes.value.trim(),
  };

  submitButton.disabled = true;
  submitButton.textContent = "Submitting request...";

  try {
    const response = await fetch(`${API_URL}/appointments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(
        result.message || "We couldn't submit your appointment."
      );
    }

    showMessage(
      "Your appointment request was submitted successfully. Please wait for MainStreet to confirm your booking.",
      "success"
    );

    bookingForm.reset();
    setMinDate();
    serviceSelect.replaceChildren(
      new Option("Choose a category first", "")
    );
    serviceSelect.disabled = true;
    priceMessage.textContent = "";
  } catch (error) {
    console.error("Appointment submission failed:", error);

    showMessage(
      error.message ||
        "Something went wrong. Please try again or contact us.",
      "danger"
    );
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = "Request Appointment";
  }
});

setMinDate();
loadBookingOptions();
