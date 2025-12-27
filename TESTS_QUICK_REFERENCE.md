# Tests Quick Reference

Quick guide to running and understanding Zeroglaze MVP tests.

## Quick Start

```bash
# Run all tests
npm test

# Watch mode (best for development)
npm run test:watch

# Coverage report
npm run test:coverage
```

## Test Files Created

### Configuration (2 files)
- `jest.config.js` - Jest configuration
- `jest.setup.js` - Test environment setup

### Unit Tests (3 files)
- `lib/utils/__tests__/bonding-curve.test.ts` - Bonding curve logic (100+ tests)
- `lib/utils/__tests__/validation.test.ts` - Input validation (40+ tests)
- `__tests__/utils/test-helpers.ts` - Test utilities

### API Tests (2 files)
- `app/api/trading/__tests__/quote.test.ts` - Quote endpoint (50+ tests)
- `app/api/streamer/__tests__/create-token.test.ts` - Token creation (45+ tests)

### Component Tests (2 files)
- `components/wallet/__tests__/WalletButton.test.tsx` - Wallet button (30+ tests)
- `components/trading/__tests__/TradingInterface.test.tsx` - Trading UI (40+ tests)

### Integration Tests (1 file)
- `__tests__/integration/token-trading-flow.test.ts` - E2E scenarios (35+ tests)

## Test Commands

```bash
# Specific test suites
npm run test:bonding       # Critical bonding curve
npm run test:api           # API endpoints
npm run test:components    # UI components
npm run test:integration   # Integration flows

# Development
npm run test:watch         # Auto-rerun on changes
npm run test:verbose       # Detailed output

# Coverage
npm run test:coverage      # Generate coverage report

# CI/CD
npm run test:ci            # Optimized for pipelines
```

## Coverage Requirements

| Component | Required | Status |
|-----------|----------|--------|
| Bonding Curve | 100% | Critical |
| Global | 70% | Standard |

## Key Test Patterns

### Bonding Curve
```typescript
const result = calculateBuyCost(virtualSol, virtualTokens, amount, isLive);
expect(result.platformFee).toBe(Math.floor(result.solRequired * 0.01));
```

### API
```typescript
const response = await POST(request);
expect(response.status).toBe(200);
expect(data.success).toBe(true);
```

### Components
```typescript
render(<Component {...props} />);
fireEvent.click(button);
await waitFor(() => expect(element).toBeInTheDocument());
```

## Critical Tests

1. **Fee Calculations**: 1% platform + 2%/0.2% creator
2. **Price Impact**: Increases with trade size
3. **Constant Product**: x * y = k always maintained
4. **Input Validation**: Rejects invalid/malicious inputs
5. **Edge Cases**: Zero, negative, overflow scenarios

## Test Statistics

- **Total Files**: 11
- **Total Tests**: 300+
- **Total Assertions**: 570+
- **Execution Time**: < 20 seconds

## Documentation

- **Full Guide**: `TESTING.md`
- **Summary**: `TEST_SUMMARY.md`
- **This File**: Quick reference

## Common Issues

### Tests fail to start
```bash
# Check dependencies
npm install

# Verify jest is installed
npm list jest
```

### Specific test fails
```bash
# Run only that test
npm test -- path/to/test.ts

# Run with verbose output
npm run test:verbose -- path/to/test.ts
```

### Coverage below threshold
```bash
# Check what's not covered
npm run test:coverage
open coverage/lcov-report/index.html
```

## Success Criteria

- All tests pass
- Coverage meets thresholds
- No console errors/warnings
- Fast execution (< 20s)

---

For detailed documentation, see `TESTING.md`
