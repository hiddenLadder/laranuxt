import { FetchError, FetchOptions, SearchParams, $fetch } from "ohmyfetch";
import { reactive, ref } from "vue";
import { Router } from "vue-router";

import Echo from "laravel-echo";
import Pusher from "pusher-js";

export interface UserLogin {
  token: string;
  user: models.User;
  provider: string;
  error?: string;
  action?: LoginAction;
}

export interface AuthConfig {
  fetchOptions: FetchOptions<"json">;
  webURL: string;
  apiURL: string;
  redirect: {
    logout: string;
    login: undefined | string;
  };
  echoConfig?: EchoConfig;
}

export interface EchoConfig {
  pusherAppKey: string;
  pusheAppCluster: string;
}

export interface LoginAction {
  action: string;
  url: string;
}

const authConfigDefaults: AuthConfig = {
  fetchOptions: {},
  webURL: "https://localhost:3000",
  apiURL: "https://localhost:8000",
  redirect: {
    logout: "/",
    login: "/login",
  },
};

export default class Api {
  public token = useCookie("token", { path: "/", maxAge: 60 * 60 * 24 * 30 });
  public config: AuthConfig;
  public $user = reactive<models.User>({});
  public $echo: undefined | Echo = undefined;
  public loggedIn = ref<boolean | undefined>(undefined);
  public redirect = ref<boolean>(false);
  public action = ref<null | LoginAction>(null);
  public $errors = ref([]);

  constructor(config: AuthConfig) {
    this.config = { ...authConfigDefaults, ...config };
    this.checkUser();
  }

  checkUser() {
    if (this.token.value !== undefined) {
      this.setUser().then();
      this.loggedIn.value = true;
    } else this.loggedIn.value = false;
  }

  setEcho() {
    if (!this.config.echoConfig) return;
    if (!process.client) return;
    window.Pusher = Pusher;
    this.$echo = new Echo({
      broadcaster: "pusher",
      key: this.config.echoConfig.pusherAppKey,
      cluster: this.config.echoConfig.pusheAppCluster,
      authEndpoint: `${this.config.apiURL}/broadcasting/auth`,
      forceTls: true,
      encrypted: true,
      auth: {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ` + this.token.value,
        },
      },
    });
  }

  async login(result: UserLogin): Promise<undefined | string> {
    this.loggedIn.value = true;
    this.token.value = result.token;
    Object.assign(this.$user, result.user);
    this.setEcho();
    if (result.action && result.action.action === "redirect")
      return result.action.url;
    return "/";
  }
  private fetchOptions(
    params?: SearchParams,
    method = "GET"
  ): FetchOptions<"json"> {
    const fetchOptions = this.config.fetchOptions;
    fetchOptions.headers = {
      Accept: "application/json",
      Authorization: `Bearer ${this.token.value}`,
      Referer: this.config.webURL,
    };
    fetchOptions.method = method;
    delete this.config.fetchOptions.body;
    delete this.config.fetchOptions.params;
    if (params)
      if (method === "POST" || method === "PUT")
        this.config.fetchOptions.body = params;
      else this.config.fetchOptions.params = params;
    return this.config.fetchOptions;
  }

  public async setUser(): Promise<void> {
    try {
      const result = await $fetch<api.MetApiResponse & { data: models.User }>(
        "/me",
        this.fetchOptions()
      );
      Object.assign(this.$user, result.data);
      this.setEcho();
    } catch (e) {
      await this.invalidate();
    }
  }

  public async index<Results>(
    endpoint: string,
    params?: SearchParams
  ): Promise<api.MetApiResults & { data: Results }> {
    this.$errors.value = [];
    try {
      return await $fetch<api.MetApiResults & { data: Results }>(
        endpoint,
        this.fetchOptions(params)
      );
    } catch (error) {
      await this.handleError(error);
    }
  }

  public async get<Result>(
    endpoint: string,
    params?: SearchParams,
    cb?: (e: FetchError) => void
  ): Promise<api.MetApiResponse & { data: Result }> {
    this.$errors.value = [];
    try {
      return await $fetch<api.MetApiResponse & { data: Result }>(
        endpoint,
        this.fetchOptions(params)
      );
    } catch (error) {
      if (cb) cb(error);
      await this.handleError(error);
    }
  }

  public async update(
    endpoint: string,
    params?: SearchParams,
    cb?: (e: FetchError) => void
  ): Promise<api.MetApiResponse> {
    this.$errors.value = [];
    try {
      return (
        await $fetch<api.MetApiResults & { data: api.MetApiResponse }>(
          endpoint,
          this.fetchOptions(params, "PUT")
        )
      ).data;
    } catch (error) {
      if (cb) cb(error);
      await this.handleError(error);
    }
  }

  public async store<Result>(
    endpoint: string,
    params?: SearchParams,
    cb?: (e: FetchError) => void
  ): Promise<api.MetApiResponse & { data: Result }> {
    this.$errors.value = [];
    try {
      return (
        await $fetch<
          api.MetApiResults & { data: api.MetApiResponse & { data: Result } }
        >(endpoint, this.fetchOptions(params, "POST"))
      ).data;
    } catch (error) {
      if (cb) cb(error);
      await this.handleError(error);
    }
  }

  public async delete(
    endpoint: string,
    params?: SearchParams,
    cb?: (e: FetchError) => void
  ): Promise<api.MetApiResponse> {
    this.$errors.value = [];
    try {
      return (
        await $fetch<api.MetApiResults & { data: api.MetApiResponse }>(
          endpoint,
          this.fetchOptions(params, "DELETE")
        )
      ).data;
    } catch (error) {
      if (cb) cb(error);
      await this.handleError(error);
    }
  }

  public async attempt(token: string | string[]): Promise<UserLogin> {
    this.$errors.value = [];
    try {
      return (
        await $fetch<api.MetApiResponse & { data: UserLogin }>(
          "/login",
          this.fetchOptions({ token }, "POST")
        )
      ).data;
    } catch (error) {
      await this.handleError(error);
    }
  }

  public upload(url: string, params?: SearchParams) {
    return $fetch(url, { method: "PUT", body: params });
  }

  public async handleError(error: FetchError) {
    if (error.response?.status === 401) return await this.invalidate();
    if (error.response._data && error.response._data.errors) {
      for (const err of error.response._data.errors) {
        this.$errors.value = {
          ...this.$errors.value,
          [err.message]: err.detail,
        };
      }
    }
  }

  public async logout(router: Router): Promise<void> {
    if (this.$echo) this.$echo.disconnect();
    await $fetch<api.MetApiResults>("/logout", this.fetchOptions());
    await this.invalidate(router);
  }

  public async invalidate(router?: Router): Promise<void> {
    this.token.value = undefined;
    this.loggedIn.value = false;
    Object.assign(this.$user, {});
    if (router)
      await router.push({ path: this.config.redirect.logout, replace: true });
    else if (
      process.client &&
      document.location.pathname !== this.config.redirect.logout
    )
      document.location.href = this.config.redirect.logout;
  }
}
