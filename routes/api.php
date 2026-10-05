<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\InmuebleController;
use App\Http\Controllers\Api\MensajeController;
use App\Http\Controllers\Api\FavoritoController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Hash;
use App\Models\Inmueble;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\DB;

/*
|--------------------------------------------------------------------------
| RUTAS PÚBLICAS
|--------------------------------------------------------------------------
*/


/*
 * Registro.
 */
Route::post(
    '/registro',
    [AuthController::class, 'registro']
);


/*
 * Inicio de sesión.
 */
Route::post(
    '/login',
    [AuthController::class, 'login']
);


/*
 * Todos los inmuebles.
 */
Route::get(
    '/inmuebles',
    [InmuebleController::class, 'index']
);


/*
 * Detalle de inmueble.
 */
Route::get(
    '/inmuebles/{inmueble}',
    [InmuebleController::class, 'show']
);


/*
|--------------------------------------------------------------------------
| RUTAS PROTEGIDAS
|--------------------------------------------------------------------------
*/

Route::middleware('auth:sanctum')
    ->group(function () {


        /*
         * Usuario autenticado.
         */
        Route::get(
            '/user',
            function (Request $request) {
                return $request->user();
            }
        );


        /*
         * Cerrar sesión.
         */
        Route::post(
            '/logout',
            [AuthController::class, 'logout']
        );


        /*
        |--------------------------------------------------------------------------
        | PERFIL
        |--------------------------------------------------------------------------
        */


        /*
         * Actualizar perfil del usuario autenticado.
         */
        Route::put(
            '/perfil',
            function (Request $request) {

                $usuario = $request->user();

                $datos = $request->validate([
                    'name' => [
                        'required',
                        'string',
                        'max:255',
                    ],

                    'email' => [
                        'required',
                        'email',
                        'max:255',
                        Rule::unique('users', 'email')
                            ->ignore($usuario->id),
                    ],
                ]);

                $usuario->update($datos);

                return response()->json([
                    'mensaje' =>
                        'Perfil actualizado correctamente.',

                    'usuario' =>
                        $usuario->fresh(),
                ]);
            }
        );
Route::put('/perfil/password', function (Request $request) {

    $usuario = $request->user();

    $datos = $request->validate([
        'password_actual' => [
            'required',
            'string',
        ],

        'password' => [
            'required',
            'string',
            'min:8',
            'confirmed',
        ],
    ]);

    /*
    |--------------------------------------------------------------------------
    | COMPROBAR CONTRASEÑA ACTUAL
    |--------------------------------------------------------------------------
    */

    if (
        !Hash::check(
            $datos['password_actual'],
            $usuario->password
        )
    ) {
        return response()->json([
            'mensaje' =>
                'La contraseña actual no es correcta.',

            'errors' => [
                'password_actual' => [
                    'La contraseña actual no es correcta.'
                ],
            ],
        ], 422);
    }


    /*
    |--------------------------------------------------------------------------
    | EVITAR USAR LA MISMA CONTRASEÑA
    |--------------------------------------------------------------------------
    */

    if (
        Hash::check(
            $datos['password'],
            $usuario->password
        )
    ) {
        return response()->json([
            'mensaje' =>
                'La nueva contraseña debe ser diferente a la actual.',

            'errors' => [
                'password' => [
                    'La nueva contraseña debe ser diferente a la actual.'
                ],
            ],
        ], 422);
    }


    /*
    |--------------------------------------------------------------------------
    | ACTUALIZAR CONTRASEÑA
    |--------------------------------------------------------------------------
    */

    $usuario->password =
        $datos['password'];

    $usuario->save();


    return response()->json([
        'mensaje' =>
            'Contraseña actualizada correctamente.'
    ]);

});

Route::delete('/perfil', function (Request $request) {

    $usuario = $request->user();

    /*
    |--------------------------------------------------------------------------
    | VALIDAR CONTRASEÑA
    |--------------------------------------------------------------------------
    */

    $datos = $request->validate([
        'password' => [
            'required',
            'string',
        ],
    ]);


    /*
    |--------------------------------------------------------------------------
    | COMPROBAR CONTRASEÑA ACTUAL
    |--------------------------------------------------------------------------
    */

    if (
        !Hash::check(
            $datos['password'],
            $usuario->password
        )
    ) {

        return response()->json([
            'mensaje' =>
                'La contraseña ingresada no es correcta.',

            'errors' => [
                'password' => [
                    'La contraseña ingresada no es correcta.'
                ],
            ],
        ], 422);

    }


    try {

        /*
        |--------------------------------------------------------------------------
        | OBTENER ARCHIVOS DE IMÁGENES
        |--------------------------------------------------------------------------
        |
        | Primero obtenemos las rutas. No eliminamos todavía los archivos
        | para evitar perderlos si la operación de base de datos falla.
        |
        */

        $inmuebles =
            Inmueble::with('imagenes')
                ->where(
                    'user_id',
                    $usuario->id
                )
                ->get();


        $archivos = [];

        foreach ($inmuebles as $inmueble) {

            foreach ($inmueble->imagenes as $imagen) {

                if (
                    !empty(
                        $imagen->url_imagen
                    )
                ) {

                    $rutaImagen =
                        parse_url(
                            $imagen->url_imagen,
                            PHP_URL_PATH
                        );

                    if ($rutaImagen) {

                        $archivos[] =
                            public_path(
                                ltrim(
                                    $rutaImagen,
                                    '/'
                                )
                            );

                    }

                }

            }

        }


        /*
        |--------------------------------------------------------------------------
        | ELIMINAR CUENTA Y DATOS RELACIONADOS
        |--------------------------------------------------------------------------
        */

        DB::transaction(
            function () use ($usuario) {

                /*
                 * Los cascadeOnDelete de la base de datos
                 * eliminan automáticamente:
                 *
                 * - Inmuebles
                 * - Imágenes asociadas al inmueble
                 * - Mensajes
                 * - Favoritos
                 *
                 * siempre que sus migraciones tengan
                 * las claves foráneas correspondientes.
                 */

                $usuario
                    ->tokens()
                    ->delete();

                $usuario
                    ->delete();

            }
        );


        /*
        |--------------------------------------------------------------------------
        | BORRAR ARCHIVOS FÍSICOS
        |--------------------------------------------------------------------------
        */

        foreach ($archivos as $archivo) {

            if (
                File::exists(
                    $archivo
                )
            ) {

                File::delete(
                    $archivo
                );

            }

        }


        return response()->json([
            'mensaje' =>
                'Tu cuenta HomeLink fue eliminada correctamente.'
        ]);

    } catch (\Throwable $error) {

        report($error);

        return response()->json([
            'mensaje' =>
                'No fue posible eliminar la cuenta. Inténtalo nuevamente.'
        ], 500);

    }

});

        /*
        |--------------------------------------------------------------------------
        | INMUEBLES
        |--------------------------------------------------------------------------
        */


        /*
         * Propiedades del usuario.
         */
        Route::get(
            '/mis-inmuebles',
            [
                InmuebleController::class,
                'misInmuebles'
            ]
        );


        /*
         * Crear inmueble.
         */
        Route::post(
            '/inmuebles',
            [
                InmuebleController::class,
                'store'
            ]
        );


        /*
         * Actualizar inmueble.
         */
        Route::put(
            '/inmuebles/{inmueble}',
            [
                InmuebleController::class,
                'update'
            ]
        );


        Route::patch(
            '/inmuebles/{inmueble}',
            [
                InmuebleController::class,
                'update'
            ]
        );


        /*
         * Eliminar fotografía.
         */
        Route::delete(
            '/inmuebles/{inmueble}/imagenes/{imagen}',
            [
                InmuebleController::class,
                'eliminarImagen'
            ]
        );


        /*
         * Cambiar portada.
         */
        Route::patch(
            '/inmuebles/{inmueble}/imagenes/{imagen}/principal',
            [
                InmuebleController::class,
                'establecerImagenPrincipal'
            ]
        );


        /*
         * Eliminar inmueble.
         */
        Route::delete(
            '/inmuebles/{inmueble}',
            [
                InmuebleController::class,
                'destroy'
            ]
        );


        /*
        |--------------------------------------------------------------------------
        | MENSAJES
        |--------------------------------------------------------------------------
        */


        /*
         * Enviar mensaje por una propiedad.
         */
        Route::post(
            '/inmuebles/{inmueble}/mensajes',
            [
                MensajeController::class,
                'store'
            ]
        );


        /*
         * Mensajes recibidos por el propietario.
         */
        Route::get(
            '/mensajes/recibidos',
            [
                MensajeController::class,
                'recibidos'
            ]
        );


        /*
         * Mensajes enviados por el usuario.
         */
        Route::get(
            '/mensajes/enviados',
            [
                MensajeController::class,
                'enviados'
            ]
        );


        /*
         * Cantidad de mensajes nuevos.
         */
        Route::get(
            '/mensajes/nuevos',
            [
                MensajeController::class,
                'contarNuevos'
            ]
        );


        /*
         * Marcar mensaje como leído.
         */
        Route::patch(
            '/mensajes/{mensaje}/leido',
            [
                MensajeController::class,
                'marcarLeido'
            ]
        );


        /*
         * Eliminar mensaje.
         */
        Route::delete(
            '/mensajes/{mensaje}',
            [
                MensajeController::class,
                'destroy'
            ]
        );


        /*
        |--------------------------------------------------------------------------
        | FAVORITOS
        |--------------------------------------------------------------------------
        */


        /*
         * Obtener las propiedades favoritas
         * del usuario autenticado.
         */
        Route::get(
            '/favoritos',
            [
                FavoritoController::class,
                'index'
            ]
        );


        /*
         * Guardar una propiedad
         * en favoritos.
         */
        Route::post(
            '/inmuebles/{inmueble}/favorito',
            [
                FavoritoController::class,
                'store'
            ]
        );


        /*
         * Comprobar si una propiedad
         * está guardada en favoritos.
         */
        Route::get(
            '/inmuebles/{inmueble}/favorito',
            [
                FavoritoController::class,
                'verificar'
            ]
        );


        /*
         * Quitar una propiedad
         * de favoritos.
         */
        Route::delete(
            '/inmuebles/{inmueble}/favorito',
            [
                FavoritoController::class,
                'destroy'
            ]
        );
    });