<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateFdAccountDetailsLogTriggerTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        DB::unprepared('CREATE FUNCTION fd_account_details_log_trigger() RETURNS trigger AS $$
 
        BEGIN
     
    
                        INSERT INTO fd_account_details_log(fd_id,operation,customer_id, fd_number,scheme_id,open_date,closed_date,maturity_date,deposit_amount,maturity_amount,withdrawal_amount,premature_withdrawal,interest_rate,incentive_rate,reason,mode,interest_payable,interest_paid,renewal_date,automatic_renewal,premature_cut_rate,premature_cut_amount,premature_paid_amount,tds_percent,tds_on_closing,has_lien,agent_id,commission_percent,commission_amount,open_submitted_by,open_verified_by,closure_submitted_by,closure_verified_by,due_date,cheque_number,status,created_at, updated_at)
                        VALUES(NEW.id,TG_OP,NEW.customer_id,NEW.fd_number,NEW.scheme_id,NEW.open_date,NEW.closed_date,NEW.maturity_date,NEW.deposit_amount,NEW.maturity_amount,NEW.withdrawal_amount,NEW.premature_withdrawal,NEW.interest_rate,NEW.incentive_rate,NEW.reason,NEW.mode,NEW.interest_payable,NEW.interest_paid,NEW.renewal_date,NEW.automatic_renewal,NEW.premature_cut_rate,NEW.premature_cut_amount,NEW.premature_paid_amount,NEW.tds_percent,NEW.tds_on_closing,NEW.has_lien,NEW.agent_id,NEW.commission_percent,NEW.commission_amount,NEW.open_submitted_by, NEW.open_verified_by,NEW.closure_submitted_by,NEW.closure_verified_by,NEW.due_date,NEW.cheque_number,NEW.status,now(), now() );
    
                        RETURN NEW;
                
    
        END;
    
     
        $$ LANGUAGE plpgsql SECURITY DEFINER;
    
    
        CREATE TRIGGER fd_account_details_log_trigger BEFORE INSERT  ON fd_account_details
        
                FOR EACH ROW EXECUTE PROCEDURE fd_account_details_log_trigger();
        ');   
        
    
        // Trigger for update
    
        DB::unprepared('CREATE FUNCTION fd_account_details_log_update_trigger() RETURNS trigger AS $$
     
        BEGIN
     
    
                        INSERT INTO fd_account_details_log(fd_id,operation,customer_id, fd_number,scheme_id,open_date,closed_date,maturity_date,deposit_amount,maturity_amount,withdrawal_amount,premature_withdrawal,interest_rate,incentive_rate,reason,mode,interest_payable,interest_paid,renewal_date,automatic_renewal,premature_cut_rate,premature_cut_amount,premature_paid_amount,tds_percent,tds_on_closing,has_lien,agent_id,commission_percent,commission_amount,open_submitted_by,open_verified_by,closure_submitted_by,closure_verified_by,due_date,cheque_number,status,created_at, updated_at)
                        VALUES(NEW.id,TG_OP,NEW.customer_id,NEW.fd_number,NEW.scheme_id,NEW.open_date,NEW.closed_date,NEW.maturity_date,NEW.deposit_amount,NEW.maturity_amount,NEW.withdrawal_amount,NEW.premature_withdrawal,NEW.interest_rate,NEW.incentive_rate,NEW.reason,NEW.mode,NEW.interest_payable,NEW.interest_paid,NEW.renewal_date,NEW.automatic_renewal,NEW.premature_cut_rate,NEW.premature_cut_amount,NEW.premature_paid_amount,NEW.tds_percent,NEW.tds_on_closing,NEW.has_lien,NEW.agent_id,NEW.commission_percent,NEW.commission_amount,NEW.open_submitted_by, NEW.open_verified_by,NEW.closure_submitted_by,NEW.closure_verified_by,NEW.due_date,NEW.cheque_number,NEW.status,now(), now() );
    
                        RETURN NEW;
                
    
        END;
    
     
        $$ LANGUAGE plpgsql SECURITY DEFINER;
    
    
        CREATE TRIGGER fd_account_details_log_update_trigger BEFORE UPDATE  ON fd_account_details
        
                FOR EACH ROW EXECUTE PROCEDURE fd_account_details_log_update_trigger();
        ');  
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
       
        \DB::statement('DROP function IF EXISTS fd_account_details_log_trigger() cascade;');
        \DB::statement('DROP function IF EXISTS fd_account_details_log_update_trigger() cascade;');
        \DB::statement("DELETE FROM public.migrations where migration  LIKE '%fd_account_details_log_trigger%';");
    }
}
