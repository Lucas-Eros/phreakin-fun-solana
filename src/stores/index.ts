export { useMysteryBoxStore, type MysteryBoxStore } from "./mysteryBoxStore";
export { useUIStore, type UIStore } from "./uiStore";
export { useTutorialStore, type TutorialStore } from "./tutorialStore";
export { useBoxFlowStore, type BoxFlowStore } from "./boxFlowStore";

export {
  selectMysteryBoxStep,
  selectMysteryBoxError,
  selectMysteryBoxProcessing,
  selectMysteryBoxRewards,
  selectMysteryBoxTransactionHash,
  selectMysteryBoxSelectedBox,
  selectMysteryBoxUsdcReceived,
} from "./mysteryBoxStore";

export {
  selectToasts,
  selectModals,
  selectMysteryBoxModal,
  selectReceiptModal,
  selectErrorModal,
  selectTutorialModal,
  selectIsLoading,
  selectSplashScreen,
} from "./uiStore";

export {
  selectTutorialState,
  selectCurrentTutorialStep,
  selectIsTutorialActive,
  selectHasCompletedTutorial,
  selectTutorialProgress,
} from "./tutorialStore";

export {
  selectBoxFlowState,
  selectCurrentBoxFlowStep,
  selectBoxFlowProgress,
  selectIsCustomFlow,
  selectFlowConfig,
} from "./boxFlowStore";

export type {
  PurchaseStep,
  BoxType,
  SelectedBox,
  MysteryBoxState,
  MysteryBoxActions,
} from "./mysteryBoxStore";

export type {
  ToastType,
  ToastState,
  ModalState,
  UIState,
  UIActions,
} from "./uiStore";

export type {
  TutorialStep,
  TutorialState,
  TutorialActions,
} from "./tutorialStore";

export type {
  BoxFlowStep,
  BoxFlowConfig,
  BoxFlowState,
  BoxFlowActions,
} from "./boxFlowStore";
