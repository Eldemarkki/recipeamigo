import { TrashIcon } from "@radix-ui/react-icons";
import styled from "styled-components";

const DeleteButtonComponent = styled.button({
  backgroundColor: "transparent",
  display: "flex",
  justifyContent: "center",
  aspectRatio: "1",
  borderRadius: "15%",
  alignItems: "center",
  border: "none",
  margin: 0,
  "&:hover, &:focus": {
    cursor: "pointer",
    backgroundColor: "#ea2727",
    color: "white",
  },
});

export const DeleteButton = (props: React.ComponentProps<typeof DeleteButtonComponent>) => {
  return <DeleteButtonComponent {...props}>
    <TrashIcon />
  </DeleteButtonComponent>;
};
