<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Caracteristica extends Model
{
    use HasFactory;

    // Nombre de la tabla en MySQL
    protected $table = 'caracteristicas';

    protected $fillable = [
        'nombre',
    ];

    // Una característica puede pertenecer a muchos inmuebles
    public function inmuebles()
    {
        return $this->belongsToMany(
            Inmueble::class,
            'inmueble_caracteristica'
        );
    }
}