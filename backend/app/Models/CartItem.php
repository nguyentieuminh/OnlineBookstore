<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CartItem extends Model
{
    protected $primaryKey = 'CartItemID';
    protected $fillable = ['CartID', 'BookID', 'Quantity'];

    public function book()
    {
        return $this->belongsTo(Book::class, 'BookID');
    }
}
