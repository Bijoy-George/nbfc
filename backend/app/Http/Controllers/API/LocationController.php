<?php

namespace App\Http\Controllers\api;

use App\Http\Controllers\Controller;
use App\Models\Country;
use App\Models\State;

class LocationController extends Controller
{
    public function getCountries()
    {
        return Country::select('id as value', 'name as label')->get();
    }

    public function getStates()
    {
        $country_id = request('country_id');
        if ($country_id) {
            return Country::with('states:id,name,country_id')->where('id', $country_id)->get()->pluck('states');
        } else {
            return [
                []
            ];
        }
    }

    public function getCities()
    {
        $state_id = request('state_id');
        if ($state_id) {
            return State::with('cities:id,state_id,name')->where('id', $state_id)->get()->pluck('cities');
        } else {
            return [
                []
            ];
        }
    }
}
