<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    public function profile(Request $request)
    {
        $user = Auth::user();

        return response()->json([
            'name' => $user->Name,
            'email' => $user->Email,
            'phone' => $user->PhoneNumber,
            'gender' => $user->Gender,
            'dateOfBirth' => $user->DateOfBirth,
            'role' => $user->Role,
        ]);
    }

    public function updateProfile(Request $request)
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();

        $validated = $request->validate([
            'Name'           => 'sometimes|string|max:255',
            'Email'          => [
                'sometimes',
                'email',
                'max:255',
                Rule::unique('users', 'Email')->ignore($user->UserID, 'UserID'),
            ],
            'PhoneNumber'    => 'nullable|string|max:20',
            'Gender'         => 'nullable|in:male,female,other',
            'DateOfBirth'    => 'nullable|date',

            'currentPassword' => 'nullable|string',
            'newPassword'     => 'nullable|string|min:8',
            'confirmPassword' => 'nullable|string|same:newPassword',
        ]);

        if (!empty($validated['currentPassword']) || !empty($validated['newPassword'])) {
            if (empty($validated['currentPassword']) || !Hash::check($validated['currentPassword'], $user->Password)) {
                return response()->json(['error' => 'Current password is incorrect'], 422);
            }

            if (empty($validated['newPassword'])) {
                return response()->json(['error' => 'New password is required'], 422);
            }

            $user->Password = Hash::make($validated['newPassword']);
        }

        $user->fill($request->only([
            'Name',
            'Email',
            'PhoneNumber',
            'Gender',
            'DateOfBirth',
        ]));

        $user->save();

        return response()->json($user);
    }
}
