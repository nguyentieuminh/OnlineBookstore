<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Cart extends Model
{
    use HasFactory;

    protected $table = 'carts';
    protected $fillable = ['UserID', 'BookID', 'Quantity'];

    public function user()
    {
        return $this->belongsTo(User::class, 'UserID');
    }

    public function book()
    {
        return $this->belongsTo(Book::class, 'BookID');
    }

    public function getSubtotalAttribute()
    {
        return ($this->book->Price ?? 0) * $this->Quantity;
    }

    public function scopeOfUser($query, $userId)
    {
        return $query->where('UserID', $userId);
    }
}
