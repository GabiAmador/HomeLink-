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
        Schema::create('inmuebles', function (Blueprint $table) {
            $table->id();

            $table->foreignId('user_id')
                  ->constrained('users')
                  ->cascadeOnDelete();

            $table->string('titulo', 150);
            $table->text('descripcion');
            $table->decimal('precio', 10, 2);
            $table->string('tipo_vivienda', 50);
            $table->unsignedInteger('habitaciones');
            $table->unsignedInteger('banos');
            $table->string('direccion', 255);
            $table->decimal('latitud', 10, 7)->nullable();
            $table->decimal('longitud', 10, 7)->nullable();

            $table->enum('estado', [
                'disponible',
                'alquilado'
            ])->default('disponible');

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('inmuebles');
    }
};