import type { NavigateFunction } from 'react-router-dom';

let _navigate: NavigateFunction | null = null;

export const setNavigator = (nav: NavigateFunction) => {
  _navigate = nav;
};

export const navigateTo = (path: string) => {
  if (_navigate) {
    _navigate(path, { replace: true });
  } else {
    window.location.href = path;
  }
};
