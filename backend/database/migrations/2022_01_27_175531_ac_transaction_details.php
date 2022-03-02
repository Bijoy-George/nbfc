<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AcTransactionDetails extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
		Schema::create('ac_transaction_details', function (Blueprint $table) {
             $table->bigInteger('id', true);
             $table->integer('branch_id')->unsigned();
             $table->bigInteger('ac_trans_id')->unsigned();
             $table->string('description')->nullable();
			 $table->decimal('interest_rate')->nullable();
			 $table->decimal('interest_amount')->nullable();
			 $table->text('extra_details')->nullable();
             $table->integer('created_by')->nullable();
             $table->integer('updated_by')->nullable();
             $table->softDeletes();
             $table->timestamps();
        });
        Schema::table('ac_transaction_details', function(Blueprint $table) {
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
