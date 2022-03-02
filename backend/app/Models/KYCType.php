<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;


class KYCType extends Model
{
    use HasFactory;
    use SoftDeletes;

    protected $table = 'kyc_types';
    protected $guarded = [];
}
