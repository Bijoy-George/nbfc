<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Redis;
use Illuminate\Http\Request;
use App\Models\User;
use App\Models\CustomerDetail;
use App\Models\Branch;
use App\Models\KYCType;
use App\Models\CustomerKYC;
use App\Models\DepositScheme;
use App\Models\FDAccount;
use App\Models\AcTransactions;
use App\Models\Nominee;
use App\Models\AcTransHead;
use Validator;
use Auth;
use Helpers;
use App\Http\Requests\DepositRequest;
use FFI\CData;
use Illuminate\Support\Carbon;



class CustomerProfileController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request)
    {
        try {
            $page = $request->get('page');
            $status = $request->get('status');
            $search_keyword = $request->search_keyword;
            $branch_id = $request->branch_id;
            $pagination_limit = $request->post('pagination_limit') ?? config('constant.PAGINATION_LIMIT');
            $data =  CustomerDetail::where('status', $status);

            if (isset($search_keyword) && !empty($search_keyword)) {
                $data->where(function ($query) use ($search_keyword) {

                    $query->where('first_name', 'ILIKE', '%' . $search_keyword . '%')
                        ->orWhere('email', 'ILIKE', '%' . $search_keyword . '%')
                        ->orWhere('account_number', 'ILIKE', '%' . $search_keyword . '%')
                        ->orWhere('mobile', 'ILIKE', '%' . $search_keyword . '%');
                });
            }
            if (isset($branch_id) && !empty($branch_id)) {
                $data->where('branch_id', $branch_id);
            }
            if (isset($page) && !empty($page)) {
                $data = $data->orderBy('id', 'DESC')
                    ->paginate($pagination_limit);
            } else {
                $data =  $data->orderBy('id', 'DESC')->get();
            }
            return $data;
        } catch (\Illuminate\Database\QueryException $ex) {
            $error      = $ex->getMessage();
            return $error;
            $data       = array('message' => 'DB_ERROR', 'status' => false);
            return $data;
        }
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

            $rule = [
                'first_name' => 'required|regex:/^[a-zA-Z]+$/u|max:50',
                'phone' => 'required|regex:/[0-9]{10}/|max:12',
                'email' => 'required|regex:/^([a-z0-9\+_\-]+)(\.[a-z0-9\+_\-]+)*@([a-z0-9\-]+\.)+[a-z]{2,6}$/ix',
                'aadhar' => 'nullable|digits:12',
                'pan_number' => 'nullable|size:10',
            ];


            $validator = Validator::make($request->all(), $rule);
            if ($validator->fails()) {
                $result_arr['status'] = False;
                $result_arr['response'] = $validator->errors();;
                return json_encode($result_arr);
            }

            $customerId = $request->id;


            $dataArray = [
                'branch_id' => $request->branch,
                'first_name' => $request->first_name,
                'middle_name' => $request->middle_name,
                'last_name' => $request->last_name,
                'gender' => $request->gender,
                'email' => $request->email,
                'country_code' => $request->country_code,
                'mobile' => $request->phone,
                'pan_number' => $request->pan_number,
                'nationality' => $request->nationality,
                'secondary_country_code' => $request->secondary_country_code,
                'secondary_phone' => $request->secondary_phone,
                'guardian' => $request->guardian,
                'occupation' => $request->occupation,
                'election_id' => $request->election_id,
                'aadhar' => $request->aadhar,
                'driving_licence' => $request->driving_licence,
                'joint_holders' => $request->joint_holders,
                'dob' => $request->dob,
                'permenant_address' => $request->permenant_address,
                'communication_address' => $request->communication_address,
                'status' => 1
            ];

            if (!isset($customerId) && empty($customerId)) {

                $customer = CustomerDetail::create($dataArray);
                $accountNumber = 'C' . str_pad($customer->id +  1, 8, "0", STR_PAD_LEFT);
                $customer->account_number = $accountNumber;
                $customer->save();

                return response()->json(["message" => "Customer Created Successfully", "status" => True]);
            } else {
                $update = CustomerDetail::where('id', $customerId)->update($dataArray);
                return response()->json(["message" => "Customer Updated Successfully", "status" => True]);
            }
            $cust_count = CustomerDetail::where('status', 1)->count();
            Redis::set('customer', $cust_count);
        } catch (\Illuminate\Database\QueryException $ex) {
            $error      = $ex->getMessage();
            return $error;
            $data       = array('message' => 'DB_ERROR', 'status' => false);
            return $data;
        }
    }


    public function getBranch()
    {
        return Branch::select('id', 'branch_name')->where('status', config('constant.STATUS.ACTIVE'))->get();
    }
    public function getKyc()
    {
        return KYCType::select('id', 'kyc_type')->get();
    }

    /**
     * Display the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function edit($id)
    {
        return response()->json(['data' => CustomerDetail::findOrFail($id),'status' => true]);
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
    public function changeStatus(Request $request)
    {
        $id = $request->delteId;
        $status = Request('status');
        if (isset($id) && !empty($id) && isset($status) && !empty($status)) {
            if ($status == config('constant.ACTIVE')) {
                $msg = 'Customer Activated successfully';
            } else {
                if (FDAccount::where('customer_id', $id)->exists()) {
                    return response()->json(["message" => "Customer Have Current Deposit Account So Can't Deactivate", "status" => false]);
                }
                $msg = 'Customer Deactivated successfully';
            }
            $data = CustomerDetail::where('id', $id)->update(['status' => $status]);

            return response()->json(["message" => $msg, "status" => True]);
        } else {
            $result_arr = array('status' => False, 'message' => 'Inputs Required');
            return $result_arr;
        }
    }

    //upload KYC DOCS

    public function uploadDoc(Request $request)
    {
        $customerId = $request->customer_id;

        $rule = [
            'kyc_type' => 'required',
            'kyc_doc' => 'required|file|mimes:pdf',
            'doc_no' => 'required'
        ];


        $validator = Validator::make($request->all(), $rule);
        if ($validator->fails()) {
            $result_arr['status'] = False;
            $result_arr['response'] = $validator->errors();
            return json_encode($result_arr);
        }

        if ($request->hasFile('kyc_doc')) {
            $file = $request->file('kyc_doc');
            $fileName = $file->getClientOriginalName();
            $docName = KYCType::where('id', $request->kyc_type)->value('kyc_type');
            $finalName = date('His') . $fileName;
            $file->storeAs('kyc_docs/', $finalName, 'public');
            $customer = CustomerDetail::find($customerId);
            $customer->kyc_type = $request->kyc_type;
            $customer->kyc_doc  =  $docName;
            $customer->save();
            $kycData = CustomerKYC::create([
                'customer_id' => $customerId,
                'branch_id' => $customer->branch_id,
                'kyc_type_id' => $request->kyc_type,
                'doc_name' => $docName,
                'doc_no' => $request->doc_no,
                'file_name' => $finalName,
                'issue_date' => $request->issue_date,
                'expiry_date' => $request->expiry_date,
                'submitted_by' => Auth::user()->id,
                'verified_by' => Auth::user()->id,
                'status' => config('constant.INACTIVE'),
            ]);

            $kycData = CustomerKYC::where('customer_id', $customerId)
                ->orderBy('id', 'DESC')->paginate(10);
            return response()->json(["message" => "KYC Uploaded Successfully", "status" => True, 'kycData' => $kycData]);
        } else {
            return response()->json(["message" => "File Required", "status" => false]);
        }
    }

    public function getCustomerKyc(Request $request)
    {
        $customerId = request('cus_id');
        return CustomerKYC::where('customer_id', $customerId)
            ->orderBy('id', 'DESC')
            ->paginate(10);
    }

    public function downloadKyc(Request $request)
    {
        $fileName = request('file_name');
        $pathToFile = public_path('storage/kyc_docs/' . $fileName);
        return response()->file($pathToFile);
    }


    public function getScheme()
    {
        $branch_id = CustomerDetail::where('id', request('customer_id'))->value('branch_id');
        $bank = AcTransHead::select('id')->where('branch_id', $branch_id)->where('head_slug', 'bank_accounts')->value('id');

        $data['scheme'] = DepositScheme::select('id', 'scheme_name')->get();
        $data['bank_head'] = AcTransHead::where('branch_id', $branch_id)->where('parent_head', $bank)->select('accounts_head', 'id')->get();
        return $data;
    }

    public function createDeposit(DepositRequest $request)
    {
        $deposit = DepositScheme::find($request->scheme_id);
        $p  = $request->deposit_amount;
        $r = $deposit->max_interest + $deposit->max_incentive;
        $dueDate = NULL;
        if ($deposit->interest_type == config('constant.INTEREST_MODE.CUMULATION')) {
            $rate = $r / 4;
            $n = 4 * $deposit->fd_duration;
            $A = $p * (pow((1 + $rate / 100), $n));
            $CI = $A - $p;
        }
        if ($deposit->interest_type == config('constant.INTEREST_MODE.MATURITY')) {
            $n = 1 * $deposit->fd_duration;
            $CI = $p * $n * $r / 100;
        }
        if ($deposit->interest_type == config('constant.INTEREST_MODE.MONTHLY')) {
            $r = $r / 100;
            $n = $deposit->fd_duration;
            $CI = ($p * (pow((1 + $r / 12), 12 * $n))) - $p;
            $dueDate = Carbon::parse($request->open_date)->addMonth(1);
            $dueDate = $dueDate->format('Y-m-d');
        }

        $maturityDate = Carbon::parse($request->open_date)->addYear($deposit->fd_duration);
        $maturityDate = $maturityDate->format('Y-m-d');
        $maturityAmount = $request->deposit_amount + $CI;

        $cdata = CustomerDetail::find($request->customer_id);
        $fdNumber = 'FD' . $cdata->branch_id . str_pad($cdata->id +  1, 8, random_int(100000, 999999), STR_PAD_LEFT);

        if (isset($cdata->branch_id) && !empty($cdata->branch_id)) {
            $accounts_head = $cdata->first_name . " " . $request->scheme_id . " " . $fdNumber;
            $current_slug = Helpers::CheckUniqueAcName($cdata->branch_id, $accounts_head);
        }


        $paymentMode = config('constant.PAYMENT_MODE.CASH');
        if (isset($request->bank_id) && !empty($request->bank_id)) {
            $paymentMode = config('constant.PAYMENT_MODE.BANK');
        }


        $data = FDAccount::updateOrCreate(
            [
                'customer_id' => $request->customer_id,
                'fd_number' => $fdNumber,
            ],
            [
                'scheme_id' => $request->scheme_id,
                'open_date' => $request->open_date,
                'closed_date' => $request->closed_date,
                'maturity_date' => $maturityDate,
                'deposit_amount' => $request->deposit_amount,
                'payment_mode' => $paymentMode,
                'cheque_number' => $request->cheque_number,
                'maturity_amount' => $maturityAmount,
                'interest_rate' => $deposit->max_interest,
                'incentive_rate' => $deposit->max_incentive,
                'interest_amount' => $CI,
                'mode' => $deposit->interest_type,
                'due_date' => $dueDate,
                'bank_id' => $request->bank_id,
                'receipt_issued' => $request->receipt_issued,
                'open_submitted_by' => Auth::user()->id,
                'status' => config('constant.DEPOSIT_STATUS.DEPOSIT_CREATED'),
            ]
        );

        if ($current_slug && isset($cdata->branch_id) && !empty($cdata->branch_id) && !empty($data->id)) {
            $head_slug = "fixed_deposit";
            Helpers::SaveUniqueAcName('BS', 'Cr', 0, $cdata->branch_id, $accounts_head, $current_slug, $head_slug, $data->id, false, 2);


            if (isset($request->bank_id) && !empty($request->bank_id)) {
                $cr_ac = AcTransHead::where('id', $request->bank_id)->value('head_slug');
                $dr_ac = $current_slug;
            } else {
                $dr_ac = "cash_in_hand";
                $cr_ac = $current_slug;
            }


            $trans_id = Helpers::random_value();
            $account_type_id = $data->id;
            $edit_id = null;
            $ac_type = "deposit";
            $note = $request->narration;
            $op_date = $request->open_date;



            //$dr_rec=AcTransHead::where('head_slug',$dr_ac)
            //   ->where('branch_id',$cdata->branch_id)->first();

            // $cr_rec=AcTransHead::where('head_slug',$cr_ac)
            //   ->where('branch_id',$cdata->branch_id)->first();
            $interestSlug = 'fixed_deposit_interest';
            $intAcHead = "INT" . $accounts_head;
            $intAcHeadSlug = "INT_" . $current_slug;
            $account = Helpers::SaveUniqueAcName('BS', 'Cr', 0, $cdata->branch_id, $intAcHead, $intAcHeadSlug, $interestSlug, $data->id, false, 2);

            //	$date = Helpers::SaveUniqueAcName('BS', 'Dr', $request->deposit_amount, $cdata->branch_id, $accounts_head1, $current_slug, $head_slug1, $cdata->id, false, 2);
            $data1 = Helpers::save_ac_trans($dr_ac, $cr_ac, $cdata->branch_id, $request->deposit_amount, $trans_id, $ac_type, $account_type_id, $edit_id, $op_date, $note);
        } else {
            $result_arr = (["status" => false, "message" => "Account Name Already Exists"]);
            return json_encode($result_arr);
        }

        return response()->json(["message" => "Deposit Created Successfully", "status" => True, "fd_id" => $data->id]);
    }

    public function depositList(Request $request)
    {
        try {
            $page = $request->get('page');
            $customerId = $request->get('cust_id');
            $search_keyword = $request->search_keyword;
            $pagination_limit = $request->post('pagination_limit') ?? config('constant.PAGINATION_LIMIT');
            $data['fd_details'] =  FDAccount::with('getScheme:id,scheme_name')->where('customer_id', $customerId);
            $data['customer'] = CustomerDetail::find($customerId);

            if (isset($search_keyword) && !empty($search_keyword)) {
                $data['fd_details']->where(function ($query) use ($search_keyword) {

                    $query->where('fd_number', 'ILIKE', '%' . $search_keyword . '%');
                });
            }
            if (isset($page) && !empty($page)) {
                $data['fd_details'] = $data['fd_details']->orderBy('id', 'DESC')
                    ->paginate($pagination_limit);
            } else {
                $data['fd_details'] =  $data['fd_details']->orderBy('id', 'DESC')->get();
            }
            return $data;
        } catch (\Illuminate\Database\QueryException $ex) {
            $error      = $ex->getMessage();
            return $error;
            $data       = array('message' => 'DB_ERROR', 'status' => false);
            return $data;
        }
    }
    public function nomineeList(Request $request)
    {
        try {
            $page = $request->get('page');
            $customerId = $request->get('cust_id');
            $fdId = $request->get('fd_id');
            $search_keyword = $request->search_keyword;
            $pagination_limit = $request->post('pagination_limit') ?? config('constant.PAGINATION_LIMIT');
            $data =  Nominee::with('getAccount')
                ->where('customer_id', $customerId)
                ->where('fd_id', $fdId);

            if (isset($search_keyword) && !empty($search_keyword)) {
                $data->where(function ($query) use ($search_keyword) {

                    $query->where('fd_number', 'ILIKE', '%' . $search_keyword . '%');
                });
            }
            if (isset($page) && !empty($page)) {
                $data = $data->orderBy('id', 'DESC')
                    ->paginate($pagination_limit);
            } else {
                $data =  $data->orderBy('id', 'DESC')->get();
            }
            return $data;
        } catch (\Illuminate\Database\QueryException $ex) {
            $error      = $ex->getMessage();
            return $error;
            $data       = array('message' => 'DB_ERROR', 'status' => false);
            return $data;
        }
    }

    public function saveNominee(Request $request)
    {
        $nomineeData = $request->nomineeData;
        $data = $request->values;
        $customerId = $data['customer_id'];
        $fdId = $data['fd_id'];
        $phoneData = $request->phone;

        if (!empty($nomineeData)) {
            foreach ($nomineeData as $key =>  $nominee) {
                Nominee::create([
                    'customer_id' => $customerId,
                    'fd_id' => $fdId,
                    'nominee_name' => $nominee['nominee_name'] ?? '',
                    'email' => $nominee['email'] ?? '',
                    // 'country_code' => $nominee['country_code'] ?? '+91',
                    'phone_number' => $phoneData[$key]['phone_number'] ?? '',
                    'relation' => $nominee['relation'] ?? '',
                    'notes' => $nominee['notes'] ?? '',
                    'status' => config('constant.ACTIVE'),
                    'created_by' => Auth::id(),
                    'updated_by' => Auth::id(),
                ]);
            }

            $deposit = FDAccount::find($fdId);
            $deposit->status = config('constant.DEPOSIT_STATUS.NOMINEE_ADDED');
            $deposit->save();
        }

        return response()->json(["message" => "Nominee Added Successfully", "status" => True]);
    }

    public function getDepositDetails(Request $request)
    {
        $branch_id = CustomerDetail::where('id', request('cust_id'))->value('branch_id');
        $bank = AcTransHead::select('id')->where('branch_id', $branch_id)->where('head_slug', 'bank_accounts')->value('id');
        $data = [];
        $data['customer'] = CustomerDetail::find($request->cust_id);
        $data['fdDetails'] = FDAccount::where('id', $request->fdId)->with('getNominee')->first();
        $data['paymentDetails'] = AcTransactions::with('getAcHead:id,accounts_head')
            ->where('ac_type', 'fixed_deposit_interest')
            ->where('ac_type_id', $request->fdId)
            ->where('debit_credit', 'Dr')
            ->orderBy('id', 'DESC')
            ->get();
        $data['bank_head'] = AcTransHead::where('branch_id', $branch_id)->where('parent_head', $bank)->select('accounts_head', 'id')->get();

        return $data;
    }

    public function getDetails($id)
    {
        return DepositScheme::find($id);
    }

    public function payInterest(Request $request)
    {
        $fdId = $request->fd_id;
        $transId = request('trans_id');
        if (isset($request->bank_id) && !empty($request->bank_id)) {
            $transactionId = AcTransactions::where('id', $transId)->value('trans_id');
            $cr_ac = AcTransactions::where('id', $transId)
                ->update(['head_id_p' => $request->bank_id]);
            AcTransactions::where('trans_id', $transactionId)
                ->where('debit_credit', 'Cr')
                ->update(['head_id' => $request->bank_id]);
        }

        $fdAccount = FDAccount::find($fdId);
        $totalInterestPaid = $fdAccount->interest_payable + $fdAccount->interest_paid;
        $intrestPaid = FDAccount::where('id', $fdId)->update(['interest_paid' => $totalInterestPaid]);
        $trans = AcTransactions::whereId($transId)->update(['status' => config('constant.PAYMENT_STATUS.PAID')]);
        return response()->json(["message" => "Payment Done Successfully", "status" => True]);
    }

    public function kycApproval(Request $request)
    {
        $id = $request->delteId;
        $status = request('status');
        if (isset($id) && !empty($id) && isset($status) && !empty($status)) {
            if ($status == config('constant.INACTIVE') || config('constant.REJECTED')) {
                $msg = 'KYC Approved successfully';
                $upstatus = config('constant.ACTIVE');
            } else {
                $msg = 'KYC Rejected successfully';
                $upstatus = config('constant.REJECTED');
            }
            $data = CustomerKYC::where('id', $id)->update(['status' => $upstatus]);

            return response()->json(["message" => $msg, "status" => True]);
        } else {
            $result_arr = array('status' => False, 'message' => 'Inputs Required');
            return $result_arr;
        }
    }
}
