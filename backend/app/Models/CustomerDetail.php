<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;


class CustomerDetail extends Model
{
    use HasFactory;
    use SoftDeletes;

    protected $table = 'customer_details';
    protected $guarded = [];


    public function getBranch()
    {
        return $this->belongsTo(Branch::class,'branch_id');
    }


}
