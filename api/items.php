<?php
require __DIR__ . '/bootstrap.php';
require __DIR__ . '/auth.php';

$pdo = spectrum_db();
$method = $_SERVER['REQUEST_METHOD'];

// ---- GET: javno, svako može da pregleda ponudu ----
if ($method === 'GET') {
    $rows = $pdo->query('SELECT * FROM items ORDER BY createdAt DESC, rowid DESC')->fetchAll();
    spectrum_json(array_map('spectrum_row_to_item', $rows));
}

// ---- Sve ostalo (dodavanje/izmena/brisanje) je samo za ulogovanog admina ----
spectrum_require_admin();

if ($method === 'POST') {
    $input = spectrum_input();
    $id = bin2hex(random_bytes(12));

    $stmt = $pdo->prepare('INSERT INTO items
        (id, type, name, brand, category, item_condition, price, oldPrice, priceLabel, description, icon, image, stock, featured, createdAt)
        VALUES
        (:id, :type, :name, :brand, :category, :condition, :price, :oldPrice, :priceLabel, :description, :icon, :image, :stock, :featured, :createdAt)');

    $stmt->execute([
        ':id' => $id,
        ':type' => $input['type'] ?? 'prodaja',
        ':name' => trim((string) ($input['name'] ?? '')),
        ':brand' => $input['brand'] ?? null,
        ':category' => trim((string) ($input['category'] ?? '')),
        ':condition' => $input['condition'] ?? null,
        ':price' => (float) ($input['price'] ?? 0),
        ':oldPrice' => isset($input['oldPrice']) && $input['oldPrice'] !== null ? (float) $input['oldPrice'] : null,
        ':priceLabel' => $input['priceLabel'] ?? null,
        ':description' => trim((string) ($input['description'] ?? '')),
        ':icon' => $input['icon'] ?? 'tv',
        ':image' => $input['image'] ?? null,
        ':stock' => !empty($input['stock']) ? 1 : 0,
        ':featured' => !empty($input['featured']) ? 1 : 0,
        ':createdAt' => time(),
    ]);

    $row = $pdo->prepare('SELECT * FROM items WHERE id = ?');
    $row->execute([$id]);
    spectrum_json(spectrum_row_to_item($row->fetch()), 201);
}

if ($method === 'PUT' || $method === 'PATCH') {
    $id = $_GET['id'] ?? '';
    if ($id === '') {
        spectrum_json(['error' => 'Nedostaje id stavke.'], 400);
    }

    $existingStmt = $pdo->prepare('SELECT * FROM items WHERE id = ?');
    $existingStmt->execute([$id]);
    $existing = $existingStmt->fetch();
    if (!$existing) {
        spectrum_json(['error' => 'Stavka ne postoji.'], 404);
    }

    $input = spectrum_input();
    $get = function (string $jsonKey, string $rowKey) use ($input, $existing) {
        return array_key_exists($jsonKey, $input) ? $input[$jsonKey] : $existing[$rowKey];
    };

    $stmt = $pdo->prepare('UPDATE items SET
        type = :type, name = :name, brand = :brand, category = :category,
        item_condition = :condition, price = :price, oldPrice = :oldPrice,
        priceLabel = :priceLabel, description = :description, icon = :icon,
        image = :image, stock = :stock, featured = :featured
        WHERE id = :id');

    $stmt->execute([
        ':type' => $get('type', 'type'),
        ':name' => $get('name', 'name'),
        ':brand' => $get('brand', 'brand'),
        ':category' => $get('category', 'category'),
        ':condition' => $get('condition', 'item_condition'),
        ':price' => (float) $get('price', 'price'),
        ':oldPrice' => $get('oldPrice', 'oldPrice') !== null ? (float) $get('oldPrice', 'oldPrice') : null,
        ':priceLabel' => $get('priceLabel', 'priceLabel'),
        ':description' => $get('description', 'description'),
        ':icon' => $get('icon', 'icon'),
        ':image' => $get('image', 'image'),
        ':stock' => !empty($get('stock', 'stock')) ? 1 : 0,
        ':featured' => !empty($get('featured', 'featured')) ? 1 : 0,
        ':id' => $id,
    ]);

    $existingStmt->execute([$id]);
    spectrum_json(spectrum_row_to_item($existingStmt->fetch()));
}

if ($method === 'DELETE') {
    $id = $_GET['id'] ?? '';
    if ($id === '') {
        spectrum_json(['error' => 'Nedostaje id stavke.'], 400);
    }
    $pdo->prepare('DELETE FROM items WHERE id = ?')->execute([$id]);
    spectrum_json(['ok' => true]);
}

spectrum_json(['error' => 'Metoda nije podržana.'], 405);
