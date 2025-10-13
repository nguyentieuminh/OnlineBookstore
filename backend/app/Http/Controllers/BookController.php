<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Book;
use App\Models\Category;
use App\Models\Tag;
use App\Models\Publisher;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

class BookController extends Controller
{
    public function index()
    {
        $books = Book::withRelations()->get()->map(function ($book) {
            $book->image = $book->image ?: '/default-book.jpg';
            return $book;
        });

        return response()->json([
            'status' => true,
            'data' => $books
        ]);
    }

    public function show($id)
    {
        $book = Book::withRelations()->find($id);

        if (!$book) {
            return response()->json(['status' => false, 'message' => 'Book not found'], 404);
        }

        $book->image = $book->image ?: '/default-book.jpg';

        return response()->json(['status' => true, 'data' => $book]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'BookTitle' => 'required|string|max:255',
            'Author' => 'nullable|string|max:255',
            'Describe' => 'nullable|string',
            'YearOfPublication' => 'nullable|integer|min:0',
            'Quantity' => 'nullable|integer|min:0',
            'Price' => 'required|integer|min:0',
            'Publisher' => 'nullable|string',
            'Categories' => 'array',
            'Tags' => 'array',
            'image' => 'nullable|string|max:255',
        ]);

        $publisher = null;
        if (!empty($validated['Publisher'])) {
            $publisher = Publisher::firstOrCreate([
                'PublisherName' => trim($validated['Publisher'])
            ]);
        }

        $book = new Book($validated);
        if ($publisher) $book->PublisherID = $publisher->PublisherID;

        $book->save();

        if (!empty($validated['Categories'])) {
            $categoryIds = [];
            foreach ($validated['Categories'] as $catName) {
                $category = Category::firstOrCreate([
                    'CategoryName' => trim($catName)
                ]);
                $categoryIds[] = $category->CategoryID;
            }
            $book->categories()->sync($categoryIds);
        }

        if (!empty($validated['Tags'])) {
            $tagIds = [];
            foreach ($validated['Tags'] as $tagName) {
                $tag = Tag::firstOrCreate([
                    'TagName' => trim($tagName)
                ]);
                $tagIds[] = $tag->TagID;
            }
            $book->tags()->sync($tagIds);
        }

        $book->load('publisher', 'categories', 'tags');

        $book->image = $book->image ?: '/default-book.jpg';

        return response()->json([
            'status' => true,
            'message' => 'Book created successfully',
            'data' => $book
        ]);
    }

    public function update(Request $request, $id)
    {
        $book = Book::find($id);
        if (!$book) {
            return response()->json(['status' => false, 'message' => 'Book not found'], 404);
        }

        $validated = $request->validate([
            'BookTitle' => 'sometimes|string|max:255',
            'Author' => 'nullable|string|max:255',
            'Describe' => 'nullable|string',
            'YearOfPublication' => 'nullable|integer|min:0',
            'Quantity' => 'nullable|integer|min:0',
            'Price' => 'sometimes|integer|min:0',
            'Publisher' => 'nullable|string',
            'Categories' => 'array',
            'Tags' => 'array',
            'image' => 'nullable|string|max:255',
        ]);

        if (!empty($validated['Publisher'])) {
            $publisher = Publisher::firstOrCreate([
                'PublisherName' => trim($validated['Publisher'])
            ]);
            $book->PublisherID = $publisher->PublisherID;
        }

        $book->update($validated);

        if (!empty($validated['Categories'])) {
            $categoryIds = [];
            foreach ($validated['Categories'] as $catName) {
                $category = Category::firstOrCreate([
                    'CategoryName' => trim($catName)
                ]);
                $categoryIds[] = $category->CategoryID;
            }
            $book->categories()->sync($categoryIds);
        }

        if (!empty($validated['Tags'])) {
            $tagIds = [];
            foreach ($validated['Tags'] as $tagName) {
                $tag = Tag::firstOrCreate([
                    'TagName' => trim($tagName)
                ]);
                $tagIds[] = $tag->TagID;
            }
            $book->tags()->sync($tagIds);
        }

        $book->load('publisher', 'categories', 'tags');

        $book->image = $book->image ?: '/default-book.jpg';

        return response()->json([
            'status' => true,
            'message' => 'Book updated successfully',
            'data' => $book
        ]);
    }

    public function destroy($id)
    {
        try {
            $book = Book::with(['categories', 'tags'])->find($id);

            if (!$book) {
                return response()->json([
                    'status' => false,
                    'message' => 'Book not found'
                ], 404);
            }

            $book->categories()->detach();
            $book->tags()->detach();

            if (Schema::hasTable('cart_items')) {
                $column = Schema::hasColumn('cart_items', 'BookID') ? 'BookID' : 'book_id';
                DB::table('cart_items')->where($column, $id)->delete();
            }
            if (Schema::hasTable('carts')) {
                $column = Schema::hasColumn('carts', 'BookID') ? 'BookID' : 'book_id';
                DB::table('carts')->where($column, $id)->delete();
            }

            if (Schema::hasTable('order_items')) {
                $column = Schema::hasColumn('order_items', 'BookID') ? 'BookID' : 'book_id';
                DB::table('order_items')->where($column, $id)->delete();
            }

            if (Schema::hasTable('reviews')) {
                $column = Schema::hasColumn('reviews', 'BookID') ? 'BookID' : 'book_id';
                DB::table('reviews')->where($column, $id)->delete();
            }

            $book->delete();

            return response()->json([
                'status' => true,
                'message' => 'Book deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Failed to delete book',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
