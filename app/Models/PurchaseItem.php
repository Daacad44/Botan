<?php

namespace App\Models;

class PurchaseItem extends BaseModel
{
    protected static string $table = 'purchase_items';

    protected static array $fillable = [
        'purchase_id',
        'product_id',
        'quantity',
        'unit_price',
    ];
}

