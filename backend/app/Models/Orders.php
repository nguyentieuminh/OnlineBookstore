<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Orders extends Model
{
    protected $table = 'orders';
    protected $primaryKey = 'id';
    protected $fillable = [
        'user_id',
        'address',
        'recipient_info',
        'payment_method',
        'shipping_method',
        'note',
        'subtotal',
        'shipping_fee',
        'total',
        'status_id',
    ];

    public function items()
    {
        return $this->hasMany(OrderItem::class, 'order_id', 'id');
    }

    public function status()
    {
        return $this->belongsTo(OrderStatus::class, 'status_id', 'id');
    }

    public function publisher()
    {
        return $this->belongsTo(Publisher::class, 'PublisherID', 'PublisherID');
    }

    public function categories()
    {
        return $this->belongsToMany(Category::class, 'book_categories', 'BookID', 'CategoryID');
    }
}
