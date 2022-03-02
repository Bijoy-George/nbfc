<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Role;
use App\Models\Permission;
use App\Models\User;
use App\Models\PermissionGroup;
use Auth;
use Validator;

class RoleManagementController extends Controller
{
     /**
     * Display a listing of the resource.
     * Auther AKHIL MURUKAN
     * @return \Illuminate\Http\Response
     */
    function __construct()
    {
        $this->middleware('permission:role list|role create|role edit|role delete', ['only' => ['index']]);
        $this->middleware('permission:role create', ['only' => ['store']]);
        $this->middleware('permission:role edit', ['only' => ['edit','store']]);
        $this->middleware('permission:role delete', ['only' => ['destroy']]);
    }
	
	/**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request)
    {
        $page=$request->get('page');
        $data = [];
        $search_keyword = $request->search_keyword;
        $status = $request->status;
        $pagination_limit=$request->post('pagination_limit') ?? config('constant.PAGINATION_LIMIT');
        $data['data'] = Role::where('status',$status);
        $data['permissions'] = Permission::select('id','permission_name','permission_group_id')->where('status',config('constant.STATUS.ACTIVE'))->get();
		$data['permission_grup']=PermissionGroup::orderBy('id','ASC')->get();
		
		if(isset($search_keyword) && !empty($search_keyword))
		{
			$data['data']->where('role_name','ILike','%'.$search_keyword.'%');				
		}
        if(isset($page) && !empty($page))
        {
            $data['data'] = $data['data']->orderBy('id','DESC')->paginate($pagination_limit);
        }
        else
        {
            $data['data'] =  $data['data']->orderBy('id','DESC')->get();
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
        try
        {
        $role = $request->role_name;
        $roleId = $request->post('id');

        $rule=[      
            'role_name'            => 'required|min:3|unique:roles,role_name,'.(!empty($roleId) ? $roleId : 'NULL').',id,deleted_at,NULL',    
        ];
         
        $validator = Validator::make($request->all(),$rule);
            if ($validator->fails()) {
                 $result_arr['status']= False;
                $result_arr['response'] = $validator->errors();
                return json_encode($result_arr);
            }
        $permissions = $request->check_list;
		if(empty($permissions))
		{
            $result_arr['status']= False;
            $result_arr['response'] = ['permission' => 'Please select the permission'];
		    return json_encode($result_arr);
		}


        foreach($permissions as $perm)
        {
            $permission_arr[] = $perm['id'];
        }
        $access_permission = serialize($permission_arr);

        $roleData = [
            'role_name' => $role,
            'access_permission' => $access_permission,
            'status' => 1,
        ];
        
        if(!isset($roleId) && empty($roleId))
        {
            Role::create($roleData);
            return response()->json(["message" => "Role Created Successfully","status"=>True]);
        }
        else
        {
            $data = Role::where('id',$roleId)->update($roleData);
      
            return response()->json(["message" => "Role Updated Successfully","status"=>True]);
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
        $data = Role::find($id);
        $data->access_permission = unserialize($data->access_permission);
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
    public function deactivate(Request $request)
    {
        $status = Request('status');
        $id = $request->delete_id;
        if (User::where('role_id', $id)->exists()) {
            return response()->json(["message" => "The users are include in this role So Can't Delete", "status" => false]);
        }
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
				$data=Role::where('id',$id)->update(['status'=>$status]);
				return response()->json(["message" => $msg." success","status"=>True]);
			}
			else{
				return response()->json(["message" => "Something went wrong.please try again after some time","status"=>False]);
			}
		} 
    }
}
