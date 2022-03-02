<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class DropForeignKeyLogsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('customer_details_log', function (Blueprint $table) {
        $table->dropForeign(['customer_id']);
        });
        Schema::table('fd_account_details_log', function (Blueprint $table) {
        $table->dropForeign(['fd_id']);
        });
        Schema::table('nominee_details_log', function (Blueprint $table) {
        $table->dropForeign(['nominee_id']);
        });
        Schema::table('deposit_schemes_log', function (Blueprint $table) {
        $table->dropForeign(['scheme_id']);
        });
        Schema::table('liablity_details_log', function (Blueprint $table) {
        $table->dropForeign(['liability_id']);
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
