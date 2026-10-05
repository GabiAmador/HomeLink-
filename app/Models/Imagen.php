<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Imagen extends Model
{
    use HasFactory;

    protected $table = 'imagenes';

    protected $fillable = [
        'inmueble_id',
        'url_imagen',
        'es_principal',
    ];

    public function inmueble()
    {
        return $this->belongsTo(Inmueble::class);
    }
}