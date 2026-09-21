<?php
require __DIR__ . '/bootstrap.php';
require __DIR__ . '/auth.php';

spectrum_start_session();
$_SESSION = [];
session_destroy();

spectrum_json(['ok' => true]);
