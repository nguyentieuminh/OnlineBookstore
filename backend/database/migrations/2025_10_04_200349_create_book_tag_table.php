<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('book_tag', function (Blueprint $table) {
            $table->unsignedBigInteger('BookID');
            $table->unsignedBigInteger('TagID');

            $table->foreign('BookID')->references('BookID')->on('books')->cascadeOnDelete();
            $table->foreign('TagID')->references('TagID')->on('tags')->cascadeOnDelete();

            $table->unique(['BookID', 'TagID']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('book_tag');
    }
};
