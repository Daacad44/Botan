<?php

namespace App\Models;

use App\Core\DB;

class Role extends BaseModel
{
    protected static string $table = 'roles';

    protected static array $fillable = [
        'name',
        'description',
        'created_at',
        'updated_at',
    ];

    public static function permissions(int $roleId): array
    {
        $sql = 'SELECT p.* FROM permissions p INNER JOIN role_permissions rp ON rp.permission_id = p.id WHERE rp.role_id = :role_id';

        return DB::fetchAll($sql, ['role_id' => $roleId]);
    }

    public static function users(int $roleId): array
    {
        $sql = 'SELECT u.* FROM users u INNER JOIN user_roles ur ON ur.user_id = u.id WHERE ur.role_id = :role_id';

        return DB::fetchAll($sql, ['role_id' => $roleId]);
    }

    public static function grantPermission(int $roleId, int $permissionId): bool
    {
        $sql = 'INSERT INTO role_permissions (role_id, permission_id) VALUES (:role_id, :permission_id)
                ON DUPLICATE KEY UPDATE role_id = VALUES(role_id)';

        DB::execute($sql, ['role_id' => $roleId, 'permission_id' => $permissionId]);

        return true;
    }

    public static function revokePermission(int $roleId, int $permissionId): bool
    {
        $sql = 'DELETE FROM role_permissions WHERE role_id = :role_id AND permission_id = :permission_id';

        return DB::execute($sql, ['role_id' => $roleId, 'permission_id' => $permissionId]) > 0;
    }
}

