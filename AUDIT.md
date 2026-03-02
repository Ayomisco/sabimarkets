# SABI Markets Platform Audit

## 1. Data Sources - Manual vs Polymarket Direct

### ✅ **Directly from Polymarket API/WebSocket:**
- Market questions (`question`)
- Market descriptions (`description`)
- Market icons/images (`icon`, `image`)
- Outcome names (`outcomes` array - e.g., "Yes", "No")  
- Outcome prices (`outcomePrices` + live WebSocket updates)
- Trading volume (`volume`)
- Token IDs (`clobTokenIds`, `tokens`)
- Market slugs for URLs (`slug`)
- Close dates (`endDate`)
- Market status (`active`, `closed`)

### ⚠️ **Manually Assigned/Filtered:**
- **Market Categories** (`uiCategory`) - Manually categorized in `api.ts`:
  - Crypto, Politics, Sports, Economy, Entertainment, Global
  - Based on keyword matching (not from Polymarket tags/groups)
  
- **Market Selection** - Filtered by:
  - African keywords (manual keyword list)
  - Volume threshold for "Hot" markets (>$500K) 
  - Excluded keywords (US politics, crypto, etc.)
  - Limit to ~24 markets

- **"Hot" Badge** - Manually calculated (> $500K volume)

### ❌ **Currently Missing from Polymarket:**
- **Multi-outcome markets** - Only binary YES/NO supported
  - Polymarket has markets with 3+ outcomes (e.g., FIFA winner: Spain, England, Argentina...)
  - Current schema assumes 2 outcomes only
  
- **Market groups/categories** - Polymarket has native grouping
  - We use manual keyword-based categorization instead

- **Comments/Discussion** - No comments system
  - Polymarket has full discussion threads with likes/dislikes
  
- **Nested markets** - Date-based outcomes, multi-stage events
  
## 2. Probability Display Issue (0% values)

**Potential causes:**
1. Very low probability markets (< 0.5%) round to 0%
2. WebSocket hasn't updated yet (falls back to API prices)
3. Market might have invalid/missing price data

**Current calculation:**
```typescript
const yesPercent = Math.round(rawYesPrice * 100);
const noPercent = Math.round(rawNoPrice * 100);
```

**Fix needed:** Handle edge cases, show decimal precision for very low probabilities

## 3. Missing Features

### A. Comments/Discussion System
**What Polymarket has:**
- Authenticated user comments
- Nested replies (threads)
- Like/dislike on comments
- Sort by: Recent, Popular, Top
- User reputation/badges

**What we need:**
- Database schema for comments
- Authentication (we have wagmi/wallet)
- Comment API routes
- UI components for comment threads
- Real-time updates (optional)

### B. Multi-Outcome Markets
**Example:** "2026 FIFA World Cup Winner"
- Spain: 15¢
- England: 13¢
- Argentina: 12¢
- France: 11¢
- Brazil: 10¢
- ...etc

**Current limitation:**
- Schema assumes binary (YES/NO only)
- UI only renders 2 buttons
- BetModal hardcoded for YES/NO

**What's needed:**
- Support `outcomes.length > 2`
- Dynamic outcome rendering
- Multi-choice bet modal
- Update MarketCard, MarketDetailModal, BetModal

## 4. Recommendations

### Priority 1 (Quick Wins):
1. ✅ Fix probability rounding for edge cases
2. ✅ Use Polymarket's native category/tags if available in API
3. ✅ Add multi-outcome support for markets

### Priority 2 (Feature Additions):
1. ⏳ Add comments/discussion system
2. ⏳ Add user profiles linked to wallet
3. ⏳ Add market creation/resolution info

### Priority 3 (Enhanced UX):
1. Add market search/filter
2. Add notification system
3. Add leaderboards
4. Add market analytics

---

**Next Steps:**
1. Fix 0% probability display
2. Add multi-outcome market support
3. Build comments system with auth
