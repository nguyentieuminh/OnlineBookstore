<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Book extends Model
{
    use HasFactory;

    protected $primaryKey = 'BookID';

    protected $fillable = [
        'BookTitle',
        'Author',
        'Describe',
        'YearOfPublication',
        'Quantity',
        'Price',
        'PublisherID',
        'image',
    ];

    public function publisher()
    {
        return $this->belongsTo(Publisher::class, 'PublisherID', 'PublisherID');
    }

    public function categories()
    {
        return $this->belongsToMany(Category::class, 'book_category', 'BookID', 'CategoryID');
    }

    public function tags()
    {
        return $this->belongsToMany(Tag::class, 'book_tag', 'BookID', 'TagID');
    }

    public function scopeWithRelations($query)
    {
        return $query->with(['publisher', 'categories', 'tags']);
    }
}
