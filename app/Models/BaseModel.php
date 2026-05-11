<?php

namespace App\Models;

use App\Core\DB;
use RuntimeException;

abstract class BaseModel
{
    protected static string $table;
    protected static string $primaryKey = 'id';

    /**
     * @var string[]
     */
    protected static array $fillable = [];

    public static function all(): array
    {
        return DB::fetchAll('SELECT * FROM ' . static::$table);
    }

    public static function find(int $id): ?array
    {
        $sql = 'SELECT * FROM ' . static::$table . ' WHERE ' . static::$primaryKey . ' = :id LIMIT 1';

        return DB::fetch($sql, ['id' => $id]);
    }

    public static function create(array $attributes): array
    {
        $data = static::filterFillable($attributes);
        if (empty($data)) {
            throw new RuntimeException('No fillable attributes provided for create operation.');
        }

        $columns = array_keys($data);
        $placeholders = array_map(static fn(string $column): string => ':' . $column, $columns);

        $sql = sprintf(
            'INSERT INTO %s (%s) VALUES (%s)',
            static::$table,
            implode(', ', $columns),
            implode(', ', $placeholders)
        );

        $pdo = DB::connection();
        $statement = $pdo->prepare($sql);
        $statement->execute($data);

        $id = (int) $pdo->lastInsertId();

        return static::find($id) ?? [];
    }

    public static function update(int $id, array $attributes): ?array
    {
        $data = static::filterFillable($attributes);
        if (empty($data)) {
            return static::find($id);
        }

        $assignments = [];
        foreach ($data as $column => $value) {
            $assignments[] = $column . ' = :' . $column;
        }

        $data[static::$primaryKey] = $id;

        $sql = sprintf(
            'UPDATE %s SET %s WHERE %s = :%s',
            static::$table,
            implode(', ', $assignments),
            static::$primaryKey,
            static::$primaryKey
        );

        DB::execute($sql, $data);

        return static::find($id);
    }

    public static function delete(int $id): bool
    {
        $sql = 'DELETE FROM ' . static::$table . ' WHERE ' . static::$primaryKey . ' = :id';

        return DB::execute($sql, ['id' => $id]) > 0;
    }

    public static function where(string $column, $value): array
    {
        $sql = 'SELECT * FROM ' . static::$table . ' WHERE ' . $column . ' = :value';

        return DB::fetchAll($sql, ['value' => $value]);
    }

    protected static function filterFillable(array $attributes): array
    {
        if (empty(static::$fillable)) {
            return $attributes;
        }

        return array_intersect_key($attributes, array_flip(static::$fillable));
    }
}

