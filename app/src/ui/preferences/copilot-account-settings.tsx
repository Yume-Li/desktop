import * as React from 'react'
import { Account } from '../../models/account'
import { IAvatarUser } from '../../models/avatar'
import { lookupPreferredEmail } from '../../lib/email'
import { Button } from '../lib/button'
import { Row } from '../lib/row'
import { Avatar } from '../lib/avatar'
import { Loading } from '../lib/loading'

interface ICopilotAccountSettingsProps {
  readonly copilotAccount: Account | null
  readonly isLoading: boolean
  readonly onSetCopilotAccount: (token: string) => Promise<void>
  readonly onClearCopilotAccount: () => Promise<void>
}

interface ICopilotAccountSettingsState {
  readonly token: string
  readonly error: string | null
}

/**
 * Component for managing the dedicated Copilot account used exclusively
 * for AI-generated commit messages.
 */
export class CopilotAccountSettings extends React.Component<
  ICopilotAccountSettingsProps,
  ICopilotAccountSettingsState
> {
  public constructor(props: ICopilotAccountSettingsProps) {
    super(props)
    this.state = {
      token: '',
      error: null,
    }
  }

  private onTokenChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ token: e.target.value, error: null })
  }

  private onValidateAndSave = async () => {
    const { token } = this.state

    if (!token.trim()) {
      this.setState({ error: 'Please enter a valid token' })
      return
    }

    try {
      await this.props.onSetCopilotAccount(token.trim())
      this.setState({ token: '', error: null })
    } catch (e) {
      this.setState({
        error:
          e instanceof Error
            ? e.message
            : 'Failed to validate token. Please check and try again.',
      })
    }
  }

  private onClear = async () => {
    await this.props.onClearCopilotAccount()
    this.setState({ token: '', error: null })
  }

  private onKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      this.onValidateAndSave()
    }
  }

  private renderCopilotAccount() {
    const { copilotAccount } = this.props

    if (!copilotAccount) {
      return null
    }

    const avatarUser: IAvatarUser = {
      name: copilotAccount.name,
      email: lookupPreferredEmail(copilotAccount),
      avatarURL: copilotAccount.avatarURL,
      endpoint: copilotAccount.endpoint,
    }

    return (
      <Row className="account-info copilot-account">
        <div className="user-info-container">
          <Avatar accounts={[copilotAccount]} user={avatarUser} />
          <div className="user-info">
            <div className="name">{copilotAccount.name}</div>
            <div className="login">@{copilotAccount.login}</div>
            <div className="copilot-badge">Copilot Account</div>
          </div>
        </div>
        <Button onClick={this.onClear}>Remove</Button>
      </Row>
    )
  }

  private renderTokenInput() {
    const { token, error } = this.state
    const { isLoading } = this.props

    return (
      <div className="copilot-token-input">
        <p className="copilot-description">
          Enter a GitHub Personal Access Token with Copilot access to enable
          AI-generated commit messages. This account will only be used for
          generating commit messages and won't affect push/pull operations.
        </p>

        <div className="token-input-row">
          <input
            type="password"
            className="token-input"
            placeholder="ghp_..."
            value={token}
            onChange={this.onTokenChange}
            onKeyPress={this.onKeyPress}
            disabled={isLoading}
            autoFocus={true}
          />
          <Button
            onClick={this.onValidateAndSave}
            disabled={isLoading || !token.trim()}
          >
            {isLoading ? <Loading /> : 'Add Copilot Account'}
          </Button>
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="token-help">
          <a
            href="https://github.com/settings/tokens"
            target="_blank"
            rel="noopener noreferrer"
          >
            Create a new token
          </a>{' '}
          with Copilot access (no special scopes required)
        </div>
      </div>
    )
  }

  public render() {
    const { copilotAccount, isLoading } = this.props

    return (
      <div className="copilot-account-settings">
        <h2>Copilot Commit Message Generation</h2>

        {copilotAccount
          ? this.renderCopilotAccount()
          : this.renderTokenInput()}

        {!isLoading && !copilotAccount && (
          <div className="copilot-info">
            <p>
              When enabled, GitHub Copilot will analyze your changes and
              generate a commit message for you to review and edit.
            </p>
          </div>
        )}
      </div>
    )
  }
}
