<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\OrderStatus;

class OrderStatusSeeder extends Seeder
{
    public function run(): void
    {
        $statuses = [
            [
                'code' => 'pending',
                'label' => 'Pending Confirmation',
                'color' => '#6c757d',
                'icon' => 'hourglass-split',
                'order_number' => 1,
            ],
            [
                'code' => 'processing',
                'label' => 'Processing',
                'color' => '#0d6efd',
                'icon' => 'gear',
                'order_number' => 2,
            ],
            [
                'code' => 'delivering',
                'label' => 'Out for Delivery',
                'color' => '#f59e0b',
                'icon' => 'truck',
                'order_number' => 3,
            ],
            [
                'code' => 'delivered',
                'label' => 'Delivered',
                'color' => '#10b981',
                'icon' => 'check-circle',
                'order_number' => 4,
            ],
            [
                'code' => 'cancelled',
                'label' => 'Cancelled',
                'color' => '#ef4444',
                'icon' => 'x-circle',
                'order_number' => 5,
            ],
        ];

        foreach ($statuses as $status) {
            OrderStatus::updateOrCreate(
                ['code' => $status['code']],
                $status
            );
        }

        $this->command->info('Order statuses seeded successfully!');
    }
}
