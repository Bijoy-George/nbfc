<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;


class Nominee extends Model
{
    use HasFactory;
    use SoftDeletes;

    protected $table = 'nominee_details';
    protected $guarded = [];

    public function getAccount()
    {
        return $this->belongsTo(FDAccount::class,'fd_id');
    }
}
