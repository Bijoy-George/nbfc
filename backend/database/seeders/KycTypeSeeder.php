<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class KycTypeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        \DB::table('kyc_types')->delete();
        \DB::table('kyc_types')->insert([
            [
                'kyc_type' => 'AADHAR',
                'created_by'=> 1,
                'updated_by'=> 1,
            ],
            [
                'kyc_type' => 'VOTERS ID',
                'created_by'=> 1,
                'updated_by'=> 1,
            ],
            [
                'kyc_type' => 'DRIVING LICENSE',
                'created_by'=> 1,
                'updated_by'=> 1,
            ],
            [
                'kyc_type' => 'PASSPORT',
                'created_by'=> 1,
                'updated_by'=> 1,
            ]
        ]
            );
    }
}
