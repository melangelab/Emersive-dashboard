/**
 *
 */
export class Study {
  /**
   *
   */
  id?: string

  /**
   * The name of the study.
   */
  name?: string

  /**
   * Schedule
   */
  schedule: Array<JSON>

  /**
   * Settings
   */
  settings: Array<JSON>

  /**
   * Activity spec
   */
  spec: string

  /**
   * Study id
   */
  study_id: string

  /**
   * Study name
   */
  study_name: string

  /**
   * Group Array
   */
  gname: Array<string>
  /**
   * Participating Researchers Array
   */
  sub_researchers?: {
    /**
     * The unique identifier for the researcher.
     */
    ResearcherID: string
    /**
     * The level of access that the researcher has within the study.
     * Example values: 1 (view), 2 (edit), 4 (full access).
     */
    access_scope: number
  }[]
}
