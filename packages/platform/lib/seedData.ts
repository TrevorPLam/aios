import {
  Recommendation,
  Note,
  Task,
  Project,
  CalendarEvent,
  EmailThread,
  ConfidenceLevel,
  TaskPriority,
  ModuleType,
  List,
  Alert,
  Photo,
  Message,
  Conversation,
  ConversationParticipant,
  Contact,
  Budget,
  BudgetCategory,
  BudgetLineItem,
  Integration,
  IntegrationCategory,
  IntegrationStatus,
  SyncFrequency,
} from "@aios/contracts/models/types";
import { generateId } from "@aios/platform/lib/helpers";

function hoursFromNow(hours: number): string {
  const date = new Date();
  date.setHours(date.getHours() + hours);
  return date.toISOString();
}

function daysFromNow(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString();
}

const RECOMMENDATION_TEMPLATES: {
  module: ModuleType;
  type: string;
  templates: {
    title: string;
    summary: string;
    why: string;
    confidence: ConfidenceLevel;
    priority: TaskPriority;
  }[];
}[] = [
  {
    module: "notebook",
    type: "note_suggestion",
    templates: [
      {
        title: "Document meeting notes",
        summary:
          "Create a structured summary of your recent team standup discussion",
        why: 'Based on calendar event "Team Standup" that occurred 2 hours ago. Documenting key decisions improves team alignment.',
        confidence: "high",
        priority: "medium",
      },
      {
        title: "Weekly reflection note",
        summary:
          "Write a brief reflection on this week's accomplishments and learnings",
        why: "Weekly reflections help track progress and identify patterns. It's been 7 days since your last reflection.",
        confidence: "medium",
        priority: "low",
      },
    ],
  },
  {
    module: "planner",
    type: "task_suggestion",
    templates: [
      {
        title: "Review project milestones",
        summary:
          "Check progress on Q1 goals and update status for stakeholders",
        why: 'Project "Q1 Planning" has tasks due this week. Regular reviews prevent scope creep.',
        confidence: "high",
        priority: "high",
      },
      {
        title: "Break down large task",
        summary:
          'Split "Complete API integration" into smaller, actionable subtasks',
        why: "Task has been pending for 5 days without progress. Breaking it down increases completion likelihood by 3x.",
        confidence: "medium",
        priority: "medium",
      },
      {
        title: "Set dependencies",
        summary:
          'Link "Deploy to staging" to prerequisite tasks for better workflow',
        why: "This task has implicit dependencies that should be explicit. Proper sequencing reduces blocking.",
        confidence: "low",
        priority: "low",
      },
    ],
  },
  {
    module: "calendar",
    type: "scheduling_suggestion",
    templates: [
      {
        title: "Block focus time",
        summary: "Schedule 2-hour deep work block tomorrow morning",
        why: "You have 3 tasks marked high priority but no dedicated focus time this week. Morning slots show highest productivity.",
        confidence: "high",
        priority: "medium",
      },
      {
        title: "Reschedule conflicting meeting",
        summary: "Move 1-on-1 to avoid overlap with team review",
        why: "Two events overlap on Thursday 2-3pm. The 1-on-1 is more flexible based on past rescheduling patterns.",
        confidence: "medium",
        priority: "high",
      },
    ],
  },
  {
    module: "email",
    type: "email_suggestion",
    templates: [
      {
        title: "Follow up on proposal",
        summary:
          "Send a brief check-in on the partnership proposal sent last week",
        why: 'Email to "Alex Chen" about "Partnership Proposal" has had no response in 6 days. Follow-ups increase response rate by 40%.',
        confidence: "high",
        priority: "medium",
      },
      {
        title: "Archive old threads",
        summary: "Move 12 resolved conversation threads to archive",
        why: "These threads have no activity in 30+ days and last messages indicate resolution.",
        confidence: "medium",
        priority: "low",
      },
    ],
  },
  {
    module: "command",
    type: "system_insight",
    templates: [
      {
        title: "Productivity insight",
        summary: "Your task completion rate increased 23% this week",
        why: "Comparing this week to your 4-week average. Key factor: shorter tasks created more frequently.",
        confidence: "high",
        priority: "low",
      },
    ],
  },
  {
    module: "alerts",
    type: "alert_suggestion",
    templates: [
      {
        title: "Set reminder for task deadline",
        summary:
          "Create a reminder 1 hour before 'Complete API integration' is due",
        why: "Task has high priority and due date in 3 days. Setting advance reminders increases on-time completion by 35%.",
        confidence: "high",
        priority: "medium",
      },
      {
        title: "Morning standup alert",
        summary: "Set daily reminder for team standup at 9:00 AM",
        why: "Calendar shows recurring 'Team Standup' event. Proactive reminders help with punctuality.",
        confidence: "high",
        priority: "medium",
      },
      {
        title: "Email follow-up reminder",
        summary: "Reminder to follow up on partnership proposal in 2 days",
        why: "Email thread 'Partnership Proposal' has no response in 6 days. Follow-up reminders improve response rates.",
        confidence: "medium",
        priority: "low",
      },
    ],
  },
];

export function generateSeedRecommendations(
  count: number = 8,
): Recommendation[] {
  const recommendations: Recommendation[] = [];
  let templateIndex = 0;

  for (let i = 0; i < count; i++) {
    const moduleGroup =
      RECOMMENDATION_TEMPLATES[templateIndex % RECOMMENDATION_TEMPLATES.length];
    const template = moduleGroup.templates[i % moduleGroup.templates.length];

    const expiryHours = 4 + Math.floor(Math.random() * 20);

    recommendations.push({
      id: generateId(),
      module: moduleGroup.module,
      title: template.title,
      summary: template.summary,
      type: moduleGroup.type,
      status: "active",
      createdAt: new Date().toISOString(),
      expiresAt: hoursFromNow(expiryHours),
      confidence: template.confidence,
      priority: template.priority,
      dedupeKey: `${moduleGroup.type}_${template.title.toLowerCase().replace(/\s/g, "_")}`,
      countsAgainstLimit: true,
      why: template.why,
      evidenceTimestamps: [new Date().toISOString()],
    });

    templateIndex++;
  }

  return recommendations;
}

export function generateSeedNotes(): Note[] {
  return [
    {
      id: generateId(),
      title: "Project Ideas",
      bodyMarkdown: `# Project Ideas\n\n## Mobile App\n- [ ] User authentication\n- [ ] Dashboard design\n- [ ] API integration\n\n## Notes\nConsider using #react-native for cross-platform support.\n\nRelated: [[Architecture Notes]]`,
      createdAt: daysFromNow(-7),
      updatedAt: daysFromNow(-1),
      tags: ["project", "ideas", "react-native"],
      links: ["Architecture Notes"],
    },
    {
      id: generateId(),
      title: "Meeting Notes - Team Sync",
      bodyMarkdown: `# Team Sync - ${new Date().toLocaleDateString()}\n\n## Attendees\n- Sarah\n- Mike\n- Jordan\n\n## Discussion\n- Sprint progress looking good\n- Need to prioritize #bug-fixes\n- Demo scheduled for Friday\n\n## Action Items\n- [ ] Update documentation\n- [ ] Review PR #234`,
      createdAt: daysFromNow(-2),
      updatedAt: daysFromNow(-2),
      tags: ["meeting", "team", "bug-fixes"],
      links: [],
    },
  ];
}

export function generateSeedTasks(): Task[] {
  return [
    {
      id: generateId(),
      title: "Complete API integration",
      userNotes:
        "Need to connect to the backend endpoints and handle authentication tokens.",
      aiNotes: [
        "Consider implementing retry logic for network failures",
        "Token refresh should happen automatically",
      ],
      priority: "high",
      dueDate: daysFromNow(3),
      status: "in_progress",
      recurrenceRule: "none",
      projectId: null,
      parentTaskId: null,
      dependencyIds: [],
      createdAt: daysFromNow(-5),
      updatedAt: daysFromNow(-1),
    },
    {
      id: generateId(),
      title: "Review design mockups",
      userNotes: "Check the new dashboard designs from the design team.",
      aiNotes: [],
      priority: "medium",
      dueDate: daysFromNow(1),
      status: "pending",
      recurrenceRule: "none",
      projectId: null,
      parentTaskId: null,
      dependencyIds: [],
      createdAt: daysFromNow(-2),
      updatedAt: daysFromNow(-2),
    },
    {
      id: generateId(),
      title: "Weekly standup",
      userNotes: "Prepare updates for the team.",
      aiNotes: [],
      priority: "medium",
      dueDate: null,
      status: "pending",
      recurrenceRule: "weekly",
      projectId: null,
      parentTaskId: null,
      dependencyIds: [],
      createdAt: daysFromNow(-14),
      updatedAt: daysFromNow(-7),
    },
  ];
}

export function generateSeedProjects(): Project[] {
  return [
    {
      id: generateId(),
      name: "Q1 Planning",
      description: "First quarter goals and milestones",
      taskIds: [],
      createdAt: daysFromNow(-30),
      updatedAt: daysFromNow(-5),
    },
    {
      id: generateId(),
      name: "Mobile App Launch",
      description: "Everything needed for the v1.0 release",
      taskIds: [],
      createdAt: daysFromNow(-20),
      updatedAt: daysFromNow(-3),
    },
  ];
}

export function generateSeedEvents(): CalendarEvent[] {
  const today = new Date();
  today.setHours(10, 0, 0, 0);

  return [
    {
      id: generateId(),
      title: "Team Standup",
      description: "Daily sync with the team",
      location: "Meeting Room A",
      meetingLink: "https://meet.google.com/abc-defg-hij",
      startAt: today.toISOString(),
      endAt: new Date(today.getTime() + 30 * 60000).toISOString(),
      allDay: false,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      recurrenceRule: "daily",
      exceptions: [],
      overrides: {},
      createdAt: daysFromNow(-30),
      updatedAt: daysFromNow(-30),
      source: "LOCAL",
    },
    {
      id: generateId(),
      title: "Project Review",
      description: "Review Q1 progress with stakeholders",
      location: "Conference Room",
      meetingLink: "",
      startAt: new Date(today.getTime() + 3 * 60 * 60000).toISOString(),
      endAt: new Date(today.getTime() + 4 * 60 * 60000).toISOString(),
      allDay: false,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      recurrenceRule: "none",
      exceptions: [],
      overrides: {},
      createdAt: daysFromNow(-7),
      updatedAt: daysFromNow(-7),
      source: "LOCAL",
    },
    {
      id: generateId(),
      title: "Focus Time",
      description: "Deep work block - no meetings",
      location: "",
      meetingLink: "",
      startAt: daysFromNow(1),
      endAt: new Date(
        new Date(daysFromNow(1)).getTime() + 2 * 60 * 60000,
      ).toISOString(),
      allDay: false,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      recurrenceRule: "none",
      exceptions: [],
      overrides: {},
      createdAt: daysFromNow(-1),
      updatedAt: daysFromNow(-1),
      source: "LOCAL",
    },
  ];
}

export const MOCK_EMAIL_THREADS: EmailThread[] = [
  {
    id: "thread_1",
    subject: "Partnership Proposal - Q1 Collaboration",
    participants: ["Alex Chen", "You"],
    isRead: false,
    isStarred: true,
    lastMessageAt: daysFromNow(-1),
    messages: [
      {
        id: "msg_1",
        threadId: "thread_1",
        from: "You",
        to: ["alex.chen@company.com"],
        subject: "Partnership Proposal - Q1 Collaboration",
        body: "Hi Alex,\n\nI wanted to reach out about a potential partnership opportunity. Our teams have complementary strengths and I believe we could create something great together.\n\nWould you be open to a call next week to discuss?\n\nBest,\nYou",
        sentAt: daysFromNow(-6),
        isRead: true,
      },
      {
        id: "msg_2",
        threadId: "thread_1",
        from: "Alex Chen",
        to: ["you@company.com"],
        subject: "Re: Partnership Proposal - Q1 Collaboration",
        body: "Hi,\n\nThanks for reaching out! This sounds interesting. I'm looking at my calendar and have some availability next Tuesday or Wednesday afternoon.\n\nLet me know what works for you.\n\nAlex",
        sentAt: daysFromNow(-1),
        isRead: false,
      },
    ],
  },
  {
    id: "thread_2",
    subject: "Weekly Report - Team Performance",
    participants: ["Jordan Smith", "You", "Team"],
    isRead: true,
    isStarred: false,
    lastMessageAt: daysFromNow(-2),
    messages: [
      {
        id: "msg_3",
        threadId: "thread_2",
        from: "Jordan Smith",
        to: ["team@company.com"],
        subject: "Weekly Report - Team Performance",
        body: "Team,\n\nHere's our weekly performance summary:\n\n- Tasks completed: 47\n- Sprint progress: 78%\n- Blockers resolved: 3\n\nGreat work everyone!\n\nJordan",
        sentAt: daysFromNow(-2),
        isRead: true,
      },
    ],
  },
  {
    id: "thread_3",
    subject: "Design Review Feedback",
    participants: ["Sarah Lee", "You"],
    isRead: true,
    isStarred: false,
    lastMessageAt: daysFromNow(-3),
    messages: [
      {
        id: "msg_4",
        threadId: "thread_3",
        from: "Sarah Lee",
        to: ["you@company.com"],
        subject: "Design Review Feedback",
        body: "Hey,\n\nI reviewed the latest mockups and have some feedback:\n\n1. The navigation feels intuitive\n2. Consider adding more contrast to the CTAs\n3. The loading states look great\n\nOverall really solid work!\n\nSarah",
        sentAt: daysFromNow(-3),
        isRead: true,
      },
    ],
  },
  {
    id: "thread_4",
    subject: "Upcoming Team Offsite",
    participants: ["Mike Johnson", "Team"],
    isRead: false,
    isStarred: false,
    lastMessageAt: daysFromNow(0),
    messages: [
      {
        id: "msg_5",
        threadId: "thread_4",
        from: "Mike Johnson",
        to: ["team@company.com"],
        subject: "Upcoming Team Offsite",
        body: "Hi everyone,\n\nExciting news - we're planning a team offsite for next month!\n\nDetails:\n- Date: TBD (voting link below)\n- Location: Mountain retreat\n- Duration: 2 days\n\nPlease fill out the survey by end of week.\n\nMike",
        sentAt: daysFromNow(0),
        isRead: false,
      },
    ],
  },
];

export function generateSeedLists(): List[] {
  return [
    {
      id: generateId(),
      title: "Groceries",
      category: "grocery",
      color: "#00FF94",
      items: [
        {
          id: generateId(),
          text: "Milk",
          isChecked: true,
          priority: "medium",
        },
        {
          id: generateId(),
          text: "Eggs",
          isChecked: false,
          priority: "high",
        },
        {
          id: generateId(),
          text: "Bread",
          isChecked: false,
          priority: "low",
        },
        {
          id: generateId(),
          text: "Chicken",
          isChecked: true,
          priority: "medium",
        },
        {
          id: generateId(),
          text: "Vegetables",
          isChecked: false,
          priority: "medium",
          notes: "Carrots, broccoli, and bell peppers",
        },
      ],
      createdAt: daysFromNow(-5),
      lastOpenedAt: hoursFromNow(-2),
      updatedAt: hoursFromNow(-2),
    },
    {
      id: generateId(),
      title: "Project Launch Checklist",
      category: "work",
      color: "#00D9FF",
      items: [
        {
          id: generateId(),
          text: "Review requirements",
          isChecked: true,
          priority: "high",
        },
        {
          id: generateId(),
          text: "Design mockups",
          isChecked: true,
          priority: "high",
        },
        {
          id: generateId(),
          text: "Develop features",
          isChecked: true,
          priority: "high",
        },
        {
          id: generateId(),
          text: "Write tests",
          isChecked: false,
          priority: "high",
          dueDate: daysFromNow(2),
        },
        {
          id: generateId(),
          text: "Deploy to staging",
          isChecked: false,
          priority: "medium",
          dueDate: daysFromNow(3),
        },
        {
          id: generateId(),
          text: "QA testing",
          isChecked: false,
          priority: "high",
          dueDate: daysFromNow(4),
        },
        {
          id: generateId(),
          text: "Production deploy",
          isChecked: false,
          priority: "high",
          dueDate: daysFromNow(7),
          notes: "Schedule for Friday afternoon",
        },
      ],
      createdAt: daysFromNow(-10),
      lastOpenedAt: hoursFromNow(-5),
      updatedAt: hoursFromNow(-5),
    },
    {
      id: generateId(),
      title: "Books to Read",
      category: "personal",
      color: "#FFB800",
      items: [
        {
          id: generateId(),
          text: "Atomic Habits",
          isChecked: true,
          priority: "none",
        },
        {
          id: generateId(),
          text: "Deep Work",
          isChecked: false,
          priority: "medium",
        },
        {
          id: generateId(),
          text: "Thinking, Fast and Slow",
          isChecked: false,
          priority: "low",
        },
      ],
      createdAt: daysFromNow(-3),
      lastOpenedAt: hoursFromNow(-24),
      updatedAt: hoursFromNow(-24),
    },
    // List Templates
    {
      id: generateId(),
      title: "Weekly Grocery Shopping",
      category: "grocery",
      color: "#00FF94",
      isTemplate: true,
      items: [
        {
          id: generateId(),
          text: "Fresh fruits",
          isChecked: false,
          priority: "medium",
        },
        {
          id: generateId(),
          text: "Vegetables",
          isChecked: false,
          priority: "medium",
        },
        {
          id: generateId(),
          text: "Dairy products",
          isChecked: false,
          priority: "medium",
        },
        {
          id: generateId(),
          text: "Meat/Protein",
          isChecked: false,
          priority: "medium",
        },
        {
          id: generateId(),
          text: "Bread & Grains",
          isChecked: false,
          priority: "low",
        },
        {
          id: generateId(),
          text: "Snacks",
          isChecked: false,
          priority: "none",
        },
        {
          id: generateId(),
          text: "Beverages",
          isChecked: false,
          priority: "low",
        },
        {
          id: generateId(),
          text: "Household items",
          isChecked: false,
          priority: "low",
        },
      ],
      createdAt: daysFromNow(-30),
      lastOpenedAt: daysFromNow(-30),
      updatedAt: daysFromNow(-30),
    },
    {
      id: generateId(),
      title: "Travel Packing Essentials",
      category: "travel",
      color: "#FF3B5C",
      isTemplate: true,
      items: [
        {
          id: generateId(),
          text: "Passport & ID",
          isChecked: false,
          priority: "high",
        },
        {
          id: generateId(),
          text: "Tickets/Boarding passes",
          isChecked: false,
          priority: "high",
        },
        {
          id: generateId(),
          text: "Phone charger",
          isChecked: false,
          priority: "high",
        },
        {
          id: generateId(),
          text: "Medications",
          isChecked: false,
          priority: "high",
        },
        {
          id: generateId(),
          text: "Clothes (3-5 days)",
          isChecked: false,
          priority: "medium",
        },
        {
          id: generateId(),
          text: "Toiletries",
          isChecked: false,
          priority: "medium",
        },
        {
          id: generateId(),
          text: "Shoes",
          isChecked: false,
          priority: "medium",
        },
        {
          id: generateId(),
          text: "Wallet & cash",
          isChecked: false,
          priority: "high",
        },
        {
          id: generateId(),
          text: "Sunglasses",
          isChecked: false,
          priority: "low",
        },
        {
          id: generateId(),
          text: "Book/Entertainment",
          isChecked: false,
          priority: "none",
        },
      ],
      createdAt: daysFromNow(-30),
      lastOpenedAt: daysFromNow(-30),
      updatedAt: daysFromNow(-30),
    },
    {
      id: generateId(),
      title: "Home Cleaning Routine",
      category: "home",
      color: "#9D4EDD",
      isTemplate: true,
      items: [
        {
          id: generateId(),
          text: "Vacuum all rooms",
          isChecked: false,
          priority: "medium",
        },
        {
          id: generateId(),
          text: "Mop kitchen & bathroom",
          isChecked: false,
          priority: "medium",
        },
        {
          id: generateId(),
          text: "Clean bathroom",
          isChecked: false,
          priority: "high",
        },
        {
          id: generateId(),
          text: "Dust furniture",
          isChecked: false,
          priority: "low",
        },
        {
          id: generateId(),
          text: "Change bed sheets",
          isChecked: false,
          priority: "medium",
        },
        {
          id: generateId(),
          text: "Take out trash",
          isChecked: false,
          priority: "high",
        },
        {
          id: generateId(),
          text: "Wipe kitchen counters",
          isChecked: false,
          priority: "medium",
        },
        {
          id: generateId(),
          text: "Clean mirrors",
          isChecked: false,
          priority: "low",
        },
      ],
      createdAt: daysFromNow(-30),
      lastOpenedAt: daysFromNow(-30),
      updatedAt: daysFromNow(-30),
    },
  ];
}

export function generateSeedAlerts(): Alert[] {
  const tomorrow8am = new Date();
  tomorrow8am.setDate(tomorrow8am.getDate() + 1);
  tomorrow8am.setHours(8, 0, 0, 0);

  const today5pm = new Date();
  today5pm.setHours(17, 0, 0, 0);

  const today9am = new Date();
  today9am.setHours(9, 0, 0, 0);

  return [
    {
      id: generateId(),
      title: "Wake up",
      description: "Time to start the day!",
      time: tomorrow8am.toISOString(),
      type: "alarm",
      isEnabled: true,
      recurrenceRule: "daily",
      sound: "gentle",
      vibration: "pulse",
      gradualVolume: true,
      snoozeDuration: 10,
      tags: ["morning", "routine"],
      createdAt: daysFromNow(-7),
      updatedAt: daysFromNow(-7),
    },
    {
      id: generateId(),
      title: "Team standup",
      description: "Daily sync with the team",
      time: today9am.toISOString(),
      type: "reminder",
      isEnabled: true,
      recurrenceRule: "daily",
      sound: "default",
      vibration: "default",
      gradualVolume: false,
      snoozeDuration: 5,
      tags: ["work", "meetings"],
      createdAt: daysFromNow(-5),
      updatedAt: daysFromNow(-5),
    },
    {
      id: generateId(),
      title: "End of work day",
      description: "Time to wrap up and review tasks",
      time: today5pm.toISOString(),
      type: "reminder",
      isEnabled: true,
      recurrenceRule: "daily",
      sound: "chimes",
      vibration: "default",
      gradualVolume: false,
      snoozeDuration: 15,
      tags: ["work"],
      createdAt: daysFromNow(-3),
      updatedAt: daysFromNow(-3),
    },
  ];
}

export function generateSeedPhotos(): Photo[] {
  // Note: In a real app, these would be actual image files.
  // For seed data, we'll use placeholder data that represents photos
  // The app will handle real photos when users upload them.
  return [
    {
      id: generateId(),
      uri: "https://picsum.photos/800/600?random=1",
      localPath: "placeholder",
      width: 800,
      height: 600,
      fileName: "sample_photo_1.jpg",
      fileSize: 245000,
      mimeType: "image/jpeg",
      createdAt: daysFromNow(-7),
      updatedAt: daysFromNow(-7),
      isBackedUp: false,
      tags: ["landscape", "nature"],
    },
    {
      id: generateId(),
      uri: "https://picsum.photos/600/800?random=2",
      localPath: "placeholder",
      width: 600,
      height: 800,
      fileName: "sample_photo_2.jpg",
      fileSize: 189000,
      mimeType: "image/jpeg",
      createdAt: daysFromNow(-5),
      updatedAt: daysFromNow(-5),
      isBackedUp: true,
      tags: ["portrait"],
    },
    {
      id: generateId(),
      uri: "https://picsum.photos/800/800?random=3",
      localPath: "placeholder",
      width: 800,
      height: 800,
      fileName: "sample_photo_3.jpg",
      fileSize: 312000,
      mimeType: "image/jpeg",
      createdAt: daysFromNow(-3),
      updatedAt: daysFromNow(-3),
      isBackedUp: false,
      tags: ["architecture"],
    },
    {
      id: generateId(),
      uri: "https://picsum.photos/1200/800?random=4",
      localPath: "placeholder",
      width: 1200,
      height: 800,
      fileName: "sample_photo_4.jpg",
      fileSize: 456000,
      mimeType: "image/jpeg",
      createdAt: daysFromNow(-2),
      updatedAt: daysFromNow(-2),
      isBackedUp: true,
      tags: ["landscape", "sunset"],
    },
    {
      id: generateId(),
      uri: "https://picsum.photos/800/1200?random=5",
      localPath: "placeholder",
      width: 800,
      height: 1200,
      fileName: "sample_photo_5.jpg",
      fileSize: 378000,
      mimeType: "image/jpeg",
      createdAt: daysFromNow(-1),
      updatedAt: daysFromNow(-1),
      isBackedUp: false,
      tags: ["urban", "street"],
    },
  ];
}

export function generateSeedConversations(): Conversation[] {
  const currentUserId = "current_user";

  const participants: Record<string, ConversationParticipant[]> = {
    sarah: [
      {
        userId: currentUserId,
        userName: "You",
        isOnline: true,
        lastSeenAt: new Date().toISOString(),
        joinedAt: daysFromNow(-30),
      },
      {
        userId: "user_sarah",
        userName: "Sarah Chen",
        avatarUrl: undefined,
        isOnline: true,
        lastSeenAt: hoursFromNow(-0.5),
        joinedAt: daysFromNow(-30),
      },
    ],
    alex: [
      {
        userId: currentUserId,
        userName: "You",
        isOnline: true,
        lastSeenAt: new Date().toISOString(),
        joinedAt: daysFromNow(-60),
      },
      {
        userId: "user_alex",
        userName: "Alex Johnson",
        avatarUrl: undefined,
        isOnline: false,
        lastSeenAt: hoursFromNow(-4),
        joinedAt: daysFromNow(-60),
      },
    ],
    team: [
      {
        userId: currentUserId,
        userName: "You",
        isOnline: true,
        lastSeenAt: new Date().toISOString(),
        joinedAt: daysFromNow(-20),
      },
      {
        userId: "user_sarah",
        userName: "Sarah Chen",
        isOnline: true,
        lastSeenAt: hoursFromNow(-0.5),
        joinedAt: daysFromNow(-20),
      },
      {
        userId: "user_alex",
        userName: "Alex Johnson",
        isOnline: false,
        lastSeenAt: hoursFromNow(-4),
        joinedAt: daysFromNow(-20),
      },
      {
        userId: "user_marcus",
        userName: "Marcus Williams",
        isOnline: true,
        lastSeenAt: hoursFromNow(-1),
        joinedAt: daysFromNow(-20),
      },
    ],
  };

  return [
    {
      id: "conv_sarah",
      type: "direct",
      name: "Sarah Chen",
      participants: participants.sarah,
      lastMessageId: "msg_sarah_3",
      lastMessageAt: hoursFromNow(-0.5),
      lastMessagePreview: "Sounds great! See you then 👍",
      unreadCount: 1,
      isTyping: [],
      isPinned: true,
      isMuted: false,
      isArchived: false,
      archivedAt: null,
      createdAt: daysFromNow(-30),
      updatedAt: hoursFromNow(-0.5),
    },
    {
      id: "conv_alex",
      type: "direct",
      name: "Alex Johnson",
      participants: participants.alex,
      lastMessageId: "msg_alex_2",
      lastMessageAt: hoursFromNow(-4),
      lastMessagePreview: "Thanks for sending that over!",
      unreadCount: 0,
      isTyping: [],
      isPinned: false,
      isMuted: false,
      isArchived: false,
      archivedAt: null,
      createdAt: daysFromNow(-60),
      updatedAt: hoursFromNow(-4),
    },
    {
      id: "conv_team",
      type: "group",
      name: "Project Team",
      participants: participants.team,
      lastMessageId: "msg_team_3",
      lastMessageAt: hoursFromNow(-2),
      lastMessagePreview: "Marcus: Great progress today everyone!",
      unreadCount: 2,
      isTyping: [],
      isPinned: false,
      isMuted: false,
      isArchived: false,
      archivedAt: null,
      createdAt: daysFromNow(-20),
      updatedAt: hoursFromNow(-2),
    },
    {
      id: "conv_old",
      type: "direct",
      name: "Taylor Smith",
      participants: [
        {
          userId: currentUserId,
          userName: "You",
          isOnline: true,
          lastSeenAt: new Date().toISOString(),
          joinedAt: daysFromNow(-90),
        },
        {
          userId: "user_taylor",
          userName: "Taylor Smith",
          isOnline: false,
          lastSeenAt: daysFromNow(-20),
          joinedAt: daysFromNow(-90),
        },
      ],
      lastMessageId: "msg_old_1",
      lastMessageAt: daysFromNow(-16),
      lastMessagePreview: "Let's catch up soon!",
      unreadCount: 0,
      isTyping: [],
      isPinned: false,
      isMuted: false,
      isArchived: false,
      archivedAt: null,
      createdAt: daysFromNow(-90),
      updatedAt: daysFromNow(-16),
    },
  ];
}

export function generateSeedContacts(): Contact[] {
  const now = new Date().toISOString();
  const twoWeeksAgo = new Date(
    Date.now() - 14 * 24 * 60 * 60 * 1000,
  ).toISOString();
  const lastWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  return [
    {
      id: "user_sarah",
      name: "Sarah Chen",
      firstName: "Sarah",
      lastName: "Chen",
      phoneNumbers: ["+1 (415) 555-0134"],
      emails: ["sarah.chen@example.com"],
      birthday: "1992-03-14",
      company: "Nimbus Labs",
      jobTitle: "Product Lead",
      imageUri: undefined,
      isRegistered: true,
      createdAt: now,
      updatedAt: now,
      isFavorite: true,
      groups: ["Work", "Friends"],
      tags: ["colleague", "product"],
      notes: [
        {
          id: generateId(),
          text: "Great collaborator on the mobile redesign project. Has excellent UX insights.",
          createdAt: twoWeeksAgo,
          updatedAt: twoWeeksAgo,
        },
        {
          id: generateId(),
          text: "Mentioned she's interested in trying the new AI features we're building.",
          createdAt: lastWeek,
          updatedAt: lastWeek,
        },
      ],
      lastContactedAt: yesterday,
      contactFrequency: 15,
    },
    {
      id: "user_alex",
      name: "Alex Johnson",
      firstName: "Alex",
      lastName: "Johnson",
      phoneNumbers: ["+1 (212) 555-0198"],
      emails: ["alex.johnson@example.com"],
      birthday: "1989-11-02",
      company: "Northwind Co.",
      jobTitle: "Engineering Manager",
      imageUri: undefined,
      isRegistered: true,
      createdAt: now,
      updatedAt: now,
      isFavorite: true,
      groups: ["Work"],
      tags: ["engineering", "mentor"],
      notes: [
        {
          id: generateId(),
          text: "Helped me debug the React Native navigation issues. Very knowledgeable about mobile architecture.",
          createdAt: lastWeek,
          updatedAt: lastWeek,
        },
      ],
      lastContactedAt: lastWeek,
      contactFrequency: 8,
    },
    {
      id: "user_marcus",
      name: "Marcus Williams",
      firstName: "Marcus",
      lastName: "Williams",
      phoneNumbers: ["+1 (312) 555-0167"],
      emails: ["marcus.williams@example.com"],
      birthday: "1990-07-21",
      company: "Atlas Studio",
      jobTitle: "UX Designer",
      imageUri: undefined,
      isRegistered: true,
      createdAt: now,
      updatedAt: now,
      isFavorite: false,
      groups: ["Work"],
      tags: ["design", "ux"],
      notes: [],
      lastContactedAt: twoWeeksAgo,
      contactFrequency: 5,
    },
    {
      id: "user_taylor",
      name: "Taylor Smith",
      firstName: "Taylor",
      lastName: "Smith",
      phoneNumbers: ["+1 (646) 555-0112"],
      emails: ["taylor.smith@example.com"],
      birthday: (() => {
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + 7);
        return futureDate.toISOString().split("T")[0];
      })(), // Birthday in 7 days
      company: "Redwood Analytics",
      jobTitle: "Customer Success",
      imageUri: undefined,
      isRegistered: false,
      createdAt: now,
      updatedAt: now,
      isFavorite: false,
      groups: ["Friends"],
      tags: ["networking"],
      notes: [
        {
          id: generateId(),
          text: "Met at the tech conference last month. Interested in customer success strategies.",
          createdAt: twoWeeksAgo,
          updatedAt: twoWeeksAgo,
        },
      ],
      contactFrequency: 2,
    },
  ];
}

export function generateSeedMessages(): Message[] {
  const currentUserId = "current_user";

  return [
    // Messages with Sarah
    {
      id: "msg_sarah_1",
      conversationId: "conv_sarah",
      senderId: currentUserId,
      senderName: "You",
      content: "Hey Sarah! Are you free for a quick call this afternoon?",
      type: "text",
      attachments: [],
      replyToId: null,
      isEdited: false,
      isRead: true,
      deliveredAt: hoursFromNow(-2),
      readAt: hoursFromNow(-1.5),
      createdAt: hoursFromNow(-2),
      updatedAt: hoursFromNow(-2),
    },
    {
      id: "msg_sarah_2",
      conversationId: "conv_sarah",
      senderId: "user_sarah",
      senderName: "Sarah Chen",
      content: "Sure! I'm available after 3pm. What's it about?",
      type: "text",
      attachments: [],
      replyToId: "msg_sarah_1",
      isEdited: false,
      isRead: true,
      deliveredAt: hoursFromNow(-1),
      readAt: hoursFromNow(-0.8),
      createdAt: hoursFromNow(-1),
      updatedAt: hoursFromNow(-1),
    },
    {
      id: "msg_sarah_3",
      conversationId: "conv_sarah",
      senderId: "user_sarah",
      senderName: "Sarah Chen",
      content: "Sounds great! See you then 👍",
      type: "text",
      attachments: [],
      replyToId: null,
      isEdited: false,
      isRead: false,
      deliveredAt: hoursFromNow(-0.5),
      readAt: null,
      createdAt: hoursFromNow(-0.5),
      updatedAt: hoursFromNow(-0.5),
    },
    // Messages with Alex
    {
      id: "msg_alex_1",
      conversationId: "conv_alex",
      senderId: currentUserId,
      senderName: "You",
      content: "Here are the project files you requested",
      type: "text",
      attachments: [
        {
          id: "att_1",
          type: "file",
          url: "file://project_specs.pdf",
          fileName: "project_specs.pdf",
          fileSize: 2048576,
          mimeType: "application/pdf",
        },
      ],
      replyToId: null,
      isEdited: false,
      isRead: true,
      deliveredAt: hoursFromNow(-5),
      readAt: hoursFromNow(-4.5),
      createdAt: hoursFromNow(-5),
      updatedAt: hoursFromNow(-5),
    },
    {
      id: "msg_alex_2",
      conversationId: "conv_alex",
      senderId: "user_alex",
      senderName: "Alex Johnson",
      content: "Thanks for sending that over!",
      type: "text",
      attachments: [],
      replyToId: "msg_alex_1",
      isEdited: false,
      isRead: true,
      deliveredAt: hoursFromNow(-4),
      readAt: hoursFromNow(-3.5),
      createdAt: hoursFromNow(-4),
      updatedAt: hoursFromNow(-4),
    },
    // Messages in team group
    {
      id: "msg_team_1",
      conversationId: "conv_team",
      senderId: "user_sarah",
      senderName: "Sarah Chen",
      content: "Quick update: Just finished the design mockups!",
      type: "text",
      attachments: [],
      replyToId: null,
      isEdited: false,
      isRead: true,
      deliveredAt: hoursFromNow(-3),
      readAt: hoursFromNow(-2.5),
      createdAt: hoursFromNow(-3),
      updatedAt: hoursFromNow(-3),
    },
    {
      id: "msg_team_2",
      conversationId: "conv_team",
      senderId: currentUserId,
      senderName: "You",
      content: "Awesome! Can't wait to see them",
      type: "text",
      attachments: [],
      replyToId: "msg_team_1",
      isEdited: false,
      isRead: true,
      deliveredAt: hoursFromNow(-2.5),
      readAt: hoursFromNow(-2.2),
      createdAt: hoursFromNow(-2.5),
      updatedAt: hoursFromNow(-2.5),
    },
    {
      id: "msg_team_3",
      conversationId: "conv_team",
      senderId: "user_marcus",
      senderName: "Marcus Williams",
      content: "Great progress today everyone!",
      type: "text",
      attachments: [],
      replyToId: null,
      isEdited: false,
      isRead: false,
      deliveredAt: hoursFromNow(-2),
      readAt: null,
      createdAt: hoursFromNow(-2),
      updatedAt: hoursFromNow(-2),
    },
    // Old conversation with Taylor
    {
      id: "msg_old_1",
      conversationId: "conv_old",
      senderId: "user_taylor",
      senderName: "Taylor Smith",
      content: "Let's catch up soon!",
      type: "text",
      attachments: [],
      replyToId: null,
      isEdited: false,
      isRead: true,
      deliveredAt: daysFromNow(-16),
      readAt: daysFromNow(-15),
      createdAt: daysFromNow(-16),
      updatedAt: daysFromNow(-16),
    },
  ];
}

export function generateSeedBudget(): Budget {
  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  const categories: BudgetCategory[] = [
    {
      id: generateId(),
      name: "Income",
      isExpanded: true,
      lineItems: [
        { id: generateId(), name: "Salary", budgeted: 5000, actual: 5000 },
        { id: generateId(), name: "Side Hustle", budgeted: 500, actual: 350 },
        { id: generateId(), name: "Investments", budgeted: 200, actual: 180 },
      ],
    },
    {
      id: generateId(),
      name: "Housing",
      isExpanded: true,
      lineItems: [
        {
          id: generateId(),
          name: "Rent/Mortgage",
          budgeted: 1500,
          actual: 1500,
        },
        {
          id: generateId(),
          name: "Property Insurance",
          budgeted: 100,
          actual: 100,
        },
        { id: generateId(), name: "HOA Fees", budgeted: 50, actual: 50 },
        { id: generateId(), name: "Maintenance", budgeted: 100, actual: 75 },
      ],
    },
    {
      id: generateId(),
      name: "Transportation",
      isExpanded: false,
      lineItems: [
        { id: generateId(), name: "Car Payment", budgeted: 400, actual: 400 },
        { id: generateId(), name: "Gas", budgeted: 150, actual: 165 },
        {
          id: generateId(),
          name: "Auto Insurance",
          budgeted: 120,
          actual: 120,
        },
        {
          id: generateId(),
          name: "Maintenance & Repairs",
          budgeted: 50,
          actual: 0,
        },
        { id: generateId(), name: "Public Transit", budgeted: 50, actual: 40 },
      ],
    },
    {
      id: generateId(),
      name: "Food",
      isExpanded: false,
      lineItems: [
        { id: generateId(), name: "Groceries", budgeted: 400, actual: 420 },
        { id: generateId(), name: "Dining Out", budgeted: 200, actual: 250 },
        { id: generateId(), name: "Coffee Shops", budgeted: 50, actual: 60 },
      ],
    },
    {
      id: generateId(),
      name: "Utilities",
      isExpanded: false,
      lineItems: [
        { id: generateId(), name: "Electricity", budgeted: 100, actual: 95 },
        { id: generateId(), name: "Water", budgeted: 40, actual: 42 },
        { id: generateId(), name: "Internet", budgeted: 60, actual: 60 },
        { id: generateId(), name: "Phone", budgeted: 80, actual: 80 },
        {
          id: generateId(),
          name: "Streaming Services",
          budgeted: 40,
          actual: 40,
        },
      ],
    },
    {
      id: generateId(),
      name: "Healthcare",
      isExpanded: false,
      lineItems: [
        {
          id: generateId(),
          name: "Health Insurance",
          budgeted: 300,
          actual: 300,
        },
        { id: generateId(), name: "Prescriptions", budgeted: 50, actual: 45 },
        { id: generateId(), name: "Dental", budgeted: 30, actual: 0 },
        { id: generateId(), name: "Vision", budgeted: 20, actual: 0 },
      ],
    },
    {
      id: generateId(),
      name: "Savings & Investments",
      isExpanded: false,
      lineItems: [
        {
          id: generateId(),
          name: "Emergency Fund",
          budgeted: 500,
          actual: 500,
        },
        {
          id: generateId(),
          name: "Retirement (401k)",
          budgeted: 400,
          actual: 400,
        },
        {
          id: generateId(),
          name: "Investment Account",
          budgeted: 200,
          actual: 200,
        },
      ],
    },
    {
      id: generateId(),
      name: "Personal",
      isExpanded: false,
      lineItems: [
        { id: generateId(), name: "Clothing", budgeted: 100, actual: 85 },
        { id: generateId(), name: "Gym Membership", budgeted: 50, actual: 50 },
        { id: generateId(), name: "Entertainment", budgeted: 100, actual: 120 },
        { id: generateId(), name: "Hobbies", budgeted: 75, actual: 90 },
      ],
    },
    {
      id: generateId(),
      name: "Debt Payments",
      isExpanded: false,
      lineItems: [
        { id: generateId(), name: "Credit Card", budgeted: 200, actual: 200 },
        { id: generateId(), name: "Student Loans", budgeted: 250, actual: 250 },
        { id: generateId(), name: "Personal Loan", budgeted: 100, actual: 100 },
      ],
    },
    {
      id: generateId(),
      name: "Miscellaneous",
      isExpanded: false,
      lineItems: [
        { id: generateId(), name: "Gifts", budgeted: 50, actual: 75 },
        { id: generateId(), name: "Pet Care", budgeted: 80, actual: 70 },
        { id: generateId(), name: "Subscriptions", budgeted: 30, actual: 30 },
        { id: generateId(), name: "Other", budgeted: 50, actual: 25 },
      ],
    },
  ];

  return {
    id: generateId(),
    name: `Budget - ${currentMonth}`,
    month: currentMonth,
    categories,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  };
}

/**
 * Generate sample integrations for initial data
 */
export function generateSampleIntegrations(): Integration[] {
  const now = new Date();

  return [
    {
      id: generateId(),
      name: "Google Calendar",
      serviceName: "Google",
      category: "calendar" as IntegrationCategory,
      description: "Sync your calendar events with Google Calendar",
      iconName: "calendar",
      status: "connected" as IntegrationStatus,
      isEnabled: true,
      lastSyncAt: hoursFromNow(-2),
      connectedAt: daysFromNow(-30),
      config: {
        syncFrequency: "hourly" as SyncFrequency,
        syncEnabled: true,
        notificationsEnabled: true,
        twoWaySync: true,
        syncedDataTypes: ["events", "reminders"],
      },
      stats: {
        totalSyncs: 720,
        dataItemsSynced: 2340,
        lastSyncDurationMs: 1250,
        errorCount: 3,
      },
      createdAt: daysFromNow(-30),
      updatedAt: hoursFromNow(-2),
      metadata: {
        accountEmail: "user@gmail.com",
        calendarCount: 3,
      },
    },
    {
      id: generateId(),
      name: "Gmail",
      serviceName: "Google",
      category: "email" as IntegrationCategory,
      description: "Access and manage your Gmail inbox",
      iconName: "mail",
      status: "connected" as IntegrationStatus,
      isEnabled: true,
      lastSyncAt: hoursFromNow(-1),
      connectedAt: daysFromNow(-25),
      config: {
        syncFrequency: "realtime" as SyncFrequency,
        syncEnabled: true,
        notificationsEnabled: true,
        twoWaySync: true,
        syncedDataTypes: ["emails", "labels", "drafts"],
      },
      stats: {
        totalSyncs: 1200,
        dataItemsSynced: 5800,
        lastSyncDurationMs: 2100,
        errorCount: 1,
      },
      createdAt: daysFromNow(-25),
      updatedAt: hoursFromNow(-1),
      metadata: {
        accountEmail: "user@gmail.com",
        unreadCount: 42,
      },
    },
    {
      id: generateId(),
      name: "Dropbox",
      serviceName: "Dropbox",
      category: "cloud_storage" as IntegrationCategory,
      description: "Store and sync files with Dropbox",
      iconName: "cloud",
      status: "connected" as IntegrationStatus,
      isEnabled: true,
      lastSyncAt: hoursFromNow(-4),
      connectedAt: daysFromNow(-45),
      config: {
        syncFrequency: "daily" as SyncFrequency,
        syncEnabled: true,
        notificationsEnabled: false,
        twoWaySync: true,
        syncedDataTypes: ["documents", "images", "videos"],
      },
      stats: {
        totalSyncs: 45,
        dataItemsSynced: 890,
        lastSyncDurationMs: 5400,
        errorCount: 0,
      },
      createdAt: daysFromNow(-45),
      updatedAt: hoursFromNow(-4),
      metadata: {
        storageUsed: "2.4 GB",
        storageLimit: "5 GB",
      },
    },
    {
      id: generateId(),
      name: "Todoist",
      serviceName: "Todoist",
      category: "task_management" as IntegrationCategory,
      description: "Sync tasks and projects with Todoist",
      iconName: "check-square",
      status: "disconnected" as IntegrationStatus,
      isEnabled: false,
      lastSyncAt: daysFromNow(-7),
      connectedAt: daysFromNow(-60),
      config: {
        syncFrequency: "hourly" as SyncFrequency,
        syncEnabled: false,
        notificationsEnabled: true,
        twoWaySync: true,
        syncedDataTypes: ["tasks", "projects"],
      },
      stats: {
        totalSyncs: 168,
        dataItemsSynced: 450,
        lastSyncDurationMs: 1100,
        errorCount: 5,
      },
      createdAt: daysFromNow(-60),
      updatedAt: daysFromNow(-7),
      metadata: {
        projectCount: 8,
      },
    },
    {
      id: generateId(),
      name: "Slack",
      serviceName: "Slack",
      category: "communication" as IntegrationCategory,
      description: "Receive notifications and updates from Slack",
      iconName: "message-square",
      status: "connected" as IntegrationStatus,
      isEnabled: true,
      lastSyncAt: hoursFromNow(-0.5),
      connectedAt: daysFromNow(-20),
      config: {
        syncFrequency: "realtime" as SyncFrequency,
        syncEnabled: true,
        notificationsEnabled: true,
        twoWaySync: false,
        syncedDataTypes: ["messages", "channels"],
      },
      stats: {
        totalSyncs: 960,
        dataItemsSynced: 3200,
        lastSyncDurationMs: 850,
        errorCount: 2,
      },
      createdAt: daysFromNow(-20),
      updatedAt: hoursFromNow(-0.5),
      metadata: {
        workspaceName: "AIOS Team",
        channelCount: 12,
      },
    },
    {
      id: generateId(),
      name: "OpenAI",
      serviceName: "OpenAI",
      category: "ai_services" as IntegrationCategory,
      description: "Enhanced AI capabilities with GPT-4",
      iconName: "cpu",
      status: "connected" as IntegrationStatus,
      isEnabled: true,
      lastSyncAt: hoursFromNow(-0.2),
      connectedAt: daysFromNow(-15),
      config: {
        syncFrequency: "realtime" as SyncFrequency,
        syncEnabled: true,
        notificationsEnabled: false,
        twoWaySync: false,
        syncedDataTypes: ["completions", "embeddings"],
      },
      stats: {
        totalSyncs: 450,
        dataItemsSynced: 1200,
        lastSyncDurationMs: 1800,
        errorCount: 1,
      },
      createdAt: daysFromNow(-15),
      updatedAt: hoursFromNow(-0.2),
      metadata: {
        model: "gpt-4",
        tokensUsed: 125000,
        tokensLimit: 1000000,
      },
    },
    {
      id: generateId(),
      name: "Notion",
      serviceName: "Notion",
      category: "productivity" as IntegrationCategory,
      description: "Sync notes and databases with Notion",
      iconName: "book",
      status: "error" as IntegrationStatus,
      isEnabled: true,
      lastSyncAt: daysFromNow(-1),
      connectedAt: daysFromNow(-35),
      config: {
        syncFrequency: "hourly" as SyncFrequency,
        syncEnabled: true,
        notificationsEnabled: true,
        twoWaySync: true,
        syncedDataTypes: ["pages", "databases"],
      },
      stats: {
        totalSyncs: 280,
        dataItemsSynced: 1150,
        lastSyncDurationMs: 3200,
        errorCount: 8,
      },
      createdAt: daysFromNow(-35),
      updatedAt: daysFromNow(-1),
      metadata: {
        workspaceName: "Personal Workspace",
        pageCount: 45,
      },
    },
    {
      id: generateId(),
      name: "Stripe",
      serviceName: "Stripe",
      category: "finance" as IntegrationCategory,
      description: "Track payments and financial transactions",
      iconName: "dollar-sign",
      status: "connected" as IntegrationStatus,
      isEnabled: true,
      lastSyncAt: hoursFromNow(-6),
      connectedAt: daysFromNow(-50),
      config: {
        syncFrequency: "daily" as SyncFrequency,
        syncEnabled: true,
        notificationsEnabled: true,
        twoWaySync: false,
        syncedDataTypes: ["transactions", "invoices", "customers"],
      },
      stats: {
        totalSyncs: 50,
        dataItemsSynced: 380,
        lastSyncDurationMs: 2500,
        errorCount: 0,
      },
      createdAt: daysFromNow(-50),
      updatedAt: hoursFromNow(-6),
      metadata: {
        accountType: "business",
        currency: "USD",
      },
    },
  ];
}
