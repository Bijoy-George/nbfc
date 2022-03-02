<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CronLog extends Model
{
    use HasFactory;
    protected $guarded = [];

    public function createLog($call_path)
    {
        $calllog_insertion = CronLog::create(
            [
                'api' => $call_path,
                'call_start_time' => date('Y-m-d H:i:s'),
            ]
        );
        return $cron_logid = $calllog_insertion->id;
    }
    public function updateLog($cron_logid, $error = '')
    {

        $updateDetails = CronLog::where('id', $cron_logid)
            ->update([
                'call_end_time'    => date('Y-m-d H:i:s'),
                'error_msg' => $error,
            ]);
        if (is_null($updateDetails)) {
            return false;
        }
        return true;
    }
}
