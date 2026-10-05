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
        Schema::create('inmueble_caracteristica', function (Blueprint $table) {
            $table->id();

            $table->foreignId('inmueble_id')
                  ->constrained('inmuebles')
                  ->cascadeOnDelete();

            $table->foreignId('caracteristica_id')
                  ->constrained('caracteristicas')
                  ->cascadeOnDelete();

            $table->timestamps();

            $table->unique(['inmueble_id', 'caracteristica_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('inmueble_caracteristica');
    }
};