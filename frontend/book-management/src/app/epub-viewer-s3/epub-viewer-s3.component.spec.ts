import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EpubViewerS3Component } from './epub-viewer-s3.component';

describe('EpubViewerS3Component', () => {
  let component: EpubViewerS3Component;
  let fixture: ComponentFixture<EpubViewerS3Component>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [EpubViewerS3Component]
    });
    fixture = TestBed.createComponent(EpubViewerS3Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
