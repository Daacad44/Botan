<?php

namespace App\Models;

use App\Core\DB;

class Category extends BaseModel
{
    protected static string $table = 'categories';

    protected static array $fillable = [
        'name',
        'slug',
        'description',
        'created_at',
        'updated_at',
    ];

    public static function products(int $categoryId): array
    {
        $sql = 'SELECT p.* FROM products p INNER JOIN product_categories pc ON pc.product_id = p.id WHERE pc.category_id = :category_id';

        return DB::fetchAll($sql, ['category_id' => $categoryId]);
    }
}

