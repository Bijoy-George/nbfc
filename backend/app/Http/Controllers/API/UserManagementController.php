<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Validator;
use App\Models\User;
use App\Models\Role;
use DB;
Use Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;

class UserManagementController extends Controller
{

     /**
     * Display a listing of the resource.
     * Auther AKHIL MURUKAN
     * @return \Illuminate\Http\Response
     */
    function __construct()
    {
        $this->middleware('permission:user list|user create|user edit|user delete', ['only' => ['index']]);
        // $this->middleware('permission:user activate', ['only' => ['userDeactivate']]);
        $this->middleware('permission:user change password', ['only' => ['changePassword']]);
        $this->middleware('permission:user create', ['only' => ['store']]);
        $this->middleware('permission:user edit', ['only' => ['edit','store']]);
        $this->middleware('permission:user delete', ['only' => ['destroy']]);
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
        $role_id = Role::select('id')
                        ->where('role_name',config('constant.ROLES.customer_attendant'))->value('id');
        $userList =  User::with('role')->where('status',$status);
 
		if(isset($search_keyword) && !empty($search_keyword))
		{
			$userList->where(function ($userList) use ($search_keyword) {
				
				$userList->where('name','ilike','%'.$search_keyword.'%');
				$userList->where('email','ilike','%'.$search_keyword.'%');
				$userList->where('phone_number','ilike','%'.$search_keyword.'%');
			}); 				
		}
        if(isset($page) && !empty($page))
        {
           $userList = $userList->orderBy('id','DESC')
                        ->paginate($pagination_limit);
        }
        else
        {
            $userList =  $userList->orderBy('id','DESC')
                        ->with('role')->get();

        }

	    $data['data'] =$userList;
        return $userList;

        
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

            $userId = $request->post('id');
            $branch_id = $request->branch_id;
			$password = $request->post('password');
			$password = trim($password);
			
            $roleId = $request->role_id;

			if(isset($userId) && !empty($userId))
			{
				$rule=[
					'name'           => 'required|string|min:2|max:50',
					'username'      => 'required|string|min:2|max:50|unique:users,username,'.(!empty($userId) ? $userId : 'NULL'),
					'email'          => 'required|regex:/^([a-z0-9\+_\-]+)(\.[a-z0-9\+_\-]+)*@([a-z0-9\-]+\.)+[a-z]{2,6}$/ix|unique:users,email,'.(!empty($userId) ? $userId : 'NULL').',id,deleted_at,NULL,branch_id,' . $branch_id,
					'phone_number'          => 'required|regex:/[0-9]{12}/|max:12|unique:users,phone_number,'.(!empty($userId) ? $userId : 'NULL').',id,deleted_at,NULL,branch_id,' . $branch_id, 
					'address'        => 'required',
					'role_id'        => 'required',
					'branch_id'        => 'required',
				];
			}
			else{
				$rule=[
				'name'           => 'required|string|min:2|max:50',
				'username'      => 'required|string|min:2|max:50|unique:users,username,'.(!empty($userId) ? $userId : 'NULL'),
				'email'          => 'required|regex:/^([a-z0-9\+_\-]+)(\.[a-z0-9\+_\-]+)*@([a-z0-9\-]+\.)+[a-z]{2,6}$/ix|unique:users,email,'.(!empty($userId) ? $userId : 'NULL').',id,deleted_at,NULL,branch_id,' . $branch_id,
				'phone_number'          => 'required|regex:/[0-9]{12}/|max:12|unique:users,phone_number,'.(!empty($userId) ? $userId : 'NULL').',id,deleted_at,NULL,branch_id,' . $branch_id, 
				'password'        => 'required|min:8',
				'address'        => 'required',
				'role_id'        => 'required',
				'branch_id'        => 'required',
			];
				
			}

    
            $messages = [
                    'role_id.required' =>'The Role field is required.'

            ];

    
            $validator = Validator::make($request->all(),$rule,$messages);
                if ($validator->fails()) {
                     $result_arr['status']= False;
                    $result_arr['response'] = $validator->errors();
                    return json_encode($result_arr);
                }

			if(isset($userId) && !empty($userId))
			{
                $userData = [
                    'branch_id' => $request->branch_id,
                    'name' => $request->name,
                    'email' => $request->email,
                    'phone_number' => $request->phone_number,
                    'username' => $request->username,
                    'role_id' => $request->role_id,
                    'address' => $request->address,
                    'status'   => config('constant.ACTIVE'),
                ];
			}
			else{
				  $userData = [
                    'branch_id' => $request->branch_id,
                    'name' => $request->name,
                    'email' => $request->email,
                    'phone_number' => $request->phone_number,
                    'username' => $request->username,
                    'password' => $password ? Hash::make($password) : 'null',
                    'role_id' => $request->role_id,
                    'address' => $request->address,
                    'status'   => config('constant.ACTIVE'),
                ];
			}

    
                if(!isset($userId) && empty($userId))
                { 
                    $data=User::create($userData);
                    return response()->json(["message" => "User Created Successfully","status"=>True]);
        
                  
                }
                else{
                    
                    $data=User::where('id',$userId)->update($userData);
                    return response()->json(["message" => "User Updated Successfully","status"=>True]);
        
                }
            }
            catch(\Illuminate\Database\QueryException $ex)
			{
				return $error      = $ex->getMessage();
				$data       = array('message'=>'DB_ERROR','status'=>false);
				//$api_call_log->updateLog($apilogid,$branch_id,$data,$error);
				return $data;
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
		$custdata = User::whereId($id)
                    ->first();
	    $data['data'] = $custdata;
		return $data;
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
    public function destroy($id)
    {
        $user = User::find($id);
        if($user)
        {
			$user->delete();
			return response()->json(["message" => "User Deleted Successfully","status"=>True]);
        }
        else
        {
            return response()->json(["message" => "Something went wrong.please try again after some time","status"=>False]);
        }




    }
    public function userDeactivate(Request $request)
    {
        $status = Request('status');
        $user_id = $request->delete_id;
        if(isset($user_id) && !empty($user_id) && isset($status) && !empty($status))
		{
			if(isset($user_id) && !empty($user_id))
			{
				if($status == config('constant.ACTIVE'))
				{
					$msg = 'Deactivation';
                    $status = config('constant.INACTIVE');
				}else{
					$msg = 'Activation';
                    $status = config('constant.ACTIVE');

				}
				$data=User::where('id',$user_id)->update(['status'=>$status]);
				return response()->json(["message" => $msg." success","status"=>True]);
			}
			else{
				return response()->json(["message" => "Something went wrong.please try again after some time","status"=>False]);
			}
		} 
    }

    public function getRole()
    {
        return Role::select('id','role_name')->get();
				
    }

   

    public function changePassword(Request $request)
    {
         $user_id=$request->post('id');
        $rule=[
            'id'=>'required',
             'password' =>  'required|min:8'
        ];
        $password =$request->post('password');
		$password = trim($password);
        $hashpassword = $password ? Hash::make($password) : 'null';
        $validator = Validator::make($request->all(),$rule);
            if ($validator->fails()) {
                 $result_arr= array('status'=>config('constant.API_INACTIVE'),);
                $result_arr['response'] = $validator->errors();
                return json_encode($result_arr);
            }

        $user_data=User::find($user_id);
        $data=User::where('id',$user_id)->update(['password'=>$hashpassword]);
        return response()->json(["message" => "Password Has Been Successfully changed","status"=>True]);
    }
}
