<?php

namespace App\Http\Middleware;

use Closure;
use Redirect;
use App\Helpers;

class CheckPermission
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return mixed
     */
    public function handle($request, Closure $next, $permission)
    {
       // $permission = explode('|', $permission);

        
        if(Helpers::checkPermission($permission)){
            return $next($request);
        }

       return response()->json(["message" => "You don't have permission to access this page","status"=>3]);
	  
	  // $redirectUrl = config('constant.FRONT_END_URL').'/access_denied';

	//	return Redirect::to($redirectUrl);
    }
}