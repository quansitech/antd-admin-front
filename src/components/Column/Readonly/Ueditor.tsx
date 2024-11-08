import {ColumnReadonlyProps} from "./types";
import React, {useEffect, useState} from "react";

export default function (props: ColumnReadonlyProps) {

    const [value, setValue] = useState(props.entity.value);

    useEffect(() => {
        const div = document.createElement('div');
        div.innerHTML = props.entity.value;
        setValue(div.innerText);
    }, []);


    return <>
        <div className={'article-content'} dangerouslySetInnerHTML={{__html: value}}/>
    </>
}