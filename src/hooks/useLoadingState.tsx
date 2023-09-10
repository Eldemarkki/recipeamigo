import { useState } from "react";

export const useLoadingState = () => {
  const [isLoading, setIsLoading] = useState(false);

  return {
    isLoading,
    setIsLoading,
    startLoading: () => {
      setIsLoading(true);
    },
    stopLoading: () => {
      setIsLoading(false);
    },
  };
};
