<?php

namespace App\Models;

use App\Core\DB;

class Permission extends BaseModel
{
    protected static string $table = 'permissions';

    protected static array $fillable = [
        'name',
        'description',
        'created_at',
        'updated_at',
    ];

    public static function roles(int $permissionId): array
    {
        $sql = 'SELECT r.* FROM roles r INNER JOIN role_permissions rp ON rp.role_id = r.id WHERE rp.permission_id = :permission_id';

        return DB::fetchAll($sql, ['permission_id' => $permissionId]);
    }
}

