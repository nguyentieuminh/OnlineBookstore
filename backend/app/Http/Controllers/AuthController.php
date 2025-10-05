<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Hash;
use App\Models\User;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $credentials = $request->only('Email', 'Password');
        $user = User::where('Email', $credentials['Email'])->first();

        if (!$user || !Hash::check($credentials['Password'], $user->Password)) {
            return response()->json(['message' => 'Invalid credentials'], 401);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'token' => $token,
            'user' => [
                'UserID' => $user->UserID,
                'Name' => $user->Name,
                'Email' => $user->Email,
                'Role' => $user->Role,
            ]
        ]);
    }

    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'Name' => 'required|string|max:255',
            'Email' => 'required|email|unique:users,Email',
            'Password' => 'required|string|min:6',
            'DateOfBirth' => 'nullable|date',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation errors',
                'errors' => $validator->errors()
            ], 422);
        }

        $user = User::create([
            'Name' => $request->Name,
            'Email' => $request->Email,
            'Password' => Hash::make($request->Password),
            'DateOfBirth' => $request->DateOfBirth,
            'Role' => 'customer',
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'User registered successfully',
            'token' => $token,
            'user' => [
                'UserID' => $user->UserID,
                'Name' => $user->Name,
                'Email' => $user->Email,
                'Role' => $user->Role,
            ]
        ], 201);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Logged out successfully']);
    }
}
