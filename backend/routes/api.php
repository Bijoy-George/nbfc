<?php

use App\Models\Role;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
   // return $request->user();

});

Route::post('forgot', 'App\Http\Controllers\API\AuthController@forgot')->name('password.reset');
Route::post('reset/password', 'App\Http\Controllers\API\AuthController@callResetPassword');


Route::group(['middleware' => 'auth:sanctum'], function () {
//customer

Route::resource('/customer','App\Http\Controllers\API\CustomerProfileController');
Route::resource('/user','App\Http\Controllers\API\UserManagementController');
Route::post('change-password','App\Http\Controllers\API\UserManagementController@changePassword');
Route::resource('/permission','App\Http\Controllers\API\PermissionManagementController');
Route::resource('/role','App\Http\Controllers\API\RoleManagementController');
Route::resource('/branch','App\Http\Controllers\API\BranchManagementController');
Route::get('/branch-bank','App\Http\Controllers\API\BranchManagementController@getBank');
Route::get('/get_bank_name','App\Http\Controllers\API\BranchManagementController@getBankName');
Route::post('/save_bank','App\Http\Controllers\API\BranchManagementController@save_bank');
Route::post('/branch_bank_activate','App\Http\Controllers\API\BranchManagementController@branch_bank_activate');
Route::resource('/scheme','App\Http\Controllers\API\SchemeManagementController');
Route::resource('/bank','App\Http\Controllers\API\BankManagementController');
Route::get('/get_role','App\Http\Controllers\API\UserManagementController@getRole');
Route::get('/get_branch','App\Http\Controllers\API\CustomerProfileController@getBranch');
Route::get('/get_perm_group','App\Http\Controllers\API\PermissionManagementController@get_perm_group');
Route::get('/get_kyc_type','App\Http\Controllers\API\CustomerProfileController@getKyc');
Route::post('/kyc_upload','App\Http\Controllers\API\CustomerProfileController@uploadDoc');
Route::get('/customer-kyc','App\Http\Controllers\API\CustomerProfileController@getCustomerKyc');
Route::get('/kyc-download','App\Http\Controllers\API\CustomerProfileController@downloadKyc');
Route::get('/get_scheme','App\Http\Controllers\API\CustomerProfileController@getScheme');
Route::post('/create/deposit','App\Http\Controllers\API\CustomerProfileController@createDeposit');
Route::get('/deposit-list','App\Http\Controllers\API\CustomerProfileController@depositList');
Route::get('/nominee-list','App\Http\Controllers\API\CustomerProfileController@nomineeList');
Route::post('/save-nominee','App\Http\Controllers\API\CustomerProfileController@saveNominee');
Route::post('/daybook','App\Http\Controllers\API\AccountsController@daybook');
Route::get('/dashboard','App\Http\Controllers\API\DashboardController@dashboard');
Route::post('/customer/change-status','App\Http\Controllers\API\CustomerProfileController@changeStatus');
Route::get('/get-deposit-details','App\Http\Controllers\API\CustomerProfileController@getDepositDetails');
Route::get('/scheme-details/{id}','App\Http\Controllers\API\CustomerProfileController@getDetails');
Route::post('/interest/pay','App\Http\Controllers\API\CustomerProfileController@payInterest');
Route::post('/approve-kyc','App\Http\Controllers\API\CustomerProfileController@kycApproval');
Route::get('getnotification', 'App\Http\Controllers\API\NotificationController@index');

Route::post('/user-deactivate','App\Http\Controllers\API\UserManagementController@userDeactivate');
Route::post('/permission-deactivate','App\Http\Controllers\API\PermissionManagementController@deactivate');
Route::post('/branch-deactivate','App\Http\Controllers\API\BranchManagementController@deactivate');
Route::post('/bank-deactivate','App\Http\Controllers\API\BankManagementController@deactivate');
Route::post('/role-deactivate','App\Http\Controllers\API\RoleManagementController@deactivate');
Route::post('/scheme-deactivate','App\Http\Controllers\API\SchemeManagementController@deactivate');
//reports
Route::get('get-report','App\Http\Controllers\API\ReportController@getReport');
Route::get('interest-report','App\Http\Controllers\API\ReportController@interestReport');
Route::post('export-interest-report','App\Http\Controllers\API\ReportController@exportInterestReport');
Route::post('interest-transaction-report','App\Http\Controllers\API\ReportController@exportTransactionReport');



//cron
Route::get('/interest/calculate','App\Http\Controllers\API\CronController@interestCalculation');



//location settings
Route::get('get_countries', 'App\Http\Controllers\API\LocationController@getCountries');
Route::get('get_states/{country_id}', 'App\Http\Controllers\API\LocationController@getStates');
Route::get('get_cities/{state_id}', 'App\Http\Controllers\API\LocationController@getCities');


});
Route::post('login', 'App\Http\Controllers\API\AuthController@login')->name('login');

