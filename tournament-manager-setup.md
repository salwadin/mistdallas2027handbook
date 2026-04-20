# Weekend Tournament Manager Setup

This is the planned event-week operations layer for rooms, competitions, registered students, and NFC check-ins.

## What To Run In Supabase

When you are ready, open Supabase SQL Editor and run:

`supabase-tournament-only.sql`

This creates:

- `tournament_rooms`: room inventory, capacity, privacy notes, AV notes, room captain role
- `room_availability`: exact dates and times each room is available
- `competition_blocks`: scheduled competition rounds inside room/time blocks
- `student_registrations`: imported student records after registration opens
- `student_competition_entries`: which competitions each student registered for
- `room_assignments`: generated student placements into competition blocks
- `nfc_scan_logs`: live event check-in and room scan history

## Recommended Build Order

1. Room inventory manager
   Add rooms, capacities, setup notes, and available time windows.

2. Competition block scheduler
   Place competitions into rooms and times.

3. Registration import
   Import registered students and their competitions.

4. Room assignment builder
   Generate participant rosters per competition block.

5. NFC check-in flow
   Scan student tags at main check-in and room entry.

## NFC Notes

The portal schema supports NFC tags through the `nfc_uid` field on `student_registrations`.

A future scanner screen should:

- read or type an NFC UID
- match it to a student
- check whether that student belongs in the selected room/time block
- insert a row into `nfc_scan_logs`
- update `room_assignments.assignment_status` to `checked_in` when valid

## Privacy Note

Student registration records should not be public. The SQL keeps student records, assignments, and scan logs admin-only by default. Authenticated organizers can insert scan logs, but only admins can view the full scan history.
