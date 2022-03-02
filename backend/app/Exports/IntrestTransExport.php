<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use App\Models\AcTransactions;

class IntrestTransExport implements FromCollection, WithHeadings, WithMapping
{
    /**
     * @return \Illuminate\Support\Collection
     */

    public $data;

    function __construct($data)
    {
        $this->data = $data;
    }


    public function collection()
    {
        $search_keyword = $this->data['search_keyword'];
        $status = $this->data['status'];
        $status == 'paid' ? $status = 1 : $status = 2;


        $data =  AcTransactions::select('customer_details.status as customer_status', 'ac_transactions.*', 'customer_details.*', 'fd_account_details.*', 'branch_details.branch_name', 'deposit_schemes.fd_duration', 'deposit_schemes.scheme_name')
            ->where('ac_type', 'fixed_deposit_interest')
            ->where('debit_credit', 'Dr')
            ->where('ac_transactions.status', $status)
            ->leftJoin('fd_account_details', 'fd_account_details.id', 'ac_transactions.ac_type_id')
            ->rightJoin('deposit_schemes', 'fd_account_details.scheme_id', 'deposit_schemes.id')
            ->rightJoin('customer_details', 'fd_account_details.customer_id', 'customer_details.id')
            ->leftJoin('branch_details', 'branch_details.id', 'customer_details.branch_id');

        if (isset($search_keyword) && !empty($search_keyword)) {
            $results->where(function ($query) use ($search_keyword) {

                // $query->where('fd_number', 'ILIKE', '%' . $search_keyword . '%');
            });
        }

        $export_data    = array();

        foreach ($data->cursor() as $report) {
            $reportData           = array();

            $reportData['first_name'] = $report->first_name;
            $reportData['branch_name'] = $report->branch_name;
            $reportData['fd_number'] = $report->fd_number;
            $reportData['deposit_amount'] = $report->deposit_amount;
            $reportData['fd_duration'] = $report->fd_duration * 12 . ' Months';
            $reportData['open_date'] =  $report->open_date;
            $reportData['due_date'] = $report->ac_date;
            $reportData['interest_rate'] = $report->interest_rate;
            $reportData['interest_payable'] = $report->interest_payable;
            $reportData['status'] = $report->customer_status == 1 ? "ACTIVE" : "INACTIVE";
            $export_data[] = $reportData;

        }
        $export_data    = collect($export_data);

        return $export_data;
    }
    public function headings(): array
    {
        return [
            'Customer Name',
            'Branch',
            'FD number',
            'Deposit Amount',
            'Tenure',
            'Open Date',
            'Due Date',
            'Interest Rate',
            'Interest Payable',
            'Status'
        ];
    }
    public function map($export_data): array
    {
        return [
            $export_data['first_name'],
            $export_data['branch_name'],
            $export_data['fd_number'],
            $export_data['deposit_amount'],
            $export_data['fd_duration'],
            $export_data['open_date'],
            $export_data['due_date'],
            $export_data['interest_rate'],
            $export_data['interest_payable'],
            $export_data['status'],

        ];
    }

}
