/**
 * Get days until a date (ignoring year)
 * Handles ISO format, YYYY-MM-DD, and DD/MM/YYYY formats
 * @param {string|Date} dateInput - Date string or Date object
 * @returns {number} Days until the date (this year or next year)
 */
export const getDaysUntilDate = (dateInput) => {
  if (!dateInput) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  let month, day;
  const dateStr = String(dateInput);

  // Handle Date object
  if (dateInput instanceof Date) {
    month = dateInput.getMonth() + 1;
    day = dateInput.getDate();
  }
  // Handle ISO format (2011-06-12T00:00:00.000Z)
  else if (dateStr.includes('T')) {
    const isoDatePart = dateStr.split('T')[0];
    const parts = isoDatePart.split('-');
    month = parseInt(parts[1], 10);
    day = parseInt(parts[2], 10);
  } 
  // Handle DD/MM/YYYY format
  else if (dateStr.includes('/')) {
    const parts = dateStr.split('/');
    day = parseInt(parts[0], 10);
    month = parseInt(parts[1], 10);
  } 
  // Handle YYYY-MM-DD format
  else if (dateStr.includes('-')) {
    const parts = dateStr.split('-');
    month = parseInt(parts[1], 10);
    day = parseInt(parts[2], 10);
  } 
  else {
    return null;
  }

  // Validate month and day
  if (!month || !day || month < 1 || month > 12 || day < 1 || day > 31) {
    return null;
  }

  // Create date for THIS YEAR, ignoring stored year
  let upcomingDate = new Date(today.getFullYear(), month - 1, day);
  upcomingDate.setHours(0, 0, 0, 0);

  // If date already passed this year, check NEXT year
  if (upcomingDate < today) {
    upcomingDate = new Date(today.getFullYear() + 1, month - 1, day);
    upcomingDate.setHours(0, 0, 0, 0);
  }

  // Calculate days difference
  const timeDiff = upcomingDate - today;
  const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

  return daysDiff;
};

/**
 * Check if a date is within upcoming days
 * @param {string} dateStr - Date string
 * @param {number} daysAhead - Number of days to check ahead (default: 30)
 * @returns {boolean} True if date is within the upcoming days
 */
export const isUpcoming = (dateStr, daysAhead = 60) => {
  const days = getDaysUntilDate(dateStr);
  return days !== null && days <= daysAhead && days >= 0;
};

/**
 * Get reminder type based on days until date
 * @param {number} daysUntil - Days until the date
 * @returns {string} Reminder type ('today', 'soon', 'upcoming', 'later')
 */
export const getReminderType = (daysUntil) => {
  if (daysUntil === 0) return 'today';
  if (daysUntil <= 7) return 'soon';
  if (daysUntil <= 30) return 'upcoming';
  return 'later';
};

/**
 * Format reminder message
 * @param {string} name - Person's name
 * @param {string} type - Type of reminder (birthday, anniversary)
 * @param {number} daysUntil - Days until the event
 * @returns {string} Formatted reminder message
 */
export const formatReminderMessage = (name, type, daysUntil) => {
  if (daysUntil === 0) {
    return `🎉 ${name}'s ${type} is TODAY!`;
  }
  if (daysUntil === 1) {
    return `🎂 ${name}'s ${type} is TOMORROW!`;
  }
  return `📅 ${name}'s ${type} in ${daysUntil} days`;
};

/**
 * Get reminder color based on urgency
 * @param {number} daysUntil - Days until the event
 * @returns {string} Color code for reminder
 */
export const getReminderColor = (daysUntil) => {
  if (daysUntil === 0) return '#ff4444'; // Red - Today
  if (daysUntil <= 3) return '#ff8800'; // Orange - Very soon
  if (daysUntil <= 7) return '#ffaa00'; // Yellow - Soon
  if (daysUntil <= 15) return '#88cc00'; // Light green - Upcoming
  return '#cccccc'; // Gray - Later
};

/**
 * Get emoji based on reminder type
 * @param {string} type - Reminder type
 * @returns {string} Emoji
 */
export const getReminderEmoji = (type) => {
  switch(type) {
    case 'student_birthday':
      return '🎂';
    case 'father_birthday':
      return '👨';
    case 'mother_birthday':
      return '👩';
    case 'parents_anniversary':
      return '💑';
    default:
      return '📅';
  }
};

/**
 * Get all reminders for a student
 * @param {object} student - Student object
 * @param {number} daysAhead - Number of days ahead to check
 * @returns {array} Array of reminder objects
 */
export const getStudentReminders = (student, daysAhead = 60) => {
  const reminders = [];

  // Student Birthday
  if (student.dob && isUpcoming(student.dob, daysAhead)) {
    const days = getDaysUntilDate(student.dob);

    reminders.push({
      type: 'student_birthday',
      name: student.name,
      relation: 'Student',
      date: student.dob,
      message: formatReminderMessage(
        student.name,
        'Birthday',
        days
      ),
      daysUntil: days,
      color: getReminderColor(days),
      emoji: '🎂'
    });
  }

  // Father's Birthday
  if (
    student.fatherName &&
    student.fatherDob &&
    isUpcoming(student.fatherDob, daysAhead)
  ) {
    const days = getDaysUntilDate(student.fatherDob);

    reminders.push({
      type: 'father_birthday',
      name: `${student.name}'s Father`,
      relation: 'Father',
      date: student.fatherDob,
      message: formatReminderMessage(
        student.name,
        "Father's Birthday",
        days
      ),
      daysUntil: days,
      color: getReminderColor(days),
      emoji: '👨'
    });
  }

  // Mother's Birthday
  if (
    student.motherName &&
    student.motherDob &&
    isUpcoming(student.motherDob, daysAhead)
  ) {
    const days = getDaysUntilDate(student.motherDob);

    reminders.push({
      type: 'mother_birthday',
      name: `${student.name}'s Mother`,
      relation: 'Mother',
      date: student.motherDob,
      message: formatReminderMessage(
        student.name,
        "Mother's Birthday",
        days
      ),
      daysUntil: days,
      color: getReminderColor(days),
      emoji: '👩'
    });
  }

  // Parents Anniversary
  if (
    student.parentsAnniversary &&
    isUpcoming(student.parentsAnniversary, daysAhead)
  ) {
    const days = getDaysUntilDate(student.parentsAnniversary);

    reminders.push({
      type: 'parents_anniversary',
      name: `${student.name}'s Parents`,
      relation: 'Parents',
      date: student.parentsAnniversary,
      message: formatReminderMessage(
        student.name,
        "Parents' Anniversary",
        days
      ),
      daysUntil: days,
      color: getReminderColor(days),
      emoji: '💑'
    });
  }

  // Sort nearest events first
  return reminders.sort((a, b) => a.daysUntil - b.daysUntil);
};

/**
 * Get all reminders for a class
 * @param {array} students - Array of student objects
 * @param {number} daysAhead - Number of days ahead to check
 * @returns {array} Array of all reminders sorted by date
 */
export const getClassReminders = (students, daysAhead = 30) => {
  const allReminders = [];

  students.forEach(student => {
    const studentReminders = getStudentReminders(student, daysAhead);
    allReminders.push(...studentReminders);
  });

  // Sort by days until - TODAY (0) first, then TOMORROW (1), etc
  return allReminders.sort((a, b) => a.daysUntil - b.daysUntil);
};

/**
 * Test function - shows upcoming dates this month
 */
export const getThisMonthReminders = (students) => {
  const today = new Date();
  const daysLeftInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate() - today.getDate();
  return getClassReminders(students, daysLeftInMonth);
};