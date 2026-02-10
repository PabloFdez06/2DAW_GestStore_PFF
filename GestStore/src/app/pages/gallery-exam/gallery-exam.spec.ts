import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GalleryExam } from './gallery-exam';

describe('GalleryExam', () => {
  let component: GalleryExam;
  let fixture: ComponentFixture<GalleryExam>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GalleryExam]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GalleryExam);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
