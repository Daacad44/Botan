<?php

use App\Core\DB;
use App\Models\Permission;
use App\Models\Role;
use App\Models\User;

require_once __DIR__ . '/../../app/Core/DB.php';
require_once __DIR__ . '/../../app/Models/BaseModel.php';
require_once __DIR__ . '/../../app/Models/User.php';
require_once __DIR__ . '/../../app/Models/Role.php';
require_once __DIR__ . '/../../app/Models/Permission.php';

spl_autoload_register(function (string $class): void {
    $prefix = 'App\\Models\\';
    if (strpos($class, $prefix) === 0) {
        $relative = substr($class, strlen('App\\'));
        $path = __DIR__ . '/../../app/' . str_replace('\\', '/', $relative) . '.php';
        if (file_exists($path)) {
            require_once $path;
        }
    }
});

$dsn = getenv('DB_DSN');
if (!$dsn) {
    fwrite(STDERR, "Please provide database connection info via DB_DSN, DB_USER, DB_PASSWORD environment variables.\n");
    exit(1);
}

DB::configure('default', [
    'dsn' => $dsn,
    'username' => getenv('DB_USER') ?: null,
    'password' => getenv('DB_PASSWORD') ?: null,
]);

$roles = [
    ['name' => 'admin', 'description' => 'System administrator'],
    ['name' => 'manager', 'description' => 'Operations manager'],
    ['name' => 'customer', 'description' => 'Regular customer'],
];

$permissions = [
    ['name' => 'manage_users', 'description' => 'Create and update users'],
    ['name' => 'manage_products', 'description' => 'Create and update products'],
    ['name' => 'manage_orders', 'description' => 'Process and update orders'],
    ['name' => 'view_reports', 'description' => 'View business reports'],
];

DB::transaction(function () use ($roles, $permissions) {
    foreach ($permissions as $permission) {
        $existing = Permission::where('name', $permission['name']);
        if (empty($existing)) {
            Permission::create($permission);
        }
    }

    foreach ($roles as $role) {
        $existing = Role::where('name', $role['name']);
        if (empty($existing)) {
            Role::create($role);
        }
    }
});

$adminRoleRow = DB::fetch('SELECT id FROM roles WHERE name = :name LIMIT 1', ['name' => 'admin']);
$managerRoleRow = DB::fetch('SELECT id FROM roles WHERE name = :name LIMIT 1', ['name' => 'manager']);
$customerRoleRow = DB::fetch('SELECT id FROM roles WHERE name = :name LIMIT 1', ['name' => 'customer']);

$adminRoleId = $adminRoleRow['id'] ?? null;
$managerRoleId = $managerRoleRow['id'] ?? null;
$customerRoleId = $customerRoleRow['id'] ?? null;

$permissionsList = DB::fetchAll('SELECT id, name FROM permissions');

if ($adminRoleId) {
    foreach ($permissionsList as $permission) {
        Role::grantPermission((int) $adminRoleId, (int) $permission['id']);
    }
}

if ($managerRoleId) {
    foreach ($permissionsList as $permission) {
        if ($permission['name'] !== 'manage_users') {
            Role::grantPermission((int) $managerRoleId, (int) $permission['id']);
        }
    }
}

if ($customerRoleId) {
    foreach ($permissionsList as $permission) {
        if (in_array($permission['name'], ['manage_orders', 'view_reports'], true)) {
            Role::grantPermission((int) $customerRoleId, (int) $permission['id']);
        }
    }
}

$adminEmail = getenv('ADMIN_EMAIL') ?: 'admin@example.com';
$adminPassword = getenv('ADMIN_PASSWORD') ?: 'password';
$adminName = getenv('ADMIN_NAME') ?: 'Administrator';

$existingAdmin = User::findByEmail($adminEmail);
if (!$existingAdmin) {
    $hash = password_hash($adminPassword, PASSWORD_BCRYPT);
    $admin = User::create([
        'name' => $adminName,
        'email' => $adminEmail,
        'password' => $hash,
        'status' => 'active',
    ]);
    if ($admin && $adminRoleId) {
        User::assignRole((int) $admin['id'], (int) $adminRoleId);
    }
} elseif ($adminRoleId) {
    User::assignRole((int) $existingAdmin['id'], (int) $adminRoleId);
}

echo "Seed completed successfully.\n";

