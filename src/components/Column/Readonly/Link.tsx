import React from 'react';
import {ColumnReadonlyProps} from "./types";
import {replaceUrl} from "../../../lib/helpers";

export default function (props: ColumnReadonlyProps) {
    const url = replaceUrl(props.fieldProps.url || props.fieldProps.href || '', props.record)
    return <a href={url}>{props.text}</a>
}