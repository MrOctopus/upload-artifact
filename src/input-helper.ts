import * as core from '@actions/core'
import {Inputs, NoFileOptions} from './constants'
import {UploadInputs} from './upload-inputs'

/**
 * Helper to get all the inputs for the action
 */
export function getInputs(): UploadInputs {
  const name = core.getInput(Inputs.Name)
  const individual = JSON.parse(core.getInput(Inputs.Individual))
  const path = core.getInput(Inputs.Path, {required: true}).split(',')

  const ifNoFilesFound = core.getInput(Inputs.IfNoFilesFound)
  const noFileBehavior: NoFileOptions = NoFileOptions[ifNoFilesFound]

  if (!noFileBehavior) {
    core.setFailed(
      `Unrecognized ${
        Inputs.IfNoFilesFound
      } input. Provided: ${ifNoFilesFound}. Available options: ${Object.keys(
        NoFileOptions
      )}`
    )
  }

  const inputs = ({
    artifactName: name,
    individualArtifacts: individual,
    searchPath: path,
    ifNoFilesFound: noFileBehavior
  } as unknown) as UploadInputs

  const retentionDaysStr = core.getInput(Inputs.RetentionDays)
  if (retentionDaysStr) {
    inputs.retentionDays = parseInt(retentionDaysStr)
    if (isNaN(inputs.retentionDays)) {
      core.setFailed('Invalid retention-days')
    }
  }

  return inputs
}
