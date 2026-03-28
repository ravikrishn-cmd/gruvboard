import type { AppConfig, AppStatus, HealthRecord } from "@/types/app";

export interface WidgetProps {
  app: AppConfig;
  status: AppStatus;
  history: HealthRecord[];
  onServiceAction: (action: "start" | "stop" | "restart") => Promise<void>;
}
