const footer = document.getElementById("footer");

footer.innerHTML = `
  <footer class="main-footer ms-pad">
    <div class="container">

      <div class="row g-4">

        <!-- Brand -->
        <div class="col-12 col-lg-4">
          <a href="index.html" class="footer-brand text-decoration-none">
            <img src="img/mainstreet.svg" alt="MainStreet Logo">
          </a>

          <p class="footer-text mt-3">
            Premium grooming for the modern man.
            Quality cuts, clean style, and confidence that shows.
          </p>

          <div class="footer-socials d-flex gap-3 mt-4">
            <a href="#" aria-label="Instagram">
              <i class="bi bi-instagram"></i>
            </a>

            <a href="#" aria-label="Facebook">
              <i class="bi bi-facebook"></i>
            </a>

            <a href="#" aria-label="WhatsApp">
              <i class="bi bi-whatsapp"></i>
            </a>
          </div>
        </div>

        <!-- Quick Links -->
        <div class="col-6 col-md-4 col-lg-2">
          <h3 class="footer-title">Quick Links</h3>

          <ul class="footer-links list-unstyled">
            <li><a href="index.html">Home</a></li>
            <li><a href="about.html">About</a></li>
            <li><a href="services.html">Services</a></li>
            <li><a href="gallery.html">Gallery</a></li>
            <li><a href="reviews.html">Reviews</a></li>
            <li><a href="contact.html">Contact</a></li>
          </ul>
        </div>

        <!-- Services -->
        <div class="col-6 col-md-4 col-lg-2">
          <h3 class="footer-title">Services</h3>

          <ul class="footer-links list-unstyled">
            <li><a href="services.html">Haircuts</a></li>
            <li><a href="services.html">Beard & Grooming</a></li>
            <li><a href="services.html">Hair Care</a></li>
            <li><a href="services.html">Kids Grooming</a></li>
            <li><a href="services.html">Packages</a></li>
          </ul>
        </div>

        <!-- Contact -->
        <div class="col-12 col-md-4 col-lg-4">
          <h3 class="footer-title">Contact Us</h3>

          <ul class="footer-contact list-unstyled">

            <li>
              <i class="bi bi-geo-alt"></i>
              <span>Lagos, Nigeria</span>
            </li>

            <li>
              <i class="bi bi-telephone"></i>
              <span>+2348 123 456 7890</span>
            </li>

            <li>
              <i class="bi bi-envelope"></i>
              <span>hello@mainstreet.com</span>
            </li>

          </ul>

          <div class="footer-hours mt-4">
            <h4>Opening Hours</h4>

            <p>
              Monday – Saturday<br>
              <span>9:00 AM – 8:00 PM</span>
            </p>

            <p>
              Sunday<br>
              <span>12:00 PM – 6:00 PM</span>
            </p>
          </div>
        </div>

      </div>

      <!-- Bottom Footer -->
      <div class="footer-bottom mt-5 pt-4">

        <div class="row align-items-center g-3">

          <div class="col-12 col-md-6">
            <p class="mb-0">
              © 2026 MainStreet. All rights reserved.
            </p>
          </div>

          <div class="col-12 col-md-6 text-md-end">
            <p class="mb-0 text-md-end">
                Quality grooming. Exceptional experience.
            </p>
          </div>

        </div>

      </div>

    </div>
  </footer>
`;