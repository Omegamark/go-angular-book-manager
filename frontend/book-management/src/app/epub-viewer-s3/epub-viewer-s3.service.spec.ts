import { TestBed } from '@angular/core/testing';

import { EpubViewerS3Service } from './epub-viewer-s3.service';

describe('EpubViewerS3Service', () => {
  let service: EpubViewerS3Service;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EpubViewerS3Service);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
