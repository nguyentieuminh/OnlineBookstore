<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

/**
 * @mixin IdeHelperUser
 */

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $primaryKey = 'UserID';
    public $incrementing = true;

    protected $fillable = [
        'Name',
        'Email',
        'Password',
        'PhoneNumber',
        'Gender',
        'DateOfBirth',
        'Role',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];
}
