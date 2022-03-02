<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddNewFieldsToFdAccountDetailsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('fd_account_details', function (Blueprint $table) {
            $table->integer('bank_id')->nullable();
            $table->tinyInteger('receipt_issued')->nullable();
        });

        Schema::table('fd_account_details_log', function (Blueprint $table) {
            $table->integer('bank_id')->nullable();
            $table->tinyInteger('receipt_issued')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('fd_account_details', function (Blueprint $table) {
            $table->dropColumn('bank_id');
            $table->dropColumn('receipt_issued');
        });

        Schema::table('fd_account_details_log', function (Blueprint $table) {
            $table->dropColumn('bank_id');
            $table->dropColumn('receipt_issued');
        });
    }
}
