<?php
// ===================================================================
// Admin lozinka — čuva se kao heš (ne kao čist tekst).
//
// DA PROMENITE LOZINKU: na serveru sa PHP-om pokrenite
//   php -r "echo password_hash('nova-lozinka', PASSWORD_DEFAULT);"
// i zalepite ispis (počinje sa $2y$) ispod umesto trenutne vrednosti.
// ===================================================================

define('SPECTRUM_ADMIN_PASSWORD_HASH', '$2y$12$NeatraRzG5m3Ujh4cOh4V..7gqyvvqQVxdpME2EzOv06MVJzqF6yS');
