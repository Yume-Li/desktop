import { Repository } from '../models/repository'
import { Account } from '../models/account'
import { getAccountForEndpoint } from './api'
import { enableCommitMessageGeneration } from './feature-flag'

/** Get the authenticated account for the repository. */
export function getAccountForRepository(
  accounts: ReadonlyArray<Account>,
  repository: Repository
): Account | null {
  const gitHubRepository = repository.gitHubRepository
  if (!gitHubRepository) {
    return null
  }

  return getAccountForEndpoint(accounts, gitHubRepository.endpoint)
}

/**
 * Get the authenticated account to use for commit message generation.
 * This function checks for a dedicated Copilot account first, then falls
 * back to the repository-associated account.
 *
 * @param accounts - The list of logged-in accounts
 * @param repository - The repository being committed to
 * @param copilotAccount - Optional dedicated Copilot account (if configured)
 * @returns The account to use for commit message generation, or undefined if none available
 */
export function getAccountForCommitMessageGeneration(
  accounts: ReadonlyArray<Account>,
  repository: Repository,
  copilotAccount?: Account | null
): Account | undefined {
  // Priority 1: Use the dedicated Copilot account if configured
  if (copilotAccount !== undefined && copilotAccount !== null) {
    return copilotAccount
  }

  // Priority 2: Prefer the account that is associated to this repository.
  const repositoryAccount = getAccountForRepository(accounts, repository)
  if (
    repositoryAccount !== null &&
    enableCommitMessageGeneration(repositoryAccount)
  ) {
    return repositoryAccount
  }

  // Priority 3: Use any account that has Copilot enabled
  return accounts.find(enableCommitMessageGeneration)
}
