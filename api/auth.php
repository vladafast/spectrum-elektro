<?php
// ===================================================================
// Prijava admina — prava sesija na serveru (PHP session + kolačić),
// umesto lozinke u JavaScript kodu. Heš lozinke je u config.php.
// ===================================================================

function spectrum_start_session(): void {
    if (session_status() === PHP_SESSION_NONE) {
        session_set_cookie_params([
            'lifetime' => 0,
            'path' => '/',
            'httponly' => true,
            'samesite' => 'Lax',
            'secure' => (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off'),
        ]);
        session_start();
    }
}

function spectrum_is_admin(): bool {
    spectrum_start_session();
    return !empty($_SESSION['spectrum_admin']);
}

function spectrum_require_admin(): void {
    if (!spectrum_is_admin()) {
        spectrum_json(['error' => 'Niste prijavljeni. Prijavite se ponovo.'], 401);
    }
}
