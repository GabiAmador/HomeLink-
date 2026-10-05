<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Inmueble;
use App\Models\Mensaje;
use Illuminate\Http\Request;

class MensajeController extends Controller
{
    /*
    |--------------------------------------------------------------------------
    | ENVIAR CONSULTA
    |--------------------------------------------------------------------------
    */

    public function store(
        Request $request,
        Inmueble $inmueble
    ) {
        $request->validate([
            'mensaje' =>
                'required|string|min:3|max:2000',

            'whatsapp' => [
                'required',
                'string',
                'min:8',
                'max:20',
                'regex:/^[0-9+\s()-]+$/',
            ],
        ], [
            'mensaje.required' =>
                'Escribe un mensaje.',

            'mensaje.min' =>
                'El mensaje debe contener al menos 3 caracteres.',

            'mensaje.max' =>
                'El mensaje no puede superar los 2000 caracteres.',

            'whatsapp.required' =>
                'Ingresa tu número de WhatsApp.',

            'whatsapp.min' =>
                'Ingresa un número de WhatsApp válido.',

            'whatsapp.max' =>
                'El número de WhatsApp es demasiado largo.',

            'whatsapp.regex' =>
                'Ingresa un número de WhatsApp válido.',
        ]);


        $usuario =
            $request->user();


        /*
         * El propietario no puede enviarse
         * consultas a sí mismo.
         */

        if (
            (int) $usuario->id ===
            (int) $inmueble->user_id
        ) {

            return response()->json([
                'mensaje' =>
                    'No puedes enviarte un mensaje a ti mismo.',
            ], 422);

        }


        /*
         * Limpiamos el WhatsApp.
         *
         * En la base guardaremos únicamente
         * números para poder crear después
         * el enlace directo a WhatsApp.
         */

        $whatsapp =
            preg_replace(
                '/\D+/',
                '',
                $request->whatsapp
            );


        /*
         * Nicaragua tiene 8 dígitos.
         * Si escribieron solo 8, agregamos 505.
         *
         * Ejemplo:
         * 88888888
         * pasa a:
         * 50588888888
         */

        if (
            strlen($whatsapp) === 8
        ) {

            $whatsapp =
                '505' . $whatsapp;

        }


        if (
            strlen($whatsapp) < 10 ||
            strlen($whatsapp) > 15
        ) {

            return response()->json([
                'mensaje' =>
                    'Ingresa un número de WhatsApp válido.',
                'errors' => [
                    'whatsapp' => [
                        'Ingresa un número de WhatsApp válido.',
                    ],
                ],
            ], 422);

        }


        $mensaje =
            Mensaje::create([

                'inmueble_id' =>
                    $inmueble->id,

                'inquilino_id' =>
                    $usuario->id,

                'propietario_id' =>
                    $inmueble->user_id,

                'mensaje' =>
                    trim($request->mensaje),

                'whatsapp' =>
                    $whatsapp,

                'estado' =>
                    'nuevo',

            ]);


        $mensaje->load([
            'inmueble',
            'inquilino',
            'propietario',
        ]);


        return response()->json([
            'mensaje' =>
                'Consulta enviada correctamente.',

            'data' =>
                $mensaje,
        ], 201);
    }


    /*
    |--------------------------------------------------------------------------
    | MENSAJES RECIBIDOS
    |--------------------------------------------------------------------------
    */

    public function recibidos(
        Request $request
    ) {

        $mensajes =
            Mensaje::with([
                'inmueble.imagenes',
                'inquilino',
            ])

                ->where(
                    'propietario_id',
                    $request->user()->id
                )

                ->latest()

                ->get();


        return response()->json(
            $mensajes
        );
    }


    /*
    |--------------------------------------------------------------------------
    | MENSAJES ENVIADOS
    |--------------------------------------------------------------------------
    */

    public function enviados(
        Request $request
    ) {

        $mensajes =
            Mensaje::with([
                'inmueble.imagenes',
                'propietario',
            ])

                ->where(
                    'inquilino_id',
                    $request->user()->id
                )

                ->latest()

                ->get();


        return response()->json(
            $mensajes
        );
    }


    /*
    |--------------------------------------------------------------------------
    | CONTAR MENSAJES NUEVOS
    |--------------------------------------------------------------------------
    */

    public function contarNuevos(
        Request $request
    ) {

        $cantidad =
            Mensaje::where(
                'propietario_id',
                $request->user()->id
            )

                ->where(
                    'estado',
                    'nuevo'
                )

                ->count();


        return response()->json([
            'cantidad' =>
                $cantidad,
        ]);
    }


    /*
    |--------------------------------------------------------------------------
    | MARCAR COMO LEÍDO
    |--------------------------------------------------------------------------
    */

    public function marcarLeido(
        Request $request,
        Mensaje $mensaje
    ) {

        if (
            (int) $mensaje->propietario_id !==
            (int) $request->user()->id
        ) {

            return response()->json([
                'mensaje' =>
                    'No tienes permiso para modificar este mensaje.',
            ], 403);

        }


        if (
            $mensaje->estado !==
            'leido'
        ) {

            $mensaje->update([
                'estado' =>
                    'leido',
            ]);

        }


        return response()->json([
            'mensaje' =>
                'Mensaje marcado como leído.',

            'data' =>
                $mensaje,
        ]);
    }


    /*
    |--------------------------------------------------------------------------
    | ELIMINAR MENSAJE
    |--------------------------------------------------------------------------
    */

    public function destroy(
        Request $request,
        Mensaje $mensaje
    ) {

        $usuarioId =
            (int) $request->user()->id;


        $puedeEliminar =

            (int) $mensaje->propietario_id ===
                $usuarioId ||

            (int) $mensaje->inquilino_id ===
                $usuarioId;


        if (!$puedeEliminar) {

            return response()->json([
                'mensaje' =>
                    'No tienes permiso para eliminar este mensaje.',
            ], 403);

        }


        $mensaje->delete();


        return response()->json([
            'mensaje' =>
                'Mensaje eliminado correctamente.',
        ]);
    }
}