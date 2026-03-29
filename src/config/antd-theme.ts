import type { ThemeConfig } from 'antd';

export const antdTheme: ThemeConfig = {
  token: {
    // Calm green primary - natural, trustworthy, easy on the eyes
    colorPrimary: '#2e7d32',
    colorSuccess: '#389e0d',
    colorWarning: '#d48806',
    colorError: '#cf1322',
    colorInfo: '#096dd9',

    // Larger fonts for elderly users
    fontSize: 16,
    fontSizeHeading1: 32,
    fontSizeHeading2: 26,
    fontSizeHeading3: 22,
    fontSizeHeading4: 20,
    fontSizeHeading5: 18,

    // Friendly rounded corners
    borderRadius: 10,
    borderRadiusLG: 12,

    // Soft warm background
    colorBgLayout: '#f8f9fa',
  },
  components: {
    Layout: {
      headerBg: '#ffffff',
      siderBg: '#f0f7f0',
    },
    Menu: {
      itemBg: 'transparent',
      itemSelectedBg: '#e8f5e9',
      itemSelectedColor: '#2e7d32',
      itemHoverBg: '#f0f7f0',
      fontSize: 16,
    },
    Button: {
      fontWeight: 600,
      controlHeight: 40,
      controlHeightLG: 50,
      borderRadius: 10,
      primaryShadow: '0 4px 12px rgba(46, 125, 50, 0.25)',
    },
    Card: {
      borderRadiusLG: 12,
    },
    Table: {
      fontSize: 15,
      headerBg: '#f0f7f0',
    },
    Input: {
      controlHeight: 42,
      fontSize: 16,
    },
    Select: {
      controlHeight: 42,
      fontSize: 16,
    },
    Statistic: {
      contentFontSize: 28,
      titleFontSize: 15,
    },
    Badge: {
      fontSize: 14,
    },
  },
};
