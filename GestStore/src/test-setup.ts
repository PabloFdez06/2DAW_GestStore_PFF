/**
 * Test setup file for Angular + Vitest
 * Configures the testing environment before running tests
 */
import { TestBed } from '@angular/core/testing';
import { beforeEach } from 'vitest';

// Reset Angular testing module before each test to ensure clean state
beforeEach(() => {
  TestBed.resetTestingModule();
});
