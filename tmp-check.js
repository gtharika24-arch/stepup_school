import { getClassReminders } from './src/utils/reminderUtils.js';

const res = await fetch('http://localhost:5000/api/students');
const json = await res.json();
const reminders = getClassReminders(json.data, 30).map(r => ({
  name: r.name,
  date: r.date,
  type: r.type.includes('birthday') ? 'birthday' : 'anniversary'
}));

const today = new Date();
today.setHours(0, 0, 0, 0);

const upcoming = reminders.filter(b => {
  const dateStr = String(b.date);
  let month, day;

  if (dateStr.includes('T')) {
    const isoPart = dateStr.split('T')[0];
    const parts = isoPart.split('-');
    month = parseInt(parts[1], 10) - 1;
    day = parseInt(parts[2], 10);
  } else if (dateStr.includes('-')) {
    const parts = dateStr.split('-');
    month = parseInt(parts[1], 10) - 1;
    day = parseInt(parts[2], 10);
  } else {
    return false;
  }

  for (let i = 0; i <= 2; i++) {
    const checkDate = new Date(today);
    checkDate.setDate(checkDate.getDate() + i);
    if (month === checkDate.getMonth() && day === checkDate.getDate()) {
      return true;
    }
  }

  return false;
});

console.log('TODAY', today.toDateString());
console.log('UPCOMING', JSON.stringify(upcoming, null, 2));
