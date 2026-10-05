<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Mensaje extends Model
{
    use HasFactory;

    protected $table = 'mensajes';

    protected $fillable = [
        'inmueble_id',
        'inquilino_id',
        'propietario_id',
        'mensaje',
        'whatsapp',
        'estado',
    ];

    public function inmueble()
    {
        return $this->belongsTo(Inmueble::class);
    }

    public function inquilino()
    {
        return $this->belongsTo(
            User::class,
            'inquilino_id'
        );
    }

    public function propietario()
    {
        return $this->belongsTo(
            User::class,
            'propietario_id'
        );
    }
}