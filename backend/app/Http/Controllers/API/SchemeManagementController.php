<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Branch;
use App\Models\FDAccount;
use App\Models\Scheme;
use Auth;
use Validator;

class SchemeManagementController extends Controller
{

    /**
     * Display a listing of the resource.
     * Auther AKHIL MURUKAN
     * @return \Illuminate\Http\Response
     */
    function __construct()
    {
        $this->middleware('permission:scheme list|scheme create|scheme edit|scheme delete', ['only' => ['index']]);
        $this->middleware('permission:scheme create', ['only' => ['store']]);
        $this->middleware('permission:scheme edit', ['only' => ['edit', 'store']]);
        $this->middleware('permission:scheme delete', ['only' => ['destroy']]);
    }
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request)
    {
        $page = $request->get('page');
        $search_keyword = $request->search_keyword;
        $status = $request->status;
        $pagination_limit = $request->post('pagination_limit') ?? config('constant.PAGINATION_LIMIT');
        $data = Scheme::where('status',$status);
        if (isset($search_keyword) && !empty($search_keyword)) {
            $data->where('scheme_name', 'ILike', '%' . $search_keyword . '%');
        }
        if (isset($branch_id) && !empty($branch_id)) {
            $data->where('branch_id',$branch_id);
        }
        if (isset($page) && !empty($page)) {
            $data = $data->orderBy('id', 'DESC')->paginate($pagination_limit);
        } else {
            $data =  $data->orderBy('id', 'DESC')->get();
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
        try {
            $userId = $request->post('id');
            $rule = [

                'scheme_name'            => 'required|min:3|unique:deposit_schemes,scheme_name,' . (!empty($userId) ? $userId : 'NULL') . ',id,deleted_at,NULL',
                'scheme_category' => 'required|string|min:2|max:30',
                'interest_type' => 'required',
                'period_from' => 'required|date',
                'period_to' => 'required|date',
                'fd_duration' => 'required|numeric|min:0',
                'min_incentive' => 'required|numeric|min:0',
                'max_incentive' => 'required|numeric|min:0',
                'min_interest' => 'required|numeric|min:0|max:100',
                'max_interest' => 'required|numeric|min:0|max:100',
                'compounding_period' => 'required|numeric|min:0|max:12',
                'min_amount' => 'required|numeric|min:0',
                'max_amount' => 'required|numeric|min:0',
                'status' => 'required|numeric',
                'accural_or_not' => 'required',
                'commission_percent' => 'required|numeric|min:0|max:100',
            ];

            $validator = Validator::make($request->all(), $rule);
            if ($validator->fails()) {
                $result_arr['status'] = False;
                $result_arr['response'] = $validator->errors();
                return json_encode($result_arr);
            }
            $userData = [
                'scheme_name' => $request->scheme_name,
                'scheme_category'  => $request->scheme_category,
                'interest_type'  => $request->interest_type,
                'fd_duration'  => $request->fd_duration,
                'period_from'  => $request->period_from,
                'period_to'  => $request->period_to,
                'status'  => $request->status,
                'min_interest'  => $request->min_interest,
                'max_interest'  => $request->max_interest,
                'accural_or_not'  => $request->accural_or_not,
                'min_incentive'  => $request->min_incentive,
                'max_incentive'  => $request->max_incentive,
                'compounding_period'  => $request->compounding_period,
                'min_amount'  => $request->min_amount,
                'max_amount'  => $request->max_amount,
                'commission_percent'  => $request->commission_percent,
            ];
            if (!isset($userId) && empty($userId)) {

                $data = Scheme::create($userData);
                return response()->json(["message" => "Scheme Created Successfully", "status" => True]);
            } else {
                $data = Scheme::where('id', $userId)->update($userData);

                return response()->json(["message" => "Scheme Updated Successfully", "status" => True]);
            }
        } catch (Exception $ex) {
            return response()->json(["message" => "Something went wrong.please try again after some time", "status" => False]);
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
        return Scheme::find($id);
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
        if (FDAccount::where('scheme_id', $id)->exists()) {
            return response()->json(["message" => "Scheme connected with Active Deposit Accounts So Can't Delete", "status" => false]);
        }
        if (isset($id) && !empty($id) && isset($status) && !empty($status)) {
            if (isset($id) && !empty($id)) {
                if ($status == config('constant.ACTIVE')) {
                    $msg = 'Deactivation';
                    $status = config('constant.INACTIVE');
                } else {
                    $msg = 'Activation';
                    $status = config('constant.ACTIVE');
                }
                $data = Scheme::where('id', $id)->update(['status' => $status]);
                return response()->json(["message" => $msg . " success", "status" => True]);
            } else {
                return response()->json(["message" => "Something went wrong.please try again after some time", "status" => False]);
            }
        }
    }
}
