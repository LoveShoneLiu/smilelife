/// <reference types="jasmine" />
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { AppComponent } from './app.component';

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [provideRouter([])]
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should have menu labels', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    const menuLabels = [
      ...app.appPages.map((page) => page.title),
      ...app.labels,
    ];

    expect(menuLabels.length).toEqual(12);
    expect(menuLabels[0]).toContain('Inbox');
    expect(menuLabels[1]).toContain('Outbox');
  });

  it('should have urls', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;

    expect(app.appPages.length).toEqual(6);
    expect(app.appPages[0].url).toEqual(
      '/folder/inbox'
    );
    expect(app.appPages[1].url).toEqual(
      '/folder/outbox'
    );
  });
});
