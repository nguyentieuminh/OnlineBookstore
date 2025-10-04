<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('order_items', function (Blueprint $table) {
    $table->id('Order_itemID');
    $table->unsignedBigInteger('OrderID');
    $table->unsignedBigInteger('BookID');
    $table->unsignedBigInteger('USERID');
    $table->unsignedInteger('Quantity');
    $table->timestamps();

    $table->foreign('OrderID')->references('OrderID')->on('orders')->cascadeOnDelete();
    $table->foreign('BookID')->references('BookID')->on('books')->restrictOnDelete();
    $table->foreign('USERID')->references('UserID')->on('users')->cascadeOnDelete();
});

    }

    public function down(): void
    {
        Schema::dropIfExists('order_items');
    }
};
