import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrearPartidaComponent } from './crear-partida.component';

describe('CrearPartidaComponent', () => {
  let component: CrearPartidaComponent;
  let fixture: ComponentFixture<CrearPartidaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CrearPartidaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CrearPartidaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
