<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Inmueble extends Model
{
    use HasFactory;

    /**
     * Tabla asociada al modelo.
     */
    protected $table = 'inmuebles';

    /**
     * Campos que pueden asignarse de forma masiva.
     */
    protected $fillable = [
        'user_id',
        'titulo',
        'descripcion',
        'precio',
        'tipo_vivienda',
        'habitaciones',
        'banos',
        'area',
        'direccion',
        'latitud',
        'longitud',
        'estado',
    ];

    /**
     * Conversión automática de tipos.
     */
    protected $casts = [
        'precio' => 'decimal:2',
        'area' => 'decimal:2',
        'habitaciones' => 'integer',
        'banos' => 'integer',
        'latitud' => 'decimal:7',
        'longitud' => 'decimal:7',
    ];

    /**
     * Un inmueble pertenece a un propietario.
     */
    public function propietario()
    {
        return $this->belongsTo(
            User::class,
            'user_id'
        );
    }

    /**
     * Un inmueble puede tener muchas imágenes.
     */
    public function imagenes()
    {
        return $this->hasMany(
            Imagen::class
        );
    }

    /**
     * Un inmueble puede tener muchas características.
     */
    public function caracteristicas()
    {
        return $this->belongsToMany(
            Caracteristica::class,
            'inmueble_caracteristica'
        );
    }

    /**
     * Un inmueble puede recibir muchos mensajes.
     */
    public function mensajes()
    {
        return $this->hasMany(
            Mensaje::class
        );
    }
}