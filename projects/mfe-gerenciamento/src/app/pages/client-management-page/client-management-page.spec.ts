import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientManagementPage } from './client-management-page';

describe('ClientManagementPage', () => {
  let component: ClientManagementPage;
  let fixture: ComponentFixture<ClientManagementPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClientManagementPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClientManagementPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
