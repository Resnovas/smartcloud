import creatorMatches, { ConditionCreatorMatches } from './creatorMatches'
import descriptionMatches, {
  ConditionDescriptionMatches
} from './descriptionMatches'
import hasLabel, { ConditionHasLabel } from './hasLabel'
import isOpen, { ConditionIsOpen } from './isOpen'
import titleMatches, { ConditionTitleMatches } from './titleMatches'

export type Condition =
  | ConditionCreatorMatches
  | ConditionDescriptionMatches
  | ConditionIsOpen
  | ConditionTitleMatches
  | ConditionHasLabel

export const handlers = [
  creatorMatches,
  descriptionMatches,
  isOpen,
  hasLabel,
  titleMatches
]
