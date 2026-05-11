<?php

namespace App\Models;

use App\Core\DB;

class Purchase extends BaseModel
{
    protected static string $table = 'purchases';

    protected static array $fillable = [
        'user_id',
        'total_amount',
        'status',
        'notes',
        'purchased_at',
        'updated_at',
    ];

    public static function user(int $purchaseId): ?array
    {
        $sql = 'SELECT u.* FROM users u INNER JOIN purchases p ON p.user_id = u.id WHERE p.id = :purchase_id LIMIT 1';

        return DB::fetch($sql, ['purchase_id' => $purchaseId]);
    }

    public static function items(int $purchaseId): array
    {
        return PurchaseItem::where('purchase_id', $purchaseId);
    }

    public static function addItem(int $purchaseId, int $productId, int $quantity, float $unitPrice): array
    {
        return DB::transaction(function () use ($purchaseId, $productId, $quantity, $unitPrice) {
            $item = PurchaseItem::create([
                'purchase_id' => $purchaseId,
                'product_id' => $productId,
                'quantity' => $quantity,
                'unit_price' => $unitPrice,
            ]);

            $total = DB::fetch('SELECT SUM(quantity * unit_price) AS total FROM purchase_items WHERE purchase_id = :purchase_id', [
                'purchase_id' => $purchaseId,
            ]);

            $amount = (float) ($total['total'] ?? 0);

            self::update($purchaseId, ['total_amount' => $amount]);

            return $item;
        });
    }
}

