export const STATUSES = ['pending', 'in-progress', 'completed'];
export const PRIORITIES = ['low', 'medium', 'high'];

// Task workflow: a task moves one step at a time.
//   pending <-> in-progress <-> completed
export const TRANSITIONS = {
  pending: ['in-progress'],
  'in-progress': ['pending', 'completed'],
  completed: ['in-progress'],
};

export const canTransition = (from, to) => from === to || TRANSITIONS[from]?.includes(to) === true;
