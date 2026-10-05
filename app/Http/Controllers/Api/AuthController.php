<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /*
    |--------------------------------------------------------------------------
    | REGISTRO
    |--------------------------------------------------------------------------
    */

    public function registro(Request $request)
    {
        $datos = $request->validate([
            'name' => [
                'required',
                'string',
                'max:100',
            ],

            'email' => [
                'required',
                'email',
                'unique:users,email',
            ],

            'telefono' => [
                'nullable',
                'string',
                'max:20',
            ],

            'password' => [
                'required',
                'string',
                'min:8',
                'confirmed',
            ],
        ]);


        $usuario = User::create([
            'name' =>
                $datos['name'],

            'email' =>
                $datos['email'],

            'telefono' =>
                $datos['telefono'] ?? null,

            /*
             * Se conserva por compatibilidad
             * con la estructura actual de la BD.
             *
             * HomeLink ya no utiliza este campo
             * para limitar las funciones.
             */
            'rol' =>
                'inquilino',

            'password' =>
                $datos['password'],
        ]);


        $token =
            $usuario
                ->createToken('homelink')
                ->plainTextToken;


        return response()->json([
            'mensaje' =>
                'Usuario registrado correctamente.',

            'usuario' =>
                $usuario,

            'token' =>
                $token,
        ], 201);
    }


    /*
    |--------------------------------------------------------------------------
    | INICIO DE SESIÓN
    |--------------------------------------------------------------------------
    */

    public function login(Request $request)
    {
        $datos = $request->validate([
            'email' => [
                'required',
                'email',
            ],

            'password' => [
                'required',
                'string',
            ],
        ]);


        $usuario =
            User::where(
                'email',
                $datos['email']
            )->first();


        if (
            !$usuario ||
            !Hash::check(
                $datos['password'],
                $usuario->password
            )
        ) {

            throw ValidationException::withMessages([
                'email' => [
                    'El correo o la contraseña son incorrectos.'
                ],
            ]);

        }


        /*
         * Cerramos tokens anteriores
         * antes de crear la nueva sesión.
         */
        $usuario
            ->tokens()
            ->delete();


        $token =
            $usuario
                ->createToken('homelink')
                ->plainTextToken;


        return response()->json([
            'mensaje' =>
                'Inicio de sesión correcto.',

            'usuario' =>
                $usuario,

            'token' =>
                $token,
        ]);
    }


    /*
    |--------------------------------------------------------------------------
    | CERRAR SESIÓN
    |--------------------------------------------------------------------------
    */

    public function logout(Request $request)
    {
        $request
            ->user()
            ->currentAccessToken()
            ->delete();


        return response()->json([
            'mensaje' =>
                'Sesión cerrada correctamente.'
        ]);
    }
}