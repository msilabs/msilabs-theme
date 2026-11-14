<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Collection;

/**
 * Builds a greeting for a user.
 *
 * @param  User  $user
 */
class Greeter
{
    public const PREFIX = 'Hello';

    private array $names = [];

    public function __construct(private readonly string $locale = 'bn')
    {
    }

    // Line comment
    public function greet(User $user, int $times = 1): string
    {
        $this->names[] = $user->name;

        if (isset($user->email) && $times > 0) {
            echo self::PREFIX . ", {$user->name}\n";
        }

        return <<<TEXT
        Welcome, {$user->name}!
        Visits: {$times}
        TEXT;
    }

    public static function make(): static
    {
        return new static();
    }
}
