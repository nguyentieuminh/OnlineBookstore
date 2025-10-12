<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\BookController;
use App\Http\Controllers\CartController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\ReviewController;

Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);

Route::prefix('books')->group(function () {
    Route::get('/', [BookController::class, 'index']);
    Route::get('/{id}', [BookController::class, 'show']);
});

Route::middleware('auth:sanctum')->group(function () {

    Route::get('/user/profile', [UserController::class, 'profile']);
    Route::put('/user/profile', [UserController::class, 'updateProfile']);
    Route::post('/logout', [AuthController::class, 'logout']);

    Route::prefix('cart')->group(function () {
        Route::get('/', [CartController::class, 'index']);
        Route::post('/add', [CartController::class, 'store']);
        Route::put('/update/{id}', [CartController::class, 'update']);
        Route::delete('/remove/{id}', [CartController::class, 'destroy']);
        Route::delete('/clear', [CartController::class, 'clear']);
    });

    Route::prefix('orders')->group(function () {
        Route::get('/', [OrderController::class, 'index']);
        Route::post('/', [OrderController::class, 'store']);
        Route::post('/{id}/cancel', [OrderController::class, 'cancel']);
    });

    Route::prefix('books')->group(function () {
        Route::get('/{bookId}/reviews', [ReviewController::class, 'index']);
        Route::post('/{bookId}/reviews', [ReviewController::class, 'store']);
    });
    Route::delete('/reviews/{id}', [ReviewController::class, 'destroy']);
});

Route::middleware(['auth:sanctum', 'admin'])->prefix('admin/books')->group(function () {
    Route::post('/', [BookController::class, 'store']);
    Route::put('/{id}', [BookController::class, 'update']);
    Route::delete('/{id}', [BookController::class, 'destroy']);
});
