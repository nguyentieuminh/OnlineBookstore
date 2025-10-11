<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class OrderController extends Controller
{
    public function index(Request $request)
    {
        return response()->json(['message' => 'Danh sách đơn hàng'], 200);
    }

    public function store(Request $request)
    {
        return response()->json(['message' => 'Đặt hàng thành công'], 201);
    }

    public function cancel($id)
    {
        return response()->json(['message' => "Đơn hàng $id đã bị hủy"], 200);
    }
}
