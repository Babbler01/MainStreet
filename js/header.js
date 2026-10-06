const header = document.getElementById("header");

header.innerHTML = `
    <nav class="navbar navbar-expand-lg navbar-dark position-absolute top-0 start-0 w-100 z-3">
        <div class="container">

            <!-- Brand -->
            <a class="navbar-brand fw-bold" href="index.html">
                <img src="img/mainstreet.svg" alt="MainStreet Logo">
            </a>

            <!-- Mobile Toggler -->
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#mainNavbar" aria-controls="mainNavbar" aria-expanded="false" aria-label="Toggle navigation">
                <span class="navbar-toggler-icon"></span>
            </button>

            <!-- Navigation -->
            <div class="collapse navbar-collapse" id="mainNavbar">

                <ul class="navbar-nav ms-auto align-items-lg-center gap-lg-2">

                    <li class="nav-item">
                        <a class="nav-link" href="index.html">Home</a>
                    </li>

                    <li class="nav-item">
                        <a class="nav-link" href="about.html">About</a>
                    </li>

                    <li class="nav-item">
                        <a class="nav-link" href="services.html">Services</a>
                    </li>

                    <li class="nav-item">
                        <a class="nav-link" href="gallery.html">Gallery</a>
                    </li>

                    <li class="nav-item">
                        <a class="nav-link" href="reviews.html">Reviews</a>
                    </li>

                    <li class="nav-item">
                        <a class="nav-link" href="contact.html">Contact</a>
                    </li>

                </ul>

                <!-- CTA -->
                <a href="booking.html" class="btn btn-light ms-lg-3 px-4">
                    Book Appointment
                </a>

            </div>
        </div>
    </nav>
`;


// Make current page nav item active
const currentPage =
  window.location.pathname.split("/").pop() || "index.html";

document.querySelectorAll(".nav-link").forEach(link => {
  if (link.getAttribute("href") === currentPage) {
    link.classList.add("active");
  }
});