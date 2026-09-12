export type AssetStatus = 'OPERATIONAL' | 'UNDER_MAINTENANCE' | 'DECOMMISSIONED' | 'IN_STORAGE';
export type WorkOrderPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type WorkOrderStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export interface Asset {
  id: string;
  name: string;
  serial_number: string;
  category: string;
  location: string;
  status: AssetStatus;
  purchase_date: string | null;
  warranty_expires_at: string | null;
  specs: Record<string, any>;
  created_at?: string;
  updated_at?: string;
  maintenance_schedules?: MaintenanceSchedule[];
  work_orders?: WorkOrder[];
  _count?: {
    work_orders: number;
  };
}

export interface CreateAssetDto {
  name: string;
  serial_number: string;
  category: string;
  location: string;
  status?: AssetStatus;
  purchase_date?: string;
  warranty_expires_at?: string;
  specs?: Record<string, any>;
}

export interface Technician {
  id: string;
  full_name: string;
  email: string;
  phone?: string | null;
  role?: string | null;
  is_active?: boolean;
  created_at?: string;
}

export interface SparePart {
  id: string;
  name: string;
  sku: string;
  stock_quantity: number;
  min_threshold: number;
  unit_cost: number | string;
  created_at?: string;
}

export interface CreatePartDto {
  name: string;
  sku: string;
  stock_quantity: number;
  min_threshold?: number;
  unit_cost?: number;
}

export interface MaintenanceSchedule {
  id: string;
  asset_id: string;
  task_name: string;
  frequency_interval_days: number;
  next_due_date: string;
  last_completed_at?: string | null;
  created_at?: string;
  assets?: Asset;
  work_orders?: WorkOrder[];
}

export interface CreateScheduleDto {
  asset_id: string;
  task_name: string;
  frequency_interval_days: number;
  next_due_date: string;
}

export interface WorkOrderPart {
  work_order_id: string;
  part_id: string;
  quantity_used: number;
  spare_parts?: SparePart;
}

export interface WorkOrder {
  id: string;
  title: string;
  description?: string | null;
  priority: WorkOrderPriority;
  status: WorkOrderStatus;
  asset_id: string;
  assigned_technician_id?: string | null;
  schedule_id?: string | null;
  scheduled_date?: string | null;
  completed_at?: string | null;
  created_at?: string;
  updated_at?: string;
  assets?: Asset;
  technicians?: Technician;
  maintenance_schedules?: MaintenanceSchedule | null;
  work_order_parts?: WorkOrderPart[];
}

export interface CreateWorkOrderDto {
  title: string;
  description?: string;
  priority?: WorkOrderPriority;
  status?: WorkOrderStatus;
  asset_id: string;
  assigned_technician_id?: string;
  schedule_id?: string;
  scheduled_date?: string;
}

export interface UpdateStatusDto {
  status: WorkOrderStatus;
}

export interface ConsumedPartDto {
  part_id: string;
  quantity_used: number;
}

export interface CompleteWorkOrderDto {
  parts_used: ConsumedPartDto[];
}

export interface KanbanBoardResponse {
  PENDING: WorkOrder[];
  IN_PROGRESS: WorkOrder[];
  COMPLETED: WorkOrder[];
}

export interface DashboardMetrics {
  totalAssets: number;
  activeWorkOrders: number;
  overdueTasks: number;
  lowStockAlerts: number;
}
