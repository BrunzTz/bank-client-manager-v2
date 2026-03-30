import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { ClientManagementPage } from './client-management-page';
import { ClientService } from '../../core/services/client.service';
import { Client } from '../../core/models/client.model';

const mockClient: Client = {
  id: 'c1',
  companyName: 'Acme Corp',
  tradeName: 'Acme',
  cnpj: '12345678000100',
  email: 'acme@test.com',
  phone: '11999999990',
  status: 'ACTIVE',
  createdAt: '2024-01-01',
};

describe('ClientManagementPage', () => {
  let component: ClientManagementPage;
  let fixture: ComponentFixture<ClientManagementPage>;
  let clientServiceMock: {
    getClientById: jest.Mock;
    createClient: jest.Mock;
    updateClient: jest.Mock;
    deleteClient: jest.Mock;
  };

  beforeEach(async () => {
    clientServiceMock = {
      getClientById: jest.fn().mockReturnValue(of(mockClient)),
      createClient: jest.fn().mockReturnValue(of(mockClient)),
      updateClient: jest.fn().mockReturnValue(of(mockClient)),
      deleteClient: jest.fn().mockReturnValue(of([])),
    };

    await TestBed.configureTestingModule({
      imports: [ClientManagementPage],
      providers: [
        { provide: ClientService, useValue: clientServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ClientManagementPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => jest.restoreAllMocks());

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('hasError', () => {
    it('should return false for untouched field', () => {
      expect(component.hasError('companyName', 'required')).toBe(false);
    });

    it('should return true for touched field with matching error', () => {
      component.form.get('companyName')?.markAsTouched();
      expect(component.hasError('companyName', 'required')).toBe(true);
    });

    it('should return false for touched field without the error', () => {
      component.form.get('companyName')?.setValue('Acme');
      component.form.get('companyName')?.markAsTouched();
      expect(component.hasError('companyName', 'required')).toBe(false);
    });
  });

  describe('setPageTitle / setPageDescription / setPrimaryButtonLabel', () => {
    it('should return create values when mode is create', () => {
      component.mode = 'create';
      expect(component.setPageTitle()).toBe('Novo Cliente');
      expect(component.setPageDescription()).toBe('Preencha os dados para cadastrar um novo cliente.');
      expect(component.setPrimaryButtonLabel()).toBe('Criar Cliente');
    });

    it('should return edit values when mode is edit', () => {
      component.mode = 'edit';
      expect(component.setPageTitle()).toBe('Editar Cliente');
      expect(component.setPageDescription()).toBe('Atualize as informações do cliente selecionado.');
      expect(component.setPrimaryButtonLabel()).toBe('Salvar Alterações');
    });

    it('should return delete values when mode is delete', () => {
      component.mode = 'delete';
      expect(component.setPageTitle()).toBe('Excluir Cliente');
      expect(component.setPageDescription()).toContain('exclusão');
      expect(component.setPrimaryButtonLabel()).toBe('Confirmar Exclusão');
    });

    it('should return fallback values for query mode', () => {
      component.mode = 'query';
      expect(component.setPageTitle()).toBe('Cliente');
      expect(component.setPageDescription()).toBe('');
      expect(component.setPrimaryButtonLabel()).toBe('Salvar');
    });
  });

  describe('patchForm', () => {
    it('should fill the form with client data', () => {
      component.patchForm(mockClient);
      expect(component.form.get('companyName')?.value).toBe(mockClient.companyName);
      expect(component.form.get('email')?.value).toBe(mockClient.email);
      expect(component.form.get('status')?.value).toBe(mockClient.status);
    });
  });

  describe('resetForm', () => {
    it('should reset the form and enable it', () => {
      component.form.disable();
      component.resetForm();
      expect(component.form.enabled).toBe(true);
      expect(component.form.get('companyName')?.value).toBe('');
      expect(component.form.get('status')?.value).toBe('ACTIVE');
    });
  });

  describe('setClientManagementAction', () => {
    it('should do nothing when payload is empty', () => {
      const original = component.mode;
      component.setClientManagementAction(null as any);
      expect(component.mode).toBe(original);
    });

    it('should do nothing when payload has no action', () => {
      const original = component.mode;
      component.setClientManagementAction({} as any);
      expect(component.mode).toBe(original);
    });

    it('should set mode to create and reset form', () => {
      component.setClientManagementAction({ action: 'create' });
      expect(component.mode).toBe('create');
      expect(component.pageTitle).toBe('Novo Cliente');
      expect(component.client).toBeNull();
    });

    it('should set mode to edit and load client when clientId is provided', () => {
      component.setClientManagementAction({ action: 'edit', clientId: 'c1' });
      expect(component.mode).toBe('edit');
      expect(clientServiceMock.getClientById).toHaveBeenCalledWith('c1');
    });

    it('should not call loadClient for edit when clientId is missing', () => {
      component.setClientManagementAction({ action: 'edit', clientId: null });
      expect(clientServiceMock.getClientById).not.toHaveBeenCalled();
    });

    it('should set mode to delete, load client and disable form', () => {
      component.setClientManagementAction({ action: 'delete', clientId: 'c1' });
      expect(component.mode).toBe('delete');
      expect(clientServiceMock.getClientById).toHaveBeenCalledWith('c1');
      expect(component.form.disabled).toBe(true);
    });
  });

  describe('loadClient', () => {
    it('should patch form with client data on success', () => {
      component.loadClient('c1');
      expect(component.client).toEqual(mockClient);
      expect(component.form.get('email')?.value).toBe(mockClient.email);
      expect(component.loading).toBe(false);
    });

    it('should disable form when mode is delete on success', () => {
      component.mode = 'delete';
      component.loadClient('c1');
      expect(component.form.disabled).toBe(true);
    });

    it('should enable form when mode is edit on success', () => {
      component.mode = 'edit';
      component.form.disable();
      component.loadClient('c1');
      expect(component.form.enabled).toBe(true);
    });

    it('should set loading to false on error', () => {
      clientServiceMock.getClientById.mockReturnValue(throwError(() => new Error('Not found')));
      component.loadClient('c1');
      expect(component.loading).toBe(false);
    });
  });

  describe('submit', () => {
    it('should mark form as touched when invalid', () => {
      component.submit();
      expect(component.form.touched).toBe(true);
    });

    it('should create client on valid form in create mode', () => {
      component.mode = 'create';
      component.form.setValue({
        companyName: 'Acme', tradeName: 'Acme', cnpj: '12345678000100',
        email: 'acme@test.com', phone: '11999999990', status: 'ACTIVE',
      });
      const dispatchSpy = jest.spyOn(window, 'dispatchEvent');
      component.submit();
      expect(clientServiceMock.createClient).toHaveBeenCalled();
      expect(dispatchSpy).toHaveBeenCalled();
    });

    it('should set submitting to false on create error', () => {
      clientServiceMock.createClient.mockReturnValue(throwError(() => new Error('Server error')));
      component.mode = 'create';
      component.form.setValue({
        companyName: 'Acme', tradeName: 'Acme', cnpj: '12345678000100',
        email: 'acme@test.com', phone: '11999999990', status: 'ACTIVE',
      });
      component.submit();
      expect(component.submitting).toBe(false);
    });

    it('should update client on valid form in edit mode', () => {
      component.mode = 'edit';
      component.clientId = 'c1';
      component.form.setValue({
        companyName: 'Acme', tradeName: 'Acme', cnpj: '12345678000100',
        email: 'acme@test.com', phone: '11999999990', status: 'ACTIVE',
      });
      const dispatchSpy = jest.spyOn(window, 'dispatchEvent');
      component.submit();
      expect(clientServiceMock.updateClient).toHaveBeenCalledWith('c1', expect.any(Object));
      expect(dispatchSpy).toHaveBeenCalled();
    });

    it('should set submitting to false on update error', () => {
      clientServiceMock.updateClient.mockReturnValue(throwError(() => new Error('Server error')));
      component.mode = 'edit';
      component.clientId = 'c1';
      component.form.setValue({
        companyName: 'Acme', tradeName: 'Acme', cnpj: '12345678000100',
        email: 'acme@test.com', phone: '11999999990', status: 'ACTIVE',
      });
      component.submit();
      expect(component.submitting).toBe(false);
    });

    it('should call confirmDelete when mode is delete', () => {
      component.mode = 'delete';
      component.clientId = 'c1';
      component.form.setValue({
        companyName: 'Acme', tradeName: 'Acme', cnpj: '12345678000100',
        email: 'acme@test.com', phone: '11999999990', status: 'ACTIVE',
      });
      const deleteSpy = jest.spyOn(component, 'confirmDelete');
      component.submit();
      expect(deleteSpy).toHaveBeenCalled();
    });
  });

  describe('confirmDelete', () => {
    it('should do nothing when clientId is null', () => {
      component.clientId = null;
      component.confirmDelete();
      expect(clientServiceMock.deleteClient).not.toHaveBeenCalled();
    });

    it('should delete client and navigate back on success', () => {
      component.clientId = 'c1';
      const dispatchSpy = jest.spyOn(window, 'dispatchEvent');
      component.confirmDelete();
      expect(clientServiceMock.deleteClient).toHaveBeenCalledWith('c1');
      expect(dispatchSpy).toHaveBeenCalled();
    });

    it('should set submitting to false on error', () => {
      clientServiceMock.deleteClient.mockReturnValue(throwError(() => new Error('Server error')));
      component.clientId = 'c1';
      component.confirmDelete();
      expect(component.submitting).toBe(false);
    });
  });

  describe('navigateBackToQuery', () => {
    it('should dispatch query event without feedback', () => {
      const dispatchSpy = jest.spyOn(window, 'dispatchEvent');
      component.navigateBackToQuery();
      const event = dispatchSpy.mock.calls[0][0] as CustomEvent;
      expect(event.detail.action).toBe('query');
      expect(event.detail.feedbackMessage).toBeUndefined();
    });

    it('should dispatch query event with feedback message', () => {
      const dispatchSpy = jest.spyOn(window, 'dispatchEvent');
      component.navigateBackToQuery('Cliente criado!', 'success');
      const event = dispatchSpy.mock.calls[0][0] as CustomEvent;
      expect(event.detail.feedbackMessage).toBe('Cliente criado!');
      expect(event.detail.feedbackType).toBe('success');
    });

    it('should set submitting to false', () => {
      component.submitting = true;
      component.navigateBackToQuery();
      expect(component.submitting).toBe(false);
    });
  });

  describe('cancel', () => {
    it('should call navigateBackToQuery', () => {
      const spy = jest.spyOn(component, 'navigateBackToQuery');
      component.cancel();
      expect(spy).toHaveBeenCalled();
    });
  });
});
