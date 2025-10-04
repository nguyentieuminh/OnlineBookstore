<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;


class UserSeeder extends Seeder
{

    public function run(): void
    {
        User::create([
            'Name' => 'admin',
            'Email' => 'admin@example.com',
            'Password' => Hash::make('admin1234'),
            'PhoneNumber' => '0000000000',
            'Gender' => 'other',
            'DateOfBirth' => '2000-01-01',
            'Role' => 'admin'
        ]);

        User::create([
            'Name' => 'user',
            'Email' => 'user@example.com',
            'Password' => bcrypt('user1234'),
            'PhoneNumber' => '1111111111',
            'Gender' => 'other',
            'DateOfBirth' => '2000-01-01',
            'Role' => 'user'
        ]);
    }
}
