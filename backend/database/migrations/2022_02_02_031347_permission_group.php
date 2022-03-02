<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class PermissionGroup extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
         Schema::create('permission_group', function (Blueprint $table) {
            $table->integer('id', true);
            $table->string('permission_groupname');
            $table->integer('created_by')->nullable();
			$table->integer('updated_by')->nullable();
            $table->timestamps();
            $table->softDeletes();
        }); 
		
		 Schema::table('permissions', function (Blueprint $table) {
            $table->integer('permission_group_id')->nullable();
        });
        Schema::table('permissions', function (Blueprint $table) {
			$table->foreign('permission_group_id')->references('id')->on('permission_group')->onDelete('cascade');
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
