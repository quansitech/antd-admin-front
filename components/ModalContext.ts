import {createContext} from "react";

export type ModalContextProps = {
    inModal: boolean,
    closeModal: () => void,
    contexts?: Record<string, any>
    setAfterClose(callback: () => void): void
}

export const ModalContext = createContext<ModalContextProps>({
    inModal: false,
    closeModal: () => {
    },
    setAfterClose: (fn: Function) => {
    },
})