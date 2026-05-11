<?php

namespace App\Core;

use PDO;
use PDOException;
use RuntimeException;

/**
 * Simple PDO connection manager with minimal pooling and helper utilities.
 */
class DB
{
    /**
     * @var array<string, PDO>
     */
    private static array $pool = [];

    /**
     * @var array<string, array{dsn:string, username:?string, password:?string, options:array}>
     */
    private static array $configurations = [];

    /**
     * Register a configuration for a connection name.
     *
     * Example:
     * DB::configure('default', [
     *     'dsn' => 'mysql:host=localhost;dbname=botan;charset=utf8mb4',
     *     'username' => 'root',
     *     'password' => 'secret',
     *     'options' => [
     *         PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
     *     ],
     * ]);
     */
    public static function configure(string $name, array $config): void
    {
        if (empty($config['dsn'])) {
            throw new RuntimeException('Database configuration requires a DSN.');
        }

        self::$configurations[$name] = [
            'dsn' => $config['dsn'],
            'username' => $config['username'] ?? null,
            'password' => $config['password'] ?? null,
            'options' => $config['options'] ?? [],
        ];

        if (isset(self::$pool[$name])) {
            // Reset stale connections so the next call creates a new PDO instance
            unset(self::$pool[$name]);
        }
    }

    /**
     * Retrieve a PDO connection from the pool or establish a new one.
     */
    public static function connection(string $name = 'default'): PDO
    {
        if (isset(self::$pool[$name])) {
            return self::$pool[$name];
        }

        $config = self::$configurations[$name] ?? self::configurationFromEnv($name);

        try {
            $pdo = new PDO(
                $config['dsn'],
                $config['username'] ?? null,
                $config['password'] ?? null,
                $config['options'] + [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::ATTR_EMULATE_PREPARES => false,
                ]
            );
        } catch (PDOException $exception) {
            throw new RuntimeException('Unable to connect to the database: ' . $exception->getMessage(), 0, $exception);
        }

        self::$pool[$name] = $pdo;

        return $pdo;
    }

    /**
     * Execute a prepared statement with optional bindings.
     */
    public static function query(string $sql, array $bindings = [], string $connection = 'default'): \PDOStatement
    {
        $pdo = self::connection($connection);
        $statement = $pdo->prepare($sql);
        $statement->execute($bindings);

        return $statement;
    }

    /**
     * Convenience helper to fetch all rows from a query.
     *
     * @return array<int, array<string, mixed>>
     */
    public static function fetchAll(string $sql, array $bindings = [], string $connection = 'default'): array
    {
        return self::query($sql, $bindings, $connection)->fetchAll();
    }

    /**
     * Fetch the first row (or null when none are found).
     *
     * @return array<string, mixed>|null
     */
    public static function fetch(string $sql, array $bindings = [], string $connection = 'default'): ?array
    {
        $result = self::query($sql, $bindings, $connection)->fetch();

        return $result === false ? null : $result;
    }

    /**
     * Execute a statement that does not return rows (INSERT/UPDATE/DELETE).
     */
    public static function execute(string $sql, array $bindings = [], string $connection = 'default'): int
    {
        return self::query($sql, $bindings, $connection)->rowCount();
    }

    /**
     * Run the given callable within a transaction.
     *
     * @template T
     * @param callable():T $callback
     * @return T
     */
    public static function transaction(callable $callback, string $connection = 'default')
    {
        $pdo = self::connection($connection);
        $pdo->beginTransaction();

        try {
            $result = $callback($pdo);
            $pdo->commit();

            return $result;
        } catch (\Throwable $throwable) {
            if ($pdo->inTransaction()) {
                $pdo->rollBack();
            }

            throw $throwable;
        }
    }

    /**
     * Build configuration from environment variables.
     */
    private static function configurationFromEnv(string $name): array
    {
        $prefix = strtoupper($name);
        $dsn = getenv("{$prefix}_DB_DSN") ?: getenv('DB_DSN');

        if (!$dsn) {
            throw new RuntimeException("No configuration found for connection '{$name}'.");
        }

        return [
            'dsn' => $dsn,
            'username' => getenv("{$prefix}_DB_USER") ?: getenv('DB_USER') ?: null,
            'password' => getenv("{$prefix}_DB_PASSWORD") ?: getenv('DB_PASSWORD') ?: null,
            'options' => [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
            ],
        ];
    }
}

