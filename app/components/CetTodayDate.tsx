'use client';

import { useEffect, useState } from 'react';

const CET_ZONE = 'Europe/Amsterdam';

export function formatCetToday(now = new Date()) {
  const { year, month, day } = zoneParts(now);
  return `${String(day).padStart(2, '0')}-${String(month).padStart(2, '0')}-${year}`;
}

function zoneParts(now: Date) {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: CET_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(now);
  const value = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((part) => part.type === type)?.value ?? 0);
  return {
    year: value('year'),
    month: value('month'),
    day: value('day'),
  };
}

function zoneOffsetMs(utcMs: number) {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: CET_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(new Date(utcMs));
  const value = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((part) => part.type === type)?.value ?? 0);
  const asUtc = Date.UTC(
    value('year'),
    value('month') - 1,
    value('day'),
    value('hour'),
    value('minute'),
    value('second')
  );
  return asUtc - utcMs;
}

export function msUntilNextCetMidnight(now = new Date()) {
  const { year, month, day } = zoneParts(now);
  const nextLocalMidnightAsUtc = Date.UTC(year, month - 1, day + 1, 0, 0, 0);
  let nextMidnight = nextLocalMidnightAsUtc - zoneOffsetMs(nextLocalMidnightAsUtc);
  nextMidnight = nextLocalMidnightAsUtc - zoneOffsetMs(nextMidnight);
  return Math.max(250, nextMidnight - now.getTime());
}

/** Shows today's date in CET and refreshes at 00:00 Europe/Amsterdam. */
export default function CetTodayDate() {
  const [label, setLabel] = useState(formatCetToday);

  useEffect(() => {
    let timer = 0;
    const tick = () => {
      setLabel(formatCetToday());
      timer = window.setTimeout(tick, msUntilNextCetMidnight());
    };
    timer = window.setTimeout(tick, msUntilNextCetMidnight());
    return () => window.clearTimeout(timer);
  }, []);

  return <>{label}</>;
}
