<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('users', function (Blueprint $table) {
            $table->id('UserID'); // Khóa chính
            $table->string('Name');
            $table->string('Email')->unique();
            $table->timestamp('email_verified_at')->nullable();
            $table->string('Password');
            $table->string('PhoneNumber', 20)->nullable();
            $table->enum('Gender', ['male','female','other'])->nullable();
            $table->date('DateOfBirth')->nullable();
            $table->string('Role')->default('customer'); 
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('users');
    }
};
