<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('carts', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('UserID')->nullable();
            $table->unsignedBigInteger('BookID');
            $table->integer('Quantity')->default(1);
            $table->timestamps();
            $table->foreign('UserID')->references('UserID')->on('users')->onDelete('cascade');
            $table->foreign('BookID')->references('BookID')->on('books')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('carts');
    }
};
