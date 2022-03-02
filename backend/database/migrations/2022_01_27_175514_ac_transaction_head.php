<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AcTransactionHead extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('ac_transaction_head', function (Blueprint $table) {
            $table->id();
            $table->bigInteger('branch_id')->unsigned();
            $table->string('accounts_head',255)->nullable();
            $table->string('head_slug',255)->nullable();
            $table->bigInteger('parent_head')->unsigned();
            $table->string('accounting',255)->nullable();
            $table->string('debit_credit',100)->nullable();
            $table->string('ac_type',100)->nullable();
            $table->bigInteger('ac_type_id')->nullable();
            $table->decimal('limit_amount')->nullable();
            $table->bigInteger('status')->nullable();
            $table->integer('sort_order')->nullable();
            $table->integer('created_by')->nullable();
            $table->integer('updated_by')->nullable();
            $table->softDeletes();
            $table->timestamps();
        });
        Schema::table('ac_transaction_head', function (Blueprint $table) {
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
