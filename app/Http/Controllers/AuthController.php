<?php

namespace App\Http\Controllers;

use App\Models\Provider;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Laravel\Socialite\Facades\Socialite;

class AuthController extends Controller
{
    /**
     * Create new users with their initial team
     *
     * @param  string  $provider
     * @param  string  $name
     * @param  string  $email
     * @param  string  $avatar
     * @param  array  $payload
     * @return User
     */
    private function createUser(string $provider, string $name, string $email, string $password, array $payload): User
    {
        $user = User::create([
            'name' => $name,
            'email' => $email,
            'password' => bcrypt($password)
        ]);
        Provider::create([
            'user_id' => $user->id,
            'name' => $provider,
            'payload' => $payload,
        ]);

        return $user;
    }

    public function attemptLogin(Request $request) {
        $this
            ->option('email', 'required|email')
            ->option('action', 'nullable|string')
            ->option('password', 'required')
            ->verify();
        if ($user = User::where('email', $request->email)->first()) {
            if (Hash::check($request->password, $user->password)) {
                $attempt = auth()->attempt($user->id, json_decode($request->action));
                return $this->render($attempt->token);
            }
        }
        $this->addError('email', 'Данные не соответствуют нашим записям.');
        $this->abort();
    }

    public function attemptRegister(Request $request)
    {
        $this
            ->option('name', 'required')
            ->option('email', 'required|email|unique:users,email')
            ->option('action', 'nullable|string')
            ->option('password', 'required|confirmed')
            ->verify();

        $user = $this->createUser(
                'email',
                $request->name,
                $request->email,
                $request->password,
                []
            );

        $attempt = auth()->attempt($user->id, json_decode($request->action));
        return $this->render($attempt->token);
    }

    /**
     * Verify the link clicked in the e-mail
     *
     * @param  Request  $request
     * @return Response|JsonResponse
     */
    public function login(Request $request): Response|JsonResponse
    {
        $this
            ->option('token', 'required|alpha_num|size:64')
            ->verify();

        if (! $login = auth()->verify($request->token)) {
            return $this->error('auth.failed');
        }

        return $this->render([
            'token' => auth()->token(),
            'user' => auth()->user(),
            'action' => $login->action, // @phpstan-ignore-line
        ])->cookie('token', auth()->token(), 60 * 24 * 30, '/', '', true, false);
    }

    /**
     * Standard user info auth check
     *
     * @param  Request  $request
     * @return Response|JsonResponse
     */
    public function me(Request $request): Response|JsonResponse
    {
        $this
            ->option('providers', 'boolean')
            ->verify();
        if ($request->providers) {
            return $this->render(User::whereId(auth()->user()?->id)->with(['providers'])->first());
        }
        auth()->user()?->session->touch();

        return $this->render(auth()->user());
    }

    /**
     * Update user info
     *
     * @param  Request  $request
     * @return Response|JsonResponse
     */
    public function update(Request $request)
    {
        $this
            ->option('name', 'required|string')
            ->option('avatar', 'required|url')
            ->verify();

        /** @var User $user */
        $user = auth()->user();

        $user->name ??= $request->name;
        $user->avatar ??= $request->avatar;
        $user->save();

        return $this->success('user.updated');
    }

    /**
     * Log a user out
     *
     * @return Response|JsonResponse
     */
    public function logout(): Response|JsonResponse
    {
        auth()->logout();

        return $this->success('auth.logout')->cookie('token', false, 0, '/', '', true, false);
    }
}
