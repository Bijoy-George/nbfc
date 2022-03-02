<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Permission;
use App\Models\PermissionGroup;
use Auth;
use Validator;

class PermissionManagementController extends Controller
{
	
	 /**
     * Display a listing of the resource.
     * Auther AKHIL MURUKAN
     * @return \Illuminate\Http\Response
     */
    function __construct()
    {
        $this->middleware('permission:permission list|permission create|permission edit|permission delete', ['only' => ['index']]);
        $this->middleware('permission:permission create', ['only' => ['store']]);
        $this->middleware('permission:permission edit', ['only' => ['edit','store']]);
        $this->middleware('permission:permission delete', ['only' => ['destroy']]);
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
        $data = Permission::where('status',$status);
        if(isset($search_keyword) && !empty($search_keyword))
        {
            $data->where('permission_name','ILike','%'.$search_keyword.'%');
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
            $permId = $request->post('id');
          $rule=[
              
              'permission_name'   => 'required|min:3|unique:permissions,permission_name,'.(!empty($permId) ? $permId : 'NULL').',id,deleted_at,NULL',
              'status'   => 'required',
              
          ];
           
          $validator = Validator::make($request->all(),$rule);
              if ($validator->fails()) {
                   $result_arr['status']= False;
                  $result_arr['response'] = $validator->errors();
                  return json_encode($result_arr);
              }

              if(!isset($permId) && empty($permId))
              {
      
                 $data = Permission::create(['permission_name' => $request->permission_name,'permission_group_id' => $request->permission_group_id,'status' => $request->status]);
                 return response()->json(["message" => "Permission Created Successfully","status"=>True]);
              }
              else{
                  $data = Permission::where('id',$permId)->update(['permission_name' => $request->permission_name,'permission_group_id' => $request->permission_group_id,'status' => $request->status]);
      
                   return response()->json(["message" => "Permission Updated Successfully","status"=>True]);
      
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
        return Permission::find($id);
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
				$data=Permission::where('id',$id)->update(['status'=>$status]);
				return response()->json(["message" => $msg." success","status"=>True]);
			}
			else{
				return response()->json(["message" => "Something went wrong.please try again after some time","status"=>False]);
			}
		} 
    }
	
	public function get_perm_group()
    {
        return PermissionGroup::select('id', 'permission_groupname')->orderBy('id','ASC')->get();
    }
}
