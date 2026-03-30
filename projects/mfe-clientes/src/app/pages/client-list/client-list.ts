import { CommonModule } from '@angular/common';
import { afterNextRender, ChangeDetectorRef, Component, Injector, OnInit, OnDestroy, inject, runInInjectionContext } from '@angular/core';
import { ClientService } from '../../core/services/client.service';
import { Client } from '../../core/models/client.model';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { TagModule } from 'primeng/tag';
import { MessageService } from 'primeng/api';

type ManagementAction = 'create' | 'edit' | 'delete' | 'query';

interface ClientManagementEventPayload {
  action: ManagementAction;
  clientId?: string | null;
  feedbackMessage?: string;
  feedbackType?: 'success' | 'error';
}

const CLIENT_MANAGEMENT_EVENT = 'client-management-action';

@Component({
  selector: 'app-client-list',
  standalone: true,
  imports: [CommonModule, TableModule, ButtonModule, InputTextModule, ToastModule, TagModule],
  templateUrl: './client-list.html',
  styleUrl: './client-list.scss',
  providers: [MessageService]
})
export class ClientList implements OnInit, OnDestroy {
  private readonly clientService = inject(ClientService);
  private readonly messageService = inject(MessageService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly injector = inject(Injector);

  clients: Client[] = [];
  filteredClients: Client[] = [];
  searchTerm = '';
  loading = true;

  private managementEventHandler?: (event: Event) => void;

  ngOnInit(): void {
    runInInjectionContext(this.injector, () => {
      afterNextRender(() => {
        this.loadClients();
      });
    });

    this.managementEventHandler = (event: Event) => {
      const customEvent = event as CustomEvent<ClientManagementEventPayload>;
      const detail = customEvent.detail;
      if (!detail || detail.action !== 'query') {
        return;
      }

      setTimeout(() => {
        this.loadClients();
      });

      if (detail.feedbackMessage && detail.feedbackType) {
        this.showFeedback(detail.feedbackMessage, detail.feedbackType);
      }
    };

    window.addEventListener(CLIENT_MANAGEMENT_EVENT, this.managementEventHandler);
  }

  loadClients(): void {
    this.loading = true;
    this.cdr.detectChanges();

    this.clientService.getClients().subscribe({
      next: (clients) => {
        this.clients = [...clients];
        this.applyFilter();
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Erro ao carregar clientes:', error);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  onSearch(term: string): void {
    this.searchTerm = term;
    this.applyFilter();
  }

  private applyFilter(): void {
    const normalizedSearch = this.searchTerm.trim().toLowerCase();

    if (!normalizedSearch) {
      this.filteredClients = [...this.clients];
      return;
    }

    this.filteredClients = this.clients.filter((client) => {
      const statusLabel = this.getStatusLabel(client.status).toLowerCase();

      return [
        client.companyName,
        client.tradeName,
        client.cnpj,
        client.email,
        client.phone,
        statusLabel
      ].some((value) => value.toLowerCase().includes(normalizedSearch));
    });
  }

  private emitClientManagementAction(action: ManagementAction, clientId?: string): void {
    const payload: ClientManagementEventPayload = { action, clientId };
    window.dispatchEvent(new CustomEvent(CLIENT_MANAGEMENT_EVENT, { detail: payload }));
  }

  goToCreate(): void {
    this.emitClientManagementAction('create');
  }

  goToEdit(clientId: string): void {
    this.emitClientManagementAction('edit', clientId);
  }

  goToDelete(clientId: string): void {
    this.emitClientManagementAction('delete', clientId);
  }

  getSeverity(status: Client['status']): 'success' | 'danger' {
    return status === 'ACTIVE' ? 'success' : 'danger';
  }

  getStatusLabel(status: Client['status']): string {
    return status === 'ACTIVE' ? 'Ativo' : 'Inativo';
  }

  showFeedback(message: string, type: 'success' | 'error'): void {
    this.messageService.add({
      severity: type,
      summary: type === 'success' ? 'Sucesso' : 'Erro',
      detail: message,
      life: 3000
    });
  }

  ngOnDestroy(): void {
    if (this.managementEventHandler) {
      window.removeEventListener(CLIENT_MANAGEMENT_EVENT, this.managementEventHandler);
    }
  }
}