import { FaqNode } from '../model/faq-node.interface';

export const FAQ_GRAPH: Record<string, FaqNode> = {
  '0': {
    id: '0',
    question: 'Getting Started',
    keywords: ['start', 'begin', 'first steps', 'introduction'],
    answer: null,
    children: ['1', '2', '3', '4', '5'],
  },
  '1': {
    id: '1',
    question: 'Login Help',
    keywords: ['login', 'sign in', 'authentication', 'access account'],
    answer:
      "You can log in through the authentication page using your credentials. If you don't have an account yet, you can sign up through the signin component.",
    children: ['11'],
  },
  '11': {
    id: '11',
    question: 'Dashboard Overview',
    keywords: ['dashboard', 'overview', 'home', 'main screen', 'stats'],
    answer:
      'The dashboard shows your timer info, daily statistics through the days-info component, and visual representations in the graph component.',
    children: [],
  },
  '2': {
    id: '2',
    question: 'Timer Basics',
    keywords: ['timer', 'track time', 'start timer', 'stop timer', 'time tracking'],
    answer:
      "The timer can be accessed from the time track tab. Click the start button to begin tracking your time, and stop when you're finished.",
    children: ['21', '22'],
  },
  '21': {
    id: '21',
    question: 'Work Sessions',
    keywords: ['work sessions', 'log work', 'session', 'add session', 'edit session'],
    answer:
      'Work sessions can be managed through the work-log tab. You can add new sessions or edit existing ones using the add-session and edit-session features.',
    children: [],
  },
  '22': {
    id: '22',
    question: 'Edit Time Entries',
    keywords: ['edit time', 'edit logs', 'modify entries', 'change timer'],
    answer:
      'Yes, you can edit your time entries through the work-log component using the edit-session feature.',
    children: [],
  },
  '3': {
    id: '3',
    question: 'Leave Slips',
    keywords: ['leave slips', 'absence', 'time off', 'request leave'],
    answer: 'Leave slips are for requesting short-term absences.',
    children: ['31', '32'],
  },
  '31': {
    id: '31',
    question: 'Request Leave',
    keywords: ['request leave', 'submit leave', 'time off request'],
    answer:
      'Use the leave-form in the leave-slip section to submit your request. Select dates using the leave-slip-picker.',
    children: ['311'],
  },
  '311': {
    id: '311',
    question: 'Leave Status',
    keywords: ['leave status', 'check leave', 'pending leave', 'leave request status'],
    answer:
      'Check the leave-slip-table to view all your leave requests and their current status.',
    children: [],
  },
  '32': {
    id: '32',
    question: 'Manage Requests',
    keywords: ['manage requests', 'edit leave', 'delete leave', 'leave actions'],
    answer:
      'In the leave-slip-table, you can edit or delete your pending leave requests using the action buttons.',
    children: [],
  },
  '4': {
    id: '4',
    question: 'Vacation',
    keywords: ['vacation', 'annual leave', 'time off', 'holiday', 'vacation tracking'],
    answer:
      'Vacation tracking is for managing your annual leave balance and requests.',
    children: ['41', '42', '43'],
  },
  '41': {
    id: '41',
    question: 'Request Vacation',
    keywords: ['request vacation', 'submit vacation', 'holiday request'],
    answer:
      'Submit vacation requests through the vacation-form. Use the vacation-picker to select your dates.',
    children: [],
  },
  '42': {
    id: '42',
    question: 'Check Balance',
    keywords: ['check balance', 'vacation balance', 'leave balance', 'time off balance'],
    answer: 'View your vacation balance and history in the vacation tab.',
    children: [],
  },
  '43': {
    id: '43',
    question: 'Manage Requests',
    keywords: ['manage vacation', 'edit vacation', 'delete vacation', 'vacation actions'],
    answer:
      'In the vacation-table, you can edit or delete your pending vacation requests using the action buttons.',
    children: [],
  },
  '5': {
    id: '5',
    question: 'Manager Tools',
    keywords: ['manager', 'admin', 'team tools', 'approvals', 'dashboard'],
    answer:
      'Managers can review and approve team requests through the manager dashboard.',
    children: ['51', '52'],
  },
  '51': {
    id: '51',
    question: 'Manage Leave',
    keywords: ['manage leave', 'approve leave', 'review leave', 'leave approvals'],
    answer: 'Review and approve leave requests in the manager-leaves section.',
    children: [],
  },
  '52': {
    id: '52',
    question: 'Manage Vacation',
    keywords: ['manage vacation', 'approve vacation', 'review vacation', 'vacation approvals'],
    answer:
      'Handle vacation requests and balances in the manager-vacation section.',
    children: [],
  },
};
