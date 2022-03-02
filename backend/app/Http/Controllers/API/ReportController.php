<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\FDAccount;
use App\Models\CustomerDetail;
use App\Models\AcTransactions;
use Illuminate\Support\Facades\Auth;
use App\Exports\IntrestReportExport;
use App\Exports\IntrestTransExport;
use Maatwebsite\Excel\Facades\Excel;


class ReportController extends Controller
{
    public function getReport(Request $request)
    {
        try {
            $page = $request->get('page');
            $status = $request->get('status');
            $search_keyword = $request->search_keyword;
            $pagination_limit = $request->post('pagination_limit') ?? config('constant.PAGINATION_LIMIT');
            $data =  FDAccount::with('getCustomer.getBranch:id,branch_name', 'getNominee', 'getScheme:id,scheme_name,fd_duration')->orderBy('customer_id', 'DESC');

            if (isset($search_keyword) && !empty($search_keyword)) {
                $data->where(function ($query) use ($search_keyword) {

                    $query->where('fd_number', 'ILIKE', '%' . $search_keyword . '%');
                });
            }
            if(Auth::user()->role_id != 1)
            {
                $data->where('branch_id',Auth::user()->branch_id);
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

    public function interestReport(Request $request)
    {
        try {
            $page = $request->get('page');
            $status = $request->get('status');
            $status == 'paid' ? $status = 1 : $status = 2;
            $search_keyword = $request->search_keyword;
            $pagination_limit = $request->post('pagination_limit') ?? config('constant.PAGINATION_LIMIT');
            $data =  AcTransactions::select('customer_details.status as customer_status', 'ac_transactions.*', 'customer_details.*', 'fd_account_details.*', 'branch_details.branch_name', 'deposit_schemes.fd_duration', 'deposit_schemes.scheme_name')
                ->where('ac_type', 'fixed_deposit_interest')
                ->where('debit_credit', 'Dr')
                ->where('ac_transactions.status', $status)
                ->leftJoin('fd_account_details', 'fd_account_details.id', 'ac_transactions.ac_type_id')
                ->rightJoin('deposit_schemes', 'fd_account_details.scheme_id', 'deposit_schemes.id')
                ->rightJoin('customer_details', 'fd_account_details.customer_id', 'customer_details.id')
                ->leftJoin('branch_details', 'branch_details.id', 'customer_details.branch_id');

            if (isset($search_keyword) && !empty($search_keyword)) {
                $data->where(function ($query) use ($search_keyword) {

                    // $query->where('fd_number', 'ILIKE', '%' . $search_keyword . '%');
                });
            }
            if (isset($page) && !empty($page)) {
                $data = $data->orderBy('ac_transactions.id', 'DESC')
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

    public function exportInterestReport(Request $request)
    {
        $data = [
            'search_keyword' => $request->search_keyword,
            'report_type' => $request->report_type
        ];
        return Excel::download(new IntrestReportExport($data), 'report.xlsx');
    }

    public function exportTransactionReport(Request $request)
    {
        $data = [
            'search_keyword' => $request->search_keyword,
            'status' => $request->status
        ];

        return Excel::download(new IntrestTransExport($data), 'report.xlsx');
    }
}
