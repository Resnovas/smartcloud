import * as github from '@actions/github'
import * as core from '@actions/core'

class Global {
  protected client: any

  /**
   * Parse the settings from inputs
   * @param inputdata
   */
  async parseSettings (inputdata: inputdata): Promise<[]> {
    if (inputdata.token) {
      this.client = github.getOctokit(inputdata.token)
    } else {
      throw new Error('No token provided')
    }
    return new Promise(async resolve => {
      let settings
      try {
        if (
          inputdata.settings &&
          typeof inputdata.settings == 'string' &&
          inputdata.settings !== ''
        ) {
          /**
           * Checks to see if the settings data is valid and converts to json
           */
          settings = JSON.parse(inputdata.settings)
          resolve(settings)
        } else if (typeof inputdata.file == 'string' && inputdata.file !== '') {
          /**
           * Checks to see if the settings file is valid
           */
          settings = JSON.parse(
            await this.fetchContent({
              path: inputdata.file,
              owner: inputdata.owner,
              repo: inputdata.repo
            })
          )
          resolve(settings)
        }
      } catch (_) {
        throw new Error(_)
      }
    })
  }

  async fetchContent (context: repoContext): Promise<string> {
    const response: any = await this.client.repos.getContent({
      owner: context.owner || github.context.repo.owner,
      repo: context.repo || github.context.repo.repo,
      path: context.path
    })
    return Buffer.from(response.data.content, response.data.encoding).toString()
  }

  async useSettings (mode: string, settings: any): Promise<boolean> {
    if (mode == 'secret') {
      // output.secret()
    } else if (mode == 'output' || mode == 'environment') {
      for (const setting in settings) {
        if (setting == 'default') return false
        if (settings[setting].enabled === false) return false

        for (const ver in settings[setting].vars) {
          core.info(
            `Creating ${mode} setting: ${setting}_${ver} - ` +
              settings[setting].vars[ver]
          )
          if (mode == 'output')
            output.output(`${setting}_${ver}`, settings[setting].vars[ver])
          if (mode == 'environment')
            output.environment(`${setting}_${ver}`, settings[setting].vars[ver])
        }
      }
    } else {
      core.error(
        `Mode is unknown ('${mode}') - Valid options: output, secret, environment`
      )
    }
    return true
  }
}

// {
//   owner: 'Videndum',
//   repo: 'manage-github-secrets',
//   path: path
// }
class Outputs {
  /**
   * Outputs data as action output
   * @param name Name of the output
   * @param data Data to output
   */
  async output (name: string, data: string): Promise<boolean> {
    return new Promise(resolve => {
      core.setOutput(name, data)
      return true
    })
  }
  async environment (name: string, data: string): Promise<boolean> {
    return new Promise(resolve => {
      core.exportVariable(name, data)
      return true
    })
  }
  async secret (name: string, data: string): Promise<boolean> {
    return new Promise(resolve => {
      // core.exportVariable(name, data)
      return true
    })
  }
}

export const global = new Global()
export const output = new Outputs()

export default {
  global: global,
  output: output
}

type inputdata = {
  settings?: {} | string
  file?: string
  mode?: string
  token?: string
  owner?: string
  repo?: string
}

type repoContext = {
  owner?: string
  repo?: string
  path: string
}
