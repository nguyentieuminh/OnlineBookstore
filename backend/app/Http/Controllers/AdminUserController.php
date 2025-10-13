<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;

class AdminUserController extends Controller
{
    public function index()
    {
        $users = User::query()
            ->select(
                'UserID as id',
                'Name',
                'Email',
                'PhoneNumber',
                'Role',
                'is_active',
                'created_at',
                'updated_at'
            )
            ->get();

        return response()->json(['data' => $users]);
    }

    public function toggleActive($id)
    {
        $user = User::find($id);
        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }

        if ($user->Role === 'admin') {
            return response()->json(['message' => 'Cannot deactivate admin accounts'], 403);
        }

        $user->is_active = !$user->is_active;
        $user->save();

        if (!$user->is_active) {
            $user->tokens()->delete();
        }

        return response()->json([
            'message' => 'User status updated successfully',
            'data' => $user
        ]);
    }

    public function destroy($id)
    {
        $user = User::find($id);
        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }

        $user->delete();
        return response()->json(['message' => 'User deleted successfully']);
    }

    public function makeAdmin($id)
    {
        $user = User::find($id);

        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }

        if ($user->Role === 'admin') {
            return response()->json(['message' => 'This user is already an admin'], 400);
        }

        $currentAdmin = User::where('Role', 'admin')->first();

        if ($currentAdmin) {
            $currentAdmin->Role = 'customer';
            $currentAdmin->save();

            $currentAdmin->tokens()->delete();
        }

        $user->Role = 'admin';

        if (!$user->is_active) {
            $user->is_active = true;
        }

        $user->save();

        return response()->json([
            'message' => 'User has been promoted to admin. Previous admin has been demoted and logged out.',
            'data' => $user
        ]);
    }
}
