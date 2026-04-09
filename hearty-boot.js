const BADGE_CATALOGUE = [
  {
    id: 'first-weigh-in',
    name: 'First Weigh-In',
    icon: '⚖️',
    description: 'Log your first weight check-in',
  },
  {
    id: 'photo-check-in',
    name: 'Photo Check-In',
    icon: '📸',
    description: 'Upload your first progress photo',
  },
  {
    id: 'injection-logged',
    name: 'Injection Logged',
    icon: '💉',
    description: 'Log your first medication dose',
  },
  {
    id: 'exercise-started',
    name: 'Exercise Started',
    icon: '🏋️',
    description: 'Open the exercise engine',
  },
  {
    id: 'milestone-hit',
    name: 'Milestone Hit',
    icon: '🏅',
    description: 'Reach your first progress marker',
  },
];

const CONTAINER_IDS = {
  homeLatest: 'homeLatestBadges',
  progressLatest: 'progressLatestBadges',
  progressNext: 'progressNextBadges',
};

function safeGetStorage() {
  try {
    return window.localStorage;
  } catch (error) {
    return null;
  }
}

function hasValue(value) {
  return value !== null && value !== undefined && String(value).trim() !== '';
}

function parseTimestamp(value) {
  if (!hasValue(value)) return 0;

  if (typeof value === 'number' && Number.isFinite(value)) {
    if (value > 1e12) return value;
    if (value > 1e9) return value * 1000;
    return 0;
  }

  const text = String(value).trim();

  if (/^\d+$/.test(text)) {
    const numeric = Number(text);
    if (numeric > 1e12) return numeric;
    if (numeric > 1e9) return numeric * 1000;
  }

  const directDate = Date.parse(text);
  if (!Number.isNaN(directDate)) {
    return directDate;
  }

  try {
    const parsed = JSON.parse(text);
    if (parsed && typeof parsed === 'object') {
      const candidateKeys = ['earnedAt', 'completedAt', 'createdAt', 'updatedAt', 'timestamp', 'time', 'date'];
      for (const key of candidateKeys) {
        if (key in parsed) {
          const nested = parseTimestamp(parsed[key]);
          if (nested > 0) return nested;
        }
      }
    }
  } catch (error) {
    // Ignore malformed JSON and fall back to 0.
  }

  return 0;
}

function getEarliestKeyTimestamp(keys) {
  const timestamps = keys
    .map((key) => {
      const suffix = key.split(':').slice(1).join(':');
      return parseTimestamp(suffix);
    })
    .filter((value) => value > 0)
    .sort((a, b) => a - b);

  return timestamps[0] || 0;
}

function getBadgeState(storage) {
  if (!storage) {
    return BADGE_CATALOGUE.map((badge, index) => ({
      ...badge,
      earned: false,
      earnedAt: 0,
      sortIndex: index,
    }));
  }

  const injectionKeys = [];
  for (let i = 0; i < storage.length; i += 1) {
    const key = storage.key(i);
    if (key && key.startsWith('heartyInjectionLogged:') && storage.getItem(key) === '1') {
      injectionKeys.push(key);
    }
  }

  const firstWeightRaw = storage.getItem('heartyTodayWeightKg');
  const photoRaw = storage.getItem('heartyLastPhotoCheckInAt');
  const exerciseRaw = storage.getItem('heartyExerciseEngineV3');
  const milestoneRaw = storage.getItem('heartyLatestMarkerAt');

  return BADGE_CATALOGUE.map((badge, index) => {
    let earned = false;
    let earnedAt = 0;

    switch (badge.id) {
      case 'first-weigh-in': {
        const weight = Number.parseFloat(firstWeightRaw || '');
        earned = Number.isFinite(weight) && weight > 0;
        break;
      }
      case 'photo-check-in': {
        earned = hasValue(photoRaw);
        earnedAt = parseTimestamp(photoRaw);
        break;
      }
      case 'injection-logged': {
        earned = injectionKeys.length > 0;
        earnedAt = getEarliestKeyTimestamp(injectionKeys);
        break;
      }
      case 'exercise-started': {
        earned = hasValue(exerciseRaw);
        earnedAt = parseTimestamp(exerciseRaw);
        break;
      }
      case 'milestone-hit': {
        earned = hasValue(milestoneRaw);
        earnedAt = parseTimestamp(milestoneRaw);
        break;
      }
      default:
        break;
    }

    return {
      ...badge,
      earned,
      earnedAt,
      sortIndex: index,
    };
  });
}

function sortEarnedBadges(badges) {
  return badges
    .filter((badge) => badge.earned)
    .sort((a, b) => {
      if (b.earnedAt !== a.earnedAt) {
        return b.earnedAt - a.earnedAt;
      }
      return a.sortIndex - b.sortIndex;
    });
}

function getUpcomingBadges(badges) {
  return badges
    .filter((badge) => !badge.earned)
    .sort((a, b) => a.sortIndex - b.sortIndex);
}

function clearElement(element) {
  while (element.firstChild) {
    element.removeChild(element.firstChild);
  }
}

function createTile(badge) {
  const tile = document.createElement('div');
  tile.className = 'hearty-badge-tile';
  tile.dataset.size = 'sm';

  const inner = document.createElement('div');
  inner.className = 'hearty-badge-inner';

  const icon = document.createElement('span');
  icon.className = 'hearty-badge-icon';
  icon.textContent = badge.icon;
  icon.setAttribute('aria-hidden', 'true');

  const name = document.createElement('div');
  name.className = 'hearty-badge-name';
  name.textContent = badge.name;

  inner.appendChild(icon);
  tile.appendChild(inner);
  tile.appendChild(name);

  return tile;
}

function renderBadgeTiles(container, badges, emptyCopy) {
  clearElement(container);

  if (!badges.length) {
    const empty = document.createElement('p');
    empty.className = 'hearty-badge-empty-note';
    empty.textContent = emptyCopy;
    container.appendChild(empty);
    return;
  }

  const row = document.createElement('div');
  row.className = 'hearty-badge-row';

  badges.forEach((badge) => {
    row.appendChild(createTile(badge));
  });

  container.appendChild(row);
}

function createFutureCard(badge) {
  const card = document.createElement('article');
  card.className = 'hearty-badge-future-card';

  const top = document.createElement('div');
  top.className = 'hearty-badge-future-top';

  const icon = document.createElement('span');
  icon.className = 'hearty-badge-icon';
  icon.textContent = badge.icon;
  icon.setAttribute('aria-hidden', 'true');

  const name = document.createElement('div');
  name.className = 'hearty-badge-future-name';
  name.textContent = badge.name;

  const copy = document.createElement('p');
  copy.className = 'hearty-badge-future-copy';
  copy.textContent = badge.description;

  const progress = document.createElement('div');
  progress.className = 'hearty-badge-progress';
  progress.setAttribute('aria-hidden', 'true');

  const fill = document.createElement('span');
  fill.className = 'hearty-badge-progress-fill';
  fill.style.width = '0%';

  progress.appendChild(fill);
  top.appendChild(icon);
  top.appendChild(name);
  card.appendChild(top);
  card.appendChild(copy);
  card.appendChild(progress);

  return card;
}

function renderUpcomingBadges(container, badges) {
  clearElement(container);

  if (!badges.length) {
    const empty = document.createElement('p');
    empty.className = 'hearty-badge-empty-note';
    empty.textContent = 'All current badges unlocked.';
    container.appendChild(empty);
    return;
  }

  const list = document.createElement('div');
  list.className = 'hearty-badge-future-list';

  badges.forEach((badge) => {
    list.appendChild(createFutureCard(badge));
  });

  container.appendChild(list);
}

function renderBadges() {
  const storage = safeGetStorage();
  const badgeState = getBadgeState(storage);
  const earnedBadges = sortEarnedBadges(badgeState);
  const upcomingBadges = getUpcomingBadges(badgeState).slice(0, 3);

  const homeLatest = document.getElementById(CONTAINER_IDS.homeLatest);
  const progressLatest = document.getElementById(CONTAINER_IDS.progressLatest);
  const progressNext = document.getElementById(CONTAINER_IDS.progressNext);

  if (homeLatest) {
    renderBadgeTiles(
      homeLatest,
      earnedBadges.slice(0, 3),
      'Complete tasks to earn your first badge.'
    );
  }

  if (progressLatest) {
    renderBadgeTiles(
      progressLatest,
      earnedBadges,
      'Complete tasks to earn your first badge.'
    );
  }

  if (progressNext) {
    renderUpcomingBadges(progressNext, upcomingBadges);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', renderBadges, { once: true });
} else {
  renderBadges();
}

export {};
