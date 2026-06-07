const ACCESS_TOKEN_KEY = "ANT_Token";
const REFRESH_TOKEN_KEY = "ANT_RefreshToken";
const REMEMBER_KEY = "ANT_Remember";

export const getStoredAccessToken = () =>
  localStorage.getItem(ACCESS_TOKEN_KEY) ||
  sessionStorage.getItem(ACCESS_TOKEN_KEY);

export const getStoredRefreshSession = () => {
  const localRefreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
  if (localRefreshToken) {
    return { refreshToken: localRefreshToken, remember: true };
  }

  return {
    refreshToken: sessionStorage.getItem(REFRESH_TOKEN_KEY),
    remember: false,
  };
};

export const getStoredRefreshToken = () =>
  getStoredRefreshSession().refreshToken;

export const getRememberPreference = () =>
  localStorage.getItem(REMEMBER_KEY) === "true";

export const setRememberPreference = (remember) => {
  if (remember) {
    localStorage.setItem(REMEMBER_KEY, "true");
  } else {
    localStorage.removeItem(REMEMBER_KEY);
  }
};

export const clearStoredTokens = () => {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  sessionStorage.removeItem(ACCESS_TOKEN_KEY);
  sessionStorage.removeItem(REFRESH_TOKEN_KEY);
};

export const saveStoredTokens = (accessToken, refreshToken, remember) => {
  clearStoredTokens();

  if (accessToken && refreshToken) {
    const storage = remember ? localStorage : sessionStorage;
    storage.setItem(ACCESS_TOKEN_KEY, accessToken);
    storage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  }
};
