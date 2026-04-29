# Issue #411 — Token Payment Scheduler: Approach Statement

## Reconnaissance Findings & Implementation Strategy

### 1. Smart Contract Framework & Time Source
**Framework:** Soroban/Stellar (Rust-based, soroban-sdk 22.0.0)
**Time Source API:** `env.ledger().timestamp()` returns u64 Unix seconds (confirmed in upgrade.rs, staking.rs)
**Ledger Sequence:** `env.ledger().sequence()` returns u32 block height

### 2. Storage Primitives & Design for 50,000+ Schedules
**Storage Tier Decision:**
- **Instance Storage** (fast, ~5KB limit): Used for governance, mint caps, pause state
- **Persistent Storage** (unlimited): Used for certificates, DIDs, activity logs, and **payment schedules**

**Storage Design for Payment Scheduler:**
- Schedules stored in persistent storage with TTL extension (following pattern from certificates)
- Key pattern: `PaymentScheduleKey(schedule_id: u128)` → `PaymentSchedule`
- Execution history stored separately: `ExecutionHistoryKey(schedule_id: u128, execution_index: u32)` → `ExecutionRecord`
- Per-owner index: `OwnerSchedulesKey(owner: Address)` → `Vec<u128>` (schedule IDs)
- This design supports 50,000+ schedules by avoiding single-collection enumeration; instead, queries are owner-scoped

**Justification:** Persistent storage with TTL is proven in existing contracts (certificates, DIDs). Per-owner indexing minimizes storage reads in execution path (critical for gas optimization).

### 3. Token Transfer Mechanism
**Token Contract:** `contracts/src/token.rs` (RsTokenContract)
**Transfer Function Signature:**
```rust
pub fn transfer(env: Env, from: Address, to: Address, token_id: u32, amount: i128)
```
**Type System:**
- Token Amount: `i128` (signed 128-bit)
- Address: `Address` (Soroban Address)
- Token ID: `u32`

**Allowance Model:** Non-transferable by default (whitelisted transfer system). The payment scheduler contract must be granted explicit authorization by the schedule owner before execution. Implementation: The schedule owner calls `transfer()` with the scheduler contract as `from` address, or the scheduler contract is pre-authorized via a separate approval mechanism (to be determined from existing patterns).

**Actual Pattern Found:** Token contract uses `require_both_students()` to verify both sender and recipient are students. For payment scheduler, we will implement a similar authorization check: the scheduler contract must be authorized by the schedule owner to execute transfers on their behalf.

### 4. Error Handling
**Error Enum Location:** `contracts/src/lib.rs` defines `CertError` with 24 variants (codes 1-24)
**New Error Enum:** Create `contracts/src/payment_scheduler.rs` with `PaymentSchedulerError` enum following identical pattern:
```rust
#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq)]
pub enum PaymentSchedulerError {
    NotInitialized = 1,
    ScheduleNotFound = 2,
    Unauthorized = 3,
    InvalidAmount = 4,
    InvalidInterval = 5,
    InvalidRecipient = 6,
    ScheduleNotActive = 7,
    ExecutionTooEarly = 8,
    ConditionFailed = 9,
    TransferFailed = 10,
    MaxRetriesExceeded = 11,
    MaxExecutionsReached = 12,
    InvalidCondition = 13,
    // ... additional variants as needed
}
```

### 5. Event Emission Pattern
**Pattern Found:** Dual v1/v2 event system in `contracts/src/events.rs`
- v1: Simple tuples for indexers (backward compatibility)
- v2: Structured events with `EventPublisher` helper

**Payment Scheduler Events:**
```rust
// v1 events (simple tuples)
env.events().publish(
    (Symbol::new(&env, "payment_scheduled"),),
    (schedule_id, recipient, amount, interval)
);

// v2 events (structured)
env.events().publish(
    (Symbol::new(&env, "payment_scheduled"), Symbol::new(&env, "v2")),
    (schedule_id, recipient, amount, interval, created_at)
);
```

**Events Required:**
- `payment_scheduled` - Schedule created
- `payment_executed` - Payment executed successfully
- `payment_failed` - Payment execution failed
- `schedule_paused` - Schedule paused
- `schedule_resumed` - Schedule resumed
- `schedule_cancelled` - Schedule cancelled
- `max_retries_exceeded` - Retry limit reached
- `schedule_completed` - Max executions reached

### 6. Retry Mechanism Design
**Retry State Storage:** Stored in `ExecutionRecord` struct
**Maximum Retries:** 3 retries per execution window (configurable via admin function)
**Retry Interval:** Same as schedule interval (e.g., if schedule is daily, retry next day)
**Behavior:**
- On transfer failure: increment retry count, emit failure event, do NOT advance next_execution
- After max retries exceeded: mark execution window as permanently failed, advance next_execution to next interval, emit max_retries_exceeded event
- Retry state is immutable by external callers (only execution engine can modify)

### 7. Conditional Execution Model
**Condition Types (Phase 3):**
1. **Balance Verification:** Owner or specified account must hold ≥ minimum balance of specified token
2. **Time-Based:** Execution only within specified time window (start_timestamp, end_timestamp)
3. **Custom Condition:** Cross-contract call to external condition contract (if cross-contract calls found in codebase)

**Condition Storage:** `ConditionKey(schedule_id: u128)` → `Vec<Condition>`
**Condition Checking:** Evaluated before transfer; all conditions must pass or execution is blocked

### 8. Frontend Framework & Interaction Pattern
**Framework:** Next.js 16.1.6 (React 19.2.3) + TypeScript 5
**State Management:** Zustand 5.0.12
**Styling:** Tailwind CSS 4
**Contract Interaction:** `@stellar/stellar-sdk` 14.6.1 + Freighter/Albedo wallet adapters

**Component Pattern (from Web3Login.tsx, AuditLogList.tsx):**
```typescript
export const SchedulerDashboard: React.FC<Props> = ({ ... }) => {
  const [schedules, setSchedules] = useState<PaymentSchedule[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch schedules from contract
  }, []);

  return (
    <div className="space-y-6">
      {/* Form, List, History, Analytics */}
    </div>
  );
};
```

**Contract Interaction Pattern (from soroban.ts):**
- Use `@stellar/stellar-sdk` rpc.Server for read-only queries
- Use wallet provider (Freighter/Albedo) for transaction signing
- Build Soroban transactions using stellar-sdk
- Submit via rpc.Server.sendTransaction()

### 9. Test Framework & Utilities
**Framework:** Soroban testutils (soroban-sdk with testutils feature)
**Environment Setup:** `Env::default()` with `env.mock_all_auths()`
**Time Advancement:** `env.ledger().with_mut(|l| l.timestamp = ...)`
**Assertions:** Standard Rust `assert_eq!`, `assert!`
**Test Pattern:**
```rust
#[test]
fn test_name() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register(PaymentSchedulerContract, ());
    let client = PaymentSchedulerContractClient::new(&env, &contract_id);
    // ... test logic
}
```

### 10. New Dependencies
**Contracts:** None (soroban-sdk 22.0.0 already available)
**Frontend:** None (all required libraries already in package.json: @stellar/stellar-sdk, zustand, tailwindcss)

### 11. CI/CD Checks
**Contracts:**
- `cargo build --target wasm32-unknown-unknown --release`
- `cargo clippy --lib -- -D warnings`
- `cargo fmt --all -- --check`
- `cargo test --workspace`

**Frontend:**
- `npx tsc --noEmit`
- `npm run lint`
- `npm run format:check`
- `npm run build`

### 12. Branch & Commit Strategy
**Branch Name:** `feature/411-payment-scheduler` (follows existing convention)
**Commit Message:** `feat: add token payment scheduler with recurring transfers and conditional execution (#411)`
**Rebase:** Regular rebases during 2-day implementation window

---

## Implementation Scope

### Files to Create:
1. `contracts/src/payment_scheduler.rs` - Schedule creation, management
2. `contracts/src/execution_engine.rs` - Execution logic, retry handling
3. `contracts/src/conditions.rs` - Conditional execution logic (or inline in execution_engine.rs)
4. `frontend/src/components/payments/SchedulerDashboard.tsx` - Frontend dashboard
5. `frontend/src/hooks/usePaymentScheduler.ts` - Custom hook for contract interaction
6. `frontend/src/lib/payment-scheduler-client.ts` - Contract client wrapper

### Files to Modify:
1. `contracts/src/lib.rs` - Register new modules
2. `contracts/src/payment_scheduler.rs` - Add new error variants (or create new enum)
3. Contract test files - Add comprehensive test suite
4. Frontend test files - Add component tests

### Files NOT to Modify:
- Existing contract modules (token.rs, events.rs, etc.)
- Existing frontend components
- CI/CD workflows (unless new checks required)

---

## Security & Invariants

**Trust Model:**
- Only schedule owner may create, pause, cancel their schedules
- Execution is permissionless (any caller may trigger execution)
- Condition contracts are untrusted (cross-contract calls treated as potentially malicious)

**Invariants:**
1. No token transfer occurs without all conditions passing
2. No token transfer occurs before next_execution timestamp
3. Failed executions leave all on-chain state exactly as before
4. No schedule can be managed by any caller other than owner
5. Retry state cannot be manipulated by external callers
6. Execution count cannot be decremented or reset
7. No silent error swallowing (all errors explicitly typed)

**Gas Optimization:**
- Execution path minimizes storage reads (load schedule, check conditions, transfer, update next_execution)
- Per-owner indexing avoids full schedule enumeration
- Batch operations supported for admin functions
- TTL management for persistent storage

---

## Success Criteria

✅ Payment schedules can be created with all required fields
✅ Schedules execute at correct times with proper token transfers
✅ Retry logic works correctly (max 3 retries per window)
✅ Conditions block execution when not met
✅ Frontend dashboard allows full schedule management
✅ All operations emit proper events
✅ 95%+ test coverage on new code
✅ All CI checks pass
✅ Supports 50,000+ schedules without performance degradation
✅ Gas costs optimized for execution path
