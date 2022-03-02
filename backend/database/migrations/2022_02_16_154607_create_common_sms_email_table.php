<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateCommonSmsEmailTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
		
		 Schema::create('common_sms_email', function (Blueprint $table) {
            $table->integer('id', true);
            $table->integer('branch_id')->unsigned()->comment('Referred from branch'); 
            $table->integer('user_id')->unsigned()->comment('Referred from users');
            $table->integer('customer_id')->unsigned()->comment('Referred from customer');
			$table->integer('sent_type')->nullable()->comment('1-sms,2-email');
            $table->string('mobile')->nullable();
			$table->string('from', 255)->nullable();
            $table->string('email')->nullable();
            $table->string('subject')->nullable();
			$table->text('email_cc', 65535)->nullable();
            $table->text('content')->nullable();
			$table->string('random_code', 100)->nullable();
            $table->string('response')->nullable();
            $table->string('mail_response')->nullable();
            $table->string('mail_ref_id', 20)->nullable();
            $table->integer('status');
            $table->integer('created_by')->unsigned()->nullable();
            $table->integer('updated_by')->unsigned()->nullable();
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::table('common_sms_email', function (Blueprint $table) {
            $table->foreign('branch_id')->references('id')->on('branch_details')->onDelete('cascade');
            $table->foreign('user_id')->references('id')->on('users');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('common_sms_email');
    }
}
