import { Account } from '../../models/account'
import { TypedBaseStore } from './base-store'

/**
 * A simple store for the dedicated Copilot account used exclusively for
 * AI-generated commit messages.
 *
 * This store is separate from AccountsStore and only manages a single account.
 * The account is stored with its full details (including token) in localStorage.
 */
export class CopilotAccountStore extends TypedBaseStore<Account | null> {
  private readonly STORAGE_KEY = 'copilot-account'
  private copilotAccount: Account | null = null

  /**
   * Initialize the store by loading from localStorage.
   */
  public constructor() {
    super()
    this.loadFromStorage()
  }

  /**
   * Get the stored Copilot account, or null if none is configured.
   */
  public async getCopilotAccount(): Promise<Account | null> {
    return this.copilotAccount
  }

  /**
   * Get the stored Copilot account synchronously.
   * Note: This returns the cached value, which may be stale if the account
   * was recently changed.
   */
  public getCopilotAccountSync(): Account | null {
    return this.copilotAccount
  }

  /**
   * Set the Copilot account. This should be called after validating the token.
   *
   * @param account - The validated Copilot account to store
   */
  public async setCopilotAccount(account: Account): Promise<void> {
    this.copilotAccount = account
    this.saveToStorage()
    this.emitUpdate(this.copilotAccount)
  }

  /**
   * Clear the stored Copilot account.
   */
  public async clearCopilotAccount(): Promise<void> {
    this.copilotAccount = null
    localStorage.removeItem(this.STORAGE_KEY)
    this.emitUpdate(null)
  }

  /**
   * Check if a valid Copilot account is configured.
   */
  public hasCopilotAccount(): boolean {
    return this.copilotAccount !== null
  }

  /**
   * Load the Copilot account from localStorage.
   */
  private loadFromStorage(): void {
    try {
      const raw = localStorage.getItem(this.STORAGE_KEY)
      if (!raw) {
        this.copilotAccount = null
        return
      }

      const parsed = JSON.parse(raw) as Account
      this.copilotAccount = new Account(
        parsed.login,
        parsed.endpoint,
        parsed.token,
        parsed.emails,
        parsed.avatarURL,
        parsed.id,
        parsed.name,
        parsed.plan,
        parsed.copilotEndpoint,
        parsed.isCopilotDesktopEnabled,
        parsed.features
      )
    } catch (e) {
      log.error('Failed to load Copilot account from storage', e)
      this.copilotAccount = null
    }
  }

  /**
   * Save the Copilot account to localStorage.
   */
  private saveToStorage(): void {
    if (this.copilotAccount === null) {
      localStorage.removeItem(this.STORAGE_KEY)
      return
    }

    // Store the account without token for the serialized data
    // Note: For simplicity and since this is a dedicated Copilot account,
    // we store the full account including token. In a production environment,
    // consider using a secure storage mechanism.
    const serialized = JSON.stringify({
      login: this.copilotAccount.login,
      endpoint: this.copilotAccount.endpoint,
      token: this.copilotAccount.token,
      emails: this.copilotAccount.emails,
      avatarURL: this.copilotAccount.avatarURL,
      id: this.copilotAccount.id,
      name: this.copilotAccount.name,
      plan: this.copilotAccount.plan,
      copilotEndpoint: this.copilotAccount.copilotEndpoint,
      isCopilotDesktopEnabled: this.copilotAccount.isCopilotDesktopEnabled,
      features: this.copilotAccount.features,
    })

    localStorage.setItem(this.STORAGE_KEY, serialized)
  }
}
