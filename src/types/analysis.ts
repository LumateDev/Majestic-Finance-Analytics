
export interface FinancialEvent {
  timestamp: string;
  eventType: 'Аренда' | 'Склад';
  server?: string;
  itemName?: string;
  price?: number;
  quantity?: number;
  renterName?: string;
}

export interface AnalysisResult {
  totalRevenue: number;
  totalEvents: number;
  revenueByVehicle: Record<string, number>;
  events: FinancialEvent[];
  servers: string[];
  vehicles: string[];
}
