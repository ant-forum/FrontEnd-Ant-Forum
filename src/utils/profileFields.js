export const normalizeSkills = (value) => {
  if (!value) return [];

  if (Array.isArray(value)) {
    return value.map((skill) => String(skill).trim()).filter(Boolean);
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return [];

    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        return parsed.map((skill) => String(skill).trim()).filter(Boolean);
      }
    } catch {
      // Plain comma-separated skill lists are accepted below.
    }

    return trimmed
      .split(",")
      .map((skill) => skill.trim())
      .filter(Boolean);
  }

  return [];
};

export const skillsToText = (value) => normalizeSkills(value).join(", ");

export const extractProfilePayload = (payload) => {
  if (!payload) return null;

  const candidates = [
    payload.user,
    payload.profile,
    payload.row,
    payload.data?.user,
    payload.data?.profile,
    payload.data?.row,
    payload.data?.data,
    payload.data,
    payload,
  ];

  return candidates.find((candidate) => {
    return candidate && typeof candidate === "object" && (
      candidate.id !== undefined ||
      candidate.user_id !== undefined ||
      candidate.username !== undefined ||
      candidate.email !== undefined
    );
  }) || null;
};

export const normalizeProfileRecord = (profile) => {
  if (!profile) return null;

  return {
    ...profile,
    skills: normalizeSkills(profile.skills),
  };
};
