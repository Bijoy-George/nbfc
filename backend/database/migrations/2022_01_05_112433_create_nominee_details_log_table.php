<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateNomineeDetailsLogTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('nominee_details_log', function (Blueprint $table) {
            $table->id();
            $table->bigInteger('nominee_id')->unsigned();
            $table->bigInteger('fd_id')->unsigned();
            $table->bigInteger('customer_id')->unsigned();
            $table->string('nominee_name',100)->nullable();
            $table->string('email', 50)->nullable();
            $table->string('country_code', 15)->nullable();
            $table->string('phone_number', 50)->nullable();
            $table->string('relation', 50)->nullable();
            $table->string('notes')->nullable();
            $table->integer('status')->nullable();
            $table->integer('created_by')->nullable();
            $table->integer('updated_by')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
         Schema::table('nominee_details_log', function (Blueprint $table) {
            $table->foreign('nominee_id')->references('id')->on('nominee_details');
            $table->foreign('fd_id')->references('id')->on('fd_account_details');
            $table->foreign('customer_id')->references('id')->on('customer_details');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('nominee_details_log');
    }
}
