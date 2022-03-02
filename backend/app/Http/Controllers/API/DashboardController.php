<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Redis;
use Illuminate\Http\Request;  
use App\Models\AcTransHead;
use App\Models\AcTransactions;
use App\Models\User;
use App\Models\CustomerDetail;
use App\Models\Role;
use App\Models\FDAccount;
Use Auth;
use Validator;
use Helpers;
use DB;
class DashboardController extends Controller
{

    public function __construct()
    {
    }

	/**
     * get profit loss balance sheet
     * AKHIL MURUKAN
     * @param  \Illuminate\Http\Request  $request
     */
	 
	public function dashboard(Request $request)
    {
		$cachedcustomer = Redis::get('customer');
		$interest_payable = Redis::get('interest_payable');
		$interest_paid = Redis::get('interest_paid');


	  if(isset($cachedcustomer)) {
		  $data['customer'] = json_decode($cachedcustomer, FALSE);
	  }else {
		  $data['customer'] = CustomerDetail::where('status',1)->count();
		  Redis::set('customer', $data['customer']);
	  }
	  
	  if(isset($interest_payable))
	  {
		$data['interest_payable'] = json_decode($interest_payable, FALSE);
	  }else {
		$interst_payable_arr = FDAccount::where('interest_payable','>',0)->get();
		$data['interest_payable'] = array_sum(array_column(json_decode($interst_payable_arr),'interest_payable'));
		Redis::set('interest_payable', $data['interest_payable']);
	  }
	  
	  if(isset($interest_paid))
	  {
		$data['interest_paid'] = json_decode($interest_paid, FALSE);
	  }else {
		$interest_paid_arr = FDAccount::where('interest_paid','>',0)->get();
        $data['interest_paid'] = array_sum(array_column(json_decode($interest_paid_arr),'interest_paid'));
		Redis::set('interest_paid', $data['interest_paid']);
	  }
		
		

		return $data;
    }
	

}
