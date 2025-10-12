<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OrderStatus extends Model
{
    protected $table = 'order_statuses';
    protected $fillable = [
        'code',
        'label',
        'color',
        'icon',
        'order_number'
    ];

    public function orders()
    {
        return $this->hasMany(Orders::class, 'status_id', 'id');
    }
}
