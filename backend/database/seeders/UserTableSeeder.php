<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class UserTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        \DB::table('users')->delete();
        
        \DB::table('users')->insert(array (
            0 => 
            array (
                'id' => 1,
                'name' => 'Admin',
                'email' => 'admin@gmail.com',
                'username' => 'admin@gmail.com',
                'email_verified_at' => NULL,
                'password' => '$2y$10$9O2Baad6CrI9NqG7xIQsOOE4wkC/AYX3qTNkpUl62ooSfIOC4WIgy',
                'role_id' => 1,
                'status'  => 1,
                'remember_token' => NULL,
                'created_at' => '2021-03-03 17:10:22',
                'updated_at' => '2021-03-03 17:10:22',
            ),
        ));
    }
}
