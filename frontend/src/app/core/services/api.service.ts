import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  Asset,
  CreateAssetDto,
  WorkOrder,
  CreateWorkOrderDto,
  KanbanBoardResponse,
  CompleteWorkOrderDto,
  MaintenanceSchedule,
  CreateScheduleDto,
  SparePart,
  CreatePartDto,
  Technician,
} from '../models/opstrack.models';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:3000/api';

  // --- Assets ---
  getAssets(params?: { category?: string; status?: string }): Observable<Asset[]> {
    let httpParams = new HttpParams();
    if (params?.category) httpParams = httpParams.set('category', params.category);
    if (params?.status) httpParams = httpParams.set('status', params.status);
    return this.http.get<Asset[]>(`${this.baseUrl}/assets`, { params: httpParams });
  }

  searchAssets(query: string): Observable<Asset[]> {
    const params = new HttpParams().set('q', query);
    return this.http.get<Asset[]>(`${this.baseUrl}/assets/search`, { params });
  }

  getAssetById(id: string): Observable<Asset> {
    return this.http.get<Asset>(`${this.baseUrl}/assets/${id}`);
  }

  createAsset(dto: CreateAssetDto): Observable<Asset> {
    return this.http.post<Asset>(`${this.baseUrl}/assets`, dto);
  }

  deleteAsset(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/assets/${id}`);
  }

  // --- Work Orders ---
  getWorkOrders(params?: { status?: string; priority?: string; technicianId?: string }): Observable<WorkOrder[]> {
    let httpParams = new HttpParams();
    if (params?.status) httpParams = httpParams.set('status', params.status);
    if (params?.priority) httpParams = httpParams.set('priority', params.priority);
    if (params?.technicianId) httpParams = httpParams.set('technicianId', params.technicianId);
    return this.http.get<WorkOrder[]>(`${this.baseUrl}/work-orders`, { params: httpParams });
  }

  getKanbanBoard(): Observable<KanbanBoardResponse> {
    return this.http.get<KanbanBoardResponse>(`${this.baseUrl}/work-orders/kanban`);
  }

  getWorkOrderById(id: string): Observable<WorkOrder> {
    return this.http.get<WorkOrder>(`${this.baseUrl}/work-orders/${id}`);
  }

  createWorkOrder(dto: CreateWorkOrderDto): Observable<WorkOrder> {
    return this.http.post<WorkOrder>(`${this.baseUrl}/work-orders`, dto);
  }

  updateWorkOrderStatus(id: string, status: string): Observable<WorkOrder> {
    return this.http.patch<WorkOrder>(`${this.baseUrl}/work-orders/${id}/status`, { status });
  }

  completeWorkOrder(id: string, dto: CompleteWorkOrderDto): Observable<WorkOrder> {
    return this.http.post<WorkOrder>(`${this.baseUrl}/work-orders/${id}/complete`, dto);
  }

  // --- Maintenance Schedules ---
  getSchedules(params?: { dueSoonOnly?: boolean }): Observable<MaintenanceSchedule[]> {
    let httpParams = new HttpParams();
    if (params?.dueSoonOnly !== undefined) {
      httpParams = httpParams.set('dueSoonOnly', params.dueSoonOnly.toString());
    }
    return this.http.get<MaintenanceSchedule[]>(`${this.baseUrl}/schedules`, { params: httpParams });
  }

  createSchedule(dto: CreateScheduleDto): Observable<MaintenanceSchedule> {
    return this.http.post<MaintenanceSchedule>(`${this.baseUrl}/schedules`, dto);
  }

  triggerDueCheck(): Observable<{ generatedCount: number }> {
    return this.http.post<{ generatedCount: number }>(`${this.baseUrl}/schedules/trigger-due-check`, {});
  }

  // --- Spare Parts ---
  getSpareParts(params?: { lowStockOnly?: boolean }): Observable<SparePart[]> {
    let httpParams = new HttpParams();
    if (params?.lowStockOnly !== undefined) {
      httpParams = httpParams.set('lowStockOnly', params.lowStockOnly.toString());
    }
    return this.http.get<SparePart[]>(`${this.baseUrl}/parts`, { params: httpParams });
  }

  getSparePartById(id: string): Observable<SparePart> {
    return this.http.get<SparePart>(`${this.baseUrl}/parts/${id}`);
  }

  createSparePart(dto: CreatePartDto): Observable<SparePart> {
    return this.http.post<SparePart>(`${this.baseUrl}/parts`, dto);
  }

  // --- Technicians ---
  getTechnicians(): Observable<Technician[]> {
    return this.http.get<Technician[]>(`${this.baseUrl}/technicians`);
  }

  getTechnicianById(id: string): Observable<Technician> {
    return this.http.get<Technician>(`${this.baseUrl}/technicians/${id}`);
  }
}
