<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateCustomerDetailsLogTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('customer_details_log', function (Blueprint $table) {
           $table->id();
            $table->bigInteger('customer_id')->unsigned();
            $table->bigInteger('branch_id')->unsigned();
            $table->string('first_name', 25)->nullable();
            $table->string('middle_name', 25)->nullable();
            $table->string('last_name', 25)->nullable();
            $table->integer('gender')->nullable()->comment('1-Male,2-Female,3-Transgender');
            $table->string('email', 50)->nullable();
            $table->string('country_code', 15)->nullable();
            $table->string('mobile', 50)->nullable();
            $table->string('pan_number', 50)->nullable();
            $table->string('nationality', 50)->nullable();
            $table->string('secondary_country_code', 15)->nullable();
            $table->string('secondary_phone', 50)->nullable();
            $table->tinyInteger('account_type')->nullable();
            $table->string('account_number', 50)->nullable();
            $table->tinyInteger('kyc_type')->nullable();
            $table->string('kyc_doc')->nullable();
            $table->string('kyc_status', 50)->nullable();
            $table->string('guardian', 50)->nullable();
            $table->string('occupation', 50)->nullable();
            $table->string('election_id', 50)->nullable();
            $table->string('aadhar', 50)->nullable();
            $table->string('driving_licence', 50)->nullable();
            $table->string('joint_holders', 50)->nullable();
            $table->string('submitted_by', 50)->nullable();
            $table->string('verified_by', 50)->nullable();
            $table->date('dob')->nullable();
            $table->text('permenant_address')->nullable();
            $table->text('communication_address')->nullable();
            $table->integer('status')->nullable();
            $table->integer('created_by')->nullable();
            $table->integer('updated_by')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });

         Schema::table('customer_details_log', function (Blueprint $table) {
            $table->foreign('branch_id')->references('id')->on('branch_details');
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
        Schema::dropIfExists('customer_details_log');
    }
}
