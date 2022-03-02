<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FDAccountLog extends Model
{
    use HasFactory;
    protected $table = 'fd_account_details_log';
    protected $guarded = [];
}
