import styled from "styled-components";

export default styled.button`
  background-color: #F5F5F5;
  padding: 10px 20px;
  margin: 5px 8px;
  border-width: 0;
  border-radius: 4px;
  outline: 0;
  text-transform: capitalize;
  box-shadow: inset -1px 1px 1px 0 transparent;
  transition: background-color 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms,box-shadow 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms;

  &:hover {
    background-color: #E0E0E0;
  }

  &:active {
    background-color: #EEEEEE;
    box-shadow: inset -1px 1px 1px 0 #CACACA;
  }
`;
