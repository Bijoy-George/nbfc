<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\CustomerDetail;
use Illuminate\Http\Request;
use App\Models\FDAccount;
use App\Models\CronLog;
use App\Models\AcTransHead;
use Illuminate\Support\Carbon;
use Helpers;
use Illuminate\Support\Facades\DB;


class CronController extends Controller
{
    public function interestCalculation()
    {
        $cron_log    = new CronLog;
        $cron_logid           = $cron_log->createLog('monthly_interest_calculation');
        // try{
        $today = date('Y-m-d');
        $monthlyDeposit =  FDAccount::where('mode', config('constant.INTEREST_MODE.MONTHLY'))->where('due_date', $today)->with('getScheme')->get();

        foreach ($monthlyDeposit  as $deposit) {
            if ($deposit->maturity_date > $today) {

                $interestAmount = $deposit->interest_amount;
                $fdDuration = $deposit->getScheme->fd_duration;
                $totalMonths = $fdDuration * 12;
                $monthlyInterest = round($interestAmount / $totalMonths);
                $deposit->interest_payable = $monthlyInterest;
                $nextDueDate = Carbon::parse($deposit->due_date)->addMonth(1);
                $nextDueDate = $nextDueDate->format('Y-m-d');
                $deposit->due_date = $nextDueDate;
                DB::beginTransaction();
                $deposit->save();
                $cdata = CustomerDetail::find($deposit->customer_id);
                $trans_id = Helpers::random_value();
                $cr_ac = "cash_in_hand";
                $parentId = AcTransHead::where('branch_id', $cdata->branch_id)
                    ->where('ac_type', 'fixed_deposit_interest')->where('ac_type_id',$deposit->id)->value('id');
                $heaSlug = AcTransHead::where('id',$parentId)->value('head_slug');
                $dr_ac = $heaSlug;

                $ac_type = "fixed_deposit_interest";
                $note = "fixed_deposit_interest";

                $account_type_id = $deposit->id;
                $edit_id = null;
                $op_date = $deposit->due_date;
                $trasDetails = ['interest_rate' => $deposit->interest_rate,'interest_amount' => $monthlyInterest];


                $data = Helpers::save_ac_trans($dr_ac, $cr_ac,$cdata->branch_id,$monthlyInterest, $trans_id, $ac_type, $account_type_id,$edit_id, $op_date, $note,$status=config('constant.PAYMENT_STATUS.NOT_PAID'),null,$trasDetails);
                DB::commit();

            }
        }
        // }
        //     catch(\Illuminate\Database\QueryException $ex){
        //         $error      = $ex->getMessage();
        //         $cron_log->updateLog($cron_logid,$error);
        // }
    }
}
