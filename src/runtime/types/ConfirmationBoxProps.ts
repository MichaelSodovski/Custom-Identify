import { AllWidgetProps } from "jimu-core";
import { ActionType } from '../Enums/actionType'

export type ConfirmationBoxProps = {
  actionType: ActionType;
} & AllWidgetProps<any>;