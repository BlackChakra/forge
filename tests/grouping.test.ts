import { describe, it, expect } from 'vitest';
import { createEmptyGroups, parseCommitMessage } from '../src/git/parser';
import { CommitCategory } from '../src/types';
import { CATEGORY_ORDER } from '../src/constants';

describe('createEmptyGroups', () => {
  it('returns all 7 categories with empty arrays', () => {
    const groups = createEmptyGroups();
    const keys = Object.keys(groups);
    expect(keys).toHaveLength(7);

    for (const category of Object.values(CommitCategory)) {
      expect(groups[category]).toEqual([]);
    }
  });
});

describe('commit grouping', () => {
  const commits = [
    { hash: 'aaa0001', message: 'feat: add auth' },
    { hash: 'aaa0002', message: 'fix: null pointer' },
    { hash: 'aaa0003', message: 'feat(ui): add button' },
    { hash: 'aaa0004', message: 'docs: update readme' },
    { hash: 'aaa0005', message: 'chore: bump deps' },
    { hash: 'aaa0006', message: 'refactor: extract util' },
    { hash: 'aaa0007', message: 'test: add parser test' },
    { hash: 'aaa0008', message: 'plain commit no prefix' },
    { hash: 'aaa0009', message: 'fix: another bug' },
  ];

  function groupCommits() {
    const groups = createEmptyGroups();
    for (const { hash, message } of commits) {
      const parsed = parseCommitMessage(hash, message);
      groups[parsed.category].push(parsed);
    }
    return groups;
  }

  it('groups commits into correct categories', () => {
    const groups = groupCommits();
    expect(groups[CommitCategory.Features]).toHaveLength(2);
    expect(groups[CommitCategory.Fixes]).toHaveLength(2);
    expect(groups[CommitCategory.Docs]).toHaveLength(1);
    expect(groups[CommitCategory.Refactors]).toHaveLength(1);
    expect(groups[CommitCategory.Tests]).toHaveLength(1);
    expect(groups[CommitCategory.Chores]).toHaveLength(1);
    expect(groups[CommitCategory.Other]).toHaveLength(1);
  });

  it('preserves insertion order within categories', () => {
    const groups = groupCommits();
    expect(groups[CommitCategory.Features][0].hash).toBe('aaa0001');
    expect(groups[CommitCategory.Features][1].hash).toBe('aaa0003');
    expect(groups[CommitCategory.Fixes][0].hash).toBe('aaa0002');
    expect(groups[CommitCategory.Fixes][1].hash).toBe('aaa0009');
  });

  it('CATEGORY_ORDER contains all categories in stable order', () => {
    expect(CATEGORY_ORDER).toEqual([
      CommitCategory.Features,
      CommitCategory.Fixes,
      CommitCategory.Docs,
      CommitCategory.Refactors,
      CommitCategory.Tests,
      CommitCategory.Chores,
      CommitCategory.Other,
    ]);
  });
});
