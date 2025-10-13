<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $request->validate([
            'Email' => 'required|email',
            'Password' => 'required|string|min:6',
        ]);

        $user = User::where('Email', $request->Email)->first();

        if (!$user || !Hash::check($request->Password, $user->Password)) {
            return response()->json(['message' => 'Invalid credentials'], 401);
        }

        if (!$user->is_active) {
            return response()->json([
                'message' => 'Your account has been deactivated. Please contact the administrator.'
            ], 403);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Login successful',
            'token' => $token,
            'user' => $user,
        ]);
    }

    public function register(Request $request)
    {
        $request->validate([
            'Name' => 'required|string|max:255',
            'Email' => 'required|email|unique:users,Email',
            'Password' => 'required|string|min:6|confirmed',
            'DateOfBirth' => 'required|date',
        ]);

        $user = User::create([
            'Name' => $request->Name,
            'Email' => $request->Email,
            'Password' => bcrypt($request->Password),
            'DateOfBirth' => $request->DateOfBirth,
            'Role' => 'customer',
            'is_active' => true,
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'User registered successfully',
            'token' => $token,
            'user' => $user,
        ], 201);
    }
}
