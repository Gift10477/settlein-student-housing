# SettleIn user manual

## Getting started

Open the local frontend shown by `npm run dev` in `app` (normally http://localhost:5173). Use **Create account** and choose **Student** or **Landlord**. Administrator accounts are created by an operator, not public registration. Sign in with your email and password. If two-factor authentication is enabled, enter the current six-digit authenticator code as well.

The navigation provides Properties, Help, Contact, My reservations and Account. The landlord portal appears only for landlords; Admin portal appears only for administrators. The moon/sun button changes theme. On a small screen, open the navigation menu.

## Students: finding and reserving a room

1. Open **Properties** and filter by campus, room type, maximum rent, gender policy, furnishing and amenities. Every checked amenity must be present. Use the search box and price/name sorting. Clear filters if there are no matches.
2. Open a property and inspect its description, contact details, rent and facilities.
3. Choose a current or future move-in date, arrival time and lease duration. Submit the reservation once.
4. Pay the displayed **mock booking fee** within **24 hours** using the payment panel. No money is transferred. Refresh My reservations if the response is interrupted: repeating payment for an already-paid reservation does not create another receipt.
5. Check **My reservations**. A paid reservation still awaits administrator approval and available capacity. A pending unpaid reservation becomes overdue at its deadline; an administrator must reject it. There is no automatic rejection job.
6. Once approved, you may save a review on the property's detail page. Your review uses your account name and persists in the database. Saving another review updates your existing review for that property.

Pending applications do not hold inventory. Approval consumes one unit atomically. Cancelling an approved reservation restores one unit. Payment here is a school demonstration: no live M-Pesa integration or automatic refund processing is claimed.

## Landlords: submitting a listing

Open **For Landlords**, fill in the property details and select amenities using checkboxes. Submit for approval. The listing is private until an administrator publishes it. The list shows awaiting review, published, rejected or unpublished status and refreshes periodically. Contact support for changes to an existing submission; administrators can edit its details.

## Administrators

- **Listings:** Use the Pending, Published, Unpublished and Rejected groups. Inspect expanded details, edit, approve/publish, unpublish or reject. Only listings without reservation history can be deleted; unpublish historical listings instead.
- **Reservations:** Search applications, inspect payment deadlines and expand details. Use the manual payment form to record an actual payment reference and time. Payments must fall inside the application's payment window. Approval is unavailable until payment is recorded. Reject overdue unpaid applications. Cancel approved applications when necessary.
- **Users:** Search accounts and choose student, landlord or administrator access. Changes revoke the affected user's sessions. An administrator cannot change their own role/password through this tool. The existing manual administrator password reset is distinct from self-service forgot-password recovery, which is intentionally excluded.
- **Payments:** Inspect receipts, amounts, method, references and dates. Mock and manually recorded payments are clearly identified.
- **Activity log:** Search actions, actors, targets and times. Entries are not editable from the portal. Guest support submissions and old missing actors are labelled appropriately.
- **Support:** Read saved contact messages and mark them resolved or reopen them. Sending an email reply is done through your own email client; the portal does not claim to send email.
- **Reports:** Choose reservations, payments, listings, users or audit trail. Filter by text/status/created date and sort. Download CSV, or choose Print / Save PDF. The report preview includes SettleIn branding, logo, generation date, criteria and record count. Set the browser print destination to Save as PDF.

## Account and security

Open **Account** to update profile details. To enable 2FA, enter your current password, copy the setup key into an authenticator as a time-based account, then verify a generated code. Enabling/disabling 2FA signs you out; use a fresh code at the next sign-in because used codes cannot be reused. Keep your authenticator accessible. Self-service password and authenticator recovery are not supplied.

Sessions expire after one hour and are invalidated on backend restart. Sign out on shared devices. Never share passwords, authenticator keys or administrator access files.

## Help and recovery from errors

| Message/situation | Action |
| --- | --- |
| Please sign in | Sign out if necessary, then sign in again. |
| No verified vacant room remains | Refresh the listing and choose another available property. |
| Payment deadline passed | Check the reservation, then contact support with its number. |
| Too many attempts | Wait for the displayed/requested retry period. |
| Invalid profile/listing values | Check required fields, lengths, numbers and selected options. |
| Server/database unavailable | Keep your form data, restore connectivity and retry. Check reservation/payment status before resubmitting. |
| No matching results | Clear filters or broaden the date range/search. |

The in-app **Help** page provides the same essential workflows. Use **Contact** to save a support message; placeholder telephone/address details on the demonstration site are not a guarantee of a real support office.
