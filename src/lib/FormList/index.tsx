import React from 'react';

export const ItemContext = React.createContext<{
    index?: number,
}>({})

export function itemRender(doms, listMeta){
    
    return <>
        <ItemContext.Provider value={{index: listMeta.index}}>
            <div className="qs-form-list-item">
                <div className='dom'>{doms.listDom}</div>
                <div className='action'>{doms.action}</div>
            </div>
        </ItemContext.Provider>
    </>
}