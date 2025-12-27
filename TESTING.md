# Zeroglaze MVP - Testing Documentation

This document provides comprehensive information about the test suite for the Zeroglaze MVP project.

## Table of Contents

- [Overview](#overview)
- [Test Structure](#test-structure)
- [Running Tests](#running-tests)
- [Test Coverage](#test-coverage)
- [Critical Test Areas](#critical-test-areas)
- [Writing New Tests](#writing-new-tests)
- [Troubleshooting](#troubleshooting)

## Overview

The Zeroglaze test suite ensures reliability and correctness of core functionality, with special emphasis on:

- **Bonding Curve Logic** (100% coverage required)
- **Fee Calculations** (platform + creator fees)
- **API Endpoints** (trading, token creation)
- **Smart Contract Integration**
- **UI Components** (wallet connection, trading interface)

### Testing Stack

- **Jest** - Test runner and assertion library
- **React Testing Library** - Component testing
- **MSW (Mock Service Worker)** - API mocking
- **Supertest** - HTTP endpoint testing

## Test Structure

```
Zeroglaze_Project/
├── __tests__/
│   ├── integration/              # End-to-end integration tests
│   │   └── token-trading-flow.test.ts
│   └── utils/                    # Test utilities and mocks
│       └── test-helpers.ts
├── lib/
│   └── utils/
│       └── __tests__/            # Unit tests for utilities
│           ├── bonding-curve.test.ts
│           └── validation.test.ts
├── app/
│   └── api/
│       ├── trading/
│       │   └── __tests__/        # API route tests
│       │       └── quote.test.ts
│       └── streamer/
│           └── __tests__/
│               └── create-token.test.ts
└── components/
    ├── wallet/
    │   └── __tests__/            # Component tests
    │       └── WalletButton.test.tsx
    └── trading/
        └── __tests__/
            └── TradingInterface.test.tsx
```

## Running Tests

### Basic Commands

```bash
# Run all tests
npm test

# Run tests in watch mode (recommended during development)
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Run specific test suites
npm run test:unit          # Unit tests only
npm run test:integration   # Integration tests only
npm run test:bonding       # Bonding curve tests only
npm run test:api           # API route tests only
npm run test:components    # Component tests only

# Run tests with verbose output
npm run test:verbose

# Run tests for CI/CD
npm run test:ci
```

### Running Individual Test Files

```bash
# Run a specific test file
npm test bonding-curve.test.ts

# Run tests matching a pattern
npm test -- --testNamePattern="calculateBuyCost"

# Run only changed tests
npm test -- --onlyChanged
```

## Test Coverage

### Coverage Requirements

The project enforces strict coverage requirements:

| Area | Coverage Requirement |
|------|---------------------|
| **Bonding Curve** (`lib/utils/bonding-curve.ts`) | **100%** (all metrics) |
| **Global** | 70% (branches, functions, lines, statements) |

### Viewing Coverage Reports

```bash
# Generate coverage report
npm run test:coverage

# View HTML coverage report
open coverage/lcov-report/index.html
```

### Coverage Metrics

- **Statements**: Percentage of code statements executed
- **Branches**: Percentage of conditional branches tested
- **Functions**: Percentage of functions called
- **Lines**: Percentage of code lines executed

## Critical Test Areas

### 1. Bonding Curve Logic Tests

**Location**: `lib/utils/__tests__/bonding-curve.test.ts`

**What's Tested**:
- Initial price calculation (0.00000002796 SOL/token)
- Buy cost calculation with fees
- Sell output calculation with fees
- Fee calculations (1% platform, 2%/0.2% creator)
- Price impact calculations
- Constant product formula (x * y = k)
- Edge cases (zero amounts, max supply, slippage)
- Market cap calculations
- Graduation thresholds

**Example Test**:
```typescript
it('should calculate cost for buying 1M tokens when live', () => {
  const result = calculateBuyCost(virtualSol, virtualTokens, 1_000_000, true);

  expect(result.platformFee).toBe(Math.floor(result.solRequired * 0.01));
  expect(result.creatorFee).toBe(Math.floor(result.solRequired * 0.02));
  expect(result.totalCost).toBe(result.solRequired + result.platformFee + result.creatorFee);
});
```

### 2. API Route Tests

**Locations**:
- `app/api/trading/__tests__/quote.test.ts`
- `app/api/streamer/__tests__/create-token.test.ts`

**What's Tested**:
- Input validation (missing fields, invalid types)
- Request/response schemas (Zod validation)
- Error handling (token not found, graduated tokens)
- Fee calculation accuracy
- Quote generation (buy/sell)
- Token creation flow
- Database interactions

**Example Test**:
```typescript
it('should reject negative token amount', async () => {
  const request = new NextRequest('http://localhost/api/trading/quote', {
    method: 'POST',
    body: JSON.stringify({
      tokenMint: TEST_TOKEN_MINT,
      tokenAmount: -1000,
      isBuy: true,
    }),
  });

  const response = await POST(request);
  const data = await response.json();

  expect(response.status).toBe(400);
  expect(data.success).toBe(false);
});
```

### 3. Component Tests

**Locations**:
- `components/wallet/__tests__/WalletButton.test.tsx`
- `components/trading/__tests__/TradingInterface.test.tsx`

**What's Tested**:
- Wallet connection UI states
- Trading interface interactions
- Form validation
- Quote fetching and display
- Error handling and user feedback
- Accessibility features

**Example Test**:
```typescript
it('should fetch quote after typing amount', async () => {
  render(<TradingInterface {...mockProps} />);
  const input = screen.getByPlaceholderText('0.00');

  fireEvent.change(input, { target: { value: '1000000' } });

  await waitFor(() => {
    expect(global.fetch).toHaveBeenCalledWith(
      '/api/trading/quote',
      expect.objectContaining({
        method: 'POST',
        body: expect.stringContaining('1000000'),
      })
    );
  });
});
```

### 4. Integration Tests

**Location**: `__tests__/integration/token-trading-flow.test.ts`

**What's Tested**:
- Complete buy-hold-sell scenarios
- Multi-user trading interactions
- Creator fee accumulation
- Price progression over time
- Graduation scenarios
- Market making patterns
- Edge cases (whale dumps, rapid trades)

**Example Test**:
```typescript
it('should simulate a complete trading lifecycle', () => {
  let virtualSol = BONDING_CURVE_CONFIG.virtualSolReserves;
  let virtualTokens = BONDING_CURVE_CONFIG.virtualTokenReserves;

  // User 1 buys
  const buy1 = calculateBuyCost(virtualSol, virtualTokens, 10_000_000, false);
  virtualSol += buy1.solRequired;
  virtualTokens -= 10_000_000;

  // User 2 buys (higher price)
  const buy2 = calculateBuyCost(virtualSol, virtualTokens, 20_000_000, false);

  expect(buy2.solRequired / 20_000_000).toBeGreaterThan(buy1.solRequired / 10_000_000);
});
```

## Writing New Tests

### Test File Naming

- Unit tests: `[module-name].test.ts` or `[component-name].test.tsx`
- Integration tests: `[feature-name]-flow.test.ts`
- Place tests in `__tests__` directory adjacent to the module being tested

### Test Structure

```typescript
describe('Feature or Component Name', () => {
  // Setup
  beforeEach(() => {
    // Reset state, mocks, etc.
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Specific Functionality', () => {
    it('should do something specific', () => {
      // Arrange
      const input = setupTestData();

      // Act
      const result = functionUnderTest(input);

      // Assert
      expect(result).toBe(expectedValue);
    });
  });
});
```

### Best Practices

1. **Use Descriptive Test Names**
   - Good: `should calculate correct fees when creator is live`
   - Bad: `test fees`

2. **Test One Thing Per Test**
   - Each test should verify a single behavior
   - Use multiple tests for different scenarios

3. **Follow AAA Pattern**
   - **Arrange**: Set up test data
   - **Act**: Execute the code being tested
   - **Assert**: Verify the result

4. **Use Test Helpers**
   - Leverage `__tests__/utils/test-helpers.ts` for common mocks
   - Create reusable fixtures and utilities

5. **Mock External Dependencies**
   - Mock Supabase, Solana RPC, external APIs
   - Don't make real network calls in tests

6. **Test Edge Cases**
   - Zero amounts, negative values
   - Maximum values, overflow scenarios
   - Invalid inputs, missing data
   - Error conditions

### Example: Adding a New Test

```typescript
// lib/utils/__tests__/my-feature.test.ts

import { myFunction } from '../my-feature';

describe('myFunction', () => {
  describe('valid inputs', () => {
    it('should return correct value for positive input', () => {
      const result = myFunction(100);
      expect(result).toBe(200);
    });
  });

  describe('error handling', () => {
    it('should throw error for negative input', () => {
      expect(() => myFunction(-1)).toThrow('Input must be positive');
    });
  });
});
```

## Troubleshooting

### Common Issues

#### 1. Tests Fail Due to Timeout

```bash
# Increase timeout in jest.config.js
testTimeout: 10000  // 10 seconds
```

Or for individual tests:
```typescript
it('slow test', async () => {
  // test code
}, 15000); // 15 second timeout
```

#### 2. Mock Not Working

Ensure mocks are set up before importing the module:

```typescript
// Mock first
jest.mock('@/lib/supabase/client');

// Then import
import { supabase } from '@/lib/supabase/client';
```

#### 3. React Testing Library Errors

```bash
# Add to jest.setup.js
import '@testing-library/jest-dom'
```

#### 4. Type Errors in Tests

```typescript
// Use type assertions when needed
const mockFn = jest.fn() as jest.MockedFunction<typeof originalFn>;
```

#### 5. Coverage Not Meeting Threshold

```bash
# Check which lines are uncovered
npm run test:coverage

# Open HTML report
open coverage/lcov-report/index.html

# Add tests for uncovered code paths
```

### Debugging Tests

```bash
# Run tests in debug mode
node --inspect-brk node_modules/.bin/jest --runInBand

# Use console.log in tests (not recommended for production)
console.log('Debug:', variable);

# Use test.only to run a single test
it.only('should debug this test', () => {
  // ...
});

# Skip tests temporarily
it.skip('should skip this test', () => {
  // ...
});
```

### CI/CD Integration

The test suite is designed to run in CI/CD pipelines:

```yaml
# GitHub Actions example
- name: Run Tests
  run: npm run test:ci

- name: Upload Coverage
  uses: codecov/codecov-action@v3
  with:
    files: ./coverage/lcov.info
```

## Test Metrics

### Current Coverage

Run `npm run test:coverage` to see current metrics:

```
--------------------------------|---------|----------|---------|---------|
File                            | % Stmts | % Branch | % Funcs | % Lines |
--------------------------------|---------|----------|---------|---------|
lib/utils/bonding-curve.ts      |     100 |      100 |     100 |     100 |
app/api/trading/quote/route.ts  |      85 |       80 |      90 |      85 |
components/wallet/WalletButton  |      90 |       85 |      95 |      90 |
--------------------------------|---------|----------|---------|---------|
```

### Test Execution Time

Optimize for fast feedback:

- **Unit tests**: < 1s total
- **Component tests**: < 5s total
- **Integration tests**: < 10s total
- **Full suite**: < 20s total

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Solana Web3.js Testing](https://solana-labs.github.io/solana-web3.js/)
- [Next.js Testing Guide](https://nextjs.org/docs/testing)

## Contributing

When adding new features:

1. Write tests first (TDD approach recommended)
2. Ensure all tests pass: `npm test`
3. Check coverage: `npm run test:coverage`
4. Update this documentation if adding new test patterns

## Support

For questions about testing:
- Check existing tests for examples
- Review this documentation
- Consult the test-helpers.ts file for utilities
- Ask in the team's development channel
