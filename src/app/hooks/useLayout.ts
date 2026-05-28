import { useState, useEffect } from "react";

export type LayoutType = "mobile-portrait" | "mobile-landscape" | "phablet" | "tablet" | "desktop";

export interface LayoutConfig {
  gridCols: number;
  categoryGridCols: number;
  cardMaxWidth: string;
  cardHeight: string;
  wordFontSize: string;
  actionBtnSize: string;
  actionIconSize: string;
  timerFontSize: string;
  sidebarWidth: string | number;
  navType: "bottom" | "none" | "sidebar-icon" | "sidebar-full";
  hPadding: string;
  statCols: number;
  resultCardMax: string;
  btnLayout: "stack" | "row";
  showKeyboardHint: boolean;
}

export const LAYOUT_CONFIG: Record<LayoutType, LayoutConfig> = {
  "mobile-portrait": {
    gridCols:        2,
    categoryGridCols:2,
    cardMaxWidth:    "calc(100vw - 32px)",
    cardHeight:      "190px",
    wordFontSize:    "clamp(26px, 8vw, 36px)",
    actionBtnSize:   "60px",
    actionIconSize:  "24px",
    timerFontSize:   "22px",
    sidebarWidth:    0,
    navType:         "bottom",
    hPadding:        "16px",
    statCols:        3,
    resultCardMax:   "100%",
    btnLayout:       "stack",
    showKeyboardHint: false,
  },
  "mobile-landscape": {
    gridCols:        3,
    categoryGridCols:4,
    cardMaxWidth:    "min(50vh, 320px)",
    cardHeight:      "min(55vh, 220px)",
    wordFontSize:    "clamp(22px, 5vh, 38px)",
    actionBtnSize:   "56px",
    actionIconSize:  "22px",
    timerFontSize:   "18px",
    sidebarWidth:    0,
    navType:         "none",
    hPadding:        "12px",
    statCols:        3,
    resultCardMax:   "640px",
    btnLayout:       "row",
    showKeyboardHint: false,
  },
  "phablet": {
    gridCols:        2,
    categoryGridCols:3,
    cardMaxWidth:    "400px",
    cardHeight:      "240px",
    wordFontSize:    "clamp(30px, 7vw, 44px)",
    actionBtnSize:   "68px",
    actionIconSize:  "26px",
    timerFontSize:   "26px",
    sidebarWidth:    0,
    navType:         "bottom",
    hPadding:        "20px",
    statCols:        3,
    resultCardMax:   "480px",
    btnLayout:       "stack",
    showKeyboardHint: false,
  },
  "tablet": {
    gridCols:        3,
    categoryGridCols:3,
    cardMaxWidth:    "480px",
    cardHeight:      "280px",
    wordFontSize:    "clamp(36px, 6vw, 52px)",
    actionBtnSize:   "76px",
    actionIconSize:  "30px",
    timerFontSize:   "30px",
    sidebarWidth:    "64px",
    navType:         "sidebar-icon",
    hPadding:        "24px",
    statCols:        3,
    resultCardMax:   "560px",
    btnLayout:       "stack",
    showKeyboardHint: false,
  },
  "desktop": {
    gridCols:        4,
    categoryGridCols:4,
    cardMaxWidth:    "640px",
    cardHeight:      "340px",
    wordFontSize:    "clamp(48px, 5vw, 72px)",
    actionBtnSize:   "88px",
    actionIconSize:  "36px",
    timerFontSize:   "36px",
    sidebarWidth:    "240px",
    navType:         "sidebar-full",
    hPadding:        "40px",
    statCols:        3,
    resultCardMax:   "680px",
    btnLayout:       "row",
    showKeyboardHint: true,
  },
};

export function useLayout(): LayoutType {
  const [layout, setLayout] = useState<LayoutType>("mobile-portrait");

  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const isLandscape = w > h;

      if (isLandscape && h < 480) {
        setLayout("mobile-landscape");
      } else if (w < 480) {
        setLayout("mobile-portrait");
      } else if (w >= 480 && w < 768) {
        setLayout("phablet");
      } else if (w >= 768 && w < 1024) {
        setLayout("tablet");
      } else {
        setLayout("desktop");
      }
    };
    update();
    window.addEventListener("resize", update);
    window.addEventListener("orientationchange", update);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("orientationchange", update);
    };
  }, []);

  return layout;
}
