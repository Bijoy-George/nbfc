<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateLiablityDetailsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('liablity_details', function (Blueprint $table) {
            $table->id();
            $table->bigInteger('fd_id')->unsigned();
            $table->decimal('amount')->nullable();
            $table->string('reason')->nullable();
             $table->tinyInteger('status')->nullable();
            $table->integer('created_by')->nullable();
            $table->integer('updated_by')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
         Schema::table('liablity_details', function (Blueprint $table) {
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
        Schema::dropIfExists('liablity_details');
    }
}
