<?php


namespace App;

use App\Models\User;
use App\Models\AcTransHead;
use App\Models\AcTransactions;
use App\Models\AcTransactionsDetails;
use App\Models\Role;
use App\Models\Permission;
use App\Models\Customer;
use App\Models\Notification;
use DB;
use Auth;
use Carbon\Carbon;

class Helpers {

     /*AKHIL MURUKAN*/
    static function CheckPermission($permissions=''){

        $permis_array = explode('|', $permissions);
	
        $access_permission = array();
        $role_id = Auth::user()->role_id;
        if(!empty($role_id))
        {
           $user_data = Role::where('id',$role_id)->get();
            if(!empty($user_data) && $user_data->count())
            {
                
                foreach ($user_data as $value)
                {
                    
                    if(!empty($value))
                    {
                        $access_permission = unserialize($value->access_permission);
						
						if(!empty($access_permission))
						{
							/*foreach ($access_permission as $row)
							{
									$access_perm[]=$row['permission_name'];
							}*/
						   $access_permission_n = Permission::select('permission_name')->whereIn('id',$access_permission)->get();
						   
							foreach ($access_permission_n as $row)
							{
									$access_perm[]=$row['permission_name'];
							}
							
						}
                    }
					
                    if(!empty($permis_array) && !empty($access_perm))
                    {
                        foreach ($permis_array as $permis)
                        {
                             if(in_array($permis, $access_perm)){return true;}
                        }
                    }
                }
            }
        }
        return false;
	} 
	
	public static function get_permsission_names()
	{	
		$role_id = Auth::User()->role_id;
		$role_data = Role::find($role_id);
		$permissions = $role_data->access_permission;
		if(isset($permissions) && !empty($permissions))
		{
		$role_perm_arr=unserialize($permissions);

		$datas=Permission::select('permission_name')->WhereIn('id',$role_perm_arr)->get();
		$arr=[];
		foreach($datas as $data)
		{
			$arr[]=$data->permission_name;
		}
		}
		else{
			return [];
		}	
	
		return $arr;
	}
	/*
	* To check the unique accounting name
	* @param
	* Author: AKHIL MURUKAN
	* Date: 28.01.2021
	*/
	public static function CheckUniqueAcName($branch_id = false, $accounts_head = false){
		if($branch_id && $accounts_head){
			$current_slug = str_replace(' ', '_', strtolower($accounts_head));
			$res = AcTransHead::select('id')->where('branch_id',$branch_id)->where('head_slug',$current_slug)->count();
			if($res > 0){
				return false;
			}else{
				return  $current_slug;
			}
		}else{
			return 'invalid_inputs';
		}
	}

	/*
	* To save the unique accounting name
	* @param branch_id
	* Author: AKHIL MURUKAN
	* Date: 28.01.2021
	*/
	public static function SaveUniqueAcName($accounting = false, $debit_credit = false,$amount = false, $branch_id = false, $accounts_head = false, $current_slug = false, $head_slug = false, $ac_type_id = false, $limit_amount = false,$status=false)
	{
	
		if($branch_id AND $accounts_head AND $current_slug AND $head_slug){

			$res = AcTransHead::select('id')->where('branch_id',$branch_id)->where('head_slug',$current_slug)->count();
			if($res > 0){
				return False;
			}else{
				$parent_head = AcTransHead::select('id','debit_credit')->where('branch_id',$branch_id)->where('head_slug',$head_slug)->first();
		
				if($parent_head)
				{

				$head = [
		            'branch_id' => $branch_id,
		            'parent_head' => $parent_head->id,
		            'debit_credit' => $parent_head->debit_credit,
		            'accounts_head' => $accounts_head,
		            'head_slug' => $current_slug,
		            'accounting' => $accounting,
		            'limit_amount' => $limit_amount,
		            'ac_type' => $head_slug,
		            'ac_type_id' => $ac_type_id,	
		            'status' => config('constant.ACTIVE'),
		            'created_by' => Auth::User()->id,
		            'updated_by' => Auth::User()->id
		        	];
					if(AcTransHead::create($head)){


						if($amount > 0){
							$trans_id = time().rand(100,999);
							
							$t_head = AcTransHead::select('id')->where('branch_id',$branch_id)
                            ->where('head_slug',$current_slug)->first();
			                if($t_head){
								AcTransactions::updateOrCreate(
			                        [
			                            'head_id' => $t_head->id,
			                            'branch_id' => $branch_id,
			                        ],
			                        [
			                            'trans_id' => $trans_id,
			                            'debit_credit' => $debit_credit,
			                            'head_id' => $t_head->id,
			                            'amount' => $amount,
			                            'status' => $status,
			                        ]
			                        );
			                  //  $t_head->status = config('constant.ACTIVE');
			                   // $t_head->save();
			                }
						}




						return 'added_successfully';
					}else{
						return "something_wrong";
					}
				}
			}
		}else{
			return 'invalid_inputs';  
		}
		
	}
	
	

	/*
	* To update the unique accounting name
	* @param branch_id
	* Author: Elavarasi
	* Date: 22.03.2021
	*/
	public static function UpdateUniqueAcName($accounting = false, $debit_credit = false,$amount = false, $branch_id = false, $accounts_head = false, $old_slug = false, $head_slug = false, $limit_amount = false,$status =1)
	{ 
				
		if($branch_id AND $accounts_head AND $old_slug AND $head_slug){
			$current_slug = str_replace(' ', '_', strtolower($accounts_head));
			$old_rec = AcTransHead::select('id','head_slug')->where('branch_id',$branch_id)->where('head_slug',$old_slug)->first();
			if(!$old_rec)
			{
				return FALSE ;
			}


			if($current_slug == $old_slug AND $head_slug == $old_rec->head_slug){
				return 'no_change';
			}

			if($current_slug != $old_slug || $head_slug != $old_rec->head_slug){
				$res = AcTransHead::select('id')->where('branch_id',$branch_id)->where('head_slug',$current_slug)->count();

				if($res > 0 AND $current_slug != $old_slug){
					return 'already_exists';
				}else{
					$parent_head = AcTransHead::select('id','debit_credit')->where('branch_id',$branch_id)->where('head_slug',$head_slug)->first();
					if($old_rec)
					{
						
					   /******** checking the edited record date is day closed or not**********/
						 $dayclosetransexist = AcTransactions::select('ac_date')                            
										->where('head_id',$old_rec->id)
										->where('ac_type',"opening_balance")
										->where('branch_id',$branch_id)->value('ac_date');
										
						$isdayclose  = Helpers::IsDayclose($dayclosetransexist);
						if($isdayclose == config('constant.ACTIVE'))
						{
							return 'day_closed';		
						}		
						/***********************/
						
						$get_current_op_date = Helpers::getConfgDate(Auth::user()->id);
						$configuration_date = Helpers::getConfgDate();
						
						$ac_trans_head = AcTransHead::find($old_rec->id);
						$ac_trans_head->accounts_head = $accounts_head;
						$ac_trans_head->head_slug = $current_slug;
						$ac_trans_head->parent_head = $parent_head->id;
						$ac_trans_head->ac_type = $head_slug;
						$ac_trans_head->status = config('constant.ACTIVE');
						$ac_trans_head->limit_amount = $limit_amount;
						
						if($ac_trans_head->save())
						{
								/*$trans_id = AcTransactions::select('id')                            
												->where('head_id',$old_rec->id)
												->where('ac_type',"opening_balance")
												->where('branch_id',$branch_id)->value('id');
								if($trans_id && ($get_current_op_date == $configuration_date))
								{
							//		AcTransactions::find($trans_id)->forceDelete();
								}
								$res = AcTransHead::where('branch_id',$branch_id)
										->where('head_slug',$current_slug)->first();
								if($res)
								{
									$head_id = $res->id;
									$trans_id = AcTransactions::select('id')                            
												->where('head_id',$head_id)
												->where('branch_id',$branch_id)->value('id');

									if($trans_id && ($get_current_op_date == $configuration_date))
									{
									//	AcTransactions::find($trans_id)->forceDelete();
									}

									//$res->forceDelete();
								}*/
								
								if($amount >= 0)
								{
									$trans_id = time().rand(100,999);
									$pump_details = Pump::find($branch_id);
									$config_date = $pump_details->confg_date;
									if(isset($config_date) && !empty($config_date))
									{
										$op_date = Helpers::getConfgDate(Auth::User()->id);
									}
									
									$t_head = AcTransHead::select('id')
												->where('branch_id',$branch_id)
												->where('head_slug',$current_slug)->first();
									if($t_head)
									{
										$transexist = AcTransactions::select('ac_date')                            
												->where('head_id',$t_head->id)
												->where('ac_type',"opening_balance")
												->where('branch_id',$branch_id)->value('ac_date');
										
										if($transexist)
										{
											$op_date = $transexist;
											$isdayclose  = Helpers::IsDayclose($op_date);
											if($isdayclose == config('constant.ACTIVE'))
											{
												$op_date = Helpers::getConfgDate(Auth::User()->id);
											}
										}											
										 AcTransactions::updateOrCreate(
											[
												'head_id' => $t_head->id,
												'branch_id' => $branch_id,
												'ac_type' => "opening_balance",
											],
											[
												'trans_id' => $trans_id,
												'debit_credit' => $debit_credit,
												'head_id' => $t_head->id,
												'amount' => $amount,
												'status' => $status,
												'ac_date' => $op_date,
												'ac_type' => "opening_balance",
											]
											);
									}
									
								}
							return ['success' => TRUE,'slug' => $current_slug];
				        }else{
				        	return "something_wrong";
				        }
					}
					else
					{
						return "no_record";
					}
					
				}
			}

		}else{
			return 'invalid_inputs';
		}
	}

	
	public static function random_value()
	{
      $number = mt_rand(1000000000, 9999999999); 

    if (Helpers::unique_random_number($number)) {
        return random_value();
    }

    return $number;
	}
	public static function unique_random_number($number)
	 {

    	return AcTransactions::where('trans_id',$number)->exists();
     }
	/*
	Purpose: To save_ac_trans
	*AKHIL MURUKAN
	*04-02-2022
    */	
    public static function save_ac_trans($dr_ac,$cr_ac,$branch_id,$amount,$trans_id,$ac_type,$account_type_id,$edit_id,$op_date,$note,$status=null,$extra_details = null,$trans_details=array())
    {
    	if(isset($status) && !empty($status))
            {
            	$status = $status;
            }
            else
            {
            	$status = config('constant.ACTIVE'); 
            }
             

			if(isset($edit_id) && !empty($edit_id) && isset($trans_id) && !empty($trans_id) && isset($account_type_id) && !empty($account_type_id))
			{
				$oldData = AcTransactions::where('ac_type_id',$account_type_id)
                                                ->where('branch_id',$branch_id)
                                                ->where('ac_type',$ac_type)
                                                ->forceDelete();
			    $oldData1 = AcTransactionsDetails::where('ac_trans_id',$trans_id)
                                                ->where('branch_id',$branch_id)
                                                ->forceDelete();
                 
				$edit_id = null;
			}
			
            if(!empty($branch_id) AND !empty($branch_id) AND !empty($dr_ac) AND !empty($cr_ac) AND !empty($amount) AND !empty($trans_id) AND !empty($ac_type) AND !empty($account_type_id) AND !empty($op_date))
            {
				
				$dr_rec=AcTransHead::where('head_slug',$dr_ac)->where('branch_id',$branch_id)->first();
             	$cr_rec=AcTransHead::where('head_slug',$cr_ac)->where('branch_id',$branch_id)->first();
             	if($dr_rec AND $cr_rec)
                {
					
					AcTransactions::create([
					   'branch_id' => $branch_id,
					   'head_id' => $dr_rec->id,
					   'head_id_p' => $cr_rec->id,
					   'amount'  => $amount,
					   'status'  => $status,
					   'trans_id' => $trans_id,
					   'ac_type' => $ac_type,
					   'ac_type_id' => $account_type_id,//primary key of data create 
					   'ac_date' => $op_date,
					   'debit_credit' => "Dr",
					   
					]);
					AcTransactions::create([
					   'branch_id' => $branch_id,
					   'head_id' => $cr_rec->id,
					   'head_id_p' => $dr_rec->id,
					   'amount'  => $amount,
					   'status'  => $status,
					   'trans_id' => $trans_id,
					   'ac_type' => $ac_type,
					   'ac_type_id' => $account_type_id,//primary key of data create 
					   'ac_date' => $op_date,
					   'debit_credit' => "Cr",
					]);
					
					AcTransactionsDetails::updateOrCreate([
					   'ac_trans_id' => $trans_id,
					   'branch_id' => $branch_id,
						 ],
					   [
						'description' => $note,
						'extra_details' =>$extra_details,
					   ]);
					if(count($trans_details) > 0 )
					{
						AcTransactionsDetails::updateOrCreate([
					   'ac_trans_id' => $trans_id,
					   'branch_id' => $branch_id,
						 ],
					   [
						'description' => $note,
						'extra_details' =>$extra_details,
						'interest_rate' =>$trans_details['interest_rate']?$trans_details['interest_rate']:'',
						'interest_amount' =>$trans_details['interest_amount']?$trans_details['interest_amount']:'',
					   ]);
					}					   


					return "success";
             	}
				
					
            }
            else
            {
                return "failure";
            }
        
    
    }
	
	public static function save_notifications($branch_id, $cust_id, $note, $status,$title, $url=null)
	{

		Notification::updateOrCreate(
						[
							 'branch_id' => $branch_id,
					         'cust_id' => $cust_id,
					         'title' => $title,
						],
						[
							'note'  => $note,
					        'status'  => $status,
					        'url' => $url,
						]);	

		return response()->json(["message" => "Saved successfully","status"=>True]);

	}
	public static function save_email_sms($branch_id, $cust_id=null, $user_id=null, $sent_type,$mobile=null, $email=null,$email_cc=null,$subject,$content,$random_code)
	{

		$mail_arr = CommonSmsEmail::Create(
										[
										'branch_id' => $branch_id,
										'cust_id' => $cust_id,
										'user_id' => $user_id,
										'sent_type' => $sent_type,
										'mobile' => $mobile,
										'from' => $from,
										'email' => $email,
										'email_cc' => $email_cc,
										'subject' => $subject,  
										'content' => $content,  
										'random_code' => $random_code, 
										'response' => 'notsent',
										'mail_response' => '',
										'status' => config('constant.INACTIVE')
									   ]);

		return response()->json(["message" => "Saved successfully","status"=>True]);

	}

	 
	
}



