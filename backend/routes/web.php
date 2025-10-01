<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
<<<<<<< HEAD
    return view('welcome');
=======
    return response()->json([
        'message' => 'Laravel API is running!!!'
    ]);
>>>>>>> 95bc5cffdc55b0420a378b5c9587aa919696870f
});
