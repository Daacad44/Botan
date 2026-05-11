<?php

namespace App\Models;

use App\Core\DB;

class Product extends BaseModel
{
    protected static string $table = 'products';

    protected static array $fillable = [
        'name',
        'slug',
        'sku',
        'description',
        'price',
        'stock',
        'is_active',
        'created_at',
        'updated_at',
    ];

    public static function categories(int $productId): array
    {
        $sql = 'SELECT c.* FROM categories c INNER JOIN product_categories pc ON pc.category_id = c.id WHERE pc.product_id = :product_id';

        return DB::fetchAll($sql, ['product_id' => $productId]);
    }

    public static function attachCategory(int $productId, int $categoryId): bool
    {
        $sql = 'INSERT INTO product_categories (product_id, category_id) VALUES (:product_id, :category_id)
                ON DUPLICATE KEY UPDATE category_id = VALUES(category_id)';

        DB::execute($sql, ['product_id' => $productId, 'category_id' => $categoryId]);

        return true;
    }

    public static function detachCategory(int $productId, int $categoryId): bool
    {
        $sql = 'DELETE FROM product_categories WHERE product_id = :product_id AND category_id = :category_id';

        return DB::execute($sql, ['product_id' => $productId, 'category_id' => $categoryId]) > 0;
    }

    public static function purchaseItems(int $productId): array
    {
        return PurchaseItem::where('product_id', $productId);
    }
}

