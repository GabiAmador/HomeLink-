<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Favorito extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'inmueble_id',
    ];

    public function usuario()
    {
        return $this->belongsTo(
            User::class,
            'user_id'
        );
    }

    public function inmueble()
    {
        return $this->belongsTo(
            Inmueble::class
        );
    }
}