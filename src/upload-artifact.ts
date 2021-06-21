import * as core from '@actions/core'
import * as path from 'path'
import {create, UploadOptions} from '@actions/artifact'
import {findFilesToUpload} from './search'
import {getInputs} from './input-helper'
import {NoFileOptions} from './constants'

async function uploadArtifact(inputs, searchResult): Promise<void> {
  if (searchResult.filesToUpload.length === 0) {
    // No files were found, different use cases warrant different types of behavior if nothing is found
    switch (inputs.ifNoFilesFound) {
      case NoFileOptions.warn: {
        core.warning(
          `No files were found with the provided path: ${inputs.searchPath}. No artifacts will be uploaded.`
        )
        break
      }
      case NoFileOptions.error: {
        core.setFailed(
          `No files were found with the provided path: ${inputs.searchPath}. No artifacts will be uploaded.`
        )
        break
      }
      case NoFileOptions.ignore: {
        core.info(
          `No files were found with the provided path: ${inputs.searchPath}. No artifacts will be uploaded.`
        )
        break
      }
    }
  } else {
    const s = searchResult.filesToUpload.length === 1 ? '' : 's'
    core.info(
      `With the provided path, there will be ${searchResult.filesToUpload.length} file${s} uploaded`
    )
    core.debug(`Root artifact directory is ${searchResult.rootDirectory}`)

    if (searchResult.filesToUpload.length > 10000) {
      core.warning(
        `There are over 10,000 files in this artifact, consider create an archive before upload to improve the upload performance.`
      )
    }

    const artifactClient = create()
    const options: UploadOptions = {
      continueOnError: false
    }
    if (inputs.retentionDays) {
      options.retentionDays = inputs.retentionDays
    }

    let artifactName = inputs.artifactName

    if (inputs.individualArtifacts) {
      if (searchResult.isDirectory) {
        core.info(
          `Using the root directory of the individual path as the artifact name.`
        )

        artifactName = path.parse(searchResult.rootDirectory).base
      } else {
        core.info(`Using the name of the individual file as the artifact name.`)

        artifactName = path.parse(searchResult.filesToUpload[0]).name
      }
    }

    const uploadResponse = await artifactClient.uploadArtifact(
      artifactName,
      searchResult.filesToUpload,
      searchResult.rootDirectory,
      options
    )

    if (uploadResponse.failedItems.length > 0) {
      core.setFailed(
        `An error was encountered when uploading ${artifactName}. There were ${uploadResponse.failedItems.length} items that failed to upload.`
      )
    } else {
      core.info(`Artifact ${artifactName} has been successfully uploaded!`)
    }
  }
}

async function run(): Promise<void> {
  try {
    const inputs = getInputs()

    if (inputs.individualArtifacts)
      for (let i = 0; i < inputs.searchPath.length; i++) {
        const searchResult = await findFilesToUpload(inputs.searchPath[i])
        await uploadArtifact(inputs, searchResult)
      }
    else {
      const searchResult = await findFilesToUpload(inputs.searchPath)
      await uploadArtifact(inputs, searchResult)
    }
  } catch (err) {
    core.setFailed(err.message)
  }
}

run()
