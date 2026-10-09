<?php

namespace App\Enums;

enum UserRole: string
{
    case ADMIN = 'admin';
    case SALES = 'sales';

    public function label(): string
    {
        return match ($this) {
            self::ADMIN => 'Admin',
            self::SALES => 'Sales',
        };
    }

    public function isAdmin(): bool
    {
        return $this === self::ADMIN;
    }

    /**
     * @return array<int, string>
     */
    public static function values(): array
    {
        return array_map(fn (self $role) => $role->value, self::cases());
    }
}
