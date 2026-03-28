import type { ComponentType } from "react";
import type { WidgetProps } from "./types";

// Widgets will be registered in Task 14
export const widgetRegistry: Record<string, ComponentType<WidgetProps>> = {};
