<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;  
use App\Models\AcTransHead;
use App\Models\AcTransactions;
use App\Models\User;
use App\Models\Customer;
use App\Models\Role;
Use Auth;
use Validator;
use Helpers;
use DB;
class AccountsController extends Controller
{

     /**
     * Display a listing of the resource.
     * Auther AKHIL MURUKAN
     * @return \Illuminate\Http\Response
     */
    function __construct()
    {
        $this->middleware('permission:daybook', ['only' => ['daybook']]);
    }

	/**
     * daybook
     * AKHIL MURUKAN
     * @param  \Illuminate\Http\Request  $request
     */
	 
	public function daybook(Request $request)
    {
		$cb_date = $request->post('cb_date');
		$branch_id = $request->post('branch_id');
		$status_type = $request->post('type');
		
		$data['all_list'] =  Helpers::checkPermission('all branch daybook');
		
		if($data['all_list'] === false)
			{
				$branch_id = Auth::user()->branch_id;
			}
		
		if(!isset($cb_date) && empty($cb_date))
		{
			 return response()->json(["message" => "Please Choose Date","status"=>False]);
		}
		if(!isset($branch_id) && empty($branch_id))
		{
			 return response()->json(["message" => "Please Choose Branch","status"=>False]);
		}
		$bank_acc_p_id= AcTransHead::select('id')->where('branch_id',$branch_id)
		->where('ac_transaction_head.head_slug',config('constant.Bank_Accounts'))->first();
		
		if(isset($bank_acc_p_id->id) && !empty($bank_acc_p_id->id))
		{
			$bank_acc_id = AcTransHead::where('ac_transaction_head.parent_head',$bank_acc_p_id->id)->pluck('id');
		}
			$cash_acc_id = AcTransHead::where('ac_transaction_head.head_slug','cash_in_hand')->pluck('id');
		
		
			$trans_dr = AcTransactions::where('ac_transactions.branch_id',$branch_id)->where('ac_transactions.amount','>',0);
		 
			$trans_dr = $trans_dr->select('ac_transactions.status','ac_transaction_details.description','ahead2.head_slug as head_id_p_slug','ahead.accounts_head as title','ahead.head_slug as slug_title','ac_transaction_head.accounts_head',DB::raw("SUM(CASE WHEN ac_transactions.debit_credit = 'Dr' THEN ac_transactions.amount ELSE 0 END) drtamount"),DB::raw("SUM(CASE WHEN ac_transactions.debit_credit = 'Cr' THEN ac_transactions.amount ELSE 0 END) crtamount"),'ac_transactions.head_id as h1','trans.head_id as h2')
					->leftjoin('ac_transactions as trans','trans.head_id_p','ac_transactions.head_id');
					if(isset($bank_acc_id) && !empty($bank_acc_id))
					{
						$trans_dr = $trans_dr->whereNotIn('ac_transactions.head_id',$bank_acc_id);
					}
					if(isset($cash_acc_id) && !empty($cash_acc_id))
					{
						$trans_dr = $trans_dr->whereNotIn('ac_transactions.head_id',$cash_acc_id);
					}
					if(isset($cb_date) && !empty($cb_date))
					{
						$trans_dr = $trans_dr->where('ac_transactions.ac_date',$cb_date);
					}
					
					$trans_dr->leftjoin('ac_transaction_head','ac_transaction_head.id','ac_transactions.head_id')
					->leftjoin('ac_transaction_details','ac_transaction_details.ac_trans_id','ac_transactions.trans_id')
					->leftjoin('ac_transaction_head as ahead','ahead.id','ac_transaction_head.parent_head')
					->leftjoin('ac_transaction_head as ahead2','ahead2.id','trans.head_id')
					//->leftjoin('ac_transaction_head as ahead2','ahead2.id','ahead.parent_head');
					->where('ac_transaction_head.status',config('constant.ACTIVE'))
					->groupby('ac_transaction_head.accounts_head')
					->groupby('ahead.accounts_head')
					->groupby('ac_transactions.head_id')
					->groupby('trans.head_id')
					->groupby('ac_transaction_details.id')
					->groupby('ac_transactions.id')
					->groupby('ahead.id')
					->groupby('ahead2.id')
					->groupby('ac_transaction_head.parent_head');
		$trans_dr = $trans_dr->orderBy('ac_transactions.id','DESC')->get();
		
		$data['trans'] = $trans_dr;
		$bank = array();
		$banks_count = 0;
		if(isset($bank_acc_p_id->id) && !empty($bank_acc_p_id->id))
		{
			$bank = AcTransHead::where('branch_id', $branch_id)->where('parent_head', $bank_acc_p_id->id)->get();
			$banks_count = $bank->count();
		}
		
		$data['banks'] =  $bank;
		$data['banks_count'] =  ($banks_count*2) + 3;
		
		return  $data;
	}
	public function cash_book2(Request $request)
    {
		/*$cb_date = $request->post('cb_date');
		$status_type = $request->post('type');
		
		if(!isset($cb_date) && empty($cb_date))
		{
			 return response()->json(["message" => "Please Choose Date","status"=>False]);
		}

		
       // $trans_dr = AcTransactions::where('ac_transactions.amount','>',0);
			if((isset($cb_date) && !empty($cb_date)))
			{
				//$trans_dr = $trans_dr->where('ac_transactions.ac_date',$cb_date); 
			}
		/*	
			$trans_dr = $trans_dr->select('ahead2.accounts_head  as stitle','ahead.accounts_head as title','ac_transaction_head.accounts_head','ac_transaction_head.parent_head','ac_transactions.head_id',DB::raw("SUM(CASE WHEN ac_transactions.debit_credit = 'Dr' THEN ac_transactions.amount ELSE 0 END) drtamount"),DB::raw("SUM(CASE WHEN ac_transactions.debit_credit = 'Cr' THEN ac_transactions.amount ELSE 0 END) crtamount")); 	
				$trans_dr = $trans_dr->leftjoin('ac_transaction_head','ac_transaction_head.id','ac_transactions.head_id')
					->leftjoin('ac_transaction_head as ahead','ahead.id','ac_transaction_head.parent_head')
					->leftjoin('ac_transaction_head as ahead2','ahead2.id','ahead.parent_head')
					->where('ac_transaction_head.status',config('constant.ACTIVE'))
					->groupby('ac_transactions.head_id')
					->groupby('ac_transactions.trans_id')
					->groupby('ac_transaction_head.accounts_head')
					->groupby('ahead.accounts_head')
					->groupby('ahead.id')
					->groupby('ahead2.id')
					->groupby('ac_transaction_head.parent_head');
		return $trans_dr = $trans_dr->orderBy('ahead.id','DESC')->orderBy('ahead2.id','DESC')->get();*/
		
		
		/************************/
		
	/*	$trans_dr = AcTransactions::where('ac_transactions.branch_id',17)->where('ac_transactions.amount','>',0)->whereNotNull('ac_transactions.head_id_p');
		 
		 $trans_dr = $trans_dr->select('ac_transaction_head.accounts_head  as stitle','ahead.accounts_head as title','ac_transactions.id','ac_transactions.debit_credit','ac_transactions.trans_id','ac_transactions.amount','ac_transactions.head_id as h1','trans.head_id as h2')
					->leftjoin('ac_transactions as trans','trans.head_id_p','ac_transactions.head_id')
					->where('ac_transactions.head_id','!=',117)
					->leftjoin('ac_transaction_head','ac_transaction_head.id','ac_transactions.head_id')
					->leftjoin('ac_transaction_head as ahead','ahead.id','ac_transaction_head.parent_head')
					//->leftjoin('ac_transaction_head as thead','thead.id','trans.head_id_p')
					//->leftjoin('ac_transaction_head as ahead2','ahead2.id','ahead.parent_head');
					->where('ac_transaction_head.status',config('constant.ACTIVE'));*/
		
		/************************************/
		 $trans_dr = AcTransactions::where('ac_transactions.branch_id',17)->where('ac_transactions.amount','>',0)->whereNotNull('ac_transactions.head_id_p');
		 
		 $trans_dr = $trans_dr->select('ac_transaction_details.description','ac_transaction_head.accounts_head  as stitle','ahead.accounts_head as title',DB::raw("SUM(CASE WHEN ac_transactions.debit_credit = 'Dr' THEN ac_transactions.amount ELSE 0 END) drtamount"),DB::raw("SUM(CASE WHEN ac_transactions.debit_credit = 'Cr' THEN ac_transactions.amount ELSE 0 END) crtamount"),'ac_transactions.head_id as h1','trans.head_id as h2')
					->leftjoin('ac_transactions as trans','trans.head_id_p','ac_transactions.head_id')
					->leftjoin('ac_transaction_details','ac_transactions.id','ac_transaction_details.ac_trans_id')
					->where('ac_transactions.head_id','!=',117)
					->leftjoin('ac_transaction_head','ac_transaction_head.id','ac_transactions.head_id')
					->leftjoin('ac_transaction_head as ahead','ahead.id','ac_transaction_head.parent_head')
					//->leftjoin('ac_transaction_head as thead','thead.id','trans.head_id_p')
					//->leftjoin('ac_transaction_head as ahead2','ahead2.id','ahead.parent_head');
					->where('ac_transaction_head.status',config('constant.ACTIVE'))
					->groupby('ac_transaction_head.accounts_head')
					->groupby('ahead.accounts_head')->groupby('ac_transactions.head_id')
					->groupby('trans.head_id')
					->groupby('ac_transactions.id')
					->groupby('ahead.id')
					->groupby('ac_transaction_head.parent_head');
		return $trans_dr = $trans_dr->orderBy('ac_transactions.id','DESC')->get();

    }
	

}
