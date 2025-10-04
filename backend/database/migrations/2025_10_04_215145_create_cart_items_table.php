<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('cart_items', function (Blueprint $table) {
            $table->id('CartItemID');
            $table->unsignedBigInteger('CartID');
            $table->unsignedBigInteger('BookID');
            $table->integer('Quantity')->default(1);
            $table->timestamps();
            $table->foreign('CartID')->references('CartID')->on('carts')->cascadeOnDelete();
            $table->foreign('BookID')->references('BookID')->on('books')->restrictOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cart_items');
    }
};
