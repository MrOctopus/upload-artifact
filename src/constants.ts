export enum Inputs {
  Name = 'name',
  Individual = 'individual',
  Path = 'path',
  IfNoFilesFound = 'if-no-files-found',
  RetentionDays = 'retention-days'
}

export enum NoFileOptions {
  /**
   * Default. Output a warning but do not fail the action
   */
  warn = 'warn',

  /**
   * Fail the action with an error message
   */
  error = 'error',

  /**
   * Do not output any warnings or errors, the action does not fail
   */
  ignore = 'ignore'
}
