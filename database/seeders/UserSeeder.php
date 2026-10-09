<?php

namespace Database\Seeders;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        User::updateOrCreate(
            ['email' => 'admin@formpo.test'],
            [
                'name' => 'Administrator',
                'password' => Hash::make('password'),
                'role' => UserRole::ADMIN,
                'is_active' => true,
                'email_verified_at' => now(),
            ],
        );

        User::updateOrCreate(
            ['email' => 'sales@formpo.test'],
            [
                'name' => 'Andi Sales',
                'password' => Hash::make('password'),
                'role' => UserRole::SALES,
                'is_active' => true,
                'branch' => 'KTN',
                'subbranch' => 'Ketapang',
                'email_verified_at' => now(),
            ],
        );

        $sales = [
            ['name' => 'Budi Santoso', 'branch' => 'BKS', 'subbranch' => 'Bekasi'],
            ['name' => 'Citra Dewi', 'branch' => 'RCG', 'subbranch' => 'Cirebon'],
            ['name' => 'Dian Pratama', 'branch' => 'KTN', 'subbranch' => 'Ketapang'],
        ];

        foreach ($sales as $sale) {
            User::factory()->sales()->create([
                'name' => $sale['name'],
                'password' => Hash::make('password'),
                'branch' => $sale['branch'],
                'subbranch' => $sale['subbranch'],
            ]);
        }
    }
}
