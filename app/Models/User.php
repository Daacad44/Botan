<?php

namespace App\Models;

use App\Core\DB;

class User extends BaseModel
{
    protected static string $table = 'users';

    protected static array $fillable = [
        'name',
        'email',
        'password',
        'status',
        'created_at',
        'updated_at',
    ];

    public static function findByEmail(string $email): ?array
    {
        $sql = 'SELECT * FROM users WHERE email = :email LIMIT 1';

        return DB::fetch($sql, ['email' => $email]);
    }

    public static function roles(int $userId): array
    {
        $sql = 'SELECT r.* FROM roles r INNER JOIN user_roles ur ON ur.role_id = r.id WHERE ur.user_id = :user_id';

        return DB::fetchAll($sql, ['user_id' => $userId]);
    }

    public static function permissions(int $userId): array
    {
        $sql = 'SELECT DISTINCT p.*
                FROM permissions p
                INNER JOIN role_permissions rp ON rp.permission_id = p.id
                INNER JOIN user_roles ur ON ur.role_id = rp.role_id
                WHERE ur.user_id = :user_id';

        return DB::fetchAll($sql, ['user_id' => $userId]);
    }

    public static function assignRole(int $userId, int $roleId): bool
    {
        $sql = 'INSERT INTO user_roles (user_id, role_id) VALUES (:user_id, :role_id)
                ON DUPLICATE KEY UPDATE role_id = VALUES(role_id)';

        DB::execute($sql, ['user_id' => $userId, 'role_id' => $roleId]);

        return true;
    }

    public static function detachRole(int $userId, int $roleId): bool
    {
        $sql = 'DELETE FROM user_roles WHERE user_id = :user_id AND role_id = :role_id';

        return DB::execute($sql, ['user_id' => $userId, 'role_id' => $roleId]) > 0;
    }

    public static function purchases(int $userId): array
    {
        return Purchase::where('user_id', $userId);
    }
}

