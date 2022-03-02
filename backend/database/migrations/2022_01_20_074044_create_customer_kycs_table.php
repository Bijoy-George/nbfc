<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateCustomerKycsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('customer_kycs', function (Blueprint $table) {
            $table->id();
            $table->bigInteger('customer_id')->unsigned();
            $table->bigInteger('branch_id')->unsigned();
            $table->bigInteger('kyc_type_id')->unsigned();
            $table->string('doc_name',50)->nullable();
            $table->string('doc_no',100)->nullable();
            $table->string('file_name',100)->nullable();
            $table->date('issue_date')->nullable();
            $table->date('expiry_date')->nullable();
            $table->integer('submitted_by')->nullable();
            $table->integer('verified_by')->nullable();
            $table->tinyInteger('status')->nullable();
            $table->integer('created_by')->nullable();
            $table->integer('updated_by')->nullable();
            $table->softDeletes();
            $table->timestamps();
        });
        Schema::table('customer_kycs', function (Blueprint $table) {
            $table->foreign('customer_id')->references('id')->on('customer_details');
            $table->foreign('branch_id')->references('id')->on('branch_details');
            $table->foreign('kyc_type_id')->references('id')->on('kyc_types');

        });

    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('customer_kycs');
    }
}
