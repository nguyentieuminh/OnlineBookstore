<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('books', function (Blueprint $table) {
            $table->id('BookID');
            $table->string('BookTitle');
            $table->string('Author')->nullable();
            $table->text('Describe')->nullable();
            $table->unsignedSmallInteger('YearOfPublication')->nullable();
            $table->unsignedInteger('Quantity')->default(0);
            $table->unsignedBigInteger('Price');
            $table->timestamps();

            $table->index('BookTitle');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('books');
    }
};