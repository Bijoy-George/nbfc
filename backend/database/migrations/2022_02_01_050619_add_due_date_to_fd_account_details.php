<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddDueDateToFdAccountDetails extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('fd_account_details', function (Blueprint $table) {
            $table->date('due_date')->nullable();
        });

        Schema::table('fd_account_details_log', function (Blueprint $table) {
            $table->date('due_date')->nullable();
            $table->string('operation',50)->nullable();
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
            $table->dropColumn('due_date');
        });
        Schema::table('fd_account_details_log', function (Blueprint $table) {
            $table->dropColumn('due_date');
            $table->dropColumn('operation');
        });
    }
}
