import { DragHandleDots2Icon } from "@radix-ui/react-icons";
import styled from "styled-components";

export const DragHandle = styled(DragHandleDots2Icon)({
  "&:hover, &:focus": {
    cursor: "grab",
  },
});
