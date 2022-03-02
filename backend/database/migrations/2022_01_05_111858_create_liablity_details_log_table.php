<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateLiablityDetailsLogTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('liablity_details_log', function (Blueprint $table) {
            $table->id();
            $table->bigInteger('liability_id')->unsigned();
            $table->bigInteger('fd_id')->unsigned();
            $table->decimal('amount')->nullable();
            $table->string('reason')->nullable();
             $table->tinyInteger('status')->nullable();
            $table->integer('created_by')->nullable();
            $table->integer('updated_by')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
         Schema::table('liablity_details_log', function (Blueprint $table) {
            $table->foreign('liability_id')->references('id')->on('liablity_details');
            $table->foreign('fd_id')->references('id')->on('fd_account_details');
         });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('liablity_details_log');
    }
}
