<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Category extends Model
{
    use HasFactory;

    protected $primaryKey = 'CategoryID';

    protected $fillable = ['CategoryName', 'Describe'];

    public function books()
    {
        return $this->belongsToMany(Book::class, 'book_category', 'CategoryID', 'BookID');
    }
}
