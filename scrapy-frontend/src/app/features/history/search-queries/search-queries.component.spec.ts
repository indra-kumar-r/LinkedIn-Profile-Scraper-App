import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchQueriesComponent } from './search-queries.component';

describe('SearchQueriesComponent', () => {
  let component: SearchQueriesComponent;
  let fixture: ComponentFixture<SearchQueriesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SearchQueriesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SearchQueriesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
