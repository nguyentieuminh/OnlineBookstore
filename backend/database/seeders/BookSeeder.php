<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\File;
use App\Models\Book;
use App\Models\Category;
use App\Models\Tag;
use App\Models\Publisher;

class BookSeeder extends Seeder
{
    public function run()
    {
        $json = File::get(database_path('data/books.json'));
        $books = json_decode($json, true);
        foreach ($books as $bookData) {
            $publisher = null;
            
            if (!empty($bookData['publisher'])) {
                $publisher = Publisher::firstOrCreate(['PublisherName' => trim($bookData['publisher'])]);
            }

            $imagePath = null;
            
            if (!empty($bookData['image'])) {
                $imagePath = '/' . basename($bookData['image']);
            } else {
                $defaultImages = ['/default1.jpg', '/default2.jpg', '/default3.jpg',];
                $imagePath = $defaultImages[array_rand($defaultImages)];
            }

            $book = Book::create(['BookTitle' => $bookData['title'], 'Author' => $bookData['author'] ?? null, 'Describe' => $bookData['description'] ?? null, 'YearOfPublication' => rand(1990, 2025), 'Quantity' => rand(10, 100), 'Price' => $bookData['price'] ?? 0, 'PublisherID' => $publisher ? $publisher->PublisherID : null, 'image' => $imagePath,]);
            
            if (!empty($bookData['category']) && is_array($bookData['category'])) {
                $categoryIds = [];
                foreach ($bookData['category'] as $categoryName) {
                    $category = Category::firstOrCreate(['CategoryName' => trim($categoryName)]);
                    $categoryIds[] = $category->CategoryID;
                }
                $book->categories()->sync($categoryIds);
            }

            if (!empty($bookData['tags']) && is_array($bookData['tags'])) {
                $tagIds = [];
                foreach ($bookData['tags'] as $tagName) {
                    $tag = Tag::firstOrCreate(['TagName' => trim($tagName)]);
                    $tagIds[] = $tag->TagID;
                }
                $book->tags()->sync($tagIds);
            }
        }
    }
}
