import {PropsWithChildren, useContext, useEffect} from 'react'
import {LayoutContext} from "../../LayoutContext";

export default function ({children}: PropsWithChildren) {
    const layoutContext = useContext(LayoutContext)

    useEffect(() => {
        const headerActions = layoutContext.props.headerActions
        layoutContext.assignProps({
            headerActions: children
        })
        return () => {
            layoutContext.assignProps({
                headerActions
            })
        }
    }, [])

    return null
}