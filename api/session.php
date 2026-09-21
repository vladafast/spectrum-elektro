<?php
require __DIR__ . '/bootstrap.php';
require __DIR__ . '/auth.php';

spectrum_json(['loggedIn' => spectrum_is_admin()]);
