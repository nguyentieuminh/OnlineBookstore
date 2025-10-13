<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\Orders;
use App\Models\OrderItem;
use App\Models\OrderStatus;

class OrderController extends Controller
{
    public function index(Request $request)
    {
        $userId = $request->user()->UserID;

        $orders = Orders::with([
            'items.book.publisher',
            'items.book.categories',
            'status'
        ])
            ->where('user_id', $userId)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($orders, 200);
    }

    public function store(Request $request)
    {
        $request->validate([
            'items' => 'required|array|min:1',
            'items.*.book_id' => 'required|exists:books,BookID',
            'items.*.quantity' => 'required|integer|min:1',
            'address' => 'required|string|min:10',
            'shipping_fee' => 'nullable|numeric|min:0',
            'subtotal' => 'nullable|numeric|min:0',
            'total' => 'nullable|numeric|min:0',
            'recipient' => 'nullable|array',
            'payment_method' => 'nullable|string',
            'shipping_method' => 'nullable|string',
            'note' => 'nullable|string|max:500',
        ]);

        $userId = $request->user()->UserID;

        DB::beginTransaction();

        try {
            $subtotal = 0;
            foreach ($request->items as $it) {
                $book = DB::table('books')->where('BookID', $it['book_id'])->first();
                if ($book) $subtotal += $book->Price * $it['quantity'];
            }

            $shipping_fee = $request->input('shipping_fee', 5);
            $total = $request->input('total', $subtotal + $shipping_fee);

            $pendingStatus = OrderStatus::firstOrCreate(
                ['code' => 'pending'],
                [
                    'label' => 'Pending Confirmation',
                    'color' => '#6c757d',
                    'icon' => 'hourglass-split',
                    'order_number' => 1
                ]
            );

            $order = Orders::create([
                'user_id' => $userId,
                'subtotal' => $subtotal,
                'shipping_fee' => $shipping_fee,
                'total' => $total,
                'address' => $request->address,
                'recipient_info' => json_encode($request->input('recipient', [])),
                'payment_method' => $request->input('payment_method', 'cod'),
                'shipping_method' => $request->input('shipping_method', 'standard'),
                'note' => $request->input('note', ''),
                'status_id' => $pendingStatus->id,
            ]);

            foreach ($request->items as $it) {
                $book = DB::table('books')->where('BookID', $it['book_id'])->first();
                if (!$book) continue;

                OrderItem::create([
                    'order_id' => $order->id,
                    'book_id' => $it['book_id'],
                    'quantity' => $it['quantity'],
                    'price' => $book->Price,
                    'subtotal' => $book->Price * $it['quantity'],
                ]);
            }

            DB::commit();

            return response()->json([
                'message' => 'Đặt hàng thành công',
                'order' => $order->load('items.book.publisher', 'items.book.categories', 'status'),
            ], 201);
        } catch (\Throwable $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Lỗi khi đặt hàng',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function cancel($id)
    {
        $order = Orders::findOrFail($id);
        $cancelStatus = OrderStatus::where('code', 'cancelled')->first();
        $order->status_id = $cancelStatus->id;
        $order->save();

        return response()->json(['message' => "Đơn hàng $id đã bị hủy"], 200);
    }

    public function indexAdmin()
    {
        $orders = Orders::with(['items.book', 'status'])->orderBy('created_at', 'desc')->get();
        return response()->json($orders, 200);
    }

    public function updateStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|string'
        ]);

        $order = Orders::findOrFail($id);

        $newStatus = OrderStatus::where('label', $request->status)
            ->orWhere('code', $request->status)
            ->first();

        if (!$newStatus) {
            return response()->json(['message' => 'Invalid status value'], 400);
        }

        $order->status_id = $newStatus->id;
        $order->save();

        return response()->json(
            $order->load('status', 'items.book.publisher', 'items.book.categories'),
            200
        );
    }
}
