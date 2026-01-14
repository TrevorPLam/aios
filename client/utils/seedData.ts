import { Recommendation, Note, Task, Project, CalendarEvent, EmailThread, ConfidenceLevel, TaskPriority, ModuleType } from '@/models/types';

function generateId(): string {
  return `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

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

const RECOMMENDATION_TEMPLATES: Array<{
  module: ModuleType;
  type: string;
  templates: Array<{
    title: string;
    summary: string;
    why: string;
    confidence: ConfidenceLevel;
    priority: TaskPriority;
  }>;
}> = [
  {
    module: 'notebook',
    type: 'note_suggestion',
    templates: [
      {
        title: 'Document meeting notes',
        summary: 'Create a structured summary of your recent team standup discussion',
        why: 'Based on calendar event "Team Standup" that occurred 2 hours ago. Documenting key decisions improves team alignment.',
        confidence: 'high',
        priority: 'medium',
      },
      {
        title: 'Weekly reflection note',
        summary: 'Write a brief reflection on this week\'s accomplishments and learnings',
        why: 'Weekly reflections help track progress and identify patterns. It\'s been 7 days since your last reflection.',
        confidence: 'medium',
        priority: 'low',
      },
    ],
  },
  {
    module: 'planner',
    type: 'task_suggestion',
    templates: [
      {
        title: 'Review project milestones',
        summary: 'Check progress on Q1 goals and update status for stakeholders',
        why: 'Project "Q1 Planning" has tasks due this week. Regular reviews prevent scope creep.',
        confidence: 'high',
        priority: 'high',
      },
      {
        title: 'Break down large task',
        summary: 'Split "Complete API integration" into smaller, actionable subtasks',
        why: 'Task has been pending for 5 days without progress. Breaking it down increases completion likelihood by 3x.',
        confidence: 'medium',
        priority: 'medium',
      },
      {
        title: 'Set dependencies',
        summary: 'Link "Deploy to staging" to prerequisite tasks for better workflow',
        why: 'This task has implicit dependencies that should be explicit. Proper sequencing reduces blocking.',
        confidence: 'low',
        priority: 'low',
      },
    ],
  },
  {
    module: 'calendar',
    type: 'scheduling_suggestion',
    templates: [
      {
        title: 'Block focus time',
        summary: 'Schedule 2-hour deep work block tomorrow morning',
        why: 'You have 3 tasks marked high priority but no dedicated focus time this week. Morning slots show highest productivity.',
        confidence: 'high',
        priority: 'medium',
      },
      {
        title: 'Reschedule conflicting meeting',
        summary: 'Move 1-on-1 to avoid overlap with team review',
        why: 'Two events overlap on Thursday 2-3pm. The 1-on-1 is more flexible based on past rescheduling patterns.',
        confidence: 'medium',
        priority: 'high',
      },
    ],
  },
  {
    module: 'email',
    type: 'email_suggestion',
    templates: [
      {
        title: 'Follow up on proposal',
        summary: 'Send a brief check-in on the partnership proposal sent last week',
        why: 'Email to "Alex Chen" about "Partnership Proposal" has had no response in 6 days. Follow-ups increase response rate by 40%.',
        confidence: 'high',
        priority: 'medium',
      },
      {
        title: 'Archive old threads',
        summary: 'Move 12 resolved conversation threads to archive',
        why: 'These threads have no activity in 30+ days and last messages indicate resolution.',
        confidence: 'medium',
        priority: 'low',
      },
    ],
  },
  {
    module: 'command',
    type: 'system_insight',
    templates: [
      {
        title: 'Productivity insight',
        summary: 'Your task completion rate increased 23% this week',
        why: 'Comparing this week to your 4-week average. Key factor: shorter tasks created more frequently.',
        confidence: 'high',
        priority: 'low',
      },
    ],
  },
];

export function generateSeedRecommendations(count: number = 8): Recommendation[] {
  const recommendations: Recommendation[] = [];
  let templateIndex = 0;

  for (let i = 0; i < count; i++) {
    const moduleGroup = RECOMMENDATION_TEMPLATES[templateIndex % RECOMMENDATION_TEMPLATES.length];
    const template = moduleGroup.templates[i % moduleGroup.templates.length];
    
    const expiryHours = 4 + Math.floor(Math.random() * 20);
    
    recommendations.push({
      id: generateId(),
      module: moduleGroup.module,
      title: template.title,
      summary: template.summary,
      type: moduleGroup.type,
      status: 'active',
      createdAt: new Date().toISOString(),
      expiresAt: hoursFromNow(expiryHours),
      confidence: template.confidence,
      priority: template.priority,
      dedupeKey: `${moduleGroup.type}_${template.title.toLowerCase().replace(/\s/g, '_')}`,
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
      title: 'Project Ideas',
      bodyMarkdown: `# Project Ideas\n\n## Mobile App\n- [ ] User authentication\n- [ ] Dashboard design\n- [ ] API integration\n\n## Notes\nConsider using #react-native for cross-platform support.\n\nRelated: [[Architecture Notes]]`,
      createdAt: daysFromNow(-7),
      updatedAt: daysFromNow(-1),
      tags: ['project', 'ideas', 'react-native'],
      links: ['Architecture Notes'],
    },
    {
      id: generateId(),
      title: 'Meeting Notes - Team Sync',
      bodyMarkdown: `# Team Sync - ${new Date().toLocaleDateString()}\n\n## Attendees\n- Sarah\n- Mike\n- Jordan\n\n## Discussion\n- Sprint progress looking good\n- Need to prioritize #bug-fixes\n- Demo scheduled for Friday\n\n## Action Items\n- [ ] Update documentation\n- [ ] Review PR #234`,
      createdAt: daysFromNow(-2),
      updatedAt: daysFromNow(-2),
      tags: ['meeting', 'team', 'bug-fixes'],
      links: [],
    },
  ];
}

export function generateSeedTasks(): Task[] {
  return [
    {
      id: generateId(),
      title: 'Complete API integration',
      userNotes: 'Need to connect to the backend endpoints and handle authentication tokens.',
      aiNotes: ['Consider implementing retry logic for network failures', 'Token refresh should happen automatically'],
      priority: 'high',
      dueDate: daysFromNow(3),
      status: 'in_progress',
      recurrenceRule: 'none',
      projectId: null,
      dependencyIds: [],
      createdAt: daysFromNow(-5),
      updatedAt: daysFromNow(-1),
    },
    {
      id: generateId(),
      title: 'Review design mockups',
      userNotes: 'Check the new dashboard designs from the design team.',
      aiNotes: [],
      priority: 'medium',
      dueDate: daysFromNow(1),
      status: 'pending',
      recurrenceRule: 'none',
      projectId: null,
      dependencyIds: [],
      createdAt: daysFromNow(-2),
      updatedAt: daysFromNow(-2),
    },
    {
      id: generateId(),
      title: 'Weekly standup',
      userNotes: 'Prepare updates for the team.',
      aiNotes: [],
      priority: 'medium',
      dueDate: null,
      status: 'pending',
      recurrenceRule: 'weekly',
      projectId: null,
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
      name: 'Q1 Planning',
      description: 'First quarter goals and milestones',
      taskIds: [],
      createdAt: daysFromNow(-30),
      updatedAt: daysFromNow(-5),
    },
    {
      id: generateId(),
      name: 'Mobile App Launch',
      description: 'Everything needed for the v1.0 release',
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
      title: 'Team Standup',
      description: 'Daily sync with the team',
      location: 'Meeting Room A',
      startAt: today.toISOString(),
      endAt: new Date(today.getTime() + 30 * 60000).toISOString(),
      allDay: false,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      recurrenceRule: 'daily',
      exceptions: [],
      overrides: {},
      createdAt: daysFromNow(-30),
      updatedAt: daysFromNow(-30),
      source: 'LOCAL',
    },
    {
      id: generateId(),
      title: 'Project Review',
      description: 'Review Q1 progress with stakeholders',
      location: 'Conference Room',
      startAt: new Date(today.getTime() + 3 * 60 * 60000).toISOString(),
      endAt: new Date(today.getTime() + 4 * 60 * 60000).toISOString(),
      allDay: false,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      recurrenceRule: 'none',
      exceptions: [],
      overrides: {},
      createdAt: daysFromNow(-7),
      updatedAt: daysFromNow(-7),
      source: 'LOCAL',
    },
    {
      id: generateId(),
      title: 'Focus Time',
      description: 'Deep work block - no meetings',
      location: '',
      startAt: daysFromNow(1),
      endAt: new Date(new Date(daysFromNow(1)).getTime() + 2 * 60 * 60000).toISOString(),
      allDay: false,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      recurrenceRule: 'none',
      exceptions: [],
      overrides: {},
      createdAt: daysFromNow(-1),
      updatedAt: daysFromNow(-1),
      source: 'LOCAL',
    },
  ];
}

export const MOCK_EMAIL_THREADS: EmailThread[] = [
  {
    id: 'thread_1',
    subject: 'Partnership Proposal - Q1 Collaboration',
    participants: ['Alex Chen', 'You'],
    isRead: false,
    isStarred: true,
    lastMessageAt: daysFromNow(-1),
    messages: [
      {
        id: 'msg_1',
        threadId: 'thread_1',
        from: 'You',
        to: ['alex.chen@company.com'],
        subject: 'Partnership Proposal - Q1 Collaboration',
        body: 'Hi Alex,\n\nI wanted to reach out about a potential partnership opportunity. Our teams have complementary strengths and I believe we could create something great together.\n\nWould you be open to a call next week to discuss?\n\nBest,\nYou',
        sentAt: daysFromNow(-6),
        isRead: true,
      },
      {
        id: 'msg_2',
        threadId: 'thread_1',
        from: 'Alex Chen',
        to: ['you@company.com'],
        subject: 'Re: Partnership Proposal - Q1 Collaboration',
        body: 'Hi,\n\nThanks for reaching out! This sounds interesting. I\'m looking at my calendar and have some availability next Tuesday or Wednesday afternoon.\n\nLet me know what works for you.\n\nAlex',
        sentAt: daysFromNow(-1),
        isRead: false,
      },
    ],
  },
  {
    id: 'thread_2',
    subject: 'Weekly Report - Team Performance',
    participants: ['Jordan Smith', 'You', 'Team'],
    isRead: true,
    isStarred: false,
    lastMessageAt: daysFromNow(-2),
    messages: [
      {
        id: 'msg_3',
        threadId: 'thread_2',
        from: 'Jordan Smith',
        to: ['team@company.com'],
        subject: 'Weekly Report - Team Performance',
        body: 'Team,\n\nHere\'s our weekly performance summary:\n\n- Tasks completed: 47\n- Sprint progress: 78%\n- Blockers resolved: 3\n\nGreat work everyone!\n\nJordan',
        sentAt: daysFromNow(-2),
        isRead: true,
      },
    ],
  },
  {
    id: 'thread_3',
    subject: 'Design Review Feedback',
    participants: ['Sarah Lee', 'You'],
    isRead: true,
    isStarred: false,
    lastMessageAt: daysFromNow(-3),
    messages: [
      {
        id: 'msg_4',
        threadId: 'thread_3',
        from: 'Sarah Lee',
        to: ['you@company.com'],
        subject: 'Design Review Feedback',
        body: 'Hey,\n\nI reviewed the latest mockups and have some feedback:\n\n1. The navigation feels intuitive\n2. Consider adding more contrast to the CTAs\n3. The loading states look great\n\nOverall really solid work!\n\nSarah',
        sentAt: daysFromNow(-3),
        isRead: true,
      },
    ],
  },
  {
    id: 'thread_4',
    subject: 'Upcoming Team Offsite',
    participants: ['Mike Johnson', 'Team'],
    isRead: false,
    isStarred: false,
    lastMessageAt: daysFromNow(0),
    messages: [
      {
        id: 'msg_5',
        threadId: 'thread_4',
        from: 'Mike Johnson',
        to: ['team@company.com'],
        subject: 'Upcoming Team Offsite',
        body: 'Hi everyone,\n\nExciting news - we\'re planning a team offsite for next month!\n\nDetails:\n- Date: TBD (voting link below)\n- Location: Mountain retreat\n- Duration: 2 days\n\nPlease fill out the survey by end of week.\n\nMike',
        sentAt: daysFromNow(0),
        isRead: false,
      },
    ],
  },
];
