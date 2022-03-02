<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Branch;
use App\Models\Bank;
use App\Models\AcTransHead;
use App\Models\CustomerDetail;
use Auth;
use DB;
use Validator;

class BranchManagementController extends Controller
{
     /**
     * Display a listing of the resource.
     * Auther AKHIL MURUKAN
     * @return \Illuminate\Http\Response
     */
    function __construct()
    {
        $this->middleware('permission:branch list|branch create|branch edit|branch delete', ['only' => ['index']]);
        $this->middleware('permission:branch create', ['only' => ['store']]);
        $this->middleware('permission:branch bank create', ['only' => ['save_bank']]);
        $this->middleware('permission:branch edit', ['only' => ['edit','store']]);
        $this->middleware('permission:branch delete', ['only' => ['destroy']]);
    }
	/**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request)
    {
        $page=$request->get('page');
        $status=$request->get('status');
        $search_keyword = $request->search_keyword;
        $pagination_limit=$request->post('pagination_limit') ?? config('constant.PAGINATION_LIMIT');
        $data = Branch::where('status',$status);
        if(isset($search_keyword) && !empty($search_keyword))
        {
            $data->where('branch_name','ILike','%'.$search_keyword.'%');
        }
        if(isset($page) && !empty($page))
        {
            $data = $data->orderBy('id','DESC')->paginate($pagination_limit);
        }
        else
        {
           $data =  $data->orderBy('id','DESC')->get();
        }

		foreach($data as $dat)
		{
			$bank = AcTransHead::select('id')->where('branch_id',$dat->id)->where('head_slug','bank_accounts')->first();
			if(isset($bank->id) && !empty($bank->id)) 
			{
				$dat['bank'] = AcTransHead::where('status',config('constant.ACTIVE'))->where('branch_id', $dat->id)->where('parent_head', $bank->id)->get();
			}
		}
        return $data;

    }

    /**
     * Show the form for creating a new resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        try{
            $Id = $request->post('id');
          $rule=[
              
              'branch_name'            => 'required|min:3|unique:branch_details,branch_name,'.(!empty($Id) ? $Id : 'NULL').',id,deleted_at,NULL',
              'branch_code'            => 'required|min:3|unique:branch_details,branch_code,'.(!empty($Id) ? $Id : 'NULL').',id,deleted_at,NULL',
              'address'                => 'required|min:3',
              'status'                => 'required',
			  'email' 				   => 'required|string|email|max:255|unique:branch_details,email,'.(!empty($Id) ? $Id : 'NULL').',id,deleted_at,NULL',
			  'phone_number' 		   => 'required|numeric|regex:/[0-9]{12}/',
			  'pincode' 		   => 'required|numeric|regex:/[0-9]{6}/',
              
          ];
           
          $validator = Validator::make($request->all(),$rule);
              if ($validator->fails()) {
                   $result_arr['status']= False;
                  $result_arr['response'] = $validator->errors();
                  return json_encode($result_arr);
              }
					$userData = [
							'branch_name' => $request->branch_name,
							'branch_code' => $request->branch_code,
							'address' => $request->address,
							'phone_number' => $request->phone_number,
							'email' => $request->email,
							'pincode' => $request->pincode,
							'status' => $request->status,
						];
              if(!isset($Id) && empty($Id))
              {
      
                 $data = Branch::create($userData);
				 $this->SetDefaultTransHead($data->id);
                 return response()->json(["message" => "Branch Created Successfully","status"=>True]);
              }
              else{
                  $data = Branch::where('id',$Id)->update($userData);
      
                   return response()->json(["message" => "Branch Updated Successfully","status"=>True]);
      
              }
  
        }
        catch (Exception $ex) {
            return response()->json(["message" => "Something went wrong.please try again after some time","status"=>False]);
           }
    }

    /**
     * Display the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function edit($id)
    {
        return Branch::find($id);
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function deactivate(Request $request)
    {
        $id = request('delete_id');
        $status = request('status');
        $branch = Branch::findOrFail($id);
        if(CustomerDetail::where('status',config('constant.ACTIVE'))->where('branch_id',$id)->exists())
        {
            return response()->json(["message" => "Brach Have Active Customers So Can't Delete", "status" => false]);

        }
        
        if($branch)
        {
            if($status == config('constant.ACTIVE'))
				{
					$msg = 'Deactivation';
                    $status = config('constant.INACTIVE');
				}else{
					$msg = 'Activation';
                    $status = config('constant.ACTIVE');

				}
				$data=Branch::where('id',$id)->update(['status'=>$status]);

                return response()->json(["message" => $msg." success","status"=>True]);
        }
        else
        {
            return response()->json(["message" => "Something went wrong.please try again after some time","status"=>False]);
        }
    }
	
	public static function SetDefaultTransHead($branch_id = false)
	{
		$res = AcTransHead::select('id')->where('branch_id',$branch_id)->count();
		if($res > 0){
			return "already_added";
		}else{
			$default_heads = config('constant.AC_DEFAULT_HEAD');
			foreach ($default_heads as $dh) {
				$heads[] = [
	            'branch_id' => $branch_id,
	            'parent_head' => 0,
	            'accounts_head' => $dh[0],
	            'head_slug' => $dh[1],
	            'accounting' => $dh[2],
	            'debit_credit' => $dh[3],
	            'head_flag' => $dh[4],
	            'status' => (isset($dh[5])?$dh[5]:1),
	        	];
			}
			AcTransHead::insert($heads);
			
			
			$cash = AcTransHead::select('id')->where('branch_id',$branch_id)->where('head_slug','cash')->first();
		//	$bank = AcTransHead::select('id')->where('branch_id',$branch_id)->where('head_slug','bank_accounts')->first();
			
			if(isset($cash->id) && !empty($cash->id))
			{
				$sub_heads = array([
					'branch_id' => $branch_id,
					'parent_head' => $cash->id,
					'accounts_head' => 'Cash In Hand',
					'head_slug' => 'cash_in_hand',
					'debit_credit' => 'Dr',
					'status' => 1,
					'accounting' => "BS",
					],
					/*['branch_id' => $branch_id,
					'parent_head' => $bank->id,
					'accounts_head' => 'Bank 1',
					'head_slug' => 'bank_1',
					'debit_credit' => 'Cr',
					'status' => 1,
					'accounting' => "BS",
					],*/
					);
				AcTransHead::insert($sub_heads);
			}
		}
	}
	 public function getBank(Request $request)
    {
        $branchId = request('branch_id');
		$data['bank'] = array();
		$bank = AcTransHead::select('id')->where('branch_id',$branchId)->where('head_slug','bank_accounts')->first();
		 if(isset($bank->id) && !empty($bank->id)) 
		 {
			 $data['bank'] = AcTransHead::where('branch_id', $branchId)->where('parent_head', $bank->id)
            ->orderBy('id', 'DESC')
            ->paginate(10);
		 }
        
		$bname = Branch::find($branchId);
		
		$data['bname'] = $bname->branch_name;
		
		return $data;	
    }
	
	 public function getBankName()
    {
        return $default_heads_bank = Bank::select(DB::raw("concat(bank_name,' ', branch_name) as ac_head"))->where('status',config('constant.ACTIVE'))->get();
    }
	
	 public function save_bank(Request $request)
    {
		
        $branch_id = $request->branch_id;

        $rule = [
            'bank_id' => 'required',
            'status' => 'required',
        ];


        $validator = Validator::make($request->all(), $rule);
        if ($validator->fails()) {
            $result_arr['status'] = False;
            $result_arr['response'] = $validator->errors();
            return json_encode($result_arr);
        }
		$accounts_head = $request->bank_id;
		$head_slug = str_replace(' ', '_', strtolower($accounts_head));;
		//$default_heads_bank = config('constant.AC_DEFAULT_HEAD_BANK');
		/*$default_heads_bank = Bank::select(DB::raw("concat(bank_name,' ', branch_name) as ac_head"))->where('status',config('constant.ACTIVE'))->get();
		foreach($default_heads_bank as $dh)
		{
			if($dh['ac_head'] ==  $request->bank_id)
			{
				$accounts_head = $dh['ac_head'];
			}
		}*/
		$bank = AcTransHead::select('id')->where('branch_id',$branch_id)->where('head_slug','bank_accounts')->first();
        if($branch_id && isset($bank->id) && !empty($bank->id) && $accounts_head) {
			
           $sub_heads = array([
					'branch_id' => $branch_id,
					'parent_head' => $bank->id,
					'accounts_head' => $accounts_head,
					'head_slug' => $head_slug,
					'debit_credit' => 'Dr',
					'status' => $request->status,
					'accounting' => "BS",
					]
					);
				AcTransHead::insert($sub_heads);

            $Data = AcTransHead::where('branch_id', $branch_id)->where('parent_head', $bank->id)
                ->orderBy('id', 'DESC')->paginate(10);
			
            return response()->json(["message" => "Bank Added Successfully", "status" => True, 'Data' => $Data]);
        } else {
            return response()->json(["message" => "Something went wrong.please try again after some time", "status" => false]);
        }
    }
	public function branch_bank_activate(Request $request)
	{
		 $status = $request->status;
        $id = $request->id;
        if(isset($id) && !empty($id) && isset($status) && !empty($status))
		{
			if(isset($id) && !empty($id))
			{
				if($status == config('constant.INACTIVE'))
				{
					$msg = 'Activate';
					$upstatus = config('constant.ACTIVE');
				}else{
					$msg = 'Deactivated';
					$upstatus = config('constant.INACTIVE');
				}
				$data=AcTransHead::where('id',$id)->update(['status'=>$upstatus]);
					
				return response()->json(["message" => $msg." Successfully","status"=>True]);
			}
			else{
				return response()->json(["message" => "Something went wrong.please try again after some time","status"=>False]);
			}
		} 
	}
	
}
