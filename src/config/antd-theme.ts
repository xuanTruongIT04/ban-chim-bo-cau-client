import type { ThemeConfig } from 'antd';

export const antdTheme: ThemeConfig = {
  token: {
    fontSize: 14,
    fontSizeHeading1: 24,
    fontSizeHeading2: 20,
    borderRadius: 8,
    borderRadiusLG: 8,
  },
  components: {
    Layout: {
      headerBg: '#ffffff',
      siderBg: '#ffffff',
    },
    Menu: {
      itemBg: '#ffffff',
    },
  },
};
