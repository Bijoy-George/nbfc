<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class NotificationBell extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
         Schema::create('notification', function (Blueprint $table) {
            $table->id();
            $table->integer('branch_id')->unsigned()->comment('Referred from branch_details');
            $table->integer('cust_id')->unsigned()->comment('Referred from customer_details');
			$table->string('title')->nullable();
            $table->string('note')->nullable();
            $table->string('url')->nullable();
            $table->tinyInteger('status')->nullable()->comment('1-unread,2-read');
            $table->integer('created_by')->nullable();
            $table->integer('updated_by')->nullable();
            $table->softDeletes();
            $table->timestamps();
        });
		
		 Schema::table('notification', function(Blueprint $table) {
            $table->foreign('branch_id')->references('id')->on('branch_details')->onDelete('cascade');
			$table->foreign('cust_id')->references('id')->on('customer_details')->onDelete('cascade');
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
