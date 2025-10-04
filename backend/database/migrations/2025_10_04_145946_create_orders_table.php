<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->id('OrderID');
            $table->unsignedBigInteger('USERID'); // FK -> users
            $table->timestamp('OrderDate')->useCurrent();
            $table->unsignedBigInteger('Total');
            $table->string('Address');
            $table->timestamps();

            $table->foreign('USERID')
                  ->references('UserID')
                  ->on('users')
                  ->cascadeOnUpdate()
                  ->restrictOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};