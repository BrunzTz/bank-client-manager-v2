import {
  Component,
  ComponentRef,
  OnDestroy,
  OnInit,
  ViewChild,
  ViewContainerRef,
  inject
} from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth/auth.service';
import { MicroFrontendService } from '../../core/services/micro-frontend/micro-frontend.service';
import { ButtonModule } from 'primeng/button';

type ActiveScreen = 'query' | 'management';

type ManagementAction = 'create' | 'edit' | 'delete' | 'query';

interface ClientManagementEventPayload {
  action: ManagementAction;
  clientId?: string | null;
}

const CLIENT_MANAGEMENT_EVENT = 'client-management-action';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [ButtonModule],
  templateUrl: './main-layout.html',
  styleUrls: ['./main-layout.scss']
})
export class MainLayout implements OnInit, OnDestroy {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  @ViewChild('dynamicHost', { read: ViewContainerRef, static: true })
  dynamicHost!: ViewContainerRef;

  private currentComponentRef: ComponentRef<any> | null = null;
  activeScreen: ActiveScreen = 'query';

  constructor(private microFrontendService: MicroFrontendService) {}

  private pendingClientManagementEvent: ClientManagementEventPayload | null = null;

  private async openManagementWithPendingAction(detail: ClientManagementEventPayload): Promise<void> {
    this.pendingClientManagementEvent = detail;

    if (this.activeScreen === 'management' && this.currentComponentRef) {
      this.applyPendingEventToManagement();
      return;
    }

    await this.renderScreen('management');
  }

  private applyPendingEventToManagement(): void {
    if (!this.pendingClientManagementEvent || !this.currentComponentRef) {
      return;
    }

    const componentInstance: any = this.currentComponentRef.instance;

    if (typeof componentInstance.setClientManagementAction === 'function') {
      componentInstance.setClientManagementAction(this.pendingClientManagementEvent);
      this.currentComponentRef.changeDetectorRef.detectChanges();
    }

    this.pendingClientManagementEvent = null;
  }

  private handleClientManagementEvent = (event: Event): void => {
    const customEvent = event as CustomEvent<ClientManagementEventPayload>;
    const detail = customEvent.detail;

    if (!detail || !detail.action) {
      return;
    }

    if (detail.action === 'query') {
      void this.showQuery();
      return;
    }

    void this.openManagementWithPendingAction(detail);
  };

  async ngOnInit(): Promise<void> {
    window.addEventListener(CLIENT_MANAGEMENT_EVENT, this.handleClientManagementEvent);
    await this.renderScreen('query');
  }

  async showQuery(): Promise<void> {
    if (this.activeScreen === 'query') return;
    await this.renderScreen('query');
  }

  async showManagement(): Promise<void> {
    if (this.activeScreen === 'management') {
      this.applyPendingEventToManagement();
      return;
    }

    await this.renderScreen('management');
  }

  private async renderScreen(screen: ActiveScreen): Promise<void> {
    try {
      this.dynamicHost.clear();

      if (this.currentComponentRef) {
        this.currentComponentRef.destroy();
        this.currentComponentRef = null;
      }

      if (screen === 'query') {
        const queryModule = await this.microFrontendService.loadRemoteComponent(
          4201,
          'mfe-clientes',
          './ClientList'
        );
        console.log(queryModule);
        this.currentComponentRef = this.dynamicHost.createComponent(
          queryModule.ClientList
        );

        this.activeScreen = screen;
        this.currentComponentRef.changeDetectorRef.detectChanges();
        return;
      }

      if (screen === 'management') {
        const managementModule = await this.microFrontendService.loadRemoteComponent(
          4202,
          'mfe-gerenciamento',
          './ClientManagementPage'
        );

        this.currentComponentRef = this.dynamicHost.createComponent(
          managementModule.ClientManagementPage
        );

        this.activeScreen = screen;
        this.currentComponentRef.changeDetectorRef.detectChanges();
        this.applyPendingEventToManagement();
        this.currentComponentRef.changeDetectorRef.detectChanges();
        return;
      }
    } catch (error) {
      console.error('Failed to render remote component', error);
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  ngOnDestroy(): void {
    window.removeEventListener(CLIENT_MANAGEMENT_EVENT, this.handleClientManagementEvent);
    this.currentComponentRef?.destroy();
  }
}