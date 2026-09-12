import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  CdkDropListGroup,
  CdkDropList,
  CdkDrag,
  CdkDragDrop,
  moveItemInArray,
  transferArrayItem,
} from '@angular/cdk/drag-drop';
import { ApiService } from '../../core/services/api.service';
import { ToastService } from '../../core/services/toast.service';
import { WorkOrder, WorkOrderStatus, WorkOrderPriority } from '../../core/models/opstrack.models';
import { WorkOrderModalComponent } from './work-order-modal.component';
import { CompleteOrderModalComponent } from './complete-order-modal.component';

@Component({
  selector: 'app-kanban',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CdkDropListGroup,
    CdkDropList,
    CdkDrag,
    WorkOrderModalComponent,
    CompleteOrderModalComponent,
  ],
  template: `
    <div class="space-y-6 animate-fadeIn">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold tracking-tight text-white flex items-center gap-3">
            Work Orders Kanban
            <span class="text-xs px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-mono font-medium">
              {{ totalActiveCount() }} Active
            </span>
          </h1>
          <p class="text-xs sm:text-sm text-slate-400 mt-1">
            Drag cards across columns to advance maintenance workflows with real-time optimistic state.
          </p>
        </div>

        <div class="flex items-center gap-3">
          <button
            (click)="showCreateModal.set(true)"
            class="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-600/20 transition-all"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
            </svg>
            Create Work Order
          </button>
        </div>
      </div>

      <!-- Quick Filter Bar -->
      <div class="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 shadow-md flex flex-col sm:flex-row items-center gap-3 text-xs">
        <div class="relative flex-1 w-full">
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
          </div>
          <input
            type="text"
            [ngModel]="filterQuery()"
            (ngModelChange)="filterQuery.set($event)"
            placeholder="Filter cards by title or asset..."
            class="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div class="flex items-center gap-2 w-full sm:w-auto">
          <span class="text-slate-400 font-semibold whitespace-nowrap">Priority:</span>
          <select
            [ngModel]="selectedPriority()"
            (ngModelChange)="selectedPriority.set($event)"
            class="px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-200 focus:outline-none focus:border-blue-500 w-full sm:w-auto"
          >
            <option value="">All Priorities</option>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="CRITICAL">Critical</option>
          </select>

          @if (filterQuery() || selectedPriority()) {
            <button
              (click)="filterQuery.set(''); selectedPriority.set('')"
              class="px-2.5 py-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white border border-slate-700"
            >
              Clear
            </button>
          }
        </div>
      </div>

      <!-- Kanban Columns Container (cdkDropListGroup) -->
      @if (loading()) {
        <div class="p-20 text-center text-slate-400">
          <div class="inline-block w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-3"></div>
          <p class="text-sm">Synchronizing Kanban workflow columns...</p>
        </div>
      } @else {
        <div cdkDropListGroup class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <!-- Column 1: PENDING -->
          <div class="flex flex-col rounded-2xl bg-slate-900 border border-slate-800 shadow-xl overflow-hidden min-h-[550px]">
            <!-- Column Header -->
            <div class="p-4 border-b border-slate-800 bg-slate-900/90 flex items-center justify-between">
              <div class="flex items-center gap-2.5">
                <span class="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-sm shadow-amber-400/50"></span>
                <h3 class="font-bold text-sm text-white uppercase tracking-wider">Pending</h3>
              </div>
              <span class="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                {{ filteredPending().length }}
              </span>
            </div>

            <!-- Drop List Area -->
            <div
              cdkDropList
              id="col-pending"
              [cdkDropListData]="pendingOrders()"
              (cdkDropListDropped)="onDrop($event, 'PENDING')"
              class="flex-1 p-3 space-y-3 overflow-y-auto"
            >
              @if (filteredPending().length === 0) {
                <div class="h-36 rounded-xl border border-dashed border-slate-800/80 flex flex-col items-center justify-center text-slate-500 text-xs p-4 text-center">
                  <span>No pending work orders</span>
                  <span class="text-[10px] text-slate-600 mt-1">Drag tickets here to reset</span>
                </div>
              }

              @for (order of filteredPending(); track order.id) {
                <div
                  cdkDrag
                  [cdkDragData]="order"
                  class="p-4 rounded-xl bg-slate-800/90 hover:bg-slate-800 border border-slate-700/80 hover:border-slate-600 shadow-md cursor-grab active:cursor-grabbing transition-colors group relative"
                >
                  <!-- Drag Handle / Header -->
                  <div class="flex items-center justify-between mb-2">
                    <span
                      class="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider"
                      [ngClass]="{
                        'bg-rose-500/20 text-rose-300 border border-rose-500/30': order.priority === 'CRITICAL',
                        'bg-amber-500/20 text-amber-300 border border-amber-500/30': order.priority === 'HIGH',
                        'bg-blue-500/20 text-blue-300 border border-blue-500/30': order.priority === 'MEDIUM',
                        'bg-slate-700/50 text-slate-300 border border-slate-600': order.priority === 'LOW'
                      }"
                    >
                      {{ order.priority }}
                    </span>
                    <span class="text-[11px] font-mono text-slate-500">
                      {{ order.scheduled_date ? (order.scheduled_date | date:'MMM d') : 'Pending' }}
                    </span>
                  </div>

                  <!-- Title & Description -->
                  <h4 class="font-bold text-sm text-white group-hover:text-blue-400 transition-colors leading-snug">
                    {{ order.title }}
                  </h4>
                  @if (order.description) {
                    <p class="text-xs text-slate-400 line-clamp-2 mt-1">{{ order.description }}</p>
                  }

                  <!-- Asset Info -->
                  <div class="mt-3 pt-2.5 border-t border-slate-700/50 flex items-center justify-between text-xs text-slate-400">
                    <div class="flex items-center gap-1.5 truncate max-w-[170px]">
                      <svg class="w-3.5 h-3.5 text-slate-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
                      </svg>
                      <span class="truncate font-medium text-slate-300">{{ order.assets?.name }}</span>
                    </div>

                    <!-- Tech Pill -->
                    <span class="text-[11px] text-slate-400 truncate">
                      {{ order.technicians?.full_name?.split(' ')?.[0] || 'Unassigned' }}
                    </span>
                  </div>
                </div>
              }
            </div>
          </div>

          <!-- Column 2: IN_PROGRESS -->
          <div class="flex flex-col rounded-2xl bg-slate-900 border border-slate-800 shadow-xl overflow-hidden min-h-[550px]">
            <!-- Column Header -->
            <div class="p-4 border-b border-slate-800 bg-slate-900/90 flex items-center justify-between">
              <div class="flex items-center gap-2.5">
                <span class="w-2.5 h-2.5 rounded-full bg-indigo-400 shadow-sm shadow-indigo-400/50 animate-pulse"></span>
                <h3 class="font-bold text-sm text-white uppercase tracking-wider">In Progress</h3>
              </div>
              <span class="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                {{ filteredInProgress().length }}
              </span>
            </div>

            <!-- Drop List Area -->
            <div
              cdkDropList
              id="col-in-progress"
              [cdkDropListData]="inProgressOrders()"
              (cdkDropListDropped)="onDrop($event, 'IN_PROGRESS')"
              class="flex-1 p-3 space-y-3 overflow-y-auto"
            >
              @if (filteredInProgress().length === 0) {
                <div class="h-36 rounded-xl border border-dashed border-slate-800/80 flex flex-col items-center justify-center text-slate-500 text-xs p-4 text-center">
                  <span>No active tasks in progress</span>
                  <span class="text-[10px] text-slate-600 mt-1">Drag tickets here to begin work</span>
                </div>
              }

              @for (order of filteredInProgress(); track order.id) {
                <div
                  cdkDrag
                  [cdkDragData]="order"
                  class="p-4 rounded-xl bg-slate-800/90 hover:bg-slate-800 border border-indigo-500/30 hover:border-indigo-500/60 shadow-md cursor-grab active:cursor-grabbing transition-colors group relative"
                >
                  <div class="flex items-center justify-between mb-2">
                    <span
                      class="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider"
                      [ngClass]="{
                        'bg-rose-500/20 text-rose-300 border border-rose-500/30': order.priority === 'CRITICAL',
                        'bg-amber-500/20 text-amber-300 border border-amber-500/30': order.priority === 'HIGH',
                        'bg-blue-500/20 text-blue-300 border border-blue-500/30': order.priority === 'MEDIUM',
                        'bg-slate-700/50 text-slate-300 border border-slate-600': order.priority === 'LOW'
                      }"
                    >
                      {{ order.priority }}
                    </span>
                    <button
                      (click)="triggerCompleteModal(order)"
                      class="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/30 transition-colors"
                    >
                      Complete &rarr;
                    </button>
                  </div>

                  <h4 class="font-bold text-sm text-white group-hover:text-indigo-400 transition-colors leading-snug">
                    {{ order.title }}
                  </h4>
                  @if (order.description) {
                    <p class="text-xs text-slate-400 line-clamp-2 mt-1">{{ order.description }}</p>
                  }

                  <div class="mt-3 pt-2.5 border-t border-slate-700/50 flex items-center justify-between text-xs text-slate-400">
                    <div class="flex items-center gap-1.5 truncate max-w-[170px]">
                      <svg class="w-3.5 h-3.5 text-slate-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
                      </svg>
                      <span class="truncate font-medium text-slate-300">{{ order.assets?.name }}</span>
                    </div>

                    <span class="text-[11px] text-indigo-300 font-medium truncate">
                      {{ order.technicians?.full_name?.split(' ')?.[0] || 'Assigned' }}
                    </span>
                  </div>
                </div>
              }
            </div>
          </div>

          <!-- Column 3: COMPLETED -->
          <div class="flex flex-col rounded-2xl bg-slate-900 border border-slate-800 shadow-xl overflow-hidden min-h-[550px]">
            <!-- Column Header -->
            <div class="p-4 border-b border-slate-800 bg-slate-900/90 flex items-center justify-between">
              <div class="flex items-center gap-2.5">
                <span class="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50"></span>
                <h3 class="font-bold text-sm text-white uppercase tracking-wider">Completed</h3>
              </div>
              <span class="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                {{ filteredCompleted().length }}
              </span>
            </div>

            <!-- Drop List Area -->
            <div
              cdkDropList
              id="col-completed"
              [cdkDropListData]="completedOrders()"
              (cdkDropListDropped)="onDrop($event, 'COMPLETED')"
              class="flex-1 p-3 space-y-3 overflow-y-auto"
            >
              @if (filteredCompleted().length === 0) {
                <div class="h-36 rounded-xl border border-dashed border-slate-800/80 flex flex-col items-center justify-center text-slate-500 text-xs p-4 text-center">
                  <span>No completed tickets</span>
                  <span class="text-[10px] text-slate-600 mt-1">Drag tickets here to finalize</span>
                </div>
              }

              @for (order of filteredCompleted(); track order.id) {
                <div
                  cdkDrag
                  [cdkDragData]="order"
                  class="p-4 rounded-xl bg-slate-800/50 hover:bg-slate-800/70 border border-emerald-500/20 shadow-md cursor-grab active:cursor-grabbing transition-colors group relative"
                >
                  <div class="flex items-center justify-between mb-2">
                    <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      RESOLVED
                    </span>
                    <span class="text-[10px] font-mono text-emerald-400">
                      {{ order.completed_at ? (order.completed_at | date:'MMM d') : 'Done' }}
                    </span>
                  </div>

                  <h4 class="font-bold text-sm text-slate-200 group-hover:text-white line-through opacity-80 group-hover:opacity-100 transition-all leading-snug">
                    {{ order.title }}
                  </h4>

                  <!-- Consumed Parts Preview -->
                  @if (order.work_order_parts && order.work_order_parts.length > 0) {
                    <div class="mt-2 flex items-center gap-1 flex-wrap">
                      <span class="text-[10px] text-slate-500">Parts:</span>
                      @for (wop of order.work_order_parts; track wop.part_id) {
                        <span class="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-emerald-300 border border-emerald-500/20 font-mono">
                          {{ wop.spare_parts?.name || 'Part' }} &times; {{ wop.quantity_used }}
                        </span>
                      }
                    </div>
                  }

                  <div class="mt-3 pt-2.5 border-t border-slate-700/50 flex items-center justify-between text-xs text-slate-400">
                    <span class="truncate max-w-[170px] text-[11px] text-slate-400">
                      {{ order.assets?.name }}
                    </span>
                    <span class="text-[11px] text-slate-400">
                      {{ order.technicians?.full_name?.split(' ')?.[0] || 'Unassigned' }}
                    </span>
                  </div>
                </div>
              }
            </div>
          </div>
        </div>
      }

      <!-- Create Work Order Modal -->
      @if (showCreateModal()) {
        <app-work-order-modal
          (close)="showCreateModal.set(false)"
          (created)="loadKanban()"
        />
      }

      <!-- Complete Work Order Modal (with Parts Consumption Flow) -->
      @if (completingOrder(); as order) {
        <app-complete-order-modal
          [workOrder]="order"
          (close)="onCompletionCancelled()"
          (completed)="onOrderCompleted($event)"
          (cancelRevert)="onCompletionCancelled()"
        />
      }
    </div>
  `
})
export class KanbanComponent implements OnInit {
  private api = inject(ApiService);
  private toast = inject(ToastService);

  loading = signal<boolean>(true);

  pendingOrders = signal<WorkOrder[]>([]);
  inProgressOrders = signal<WorkOrder[]>([]);
  completedOrders = signal<WorkOrder[]>([]);

  // Snapshots for reverting optimistic updates if backend PATCH fails
  private previousPendingSnapshot: WorkOrder[] = [];
  private previousInProgressSnapshot: WorkOrder[] = [];
  private previousCompletedSnapshot: WorkOrder[] = [];

  showCreateModal = signal<boolean>(false);
  completingOrder = signal<WorkOrder | null>(null);

  filterQuery = signal<string>('');
  selectedPriority = signal<string>('');

  totalActiveCount = computed(
    () => this.pendingOrders().length + this.inProgressOrders().length
  );

  filteredPending = computed(() => this.filterList(this.pendingOrders()));
  filteredInProgress = computed(() => this.filterList(this.inProgressOrders()));
  filteredCompleted = computed(() => this.filterList(this.completedOrders()));

  ngOnInit() {
    this.loadKanban();
  }

  loadKanban() {
    this.loading.set(true);
    this.api.getKanbanBoard().subscribe({
      next: (res) => {
        this.pendingOrders.set(res.PENDING || []);
        this.inProgressOrders.set(res.IN_PROGRESS || []);
        this.completedOrders.set(res.COMPLETED || []);
        this.loading.set(false);
      },
      error: (err) => {
        this.toast.showError('Failed to load Kanban board');
        this.loading.set(false);
      },
    });
  }

  filterList(list: WorkOrder[]): WorkOrder[] {
    let result = list;
    const prio = this.selectedPriority();
    const query = this.filterQuery().trim().toLowerCase();
    if (prio) {
      result = result.filter((wo) => wo.priority === prio);
    }
    if (query) {
      result = result.filter(
        (wo) =>
          wo.title.toLowerCase().includes(query) ||
          (wo.assets?.name && wo.assets.name.toLowerCase().includes(query))
      );
    }
    return result;
  }

  takeSnapshot() {
    this.previousPendingSnapshot = this.pendingOrders().map((o) => ({ ...o }));
    this.previousInProgressSnapshot = this.inProgressOrders().map((o) => ({ ...o }));
    this.previousCompletedSnapshot = this.completedOrders().map((o) => ({ ...o }));
  }

  revertSnapshots() {
    this.pendingOrders.set(this.previousPendingSnapshot.map((o) => ({ ...o })));
    this.inProgressOrders.set(this.previousInProgressSnapshot.map((o) => ({ ...o })));
    this.completedOrders.set(this.previousCompletedSnapshot.map((o) => ({ ...o })));
  }

  private getFilteredListByStatus(status: WorkOrderStatus): WorkOrder[] {
    if (status === 'PENDING') return this.filteredPending();
    if (status === 'IN_PROGRESS') return this.filteredInProgress();
    if (status === 'COMPLETED') return this.filteredCompleted();
    return [];
  }

  private resolveTargetIndex(
    targetContainerData: WorkOrder[],
    targetFilteredList: WorkOrder[],
    currentIndex: number,
    draggedItem: WorkOrder
  ): number {
    const visibleWithoutDragged = targetFilteredList.filter((item) => item.id !== draggedItem.id);

    if (visibleWithoutDragged.length === 0) {
      return targetContainerData.length;
    }

    if (currentIndex <= 0) {
      const firstVisible = visibleWithoutDragged[0];
      const targetIdx = targetContainerData.findIndex((item) => item.id === firstVisible.id);
      return targetIdx !== -1 ? targetIdx : 0;
    }

    if (currentIndex >= visibleWithoutDragged.length) {
      const lastVisible = visibleWithoutDragged[visibleWithoutDragged.length - 1];
      const targetIdx = targetContainerData.findIndex((item) => item.id === lastVisible.id);
      return targetIdx !== -1 ? Math.min(targetIdx + 1, targetContainerData.length) : targetContainerData.length;
    }

    const nextVisible = visibleWithoutDragged[currentIndex];
    const targetIdx = targetContainerData.findIndex((item) => item.id === nextVisible.id);
    return targetIdx !== -1 ? targetIdx : Math.min(currentIndex, targetContainerData.length);
  }

  onDrop(event: CdkDragDrop<WorkOrder[]>, targetStatus: WorkOrderStatus) {
    const order: WorkOrder = event.item.data;
    if (!order) return;

    if (event.previousContainer === event.container) {
      // Re-ordered within the same column
      const currentList = [...event.container.data];
      const fromIdx = currentList.findIndex((item) => item.id === order.id);
      if (fromIdx !== -1) {
        currentList.splice(fromIdx, 1);
      }
      const filteredList = this.getFilteredListByStatus(targetStatus);
      const actualTo = this.resolveTargetIndex(currentList, filteredList, event.currentIndex, order);
      currentList.splice(actualTo, 0, order);
      this.setListByStatus(targetStatus, currentList);
      return;
    }

    // Take snapshot for optimistic revert
    this.takeSnapshot();

    // Determine actual source index in the data array (handles filters correctly)
    const sourceIdx = event.previousContainer.data.findIndex((item) => item.id === order.id);
    const actualPreviousIndex = sourceIdx !== -1 ? sourceIdx : event.previousIndex;

    const targetFilteredList = this.getFilteredListByStatus(targetStatus);
    const actualTargetIndex = this.resolveTargetIndex(
      event.container.data,
      targetFilteredList,
      event.currentIndex,
      order
    );

    // If moving to COMPLETED, launch parts consumption dialog
    if (targetStatus === 'COMPLETED') {
      // Move optimistically in local view
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        actualPreviousIndex,
        actualTargetIndex
      );
      this.updateSignalsFromArrays();
      this.completingOrder.set(order);
      return;
    }

    // Moving between PENDING and IN_PROGRESS
    transferArrayItem(
      event.previousContainer.data,
      event.container.data,
      actualPreviousIndex,
      actualTargetIndex
    );
    this.updateSignalsFromArrays();

    // Optimistically update order status property
    order.status = targetStatus;

    // Dispatch PATCH /api/work-orders/:id/status
    this.api.updateWorkOrderStatus(order.id, targetStatus).subscribe({
      next: (updated) => {
        order.status = updated.status;
        this.toast.showSuccess(
          `Moved "${order.title}" to ${targetStatus.replace('_', ' ')}`,
          'Status Updated'
        );
      },
      error: (err) => {
        console.error('Failed to update status on backend, reverting:', err);
        this.revertSnapshots();
        this.toast.showError(
          'Failed to update work order status on server. Reverting column position.',
          'Sync Error'
        );
      },
    });
  }

  triggerCompleteModal(order: WorkOrder) {
    this.takeSnapshot();
    this.completingOrder.set(order);
  }

  onOrderCompleted(updated: WorkOrder) {
    this.completingOrder.set(null);
    this.loadKanban();
  }

  onCompletionCancelled() {
    // Revert snapshot to prevent desync or card remaining stranded in COMPLETED
    this.completingOrder.set(null);
    this.revertSnapshots();
  }

  private setListByStatus(status: WorkOrderStatus, list: WorkOrder[]) {
    if (status === 'PENDING') this.pendingOrders.set(list);
    else if (status === 'IN_PROGRESS') this.inProgressOrders.set(list);
    else if (status === 'COMPLETED') this.completedOrders.set(list);
  }

  private updateSignalsFromArrays() {
    this.pendingOrders.set([...this.pendingOrders()]);
    this.inProgressOrders.set([...this.inProgressOrders()]);
    this.completedOrders.set([...this.completedOrders()]);
  }
}
