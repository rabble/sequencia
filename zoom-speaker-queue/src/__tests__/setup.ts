// ABOUTME: Test setup file for Vitest that configures DOM matchers and global test utilities
// ABOUTME: Loads jest-dom matchers and sets up any global test configuration needed

import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

// Cleanup after each test
afterEach(() => {
  cleanup();
});