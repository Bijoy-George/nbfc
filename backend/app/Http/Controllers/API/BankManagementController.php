<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Bank;
use Auth;
use Validator;

class BankManagementController extends Controller
{
	
	 /**
     * Display a listing of the resource.
     * Auther AKHIL MURUKAN
     * @return \Illuminate\Http\Response
     */
    function __construct()
    {
        $this->middleware('permission:bank list|bank create|bank edit|bank delete', ['only' => ['index']]);
        $this->middleware('permission:bank create', ['only' => ['store']]);
        $this->middleware('permission:bank edit', ['only' => ['edit','store']]);
        $this->middleware('permission:bank delete', ['only' => ['destroy']]);
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
        $data = Bank::where('status',$status);
        if(isset($search_keyword) && !empty($search_keyword))
        {
            $data->where('bank_name','ILike','%'.$search_keyword.'%');
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
            $bId = $request->post('id');
          $rule=[
              
              'bank_name'   => 'required|min:3|unique:bank,bank_name,'.(!empty($bId) ? $bId : 'NULL').',id,deleted_at,NULL',
              'branch_name'   => 'required',
              'branch_code'   => 'required|min:3',
              'account_no'   => 'required|numeric|min:14',
              'ifsc'   => 'required|min:5',
              'ac_date'   => 'required',
              'opening_balance'   => 'required|numeric',
              'status'   => 'required',
              
          ];
           
          $validator = Validator::make($request->all(),$rule);
              if ($validator->fails()) {
                   $result_arr['status']= False;
                  $result_arr['response'] = $validator->errors();
                  return json_encode($result_arr);
              }

              if(!isset($bId) && empty($bId))
              {
      
                 $data = Bank::create(
				 ['bank_name' => $request->bank_name,
				 'branch_name' => $request->branch_name,
				 'branch_code' => $request->branch_code,
				 'account_no' => $request->account_no,
				 'ifsc' => $request->ifsc,
				 'opening_balance' => $request->opening_balance,
				 'ac_date' => $request->ac_date,
				 'status' => $request->status]);
                 return response()->json(["message" => "Bank Created Successfully","status"=>True]);
              }
              else{
                  $data = Bank::where('id',$bId)->update(
				  ['bank_name' => $request->bank_name,
				 'branch_name' => $request->branch_name,
				 'branch_code' => $request->branch_code,
				 'account_no' => $request->account_no,
				 'ifsc' => $request->ifsc,
				 'opening_balance' => $request->opening_balance,
				 'ac_date' => $request->ac_date,
				  'status' => $request->status]);
      
                   return response()->json(["message" => "Bank Updated Successfully","status"=>True]);
      
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
        return Bank::find($id);
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
        $status = Request('status');
        $id = $request->delete_id;
        if(isset($id) && !empty($id) && isset($status) && !empty($status))
		{
			if(isset($id) && !empty($id))
			{
				if($status == config('constant.ACTIVE'))
				{
					$msg = 'Deactivation';
                    $status = config('constant.INACTIVE');
				}else{
					$msg = 'Activation';
                    $status = config('constant.ACTIVE');

				}
				$data=Bank::where('id',$id)->update(['status'=>$status]);
				return response()->json(["message" => $msg." success","status"=>True]);
			}
			else{
				return response()->json(["message" => "Something went wrong.please try again after some time","status"=>False]);
			}
		} 
    }
	

}
