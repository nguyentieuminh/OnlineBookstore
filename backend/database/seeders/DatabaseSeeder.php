<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Book;
use App\Models\OrderStatus;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            UserSeeder::class,
            BookSeeder::class,
            OrderStatusSeeder::class
        ]);
    }
}
