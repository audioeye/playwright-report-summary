/**
 * Unit tests for src/github.ts
 */

import { expect } from '@jest/globals'

import * as github from '@actions/github'
import { createPullRequestReview, getIssueComments, updateIssueComment } from '../src/github'

// jest.mock('@actions/github', () => ({
// 	getOctokit: jest.fn().mockReturnValue({
// 		rest: {
// 			issues: {
// 				listComments: jest.fn(),
// 				updateComment: jest.fn(),
// 				createComment: jest.fn()
// 			},
// 			pulls: {
// 				createReview: jest.fn()
// 			}
// 		}
// 	})
// }))

describe('github', () => {
  let octokit: any;

  beforeEach(() => {
		octokit = {
			rest: {
				issues: {
					listComments: jest.fn(() => Promise.resolve({ data: [ { id: 1 }, { id: 2 }] })),
					updateComment: jest.fn((data: any) => Promise.resolve({ data: { ...data, id: data.comment_id } })),
					createComment: jest.fn((data: any) => Promise.resolve({ data: { ...data, id: 4 } })),
				},
				pulls: {
					createReview: jest.fn((data: object) => Promise.resolve({ data: { ...data, id: 5 } })),
				}
			}
		};
		jest.clearAllMocks();
  });

	describe('getIssueComments', () => {
		it('calls issues.listComments with correct parameters', async () => {
			const params = { owner: 'owner', repo: 'repo', issue_number: 123 };
			const expectedArguments = { ...params };

			await getIssueComments(octokit, params);

			expect(octokit.rest.issues.listComments).toHaveBeenCalledWith(expectedArguments);
		});

		it('returns the comment data', async () => {
			const params = { owner: 'owner', repo: 'repo', issue_number: 123 };
			const expectedResult = [ { id: 1 }, { id: 2 } ];

			const result = await getIssueComments(octokit, params);

			expect(result).toMatchObject(expectedResult);
		});

		it('throws an error if listComments fails', async () => {
			octokit.rest.issues.listComments.mockRejectedValue(new Error('API error'));
			const params = { owner: 'owner', repo: 'repo', issue_number: 123 };

			await expect(getIssueComments(octokit, params)).rejects.toThrow('API error');
		});
	});

	describe('updateIssueComment', () => {
		it('calls issues.updateComment with correct parameters', async () => {
			const params = { owner: 'owner', repo: 'repo', comment_id: 123, body: 'body' };
			const expectedArguments = { ...params };

			await updateIssueComment(octokit, params);

			expect(octokit.rest.issues.updateComment).toHaveBeenCalledWith(expectedArguments);
		});

		it('returns the comment data', async () => {
			const params = { owner: 'owner', repo: 'repo', comment_id: 123, body: 'body' };
			const expectedResult =  { ...params, id: expect.any(Number) };

			const result = await updateIssueComment(octokit, params);

			expect(result).toMatchObject(expectedResult);
		});

		it('throws an error if updateComment fails', async () => {
			octokit.rest.issues.updateComment.mockRejectedValue(new Error('API error'));
			const params = { owner: 'owner', repo: 'repo', comment_id: 123, body: 'body' };

			await expect(updateIssueComment(octokit, params)).rejects.toThrow('API error');
		});
	});

	describe('createPullRequestReview', () => {
		it('calls pulls.createReview with correct parameters', async () => {
			const params = { owner: 'owner', repo: 'repo', pull_number: 123, body: 'body' };
			const expectedArguments = { ...params, event: 'COMMENT' };

			await createPullRequestReview(octokit, params);

			expect(octokit.rest.pulls.createReview).toHaveBeenCalledWith(expectedArguments);
		});

		it('returns the review data', async () => {
			const params = { owner: 'owner', repo: 'repo', pull_number: 123, body: 'body' };
			const expectedResult = { ...params, id: expect.any(Number) };

			const result = await createPullRequestReview(octokit, params);

			expect(result).toMatchObject(expectedResult);
		});

		it('throws an error if createReview fails', async () => {
			octokit.rest.pulls.createReview.mockRejectedValue(new Error('API error'));
			const params = { owner: 'owner', repo: 'repo', pull_number: 123, body: 'body' };

			await expect(createPullRequestReview(octokit, params)).rejects.toThrow('API error');
		});
	});
});
