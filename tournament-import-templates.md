# Tournament Import Templates

The portal can generate CSV templates from the Weekend Tournament Manager page. These are the expected columns.

## Student Import CSV

Use `|` between multiple competitions.

```csv
external_student_id,full_name,email,school,grade_level,gender_label,nfc_uid,competitions
S-1001,Sample Student,student@example.com,Sample School,11,Sister,TAG-1001,Quran|Poetry|Basketball
```

## Room CSV

The portal currently downloads this template for planning. Direct bulk room import can be added next.

```csv
id,room_name,building,floor_label,capacity,room_type,privacy_notes,av_notes,setup_notes,room_captain_role
room-101,Room 101,Venue TBD,Level 1,40,Competition Room,Standard room,Projector preferred,Classroom setup,Competitions Director
```

## Competition Block CSV

The portal currently downloads this template for planning. Direct bulk block import can be added next.

```csv
competition_name,round_label,division,room_id,block_date,starts_at,ends_at,capacity,judge_count,materials,status
Poetry,Round 1,High School,room-101,2027-01-24,10:00,11:00,30,3,"Timer, score sheets",scheduled
```

## NFC Reader Setup

Most event setups should use USB/Bluetooth NFC readers that act like keyboards:

1. Click into the NFC UID field.
2. Tap the student tag.
3. The reader types the tag value.
4. Choose room/block context.
5. Click `Log Scan`.

Web NFC is supported as a convenience only on some Android/Chrome setups. It should not be the only check-in plan.

## Operations Checks Now Included

The portal now flags:

- competition blocks with no room
- blocks outside saved room availability
- double-booked rooms
- block capacity exceeding room capacity
- assignments exceeding block capacity
- imported students with no room assignment
