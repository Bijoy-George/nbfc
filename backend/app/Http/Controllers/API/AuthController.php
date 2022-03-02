<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Auth;
use App\Models\User;
use App\Helpers;
use App\Models\PasswordResets;
use Password;
use Illuminate\Support\Facades\Hash;
use Illuminate\Auth\Events\PasswordReset;
use Str;

class AuthController extends Controller
{
    public $successStatus = 200;

    public function login()
    {

        if(Auth::attempt(['email' => request('email'), 'password' => request('password')]))
        {
            $user = Auth::user();
            $success['token'] =  $user->createToken('MyApp')->plainTextToken;
			$permissions=Helpers::get_permsission_names();
            return response()->json(['success' => $success,'permissions'=>$permissions,'role_id'=>$user->role_id,'user_id'=>$user->id, 'profile_name' => $user->name, 'status' => 200], $this->successStatus);
        }
        else{
            return response()->json(['error'=>'Unauthorised', 'status' => 401], $this->successStatus);
        }
    }

    public function forgot(Request $request)
    {
        $credentials = request()->validate(['email' => 'required|email']);
        $user = User::where('email', $request->email)->first();
        if (!$user)
        {
            return response()->json([
                'message' => "we can't find a user with that e-mail address.","status"=>False]);
        }

        $response=Password::sendResetLink($credentials);
        if($response == Password::RESET_LINK_SENT)
        {
        return response()->json(["message" => 'Reset password link sent on your email id.',"status"=>True]);
        }
        else
        {
            return response()->json(["message" => 'Unable to send email',"status"=>True]);

        }
    }


    public function callResetPassword(Request $request)
    {
        $credentials = request()->validate([
            'email' => 'required|email',
            'token' => 'required|string',
            'password' => 'required|string|confirmed'
        ]);

        $reset_password_status = Password::reset(
        $request->only('email', 'password', 'password_confirmation', 'token'),
        function ($user, $password) use ($request) {
            $user->forceFill([

                'password' => Hash::make($password)
                ])->save();

                $user->setRememberToken(Str::random(60));

                event(new PasswordReset($user));
            }
        );

        if ($reset_password_status == Password::INVALID_TOKEN) {
            return response()->json(["messsage" => "Invalid token provided","status"=>False], 400);
        }

        return response()->json(["messsage" => "Password has been successfully changed","status"=>True]);



    }
	
	 public function getDetails()
   {
       $user = Auth::user();
       $permissions=Helpers::get_permsission_names();
       return response()->json(['user_details' => $user,'permissions'=>$permissions]);
   }


}
