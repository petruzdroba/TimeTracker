import { FaqNode } from '../model/faq-node.interface';

export const FAQ_GRAPH: Record<string, FaqNode> = {
  '0': {
    id: '0',
    topic: 'basic',
    question: 'Getting Started',
    answer: null,
    children: ['1', '2', '3', '4', '5'],
  },
  '1': {
    id: '1',
    topic: 'basic',
    question: 'Login Help',
    answer:
      "You can log in through the authentication page using your credentials. If you don't have an account yet, you can sign up through the signin component.",
    children: ['11'],
  },
  '11': {
    id: '11',
    topic: 'basic',
    question: 'Dashboard Overview',
    answer:
      'The dashboard shows your timer info, daily statistics through the days-info component, and visual representations in the graph component.',
    children: [],
  },
  '2': {
    id: '2',
    topic: 'timer',
    question: 'Timer Basics',
    answer:
      "The timer can be accessed from the time track tab. Click the start button to begin tracking your time, and stop when you're finished.",
    children: ['21', '22'],
  },
  '21': {
    id: '21',
    topic: 'timer',
    question: 'Work Sessions',
    answer:
      'Work sessions can be managed through the work-log tab. You can add new sessions or edit existing ones using the add-session and edit-session features.',
    children: [],
  },
  '22': {
    id: '22',
    topic: 'timer',
    question: 'Edit Time Entries',
    answer:
      'Yes, you can edit your time entries through the work-log component using the edit-session feature.',
    children: [],
  },
  '3': {
    id: '3',
    topic: 'requests',
    question: 'Leave Slips',
    answer: 'Leave slips are for requesting short-term absences.',
    children: ['31', '32'],
  },
  '31': {
    id: '31',
    topic: 'requests',
    question: 'Request Leave',
    answer:
      'Use the leave-form in the leave-slip section to submit your request. Select dates using the leave-slip-picker.',
    children: ['311'],
  },
  '311': {
    id: '311',
    topic: 'requests',
    question: 'Leave Status',
    answer:
      'Check the leave-slip-table to view all your leave requests and their current status.',
    children: [],
  },
  '32': {
    id: '32',
    topic: 'requests',
    question: 'Manage Requests',
    answer:
      'In the leave-slip-table, you can edit or delete your pending leave requests using the action buttons.',
    children: [],
  },
  '4': {
    id: '4',
    question: 'Vacation',
    topic: 'requests',
    answer:
      'Vacation tracking is for managing your annual leave balance and requests.',
    children: ['41', '42', '43'],
  },
  '41': {
    id: '41',
    topic: 'requests',
    question: 'Request Vacation',
    answer:
      'Submit vacation requests through the vacation-form. Use the vacation-picker to select your dates.',
    children: [],
  },
  '42': {
    id: '42',
    topic: 'requests',
    question: 'Check Balance',
    answer: 'View your vacation balance and history in the vacation tab.',
    children: [],
  },
  '43': {
    id: '43',
    topic: 'requests',
    question: 'Manage Requests',
    answer:
      'In the vacation-table, you can edit or delete your pending vacation requests using the action buttons.',
    children: [],
  },
  '5': {
    id: '5',
    topic: 'boss',
    question: 'Manager Tools',
    answer:
      'Managers can review and approve team requests through the manager dashboard.',
    children: ['51', '52'],
  },
  '51': {
    id: '51',
    topic: 'boss',
    question: 'Manage Leave',
    answer: 'Review and approve leave requests in the manager-leaves section.',
    children: [],
  },
  '52': {
    id: '52',
    topic: 'boss',
    question: 'Manage Vacation',
    answer:
      'Handle vacation requests and balances in the manager-vacation section.',
    children: [],
  },
};
