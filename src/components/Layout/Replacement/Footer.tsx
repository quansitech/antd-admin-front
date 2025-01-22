import {PropsWithChildren, useContext, useEffect} from 'react'
import {LayoutContext} from "../../LayoutContext";

export default function ({children}: PropsWithChildren) {
    const layoutContext = useContext(LayoutContext)

    useEffect(() => {
        const footer = layoutContext.props.footer
        layoutContext.assignProps({
            footer: children
        })
        return () => {
            layoutContext.assignProps({
                footer
            })
        }
    }, [])

    return null
}