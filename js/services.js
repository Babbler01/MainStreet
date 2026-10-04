const API_URL = "https://mainstreet-api-w47w.onrender.com/v1/";

let services = [];

async function getServices() {
  try {
    const response = await fetch(`${API_URL}/services`);

    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }

    const data = await response.json();

    services = data.results;

    displayServices(services);
  } catch (error) {
    console.error("Failed to fetch services:", error);
  }
}

function displayServices(services) {
    const servicesContainer = document.getElementById("featured-services");

    servicesContainer.innerHTML = "";

    services.slice(0, 3).forEach((service) => {

        const serviceCard = `
            <div class="col-12 col-md-6 col-lg-4">
                <div class="card h-100 service-card" data-service-id="${service.id}">
                
                    <img src="${service.image}" class="card-img-top" alt="${service.title}">

                    <div class="card-body">
                        <h3 class="card-title">${service.title}</h3>
                        <p class="card-text">${service.description}</p>
                        <p class="fw-bold">₦${service.price.toLocaleString()}</p>
                    </div>

                    

                </div>
            </div>
        `;

        servicesContainer.innerHTML += serviceCard;
    });
}

function openServiceModal(serviceId) {
  const service = services.find(
    (service) => service.id === serviceId
  );

  if (!service) return;

  document.getElementById("modalServiceTitle").textContent =
    service.title;

  document.getElementById("modalServiceDescription").textContent =
    service.description;

  document.getElementById("modalServicePrice").textContent =
    `₦${service.price.toLocaleString()}`;

  const image = document.getElementById("modalServiceImage");

  image.src = service.image;
  image.alt = service.title;

  const modal = new bootstrap.Modal(
    document.getElementById("serviceModal")
  );

  modal.show();
}

document
  .getElementById("featured-services")
  .addEventListener("click", function (event) {

    const card = event.target.closest(".service-card");

    if (!card) return;

    const serviceId = card.dataset.serviceId;

    openServiceModal(serviceId);
  });


getServices();