# Security Specification: Loveth TopNotch Firestore

## 1. Data Invariants
-   A property must be created by an authenticated admin.
-   Public users can read featured and active properties.
-   Inquiries can be created by anyone (public), but can only be read by an authenticated admin.
-   Admin UID: `request.auth.uid` must match a document in `/admins/{uid}`.
-   Bootstrapped Admin: `femizydasilver@gmail.com`

## 2. The Dirty Dozen (Vulnerability Test Payloads)

1.  **Identity Spoofing**: `create` property with `ownerId: "someone_else_uid"`.
2.  **Privilege Escalation**: `update` property `status` to "Sold" as a non-admin.
3.  **Shadow Write**: `create` property with extra field `isVerified: true`.
4.  **PII Leak**: `list` inquiries as a non-admin.
5.  **Resource Exhaustion**: `create` inquiry with a 2MB string in `message`.
6.  **ID Poisoning**: `get` property using a 10KB string as `{propertyId}`.
7.  **Status Shortcutting**: `update` property status from "For Sale" to "Active" (invalid transition if "Active" is start state).
8.  **Orphaned Record**: `create` inquiry for a `propertyId` that does not exist.
9.  **Timestamp Spoofing**: `create` property with `createdAt: "2020-01-01"`.
10. **Admin Self-Promotion**: `create` document in `/admins/` by non-admin.
11. **Mass Extraction**: `list` all properties without a limit or secular filter.
12. **Type Poisoning**: `update` price with a string `"1000000"`.

## 3. Test Runner (Draft Plan)
A `firestore.rules.test.ts` will verify these payloads.
