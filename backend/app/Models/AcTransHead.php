<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;


class AcTransHead extends Model
{
    use HasFactory;
    use SoftDeletes;

    protected $table = 'ac_transaction_head';
    protected $guarded = [];


    
}
