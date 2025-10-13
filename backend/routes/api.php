<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\BookController;
use App\Http\Controllers\CartController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\ReviewController;
use App\Http\Controllers\AdminUserController;

use App\Http\Middleware\CheckRole;

Route::post('/login', [AuthController::class, 'login'])->name('login');
Route::post('/register', [AuthController::class, 'register'])->name('register');

Route::prefix('books')->group(function () {
    Route::get('/', [BookController::class, 'index']);
    Route::get('/{id}', [BookController::class, 'show']);
});

Route::middleware(['auth:sanctum'])->group(function () {
    Route::prefix('user')->group(function () {
        Route::get('/profile', [UserController::class, 'profile']);
        Route::put('/profile', [UserController::class, 'updateProfile']);
        Route::post('/logout', [AuthController::class, 'logout']);
    });

    Route::prefix('cart')->group(function () {
        Route::get('/', [CartController::class, 'index']);
        Route::post('/', [CartController::class, 'store']);
        Route::delete('/clear', [CartController::class, 'clear']);
        Route::put('/{id}', [CartController::class, 'update']);
        Route::delete('/{id}', [CartController::class, 'destroy']);
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

Route::middleware(['auth:sanctum', CheckRole::class . ':admin'])
    ->prefix('admin')
    ->group(function () {
        Route::get('/users', [AdminUserController::class, 'index']);
        Route::patch('/users/{id}/toggle', [AdminUserController::class, 'toggleActive']);
        Route::patch('/users/{id}/make-admin', [AdminUserController::class, 'makeAdmin']);
        Route::delete('/users/{id}', [AdminUserController::class, 'destroy']);

        Route::prefix('books')->group(function () {
            Route::get('/', [BookController::class, 'index']);
            Route::post('/', [BookController::class, 'store']);
            Route::put('/{id}', [BookController::class, 'update']);
            Route::delete('/{id}', [BookController::class, 'destroy']);
        });

        Route::prefix('orders')->group(function () {
            Route::get('/', [OrderController::class, 'indexAdmin']);
            Route::put('/{id}', [OrderController::class, 'updateStatus']);
        });

        Route::get('/feedbacks', [ReviewController::class, 'adminIndex']);
    });
