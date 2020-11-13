import * as core from '@actions/core'
import * as github from '@actions/github'
import { Octokit } from '@octokit/core'
import * as sodium from 'tweetsodium'

export class Global {
  protected client: any
  protected secrets: secrets
  protected filedata: any
  private inputdata: inputdata
  protected encryptionkey: key = { data: { key: '', key_id: '' } }
  constructor(inputdata: inputdata) {
    this.inputdata = inputdata
    this.client = github.getOctokit(inputdata.token)
    this.secrets = new secrets(inputdata)
    this.getkey()
  }

  async getkey() {
    if (this.inputdata.secrets) {
      if (this.inputdata.secretorg) {
        this.encryptionkey = await this.secrets.org.key()
      } else {
        this.encryptionkey = await this.secrets.repo.key()
      }
    }
  }

  /**
   * Parse the settings from inputs
   */
  async parseSettings() {
    if (!this.inputdata.token) throw new Error('No token provided')
    this.client = github.getOctokit(this.inputdata.token)
    let settings
    if (this.inputdata.settings && typeof this.inputdata.settings == 'string') {
      /**
       * Checks to see if the settings data is valid and converts to json
       */
      settings = await JSON.parse(this.inputdata.settings)
      if (settings['manage-github-secrets'])
        settings = settings['manage-github-secrets']
      return settings
    } else if (
      typeof this.inputdata.file == 'string' &&
      this.inputdata.file !== ''
    ) {
      /**
       * Checks to see if the settings file is valid
       */
      this.filedata = await this.client.repos.getContent({
        owner: this.inputdata.owner || github.context.repo.owner,
        repo: this.inputdata.repo || github.context.repo.repo,
        path: this.inputdata.file
      })
      settings = await JSON.parse(
        Buffer.from(
          this.filedata.data.content,
          this.filedata.data.encoding
        ).toString()
      )
      if (settings['manage-github-secrets'])
        settings = settings['manage-github-secrets']
      return settings
    } else {
      core.error('No settings defined')
    }
  }

  async useSettings(mode: string, settings: any) {
    if (mode == 'secret') {
      for (const setting in settings) {
        if (settings[setting].enabled === false) return
        if (settings[setting].secret === false) return
        this.updateSecret({
          name: setting,
          data: JSON.stringify(settings[setting].settings)
        })
      }
      this.updateSecret({
        data: JSON.stringify(settings),
        name: this.inputdata.secretname
      })
    } else if (mode == 'output' || mode == 'environment') {
      for (const setting in settings) {
        if (settings[setting].enabled === false) return
        for (const ver in settings[setting].settings) {
          core.info(
            `Creating ${mode} setting: ${setting}_${ver} - ` +
              settings[setting].settings[ver]
          )
          if (mode == 'output')
            core.setOutput(`${setting}_${ver}`, settings[setting].settings[ver])
          if (mode == 'environment')
            core.exportVariable(
              `${setting}_${ver}`,
              settings[setting].settings[ver]
            )
        }
      }
    } else {
      core.error(
        `Mode is unknown ('${mode}') - Valid options: output, secret, environment`
      )
    }
  }

  async updateSecret(secret: secret) {
    let encrypted = await this.secrets.encrypt(
      this.encryptionkey.data.key,
      secret.data
    )
    if (this.inputdata.secretorg) {
      this.secrets.org.update({
        encryptedSecret: encrypted,
        secretname: secret.name,
        key_id: this.encryptionkey.data.key
      })
    } else {
      this.secrets.repo.update({
        encryptedSecret: encrypted,
        secretname: secret.name,
        key_id: this.encryptionkey.data.key
      })
    }
  }
}

class secrets {
  protected api: Octokit
  private inputdata: inputdata
  constructor(inputdata: inputdata) {
    this.inputdata = inputdata
    this.api = new Octokit({ auth: inputdata.token })
  }

  repo = {
    get: async () => {
      const secretsettings = await this.api
        .request('GET /repos/{owner}/{repo}/actions/secrets/{secret}', {
          owner: this.inputdata.owner || github.context.repo.owner,
          repo: this.inputdata.repo || github.context.repo.repo,
          secret: this.inputdata.secretname || 'SETTINGS'
        })
        .catch(err => {
          core.debug(err)
        })
      if (secretsettings) {
        core.info(secretsettings.data.name + secretsettings.data.created_at)
      }
      return secretsettings
    },
    key: async (): Promise<key> => {
      const response = await this.api
        .request('GET /repos/{owner}/{repo}/actions/secrets/public-key', {
          owner: this.inputdata.owner || github.context.repo.owner,
          repo: this.inputdata.repo || github.context.repo.repo
        })
        .catch(err => {
          core.debug(err)
        })
      let key: key = { data: { key: '', key_id: '' } }
      if (response) {
        core.debug(
          `Key retrieved: id=${response.data.key_id} key=${response.data.key}`
        )
        key.data = { key: response.data.key, key_id: response.data.key_id }
      }
      return key
    },
    update: async (update: update) => {
      const secret = await this.api
        .request('PUT /repos/{owner}/{repo}/actions/secrets/{secret_name}', {
          owner: this.inputdata.owner || github.context.repo.owner,
          repo: this.inputdata.repo || github.context.repo.repo,
          secret: update.secretname || this.inputdata.secretname,
          key_id: update.key_id,
          encrypted_value: update.encryptedSecret,
          visibility: update.visibility || 'all'
        })
        .catch(err => {
          core.debug(err)
        })
    }
  }

  async encrypt(key: string, settings: string) {
    const messageBytes = Buffer.from(settings)
    const keyBytes = Buffer.from(key, 'base64')
    const encryptedBytes = sodium.seal(messageBytes, keyBytes)
    const encrypted = Buffer.from(encryptedBytes).toString('base64')
    core.info('Secret encrypted: ' + encrypted)
    return encrypted
  }

  org = {
    get: async () => {
      const secretsettings = await this.api
        .request('GET /orgs/{org}/actions/secrets/{secret}', {
          org: this.inputdata.owner || github.context.repo.owner,
          secret: this.inputdata.secretname || 'SETTINGS'
        })
        .catch(err => {
          core.debug(err)
        })
      if (secretsettings) {
        core.info(
          `secrets retrieved: name=${secretsettings.data.name} createdat=${secretsettings.data.created_at}`
        )
      }
      return secretsettings
    },
    key: async (): Promise<key> => {
      const response = await this.api
        .request('GET /orgs/{org}/actions/secrets/public-key', {
          org: this.inputdata.owner || github.context.repo.owner
        })
        .catch(err => {
          core.debug(err)
        })
      let key: key = { data: { key: '', key_id: '' } }
      if (response) {
        core.debug(
          `Key retrieved: id=${response.data.key_id} key=${response.data.key}`
        )
        key.data = { key: response.data.key, key_id: response.data.key_id }
      }
      return key
    },
    update: async (update: update) => {
      const secret = await this.api
        .request('PUT /orgs/{org}/actions/secrets/{secret}', {
          org: this.inputdata.owner || github.context.repo.owner,
          secret: update.secretname || this.inputdata.secretname,
          key_id: update.key_id,
          encrypted_value: update.encryptedSecret,
          visibility: update.visibility || 'all'
        })
        .catch(err => {
          core.debug(err)
        })
    }
  }
}

export interface inputdata {
  mode: string
  token: string
  file?: string
  settings?: {} | string
  secrets: boolean
  secretname: string
  secretorg: boolean
  owner?: string
  repo?: string
}

interface secret {
  name: string
  data: string
}
interface key {
  data: {
    key_id: string
    key: string
  }
}
interface update {
  encryptedSecret: string
  secretname: string
  key_id: string
  visibility?: string
}
