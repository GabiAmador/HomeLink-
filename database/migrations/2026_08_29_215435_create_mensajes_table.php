<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('mensajes', function (Blueprint $table) {
            $table->id();

            $table->foreignId('inmueble_id')
                  ->constrained('inmuebles')
                  ->cascadeOnDelete();

            $table->foreignId('inquilino_id')
                  ->constrained('users')
                  ->cascadeOnDelete();

            $table->foreignId('propietario_id')
                  ->constrained('users')
                  ->cascadeOnDelete();

            $table->text('mensaje');

            $table->enum('estado', [
                'nuevo',
                'leido'
            ])->default('nuevo');

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('mensajes');
    }
};