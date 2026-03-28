import type { ComponentType } from "react";
import type { WidgetProps } from "./types";
import { GenericWidget } from "./GenericWidget";
import { OllamaWidget } from "./OllamaWidget";
import { CaddyWidget } from "./CaddyWidget";

export const widgetRegistry: Record<string, ComponentType<WidgetProps>> = {
  generic: GenericWidget,
  ollama: OllamaWidget,
  caddy: CaddyWidget,
};
