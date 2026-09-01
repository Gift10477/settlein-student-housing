Week 3: Endpoint List
Team Members
Githaka, Gift Gicheru (193923)
Kungu, Ian Gachigua (220259)
Abdi, Yahya Ahmed (220982)
Olale, Tiffany Akello (221126)

# Week 3: Endpoint List

| Method | Path | Purpose | Maps to Need |
|---|---|---|---|
| GET | `/api/v1/users/{id}/residence-area` | Returns the student's residential estate name, distance to campus, and general location coordinates for calculating central meetup locations and suggesting convenient study group venues. | Statement 1: Student Residential Area & Proximity to Campus |
| GET | `/api/v1/accommodations/{id}/study-amenities` | Returns study-related accommodation amenities such as Wi-Fi rating, dedicated desk space, backup generator availability, and quiet-hours policy to help identify suitable group project hosts. | Statement 2: Accommodation Study Amenities & Wi-Fi Reliability |
| GET | `/api/v1/students/{id}/lease-timeline` | Returns the student's lease start and move-in dates so relocation periods can be marked as busy or unavailable on the group collaboration calendar. | Statement 3: Move-in & Semester Lease Timeline Dates |
| GET | `/api/v1/users/{id}/public-profile` | Returns verified student profile information including display name, university affiliation, campus branch, and avatar URL for participant profiles and campus eligibility verification. | Statement 4: Verified Student Identity & University Affiliation |
| POST | `/api/v1/accommodations/group-inquiries` | Creates a shared-housing inquiry containing group member IDs and the target campus branch to alert study group members about suitable multi-bedroom accommodation. | Statement 5: Shared Accommodation & Co-Living Group Inquiry |

## Peer Review Feedback

### Reviewer: Team 2

- Endpoint 1: Reviewer confirmed that `/users/{id}/residence-area` follows the noun-based URL convention and has reasonable one-level nesting.
- Endpoint 2: Reviewer confirmed that `/accommodations/{id}/study-amenities` is appropriately nested because the study amenities belong to a specific accommodation.
- Endpoint 3: Reviewer confirmed that `/students/{id}/lease-timeline` uses reasonable one-level nesting.
- Endpoint 4: Reviewer suggested reviewing whether `/public-profile` should be represented as a separate nested resource or as part of the user resource.
- Endpoint 5: Reviewer confirmed that `POST /accommodations/group-inquiries` correctly represents creation of a new group inquiry.

### Revisions Made

- Reviewed the resource nesting of all endpoints.
- Retained the nested resources because each represents information accessed in the context of the identified parent resource.
- Confirmed that all endpoints use noun-based paths and appropriate HTTP methods.
- Confirmed that the list contains five endpoints and includes a POST write endpoint.

