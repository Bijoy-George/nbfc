<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;


class AcTransactions extends Model
{
    use HasFactory;
    use SoftDeletes;

    protected $table = 'ac_transactions';
    protected $guarded = [];


    public function getAcHead()
    {
        return $this->belongsTo(AcTransHead::class,'head_id_p');
    }
}
