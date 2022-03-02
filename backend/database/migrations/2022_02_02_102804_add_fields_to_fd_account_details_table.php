<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddFieldsToFdAccountDetailsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('fd_account_details', function (Blueprint $table) {
            $table->tinyInteger('payment_mode')->nullable();
            $table->string('cheque_number',50)->nullable();
            
        });
        Schema::table('fd_account_details_log', function (Blueprint $table) {
            $table->tinyInteger('payment_mode')->nullable();
            $table->string('cheque_number',50)->nullable();
            
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
            $table->dropColumn('payment_mode');
            $table->dropColumn('cheque_number');
            
        });

        Schema::table('fd_account_details_log', function (Blueprint $table) {
            $table->dropColumn('payment_mode');
            $table->dropColumn('cheque_number');
            
        });
    }
}
