<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateDepositSchemesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('deposit_schemes', function (Blueprint $table) {
            $table->id();
            $table->string('scheme_name', 50)->nullable();
            $table->string('scheme_category', 50)->nullable();
            $table->string('interest_type', 50)->nullable();
            $table->decimal('min_interest')->nullable();
            $table->decimal('max_interest')->nullable();
            $table->decimal('fd_duration')->nullable();
            $table->boolean('accural_or_not')->default(0);
            $table->decimal('min_incentive')->nullable();
            $table->decimal('max_incentive')->nullable();
            $table->integer('compounding_period')->nullable();
            $table->decimal('min_amount')->nullable();
            $table->decimal('max_amount',15,2)->nullable();
            $table->date('period_from')->nullable();
            $table->date('period_to')->nullable();
            $table->decimal('commission_percent')->nullable();
            $table->integer('status')->nullable();
            $table->integer('created_by')->nullable();
            $table->integer('updated_by')->nullable();
            $table->softDeletes();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('deposit_schemes');
    }
}
