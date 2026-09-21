<?php
require __DIR__ . '/bootstrap.php';
require __DIR__ . '/auth.php';
require __DIR__ . '/config.php';

spectrum_start_session();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    spectrum_json(['error' => 'Metoda nije podržana.'], 405);
}

$input = spectrum_input();
$password = (string) ($input['password'] ?? '');

if ($password !== '' && password_verify($password, SPECTRUM_ADMIN_PASSWORD_HASH)) {
    session_regenerate_id(true);
    $_SESSION['spectrum_admin'] = true;
    spectrum_json(['ok' => true]);
}

spectrum_json(['ok' => false, 'error' => 'Pogrešna lozinka.'], 401);
