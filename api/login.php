<?php
require __DIR__ . '/bootstrap.php';
require __DIR__ . '/auth.php';
require __DIR__ . '/config.php';

spectrum_start_session();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    spectrum_json(['error' => 'Metoda nije podržana.'], 405);
}

// ---- Osnovna zaštita od automatizovanog pogađanja lozinke ----
// Posle 5 pogrešnih pokušaja iz iste sesije, primorava pauzu od minut dana.
$attempts = $_SESSION['spectrum_login_attempts'] ?? 0;
$lastAttempt = $_SESSION['spectrum_login_last_attempt'] ?? 0;
$lockoutWindow = 60; // sekundi

if ($attempts >= 5 && (time() - $lastAttempt) < $lockoutWindow) {
    spectrum_json(['ok' => false, 'error' => 'Previše pokušaja. Sačekajte minut pa probajte ponovo.'], 429);
}
if ($attempts >= 5) {
    // prozor je istekao — resetujemo brojač
    $attempts = 0;
}

$input = spectrum_input();
$password = (string) ($input['password'] ?? '');

if ($password !== '' && password_verify($password, SPECTRUM_ADMIN_PASSWORD_HASH)) {
    unset($_SESSION['spectrum_login_attempts'], $_SESSION['spectrum_login_last_attempt']);
    session_regenerate_id(true);
    $_SESSION['spectrum_admin'] = true;
    spectrum_json(['ok' => true]);
}

$_SESSION['spectrum_login_attempts'] = $attempts + 1;
$_SESSION['spectrum_login_last_attempt'] = time();

spectrum_json(['ok' => false, 'error' => 'Pogrešna lozinka.'], 401);
