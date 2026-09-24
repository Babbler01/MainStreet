const API_URL = "https://mainstreet-api-w47w.onrender.com/v1/";

async function getServices() {
    try {
        const response = await fetch(`${API_URL}/services`);

        if (!response.ok) {
            throw new Error(`HTTP error: ${response.status}`);
        }

        const data = await response.json();

        displayServices(data.results);

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
                <div class="card h-100">
                    <div class="card-body">
                        <h3 class="card-title">${service.title}</h3>

                        <p class="card-text">
                            ${service.description}
                        </p>

                        <p class="fw-bold">
                            ₦${service.price.toLocaleString()}
                        </p>
                    </div>
                </div>
            </div>
            
        `;

        servicesContainer.innerHTML += serviceCard;
    });
}

getServices();