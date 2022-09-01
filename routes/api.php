<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\Controller;
use App\Http\Controllers\SessionController;
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

Route::controller(AuthController::class)->group(function () {
    Route::post('attemptRegister', 'attemptRegister')->name('auth.attemptRegister');
    Route::post('attemptLogin', 'attemptLogin')->name('auth.attemptLogin');
    Route::post('login', 'login')->name('auth.login');
    Route::get('logout', 'logout')->middleware('auth:api')->name('auth.logout');
    Route::get('me', 'me')->middleware('auth:api')->name('auth.session');
});

Route::apiResource('session', SessionController::class)->middleware('auth:api');
