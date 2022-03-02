<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromCollection;
use App\Models\FDAccount;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class IntrestReportExport implements FromCollection, WithHeadings, WithMapping
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
        $data =  FDAccount::with('getCustomer.getBranch:id,branch_name', 'getNominee', 'getScheme:id,scheme_name,fd_duration');
        $search_keyword = $this->data['search_keyword'];
        $report_type = $this->data['report_type'];
        if (isset($search_keyword) && !empty($search_keyword)) {
            $data->where(function ($query) use ($search_keyword) {

                $query->where('fd_number', 'ILIKE', '%' . $this->search . '%');
            });
        }
        // $data =  $data->orderBy('id', 'DESC')->get();

        $export_data    = array();

        foreach ($data->cursor() as $report) {
            $reportData           = array();
            $reportData['first_name']  = $report->getCustomer->first_name;
            $reportData['branch_name']  = $report->getCustomer->getBranch->branch_name;
            $reportData['dob']  = $report->getCustomer->dob;
            $reportData['mobile']  = $report->getCustomer->mobile;
            $reportData['email']  = $report->getCustomer->email;
            $reportData['fd_number']  = $report->fd_number;
            $reportData['scheme_name']  = $report->getScheme->scheme_name ?? '';
            $reportData['deposit_amount']  = $report->deposit_amount;
            $reportData['fd_duration']  = $report->getScheme->fd_duration * 12 . " Months";
            $reportData['open_date'] = $report->open_date;
            $reportData['maturity_date'] = $report->maturity_date;
            $reportData['closed_date'] = $report->closed_date;
            $reportData['interest_rate'] = $report->interest_rate;
            $reportData['interest_payable'] = $report->interest_payable;
            $reportData['maturity_amount'] = $report->maturity_amount;

            $export_data[] = $reportData;
        }
        $export_data    = collect($export_data);

        return $export_data;
    }

    public function headings(): array
    {
        if ($this->data['report_type'] == 'interest') {
            return [
                'Customer Name',
                'Branch',
                'FD number',
                'Scheme Name',
                'Deposit Amount',
                'Tenure',
                'Start Date',
                'Maturity Date',
            ];
        } else {
            return [
                'Customer Name',
                'Branch',
                'DOB',
                'Mobile',
                'Email',
                'FD number',
                'Scheme Name',
                'Deposit Amount',
                'Tenure',
                'Start Date',
                'Maturity Date',
                'Interest Rate',
                'Payable Interest',
                'Maturity Amount',
                'Close Date'
            ];
        }
    }

    public function map($export_data): array
    {
        if ($this->data['report_type'] == 'interest') {
            return [
                $export_data['first_name'],
                $export_data['branch_name'],
                $export_data['fd_number'],
                $export_data['scheme_name'],
                $export_data['deposit_amount'],
                $export_data['fd_duration'],
                $export_data['open_date'],
                $export_data['maturity_date'],

            ];
        } else {
            return [
                $export_data['first_name'],
                $export_data['branch_name'],
                $export_data['dob'],
                $export_data['mobile'],
                $export_data['email'],
                $export_data['fd_number'],
                $export_data['scheme_name'],
                $export_data['deposit_amount'],
                $export_data['fd_duration'],
                $export_data['open_date'],
                $export_data['maturity_date'],
                $export_data['interest_rate'],
                $export_data['interest_payable'],
                $export_data['maturity_amount'],
                $export_data['closed_date'],

            ];
        }
    }
}
