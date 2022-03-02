<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateUsersTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('username');
            $table->string('email')->unique();
            $table->timestamp('email_verified_at')->nullable();
            $table->string('password');
            $table->bigInteger('role_id');
            $table->string('permission',50)->nullable();
            $table->bigInteger('branch_id')->nullable();
            $table->string('country_code', 15)->nullable();
            $table->string('phone_number', 50)->nullable();
            $table->string('address')->nullable();
            $table->string('account_details')->nullable();
            $table->rememberToken();
            $table->integer('status')->nullable();
            $table->integer('created_by')->nullable();
            $table->integer('updated_by')->nullable();
            $table->softDeletes();
            $table->timestamps();
        });
        Schema::table('users', function (Blueprint $table) {
            // $table->foreign('role_id')->references('id')->on('roles');
            // $table->foreign('branch_id')->references('id')->on('branch_details');
            
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('users');
    }
}
