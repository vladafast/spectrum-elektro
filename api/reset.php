<?php
require __DIR__ . '/bootstrap.php';
require __DIR__ . '/auth.php';

spectrum_require_admin();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    spectrum_json(['error' => 'Metoda nije podržana.'], 405);
}

$pdo = spectrum_db();
spectrum_seed($pdo);

spectrum_json(['ok' => true]);
