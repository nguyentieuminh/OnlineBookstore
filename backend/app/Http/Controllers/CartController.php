<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Cart;

class CartController extends Controller
{
    public function index(Request $request)
    {
        try {
            $userId = $request->user()->UserID ?? 1;

            $cartItems = Cart::with([
                'book.publisher',
                'book.categories',
                'book.tags'
            ])->ofUser($userId)->get();

            return response()->json([
                'status' => true,
                'data' => $cartItems
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'status' => false,
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'BookID'  => 'required|integer|exists:books,BookID',
            'Quantity' => 'required|integer|min:1',
        ]);

        $userId = $request->user()->UserID ?? 1;

        $existing = Cart::ofUser($userId)
            ->where('BookID', $validated['BookID'])
            ->first();

        if ($existing) {
            $existing->Quantity += $validated['Quantity'];
            $existing->save();
            return response()->json(
                $existing->load(['book.publisher', 'book.categories', 'book.tags']),
                200
            );
        }

        $cartItem = Cart::create([
            'UserID'  => $userId,
            'BookID'  => $validated['BookID'],
            'Quantity' => $validated['Quantity'],
        ]);

        return response()->json(
            $cartItem->load(['book.publisher', 'book.categories', 'book.tags']),
            201
        );
    }

    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'Quantity' => 'required|integer|min:1',
        ]);

        $userId = $request->user()->UserID ?? 1;

        $cartItem = Cart::ofUser($userId)->where('id', $id)->firstOrFail();
        $cartItem->Quantity = $validated['Quantity'];
        $cartItem->save();

        return response()->json(
            $cartItem->load(['book.publisher', 'book.categories', 'book.tags'])
        );
    }

    public function destroy(Request $request, $id)
    {
        $userId = $request->user()->UserID ?? 1;

        $cartItem = Cart::ofUser($userId)->where('id', $id)->firstOrFail();
        $cartItem->delete();

        return response()->json(['message' => 'Item removed']);
    }

    public function clear(Request $request)
    {
        $userId = $request->user()->UserID ?? 1;
        Cart::ofUser($userId)->delete();
        return response()->json(['message' => 'Cart cleared']);
    }
}
