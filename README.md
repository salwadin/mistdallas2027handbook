# MIST Dallas Portal

A unified operations platform for **organizer management, season deadlines, application workflows, and weekend tournament logistics**.

The portal combines public-facing organizer discovery with authenticated admin and organizer tools:

1. **Role discovery, applications, and role claiming**
2. **Organizer workbooks and progress tracking by planning phase**
3. **Deadline, calendar, and reminder management**
4. **Announcements, meeting support, runbooks, and knowledge tools**
5. **MyMIST integration staging and tournament operations**

---

## Overview

The MIST Dallas Portal is designed to help MIST Dallas run the full organizer season and event weekend from one place.

It supports a hybrid experience:

* **Public portal access** for browsing roles, viewing team pages, applying for roles, and checking application status
* **Authenticated organizer access** for claiming roles, using role workbooks, tracking progress, and configuring reminder preferences
* **Admin access** for reviewing applications, managing deadlines, posting announcements, editing tournament data, and running organizer operations

The portal uses **Supabase** for auth, database tables, role-linked profiles, and Edge Functions.

---

## Product Areas

## 1. Organizer Dashboard

The dashboard acts as the main entry point to the portal.

It shows:

* signed-in or public access state
* claimed role and team
* individual progress percentage
* number of claimed and open roles
* average organizer progress
* quick links to workbooks, team pages, calendar, command center, meetings, integrations, tournament tools, directory, knowledge search, and applications

The public view is intentionally useful before login so organizers can browse the board before claiming a seat.

---

## 2. Role Discovery, Claiming, and Applications

The portal supports an organizer staffing flow with three separate paths:

### Public role browsing

Users can browse roles and teams before creating an account.

### Role claiming

After sign-in, organizers can complete a profile and claim an open role. Claimed roles are locked so another organizer cannot claim the same seat.

Stored profile data includes:

* user ID
* full name
* email
* role ID
* team
* admin flag

### Role applications

Applicants can submit a structured application for open roles. The application flow supports:

* contact email and optional phone
* organizer commitment acknowledgements
* experience and role-interest questions
* preferred roles
* longer written responses for leadership review

Admins can review applications, mark them as pending, approved, or declined, and optionally send decision emails.

### Application status lookup

Applicants can check status using the email address they used when applying.

---

## 3. Organizer Workbooks and Progress Tracking

Each role can have a workbook tied to planning phases and role-specific tasks.

The workbook system supports:

* phase-based checklists
* notes
* saved field responses
* autosave behavior
* phase completion percentage
* overall workbook completion percentage
* shared progress board visibility

Progress is stored in `workbook_progress` by user and phase.

This makes the portal more than a directory: it becomes the operating system for organizer accountability.

---

## 4. Team Pages and Directory

The portal includes team-based views for organizer coordination.

These views are intended to show:

* every role for each team
* whether a role is claimed or unclaimed
* who currently owns a role
* role start phase
* role task previews
* contact details for claimed roles

The directory is the shared roster of organizers and role ownership.

---

## 5. Command Center and Planning Console

The portal is structured around leadership visibility, not just form entry.

The dashboard navigation and UI content indicate support for:

* **Command Center** for live leadership visibility
* **Planning Console** for high-priority systems and next actions
* **Progress Board** for shared phase completion
* **Timeline** for the full planning cycle
* **My Next Actions** blocks for role-specific focus

This makes the portal suitable for both day-to-day organizer work and leadership oversight.

---

## 6. Calendar and Deadline Manager

The calendar system manages season milestones and event-prep deadlines.

It supports:

* editable deadline records in `deadline_events`
* phase-linked deadlines
* due date and display label
* owner labels
* deadline types and priorities
* reminder eligibility flags
* calendar card views

### Calendar export features

The portal also supports calendar actions directly in the UI:

* export a single deadline as `.ics`
* export all deadlines as `.ics`
* open single deadlines in Google Calendar
* open all deadlines in Google Calendar

This allows deadlines to function as both an internal planning board and an organizer-facing calendar feed.

---

## 7. Reminder Preferences and Automated Emails

The reminder system uses:

* `reminder_preferences`
* `reminder_deliveries`
* `send-deadline-reminders` Edge Function

Each user can configure:

* whether reminder emails are enabled
* how many days before a deadline they want reminders

Reminder sends are protected against duplicates using `reminder_deliveries`.

The system sends reminders only when:

* reminders are enabled for the user
* the deadline is marked reminder-eligible
* the deadline date matches the configured `days_before` window
* that reminder has not already been delivered that day

---

## 8. Application Decision Emails

Admins can send approval or decline emails from the portal using:

* `supabase/functions/send-application-decision/index.ts`

This function:

* loads the selected application
* validates the decision value
* uses review notes when provided
* sends the email through Resend
* links the recipient back to the portal

Approval flow is designed to work best when the applicant has already created an account using the same email address used on the application.

---

## 9. Announcements

The portal includes an announcements layer backed by the `announcements` table.

Admins can create or update announcements with:

* title
* body
* audience
* priority
* active status

Announcements appear as leadership updates on the dashboard and help centralize organizer communication.

---

## 10. Meetings, Runbooks, Knowledge, and Feedback

The uploaded portal HTML also shows a broader organizer operations layer beyond deadlines and tournament data.

### Meeting support

The portal includes meeting-oriented views for:

* meeting templates
* blockers
* action items
* decision logging
* leadership sync structure

### Event weekend runbook

The runbook content is organized around operational areas such as:

* Command Center
* Main Check-In
* Competition Rooms
* Communications
* Escalations

### Organizer knowledge base

The knowledge/rulebook layer is designed to answer common organizer questions around:

* confidentiality
* professionalism
* role claims
* applications
* deadlines
* meetings
* event weekend decision flow
* MyMIST usage

### Feedback addressal

The portal also includes a feedback analysis layer that tracks recurring themes such as:

* communication clarity
* room flow and competition timing
* organizer training
* registration data accuracy
* role accountability

This suggests the portal is also intended to preserve institutional memory and turn debrief feedback into action plans.

---

## 11. MyMIST Integration Center

The portal includes a staging area for MyMIST-related imports.

Planned or in-progress data areas include:

* `mymist_import_batches`
* `mymist_participants`
* `mymist_schools`
* `mymist_judges`

The integration model is to use MyMIST as the source of truth for registration, while importing snapshots into the portal for operational planning.

Potential use cases include:

* participant rosters
* school records
* judge lists
* badge codes
* NFC mappings
* operational exports for event weekend

---

## 12. Tournament Manager

The tournament operations layer is designed to support event-week planning and execution through:

* room inventory management
* room availability windows
* competition block scheduling
* registration imports
* room assignment generation
* NFC-based student check-in

### Tournament tables

The tournament manager includes:

* `tournament_rooms`
* `room_availability`
* `competition_blocks`
* `student_registrations`
* `student_competition_entries`
* `room_assignments`
* `nfc_scan_logs`

### Room management

Admins can manage:

* room name
* building
* floor
* capacity
* room type
* privacy notes
* AV notes
* setup notes
* room captain role

### Room availability

Availability windows are stored separately so competition placement can be checked against actual room access times.

### Competition blocks

Competition scheduling supports:

* competition name
* round label
* division
* room assignment
* block date
* start and end time
* capacity
* judge count
* materials
* status

### Assignments

Admins can assign students to competition blocks and update assignment status.

### Validation and conflict awareness

The tournament workflow is designed to support checks such as:

* blocks with no room
* blocks outside room availability
* double-booked rooms
* block capacity over room capacity
* assignment overflow
* students with missing room assignments

---

## 13. Student Registration Imports

The portal supports CSV-based student import flows.

Expected student fields include:

* `external_student_id`
* `full_name`
* `email`
* `school`
* `grade_level`
* `gender_label`
* `nfc_uid`
* `competitions`

Competition values can be split from a single field and normalized into `student_competition_entries`.

The portal also supports manual student registration entry for admin workflows.

---

## 14. NFC Check-In

The portal supports event-day NFC scanning for check-in and room-entry workflows.

Supported approaches include:

* external USB NFC readers that act like keyboards
* external Bluetooth NFC readers that act like keyboards
* manual UID entry
* optional Web NFC where supported

### Scan flow

The intended scan flow is:

1. Read or enter an NFC UID
2. Match it to a student or imported participant record
3. Check the selected room or competition block context
4. Insert a row into `nfc_scan_logs`
5. Mark the relevant assignment as `checked_in` when valid

The UI also accounts for outcomes such as:

* accepted scan
* wrong room
* unknown tag

For reliability, external readers should remain the preferred event-day setup.

---

## 15. Database Scope

### Core organizer and admin tables

* `profiles`
* `workbook_progress`
* `role_applications`
* `announcements`
* `deadline_events`
* `reminder_preferences`
* `reminder_deliveries`

### Tournament tables

* `tournament_rooms`
* `room_availability`
* `competition_blocks`
* `student_registrations`
* `student_competition_entries`
* `room_assignments`
* `nfc_scan_logs`

### MyMIST staging tables

* `mymist_import_batches`
* `mymist_participants`
* `mymist_schools`
* `mymist_judges`

---

## Setup

## 1. Run Supabase SQL

Run the SQL files in Supabase SQL Editor.

Recommended order:

1. base profile and organizer tables
2. deadline and reminder tables
3. tournament tables
4. MyMIST staging tables

Use the uploaded SQL setup files for the latest schema.

## 2. Make an Admin User

To promote a user to admin:

```sql
update public.profiles
set is_admin = true
where email = 'your-email@example.com';
```

## 3. Configure Edge Function Secrets

Set these secrets in Supabase before deploying functions:

```bash
supabase secrets set RESEND_API_KEY=your_resend_api_key
supabase secrets set REMINDER_FROM_EMAIL="MIST Dallas <reminders@yourdomain.com>"
supabase secrets set SITE_URL="https://your-site-url.com"
supabase secrets set CRON_SECRET=make-a-long-random-secret
```

Supabase automatically provides:

* `SUPABASE_URL`
* `SUPABASE_SERVICE_ROLE_KEY`

for deployed Edge Functions.

## 4. Deploy Edge Functions

```bash
supabase functions deploy send-deadline-reminders
supabase functions deploy send-application-decision
```

Guidance:

* keep JWT verification enabled for `send-application-decision`
* disable JWT verification for scheduler-based reminder delivery only if your scheduler cannot send a Supabase auth token
* always keep `CRON_SECRET` configured for scheduled reminder requests

---

## Scheduling Reminders

Run the reminder function daily.

Recommended cadence:

```text
Every day at 9:00 AM America/Chicago
```

Include this request header:

```text
x-cron-secret: your_CRON_SECRET_value
```

---

## CSV Templates

### Student Import

```csv
external_student_id,full_name,email,school,grade_level,gender_label,nfc_uid,competitions
S-1001,Sample Student,student@example.com,Sample School,11,Sister,TAG-1001,Quran|Poetry|Basketball
```

### Room Planning

```csv
id,room_name,building,floor_label,capacity,room_type,privacy_notes,av_notes,setup_notes,room_captain_role
room-101,Room 101,Venue TBD,Level 1,40,Competition Room,Standard room,Projector preferred,Classroom setup,Competitions Director
```

### Competition Block Planning

```csv
competition_name,round_label,division,room_id,block_date,starts_at,ends_at,capacity,judge_count,materials,status
Poetry,Round 1,High School,room-101,2027-01-24,10:00,11:00,30,3,"Timer, score sheets",scheduled
```

---

## Recommended Build Order

### Phase 1: Organizer foundation

* finish profile, role-claim, and workbook schema
* verify public browsing and private organizer flows
* launch role claiming and role application intake

### Phase 2: Communication systems

* finalize announcements
* complete deadline manager
* deploy reminders and application decision emails
* verify calendar export actions

### Phase 3: Leadership operations

* complete progress board and command center readiness views
* connect meeting hub, decision logging, and runbook workflows
* use knowledge and feedback sections as internal operating memory

### Phase 4: MyMIST staging

* import participant, school, judge, and badge snapshot data
* clean mappings for rooming and event operations

### Phase 5: Tournament planning

* build room inventory and availability
* create competition blocks
* validate schedule and room conflicts

### Phase 6: Registration and assignments

* import student registrations
* normalize competition entries
* generate and review room assignments

### Phase 7: Live event operations

* enable scanner workflows
* support external reader input and manual entry
* log scans
* update assignment status to checked in when valid

---

## Permissions and Privacy

Student registrations, applications, assignments, review notes, and scan history should not be public.

Recommended access model:

* public users can browse roles, team structure, and apply
* signed-in organizers can claim roles, save workbook progress, and use organizer tools appropriate to their account
* admins can manage deadlines, announcements, applications, MyMIST staging, tournament setup, and live operations
* sensitive registration and scan data remains admin-restricted by default

---

## Tech Notes

* Frontend: single-page portal UI in HTML/CSS/JavaScript
* Backend: Supabase
* Auth and permissions: Supabase Auth + role-based access
* Email delivery: Resend via Supabase Edge Functions
* Scheduling: Supabase scheduled functions or external scheduler
* Calendar export: ICS generation + Google Calendar links
* Check-in hardware: USB/Bluetooth NFC readers preferred

---

## Product Summary

**MIST Dallas Portal** is a unified organizer operating system for recruiting and assigning organizers, tracking role progress, managing deadlines and reminders, centralizing leadership communication, staging MyMIST operational data, organizing tournament rooms and competitions, and running live NFC-based check-in during event weekend.

It is designed to support both season-long planning and live execution from a single Supabase-backed system.

---

## Next Improvements

Potential future enhancements:

* direct bulk room import
* direct bulk competition block import
* stronger application analytics
* room captain dashboards
* judge packet exports
* attendance summaries
* school-specific roster exports
* organizer reporting views
* post-event analytics

---

## Status

This project already has the foundation for:

* public role browsing
* profile and role claiming
* structured role applications
* application status lookups
* workbook progress tracking
* deadline reminders
* application decision emails
* announcements
* calendar exports
* tournament schema and imports
* MyMIST staging
* NFC scan workflow planning
* organizer runbook and knowledge content

The next step is to keep consolidating these features into a polished organizer-facing and admin-facing system.
