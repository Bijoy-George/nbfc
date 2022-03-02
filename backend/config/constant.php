<?php
return [

	'FRONT_END_URL'			=> 'http://localhost:3000',
    'PAGINATION_LIMIT' => 10,
    'ACTIVE'			=> 1,
	'INACTIVE'			=> 2,
	'REJECTED'			=> 3,



	'STATUS' => [
        'ACTIVE' => 1,
		'INACTIVE' => 2
    ],
    'gender' => [
        1 => 'Male',
    2 => 'Female'
    ],

    'profile_status' => [
        'registration_complted' => 1,
        'deposited' => 2,
    ],

    'profile_status_rev' => [
        1 =>  'Registration Completed',
        2 => 'Deposit',
    ],

    'interest_schedule' => [
        'monthly' => 1,
        'quarterly' => 2,
        'half_yearly' => 3,
        'yearly' => 4,
    ],

    'interest_schedule_rev' => [
        1 => 'monthly',
        2 => 'quarterly',
        3 => 'half yearly',
        4 => 'yearly',
    ],
	
	 'AC_DEFAULT_HEAD' => [
		1 => array('Bank Accounts','bank_accounts','BS','Dr',1),
		2 => array('Bank Charges','bank_charges','BS','Dr',2),
		3 => array('Employee Benefit Expenses','employee_benefit_expenses','BS','Dr',3),
		4 => array('Fixed Asset','fixed_asset','BS','Dr',4),
		5 => array('Fixed Deposit','fixed_deposit','BS','Dr',5),
		6 => array('Loan From Directors','loan_from_directors','BS','Dr',6),
		7 => array('Recurring Deposit','recurring_deposit','BS','Dr',7),
		8 => array('Recurring Deposit Interest','recurring_deposit_interest','BS','Dr',8),
		9 => array('SL Loan','sl_loan','BS','Dr',9),
		10 => array('SL Loan Interest','sl_loan_interest','BS','Dr',10),
		11 => array('Cash','cash','BS','Dr',11),
		12 => array('Fixed Deposit Interest','fixed_deposit_interest','BS','Dr',12),

		],
		'Bank_Accounts'			=> 'bank_accounts',
		
		'AC_DEFAULT_HEAD_BANK' => array(
					['accounts_head' => 'SBI Adoor',
					'head_slug' => 'sbi_adoor',
					'debit_credit' => 'Cr',
					'status' => 1,
					'accounting' => "BS"],
					['accounts_head' => 'SBI TVM',
					'head_slug' => 'sbi_tvm',
					'debit_credit' => 'Cr',
					'status' => 1,
					'accounting' => "BS"],
					['accounts_head' => 'Axis Bank',
					'head_slug' => 'axis',
					'debit_credit' => 'Cr',
					'status' => 1,
					'accounting' => "BS"],
					['accounts_head' => 'Federal Bank',
					'head_slug' => 'federal',
					'debit_credit' => 'Cr',
					'status' => 1,
					'accounting' => "BS"],
					),

        'DEPOSIT_STATUS' => [
            'DEPOSIT_CREATED' => 1,
            'NOMINEE_ADDED' => 2,

        ],
        'INTEREST_MODE' => [
            'CUMULATION' => 1,
            'MATURITY' => 2,
            'MONTHLY' => 3

        ],
        'PAYMENT_STATUS' => [
            "PAID" => 1,
            "NOT_PAID" => 2,
        ],
        'PAYMENT_MODE' => [
            'CASH' => 1,
            'BANK' => 2,
        ]
    
];
