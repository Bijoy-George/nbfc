<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AcTransactions extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
         Schema::create('ac_transactions', function (Blueprint $table) {
            $table->bigInteger('id', true);
            $table->integer('branch_id')->unsigned();
            $table->bigInteger('trans_id')->unsigned();
            $table->bigInteger('head_id')->index('head_id')->unsigned();
            $table->decimal('amount')->nullable();
            $table->string('accounting',100)->nullable();
            $table->string('debit_credit',100)->nullable();
            $table->date('ac_date')->nullable();
            $table->string('ac_type',100)->nullable();
            $table->bigInteger('ac_type_id')->nullable();
            $table->tinyInteger('status')->nullable();
            $table->integer('created_by')->nullable();
            $table->integer('updated_by')->nullable();
            $table->softDeletes();
            $table->timestamps();
        });
        Schema::table('ac_transactions', function(Blueprint $table) {
            $table->foreign('branch_id')->references('id')->on('branch_details');
            });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        //
    }
}
