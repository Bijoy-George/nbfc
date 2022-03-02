<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;


class FDAccount extends Model
{
    use HasFactory;
    use SoftDeletes;

    protected $table = 'fd_account_details';
    protected $guarded = [];

    public function getScheme()
    {
        return $this->belongsTo(DepositScheme::class,'scheme_id');
    }
    public function getNominee()
    {
        return $this->hasMany(Nominee::class,'fd_id');
    }
    public function getCustomer()
    {
        return $this->belongsTo(CustomerDetail::class,'customer_id');
    }

    
   

}
