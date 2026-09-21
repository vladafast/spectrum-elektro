<?php
// ===================================================================
// Konekcija na bazu (SQLite fajl u /data) + kreiranje tabele i
// popunjavanje podrazumevanim proizvodima/uslugama pri prvom pokretanju.
// SQLite je izabran jer radi na skoro svakom hostingu bez potrebe da
// se ručno pravi MySQL baza u panelu.
// ===================================================================

function spectrum_db(): PDO {
    static $pdo = null;
    if ($pdo !== null) {
        return $pdo;
    }

    $dataDir = __DIR__ . '/../data';
    if (!is_dir($dataDir)) {
        mkdir($dataDir, 0775, true);
    }

    $dbPath = $dataDir . '/spectrum.sqlite';
    $isNew = !file_exists($dbPath);

    $pdo = new PDO('sqlite:' . $dbPath);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
    $pdo->exec('PRAGMA journal_mode = WAL');

    $pdo->exec('CREATE TABLE IF NOT EXISTS items (
        id TEXT PRIMARY KEY,
        type TEXT NOT NULL,
        name TEXT NOT NULL,
        brand TEXT,
        category TEXT NOT NULL,
        item_condition TEXT,
        price REAL NOT NULL DEFAULT 0,
        oldPrice REAL,
        priceLabel TEXT,
        description TEXT,
        icon TEXT,
        image TEXT,
        stock INTEGER NOT NULL DEFAULT 1,
        featured INTEGER NOT NULL DEFAULT 0,
        createdAt INTEGER NOT NULL
    )');

    if ($isNew) {
        spectrum_seed($pdo);
    }

    return $pdo;
}

function spectrum_seed(PDO $pdo): void {
    $seedPath = __DIR__ . '/../data/seed.json';
    $items = json_decode((string) file_get_contents($seedPath), true) ?: [];

    $pdo->exec('DELETE FROM items');

    $stmt = $pdo->prepare('INSERT INTO items
        (id, type, name, brand, category, item_condition, price, oldPrice, priceLabel, description, icon, image, stock, featured, createdAt)
        VALUES
        (:id, :type, :name, :brand, :category, :condition, :price, :oldPrice, :priceLabel, :description, :icon, :image, :stock, :featured, :createdAt)');

    $now = time();
    foreach ($items as $i => $item) {
        $stmt->execute([
            ':id' => $item['id'] ?? bin2hex(random_bytes(8)),
            ':type' => $item['type'] ?? 'prodaja',
            ':name' => $item['name'] ?? '',
            ':brand' => $item['brand'] ?? null,
            ':category' => $item['category'] ?? '',
            ':condition' => $item['condition'] ?? null,
            ':price' => $item['price'] ?? 0,
            ':oldPrice' => $item['oldPrice'] ?? null,
            ':priceLabel' => $item['priceLabel'] ?? null,
            ':description' => $item['description'] ?? '',
            ':icon' => $item['icon'] ?? 'tv',
            ':image' => $item['image'] ?? null,
            ':stock' => !empty($item['stock']) ? 1 : (array_key_exists('stock', $item) ? 0 : 1),
            ':featured' => !empty($item['featured']) ? 1 : 0,
            // Oduzimamo redni broj od trenutnog vremena da bi redosled iz seed.json ostao isti (opadajuće po createdAt).
            ':createdAt' => $now - $i,
        ]);
    }
}

function spectrum_row_to_item(array $row): array {
    return [
        'id' => $row['id'],
        'type' => $row['type'],
        'name' => $row['name'],
        'brand' => $row['brand'],
        'category' => $row['category'],
        'condition' => $row['item_condition'],
        'price' => $row['price'] !== null ? (float) $row['price'] : 0,
        'oldPrice' => $row['oldPrice'] !== null ? (float) $row['oldPrice'] : null,
        'priceLabel' => $row['priceLabel'],
        'description' => $row['description'],
        'icon' => $row['icon'],
        'image' => $row['image'],
        'stock' => (bool) $row['stock'],
        'featured' => (bool) $row['featured'],
    ];
}

function spectrum_json(array $data, int $status = 200): void {
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

function spectrum_input(): array {
    $raw = file_get_contents('php://input');
    $data = json_decode((string) $raw, true);
    return is_array($data) ? $data : [];
}
