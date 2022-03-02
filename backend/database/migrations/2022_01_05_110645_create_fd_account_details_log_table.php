<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateFdAccountDetailsLogTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('fd_account_details_log', function (Blueprint $table) {
            $table->id();
            $table->bigInteger('fd_id')->unsigned();
            $table->bigInteger('customer_id')->unsigned();
            $table->string('fd_number',50);
            $table->integer('scheme_id');
            $table->date('open_date')->nullable();
            $table->date('closing_date')->nullable();
            $table->date('maturity_date')->nullable();
            $table->decimal('deposit_amount')->nullable();
            $table->decimal('maturity_amount')->nullable();
            $table->decimal('withdrawal_amount')->nullable();
            $table->decimal('premature_withdrawal')->nullable();
            $table->decimal('interest_rate')->nullable();
            $table->decimal('incentive_rate')->nullable();
            $table->string('reason')->nullable();
            $table->string('mode',50)->nullable();
            $table->decimal('interest_payable',15,2)->nullable();
            $table->decimal('interest_paid',15,2)->nullable();
            $table->date('renewal_date')->nullable();
            $table->date('automatic_renewal')->nullable();
            $table->decimal('premature_cut_rate')->nullable();
            $table->decimal('premature_cut_amount')->nullable();
            $table->decimal('premature_paid_amount')->nullable();
            $table->decimal('tds_percent')->nullable();
            $table->decimal('tds_on_closing')->nullable();
            $table->boolean('has_lien')->default(false);
            $table->integer('agent_id')->nullable();
            $table->decimal('commission_percent')->nullable();
            $table->decimal('commission_amount')->nullable();
            $table->integer('open_submitted_by')->nullable();
            $table->integer('open_verified_by')->nullable();
            $table->integer('closure_submitted_by')->nullable();
            $table->integer('closure_verified_by')->nullable();
            $table->tinyInteger('status')->nullable();
            $table->integer('created_by')->nullable();
            $table->integer('updated_by')->nullable();
            $table->timestamps();
            $table->softDeletes();

        });
        Schema::table('fd_account_details_log', function (Blueprint $table) {
            $table->foreign('fd_id')->references('id')->on('fd_account_details');
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
        Schema::dropIfExists('fd_account_details_log');
    }
}
