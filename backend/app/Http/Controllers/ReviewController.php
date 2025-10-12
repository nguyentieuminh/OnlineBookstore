<?php

namespace App\Http\Controllers;

use App\Models\Review;
use App\Models\Book;
use Illuminate\Http\Request;

class ReviewController extends Controller
{
    public function index($bookId)
    {
        $reviews = Review::with('user')
            ->where('book_id', $bookId)
            ->orderBy('created_at', 'desc')
            ->get();

        $average = Review::where('book_id', $bookId)->avg('rating');

        return response()->json([
            'status' => true,
            'average_rating' => round($average, 1),
            'total_reviews' => $reviews->count(),
            'data' => $reviews
        ], 200);
    }

    public function store(Request $request, $bookId)
    {
        $request->validate([
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'nullable|string|max:1000'
        ]);

        $userId = $request->user()->UserID;

        $review = Review::updateOrCreate(
            ['book_id' => $bookId, 'user_id' => $userId],
            ['rating' => $request->rating, 'comment' => $request->comment]
        );

        return response()->json([
            'status' => true,
            'data' => $review->load('user')
        ], 200);
    }

    public function destroy($id, Request $request)
    {
        $review = Review::findOrFail($id);
        $user = $request->user();

        if ($review->user_id !== $user->UserID) {
            return response()->json(['status' => false, 'message' => 'Unauthorized'], 403);
        }

        $review->delete();
        return response()->json(['status' => true, 'message' => 'Review deleted']);
    }
}
