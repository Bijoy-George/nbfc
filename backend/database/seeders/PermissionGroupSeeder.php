<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class PermissionGroupSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        \DB::table('permission_group')->delete();
        
        \DB::table('permission_group')->insert(array (
            0 => 
            array (
                'id' => 1,
                'permission_groupname' => 'permission management',
                'created_at' => '2018-10-13 14:05:32',
                'updated_at' => '2018-10-13 14:05:32',
                'created_by' => 2,
                'updated_by' => 2,
                'deleted_at' => NULL,
            ),
            1 => 
            array (
                'id' => 2,
                'permission_groupname' => 'role management',
                'created_at' => '2018-10-13 14:05:48',
                'updated_at' => '2018-10-13 14:05:48',
                'created_by' => 2,
                'updated_by' => 2,
                'deleted_at' => NULL,
            )
        ));
    }
}
