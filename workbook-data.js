window.WORKBOOK_DATA = {
  phases: {
    foundations: { label: "Foundations", title: "Phase I - Foundations", dates: "September-October" },
    build: { label: "Build", title: "Phase II - Build", dates: "October-November" },
    stabilization: { label: "Stabilization", title: "Phase III - Stabilization", dates: "December" },
    execution: { label: "Execution", title: "Phase IV - Execution", dates: "January-Event" }
  },

  roleOptions: [
    { id: "rd", title: "Regional Director", team: "Executive" },
    { id: "internal-ad", title: "Internal Associate Director", team: "Executive" },
    { id: "external-ad", title: "External Associate Director", team: "Executive" },
    { id: "registration-dir", title: "Registration Director", team: "Registration" },
    { id: "sports-dir", title: "Sports Director", team: "Sports" },
    { id: "ops-dir-1", title: "Ops Director 1 - Command Center Lead", team: "Operations" },
    { id: "ops-dir-2", title: "Ops Director 2 - Communications Lead", team: "Operations" },
    { id: "comps-dir", title: "Competitions Director", team: "Competitions" },
    { id: "dt-dir", title: "Dream Team Director", team: "Dream Team" },
    { id: "pr-dir", title: "PR Director", team: "PR" },
    { id: "programs-dir", title: "Programs Director", team: "Programs" },
    { id: "finance-dir", title: "Finance Director", team: "Finance" },
    { id: "judges-chair", title: "Judges Chair", team: "Competitions" },
    { id: "graphics-chair", title: "Graphics Chair", team: "PR" },
    { id: "marketing-chair", title: "Marketing Chair", team: "PR" },
    { id: "awards-chair", title: "Awards & Ceremonies Chair", team: "Programs" },
    { id: "workshops-chair", title: "Workshops Chair", team: "Programs" },
    { id: "sponsorships-chair", title: "Sponsorships Chair", team: "Finance" },
    { id: "recruitment-lead", title: "Recruitment Lead", team: "Dream Team" },
    { id: "td-lead", title: "Training & Development Lead", team: "Dream Team" }
  ],

  workbooks: {
    rd: {
      title: "Regional Director Workbook",
      team: "Executive",
      description: "Lead the overall event strategy, cross-team alignment, and final accountability.",
      phases: {
        foundations: {
          focus: "Set the vision, establish structures, and confirm your leadership team.",
          checklist: [
            "Finalize the core team roster",
            "Set the planning calendar and major milestones",
            "Define communication and accountability norms",
            "Align initial venue and budget direction"
          ]
        },
        build: {
          focus: "Monitor every team, remove blockers, and maintain the master timeline.",
          checklist: [
            "Hold recurring director check-ins",
            "Track cross-team blockers and dependencies",
            "Review venue, registration, and sponsorship progress",
            "Keep the master calendar current"
          ]
        },
        stabilization: {
          focus: "Close gaps, lock decisions, and confirm every team is execution-ready.",
          checklist: [
            "Run a leadership gap analysis",
            "Finalize unresolved decisions",
            "Review the master schedule",
            "Prepare the weekend run-of-show draft"
          ]
        },
        execution: {
          focus: "Oversee final readiness, training, and escalation management.",
          checklist: [
            "Review all final team readiness updates",
            "Approve run-of-show and escalation plans",
            "Confirm event-week communications",
            "Be ready as final escalation point"
          ]
        }
      }
    },

    "registration-dir": {
      title: "Registration Director Workbook",
      team: "Registration",
      description: "Own MyMIST setup, registration flow, roster accuracy, and check-in data readiness.",
      phases: {
        foundations: {
          focus: "Build the registration system correctly from the start.",
          checklist: [
            "Set up MyMIST structure",
            "Define all registration fields and data standards",
            "Document registration deadlines",
            "Align registration outputs with competitions needs"
          ]
        },
        build: {
          focus: "Monitor registration intake and fix data issues early.",
          checklist: [
            "Open registration and monitor weekly numbers",
            "Run data audits",
            "Support schools with registration questions",
            "Share metrics with leadership"
          ]
        },
        stabilization: {
          focus: "Close registration and prepare final data packages.",
          checklist: [
            "Export final rosters",
            "Prepare check-in system and badges",
            "Deliver competition rosters",
            "Test day-of check-in process"
          ]
        },
        execution: {
          focus: "Run check-in and maintain live participant accuracy.",
          checklist: [
            "Set up check-in stations",
            "Resolve live registration issues",
            "Coordinate score and roster corrections",
            "Maintain participant data authority during event"
          ]
        }
      }
    },

    "sports-dir": {
      title: "Sports Director Workbook",
      team: "Sports",
      description: "Oversee venues, schedules, referees, and sports-day execution.",
      phases: {
        foundations: {
          focus: "Define sports offerings and begin venue strategy.",
          checklist: [
            "Confirm sports list and formats",
            "Start venue outreach",
            "Draft equipment needs",
            "Align sports calendar with master calendar"
          ]
        },
        build: {
          focus: "Secure venues and approve scheduling plans.",
          checklist: [
            "Lock venue contracts",
            "Approve brothers and sisters sports schedules",
            "Confirm referee recruitment progress",
            "Coordinate logistics with Ops"
          ]
        },
        stabilization: {
          focus: "Finalize referees, schedules, and run-of-show.",
          checklist: [
            "Lock all sports schedules",
            "Confirm referee assignments",
            "Review privacy and safety needs",
            "Test eSports setup if applicable"
          ]
        },
        execution: {
          focus: "Run sports competitions and manage disputes or delays.",
          checklist: [
            "Oversee live sports operations",
            "Report scores accurately",
            "Manage escalations from sports leads",
            "Close the day with sports debrief notes"
          ]
        }
      }
    },

    "ops-dir-1": {
      title: "Ops Director 1 Workbook",
      team: "Operations",
      description: "Lead Command Center planning, room logistics, escalation flow, and operational control.",
      phases: {
        foundations: {
          focus: "Map spaces, event flow, and escalation systems.",
          checklist: [
            "Draft event space inventory",
            "Define Command Center model",
            "Create escalation flow",
            "Begin logistics planning framework"
          ]
        },
        build: {
          focus: "Secure rooms and build the setup plan.",
          checklist: [
            "Allocate rooms to functions and teams",
            "Gather AV, signage, and setup needs",
            "Build master operations schedule",
            "Coordinate with venue contacts"
          ]
        },
        stabilization: {
          focus: "Lock room assignments and test workflows.",
          checklist: [
            "Finalize room setup sheets",
            "Run logistics simulation",
            "Confirm Command Center staffing",
            "Close workflow gaps"
          ]
        },
        execution: {
          focus: "Run the event from Command Center.",
          checklist: [
            "Staff Command Center",
            "Track and resolve escalations",
            "Monitor event flow in real time",
            "Document major issues and resolutions"
          ]
        }
      }
    },

    "ops-dir-2": {
      title: "Ops Director 2 Workbook",
      team: "Operations",
      description: "Lead communications systems, participant messaging, and real-time announcement flow.",
      phases: {
        foundations: {
          focus: "Set communication channels and expectations.",
          checklist: [
            "Define internal communications structure",
            "Set response time expectations",
            "Prepare comms templates",
            "Align with external messaging needs"
          ]
        },
        build: {
          focus: "Activate MyMIST and participant communication tools.",
          checklist: [
            "Set up participant email systems",
            "Test MyMIST announcements",
            "Train leads on communication flow",
            "Maintain communications calendar"
          ]
        },
        stabilization: {
          focus: "Test systems and lock event-week messaging.",
          checklist: [
            "Run end-to-end communications test",
            "Finalize event-week message schedule",
            "Brief teams on urgent comms protocol",
            "Prepare pre-event participant messaging"
          ]
        },
        execution: {
          focus: "Manage announcements and urgent communication during the event.",
          checklist: [
            "Send scheduled messages",
            "Handle live room-change or timing updates",
            "Coordinate with PR on public messaging",
            "Prevent conflicting information"
          ]
        }
      }
    },

    "comps-dir": {
      title: "Competitions Director Workbook",
      team: "Competitions",
      description: "Own competition structure, rules, judging systems, and zone readiness.",
      phases: {
        foundations: {
          focus: "Design the competition system and define zone structures.",
          checklist: [
            "Confirm competition list and formats",
            "Draft rules and scoring systems",
            "Map competition schedule framework",
            "Define zone lead expectations"
          ]
        },
        build: {
          focus: "Prepare zones, materials, and judging infrastructure.",
          checklist: [
            "Onboard zone leads",
            "Review judging materials",
            "Coordinate with registration data flow",
            "Support judge recruitment progress"
          ]
        },
        stabilization: {
          focus: "Confirm complete readiness across all competition zones.",
          checklist: [
            "Review all zone run-of-shows",
            "Approve brackets and assignments",
            "Confirm all judges trained",
            "Coordinate room and timing details with Ops"
          ]
        },
        execution: {
          focus: "Maintain competition integrity throughout event weekend.",
          checklist: [
            "Monitor live zones",
            "Resolve disputes consistently",
            "Coordinate scoring corrections",
            "Capture post-event issues for debrief"
          ]
        }
      }
    },

    default: {
      title: "Organizer Workbook",
      team: "General",
      description: "Role-specific content will expand from here.",
      phases: {
        foundations: {
          focus: "Clarify your role, expectations, and early planning tasks.",
          checklist: [
            "Review your role scope",
            "Meet with your direct supervisor",
            "Identify your top responsibilities",
            "Set your first planning priorities"
          ]
        },
        build: {
          focus: "Execute your area with consistency and accountability.",
          checklist: [
            "Track your deliverables weekly",
            "Coordinate dependencies with other teams",
            "Document blockers early",
            "Update leadership on your status"
          ]
        },
        stabilization: {
          focus: "Lock in details and remove remaining gaps.",
          checklist: [
            "Review unresolved items",
            "Finalize your prep materials",
            "Confirm event-day expectations",
            "Coordinate handoffs and support needs"
          ]
        },
        execution: {
          focus: "Show up ready, execute clearly, and escalate correctly.",
          checklist: [
            "Know your reporting line",
            "Arrive prepared and on time",
            "Follow your event-day plan",
            "Document issues and improvements"
          ]
        }
      }
    }
  }
};
