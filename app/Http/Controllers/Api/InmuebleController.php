<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Imagen;
use App\Models\Inmueble;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Str;

class InmuebleController extends Controller
{
    /**
     * Mostrar todos los inmuebles.
     * Ruta pública.
     */
    public function index()
    {
        $inmuebles = Inmueble::with([
            'propietario',
            'imagenes',
            'caracteristicas'
        ])
        ->latest()
        ->get();

        return response()->json($inmuebles);
    }


    /**
     * Mostrar únicamente los inmuebles
     * del usuario autenticado.
     */
    public function misInmuebles(Request $request)
    {
        $inmuebles = Inmueble::with([
            'propietario',
            'imagenes',
            'caracteristicas'
        ])
        ->where('user_id', $request->user()->id)
        ->latest()
        ->get();

        return response()->json($inmuebles);
    }


    /**
     * Crear un nuevo inmueble.
     */
    public function store(Request $request)
    {
        $datos = $request->validate([
            'titulo' => 'required|string|max:150',
            'descripcion' => 'required|string',
            'precio' => 'required|numeric|min:0',
            'tipo_vivienda' => 'required|string|max:50',
            'habitaciones' => 'required|integer|min:0',
            'banos' => 'required|integer|min:0',

            'area' => 'required|numeric|min:1',

            'direccion' => 'required|string|max:255',

            'latitud' =>
                'required|numeric|between:-90,90',

            'longitud' =>
                'required|numeric|between:-180,180',

            'estado' =>
                'nullable|in:disponible,alquilado',

            'imagenes' =>
                'nullable|array|max:8',

            'imagenes.*' =>
                'image|mimes:jpg,jpeg,png,webp|max:5120',
        ]);


        $inmueble = Inmueble::create([
            'user_id' =>
                $request->user()->id,

            'titulo' =>
                $datos['titulo'],

            'descripcion' =>
                $datos['descripcion'],

            'precio' =>
                $datos['precio'],

            'tipo_vivienda' =>
                $datos['tipo_vivienda'],

            'habitaciones' =>
                $datos['habitaciones'],

            'banos' =>
                $datos['banos'],

            'area' =>
                $datos['area'],

            'direccion' =>
                $datos['direccion'],

            'latitud' =>
                $datos['latitud'],

            'longitud' =>
                $datos['longitud'],

            'estado' =>
                $datos['estado'] ?? 'disponible',
        ]);


        /*
         * Guardar fotografías.
         */
        if ($request->hasFile('imagenes')) {

            $carpeta =
                public_path('images/inmuebles');

            File::ensureDirectoryExists(
                $carpeta
            );


            foreach (
                $request->file('imagenes')
                as $indice => $imagen
            ) {

                $nombreArchivo =
                    Str::uuid() .
                    '.' .
                    $imagen->extension();


                $imagen->move(
                    $carpeta,
                    $nombreArchivo
                );


                $urlImagen =
                    '/images/inmuebles/' .
                    $nombreArchivo;


                $inmueble
                    ->imagenes()
                    ->create([
                        'url_imagen' =>
                            $urlImagen,

                        'es_principal' =>
                            $indice === 0,
                    ]);
            }
        }


        $inmueble->load([
            'propietario',
            'imagenes',
            'caracteristicas'
        ]);


        return response()->json([
            'mensaje' =>
                'Inmueble publicado correctamente',

            'inmueble' =>
                $inmueble
        ], 201);
    }


    /**
     * Mostrar un inmueble específico.
     * Ruta pública.
     */
    public function show(Inmueble $inmueble)
    {
        $inmueble->load([
            'propietario',
            'imagenes',
            'caracteristicas'
        ]);

        return response()->json(
            $inmueble
        );
    }


    /**
     * Actualizar inmueble.
     */
    public function update(
        Request $request,
        Inmueble $inmueble
    ) {

        /*
         * SEGURIDAD:
         * Solo el propietario puede modificarlo.
         */
        if (
            $inmueble->user_id !==
            $request->user()->id
        ) {
            return response()->json([
                'mensaje' =>
                    'No tienes permiso para editar este inmueble.'
            ], 403);
        }


        $datos = $request->validate([
            'titulo' =>
                'sometimes|required|string|max:150',

            'descripcion' =>
                'sometimes|required|string',

            'precio' =>
                'sometimes|required|numeric|min:0',

            'tipo_vivienda' =>
                'sometimes|required|string|max:50',

            'habitaciones' =>
                'sometimes|required|integer|min:0',

            'banos' =>
                'sometimes|required|integer|min:0',

            'area' =>
                'sometimes|required|numeric|min:1',

            'direccion' =>
                'sometimes|required|string|max:255',

            'latitud' =>
                'sometimes|required|numeric|between:-90,90',

            'longitud' =>
                'sometimes|required|numeric|between:-180,180',

            'estado' =>
                'sometimes|required|in:disponible,alquilado',

            'imagenes' =>
                'nullable|array|max:8',

            'imagenes.*' =>
                'image|mimes:jpg,jpeg,png,webp|max:5120',
        ]);


        /*
         * Campos que se pueden actualizar.
         */
        $campos = [
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


        foreach ($campos as $campo) {

            if (
                array_key_exists(
                    $campo,
                    $datos
                )
            ) {
                $inmueble->$campo =
                    $datos[$campo];
            }
        }


        $inmueble->save();


        /*
         * Agregar fotografías nuevas.
         */
        if ($request->hasFile('imagenes')) {

            $cantidadActual =
                $inmueble
                    ->imagenes()
                    ->count();


            $imagenesNuevas =
                count(
                    $request->file('imagenes')
                );


            if (
                ($cantidadActual +
                $imagenesNuevas) > 8
            ) {

                return response()->json([
                    'mensaje' =>
                        'El inmueble puede tener un máximo de 8 imágenes.'
                ], 422);
            }


            $carpeta =
                public_path(
                    'images/inmuebles'
                );


            File::ensureDirectoryExists(
                $carpeta
            );


            $yaTienePrincipal =
                $inmueble
                    ->imagenes()
                    ->where(
                        'es_principal',
                        true
                    )
                    ->exists();


            foreach (
                $request->file('imagenes')
                as $indice => $imagen
            ) {

                $nombreArchivo =
                    Str::uuid() .
                    '.' .
                    $imagen->extension();


                $imagen->move(
                    $carpeta,
                    $nombreArchivo
                );


                $urlImagen =
                    '/images/inmuebles/' .
                    $nombreArchivo;


                $inmueble
                    ->imagenes()
                    ->create([
                        'url_imagen' =>
                            $urlImagen,

                        'es_principal' =>
                            !$yaTienePrincipal &&
                            $indice === 0,
                    ]);
            }
        }


        $inmueble->load([
            'propietario',
            'imagenes',
            'caracteristicas'
        ]);


        return response()->json([
            'mensaje' =>
                'Inmueble actualizado correctamente',

            'inmueble' =>
                $inmueble
        ]);
    }


    /**
     * Eliminar una fotografía
     * individual del inmueble.
     */
    public function eliminarImagen(
        Request $request,
        Inmueble $inmueble,
        Imagen $imagen
    ) {

        /*
         * Solo el propietario puede
         * modificar sus fotografías.
         */
        if (
            $inmueble->user_id !==
            $request->user()->id
        ) {

            return response()->json([
                'mensaje' =>
                    'No tienes permiso para modificar este inmueble.'
            ], 403);
        }


        /*
         * Verificar que la imagen
         * pertenezca al inmueble.
         */
        if (
            $imagen->inmueble_id !==
            $inmueble->id
        ) {

            return response()->json([
                'mensaje' =>
                    'La fotografía no pertenece a este inmueble.'
            ], 404);
        }


        $eraPrincipal =
            (bool) $imagen->es_principal;


        /*
         * Eliminar archivo físico.
         */
        $rutaUrl =
            parse_url(
                $imagen->url_imagen,
                PHP_URL_PATH
            );


        if ($rutaUrl) {

            $rutaArchivo =
                public_path(
                    ltrim(
                        $rutaUrl,
                        '/'
                    )
                );


            if (
                File::exists(
                    $rutaArchivo
                )
            ) {

                File::delete(
                    $rutaArchivo
                );
            }
        }


        /*
         * Eliminar de la BD.
         */
        $imagen->delete();


        /*
         * Si eliminamos la portada,
         * asignamos otra automáticamente.
         */
        if ($eraPrincipal) {

            $nuevaPrincipal =
                $inmueble
                    ->imagenes()
                    ->oldest()
                    ->first();


            if ($nuevaPrincipal) {

                $nuevaPrincipal->update([
                    'es_principal' =>
                        true
                ]);
            }
        }


        $inmueble->load(
            'imagenes'
        );


        return response()->json([
            'mensaje' =>
                'Fotografía eliminada correctamente.',

            'imagenes' =>
                $inmueble->imagenes
        ]);
    }


    /**
     * Establecer una fotografía
     * como portada.
     */
    public function establecerImagenPrincipal(
        Request $request,
        Inmueble $inmueble,
        Imagen $imagen
    ) {

        if (
            $inmueble->user_id !==
            $request->user()->id
        ) {

            return response()->json([
                'mensaje' =>
                    'No tienes permiso para modificar este inmueble.'
            ], 403);
        }


        if (
            $imagen->inmueble_id !==
            $inmueble->id
        ) {

            return response()->json([
                'mensaje' =>
                    'La fotografía no pertenece a este inmueble.'
            ], 404);
        }


        /*
         * Quitar portada anterior.
         */
        $inmueble
            ->imagenes()
            ->update([
                'es_principal' =>
                    false
            ]);


        /*
         * Nueva portada.
         */
        $imagen->update([
            'es_principal' =>
                true
        ]);


        $inmueble->load(
            'imagenes'
        );


        return response()->json([
            'mensaje' =>
                'Fotografía principal actualizada.',

            'imagenes' =>
                $inmueble->imagenes
        ]);
    }


    /**
     * Eliminar inmueble completo.
     */
    public function destroy(
        Request $request,
        Inmueble $inmueble
    ) {

        /*
         * Solo el propietario
         * puede eliminarlo.
         */
        if (
            $inmueble->user_id !==
            $request->user()->id
        ) {

            return response()->json([
                'mensaje' =>
                    'No tienes permiso para eliminar este inmueble.'
            ], 403);
        }


        $inmueble->load(
            'imagenes'
        );


        /*
         * Eliminar fotografías físicas.
         */
        foreach (
            $inmueble->imagenes
            as $imagen
        ) {

            $rutaUrl =
                parse_url(
                    $imagen->url_imagen,
                    PHP_URL_PATH
                );


            if ($rutaUrl) {

                $rutaArchivo =
                    public_path(
                        ltrim(
                            $rutaUrl,
                            '/'
                        )
                    );


                if (
                    File::exists(
                        $rutaArchivo
                    )
                ) {

                    File::delete(
                        $rutaArchivo
                    );
                }
            }
        }


        /*
         * Eliminar inmueble.
         */
        $inmueble->delete();


        return response()->json([
            'mensaje' =>
                'Inmueble eliminado correctamente'
        ]);
    }
}