import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WalletView } from './wallet-view';

describe('WalletView', () => {
  let component: WalletView;
  let fixture: ComponentFixture<WalletView>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WalletView],
    }).compileComponents();

    fixture = TestBed.createComponent(WalletView);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
