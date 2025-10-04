<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('book_category', function (Illuminate\Database\Schema\Blueprint $table) {
            $table->unsignedBigInteger('BookID');
            $table->unsignedBigInteger('CategoryID');

            $table->foreign('BookID')->references('BookID')->on('books')->cascadeOnDelete();
            $table->foreign('CategoryID')->references('CategoryID')->on('categories')->cascadeOnDelete();

            $table->unique(['BookID', 'CategoryID']);
        });
    }
    public function down(): void
    {
        Schema::dropIfExists('book_category');
    }

};
