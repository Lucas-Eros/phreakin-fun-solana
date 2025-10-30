import React from "react";
import { BoxFlowStep } from "@/types/boxFlows";
import InitialStep from "./modalSteps/InitialStep";
import ProcessingStep from "./modalSteps/ProcessingStep";
import FinishedStep from "./modalSteps/FinishedStep";
import ErrorStep from "./modalSteps/ErrorStep";
import dynamic from "next/dynamic";

interface StepRendererProps {
  step: BoxFlowStep;
  title: string;
  image: string;
  onClose: () => void;
  description: string;
  CLIP_PATH: string;
  customProps?: Record<string, any>;
  onRetry?: () => void;
}

const StepRenderer: React.FC<StepRendererProps> = ({
  step,
  title,
  image,
  onClose,
  description,
  CLIP_PATH,
  customProps = {},
  onRetry,
}) => {
  switch (step) {
    case "initial":
      return (
        <InitialStep
          title={title}
          image={image}
          onClose={onClose}
          description={description}
          CLIP_PATH={CLIP_PATH}
        />
      );

    case "processing":
      return <ProcessingStep onClose={onClose} CLIP_PATH={CLIP_PATH} />;

    case "finished":
      return <FinishedStep onClose={onClose} CLIP_PATH={CLIP_PATH} />;

    case "error":
      return (
        <ErrorStep onClose={onClose} CLIP_PATH={CLIP_PATH} onRetry={onRetry} />
      );

    default:
      return (
        <InitialStep
          title={title}
          image={image}
          onClose={onClose}
          description={description}
          CLIP_PATH={CLIP_PATH}
        />
      );
  }
};

export default StepRenderer;
