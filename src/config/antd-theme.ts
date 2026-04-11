import type { ThemeConfig } from 'antd';

// ─── Exported constants for use in inline styles when token context unavailable
export const BRAND = {
  primary: '#1976d2',
  primaryDark: '#1250a0',
  primaryLight: '#e8f0fe',
  accent: '#d4880a',
  accentLight: '#fdf3e0',
  bgLayout: '#f5f2ec',
  border: '#e0d9cc',
  borderSecondary: '#ede8df',
} as const;

export const antdTheme: ThemeConfig = {
  token: {
    // ─── Brand colors ───────────────────────────────────────────
    // Forest green: nature, freshness, trust — positions away from fast-food red/orange
    colorPrimary: '#1976d2',
    colorSuccess: '#4a9e4a',
    // Warm amber: appetite stimulation, Vietnamese culinary aesthetic, price highlights
    colorWarning: '#d4880a',
    colorError: '#d94040',
    colorInfo: '#1976d2',

    // ─── Backgrounds ────────────────────────────────────────────
    // Warm cream instead of cold white — organic feel, makes food images pop
    colorBgLayout: '#f5f2ec',
    colorBgContainer: '#ffffff',
    colorBgElevated: '#ffffff',

    // ─── Borders ────────────────────────────────────────────────
    colorBorder: '#e0d9cc',
    colorBorderSecondary: '#ede8df',

    // ─── Text ───────────────────────────────────────────────────
    colorText: '#1a1a1a',
    colorTextSecondary: '#595959',
    colorTextTertiary: '#8c8c8c',
    colorTextDisabled: '#bfbfbf',

    // ─── Typography ─────────────────────────────────────────────
    // Be Vietnam Pro: designed for Vietnamese diacritics, humanist sans-serif
    fontFamily: "'Be Vietnam Pro', system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
    // Keep large base size — users may be older family members ordering online
    fontSize: 15,
    fontSizeHeading1: 34,
    fontSizeHeading2: 26,
    fontSizeHeading3: 22,
    fontSizeHeading4: 20,
    fontSizeHeading5: 17,
    lineHeight: 1.6,

    // ─── Shape ──────────────────────────────────────────────────
    borderRadius: 8,
    borderRadiusLG: 12,
    borderRadiusSM: 6,
    borderRadiusXS: 4,

    // ─── Controls ───────────────────────────────────────────────
    controlHeight: 42,
    controlHeightSM: 32,
    controlHeightLG: 50,

    // ─── Motion ─────────────────────────────────────────────────
    motionDurationFast: '0.15s',
    motionDurationMid: '0.2s',
    motionDurationSlow: '0.3s',

    // ─── Shadows ────────────────────────────────────────────────
    boxShadow: '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.05)',
    boxShadowSecondary: '0 4px 16px rgba(0,0,0,0.10)',
  },

  components: {
    Layout: {
      headerBg: '#ffffff',
      siderBg: '#f5f8ff',
    },
    Menu: {
      itemBg: 'transparent',
      itemSelectedBg: '#e8f0fe',
      itemSelectedColor: '#1976d2',
      itemHoverBg: '#f5f2ec',
      itemActiveBg: '#e3f2fd',
      fontSize: 15,
      itemBorderRadius: 8,
      subMenuItemBorderRadius: 6,
    },
    Button: {
      fontWeight: 600,
      controlHeight: 42,
      controlHeightLG: 50,
      controlHeightSM: 32,
      borderRadius: 8,
      borderRadiusLG: 10,
      borderRadiusSM: 6,
      primaryShadow: '0 4px 12px rgba(25, 118, 210, 0.25)',
      defaultBorderColor: '#e0d9cc',
    },
    Card: {
      borderRadiusLG: 12,
      boxShadow: '0 1px 3px rgba(0,0,0,0.07)',
      colorBorderSecondary: '#ede8df',
    },
    Table: {
      fontSize: 14,
      headerBg: '#f5f2ec',
      headerColor: '#595959',
      borderColor: '#e0d9cc',
      rowHoverBg: '#f8faf8',
      borderRadius: 12,
    },
    Input: {
      controlHeight: 42,
      fontSize: 15,
      borderRadius: 8,
      activeShadow: '0 0 0 3px rgba(25, 118, 210, 0.10)',
      hoverBorderColor: '#1976d2',
    },
    Select: {
      controlHeight: 42,
      fontSize: 15,
      borderRadius: 8,
    },
    Statistic: {
      contentFontSize: 28,
      titleFontSize: 14,
    },
    Badge: {
      fontSize: 12,
    },
    Tag: {
      borderRadius: 4,
      fontSize: 12,
    },
    Tabs: {
      inkBarColor: '#1976d2',
      itemSelectedColor: '#1976d2',
      itemHoverColor: '#1976d2',
    },
    Steps: {
      colorPrimary: '#1976d2',
    },
    Pagination: {
      borderRadius: 8,
      itemActiveBg: '#e8f0fe',
    },
    Notification: {
      borderRadius: 12,
    },
    Message: {
      borderRadius: 8,
    },
    Upload: {
      borderRadius: 12,
    },
    Skeleton: {
      gradientFromColor: '#ede8df',
      gradientToColor: '#f5f2ec',
    },
    Drawer: {
      borderRadiusLG: 0,
    },
    Modal: {
      borderRadiusLG: 16,
    },
  },
};
