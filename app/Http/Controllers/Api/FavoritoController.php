<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Favorito;
use App\Models\Inmueble;
use Illuminate\Http\Request;

class FavoritoController extends Controller
{
    /*
    |--------------------------------------------------------------------------
    | LISTAR FAVORITOS
    |--------------------------------------------------------------------------
    */

    public function index(Request $request)
    {
        $favoritos = Favorito::with([
            'inmueble.imagenes',
            'inmueble.propietario',
        ])
            ->where('user_id', $request->user()->id)
            ->latest()
            ->get();

        return response()->json($favoritos);
    }


    /*
    |--------------------------------------------------------------------------
    | GUARDAR FAVORITO
    |--------------------------------------------------------------------------
    */

    public function store(
        Request $request,
        Inmueble $inmueble
    ) {
        $favorito = Favorito::firstOrCreate([
            'user_id' => $request->user()->id,
            'inmueble_id' => $inmueble->id,
        ]);

        $favorito->load([
            'inmueble.imagenes',
            'inmueble.propietario',
        ]);

        return response()->json([
            'mensaje' =>
                'Propiedad guardada en favoritos.',
            'favorito' => $favorito,
        ], 201);
    }


    /*
    |--------------------------------------------------------------------------
    | QUITAR FAVORITO
    |--------------------------------------------------------------------------
    */

    public function destroy(
        Request $request,
        Inmueble $inmueble
    ) {
        $favorito = Favorito::where(
            'user_id',
            $request->user()->id
        )
            ->where(
                'inmueble_id',
                $inmueble->id
            )
            ->first();

        if (!$favorito) {
            return response()->json([
                'mensaje' =>
                    'Esta propiedad no está en tus favoritos.',
            ], 404);
        }

        $favorito->delete();

        return response()->json([
            'mensaje' =>
                'Propiedad eliminada de favoritos.',
        ]);
    }


    /*
    |--------------------------------------------------------------------------
    | COMPROBAR FAVORITO
    |--------------------------------------------------------------------------
    */

    public function verificar(
        Request $request,
        Inmueble $inmueble
    ) {
        $esFavorito = Favorito::where(
            'user_id',
            $request->user()->id
        )
            ->where(
                'inmueble_id',
                $inmueble->id
            )
            ->exists();

        return response()->json([
            'favorito' => $esFavorito,
        ]);
    }
}